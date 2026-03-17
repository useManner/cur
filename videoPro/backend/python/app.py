from flask import Flask, request, jsonify
import cv2
import numpy as np
import os
import tempfile
import shutil
import time
import threading
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB限制

# 临时目录
TEMP_DIR = tempfile.mkdtemp()

# 处理图片相似度检测
def detect_image_similarity(img_path1, img_path2, threshold=0.8):
    try:
        # 加载图片为彩色和灰度图
        img1_color = cv2.imread(img_path1)
        img2_color = cv2.imread(img_path2)
        
        # 检查图像是否成功加载
        if img1_color is None or img2_color is None:
            print(f"无法加载图像: {img_path1 if img1_color is None else img_path2}")
            return 0
        
        # 确保两张图片大小相同以进行对比
        h, w = 300, 400  # 固定大小，方便比较
        img1_color = cv2.resize(img1_color, (w, h))
        img2_color = cv2.resize(img2_color, (w, h))
        img1_gray = cv2.cvtColor(img1_color, cv2.COLOR_BGR2GRAY)
        img2_gray = cv2.cvtColor(img2_color, cv2.COLOR_BGR2GRAY)
        
        # 1. 计算色彩相似度（增强对亮度变化的容忍度）
        # 计算平均颜色和标准差
        avg_color1 = np.mean(img1_color, axis=(0, 1))
        avg_color2 = np.mean(img2_color, axis=(0, 1))
        
        # 计算颜色差异（归一化到0-1）
        color_diff = np.linalg.norm(avg_color1 - avg_color2) / (np.sqrt(255**2 * 3))
        # 使用平方倒数映射，增强对小差异的容忍度
        color_similarity = 1 / (1 + color_diff**2 * 5)
        
        # 2. 计算结构相似性 - 增强版本（对亮度变化更鲁棒）
        # 对灰度图应用高斯模糊减少噪声影响
        img1_blur = cv2.GaussianBlur(img1_gray, (5, 5), 0)
        img2_blur = cv2.GaussianBlur(img2_gray, (5, 5), 0)
        
        # 使用归一化的像素差异（对亮度变化更鲁棒）
        # 先归一化到0-1范围
        img1_norm = cv2.normalize(img1_blur, None, 0, 1.0, cv2.NORM_MINMAX, dtype=cv2.CV_32F)
        img2_norm = cv2.normalize(img2_blur, None, 0, 1.0, cv2.NORM_MINMAX, dtype=cv2.CV_32F)
        
        # 计算归一化后的像素差异
        pixel_diff = np.mean(np.abs(img1_norm - img2_norm))
        # 使用非线性映射增强小差异的容忍度
        structure_similarity = 1 / (1 + pixel_diff**2 * 8)
        
        # 3. 增强的直方图相似度（使用多尺度直方图）
        hist_scores = []
        # 使用不同的直方图大小进行比较
        for hist_size in [32, 64]:  # 使用多尺度直方图
            hist_scores_for_size = []
            for i in range(3):  # BGR三个通道
                hist1 = cv2.calcHist([img1_color], [i], None, [hist_size], [0, 256])
                hist2 = cv2.calcHist([img2_color], [i], None, [hist_size], [0, 256])
                # 归一化直方图
                hist1 = cv2.normalize(hist1, hist1).flatten()
                hist2 = cv2.normalize(hist2, hist2).flatten()
                # 使用相关系数计算相似度
                hist_score = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
                hist_scores_for_size.append(hist_score)
            # 平均三个通道的直方图相似度
            hist_scores.append(np.mean(hist_scores_for_size))
        # 平均不同尺度的直方图相似度
        hist_similarity = np.mean(hist_scores)
        
        # 4. 增强的边缘相似度（使用自适应阈值和Canny边缘）
        # 使用自适应阈值增强对光照变化的鲁棒性
        thresh1 = cv2.adaptiveThreshold(img1_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        thresh2 = cv2.adaptiveThreshold(img2_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # 结合Canny边缘检测
        edges1 = cv2.Canny(img1_gray, 50, 150)
        edges2 = cv2.Canny(img2_gray, 50, 150)
        
        # 综合边缘信息
        edge_similarity = (np.mean(thresh1 == thresh2) + np.mean(edges1 == edges2)) / 510.0
        
        # 5. 增加空间布局相似度（检测主要区域的相似性）
        # 将图像分成4个区域，计算每个区域的相似度
        regions = 2  # 2x2网格
        region_h, region_w = h // regions, w // regions
        region_similarities = []
        
        for i in range(regions):
            for j in range(regions):
                # 提取区域
                region1 = img1_color[i*region_h:(i+1)*region_h, j*region_w:(j+1)*region_w]
                region2 = img2_color[i*region_h:(i+1)*region_h, j*region_w:(j+1)*region_w]
                
                # 计算区域颜色相似度
                region_color_diff = np.linalg.norm(np.mean(region1, axis=(0,1)) - np.mean(region2, axis=(0,1))) / (np.sqrt(255**2 * 3))
                region_similarity = 1 - region_color_diff
                region_similarities.append(region_similarity)
        
        spatial_similarity = np.mean(region_similarities)
        
        # 特殊情况处理：相同图像应该返回1.0
        if img_path1 == img_path2 or (cv2.norm(img1_color - img2_color) == 0):
            return 1.0
        
        # 调整权重，增强对亮度和缩放变化的容忍度
        weights = {
            'color': 0.35,        # 颜色相似度
            'structure': 0.25,    # 结构相似度（增加权重）
            'histogram': 0.20,    # 直方图相似度
            'edge': 0.10,         # 边缘相似度
            'spatial': 0.10       # 空间布局相似度（新增）
        }
        
        # 综合相似度计算
        similarity = (
            color_similarity * weights['color'] +
            structure_similarity * weights['structure'] +
            hist_similarity * weights['histogram'] +
            edge_similarity * weights['edge'] +
            spatial_similarity * weights['spatial']
        )
        
        # 最后应用非线性调整，增强对相似图像的评分
        if similarity > 0.6:
            similarity = similarity + (1 - similarity) * 0.3
        
        # 确保相似度在0-1范围内
        similarity = max(0, min(1, similarity))
        
        return similarity
    except Exception as e:
        print(f"图片相似度计算错误: {e}")
        return 0

# 从视频中提取关键帧
def extract_key_frames(video_path, sample_rate=10):
    frames = []
    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # 计算采样间隔
        frame_interval = max(1, int(fps / sample_rate))
        
        current_frame = 0
        while current_frame < total_frames:
            cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame)
            ret, frame = cap.read()
            if not ret:
                break
            
            # 转为灰度并调整大小以加快处理
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            resized_frame = cv2.resize(gray_frame, (256, 256))
            frames.append(resized_frame)
            
            current_frame += frame_interval
        
        cap.release()
    except Exception as e:
        print(f"视频帧提取错误: {e}")
    
    return frames

# 计算两个视频的相似度
def detect_video_similarity(video_path1, video_path2, sample_rate=10, threshold=0.8):
    try:
        # 提取关键帧，减少帧数以提高性能
        frames1 = extract_key_frames(video_path1, sample_rate)
        frames2 = extract_key_frames(video_path2, sample_rate)
        
        if len(frames1) == 0 or len(frames2) == 0:
            return 0
        
        # 临时目录用于保存帧进行相似度比较
        temp_frames_dir = os.path.join(TEMP_DIR, f"temp_frames_{int(time.time())}")
        os.makedirs(temp_frames_dir, exist_ok=True)
        
        temp_frames = []
        similarities = []
        
        try:
            # 比较帧对之间的相似度
            for i, frame1 in enumerate(frames1):
                # 保存第一个帧为临时文件
                temp_frame1_path = os.path.join(temp_frames_dir, f"temp_frame1_{i}.jpg")
                cv2.imwrite(temp_frame1_path, frame1)
                temp_frames.append(temp_frame1_path)
                
                for j, frame2 in enumerate(frames2):
                    # 保存第二个帧为临时文件
                    temp_frame2_path = os.path.join(temp_frames_dir, f"temp_frame2_{i}_{j}.jpg")
                    cv2.imwrite(temp_frame2_path, frame2)
                    temp_frames.append(temp_frame2_path)
                    
                    # 使用优化的图片相似度检测函数
                    similarity = detect_image_similarity(temp_frame1_path, temp_frame2_path)
                    similarities.append(similarity)
                    
                    # 如果找到非常相似的帧，可以提前返回
                    if similarity > 0.9:
                        return similarity
        finally:
            # 清理临时文件
            for temp_file in temp_frames:
                if os.path.exists(temp_file):
                    try:
                        os.remove(temp_file)
                    except:
                        pass
        
        if similarities:
            # 使用更鲁棒的相似度评分算法
            max_similarity = max(similarities)
            median_similarity = np.median(similarities)
            avg_similarity = np.mean(similarities)
            
            # 调整权重，更注重最大相似度以捕获最相似的帧对
            final_similarity = (max_similarity * 0.6 + median_similarity * 0.3 + avg_similarity * 0.1)
            
            return final_similarity
        
        return 0
    except Exception as e:
        print(f"视频相似度计算错误: {e}")
        return 0

# 判断文件类型并调用相应的检测函数
def detect_similarity(file1_path, file1_type, file2_path, file2_type, sample_rate=10, threshold=0.8):
    # 两个都是图片
    if file1_type.startswith('image/') and file2_type.startswith('image/'):
        return detect_image_similarity(file1_path, file2_path, threshold)
    # 两个都是视频
    elif file1_type.startswith('video/') and file2_type.startswith('video/'):
        return detect_video_similarity(file1_path, file2_path, sample_rate, threshold)
    # 图片和视频对比（取视频多个关键帧与图片对比，选择最相似的）
    elif file1_type.startswith('image/') and file2_type.startswith('video/'):
        frames = extract_key_frames(file2_path, sample_rate)
        if not frames:
            return 0
        
        max_similarity = 0
        temp_frames_dir = os.path.join(TEMP_DIR, f"temp_frames_{int(time.time())}")
        os.makedirs(temp_frames_dir, exist_ok=True)
        
        temp_files = []
        
        try:
            # 对多个关键帧进行比较，找到最相似的帧
            for i, frame in enumerate(frames[:5]):  # 比较前5个关键帧，平衡性能和准确性
                # 保存帧为临时文件
                temp_frame_path = os.path.join(temp_frames_dir, f"temp_frame_{len(temp_files)}.jpg")
                cv2.imwrite(temp_frame_path, frame)
                temp_files.append(temp_frame_path)
                
                # 使用优化的图片相似度检测函数
                frame_similarity = detect_image_similarity(file1_path, temp_frame_path)
                max_similarity = max(max_similarity, frame_similarity)
                
                # 调整提前返回的阈值，提高检测效率
                if frame_similarity > 0.85:
                    return frame_similarity
        finally:
            # 清理临时文件
            for temp_file in temp_files:
                if os.path.exists(temp_file):
                    try:
                        os.remove(temp_file)
                    except:
                        pass
            # 清理临时目录
            if os.path.exists(temp_frames_dir):
                shutil.rmtree(temp_frames_dir)
        
        return max_similarity
    elif file1_type.startswith('video/') and file2_type.startswith('image/'):
        # 交换参数，复用上述逻辑
        return detect_similarity(file2_path, file2_type, file1_path, file1_type, sample_rate, threshold)
    
    return 0

# 主检测接口
@app.route('/detect', methods=['POST'])
def detect():
    try:
        files = request.files.getlist('files')
        threshold = float(request.form.get('similarityThreshold', 0.8))
        sample_rate = int(request.form.get('frameSampleRate', 10))
        
        if len(files) < 2:
            return jsonify({"error": "至少需要两个文件进行比较"}), 400
        
        # 保存上传的文件
        saved_files = []
        for i, file in enumerate(files):
            file_ext = os.path.splitext(file.filename)[1]
            temp_path = os.path.join(TEMP_DIR, f"file_{i}{file_ext}")
            file.save(temp_path)
            saved_files.append({
                'path': temp_path,
                'name': file.filename,
                'type': file.content_type
            })
        
        # 计算文件两两之间的相似度
        results = []
        groups = {}
        group_id = 1
        
        for i in range(len(saved_files)):
            for j in range(i + 1, len(saved_files)):
                file1 = saved_files[i]
                file2 = saved_files[j]
                
                similarity = detect_similarity(
                    file1['path'], file1['type'],
                    file2['path'], file2['type'],
                    sample_rate, threshold
                )
                
                if similarity >= threshold:
                    # 检查是否已经在某个组中
                    found_group = False
                    for gid, group in groups.items():
                        if file1['name'] in group['file_names'] or file2['name'] in group['file_names']:
                            groups[gid]['files'].extend([file1, file2])
                            groups[gid]['file_names'].extend([file1['name'], file2['name']])
                            groups[gid]['file_names'] = list(set(groups[gid]['file_names']))
                            # 更新组内最高相似度
                            groups[gid]['similarity'] = max(groups[gid]['similarity'], similarity)
                            found_group = True
                            break
                    
                    if not found_group:
                        groups[group_id] = {
                            'groupId': group_id,
                            'similarity': similarity,
                            'files': [file1, file2],
                            'file_names': [file1['name'], file2['name']]
                        }
                        group_id += 1
        
        # 清理临时文件
        for file_info in saved_files:
            if os.path.exists(file_info['path']):
                os.remove(file_info['path'])
        
        # 格式化结果
        formatted_results = []
        for group in groups.values():
            formatted_results.append({
                'groupId': group['groupId'],
                'similarity': round(group['similarity'], 4),
                'files': [
                    {
                        'name': f['name'],
                        'type': f['type'],
                        'size': os.path.getsize(f['path']) if os.path.exists(f['path']) else 0
                    }
                    for f in group['files']
                ]
            })
        
        return jsonify({"results": formatted_results})
    
    except Exception as e:
        print(f"检测错误: {e}")
        return jsonify({"error": str(e)}), 500

# 健康检查接口
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    # 启动前清理临时目录
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
    os.makedirs(TEMP_DIR, exist_ok=True)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
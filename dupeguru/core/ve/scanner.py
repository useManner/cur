'''
Author: 3098670287 3098670287@qq.com
Date: 2025-09-11 16:28:44
LastEditors: 3098670287 3098670287@qq.com
LastEditTime: 2025-09-12 15:11:12
FilePath: \dupeguru\core\ve\scanner.py
Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
'''
#
# This software is licensed under the "GPLv3" License as described in the "LICENSE" file,
# which should be included with this package. The terms are also available at
# http://www.gnu.org/licenses/gpl-3.0.html

import cv2
import numpy as np
import logging
from typing import List, Dict, Tuple, Set
from pathlib import Path

from core.scanner import Scanner, ScanType, ScanOption
from core.ve.videofs import VideoFile, VIDEO_EXTENSIONS
from core.engine import Match

class VideoDedupe:
    """Handles video deduplication logic with keyframe extraction."""
    
    # 关键帧提取的参数
    KEYFRAME_INTERVAL = 30  # 每隔多少帧检查一次是否为关键帧
    MIN_FRAMES = 5  # 每个视频至少提取的关键帧数
    MAX_FRAMES = 20  # 每个视频最多提取的关键帧数
    THRESHOLD_DELTA = 10  # 关键帧判断的阈值变化量
    
    @staticmethod
    def generate_video_hash(video_path: str, use_keyframes: bool = True) -> List[str]:
        """生成视频的哈希值，可以基于首帧或关键帧
        
        Args:
            video_path: 视频文件路径
            use_keyframes: 是否使用关键帧提取
            
        Returns:
            包含一个或多个哈希值的列表，每个哈希值代表一帧
        """
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                logging.warning(f"无法打开视频文件: {video_path}")
                return []
                
            hashes = []
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            
            if use_keyframes:
                # 基于关键帧提取
                last_hist = None
                frame_count = 0
                keyframe_count = 0
                
                # 计算需要检查的帧间隔
                interval = min(VideoDedupe.KEYFRAME_INTERVAL, max(1, total_frames // (VideoDedupe.MAX_FRAMES * 2)))
                
                while cap.isOpened() and frame_count < total_frames and keyframe_count < VideoDedupe.MAX_FRAMES:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count)
                    ret, frame = cap.read()
                    if not ret:
                        break
                    
                    # 转换为灰度并调整大小
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    resized = cv2.resize(gray, (32, 32))
                    
                    # 计算直方图以检测场景变化
                    hist = cv2.calcHist([resized], [0], None, [256], [0, 256])
                    cv2.normalize(hist, hist)
                    
                    # 判断是否为关键帧
                    is_keyframe = False
                    if last_hist is None:
                        # 第一帧总是关键帧
                        is_keyframe = True
                    else:
                        # 计算直方图差异
                        diff = cv2.compareHist(last_hist, hist, cv2.HISTCMP_CHISQR)
                        if diff > VideoDedupe.THRESHOLD_DELTA:
                            is_keyframe = True
                    
                    if is_keyframe:
                        # 生成该帧的哈希值
                        avg = resized.mean()
                        frame_hash = ''.join(['1' if pixel > avg else '0' for pixel in resized.flatten()])
                        hashes.append(frame_hash)
                        last_hist = hist
                        keyframe_count += 1
                    
                    frame_count += interval
                
                # 确保至少有MIN_FRAMES个关键帧
                if len(hashes) < VideoDedupe.MIN_FRAMES and total_frames > 0:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    frames_to_get = min(VideoDedupe.MIN_FRAMES, total_frames)
                    for i in range(frames_to_get):
                        ret, frame = cap.read()
                        if not ret:
                            break
                        
                        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                        resized = cv2.resize(gray, (32, 32))
                        avg = resized.mean()
                        frame_hash = ''.join(['1' if pixel > avg else '0' for pixel in resized.flatten()])
                        
                        # 避免添加重复的哈希值
                        if frame_hash not in hashes:
                            hashes.append(frame_hash)
            else:
                # 只使用首帧
                ret, frame = cap.read()
                if ret:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    resized = cv2.resize(gray, (32, 32))
                    avg = resized.mean()
                    frame_hash = ''.join(['1' if pixel > avg else '0' for pixel in resized.flatten()])
                    hashes.append(frame_hash)
            
            return hashes
        except Exception as e:
            logging.warning(f"处理视频文件时出错 {video_path}: {str(e)}")
            return []
        finally:
            cap.release()
    
    @staticmethod
    def hamming_distance(hash1: str, hash2: str) -> int:
        """计算两个哈希值之间的汉明距离"""
        if len(hash1) != len(hash2):
            return max(len(hash1), len(hash2))  # 如果长度不同，返回最大长度
        return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))
    
    @staticmethod
    def calculate_frame_similarity(hash1: str, hash2: str) -> float:
        """计算两个帧哈希之间的相似度（百分比）"""
        distance = VideoDedupe.hamming_distance(hash1, hash2)
        max_distance = max(len(hash1), len(hash2))
        return 100.0 * (1 - distance / max_distance)
    
    @staticmethod
    def find_duplicates(video_files: List[str], min_match_percentage: int = 95, use_keyframes: bool = True) -> Dict[str, Dict]:
        """基于视频哈希值查找重复视频
        
        Args:
            video_files: 视频文件路径列表
            min_match_percentage: 最小匹配百分比
            use_keyframes: 是否使用关键帧提取
            
        Returns:
            包含重复组信息的字典，每个组包含文件路径和匹配信息
        """
        # 1. 生成所有文件的哈希值
        file_hashes = {}
        for file_path in video_files:
            video_hashes = VideoDedupe.generate_video_hash(file_path, use_keyframes)
            if video_hashes:
                file_hashes[file_path] = video_hashes
                
        # 2. 基于相似度阈值查找重复视频
        duplicates = {}
        processed = set()
        
        for path1, hashes1 in file_hashes.items():
            if path1 in processed:
                continue
                
            # 为当前文件查找相似的文件
            similar_files = {path1: {'hashes': hashes1, 'matches': []}}
            processed.add(path1)
            
            for path2, hashes2 in file_hashes.items():
                if path2 in processed or path1 == path2:
                    continue
                    
                # 计算两个视频之间的最佳匹配
                max_similarity = 0.0
                for hash1 in hashes1:
                    for hash2 in hashes2:
                        similarity = VideoDedupe.calculate_frame_similarity(hash1, hash2)
                        max_similarity = max(max_similarity, similarity)
                        
                # 如果最佳匹配超过阈值，则认为是重复视频
                if max_similarity >= min_match_percentage:
                    similar_files[path2] = {
                        'hashes': hashes2,
                        'matches': [{'frame1': i, 'frame2': j, 'similarity': VideoDedupe.calculate_frame_similarity(h1, h2)} 
                                   for i, h1 in enumerate(hashes1) 
                                   for j, h2 in enumerate(hashes2) 
                                   if VideoDedupe.calculate_frame_similarity(h1, h2) >= min_match_percentage]
                    }
                    processed.add(path2)
                    
            # 如果找到了相似文件，将其添加到结果中
            if len(similar_files) > 1:
                duplicates[f"group_{len(duplicates) + 1}"] = similar_files
                
        return duplicates

class ScannerVE(Scanner):
    """视频文件扫描器"""
    
    def __init__(self):
        super().__init__()
        self._exclude_paths = set()
        self.scan_type = ScanType.CONTENTS
        self.min_match_percentage = 85  # 降低阈值，从95%改为85%，更容易找到相似视频
        self.match_different_dimensions = True
        self.use_keyframes = True  # 默认为使用关键帧
    
    def is_supported(self, path):
        """返回路径是否指向受支持的文件"""
        return str(path).lower().endswith(tuple(VIDEO_EXTENSIONS))

    def get_scan_options(self):
        """返回扫描器的选项列表"""
        return [
            ScanOption(ScanType.CONTENTS, "视频内容"),
            ScanOption(ScanType.FILENAME, "文件名"),
        ]

    def _getmatches(self, files, j):
        """返回视频重复项的Match对象列表"""
        if self.scan_type == ScanType.FILENAME:
            # 对于文件名扫描，使用基础Scanner类的实现
            from core import engine
            from hscommon.util import rem_file_ext
            from hscommon.trans import tr
            
            j = j.start_subjob([2, 8])
            func = lambda f: engine.getwords(rem_file_ext(f.name))
            for f in j.iter_with_progress(files, tr("读取 %d/%d 个文件的元数据")):
                f.words = func(f)
            return engine.getmatches(files, j=j, min_match_percentage=self.min_match_percentage)
        
        # 对于内容扫描，使用VideoDedupe
        j = j.start_subjob([2, 8])
        
        # 转换VideoFile对象列表为路径字符串列表
        file_paths = [str(f.path) for f in files]
        
        # 调用VideoDedupe查找重复项
        j.set_progress(0, "正在分析视频文件...")
        duplicates = VideoDedupe.find_duplicates(file_paths, self.min_match_percentage, self.use_keyframes)
        
        # 转换结果为Match对象列表
        matches = []
        
        # 创建路径到VideoFile对象的映射
        path_to_file = {str(f.path): f for f in files}
        
        # 生成Match对象
        total_groups = len(duplicates)
        group_count = 0
        
        logging.info(f"找到 {total_groups} 个视频重复组")
        
        for group_id, group_files in duplicates.items():
            group_count += 1
            j.set_progress(int((group_count / total_groups) * 100), f"正在处理重复组 {group_count}/{total_groups}")
            
            # 获取组内所有文件路径
            paths = list(group_files.keys())
            logging.debug(f"组 {group_id} 包含 {len(paths)} 个文件")
            
            # 为组内的每个文件对创建Match对象
            for i in range(len(paths)):
                for j_idx in range(i + 1, len(paths)):
                    path1 = paths[i]
                    path2 = paths[j_idx]
                    
                    if path1 in path_to_file and path2 in path_to_file:
                        file1 = path_to_file[path1]
                        file2 = path_to_file[path2]
                        
                        # 计算相似度 - 找出两个视频之间的最高相似度
                        max_similarity = 0.0
                        if 'matches' in group_files[path2] and group_files[path2]['matches']:
                            # 使用预先计算的匹配信息
                            for match_info in group_files[path2]['matches']:
                                max_similarity = max(max_similarity, match_info['similarity'])
                            logging.debug(f"文件 {path1} 和 {path2} 的最大相似度: {max_similarity:.2f}%")
                        else:
                            # 如果没有预先计算的匹配信息，使用基于阈值的默认值
                            max_similarity = self.min_match_percentage + 5  # 比阈值高一点，确保被认为是匹配
                            logging.debug(f"文件 {path1} 和 {path2} 使用默认相似度: {max_similarity:.2f}%")
                        
                        # 创建Match对象
                        match = Match(file1, file2, max_similarity)
                        matches.append(match)
        
        logging.info(f"生成了 {len(matches)} 个视频匹配对")
        j.set_progress(100, "视频扫描完成")
        return matches

# 优化VideoDedupe类以提高匹配效果
def optimized_find_duplicates(video_files: List[str], min_match_percentage: int = 85, use_keyframes: bool = True) -> Dict[str, Dict]:
    """优化的视频重复查找方法，提高匹配准确度"""
    from collections import defaultdict
    
    # 1. 生成所有文件的哈希值
    file_hashes = {}
    for file_path in video_files:
        video_hashes = VideoDedupe.generate_video_hash(file_path, use_keyframes)
        if video_hashes:
            file_hashes[file_path] = video_hashes
            logging.debug(f"为文件 {file_path} 生成了 {len(video_hashes)} 个哈希值")
        else:
            logging.warning(f"无法为文件 {file_path} 生成哈希值")
    
    # 如果没有文件哈希值，直接返回空结果
    if not file_hashes:
        return {}
        
    # 2. 基于相似度阈值查找重复视频
    duplicates = {}
    processed = set()
    
    # 计算所有文件对之间的相似度
    all_pairs = []
    file_list = list(file_hashes.items())
    
    for i in range(len(file_list)):
        path1, hashes1 = file_list[i]
        if path1 in processed:
            continue
            
        for j in range(i + 1, len(file_list)):
            path2, hashes2 = file_list[j]
            if path2 in processed:
                continue
                
            # 计算两个视频之间的最佳匹配和平均匹配
            max_similarity = 0.0
            similarities = []
            
            # 计算所有帧对之间的相似度
            for hash1 in hashes1:
                for hash2 in hashes2:
                    similarity = VideoDedupe.calculate_frame_similarity(hash1, hash2)
                    similarities.append(similarity)
                    if similarity > max_similarity:
                        max_similarity = similarity
            
            # 计算平均相似度（只考虑高于阈值的匹配）
            valid_similarities = [s for s in similarities if s >= min_match_percentage]
            avg_similarity = sum(valid_similarities) / len(valid_similarities) if valid_similarities else 0
            
            # 如果有足够多的帧匹配或最佳匹配超过阈值，则认为是重复视频
            match_count = len(valid_similarities)
            required_matches = max(2, min(3, len(hashes1) // 3, len(hashes2) // 3))  # 至少需要2-3个匹配帧
            
            # 使用更灵活的匹配条件
            is_duplicate = (max_similarity >= min_match_percentage and match_count >= required_matches) or \
                          (avg_similarity >= min_match_percentage - 5 and match_count >= required_matches * 2) or \
                          (max_similarity >= min_match_percentage + 5)  # 单个高相似度帧也可以作为匹配依据

            
            if is_duplicate:
                # 记录匹配信息
                match_info = {
                    'max_similarity': max_similarity,
                    'avg_similarity': avg_similarity,
                    'match_count': match_count,
                    'matches': [{'frame1': i, 'frame2': j, 'similarity': s} 
                                for i, h1 in enumerate(hashes1) 
                                for j, h2 in enumerate(hashes2) 
                                if VideoDedupe.calculate_frame_similarity(h1, h2) >= min_match_percentage]
                }
                all_pairs.append((path1, path2, match_info))
                logging.debug(f"文件 {path1} 和 {path2} 被识别为重复 (最大相似度: {max_similarity:.2f}%, 平均相似度: {avg_similarity:.2f}%, 匹配帧数: {match_count})")
    
    # 3. 基于匹配对构建组
    # 简单的贪心分组算法
    if all_pairs:
        # 按匹配强度排序
        all_pairs.sort(key=lambda x: -x[2]['max_similarity'])
        
        # 使用并查集来管理分组
        parent = {path: path for path, _ in file_hashes.items()}
        
        def find(u):
            while parent[u] != u:
                parent[u] = parent[parent[u]]
                u = parent[u]
            return u
        
        def union(u, v):
            u_root = find(u)
            v_root = find(v)
            if u_root != v_root:
                parent[v_root] = u_root
        
        # 合并相似的文件到同一组
        for path1, path2, _ in all_pairs:
            union(path1, path2)
        
        # 收集组
        groups = defaultdict(list)
        for path in file_hashes.keys():
            groups[find(path)].append(path)
        
        # 转换为所需的格式
        group_id = 1
        for group_paths in groups.values():
            if len(group_paths) > 1:
                similar_files = {}
                for path in group_paths:
                    similar_files[path] = {
                        'hashes': file_hashes[path],
                        'matches': []
                    }
                
                # 填充匹配信息
                for path1, path2, match_info in all_pairs:
                    if path1 in similar_files and path2 in similar_files:
                        similar_files[path2]['matches'] = match_info['matches']
                
                duplicates[f"group_{group_id}"] = similar_files
                group_id += 1
    
    logging.info(f"找到 {len(duplicates)} 个视频重复组")
    return duplicates

# 替换原有的find_duplicates方法以使用优化版本
VideoDedupe.find_duplicates = optimized_find_duplicates
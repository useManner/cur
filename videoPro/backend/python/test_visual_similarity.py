'''Author: 3098670287 3098670287@qq.com
Date: 2025-11-06 15:05:29
LastEditors: 3098670287 3098670287@qq.com
LastEditTime: 2025-11-06 15:10:13
FilePath: \videoPro\backend\python\test_visual_similarity.py
Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
'''
import os
import cv2
import numpy as np
# 从app.py导入我们改进的检测函数
import sys
sys.path.append('.')
from app import detect_image_similarity

# 创建测试图像
def create_test_images():
    # 创建目录保存测试图像
    if not os.path.exists('test_images'):
        os.makedirs('test_images')
    
    # 1. 第一个图像：红色背景
    img1 = np.zeros((300, 400, 3), dtype=np.uint8)
    img1[:, :, 2] = 255  # 设置红色通道为255
    cv2.imwrite('test_images/red_background.jpg', img1)
    
    # 2. 第二个图像：相似的红色背景（亮度略暗）
    img2 = np.zeros((300, 400, 3), dtype=np.uint8)
    img2[:, :, 2] = 200  # 稍暗的红色
    cv2.imwrite('test_images/red_background_darker.jpg', img2)
    
    # 3. 第三个图像：红色背景+小变化（右上角有小标记）
    img3 = np.copy(img1)
    cv2.circle(img3, (350, 50), 20, (0, 255, 255), -1)  # 黄色小圆点
    cv2.imwrite('test_images/red_with_mark.jpg', img3)
    
    # 4. 第四个图像：蓝色背景（完全不同）
    img4 = np.zeros((300, 400, 3), dtype=np.uint8)
    img4[:, :, 0] = 255  # 设置蓝色通道为255
    cv2.imwrite('test_images/blue_background.jpg', img4)
    
    # 5. 第五个图像：红色背景的缩放版本（同一内容，不同尺寸）
    img5 = cv2.resize(img1, (350, 280))
    # 填充回原始尺寸
    padded_img5 = np.zeros((300, 400, 3), dtype=np.uint8)
    padded_img5[10:290, 25:375] = img5
    cv2.imwrite('test_images/red_resized.jpg', padded_img5)
    
    return {
        'red_original': 'test_images/red_background.jpg',
        'red_darker': 'test_images/red_background_darker.jpg',
        'red_with_mark': 'test_images/red_with_mark.jpg',
        'blue': 'test_images/blue_background.jpg',
        'red_resized': 'test_images/red_resized.jpg'
    }

# 测试相似度检测
def test_similarity():
    images = create_test_images()
    print(f"已创建测试图像：")
    for name, path in images.items():
        print(f"- {name}: {path}")
    
    # 定义测试用例
    test_cases = [
        ("相同图像", images['red_original'], images['red_original'], 0.95),  # 应该非常相似
        ("亮度变化", images['red_original'], images['red_darker'], 0.8),    # 应该相似
        ("小标记变化", images['red_original'], images['red_with_mark'], 0.8), # 应该相似
        ("缩放变化", images['red_original'], images['red_resized'], 0.8),     # 应该相似
        ("完全不同", images['red_original'], images['blue'], 0.3)             # 应该不相似
    ]
    
    print("\n开始相似度测试：")
    print("=" * 70)
    
    for case_name, img1_path, img2_path, expected_threshold in test_cases:
        similarity = detect_image_similarity(img1_path, img2_path)
        
        # 确定结果
        if similarity >= 0.95:
            result = "视觉上完全相同"
            confidence = "很高"
        elif similarity >= 0.8:
            result = "视觉上高度相似"
            confidence = "高"
        elif similarity >= 0.7:
            result = "视觉上相似"
            confidence = "中等"
        else:
            result = "视觉上不相似"
            confidence = "低"
        
        # 判断是否符合预期
        meets_expectation = similarity >= expected_threshold
        expectation_result = "✓ 符合预期" if meets_expectation else "✗ 不符合预期"
        
        print(f"测试用例: {case_name}")
        print(f"  相似度: {similarity:.4f}")
        print(f"  结论: {result} (置信度: {confidence})")
        print(f"  预期: 相似度应{'≥' if expected_threshold > 0 else '≤'} {expected_threshold:.1f}")
        print(f"  结果: {expectation_result}")
        print("-" * 70)

if __name__ == "__main__":
    test_similarity()
"""Video deduplication module for dupeGuru."""

import cv2
import numpy as np
from typing import List, Dict
from pathlib import Path

class VideoDedupe:
    """Handles video deduplication logic."""

    @staticmethod
    def generate_video_hash(video_path: str) -> str:
        """Generate a hash for a video file based on its first frame.
        
        Args:
            video_path: Path to the video file.
            
        Returns:
            A string representing the video hash.
        """
        try:
            cap = cv2.VideoCapture(video_path)
            ret, frame = cap.read()
            if not ret:
                return ""
                
            # Convert to grayscale and resize
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frame = cv2.resize(frame, (32, 32))
            
            # Generate hash (simple average-based)
            avg = frame.mean()
            return ''.join(['1' if i > avg else '0' for i in frame.flatten()])
        except Exception:
            return ""
        finally:
            cap.release()

    @staticmethod
    def hamming_distance(hash1: str, hash2: str) -> int:
        """计算两个哈希值之间的汉明距离。"""
        if len(hash1) != len(hash2):
            return max(len(hash1), len(hash2))  # 如果长度不同，返回最大长度
        return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))
    
    @staticmethod
    def find_duplicates(video_files: List[str], min_match_percentage: int = 95) -> Dict[str, List[str]]:
        """Find duplicate videos based on their hashes with similarity threshold."""
        # 1. 生成所有文件的哈希值
        file_hashes = {}
        for file_path in video_files:
            video_hash = VideoDedupe.generate_video_hash(file_path)
            if video_hash:
                file_hashes[file_path] = video_hash
                
        # 2. 基于相似度阈值查找重复视频
        duplicates = {}
        processed = set()
        threshold = 1 - min_match_percentage / 100.0
        
        for path1, hash1 in file_hashes.items():
            if path1 in processed:
                continue
                
            group = [path1]
            processed.add(path1)
            
            for path2, hash2 in file_hashes.items():
                if path2 not in processed and path1 != path2:
                    # 计算相似度
                    distance = VideoDedupe.hamming_distance(hash1, hash2)
                    similarity = 1 - (distance / max(len(hash1), len(hash2)))
                    
                    if similarity >= (1 - threshold):  # 相似度高于阈值
                        group.append(path2)
                        processed.add(path2)
            
            # 将组添加到duplicates字典中
            if len(group) > 1:
                duplicates[f"group_{len(duplicates) + 1}"] = group
        
        return duplicates
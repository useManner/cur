# video_dupe/utils.py
import cv2
from PIL import Image
import imagehash
import os

def extract_frames(video_path, every_n_seconds=2, max_frames=20):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    interval = int(fps * every_n_seconds)
    count = 0
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if count % interval == 0:
            frames.append(frame)
            if len(frames) >= max_frames:
                break
        count += 1
    cap.release()
    return frames

def frame_to_phash(frame, hash_size=8):
    """将OpenCV帧转化为pHash值（imagehash对象）"""
    pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    return imagehash.phash(pil_img, hash_size=hash_size)

def get_video_signature(video_path, every_n_seconds=2, max_frames=20):
    """生成视频的帧哈希签名列表"""
    frames = extract_frames(video_path, every_n_seconds, max_frames)
    hashes = [frame_to_phash(f) for f in frames]
    return hashes

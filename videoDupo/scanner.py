# video_dupe/scanner.py
import os
from .utils import get_video_signature
from .models import VideoSignature

class VideoScanner:
    def __init__(self, root_dir, frame_interval=2, max_frames=20, threshold=0.8):
        self.root_dir = root_dir
        self.frame_interval = frame_interval
        self.max_frames = max_frames
        self.threshold = threshold
        self.signatures = []

    def collect_videos(self):
        video_exts = {'.mp4', '.avi', '.mov', '.mkv'}
        files = []
        for root, _, fs in os.walk(self.root_dir):
            for f in fs:
                if os.path.splitext(f)[1].lower() in video_exts:
                    files.append(os.path.join(root, f))
        return files

    def build_signatures(self):
        videos = self.collect_videos()
        print(f"[INFO] Found {len(videos)} videos.")
        for v in videos:
            try:
                hashes = get_video_signature(v, self.frame_interval, self.max_frames)
                sig = VideoSignature(v, hashes)
                self.signatures.append(sig)
                print(f"[OK] Processed {v}")
            except Exception as e:
                print(f"[ERROR] {v}: {e}")

    def find_duplicates(self):
        duplicates = []
        checked = set()
        for i, sig in enumerate(self.signatures):
            for j, sig2 in enumerate(self.signatures):
                if i >= j:
                    continue
                key = (i, j)
                if key in checked:
                    continue
                sim = sig.similarity(sig2)
                if sim >= self.threshold:
                    duplicates.append((sig.path, sig2.path, sim))
                checked.add(key)
        return duplicates

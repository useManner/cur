"""Video file scanning utilities."""

import cv2
import numpy as np
from pathlib import Path
from core.fs import File
from typing import Dict, Optional

VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'}

class VideoFile(File):
    """A specialized file class for video files."""
    
    def __init__(self, path: str):
        super().__init__(path)
        self._video_hash = None
        self._metadata = None
    
    @property
    def INITIAL_INFO(self):
        return {"size", "mtime", "duration", "width", "height", "video_hash"}
        
    def _get_display_info(self, group, delta):
        return {
            "name": self.name,
            "folder_path": str(self.folder_path),
            "size": self.size,
            "duration": self._get_duration(),
            "dimensions": f"{self.width}x{self.height}",
            "modified": self.mtime,
            "video_hash": self.video_hash or "N/A"
        }
        
    def _read_all_info(self, attrnames=None):
        super()._read_all_info(attrnames)
        try:
            cap = cv2.VideoCapture(str(self.path))
            self.width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            self.height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            self.duration = cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
            
            # Generate video hash from first frame
            ret, frame = cap.read()
            if ret:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                frame = cv2.resize(frame, (32, 32))
                avg = frame.mean()
                self._video_hash = ''.join(['1' if i > avg else '0' for i in frame.flatten()])
            cap.release()
        except Exception:
            self.width = 0
            self.height = 0
            self.duration = 0
            self._video_hash = None
            
    def _get_duration(self) -> str:
        """Returns duration in HH:MM:SS format."""
        if not hasattr(self, 'duration') or not self.duration:
            return "00:00:00"
        hours = int(self.duration // 3600)
        minutes = int((self.duration % 3600) // 60)
        seconds = int(self.duration % 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        
    @property
    def video_hash(self) -> Optional[str]:
        """Returns video perceptual hash."""
        if not hasattr(self, '_video_hash'):
            self._read_all_info()
        return self._video_hash
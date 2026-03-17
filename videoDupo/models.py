# video_dupe/models.py

class VideoSignature:
    def __init__(self, path, hashes):
        self.path = path
        self.hashes = hashes

    def similarity(self, other, threshold=8):
        """计算和另一视频的相似度比例"""
        matches = 0
        for h1 in self.hashes:
            if any(h1 - h2 <= threshold for h2 in other.hashes):
                matches += 1
        return matches / max(len(self.hashes), len(other.hashes))

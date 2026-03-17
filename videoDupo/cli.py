# video_dupe/cli.py
import argparse
from .scanner import VideoScanner

def main():
    parser = argparse.ArgumentParser(description="Video duplicate finder by frame hashing")
    parser.add_argument("path", help="Directory path to scan")
    parser.add_argument("--interval", type=int, default=2, help="Seconds between frames")
    parser.add_argument("--max-frames", type=int, default=20, help="Max frames to sample per video")
    parser.add_argument("--threshold", type=float, default=0.8, help="Similarity threshold (0-1)")
    args = parser.parse_args()

    scanner = VideoScanner(args.path, args.interval, args.max_frames, args.threshold)
    scanner.build_signatures()
    duplicates = scanner.find_duplicates()

    if not duplicates:
        print("No duplicates found.")
    else:
        print(f"\n=== Duplicates found ({len(duplicates)}) ===")
        for a, b, sim in duplicates:
            print(f"{a} <==> {b}  [similarity: {sim:.2f}]")

if __name__ == "__main__":
    main()

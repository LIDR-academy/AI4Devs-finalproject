import cv2
from pathlib import Path
from datetime import datetime

out_dir = Path("workspace/scratch/camera-probe")
out_dir.mkdir(parents=True, exist_ok=True)

for index in [0, 1, 2, 3]:
    print(f"\n=== Testing camera index {index} ===")
    cap = cv2.VideoCapture(index)
    if not cap.isOpened():
        print(f"cameraIndex={index} -> NOT OPENED")
        continue

    ok, frame = cap.read()
    cap.release()

    if not ok or frame is None:
        print(f"cameraIndex={index} -> OPENED BUT NO FRAME")
        continue

    h, w = frame.shape[:2]
    filename = out_dir / f"camera_index_{index}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
    cv2.imwrite(str(filename), frame)
    print(f"cameraIndex={index} -> OK {w}x{h} saved: {filename}")

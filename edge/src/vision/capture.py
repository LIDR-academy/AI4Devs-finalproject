from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2

try:
    from ..models import RegionOfInterest
except ImportError:
    from models import RegionOfInterest


class VisionInputError(RuntimeError):
    pass


@dataclass(frozen=True)
class CapturedFrame:
    image: Any
    source: str
    frame_source: str


def crop_frame(frame: Any, roi: RegionOfInterest | None) -> tuple[Any, int, int]:
    if frame is None or getattr(frame, "size", 0) == 0:
        raise VisionInputError("Frame is empty")
    if roi is None:
        return frame, 0, 0

    frame_height, frame_width = frame.shape[:2]
    if (
        roi.x < 0
        or roi.y < 0
        or roi.w <= 0
        or roi.h <= 0
        or roi.x + roi.w > frame_width
        or roi.y + roi.h > frame_height
    ):
        raise VisionInputError(
            f"ROI {roi.as_dict()} is outside frame bounds width={frame_width}, height={frame_height}"
        )
    return frame[roi.y : roi.y + roi.h, roi.x : roi.x + roi.w], roi.x, roi.y


class FrameCapture:
    """Capture is lazy: constructing this class never opens a camera."""

    def read_file(self, path: Path) -> CapturedFrame:
        image = cv2.imread(str(path))
        if image is None:
            raise VisionInputError(f"Could not read image file: {path}")
        return CapturedFrame(image=image, source="file", frame_source=path.name)

    def read_camera(self, camera_index: int) -> CapturedFrame:
        camera = cv2.VideoCapture(camera_index)
        try:
            if not camera.isOpened():
                raise VisionInputError(f"Could not open camera index={camera_index}")
            ok, frame = camera.read()
            if not ok or frame is None:
                raise VisionInputError(f"Could not read frame from camera index={camera_index}")
            return CapturedFrame(
                image=frame,
                source="camera",
                frame_source=f"camera:{camera_index}",
            )
        finally:
            camera.release()


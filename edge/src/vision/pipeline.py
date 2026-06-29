from __future__ import annotations

from typing import Any

try:
    from ..models import DetectionSnapshot, RegionOfInterest
    from .color_detector import ColorDetector
    from .qr_reader import QrReader
except ImportError:
    from models import DetectionSnapshot, RegionOfInterest
    from vision.color_detector import ColorDetector
    from vision.qr_reader import QrReader


class VisionPipeline:
    def __init__(self, qr_reader: QrReader, color_detector: ColorDetector) -> None:
        self.qr_reader = qr_reader
        self.color_detector = color_detector

    def process(
        self,
        frame: Any,
        *,
        run_id: str,
        source: str,
        frame_source: str | None,
        qr_roi: RegionOfInterest | None,
        cargo_roi: RegionOfInterest | None,
        metadata: dict[str, object] | None = None,
    ) -> DetectionSnapshot:
        qr_result = self.qr_reader.read(frame, qr_roi)
        detections = self.color_detector.detect(frame, cargo_roi)
        frame_height, frame_width = frame.shape[:2]
        safe_metadata = {
            **(metadata or {}),
            "frameWidth": frame_width,
            "frameHeight": frame_height,
            "qrDetected": qr_result.detected,
            "qrValid": qr_result.is_valid,
            "qrRawValue": qr_result.raw_value,
            "qrRoi": qr_roi.as_dict() if qr_roi else None,
            "cargoRoi": cargo_roi.as_dict() if cargo_roi else None,
        }
        return DetectionSnapshot(
            run_id=run_id,
            source=source,
            truck_code=qr_result.truck_code,
            detections=detections,
            frame_source=frame_source,
            metadata=safe_metadata,
        )

from __future__ import annotations

import hashlib
import json
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
        counts = self._counts(detections)
        qr_status = "OK" if qr_result.is_valid else "QR_INVALID" if qr_result.detected else "QR_NOT_DETECTED"
        signature = self._snapshot_signature(
            source=source,
            truck_code=qr_result.truck_code,
            qr_status=qr_status,
            detections=detections,
            cargo_roi=cargo_roi,
            qr_roi=qr_roi,
            frame_width=frame_width,
            frame_height=frame_height,
        )
        safe_metadata = {
            **(metadata or {}),
            "frameWidth": frame_width,
            "frameHeight": frame_height,
            "qrDetected": qr_result.detected,
            "qrValid": qr_result.is_valid,
            "qrStatus": qr_status,
            "qrRawValue": qr_result.raw_value,
            "qrRoi": qr_roi.as_dict() if qr_roi else None,
            "cargoRoi": cargo_roi.as_dict() if cargo_roi else None,
            "counts": counts,
            "snapshotSignature": signature,
        }
        return DetectionSnapshot(
            run_id=run_id,
            source=source,
            truck_code=qr_result.truck_code,
            detections=detections,
            frame_source=frame_source,
            metadata=safe_metadata,
        )

    @staticmethod
    def _counts(detections) -> dict[str, int]:
        counts = {"red": 0, "blue": 0, "green": 0, "yellow": 0, "total": 0}
        for detection in detections:
            counts[detection.color] = counts.get(detection.color, 0) + 1
            counts["total"] += 1
        return counts

    @staticmethod
    def _snapshot_signature(
        *,
        source: str,
        truck_code: str | None,
        qr_status: str,
        detections,
        cargo_roi: RegionOfInterest | None,
        qr_roi: RegionOfInterest | None,
        frame_width: int,
        frame_height: int,
    ) -> str:
        payload = {
            "source": source,
            "truckCode": truck_code,
            "qrStatus": qr_status,
            "frameWidth": frame_width,
            "frameHeight": frame_height,
            "qrRoi": qr_roi.as_dict() if qr_roi else None,
            "cargoRoi": cargo_roi.as_dict() if cargo_roi else None,
            "detections": [
                {
                    "color": detection.color,
                    "x": detection.x,
                    "y": detection.y,
                    "w": detection.w,
                    "h": detection.h,
                    "confidence": detection.confidence,
                    "sizeValid": detection.metadata.get("sizeValid", True),
                }
                for detection in detections
            ],
        }
        encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()[:24]

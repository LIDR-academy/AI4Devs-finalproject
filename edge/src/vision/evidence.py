from __future__ import annotations

import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any

import cv2

try:
    from ..models import CubeDetection, DetectionSnapshot, RegionOfInterest
except ImportError:
    from models import CubeDetection, DetectionSnapshot, RegionOfInterest


SENSITIVE_KEYS = ("password", "secret", "token", "api_key", "apikey")
BOX_COLORS_BGR = {
    "red": (0, 0, 255),
    "blue": (255, 0, 0),
    "green": (0, 180, 0),
    "yellow": (0, 220, 255),
}
ROI_COLORS_BGR = {
    "cargoRoi": (0, 200, 0),
    "qrRoi": (255, 0, 255),
}


def _sanitize(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            str(key): _sanitize(item)
            for key, item in value.items()
            if not any(sensitive in str(key).lower() for sensitive in SENSITIVE_KEYS)
        }
    if isinstance(value, (list, tuple)):
        return [_sanitize(item) for item in value]
    if isinstance(value, Path):
        return value.name
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    return str(value)


def cube_to_dict(cube: CubeDetection) -> dict[str, Any]:
    center_x, center_y = cube.center
    return {
        "color": cube.color,
        "x": cube.x,
        "y": cube.y,
        "w": cube.w,
        "h": cube.h,
        "center": {"x": center_x, "y": center_y},
        "confidence": cube.confidence,
        "metadata": _sanitize(cube.metadata),
    }


def snapshot_to_dict(snapshot: DetectionSnapshot) -> dict[str, Any]:
    return {
        "runId": snapshot.run_id,
        "timestamp": snapshot.captured_at.isoformat(),
        "source": snapshot.source,
        "truckCode": snapshot.truck_code,
        "frameSource": Path(snapshot.frame_source).name if snapshot.frame_source else None,
        "frameId": snapshot.frame_id,
        "calibrationVersion": snapshot.calibration_version,
        "detections": [cube_to_dict(cube) for cube in snapshot.detections],
        "metadata": _sanitize(snapshot.metadata),
    }


def _safe_filename_part(value: str) -> str:
    sanitized = re.sub(r"[^A-Za-z0-9_-]+", "-", value).strip("-")
    return sanitized or "run"


class EvidenceWriter:
    def __init__(self, output_directory: Path, *, enabled: bool = False) -> None:
        self.output_directory = output_directory
        self.enabled = enabled

    def write(
        self,
        snapshot: DetectionSnapshot,
        *,
        frame: Any | None = None,
    ) -> dict[str, str]:
        if not self.enabled:
            return {}

        self.output_directory.mkdir(parents=True, exist_ok=True)
        safe_run_id = _safe_filename_part(snapshot.run_id)
        json_name = f"snapshot-{safe_run_id}.json"
        self._write_json_atomic(self.output_directory / json_name, snapshot_to_dict(snapshot))
        result = {"json": json_name}

        if frame is not None:
            annotated_name = f"snapshot-{safe_run_id}-annotated.png"
            annotated = self.annotate(frame, snapshot)
            if not cv2.imwrite(str(self.output_directory / annotated_name), annotated):
                raise RuntimeError("Could not write annotated evidence image")
            result["annotatedImage"] = annotated_name
        return result

    @staticmethod
    def annotate(frame: Any, snapshot: DetectionSnapshot) -> Any:
        annotated = frame.copy()
        EvidenceWriter._draw_roi(
            annotated,
            snapshot.metadata.get("cargoRoi"),
            label="CARGO ROI",
            color=ROI_COLORS_BGR["cargoRoi"],
        )
        qr_status = snapshot.metadata.get("qrStatus")
        qr_label = "QR ROI" if qr_status == "OK" else f"QR ROI {qr_status or ''}".strip()
        EvidenceWriter._draw_roi(
            annotated,
            snapshot.metadata.get("qrRoi"),
            label=qr_label,
            color=ROI_COLORS_BGR["qrRoi"],
        )
        for cube in snapshot.detections:
            color = BOX_COLORS_BGR.get(cube.color, (255, 255, 255))
            cv2.rectangle(
                annotated,
                (cube.x, cube.y),
                (cube.x + cube.w, cube.y + cube.h),
                color,
                2,
            )
            size_valid = cube.metadata.get("sizeValid", True)
            score = cube.confidence
            score_text = f" {score:.2f}" if isinstance(score, (int, float)) else ""
            label = f"{cube.color}{score_text} sizeValid={str(size_valid).lower()}"
            cv2.putText(
                annotated,
                label,
                (cube.x, max(15, cube.y - 5)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                color,
                1,
                cv2.LINE_AA,
            )
        return annotated

    @staticmethod
    def _draw_roi(frame: Any, roi_value: Any, *, label: str, color: tuple[int, int, int]) -> None:
        roi = EvidenceWriter._parse_roi(roi_value)
        if roi is None:
            return
        height, width = frame.shape[:2]
        x1 = max(0, min(width - 1, roi.x))
        y1 = max(0, min(height - 1, roi.y))
        x2 = max(0, min(width - 1, roi.x + roi.w))
        y2 = max(0, min(height - 1, roi.y + roi.h))
        if x1 == x2 or y1 == y2:
            return
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
        EvidenceWriter._draw_label(frame, label, (x1, max(18, y1 - 8)), color)

    @staticmethod
    def _parse_roi(value: Any) -> RegionOfInterest | None:
        if isinstance(value, RegionOfInterest):
            return value
        if not isinstance(value, dict):
            return None
        try:
            return RegionOfInterest(
                x=int(value["x"]),
                y=int(value["y"]),
                w=int(value["w"]),
                h=int(value["h"]),
            )
        except (KeyError, TypeError, ValueError):
            return None

    @staticmethod
    def _draw_label(frame: Any, label: str, origin: tuple[int, int], color: tuple[int, int, int]) -> None:
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.5
        thickness = 2
        text_size, baseline = cv2.getTextSize(label, font, font_scale, thickness)
        text_w, text_h = text_size
        x = max(0, min(origin[0], max(0, frame.shape[1] - text_w - 8)))
        y = max(text_h + baseline + 4, min(origin[1], frame.shape[0] - 4))
        cv2.rectangle(
            frame,
            (x, y - text_h - baseline - 6),
            (x + text_w + 8, y + baseline),
            (0, 0, 0),
            -1,
        )
        cv2.putText(frame, label, (x + 4, y - 4), font, font_scale, color, thickness, cv2.LINE_AA)

    @staticmethod
    def _write_json_atomic(path: Path, payload: dict[str, Any]) -> None:
        temporary_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                "w",
                encoding="utf-8",
                dir=path.parent,
                prefix=f".{path.name}.",
                suffix=".tmp",
                delete=False,
            ) as file:
                json.dump(payload, file, indent=2, ensure_ascii=False)
                file.write("\n")
                file.flush()
                os.fsync(file.fileno())
                temporary_path = Path(file.name)
            os.replace(temporary_path, path)
        finally:
            if temporary_path is not None and temporary_path.exists():
                temporary_path.unlink()

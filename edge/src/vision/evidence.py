from __future__ import annotations

import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any

import cv2

try:
    from ..models import CubeDetection, DetectionSnapshot
except ImportError:
    from models import CubeDetection, DetectionSnapshot


SENSITIVE_KEYS = ("password", "secret", "token", "api_key", "apikey")


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
        for cube in snapshot.detections:
            color = (0, 0, 255) if cube.color == "red" else (255, 255, 255)
            cv2.rectangle(
                annotated,
                (cube.x, cube.y),
                (cube.x + cube.w, cube.y + cube.h),
                color,
                2,
            )
            cv2.putText(
                annotated,
                cube.color,
                (cube.x, max(15, cube.y - 5)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                1,
                cv2.LINE_AA,
            )
        return annotated

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

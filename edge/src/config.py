from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from .models import EdgeRunProfile, HsvRange, RegionOfInterest, SUPPORTED_COLORS
except ImportError:  # Direct execution via python src\edge_runner.py
    from models import EdgeRunProfile, HsvRange, RegionOfInterest, SUPPORTED_COLORS


class EdgeConfigError(ValueError):
    pass


@dataclass(frozen=True)
class EdgeSafetyConfig:
    dry_run: bool = True
    enable_hardware_motion: bool = False
    human_confirmation_required: bool = True


DEFAULT_HSV_RANGES: dict[str, tuple[HsvRange, ...]] = {
    "red": (
        HsvRange(lower=(0, 100, 80), upper=(10, 255, 255)),
        HsvRange(lower=(170, 100, 80), upper=(179, 255, 255)),
    ),
    "blue": (HsvRange(lower=(95, 90, 70), upper=(130, 255, 255)),),
    "yellow": (HsvRange(lower=(22, 120, 120), upper=(34, 255, 255)),),
    "green": (HsvRange(lower=(40, 70, 70), upper=(85, 255, 255)),),
}


@dataclass(frozen=True)
class VisionConfig:
    source: str
    image_path: Path | None
    camera_index: int
    qr_roi: RegionOfInterest | None
    cargo_roi: RegionOfInterest | None
    qr_pattern: str
    allowed_truck_codes: tuple[str, ...]
    hsv_ranges: dict[str, tuple[HsvRange, ...]]
    min_area: float
    max_area: float
    min_fill_ratio: float
    evidence_directory: Path


@dataclass(frozen=True)
class EdgeConfig:
    profile: EdgeRunProfile
    truck_code: str
    drop_zones_path: Path
    safety: EdgeSafetyConfig
    vision: VisionConfig
    raw: dict[str, Any]


def _require_bool(value: object, field_name: str, default: bool) -> bool:
    if value is None:
        return default
    if not isinstance(value, bool):
        raise EdgeConfigError(f"{field_name} must be a boolean")
    return value


def _parse_roi(value: object, field_name: str) -> RegionOfInterest | None:
    if value is None:
        return None
    if not isinstance(value, dict):
        raise EdgeConfigError(f"{field_name} must be an object or null")

    parsed: dict[str, int] = {}
    for key in ("x", "y", "w", "h"):
        item = value.get(key)
        if isinstance(item, bool) or not isinstance(item, int):
            raise EdgeConfigError(f"{field_name}.{key} must be an integer")
        parsed[key] = item

    if parsed["x"] < 0 or parsed["y"] < 0 or parsed["w"] <= 0 or parsed["h"] <= 0:
        raise EdgeConfigError(f"{field_name} must have x/y >= 0 and w/h > 0")
    return RegionOfInterest(**parsed)


def _parse_hsv_triplet(value: object, field_name: str) -> tuple[int, int, int]:
    if not isinstance(value, list) or len(value) != 3:
        raise EdgeConfigError(f"{field_name} must be a three-item array")
    result: list[int] = []
    for index, item in enumerate(value):
        if isinstance(item, bool) or not isinstance(item, int):
            raise EdgeConfigError(f"{field_name}[{index}] must be an integer")
        maximum = 179 if index == 0 else 255
        if item < 0 or item > maximum:
            raise EdgeConfigError(f"{field_name}[{index}] must be between 0 and {maximum}")
        result.append(item)
    return result[0], result[1], result[2]


def _parse_hsv_ranges(value: object) -> dict[str, tuple[HsvRange, ...]]:
    if value is None:
        return DEFAULT_HSV_RANGES
    if not isinstance(value, dict) or set(value) != set(SUPPORTED_COLORS):
        raise EdgeConfigError(f"vision.hsvRanges must define exactly {sorted(SUPPORTED_COLORS)}")

    result: dict[str, tuple[HsvRange, ...]] = {}
    for color in SUPPORTED_COLORS:
        entries = value[color]
        if not isinstance(entries, list) or not entries:
            raise EdgeConfigError(f"vision.hsvRanges.{color} must be a non-empty array")
        ranges: list[HsvRange] = []
        for index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                raise EdgeConfigError(f"vision.hsvRanges.{color}[{index}] must be an object")
            lower = _parse_hsv_triplet(entry.get("lower"), f"vision.hsvRanges.{color}[{index}].lower")
            upper = _parse_hsv_triplet(entry.get("upper"), f"vision.hsvRanges.{color}[{index}].upper")
            if any(low > high for low, high in zip(lower, upper)):
                raise EdgeConfigError(f"vision.hsvRanges.{color}[{index}] lower must not exceed upper")
            ranges.append(HsvRange(lower=lower, upper=upper))
        result[color] = tuple(ranges)
    return result


def _parse_positive_number(value: object, field_name: str, default: float) -> float:
    if value is None:
        return default
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value <= 0:
        raise EdgeConfigError(f"{field_name} must be a positive number")
    return float(value)


def load_edge_config(path: Path) -> EdgeConfig:
    try:
        with path.open("r", encoding="utf-8") as file:
            raw = json.load(file)
    except (OSError, json.JSONDecodeError) as exc:
        raise EdgeConfigError(f"Could not load Edge config from {path}: {exc}") from exc

    if not isinstance(raw, dict):
        raise EdgeConfigError("Edge config must be a JSON object")

    try:
        profile = EdgeRunProfile.parse(raw.get("profile", raw.get("mode", "simulation")))
    except ValueError as exc:
        raise EdgeConfigError(str(exc)) from exc

    truck_code = str(raw.get("truckCode", "TRUCK-001")).strip()
    if not truck_code:
        raise EdgeConfigError("truckCode must not be empty")

    safety_raw = raw.get("safety", {})
    if not isinstance(safety_raw, dict):
        raise EdgeConfigError("safety must be a JSON object")

    safety = EdgeSafetyConfig(
        dry_run=_require_bool(safety_raw.get("dryRun"), "safety.dryRun", True),
        enable_hardware_motion=_require_bool(
            safety_raw.get("enableHardwareMotion"),
            "safety.enableHardwareMotion",
            False,
        ),
        human_confirmation_required=_require_bool(
            safety_raw.get("humanConfirmationRequired"),
            "safety.humanConfirmationRequired",
            True,
        ),
    )

    drop_zones_raw = raw.get("dropZones", {})
    if not isinstance(drop_zones_raw, dict):
        raise EdgeConfigError("dropZones must be a JSON object")

    drop_zones_value = drop_zones_raw.get("path", "drop_zones.example.json")
    if not isinstance(drop_zones_value, str) or not drop_zones_value.strip():
        raise EdgeConfigError("dropZones.path must be a non-empty string")

    drop_zones_path = Path(drop_zones_value)
    if not drop_zones_path.is_absolute():
        drop_zones_path = path.parent / drop_zones_path

    vision_raw = raw.get("vision", {})
    if not isinstance(vision_raw, dict):
        raise EdgeConfigError("vision must be a JSON object")

    source = str(vision_raw.get("source", "simulation")).strip().lower()
    if source not in {"simulation", "file", "camera"}:
        raise EdgeConfigError("vision.source must be simulation, file, or camera")

    image_path_value = vision_raw.get("imagePath")
    image_path: Path | None = None
    if image_path_value is not None:
        if not isinstance(image_path_value, str) or not image_path_value.strip():
            raise EdgeConfigError("vision.imagePath must be a non-empty string or null")
        image_path = Path(image_path_value)
        if not image_path.is_absolute():
            image_path = path.parent / image_path

    camera_index = vision_raw.get("cameraIndex", 0)
    if isinstance(camera_index, bool) or not isinstance(camera_index, int) or camera_index < 0:
        raise EdgeConfigError("vision.cameraIndex must be a non-negative integer")

    qr_raw = vision_raw.get("qr", {})
    if not isinstance(qr_raw, dict):
        raise EdgeConfigError("vision.qr must be a JSON object")
    qr_pattern = qr_raw.get("pattern", r"^TRUCK-\d{3}$")
    if not isinstance(qr_pattern, str) or not qr_pattern:
        raise EdgeConfigError("vision.qr.pattern must be a non-empty string")
    allowed_codes_raw = qr_raw.get("allowedTruckCodes", [])
    if not isinstance(allowed_codes_raw, list) or not all(
        isinstance(code, str) and code.strip() for code in allowed_codes_raw
    ):
        raise EdgeConfigError("vision.qr.allowedTruckCodes must be an array of non-empty strings")

    detection_raw = vision_raw.get("detection", {})
    if not isinstance(detection_raw, dict):
        raise EdgeConfigError("vision.detection must be a JSON object")
    min_area = _parse_positive_number(detection_raw.get("minArea"), "vision.detection.minArea", 250.0)
    max_area = _parse_positive_number(detection_raw.get("maxArea"), "vision.detection.maxArea", 100000.0)
    if min_area > max_area:
        raise EdgeConfigError("vision.detection.minArea must not exceed maxArea")
    min_fill_ratio = detection_raw.get("minFillRatio", 0.45)
    if (
        isinstance(min_fill_ratio, bool)
        or not isinstance(min_fill_ratio, (int, float))
        or not 0 <= min_fill_ratio <= 1
    ):
        raise EdgeConfigError("vision.detection.minFillRatio must be between 0 and 1")

    evidence_raw = vision_raw.get("evidence", {})
    if not isinstance(evidence_raw, dict):
        raise EdgeConfigError("vision.evidence must be a JSON object")
    evidence_directory_value = evidence_raw.get("directory", "evidence")
    if not isinstance(evidence_directory_value, str) or not evidence_directory_value.strip():
        raise EdgeConfigError("vision.evidence.directory must be a non-empty string")
    evidence_directory = Path(evidence_directory_value)
    if not evidence_directory.is_absolute():
        evidence_directory = path.parent / evidence_directory

    vision = VisionConfig(
        source=source,
        image_path=image_path,
        camera_index=camera_index,
        qr_roi=_parse_roi(vision_raw.get("qrRoi"), "vision.qrRoi"),
        cargo_roi=_parse_roi(vision_raw.get("cargoRoi"), "vision.cargoRoi"),
        qr_pattern=qr_pattern,
        allowed_truck_codes=tuple(code.strip() for code in allowed_codes_raw),
        hsv_ranges=_parse_hsv_ranges(vision_raw.get("hsvRanges")),
        min_area=min_area,
        max_area=max_area,
        min_fill_ratio=float(min_fill_ratio),
        evidence_directory=evidence_directory,
    )

    return EdgeConfig(
        profile=profile,
        truck_code=truck_code,
        drop_zones_path=drop_zones_path,
        safety=safety,
        vision=vision,
        raw=raw,
    )

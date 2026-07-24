from __future__ import annotations

import json
from dataclasses import dataclass
import math
from pathlib import Path
from typing import Any

try:
    from .models import EdgeRunProfile, HsvRange, ImagePoint, RegionOfInterest, RobotPose, SUPPORTED_COLORS
except ImportError:  # Direct execution via python src\edge_runner.py
    from models import EdgeRunProfile, HsvRange, ImagePoint, RegionOfInterest, RobotPose, SUPPORTED_COLORS


class EdgeConfigError(ValueError):
    pass


@dataclass(frozen=True)
class EdgeSafetyConfig:
    dry_run: bool = True
    enable_hardware_motion: bool = False
    human_confirmation_required: bool = True


@dataclass(frozen=True)
class MovementTimingConfig:
    delay_seconds: float = 0.0
    pickup_hold_seconds: float = 0.0
    release_hold_seconds: float = 0.0


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
    min_width: float
    max_width: float
    min_height: float
    max_height: float
    min_fill_ratio: float
    min_aspect_ratio: float
    max_aspect_ratio: float
    overlap_threshold: float
    size_valid: bool
    morphology_kernel_size: int
    evidence_directory: Path


@dataclass(frozen=True)
class WorkspaceLimits:
    min_x: float
    max_x: float
    min_y: float
    max_y: float
    min_z: float
    max_z: float


@dataclass(frozen=True)
class VisualPickupCalibration:
    pickup_width_cm: float
    pickup_height_cm: float
    cube_size_cm: float
    top_left: ImagePoint
    top_right: ImagePoint
    bottom_right: ImagePoint
    bottom_left: ImagePoint


@dataclass(frozen=True)
class PickupRobotCalibration:
    version: str
    image_roi: RegionOfInterest | None
    visual: VisualPickupCalibration | None
    top_left: RobotPose
    top_right: RobotPose
    bottom_right: RobotPose
    bottom_left: RobotPose


@dataclass(frozen=True)
class RobotPlanningConfig:
    enabled: bool
    safe_z: float | None = None
    pick_z: float | None = None
    drop_safe_z: float | None = None
    lift_z_delta: float | None = None
    pickup_offset: RobotPose = RobotPose(0.0, 0.0, 0.0)
    ready_pose: RobotPose | None = None
    reset_pose: RobotPose | None = None
    calibration: PickupRobotCalibration | None = None
    workspace: WorkspaceLimits | None = None


@dataclass(frozen=True)
class EdgeConfig:
    profile: EdgeRunProfile
    truck_code: str
    drop_zones_path: Path
    safety: EdgeSafetyConfig
    movement: MovementTimingConfig
    vision: VisionConfig
    robot_planning: RobotPlanningConfig
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


def _parse_non_negative_number(value: object, field_name: str, default: float) -> float:
    if value is None:
        return default
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value < 0:
        raise EdgeConfigError(f"{field_name} must be a non-negative number")
    result = float(value)
    if not math.isfinite(result):
        raise EdgeConfigError(f"{field_name} must be finite")
    return result


def _parse_required_positive_number(value: object, field_name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value <= 0:
        raise EdgeConfigError(f"{field_name} must be a positive number")
    return float(value)


def _parse_ratio(value: object, field_name: str, default: float) -> float:
    if value is None:
        return default
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 1:
        raise EdgeConfigError(f"{field_name} must be between 0 and 1")
    return float(value)


def _parse_positive_int(value: object, field_name: str, default: int) -> int:
    if value is None:
        return default
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise EdgeConfigError(f"{field_name} must be a positive integer")
    return value


def _parse_finite_number(value: object, field_name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise EdgeConfigError(f"{field_name} must be numeric")
    result = float(value)
    if not math.isfinite(result):
        raise EdgeConfigError(f"{field_name} must be finite")
    return result


def _parse_pose(value: object, field_name: str) -> RobotPose:
    if not isinstance(value, dict):
        raise EdgeConfigError(f"{field_name} must be an object")
    return RobotPose(
        x=_parse_finite_number(value.get("x"), f"{field_name}.x"),
        y=_parse_finite_number(value.get("y"), f"{field_name}.y"),
        z=_parse_finite_number(value.get("z"), f"{field_name}.z"),
    )


def _parse_image_point(value: object, field_name: str) -> ImagePoint:
    if isinstance(value, list):
        if len(value) != 2:
            raise EdgeConfigError(f"{field_name} must contain exactly two numbers")
        point = ImagePoint(
            x=_parse_finite_number(value[0], f"{field_name}[0]"),
            y=_parse_finite_number(value[1], f"{field_name}[1]"),
        )
    elif isinstance(value, dict):
        point = ImagePoint(
            x=_parse_finite_number(value.get("x"), f"{field_name}.x"),
            y=_parse_finite_number(value.get("y"), f"{field_name}.y"),
        )
    else:
        raise EdgeConfigError(f"{field_name} must be an object or two-item array")
    if point.x < 0 or point.y < 0:
        raise EdgeConfigError(f"{field_name} must have x/y >= 0")
    return point


def _parse_visual_pickup_calibration(value: object) -> VisualPickupCalibration | None:
    if value is None:
        return None
    if not isinstance(value, dict):
        raise EdgeConfigError("robotPlanning.calibration.visualCalibration must be an object")

    corners_raw = value.get("cornersPx")
    if not isinstance(corners_raw, dict):
        raise EdgeConfigError("robotPlanning.calibration.visualCalibration.cornersPx must be an object")

    return VisualPickupCalibration(
        pickup_width_cm=_parse_required_positive_number(
            value.get("pickupWidthCm"),
            "robotPlanning.calibration.visualCalibration.pickupWidthCm",
        ),
        pickup_height_cm=_parse_required_positive_number(
            value.get("pickupHeightCm"),
            "robotPlanning.calibration.visualCalibration.pickupHeightCm",
        ),
        cube_size_cm=_parse_required_positive_number(
            value.get("cubeSizeCm"),
            "robotPlanning.calibration.visualCalibration.cubeSizeCm",
        ),
        top_left=_parse_image_point(
            corners_raw.get("topLeft"),
            "robotPlanning.calibration.visualCalibration.cornersPx.topLeft",
        ),
        top_right=_parse_image_point(
            corners_raw.get("topRight"),
            "robotPlanning.calibration.visualCalibration.cornersPx.topRight",
        ),
        bottom_right=_parse_image_point(
            corners_raw.get("bottomRight"),
            "robotPlanning.calibration.visualCalibration.cornersPx.bottomRight",
        ),
        bottom_left=_parse_image_point(
            corners_raw.get("bottomLeft"),
            "robotPlanning.calibration.visualCalibration.cornersPx.bottomLeft",
        ),
    )


def _load_named_poses(path: Path) -> dict[str, object]:
    try:
        with path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
    except (OSError, json.JSONDecodeError) as exc:
        raise EdgeConfigError(f"Could not load robotPlanning.namedPosesPath from {path}: {exc}") from exc
    if not isinstance(payload, dict):
        raise EdgeConfigError("robotPlanning.namedPosesPath must point to a JSON object")
    return payload


def _parse_named_pose(
    value: object,
    field_name: str,
    *,
    named_poses: dict[str, object] | None = None,
    pose_name: object = None,
) -> RobotPose:
    if value is not None:
        return _parse_pose(value, field_name)
    if named_poses is None:
        raise EdgeConfigError(f"{field_name} is required")
    if not isinstance(pose_name, str) or not pose_name.strip():
        raise EdgeConfigError(f"{field_name} is required or provide a non-empty {field_name}Name")
    raw_pose = named_poses.get(pose_name.strip())
    if raw_pose is None:
        raise EdgeConfigError(f"{field_name}Name={pose_name!r} was not found in robotPlanning.namedPosesPath")
    return _parse_pose(raw_pose, f"robotPlanning.namedPoses.{pose_name.strip()}")


def _parse_robot_planning(value: object, config_directory: Path) -> RobotPlanningConfig:
    if value is None:
        return RobotPlanningConfig(enabled=False)
    if not isinstance(value, dict):
        raise EdgeConfigError("robotPlanning must be a JSON object")

    enabled = _require_bool(value.get("enabled"), "robotPlanning.enabled", False)
    if not enabled:
        return RobotPlanningConfig(enabled=False)

    safe_z = _parse_finite_number(value.get("safeZ"), "robotPlanning.safeZ")
    pick_z = _parse_finite_number(value.get("pickZ"), "robotPlanning.pickZ")
    drop_safe_z = _parse_finite_number(
        value.get("dropSafeZ", safe_z),
        "robotPlanning.dropSafeZ",
    )
    lift_z_delta = _parse_positive_number(
        value.get("liftZDelta"),
        "robotPlanning.liftZDelta",
        50.0,
    )
    pickup_offset_raw = value.get("pickupOffset", {})
    if pickup_offset_raw is None:
        pickup_offset_raw = {}
    if not isinstance(pickup_offset_raw, dict):
        raise EdgeConfigError("robotPlanning.pickupOffset must be a JSON object")
    pickup_offset = RobotPose(
        x=_parse_finite_number(pickup_offset_raw.get("x", 0), "robotPlanning.pickupOffset.x"),
        y=_parse_finite_number(pickup_offset_raw.get("y", 0), "robotPlanning.pickupOffset.y"),
        z=_parse_finite_number(pickup_offset_raw.get("z", 0), "robotPlanning.pickupOffset.z"),
    )
    named_poses: dict[str, object] | None = None
    named_poses_path_value = value.get("namedPosesPath")
    if named_poses_path_value is not None:
        if not isinstance(named_poses_path_value, str) or not named_poses_path_value.strip():
            raise EdgeConfigError("robotPlanning.namedPosesPath must be a non-empty string")
        named_poses_path = Path(named_poses_path_value)
        if not named_poses_path.is_absolute():
            named_poses_path = config_directory / named_poses_path
        named_poses = _load_named_poses(named_poses_path)

    ready_pose = _parse_named_pose(
        value.get("readyPose"),
        "robotPlanning.readyPose",
        named_poses=named_poses,
        pose_name=value.get("readyPoseName", "ready_to_take"),
    )
    reset_pose = _parse_named_pose(
        value.get("resetPose"),
        "robotPlanning.resetPose",
        named_poses=named_poses,
        pose_name=value.get("resetPoseName", "reset"),
    )

    calibration_raw = value.get("calibration")
    if not isinstance(calibration_raw, dict):
        raise EdgeConfigError("robotPlanning.calibration is required when planning is enabled")
    version = calibration_raw.get("version")
    if not isinstance(version, str) or not version.strip():
        raise EdgeConfigError("robotPlanning.calibration.version must be a non-empty string")
    corners_raw = calibration_raw.get("robotCorners")
    if not isinstance(corners_raw, dict):
        raise EdgeConfigError("robotPlanning.calibration.robotCorners must be an object")
    calibration = PickupRobotCalibration(
        version=version.strip(),
        image_roi=_parse_roi(
            calibration_raw.get("imageRoi"),
            "robotPlanning.calibration.imageRoi",
        ),
        visual=_parse_visual_pickup_calibration(
            calibration_raw.get("visualCalibration", calibration_raw.get("pickupCalibration")),
        ),
        top_left=_parse_pose(corners_raw.get("topLeft"), "robotPlanning.calibration.robotCorners.topLeft"),
        top_right=_parse_pose(corners_raw.get("topRight"), "robotPlanning.calibration.robotCorners.topRight"),
        bottom_right=_parse_pose(
            corners_raw.get("bottomRight"),
            "robotPlanning.calibration.robotCorners.bottomRight",
        ),
        bottom_left=_parse_pose(
            corners_raw.get("bottomLeft"),
            "robotPlanning.calibration.robotCorners.bottomLeft",
        ),
    )
    if calibration.image_roi is None and calibration.visual is None:
        raise EdgeConfigError(
            "robotPlanning.calibration requires visualCalibration or legacy imageRoi",
        )

    workspace_raw = value.get("workspace")
    if not isinstance(workspace_raw, dict):
        raise EdgeConfigError("robotPlanning.workspace is required when planning is enabled")
    workspace = WorkspaceLimits(
        min_x=_parse_finite_number(workspace_raw.get("minX"), "robotPlanning.workspace.minX"),
        max_x=_parse_finite_number(workspace_raw.get("maxX"), "robotPlanning.workspace.maxX"),
        min_y=_parse_finite_number(workspace_raw.get("minY"), "robotPlanning.workspace.minY"),
        max_y=_parse_finite_number(workspace_raw.get("maxY"), "robotPlanning.workspace.maxY"),
        min_z=_parse_finite_number(workspace_raw.get("minZ"), "robotPlanning.workspace.minZ"),
        max_z=_parse_finite_number(workspace_raw.get("maxZ"), "robotPlanning.workspace.maxZ"),
    )
    if (
        workspace.min_x >= workspace.max_x
        or workspace.min_y >= workspace.max_y
        or workspace.min_z >= workspace.max_z
    ):
        raise EdgeConfigError("robotPlanning.workspace min values must be below max values")

    return RobotPlanningConfig(
        enabled=True,
        safe_z=safe_z,
        pick_z=pick_z,
        drop_safe_z=drop_safe_z,
        lift_z_delta=lift_z_delta,
        pickup_offset=pickup_offset,
        ready_pose=ready_pose,
        reset_pose=reset_pose,
        calibration=calibration,
        workspace=workspace,
    )


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

    movement_raw = raw.get("movement", {})
    if not isinstance(movement_raw, dict):
        raise EdgeConfigError("movement must be a JSON object")
    movement_delay_seconds = _parse_non_negative_number(
        movement_raw.get("delay_seconds", movement_raw.get("delaySeconds")),
        "movement.delay_seconds",
        0.0,
    )
    movement = MovementTimingConfig(
        delay_seconds=movement_delay_seconds,
        pickup_hold_seconds=_parse_non_negative_number(
            movement_raw.get("pickup_hold_seconds", movement_raw.get("pickupHoldSeconds")),
            "movement.pickup_hold_seconds",
            movement_delay_seconds,
        ),
        release_hold_seconds=_parse_non_negative_number(
            movement_raw.get("release_hold_seconds", movement_raw.get("releaseHoldSeconds")),
            "movement.release_hold_seconds",
            movement_delay_seconds,
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

    if source == "camera" and "cameraIndex" not in vision_raw:
        raise EdgeConfigError("vision.cameraIndex is required when vision.source=camera")
    camera_index = vision_raw.get("cameraIndex", 0)
    if isinstance(camera_index, bool) or not isinstance(camera_index, int) or camera_index < 0:
        raise EdgeConfigError("vision.cameraIndex must be a non-negative integer")

    qr_raw = vision_raw.get("qr", {})
    if not isinstance(qr_raw, dict):
        raise EdgeConfigError("vision.qr must be a JSON object")
    qr_pattern = qr_raw.get("pattern", r"^TRUCK-.+$")
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
    min_width = _parse_positive_number(detection_raw.get("minWidth"), "vision.detection.minWidth", 8.0)
    max_width = _parse_positive_number(detection_raw.get("maxWidth"), "vision.detection.maxWidth", 160.0)
    if min_width > max_width:
        raise EdgeConfigError("vision.detection.minWidth must not exceed maxWidth")
    min_height = _parse_positive_number(detection_raw.get("minHeight"), "vision.detection.minHeight", 8.0)
    max_height = _parse_positive_number(detection_raw.get("maxHeight"), "vision.detection.maxHeight", 160.0)
    if min_height > max_height:
        raise EdgeConfigError("vision.detection.minHeight must not exceed maxHeight")
    min_fill_ratio = _parse_ratio(
        detection_raw.get("minFillRatio"),
        "vision.detection.minFillRatio",
        0.45,
    )
    min_aspect_ratio = _parse_positive_number(
        detection_raw.get("minAspectRatio"),
        "vision.detection.minAspectRatio",
        0.5,
    )
    max_aspect_ratio = _parse_positive_number(
        detection_raw.get("maxAspectRatio"),
        "vision.detection.maxAspectRatio",
        2.0,
    )
    if min_aspect_ratio > max_aspect_ratio:
        raise EdgeConfigError("vision.detection.minAspectRatio must not exceed maxAspectRatio")
    overlap_threshold = _parse_ratio(
        detection_raw.get("overlapThreshold"),
        "vision.detection.overlapThreshold",
        0.35,
    )
    size_valid = _require_bool(detection_raw.get("sizeValid"), "vision.detection.sizeValid", True)
    morphology_kernel_size = _parse_positive_int(
        detection_raw.get("morphologyKernelSize"),
        "vision.detection.morphologyKernelSize",
        5,
    )

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
        min_width=min_width,
        max_width=max_width,
        min_height=min_height,
        max_height=max_height,
        min_fill_ratio=min_fill_ratio,
        min_aspect_ratio=min_aspect_ratio,
        max_aspect_ratio=max_aspect_ratio,
        overlap_threshold=overlap_threshold,
        size_valid=size_valid,
        morphology_kernel_size=morphology_kernel_size,
        evidence_directory=evidence_directory,
    )
    robot_planning = _parse_robot_planning(raw.get("robotPlanning"), path.parent)

    return EdgeConfig(
        profile=profile,
        truck_code=truck_code,
        drop_zones_path=drop_zones_path,
        safety=safety,
        movement=movement,
        vision=vision,
        robot_planning=robot_planning,
        raw=raw,
    )

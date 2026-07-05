from __future__ import annotations

import argparse
import json
import os
import re
import tempfile
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from collections.abc import Callable

try:
    from .api_client import BackendClient
    from .config import EdgeConfig, load_edge_config
    from .edge_dry_run import load_snapshot, plan_to_dict
    from .models import CubeDetection, DetectionSnapshot, EdgeRunProfile, RobotActionPlan
    from .robot.drop_zone_adapter import DropZoneAdapter
    from .robot.maxarm_serial import MaxArmSerialAdapter, SerialFactory
    from .robot.planner import RobotActionPlanner
    from .vision.cube_selector import CubeSelector
    from .vision.evidence import cube_to_dict, snapshot_to_dict
except ImportError:
    from api_client import BackendClient
    from config import EdgeConfig, load_edge_config
    from edge_dry_run import load_snapshot, plan_to_dict
    from models import CubeDetection, DetectionSnapshot, EdgeRunProfile, RobotActionPlan
    from robot.drop_zone_adapter import DropZoneAdapter
    from robot.maxarm_serial import MaxArmSerialAdapter, SerialFactory
    from robot.planner import RobotActionPlanner
    from vision.cube_selector import CubeSelector
    from vision.evidence import cube_to_dict, snapshot_to_dict


class SingleCubePickDropError(RuntimeError):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(f"{code}: {message}")


PLACEHOLDER_CALIBRATION_VERSION = "REPLACE_WITH_LOCAL_CALIBRATION"
PLACEHOLDER_READY_POSE = {"x": 0.0, "y": 0.0, "z": 220.0}
PLACEHOLDER_RESET_POSE = {"x": 0.0, "y": 0.0, "z": 190.0}
PLACEHOLDER_IMAGE_ROI = {"x": 0, "y": 0, "w": 200, "h": 200}
PLACEHOLDER_VISUAL_CORNERS = {
    "topLeft": {"x": 0.0, "y": 0.0},
    "topRight": {"x": 200.0, "y": 0.0},
    "bottomRight": {"x": 200.0, "y": 200.0},
    "bottomLeft": {"x": 0.0, "y": 200.0},
}
PLACEHOLDER_ROBOT_CORNERS = {
    "topLeft": {"x": -100.0, "y": -100.0, "z": 100.0},
    "topRight": {"x": 100.0, "y": -100.0, "z": 100.0},
    "bottomRight": {"x": 100.0, "y": 100.0, "z": 100.0},
    "bottomLeft": {"x": -100.0, "y": 100.0, "z": 100.0},
}


@dataclass(frozen=True)
class HardwareGates:
    confirm_pick_drop: bool = False
    enable_hardware_motion: bool = False
    confirm_zone_clear: bool = False
    confirm_operator_present: bool = False
    confirm_emergency_stop_ready: bool = False
    confirm_suction: bool = False
    port: str | None = None
    baudrate: int = 115200
    require_dry_run_match: bool = True
    max_cubes: int = 1


class PickDropEvidenceWriter:
    def __init__(self, output_directory: Path) -> None:
        self.output_directory = output_directory

    def write(self, payload: dict[str, Any], run_id: str, prefix: str = "single-cube-pick-drop") -> str:
        self.output_directory.mkdir(parents=True, exist_ok=True)
        safe_run_id = re.sub(r"[^A-Za-z0-9_-]+", "-", run_id).strip("-") or "run"
        path = self.output_directory / f"{prefix}-{safe_run_id}.json"
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
        return str(path)


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _snapshot_signature(snapshot: DetectionSnapshot) -> str | None:
    value = snapshot.metadata.get("snapshotSignature")
    return value if isinstance(value, str) and value else None


def _load_edge_vision_snapshot(edge_vision_url: str) -> DetectionSnapshot:
    import requests

    url = edge_vision_url.rstrip("/") + "/vision/snapshot"
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict):
        raise SingleCubePickDropError("SNAPSHOT_UNAVAILABLE", "Edge Vision returned non-object JSON")
    raw_detections = payload.get("detections")
    if not isinstance(raw_detections, list):
        raise SingleCubePickDropError("SNAPSHOT_UNAVAILABLE", "Edge Vision snapshot has no detections array")
    detections = tuple(
        CubeDetection(
            color=str(item.get("color", "")).lower(),
            x=int(item.get("x", 0)),
            y=int(item.get("y", 0)),
            w=int(item.get("w", 0)),
            h=int(item.get("h", 0)),
            confidence=float(item["confidence"]) if item.get("confidence") is not None else None,
            metadata=item.get("metadata", {}) if isinstance(item.get("metadata"), dict) else {},
        )
        for item in raw_detections
        if isinstance(item, dict)
    )
    metadata = {
        "snapshotSignature": payload.get("snapshotSignature"),
        "qrDetected": payload.get("qrDetected"),
        "qrValid": payload.get("qrValid"),
        "qrStatus": payload.get("qrStatus"),
        "qrRoi": payload.get("qrRoi"),
        "cargoRoi": payload.get("cargoRoi"),
    }
    return DetectionSnapshot(
        run_id=str(payload.get("runId") or uuid.uuid4()),
        source=str(payload.get("source") or "opencv-camera"),
        truck_code=payload.get("truckCode") if isinstance(payload.get("truckCode"), str) else None,
        detections=detections,
        metadata=metadata,
    )


def _validate_snapshot(snapshot: DetectionSnapshot) -> None:
    if not snapshot.truck_code:
        raise SingleCubePickDropError("QR_INVALID", "A valid QR with truckCode is required")
    if snapshot.source != "simulation":
        if snapshot.metadata.get("qrDetected") is not True:
            raise SingleCubePickDropError("QR_NOT_DETECTED", "QR was not detected")
        if snapshot.metadata.get("qrValid") is not True or snapshot.metadata.get("qrStatus") != "OK":
            raise SingleCubePickDropError("QR_INVALID", "QR must be valid before hardware planning")
    if not snapshot.detections:
        raise SingleCubePickDropError("NO_CUBES_DETECTED", "At least one valid cube is required")


def _plan_one_cube(
    config: EdgeConfig,
    snapshot: DetectionSnapshot,
    adapter: DropZoneAdapter,
) -> tuple[CubeDetection, RobotActionPlan]:
    if config.profile is EdgeRunProfile.HARDWARE:
        raise SingleCubePickDropError("UNSAFE_PROFILE", "single-cube planning must use vision-dry-run config")
    _validate_snapshot(snapshot)
    selected_cube = CubeSelector().select(snapshot)
    selection = adapter.reserve(selected_cube.color, snapshot.run_id)
    try:
        plan = RobotActionPlanner().plan(
            snapshot,
            selected_cube,
            selection,
            config.robot_planning,
            EdgeRunProfile.VISION_DRY_RUN,
            dry_run=True,
        )
    except Exception:
        adapter.cancel(snapshot.run_id)
        raise
    return selected_cube, plan


def _plan_fingerprint(snapshot: DetectionSnapshot, plan: RobotActionPlan) -> dict[str, Any]:
    center_x, center_y = plan.selected_cube.center
    return {
        "runId": snapshot.run_id,
        "snapshotSignature": _snapshot_signature(snapshot),
        "truckCode": snapshot.truck_code,
        "selectedCubeColor": plan.selected_cube.color,
        "selectedCubeCenter": {"x": center_x, "y": center_y},
        "selectedCubeBoundingBox": {
            "x": plan.selected_cube.x,
            "y": plan.selected_cube.y,
            "w": plan.selected_cube.w,
            "h": plan.selected_cube.h,
        },
        "pickupPositionCm": plan.pickup_position_cm.as_dict() if plan.pickup_position_cm else None,
        "visualCalibrationVersion": plan.metadata.get("visualCalibrationVersion"),
        "visualCalibrationUsed": bool(plan.metadata.get("visualCalibrationUsed")),
        "homographyUsed": bool(plan.metadata.get("homographyUsed")),
        "pickupOffset": plan.metadata.get("pickupOffset", {"x": 0.0, "y": 0.0, "z": 0.0}),
        "pickupTargetBase": plan.metadata.get("pickupTargetBase"),
        "pickupTarget": plan.pickup_target.as_dict(),
        "pickupSafe": plan.pickup_safe.as_dict(),
        "dropZoneCode": plan.drop_zone.slot.code,
        "positionOrder": plan.drop_zone.slot.position_order,
        "commandsPreview": [step.command_preview for step in plan.steps],
    }


def _load_dry_run_fingerprint(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SingleCubePickDropError("DRY_RUN_REQUIRED", f"Could not load dry-run evidence: {exc}") from exc
    if not isinstance(payload, dict) or payload.get("status") != "DRY_RUN_PLANNED":
        raise SingleCubePickDropError("DRY_RUN_REQUIRED", "Dry-run evidence must have status=DRY_RUN_PLANNED")
    fingerprint = payload.get("planFingerprint")
    if not isinstance(fingerprint, dict):
        raise SingleCubePickDropError("DRY_RUN_REQUIRED", "Dry-run evidence has no planFingerprint")
    return fingerprint


def _assert_dry_run_match(expected: dict[str, Any], actual: dict[str, Any]) -> None:
    keys = (
        "snapshotSignature",
        "truckCode",
        "selectedCubeColor",
        "selectedCubeCenter",
        "selectedCubeBoundingBox",
        "pickupPositionCm",
        "visualCalibrationVersion",
        "visualCalibrationUsed",
        "homographyUsed",
        "pickupOffset",
        "pickupTarget",
        "pickupSafe",
        "dropZoneCode",
        "positionOrder",
        "commandsPreview",
    )
    mismatches = [key for key in keys if expected.get(key) != actual.get(key)]
    if mismatches:
        raise SingleCubePickDropError(
            "DRY_RUN_MISMATCH",
            f"Dry-run evidence does not match current plan: {', '.join(mismatches)}",
        )


def _validate_gates(gates: HardwareGates, *, dry_run_evidence_path: Path | None) -> None:
    if gates.max_cubes != 1:
        raise SingleCubePickDropError("MAX_CUBES_INVALID", "--max-cubes must be 1")
    if not gates.require_dry_run_match:
        raise SingleCubePickDropError("DRY_RUN_MATCH_REQUIRED", "dry-run match is mandatory")
    missing = []
    if not gates.confirm_pick_drop:
        missing.append("--confirm-pick-drop")
    if not gates.enable_hardware_motion:
        missing.append("--enable-hardware-motion")
    if not gates.confirm_zone_clear:
        missing.append("--confirm-zone-clear")
    if not gates.confirm_operator_present:
        missing.append("--confirm-operator-present")
    if not gates.confirm_emergency_stop_ready:
        missing.append("--confirm-emergency-stop-ready")
    if not gates.confirm_suction:
        missing.append("--confirm-suction")
    if not gates.port:
        missing.append("--port COMx")
    if dry_run_evidence_path is None:
        missing.append("--dry-run-evidence")
    if missing:
        raise SingleCubePickDropError("CONFIRMATION_REQUIRED", "Missing gates: " + ", ".join(missing))


def _pose_as_plain_dict(pose: Any) -> dict[str, float] | None:
    if pose is None:
        return None
    return {"x": float(pose.x), "y": float(pose.y), "z": float(pose.z)}


def _same_number_triplet(left: dict[str, object] | None, right: dict[str, object]) -> bool:
    if left is None:
        return False
    try:
        return all(abs(float(left[axis]) - float(right[axis])) < 0.001 for axis in ("x", "y", "z"))
    except (KeyError, TypeError, ValueError):
        return False


def _is_placeholder_robot_corners(raw_config: dict[str, Any]) -> bool:
    robot_planning = raw_config.get("robotPlanning")
    if not isinstance(robot_planning, dict):
        return False
    calibration = robot_planning.get("calibration")
    if not isinstance(calibration, dict):
        return False
    corners = calibration.get("robotCorners")
    if not isinstance(corners, dict):
        return False
    return all(
        _same_number_triplet(corners.get(corner_name), placeholder_pose)
        for corner_name, placeholder_pose in PLACEHOLDER_ROBOT_CORNERS.items()
    )


def _is_placeholder_image_roi(raw_config: dict[str, Any]) -> bool:
    robot_planning = raw_config.get("robotPlanning")
    if not isinstance(robot_planning, dict):
        return False
    calibration = robot_planning.get("calibration")
    if not isinstance(calibration, dict):
        return False
    image_roi = calibration.get("imageRoi")
    if not isinstance(image_roi, dict):
        return False
    try:
        return all(int(image_roi[key]) == int(value) for key, value in PLACEHOLDER_IMAGE_ROI.items())
    except (KeyError, TypeError, ValueError):
        return False


def _same_number_pair(left: dict[str, object] | list[object] | None, right: dict[str, object]) -> bool:
    if left is None:
        return False
    try:
        if isinstance(left, list):
            return abs(float(left[0]) - float(right["x"])) < 0.001 and abs(float(left[1]) - float(right["y"])) < 0.001
        return abs(float(left["x"]) - float(right["x"])) < 0.001 and abs(float(left["y"]) - float(right["y"])) < 0.001
    except (IndexError, KeyError, TypeError, ValueError):
        return False


def _raw_visual_calibration(raw_config: dict[str, Any]) -> dict[str, Any] | None:
    robot_planning = raw_config.get("robotPlanning")
    if not isinstance(robot_planning, dict):
        return None
    calibration = robot_planning.get("calibration")
    if not isinstance(calibration, dict):
        return None
    visual = calibration.get("visualCalibration", calibration.get("pickupCalibration"))
    return visual if isinstance(visual, dict) else None


def _is_placeholder_visual_corners(raw_config: dict[str, Any]) -> bool:
    visual = _raw_visual_calibration(raw_config)
    if visual is None:
        return False
    corners = visual.get("cornersPx")
    if not isinstance(corners, dict):
        return False
    return all(
        _same_number_pair(corners.get(corner_name), placeholder)
        for corner_name, placeholder in PLACEHOLDER_VISUAL_CORNERS.items()
    )


def _hardware_config_errors(config: EdgeConfig) -> list[str]:
    errors: list[str] = []
    planning = config.robot_planning
    calibration = planning.calibration
    if calibration is None:
        errors.append("MISSING_REAL_PICKUP_ROBOT_CALIBRATION")
    else:
        if calibration.version.strip().upper() == PLACEHOLDER_CALIBRATION_VERSION:
            errors.append("MISSING_REAL_PICKUP_ROBOT_CALIBRATION")
        if calibration.visual is None:
            errors.append("MISSING_VISUAL_PICKUP_CALIBRATION")
        elif _is_placeholder_visual_corners(config.raw):
            errors.append("PLACEHOLDER_VISUAL_CORNERS")
        if _is_placeholder_robot_corners(config.raw):
            errors.append("PLACEHOLDER_ROBOT_CORNERS")
        if calibration.visual is None and calibration.image_roi is not None:
            errors.append("LEGACY_IMAGE_ROI_ONLY")

    if _same_number_triplet(_pose_as_plain_dict(planning.ready_pose), PLACEHOLDER_READY_POSE):
        errors.append("PLACEHOLDER_READY_POSE")
    if _same_number_triplet(_pose_as_plain_dict(planning.reset_pose), PLACEHOLDER_RESET_POSE):
        errors.append("PLACEHOLDER_RESET_POSE")

    if (
        planning.safe_z is None
        or planning.pick_z is None
        or planning.drop_safe_z is None
        or planning.lift_z_delta is None
        or planning.safe_z <= planning.pick_z
        or planning.drop_safe_z <= 0
        or planning.lift_z_delta <= 0
    ):
        errors.append("INVALID_Z_LIMITS")
    if planning.workspace is None:
        errors.append("INVALID_WORKSPACE")
    if config.drop_zones_path.name in {"drop_zones.example.json", "drop_zones.dry-run.example.json"}:
        errors.append("PLACEHOLDER_DROP_ZONES")
    return errors


def _assert_hardware_config_ready(config: EdgeConfig) -> None:
    errors = _hardware_config_errors(config)
    if errors:
        code = "MISSING_REAL_PICKUP_ROBOT_CALIBRATION" if "MISSING_REAL_PICKUP_ROBOT_CALIBRATION" in errors else errors[0]
        raise SingleCubePickDropError(
            code,
            "Hardware pick/drop blocked by unsafe local configuration: " + ", ".join(errors),
        )


def _backend_hardware_payload(
    session_id: str,
    snapshot: DetectionSnapshot,
    plan: RobotActionPlan,
    execution: dict[str, Any],
) -> dict[str, Any]:
    fingerprint = _plan_fingerprint(snapshot, plan)
    payload = {
        "sessionId": session_id,
        "actionType": "PICK_AND_DROP",
        "status": "SUCCESS" if execution.get("dropExecuted") else "ERROR",
        "mode": "hardware",
        "color": plan.selected_cube.color,
        "metadata": {
            **fingerprint,
            "dryRun": False,
            "profile": "hardware",
            "selectedCube": cube_to_dict(plan.selected_cube),
            "pickupPositionCm": plan.pickup_position_cm.as_dict() if plan.pickup_position_cm else None,
            "pickupOffset": plan.metadata.get("pickupOffset"),
            "pickupTargetBase": plan.metadata.get("pickupTargetBase"),
            "visualCalibrationVersion": plan.metadata.get("visualCalibrationVersion"),
            "visualCalibrationUsed": bool(plan.metadata.get("visualCalibrationUsed")),
            "homographyUsed": bool(plan.metadata.get("homographyUsed")),
            "pickupTarget": plan.pickup_target.as_dict(),
            "pickupSafe": plan.pickup_safe.as_dict(),
            "movementDelaySeconds": execution.get("movementDelaySeconds"),
            "pickupHoldSeconds": execution.get("pickupHoldSeconds"),
            "releaseHoldSeconds": execution.get("releaseHoldSeconds"),
            "successMeaning": execution.get("successMeaning"),
            "dropZonePose": plan.drop_zone.slot.pose.as_dict(),
            "releaseConfirmed": execution.get("releaseConfirmed", False),
            "occupiedPersisted": execution.get("occupiedPersisted", False),
            "statePersisted": execution.get("occupiedPersisted", False),
            "serialOpened": execution.get("serialOpened", False),
            "hardwareMovement": execution.get("hardwareMovement", False),
            "suctionActivated": execution.get("suctionActivated", False),
            "pickupExecuted": execution.get("pickupExecuted", False),
            "dropExecuted": execution.get("dropExecuted", False),
            "firmwareResponses": execution.get("firmwareResponses", []),
            "errorCode": execution.get("errorCode"),
        },
    }
    return _json_safe(payload)


def _json_safe(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, bool) or isinstance(value, str) or isinstance(value, int):
        return value
    if isinstance(value, float):
        if value != value or value in (float("inf"), float("-inf")):
            raise SingleCubePickDropError("BACKEND_PAYLOAD_INVALID", "Backend payload contains non-finite number")
        return value
    if isinstance(value, list):
        return [_json_safe(item) for item in value if item is not None]
    if isinstance(value, tuple):
        return [_json_safe(item) for item in value if item is not None]
    if isinstance(value, dict):
        return {str(key): _json_safe(child) for key, child in value.items() if child is not None}
    raise SingleCubePickDropError(
        "BACKEND_PAYLOAD_INVALID",
        f"Backend payload contains non-JSON value of type {type(value).__name__}",
    )


def _post_step_delay_seconds(
    step_name: str,
    *,
    delay_seconds: float,
    pickup_hold_seconds: float,
    release_hold_seconds: float,
) -> float:
    if step_name == "cube_target_pick":
        return pickup_hold_seconds
    if step_name == "drop_zone_release":
        return release_hold_seconds
    return delay_seconds


def run_single_cube_pick_drop(
    config_path: Path,
    *,
    snapshot: DetectionSnapshot,
    plan_only: bool = False,
    dry_run_evidence_path: Path | None = None,
    gates: HardwareGates | None = None,
    serial_factory: SerialFactory | None = None,
    sleeper: Callable[[float], None] = time.sleep,
    evidence_writer: PickDropEvidenceWriter | None = None,
    backend_client: BackendClient | None = None,
) -> dict[str, Any]:
    config = load_edge_config(config_path)
    if config.robot_planning.enabled is not True:
        raise SingleCubePickDropError("MISSING_PLANNING_CONFIG", "robotPlanning.enabled=true is required")

    writer = evidence_writer or PickDropEvidenceWriter(config.vision.evidence_directory)
    adapter = DropZoneAdapter(
        config.drop_zones_path,
        EdgeRunProfile.HARDWARE,
        persist_hardware_state=not plan_only,
    )
    selected_cube, plan = _plan_one_cube(config, snapshot, adapter)
    fingerprint = _plan_fingerprint(snapshot, plan)

    base_payload: dict[str, Any] = {
        "status": "DRY_RUN_PLANNED" if plan_only else "PLANNED",
        "timestamp": _utc_now(),
        "snapshot": snapshot_to_dict(snapshot),
        "selectedCube": cube_to_dict(selected_cube),
        "dropZone": {
            "code": plan.drop_zone.slot.code,
            "color": plan.drop_zone.slot.color,
            "positionOrder": plan.drop_zone.slot.position_order,
            "pose": plan.drop_zone.slot.pose.as_dict(),
            "reservedInMemory": True,
            "occupiedBeforeRelease": plan.drop_zone.slot.occupied,
        },
        "robotActionPlan": plan_to_dict(plan),
        "pickupPositionCm": plan.pickup_position_cm.as_dict() if plan.pickup_position_cm else None,
        "visualCalibrationVersion": plan.metadata.get("visualCalibrationVersion"),
        "visualCalibrationUsed": bool(plan.metadata.get("visualCalibrationUsed")),
        "homographyUsed": bool(plan.metadata.get("homographyUsed")),
        "pickupOffset": plan.metadata.get("pickupOffset", {"x": 0.0, "y": 0.0, "z": 0.0}),
        "pickupTargetBase": plan.metadata.get("pickupTargetBase"),
        "pickupTarget": plan.pickup_target.as_dict(),
        "pickupSafe": plan.pickup_safe.as_dict(),
        "movementDelaySeconds": config.movement.delay_seconds,
        "pickupHoldSeconds": config.movement.pickup_hold_seconds,
        "releaseHoldSeconds": config.movement.release_hold_seconds,
        "successMeaning": "command_execution_only",
        "planFingerprint": fingerprint,
        "serialOpened": False,
        "hardwareMovement": False,
        "maxCubes": 1,
        "safetyWarnings": _hardware_config_errors(config),
    }

    if plan_only:
        adapter.cancel(snapshot.run_id)
        evidence_path = writer.write(base_payload, snapshot.run_id, prefix="single-cube-plan-only")
        return {**base_payload, "evidence": {"json": evidence_path}, "reservationOutcome": "CANCELLED_AFTER_DRY_RUN"}

    gates = gates or HardwareGates()
    _validate_gates(gates, dry_run_evidence_path=dry_run_evidence_path)
    expected = _load_dry_run_fingerprint(dry_run_evidence_path)
    _assert_dry_run_match(expected, fingerprint)
    _assert_hardware_config_ready(config)

    serial = MaxArmSerialAdapter(
        gates.port or "",
        gates.baudrate,
        5.0,
        serial_factory=serial_factory,
    )
    execution: dict[str, Any] = {
        "serialOpened": False,
        "hardwareMovement": False,
        "suctionActivated": False,
        "pickupExecuted": False,
        "dropExecuted": False,
        "releaseConfirmed": False,
        "occupiedPersisted": False,
        "firmwareResponses": [],
        "movementDelaySeconds": config.movement.delay_seconds,
        "pickupHoldSeconds": config.movement.pickup_hold_seconds,
        "releaseHoldSeconds": config.movement.release_hold_seconds,
        "successMeaning": "command_execution_only",
    }
    backend_action: dict[str, Any] | None = None
    try:
        serial.open()
        execution["serialOpened"] = serial.is_open
        for step in plan.steps:
            step_started_at = _utc_now()
            step_started_monotonic = time.monotonic()
            result = serial.send_pose(step.pose, suction=step.suction, allow_suction=gates.confirm_suction)
            response_received_at = _utc_now()
            elapsed_ms = round((time.monotonic() - step_started_monotonic) * 1000, 3)
            post_step_delay_seconds = _post_step_delay_seconds(
                step.name,
                delay_seconds=config.movement.delay_seconds,
                pickup_hold_seconds=config.movement.pickup_hold_seconds,
                release_hold_seconds=config.movement.release_hold_seconds,
            )
            execution["hardwareMovement"] = True
            execution["firmwareResponses"].append(
                {
                    "step": step.name,
                    "commandSent": result.command_sent,
                    "firmwareResponse": result.firmware_response,
                    "success": result.success,
                    "postStepDelaySeconds": post_step_delay_seconds,
                    "stepStartedAt": step_started_at,
                    "responseReceivedAt": response_received_at,
                    "elapsedMs": elapsed_ms,
                }
            )
            if step.suction == 1:
                execution["suctionActivated"] = True
            if step.name == "cube_target_pick":
                execution["pickupExecuted"] = True
            if step.name == "drop_zone_release":
                execution["releaseConfirmed"] = True
                execution["dropExecuted"] = True
                adapter.confirm(snapshot.run_id)
                execution["occupiedPersisted"] = True
            if execution["hardwareMovement"] and post_step_delay_seconds > 0:
                sleeper(post_step_delay_seconds)

        if backend_client is not None and snapshot.truck_code:
            session = backend_client.create_session(snapshot.truck_code).get("session", {})
            session_id = session.get("id") if isinstance(session, dict) else None
            if isinstance(session_id, str) and session_id:
                backend_action = backend_client.register_robot_action(
                    _backend_hardware_payload(session_id, snapshot, plan, execution)
                )
    except Exception as exc:
        if not execution["releaseConfirmed"]:
            try:
                adapter.cancel(snapshot.run_id)
            except Exception:
                pass
        execution["errorCode"] = getattr(exc, "code", "PICK_DROP_FAILED")
        execution["errorMessage"] = str(exc)
        payload = {**base_payload, **execution, "status": "ERROR"}
        evidence_path = writer.write(payload, snapshot.run_id)
        raise SingleCubePickDropError(str(execution["errorCode"]), str(exc)) from exc
    finally:
        serial.close()

    payload = {
        **base_payload,
        **execution,
        "status": "SUCCESS",
        "serialClosed": not serial.is_open,
        "backend": backend_action,
    }
    evidence_path = writer.write(payload, snapshot.run_id)
    return {**payload, "evidence": {"json": evidence_path}}


def _resolve_snapshot(args: argparse.Namespace) -> DetectionSnapshot:
    if args.snapshot:
        return load_snapshot(Path(args.snapshot))
    if args.edge_vision_url:
        return _load_edge_vision_snapshot(args.edge_vision_url)
    raise SingleCubePickDropError("SNAPSHOT_REQUIRED", "Use --snapshot or --edge-vision-url")


def main() -> None:
    parser = argparse.ArgumentParser(description="Plan or execute one controlled MaxArm pick/drop.")
    parser.add_argument("--config", required=True)
    parser.add_argument("--snapshot", help="DetectionSnapshot JSON generated by Edge Vision.")
    parser.add_argument("--edge-vision-url", help="Read latest snapshot from Edge Vision API.")
    parser.add_argument("--plan-only", action="store_true", help="Generate the mandatory dry-run evidence only.")
    parser.add_argument("--dry-run-evidence", help="Plan-only evidence JSON to match before hardware.")
    parser.add_argument("--port", help="Explicit COM port, required for hardware.")
    parser.add_argument("--baudrate", type=int, default=115200, help="Serial baudrate. Default: 115200.")
    parser.add_argument("--max-cubes", type=int, default=1)
    parser.add_argument("--confirm-pick-drop", action="store_true")
    parser.add_argument("--enable-hardware-motion", action="store_true")
    parser.add_argument("--confirm-zone-clear", action="store_true")
    parser.add_argument("--confirm-operator-present", action="store_true")
    parser.add_argument("--confirm-emergency-stop-ready", action="store_true")
    parser.add_argument("--confirm-suction", action="store_true")
    parser.add_argument("--sync-backend", action="store_true")
    parser.add_argument("--backend-url", default=os.getenv("BACKEND_URL", "http://localhost:3000"))
    args = parser.parse_args()

    result = run_single_cube_pick_drop(
        Path(args.config),
        snapshot=_resolve_snapshot(args),
        plan_only=args.plan_only,
        dry_run_evidence_path=Path(args.dry_run_evidence) if args.dry_run_evidence else None,
        gates=HardwareGates(
            confirm_pick_drop=args.confirm_pick_drop,
            enable_hardware_motion=args.enable_hardware_motion,
            confirm_zone_clear=args.confirm_zone_clear,
            confirm_operator_present=args.confirm_operator_present,
            confirm_emergency_stop_ready=args.confirm_emergency_stop_ready,
            confirm_suction=args.confirm_suction,
            port=args.port,
            baudrate=args.baudrate,
            max_cubes=args.max_cubes,
        ),
        backend_client=BackendClient(args.backend_url) if args.sync_backend else None,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

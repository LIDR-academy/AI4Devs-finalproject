from __future__ import annotations

import argparse
import json
import os
import time
import uuid
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any
from collections.abc import Callable

try:
    from .api_client import BackendClient
    from .config import EdgeConfig, load_edge_config
    from .edge_dry_run import load_snapshot
    from .models import CubeDetection, DetectionSnapshot, EdgeRunProfile, RobotActionPlan
    from .robot.drop_zone_adapter import DropZoneAdapter
    from .robot.drop_zone_planner import DropZoneUnavailableError
    from .robot.maxarm_serial import MaxArmSerialAdapter, SerialFactory
    from .robot.planner import RobotActionPlanner
    from .single_cube_pick_drop import (
        PickDropEvidenceWriter,
        _assert_hardware_config_ready,
        _hardware_config_errors,
        _json_safe,
        _load_edge_vision_snapshot,
        _post_step_delay_seconds,
        _snapshot_signature,
        _utc_now,
    )
    from .vision.cube_selector import CubeSelector
    from .vision.evidence import cube_to_dict, snapshot_to_dict
except ImportError:
    from api_client import BackendClient
    from config import EdgeConfig, load_edge_config
    from edge_dry_run import load_snapshot
    from models import CubeDetection, DetectionSnapshot, EdgeRunProfile, RobotActionPlan
    from robot.drop_zone_adapter import DropZoneAdapter
    from robot.drop_zone_planner import DropZoneUnavailableError
    from robot.maxarm_serial import MaxArmSerialAdapter, SerialFactory
    from robot.planner import RobotActionPlanner
    from single_cube_pick_drop import (
        PickDropEvidenceWriter,
        _assert_hardware_config_ready,
        _hardware_config_errors,
        _json_safe,
        _load_edge_vision_snapshot,
        _post_step_delay_seconds,
        _snapshot_signature,
        _utc_now,
    )
    from vision.cube_selector import CubeSelector
    from vision.evidence import cube_to_dict, snapshot_to_dict


class MultiCubePickDropError(RuntimeError):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(f"{code}: {message}")


@dataclass(frozen=True)
class MultiHardwareGates:
    confirm_multi_pick_drop: bool = False
    enable_hardware_motion: bool = False
    confirm_zone_clear: bool = False
    confirm_operator_present: bool = False
    confirm_emergency_stop_ready: bool = False
    confirm_suction: bool = False
    port: str | None = None
    baudrate: int = 115200


@dataclass(frozen=True)
class PhysicalConfirmationConfig:
    enabled: bool = False
    method: str = "post_drop_vision_count_delta"
    vision_settle_seconds: float = 1.0
    expected_total_delta: int = -1
    expected_color_delta: int = -1


@dataclass(frozen=True)
class PickupRetryConfig:
    enabled: bool = False
    max_attempts: int = 1
    z_step: float = -2.0
    min_pick_z: float | None = None


def _action_run_id(run_id: str, sequence_number: int) -> str:
    return f"{run_id}-multi-{sequence_number}"


def _snapshot_for_action(snapshot: DetectionSnapshot, run_id: str) -> DetectionSnapshot:
    return DetectionSnapshot(
        run_id=run_id,
        source=snapshot.source,
        detections=snapshot.detections,
        truck_code=snapshot.truck_code,
        frame_source=snapshot.frame_source,
        frame_id=snapshot.frame_id,
        calibration_version=snapshot.calibration_version,
        metadata=snapshot.metadata,
        captured_at=snapshot.captured_at,
    )


def _raw_block(config: EdgeConfig, key: str) -> dict[str, Any]:
    value = config.raw.get(key, {})
    return value if isinstance(value, dict) else {}


def _bool_value(value: Any, default: bool) -> bool:
    return value if isinstance(value, bool) else default


def _number_value(value: Any, default: float) -> float:
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) else default


def _int_value(value: Any, default: int) -> int:
    return int(value) if isinstance(value, int) and not isinstance(value, bool) else default


def _physical_confirmation_config(config: EdgeConfig) -> PhysicalConfirmationConfig:
    raw = _raw_block(config, "physicalConfirmation")
    return PhysicalConfirmationConfig(
        enabled=_bool_value(raw.get("enabled"), False),
        method=str(raw.get("method", "post_drop_vision_count_delta")),
        vision_settle_seconds=max(0.0, _number_value(raw.get("visionSettleSeconds"), 1.0)),
        expected_total_delta=_int_value(raw.get("expectedTotalDelta"), -1),
        expected_color_delta=_int_value(raw.get("expectedColorDelta"), -1),
    )


def _pickup_retry_config(config: EdgeConfig) -> PickupRetryConfig:
    raw = _raw_block(config, "pickupRetry")
    configured_max_attempts = max(1, _int_value(raw.get("maxAttempts"), 3))
    enabled = _bool_value(raw.get("enabled"), False)
    return PickupRetryConfig(
        enabled=enabled,
        max_attempts=configured_max_attempts if enabled else 1,
        z_step=_number_value(raw.get("zStep"), -2.0),
        min_pick_z=(
            _number_value(raw.get("minPickZ"), 0.0)
            if raw.get("minPickZ") is not None
            else None
        ),
    )


def _retry_pick_z_values(base_pick_z: float, retry: PickupRetryConfig) -> list[float]:
    values: list[float] = []
    for attempt_index in range(retry.max_attempts):
        candidate = base_pick_z + retry.z_step * attempt_index
        if retry.min_pick_z is not None:
            candidate = max(retry.min_pick_z, candidate)
        if values and candidate == values[-1]:
            break
        values.append(candidate)
    return values


def _counts_by_color(snapshot: DetectionSnapshot) -> dict[str, int]:
    counts = {color: 0 for color in ("red", "blue", "yellow", "green")}
    for cube in snapshot.detections:
        if cube.color in counts:
            counts[cube.color] += 1
    return counts


def _build_physical_confirmation(
    *,
    config: PhysicalConfirmationConfig,
    selected_color: str,
    before_snapshot: DetectionSnapshot,
    after_snapshot: DetectionSnapshot | None,
    attempt: int,
    pick_z: float,
) -> dict[str, Any]:
    before_counts = _counts_by_color(before_snapshot)
    total_before = len(before_snapshot.detections)
    color_before = before_counts.get(selected_color, 0)
    expected_total_after = total_before + config.expected_total_delta
    expected_color_after = color_before + config.expected_color_delta

    base = {
        "enabled": config.enabled,
        "method": config.method,
        "attempt": attempt,
        "pickZ": pick_z,
        "selectedCubeColor": selected_color,
        "totalBefore": total_before,
        "colorBefore": color_before,
        "expectedTotalAfter": expected_total_after,
        "expectedColorAfter": expected_color_after,
        "snapshotBeforeSignature": _snapshot_signature(before_snapshot),
        "snapshotAfterSignature": _snapshot_signature(after_snapshot) if after_snapshot else None,
    }
    if not config.enabled:
        return {**base, "status": "DISABLED", "reason": "Physical confirmation disabled"}
    if after_snapshot is None:
        return {**base, "status": "INCONCLUSIVE", "reason": "No post-drop vision snapshot available"}

    after_counts = _counts_by_color(after_snapshot)
    total_after = len(after_snapshot.detections)
    color_after = after_counts.get(selected_color, 0)
    confirmed = total_after == expected_total_after and color_after == expected_color_after
    return {
        **base,
        "totalAfter": total_after,
        "colorAfter": color_after,
        "status": "CONFIRMED" if confirmed else "FAILED",
        "reason": (
            "Total and color counts decreased by 1"
            if confirmed
            else "Expected total count to decrease by 1 and selected color count to decrease by 1"
        ),
    }


def _config_with_pick_z(config: EdgeConfig, pick_z: float) -> EdgeConfig:
    return replace(config, robot_planning=replace(config.robot_planning, pick_z=pick_z))


def _cube_center(cube: CubeDetection) -> dict[str, float]:
    center_x, center_y = cube.center
    return {"x": center_x, "y": center_y}


def _cube_box(cube: CubeDetection) -> dict[str, int]:
    return {"x": cube.x, "y": cube.y, "w": cube.w, "h": cube.h}


def _planned_action_dict(sequence_number: int, plan: RobotActionPlan) -> dict[str, Any]:
    cube = plan.selected_cube
    slot = plan.drop_zone.slot
    return {
        "sequenceNumber": sequence_number,
        "selectedCube": cube_to_dict(cube),
        "selectedCubeColor": cube.color,
        "selectedCubeCenter": _cube_center(cube),
        "selectedCubeBoundingBox": _cube_box(cube),
        "pickupPositionCm": plan.pickup_position_cm.as_dict() if plan.pickup_position_cm else None,
        "pickupOffset": plan.metadata.get("pickupOffset", {"x": 0.0, "y": 0.0, "z": 0.0}),
        "pickupTargetBase": plan.metadata.get("pickupTargetBase"),
        "pickupTarget": plan.pickup_target.as_dict(),
        "pickupSafe": plan.pickup_safe.as_dict(),
        "dropZoneCode": slot.code,
        "dropZonePose": slot.pose.as_dict(),
        "positionOrder": slot.position_order,
        "commandsPreview": [step.command_preview for step in plan.steps],
        "visualCalibrationVersion": plan.metadata.get("visualCalibrationVersion"),
        "visualCalibrationUsed": bool(plan.metadata.get("visualCalibrationUsed")),
        "homographyUsed": bool(plan.metadata.get("homographyUsed")),
    }


def _fingerprint(planned_actions: list[dict[str, Any]], snapshot: DetectionSnapshot, max_cubes: int) -> dict[str, Any]:
    return {
        "snapshotSignature": _snapshot_signature(snapshot),
        "truckCode": snapshot.truck_code,
        "maxCubes": max_cubes,
        "plannedActions": [
            {
                key: action.get(key)
                for key in (
                    "sequenceNumber",
                    "selectedCubeColor",
                    "selectedCubeCenter",
                    "selectedCubeBoundingBox",
                    "pickupPositionCm",
                    "pickupOffset",
                    "pickupTargetBase",
                    "pickupTarget",
                    "pickupSafe",
                    "dropZoneCode",
                    "dropZonePose",
                    "positionOrder",
                    "commandsPreview",
                    "visualCalibrationVersion",
                    "visualCalibrationUsed",
                    "homographyUsed",
                )
            }
            for action in planned_actions
        ],
    }


def _load_multi_fingerprint(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise MultiCubePickDropError("DRY_RUN_REQUIRED", f"Could not load dry-run evidence: {exc}") from exc
    if not isinstance(payload, dict) or payload.get("status") != "DRY_RUN_PLANNED":
        raise MultiCubePickDropError("DRY_RUN_REQUIRED", "Dry-run evidence must have status=DRY_RUN_PLANNED")
    fingerprint = payload.get("planFingerprint")
    if not isinstance(fingerprint, dict):
        raise MultiCubePickDropError("DRY_RUN_REQUIRED", "Dry-run evidence has no planFingerprint")
    return fingerprint


def _assert_multi_fingerprint_match(expected: dict[str, Any], actual: dict[str, Any]) -> None:
    if expected != actual:
        raise MultiCubePickDropError("DRY_RUN_MISMATCH", "Dry-run evidence does not match current multi-cube plan")


def _validate_snapshot_for_multi(snapshot: DetectionSnapshot) -> str | None:
    if not snapshot.truck_code:
        return "NO_VALID_QR"
    if snapshot.source != "simulation":
        if snapshot.metadata.get("qrDetected") is not True:
            return "NO_VALID_QR"
        if snapshot.metadata.get("qrValid") is not True or snapshot.metadata.get("qrStatus") != "OK":
            return "NO_VALID_QR"
    if not snapshot.detections:
        return "NO_CUBES_DETECTED"
    return None


def _validate_gates(gates: MultiHardwareGates) -> None:
    missing = []
    if not gates.confirm_multi_pick_drop:
        missing.append("--confirm-multi-pick-drop")
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
    if missing:
        raise MultiCubePickDropError("CONFIRMATION_REQUIRED", "Missing gates: " + ", ".join(missing))


def _base_payload(
    *,
    run_id: str,
    status: str,
    snapshot: DetectionSnapshot,
    max_cubes: int,
    planned_actions: list[dict[str, Any]],
    skipped_cubes: list[dict[str, Any]],
    config: EdgeConfig,
) -> dict[str, Any]:
    physical_config = _physical_confirmation_config(config)
    retry_config = _pickup_retry_config(config)
    return {
        "status": status,
        "timestamp": _utc_now(),
        "runId": run_id,
        "snapshotSignature": _snapshot_signature(snapshot),
        "truckCode": snapshot.truck_code,
        "maxCubes": max_cubes,
        "totalDetectedCubes": len(snapshot.detections),
        "totalPlannedCubes": len(planned_actions),
        "totalExecutedCubes": 0,
        "totalSkippedCubes": len(skipped_cubes),
        "snapshot": snapshot_to_dict(snapshot),
        "plannedActions": planned_actions,
        "executedActions": [],
        "skippedCubes": skipped_cubes,
        "movementDelaySeconds": config.movement.delay_seconds,
        "pickupHoldSeconds": config.movement.pickup_hold_seconds,
        "releaseHoldSeconds": config.movement.release_hold_seconds,
        "successMeaning": "physical_confirmed" if physical_config.enabled else "command_execution_only",
        "physicalConfirmation": {
            "enabled": physical_config.enabled,
            "method": physical_config.method,
            "visionSettleSeconds": physical_config.vision_settle_seconds,
            "expectedTotalDelta": physical_config.expected_total_delta,
            "expectedColorDelta": physical_config.expected_color_delta,
        },
        "pickupRetry": {
            "enabled": retry_config.enabled,
            "maxAttempts": retry_config.max_attempts,
            "zStep": retry_config.z_step,
            "minPickZ": retry_config.min_pick_z,
            "plannedPickZValues": _retry_pick_z_values(
                config.robot_planning.pick_z or 0.0,
                retry_config,
            ) if config.robot_planning.enabled else [],
        },
        "planFingerprint": _fingerprint(planned_actions, snapshot, max_cubes),
        "serialOpened": False,
        "hardwareMovement": False,
        "safetyWarnings": _hardware_config_errors(config),
        "limitations": [
            "For real demos, use Edge Vision recapture between cubes so each next pick uses an updated snapshot.",
            "When physicalConfirmation.enabled=false, success means command execution only.",
        ],
    }


def _plan_multi_cube(
    config: EdgeConfig,
    snapshot: DetectionSnapshot,
    adapter: DropZoneAdapter,
    *,
    run_id: str,
    max_cubes: int,
) -> tuple[list[tuple[str, RobotActionPlan]], list[dict[str, Any]]]:
    selected_cubes = CubeSelector().select_many(snapshot, max_cubes=max_cubes)
    planned: list[tuple[str, RobotActionPlan]] = []
    skipped: list[dict[str, Any]] = []

    for cube in selected_cubes:
        sequence_number = len(planned) + len(skipped) + 1
        action_run_id = _action_run_id(run_id, sequence_number)
        try:
            selection = adapter.reserve(cube.color, action_run_id)
        except DropZoneUnavailableError as exc:
            skipped.append({"selectedCube": cube_to_dict(cube), "reason": exc.code})
            continue
        try:
            plan = _plan_reserved_cube(config, snapshot, cube, selection, action_run_id)
        except Exception:
            try:
                adapter.cancel(action_run_id)
            except Exception:
                pass
            raise
        planned.append((action_run_id, plan))
    return planned, skipped


def _plan_reserved_cube(
    config: EdgeConfig,
    snapshot: DetectionSnapshot,
    cube: CubeDetection,
    selection: Any,
    action_run_id: str,
) -> RobotActionPlan:
    action_snapshot = _snapshot_for_action(snapshot, action_run_id)
    return RobotActionPlanner().plan(
        action_snapshot,
        cube,
        selection,
        config.robot_planning,
        EdgeRunProfile.VISION_DRY_RUN,
        dry_run=True,
    )


def _backend_payload(
    *,
    session_id: str,
    run_id: str,
    sequence_number: int,
    total_planned: int,
    snapshot: DetectionSnapshot,
    plan: RobotActionPlan,
    execution: dict[str, Any],
) -> dict[str, Any]:
    planned = _planned_action_dict(sequence_number, plan)
    return _json_safe(
        {
            "sessionId": session_id,
            "actionType": "PICK_AND_DROP",
            "status": "SUCCESS" if execution.get("status") == "SUCCESS" else "ERROR",
            "mode": "hardware",
            "color": plan.selected_cube.color,
            "metadata": {
                "multiCubeRunId": run_id,
                "sequenceNumber": sequence_number,
                "totalPlannedCubes": total_planned,
                "snapshotSignature": _snapshot_signature(snapshot),
                "truckCode": snapshot.truck_code,
                "selectedCube": cube_to_dict(plan.selected_cube),
                "selectedCubeColor": plan.selected_cube.color,
                "selectedCubeCenter": planned["selectedCubeCenter"],
                "selectedCubeBoundingBox": planned["selectedCubeBoundingBox"],
                "pickupPositionCm": planned["pickupPositionCm"],
                "pickupOffset": planned["pickupOffset"],
                "pickupTargetBase": planned["pickupTargetBase"],
                "pickupTarget": planned["pickupTarget"],
                "pickupSafe": planned["pickupSafe"],
                "dropZoneCode": planned["dropZoneCode"],
                "dropZonePose": planned["dropZonePose"],
                "positionOrder": planned["positionOrder"],
                "movementDelaySeconds": execution.get("movementDelaySeconds"),
                "pickupHoldSeconds": execution.get("pickupHoldSeconds"),
                "releaseHoldSeconds": execution.get("releaseHoldSeconds"),
                "firmwareResponses": execution.get("firmwareResponses", []),
                "commandExecutionStatus": execution.get("commandExecutionStatus"),
                "physicalConfirmation": execution.get("physicalConfirmation"),
                "finalPickZUsed": execution.get("finalPickZUsed"),
                "retryEnabled": execution.get("retryEnabled"),
                "maxAttempts": execution.get("maxAttempts"),
                "zStep": execution.get("zStep"),
                "minPickZ": execution.get("minPickZ"),
                "successMeaning": execution.get("successMeaning"),
                "visualCalibrationUsed": planned["visualCalibrationUsed"],
                "homographyUsed": planned["homographyUsed"],
                "occupiedPersisted": execution.get("occupiedPersisted", False),
            },
        }
    )


def _execute_plan(
    *,
    config: EdgeConfig,
    snapshot: DetectionSnapshot,
    run_id: str,
    planned: list[tuple[str, RobotActionPlan]],
    adapter: DropZoneAdapter,
    gates: MultiHardwareGates,
    serial_factory: SerialFactory | None,
    sleeper: Callable[[float], None],
    backend_client: BackendClient | None,
    post_drop_snapshot_loader: Callable[[], DetectionSnapshot] | None = None,
) -> tuple[list[dict[str, Any]], str | None, str | None]:
    serial = MaxArmSerialAdapter(
        gates.port or "",
        gates.baudrate,
        5.0,
        serial_factory=serial_factory,
    )
    executed: list[dict[str, Any]] = []
    session_id: str | None = None
    error_code: str | None = None
    error_message: str | None = None
    current_snapshot = snapshot
    physical_config = _physical_confirmation_config(config)
    retry_config = _pickup_retry_config(config)
    base_pick_z = config.robot_planning.pick_z if config.robot_planning.pick_z is not None else 0.0

    try:
        serial.open()
        for index, (action_run_id, plan) in enumerate(planned, start=1):
            planned_color = plan.selected_cube.color
            if current_snapshot is not snapshot:
                candidates = [cube for cube in CubeSelector().select_many(current_snapshot, max_cubes=max(1, len(current_snapshot.detections))) if cube.color == planned_color]
                if not candidates:
                    error_code = "NO_CUBE_FOR_REPLAN"
                    error_message = f"No {planned_color} cube available after updated snapshot"
                    break
                plan = _plan_reserved_cube(config, current_snapshot, candidates[0], plan.drop_zone, action_run_id)
            action_snapshot = current_snapshot

            execution: dict[str, Any] = {
                "sequenceNumber": index,
                "status": "SUCCESS",
                "firmwareResponses": [],
                "commandExecutionStatus": "SUCCESS",
                "serialOpened": serial.is_open,
                "hardwareMovement": False,
                "suctionActivated": False,
                "pickupExecuted": False,
                "dropExecuted": False,
                "releaseConfirmed": False,
                "occupiedPersisted": False,
                "movementDelaySeconds": config.movement.delay_seconds,
                "pickupHoldSeconds": config.movement.pickup_hold_seconds,
                "releaseHoldSeconds": config.movement.release_hold_seconds,
                "successMeaning": "command_execution_only",
                "physicalConfirmation": {
                    "enabled": physical_config.enabled,
                    "status": "DISABLED",
                    "method": physical_config.method,
                    "attempts": [],
                },
                "retryEnabled": retry_config.enabled,
                "maxAttempts": retry_config.max_attempts,
                "zStep": retry_config.z_step,
                "minPickZ": retry_config.min_pick_z,
            }
            try:
                for attempt_number, pick_z in enumerate(_retry_pick_z_values(base_pick_z, retry_config), start=1):
                    attempt_config = _config_with_pick_z(config, pick_z)
                    attempt_plan = plan if attempt_number == 1 and pick_z == base_pick_z else _plan_reserved_cube(
                        attempt_config,
                        current_snapshot,
                        plan.selected_cube,
                        plan.drop_zone,
                        action_run_id,
                    )
                    execution["finalPickZUsed"] = pick_z
                    attempt_responses: list[dict[str, Any]] = []

                    for step in attempt_plan.steps:
                        step_started_at = _utc_now()
                        step_started_monotonic = time.monotonic()
                        result = serial.send_pose(step.pose, suction=step.suction, allow_suction=gates.confirm_suction)
                        elapsed_ms = round((time.monotonic() - step_started_monotonic) * 1000, 3)
                        delay = _post_step_delay_seconds(
                            step.name,
                            delay_seconds=config.movement.delay_seconds,
                            pickup_hold_seconds=config.movement.pickup_hold_seconds,
                            release_hold_seconds=config.movement.release_hold_seconds,
                        )
                        execution["hardwareMovement"] = True
                        response = {
                            "attempt": attempt_number,
                            "step": step.name,
                            "commandSent": result.command_sent,
                            "firmwareResponse": result.firmware_response,
                            "success": result.success,
                            "postStepDelaySeconds": delay,
                            "stepStartedAt": step_started_at,
                            "responseReceivedAt": _utc_now(),
                            "elapsedMs": elapsed_ms,
                        }
                        execution["firmwareResponses"].append(response)
                        attempt_responses.append(response)
                        if step.suction == 1:
                            execution["suctionActivated"] = True
                        if step.name == "cube_target_pick":
                            execution["pickupExecuted"] = True
                        if step.name == "drop_zone_release":
                            execution["releaseConfirmed"] = True
                            execution["dropExecuted"] = True
                        if execution["hardwareMovement"] and delay > 0:
                            sleeper(delay)

                    after_snapshot: DetectionSnapshot | None = None
                    if physical_config.enabled:
                        if physical_config.vision_settle_seconds > 0:
                            sleeper(physical_config.vision_settle_seconds)
                        after_snapshot = post_drop_snapshot_loader() if post_drop_snapshot_loader else None
                    confirmation = _build_physical_confirmation(
                        config=physical_config,
                        selected_color=attempt_plan.selected_cube.color,
                        before_snapshot=action_snapshot,
                        after_snapshot=after_snapshot,
                        attempt=attempt_number,
                        pick_z=pick_z,
                    )
                    confirmation["firmwareResponseCount"] = len(attempt_responses)
                    execution["physicalConfirmation"]["attempts"].append(confirmation)

                    if confirmation["status"] in {"CONFIRMED", "DISABLED"}:
                        adapter.confirm(action_run_id)
                        execution["occupiedPersisted"] = True
                        execution["physicalConfirmation"].update(
                            {
                                key: confirmation.get(key)
                                for key in (
                                    "enabled",
                                    "status",
                                    "method",
                                    "selectedCubeColor",
                                    "totalBefore",
                                    "totalAfter",
                                    "colorBefore",
                                    "colorAfter",
                                    "expectedTotalAfter",
                                    "expectedColorAfter",
                                    "snapshotBeforeSignature",
                                    "snapshotAfterSignature",
                                    "reason",
                                )
                            }
                        )
                        if confirmation["status"] == "CONFIRMED":
                            execution["successMeaning"] = "physical_confirmed"
                            if after_snapshot is not None:
                                current_snapshot = after_snapshot
                        break

                    execution["physicalConfirmation"].update(
                        {
                            key: confirmation.get(key)
                            for key in (
                                "enabled",
                                "status",
                                "method",
                                "selectedCubeColor",
                                "totalBefore",
                                "totalAfter",
                                "colorBefore",
                                "colorAfter",
                                "expectedTotalAfter",
                                "expectedColorAfter",
                                "snapshotBeforeSignature",
                                "snapshotAfterSignature",
                                "reason",
                            )
                        }
                    )

                if physical_config.enabled and execution["physicalConfirmation"].get("status") != "CONFIRMED":
                    execution["status"] = "FAILED"
                    execution["errorCode"] = (
                        "PHYSICAL_CONFIRMATION_INCONCLUSIVE"
                        if execution["physicalConfirmation"].get("status") == "INCONCLUSIVE"
                        else "PHYSICAL_CONFIRMATION_FAILED"
                    )
                    execution["errorMessage"] = str(execution["physicalConfirmation"].get("reason"))
                    try:
                        adapter.cancel(action_run_id)
                    except Exception:
                        pass

                if backend_client is not None and snapshot.truck_code:
                    if session_id is None:
                        session = backend_client.create_session(snapshot.truck_code).get("session", {})
                        session_id = session.get("id") if isinstance(session, dict) else None
                    if not session_id:
                        raise MultiCubePickDropError("BACKEND_SESSION_MISSING", "Backend did not return session id")
                    execution["backend"] = backend_client.register_robot_action(
                        _backend_payload(
                            session_id=session_id,
                            run_id=run_id,
                            sequence_number=index,
                            total_planned=len(planned),
                            snapshot=action_snapshot,
                            plan=plan,
                            execution=execution,
                        )
                    )
                executed.append(execution)
                if execution.get("status") != "SUCCESS":
                    error_code = str(execution.get("errorCode", "PICK_DROP_FAILED"))
                    error_message = str(execution.get("errorMessage", "Pick/drop failed"))
                    break
            except Exception as exc:
                if not execution["releaseConfirmed"]:
                    try:
                        adapter.cancel(action_run_id)
                    except Exception:
                        pass
                execution["status"] = "FAILED"
                execution["commandExecutionStatus"] = "FAILED"
                execution["errorCode"] = getattr(exc, "code", "PICK_DROP_FAILED")
                execution["errorMessage"] = str(exc)
                executed.append(execution)
                error_code = str(execution["errorCode"])
                error_message = str(execution["errorMessage"])
                break
    finally:
        serial.close()
        for action_run_id, _plan in planned[len(executed) :]:
            try:
                adapter.cancel(action_run_id)
            except Exception:
                pass
    return executed, error_code, error_message


def run_multi_cube_pick_drop(
    config_path: Path,
    *,
    snapshot: DetectionSnapshot,
    max_cubes: int,
    plan_only: bool = False,
    dry_run_evidence_path: Path | None = None,
    gates: MultiHardwareGates | None = None,
    serial_factory: SerialFactory | None = None,
    sleeper: Callable[[float], None] = time.sleep,
    evidence_writer: PickDropEvidenceWriter | None = None,
    backend_client: BackendClient | None = None,
    post_drop_snapshot_loader: Callable[[], DetectionSnapshot] | None = None,
) -> dict[str, Any]:
    if max_cubes <= 0:
        raise MultiCubePickDropError("MAX_CUBES_INVALID", "--max-cubes must be greater than 0")
    config = load_edge_config(config_path)
    if config.robot_planning.enabled is not True:
        raise MultiCubePickDropError("MISSING_PLANNING_CONFIG", "robotPlanning.enabled=true is required")

    writer = evidence_writer or PickDropEvidenceWriter(
        config_path.parent.parent / "workspace" / "generated" / "edge-evidence" / "multi-cube-pick-drop"
    )
    run_id = f"multi-{snapshot.run_id or uuid.uuid4()}"
    snapshot_status = _validate_snapshot_for_multi(snapshot)
    if snapshot_status is not None:
        payload = _base_payload(
            run_id=run_id,
            status=snapshot_status,
            snapshot=snapshot,
            max_cubes=max_cubes,
            planned_actions=[],
            skipped_cubes=[],
            config=config,
        )
        evidence_path = writer.write(payload, run_id, prefix="multi-cube-pick-drop")
        return {**payload, "evidence": {"json": evidence_path}}

    adapter = DropZoneAdapter(
        config.drop_zones_path,
        EdgeRunProfile.HARDWARE,
        persist_hardware_state=not plan_only,
    )
    planned_pairs, skipped_cubes = _plan_multi_cube(
        config,
        snapshot,
        adapter,
        run_id=run_id,
        max_cubes=max_cubes,
    )
    planned_actions = [
        {
            **_planned_action_dict(index, plan),
            "movementDelaySeconds": config.movement.delay_seconds,
            "pickupHoldSeconds": config.movement.pickup_hold_seconds,
            "releaseHoldSeconds": config.movement.release_hold_seconds,
        }
        for index, (_action_run_id, plan) in enumerate(planned_pairs, start=1)
    ]
    status = "DRY_RUN_PLANNED" if plan_only else "PLANNED"
    if not planned_actions and snapshot.detections:
        status = "FAILED"
    payload = _base_payload(
        run_id=run_id,
        status=status,
        snapshot=snapshot,
        max_cubes=max_cubes,
        planned_actions=planned_actions,
        skipped_cubes=skipped_cubes,
        config=config,
    )

    if plan_only:
        for action_run_id, _plan in planned_pairs:
            try:
                adapter.cancel(action_run_id)
            except Exception:
                pass
        evidence_path = writer.write(payload, run_id, prefix="multi-cube-plan-only")
        return {**payload, "evidence": {"json": evidence_path}, "reservationOutcome": "CANCELLED_AFTER_DRY_RUN"}

    gates = gates or MultiHardwareGates()
    _validate_gates(gates)
    if dry_run_evidence_path is not None:
        _assert_multi_fingerprint_match(_load_multi_fingerprint(dry_run_evidence_path), payload["planFingerprint"])
    _assert_hardware_config_ready(config)
    if not planned_pairs:
        evidence_path = writer.write(payload, run_id, prefix="multi-cube-pick-drop")
        return {**payload, "evidence": {"json": evidence_path}}

    executed, error_code, error_message = _execute_plan(
        config=config,
        snapshot=snapshot,
        run_id=run_id,
        planned=planned_pairs,
        adapter=adapter,
        gates=gates,
        serial_factory=serial_factory,
        sleeper=sleeper,
        backend_client=backend_client,
        post_drop_snapshot_loader=post_drop_snapshot_loader,
    )
    successful = [action for action in executed if action.get("status") == "SUCCESS"]
    if error_code is None:
        final_status = "SUCCESS"
    elif successful:
        final_status = "PARTIAL_SUCCESS"
    else:
        final_status = "FAILED"
    payload.update(
        {
            "status": final_status,
            "totalExecutedCubes": len(successful),
            "executedActions": executed,
            "serialOpened": any(bool(action.get("serialOpened")) for action in executed),
            "hardwareMovement": any(bool(action.get("hardwareMovement")) for action in executed),
            "errorCode": error_code,
            "errorMessage": error_message,
        }
    )
    evidence_path = writer.write(payload, run_id, prefix="multi-cube-pick-drop")
    return {**payload, "evidence": {"json": evidence_path}}


def _resolve_snapshot(args: argparse.Namespace) -> DetectionSnapshot:
    if args.snapshot:
        return load_snapshot(Path(args.snapshot))
    if args.edge_vision_url:
        return _load_edge_vision_snapshot(args.edge_vision_url)
    raise MultiCubePickDropError("SNAPSHOT_REQUIRED", "Use --snapshot or --edge-vision-url")


def main() -> None:
    parser = argparse.ArgumentParser(description="Plan or execute controlled multi-cube MaxArm pick/drop.")
    parser.add_argument("--config", required=True)
    parser.add_argument("--snapshot", help="DetectionSnapshot JSON generated by Edge Vision.")
    parser.add_argument("--edge-vision-url", help="Read latest snapshot from Edge Vision API.")
    parser.add_argument("--plan-only", action="store_true")
    parser.add_argument("--dry-run-evidence", help="Plan-only evidence JSON to match before hardware.")
    parser.add_argument("--port")
    parser.add_argument("--baudrate", type=int, default=115200)
    parser.add_argument("--max-cubes", type=int, default=1)
    parser.add_argument("--confirm-multi-pick-drop", action="store_true")
    parser.add_argument("--enable-hardware-motion", action="store_true")
    parser.add_argument("--confirm-zone-clear", action="store_true")
    parser.add_argument("--confirm-operator-present", action="store_true")
    parser.add_argument("--confirm-emergency-stop-ready", action="store_true")
    parser.add_argument("--confirm-suction", action="store_true")
    parser.add_argument("--sync-backend", action="store_true")
    parser.add_argument("--backend-url", default=os.getenv("BACKEND_URL", "http://localhost:3000"))
    parser.add_argument(
        "--recapture-between-cubes",
        action="store_true",
        help="Use updated Edge Vision snapshots after each confirmed drop when --edge-vision-url is provided.",
    )
    args = parser.parse_args()
    initial_snapshot = _resolve_snapshot(args)
    post_drop_loader = (
        (lambda: _load_edge_vision_snapshot(args.edge_vision_url))
        if args.edge_vision_url
        else None
    )

    result = run_multi_cube_pick_drop(
        Path(args.config),
        snapshot=initial_snapshot,
        max_cubes=args.max_cubes,
        plan_only=args.plan_only,
        dry_run_evidence_path=Path(args.dry_run_evidence) if args.dry_run_evidence else None,
        gates=MultiHardwareGates(
            confirm_multi_pick_drop=args.confirm_multi_pick_drop,
            enable_hardware_motion=args.enable_hardware_motion,
            confirm_zone_clear=args.confirm_zone_clear,
            confirm_operator_present=args.confirm_operator_present,
            confirm_emergency_stop_ready=args.confirm_emergency_stop_ready,
            confirm_suction=args.confirm_suction,
            port=args.port,
            baudrate=args.baudrate,
        ),
        backend_client=BackendClient(args.backend_url) if args.sync_backend else None,
        post_drop_snapshot_loader=post_drop_loader,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

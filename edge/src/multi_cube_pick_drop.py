from __future__ import annotations

import argparse
import json
import os
import time
import uuid
from dataclasses import dataclass
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
        "successMeaning": "command_execution_only",
        "planFingerprint": _fingerprint(planned_actions, snapshot, max_cubes),
        "serialOpened": False,
        "hardwareMovement": False,
        "safetyWarnings": _hardware_config_errors(config),
        "limitations": [
            "This version plans multiple cubes from one snapshot and does not recapture between cubes.",
            "Physical confirmation remains manual; success means command execution only.",
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
    planner = RobotActionPlanner()

    for cube in selected_cubes:
        sequence_number = len(planned) + len(skipped) + 1
        action_run_id = _action_run_id(run_id, sequence_number)
        try:
            selection = adapter.reserve(cube.color, action_run_id)
        except DropZoneUnavailableError as exc:
            skipped.append({"selectedCube": cube_to_dict(cube), "reason": exc.code})
            continue
        try:
            action_snapshot = _snapshot_for_action(snapshot, action_run_id)
            plan = planner.plan(
                action_snapshot,
                cube,
                selection,
                config.robot_planning,
                EdgeRunProfile.VISION_DRY_RUN,
                dry_run=True,
            )
        except Exception:
            try:
                adapter.cancel(action_run_id)
            except Exception:
                pass
            raise
        planned.append((action_run_id, plan))
    return planned, skipped


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
            "status": execution.get("status", "SUCCESS"),
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

    try:
        serial.open()
        for index, (action_run_id, plan) in enumerate(planned, start=1):
            execution: dict[str, Any] = {
                "sequenceNumber": index,
                "status": "SUCCESS",
                "firmwareResponses": [],
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
            }
            try:
                for step in plan.steps:
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
                    execution["firmwareResponses"].append(
                        {
                            "step": step.name,
                            "commandSent": result.command_sent,
                            "firmwareResponse": result.firmware_response,
                            "success": result.success,
                            "postStepDelaySeconds": delay,
                            "stepStartedAt": step_started_at,
                            "responseReceivedAt": _utc_now(),
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
                        adapter.confirm(action_run_id)
                        execution["occupiedPersisted"] = True
                    if execution["hardwareMovement"] and delay > 0:
                        sleeper(delay)

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
                            snapshot=snapshot,
                            plan=plan,
                            execution=execution,
                        )
                    )
                executed.append(execution)
            except Exception as exc:
                if not execution["releaseConfirmed"]:
                    try:
                        adapter.cancel(action_run_id)
                    except Exception:
                        pass
                execution["status"] = "FAILED"
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
        help="Reserved for a future version; current flow plans from one snapshot.",
    )
    args = parser.parse_args()
    if args.recapture_between_cubes:
        raise MultiCubePickDropError("NOT_IMPLEMENTED", "--recapture-between-cubes is documented but not implemented")

    result = run_multi_cube_pick_drop(
        Path(args.config),
        snapshot=_resolve_snapshot(args),
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
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

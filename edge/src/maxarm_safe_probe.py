from __future__ import annotations

import argparse
import json
import os
import re
import tempfile
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from .models import RobotPose
    from .robot.maxarm_serial import (
        MaxArmSerialAdapter,
        MaxArmSerialError,
        SerialFactory,
        build_pose_command,
    )
except ImportError:
    from models import RobotPose
    from robot.maxarm_serial import (
        MaxArmSerialAdapter,
        MaxArmSerialError,
        SerialFactory,
        build_pose_command,
    )


SAFE_PROBE_ALLOWED_POSE_NAMES = frozenset({"reset", "ready", "ready_to_take"})


class SafeProbeError(ValueError):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(f"{code}: {message}")


@dataclass(frozen=True)
class SafeProbeConfig:
    port: str
    baudrate: int
    timeout_seconds: float
    safe_poses: dict[str, RobotPose]
    allowed_pose_names: tuple[str, ...]
    default_pose_name: str
    evidence_directory: Path
    suction_allowed: bool
    pickup_allowed: bool
    drop_allowed: bool
    hardware_motion_requires_confirmation: bool


class SafeProbeEvidenceWriter:
    def __init__(self, output_directory: Path) -> None:
        self.output_directory = output_directory

    def write(self, payload: dict[str, Any], run_id: str) -> str:
        self.output_directory.mkdir(parents=True, exist_ok=True)
        safe_run_id = re.sub(r"[^A-Za-z0-9_-]+", "-", run_id).strip("-") or "run"
        path = self.output_directory / f"maxarm-safe-probe-{safe_run_id}.json"
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


def _parse_bool(value: object, field_name: str, default: bool) -> bool:
    if value is None:
        return default
    if not isinstance(value, bool):
        raise SafeProbeError("INVALID_CONFIG", f"{field_name} must be boolean")
    return value


def _parse_pose(value: object, field_name: str) -> RobotPose:
    if not isinstance(value, dict):
        raise SafeProbeError("INVALID_CONFIG", f"{field_name} must be an object")
    try:
        return RobotPose(
            x=float(value["x"]),
            y=float(value["y"]),
            z=float(value["z"]),
        )
    except (KeyError, TypeError, ValueError) as exc:
        raise SafeProbeError("INVALID_CONFIG", f"{field_name} must contain numeric x/y/z") from exc


def load_safe_probe_config(path: Path) -> SafeProbeConfig:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SafeProbeError("INVALID_CONFIG", f"Could not read safe probe config: {exc}") from exc
    if not isinstance(raw, dict):
        raise SafeProbeError("INVALID_CONFIG", "safe probe config must be an object")

    serial_raw = raw.get("serial")
    if not isinstance(serial_raw, dict):
        raise SafeProbeError("INVALID_CONFIG", "serial config is required")
    port = serial_raw.get("port")
    if not isinstance(port, str) or not port.strip():
        raise SafeProbeError("INVALID_CONFIG", "serial.port must be a non-empty string")
    baudrate = serial_raw.get("baudrate", 115200)
    if isinstance(baudrate, bool) or not isinstance(baudrate, int) or baudrate <= 0:
        raise SafeProbeError("INVALID_CONFIG", "serial.baudrate must be a positive integer")
    timeout_seconds = serial_raw.get("timeoutSeconds", 5)
    if (
        isinstance(timeout_seconds, bool)
        or not isinstance(timeout_seconds, (int, float))
        or timeout_seconds <= 0
    ):
        raise SafeProbeError("INVALID_CONFIG", "serial.timeoutSeconds must be a positive number")

    poses_raw = raw.get("safePoses")
    if not isinstance(poses_raw, dict) or not poses_raw:
        raise SafeProbeError("INVALID_CONFIG", "safePoses must define at least one pose")
    safe_poses = {
        str(name).strip(): _parse_pose(value, f"safePoses.{name}")
        for name, value in poses_raw.items()
        if str(name).strip()
    }
    if not safe_poses:
        raise SafeProbeError("INVALID_CONFIG", "safePoses must define named poses")

    allowed_raw = raw.get("allowedPoseNames", ["reset", "ready"])
    if not isinstance(allowed_raw, list) or not all(
        isinstance(name, str) and name.strip() for name in allowed_raw
    ):
        raise SafeProbeError("INVALID_CONFIG", "allowedPoseNames must be an array of names")
    allowed_pose_names = tuple(name.strip() for name in allowed_raw)
    unsafe_names = set(allowed_pose_names) - SAFE_PROBE_ALLOWED_POSE_NAMES
    if unsafe_names:
        raise SafeProbeError(
            "UNSAFE_POSE_ALLOWLIST",
            f"safe probe allowlist only permits {sorted(SAFE_PROBE_ALLOWED_POSE_NAMES)}",
        )

    default_pose_name = raw.get("defaultPoseName", allowed_pose_names[0])
    if not isinstance(default_pose_name, str) or not default_pose_name.strip():
        raise SafeProbeError("INVALID_CONFIG", "defaultPoseName must be a non-empty string")
    default_pose_name = default_pose_name.strip()

    evidence_raw = raw.get("evidence", {})
    if not isinstance(evidence_raw, dict):
        raise SafeProbeError("INVALID_CONFIG", "evidence must be an object")
    evidence_directory_raw = evidence_raw.get(
        "directory",
        "workspace/generated/edge-evidence/maxarm-safe-probe",
    )
    if not isinstance(evidence_directory_raw, str) or not evidence_directory_raw.strip():
        raise SafeProbeError("INVALID_CONFIG", "evidence.directory must be a non-empty string")
    evidence_directory = Path(evidence_directory_raw)
    if not evidence_directory.is_absolute():
        evidence_directory = Path.cwd() / evidence_directory

    return SafeProbeConfig(
        port=port.strip(),
        baudrate=baudrate,
        timeout_seconds=float(timeout_seconds),
        safe_poses=safe_poses,
        allowed_pose_names=allowed_pose_names,
        default_pose_name=default_pose_name,
        evidence_directory=evidence_directory,
        suction_allowed=_parse_bool(raw.get("suctionAllowed"), "suctionAllowed", False),
        pickup_allowed=_parse_bool(raw.get("pickupAllowed"), "pickupAllowed", False),
        drop_allowed=_parse_bool(raw.get("dropAllowed"), "dropAllowed", False),
        hardware_motion_requires_confirmation=_parse_bool(
            raw.get("hardwareMotionRequiresConfirmation"),
            "hardwareMotionRequiresConfirmation",
            True,
        ),
    )


def sanitize_port(port: str) -> str:
    normalized = port.strip()
    if re.fullmatch(r"COM\d+", normalized, flags=re.IGNORECASE):
        return normalized.upper()
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", Path(normalized).name or "serial-port")


def validate_safe_probe_request(
    config: SafeProbeConfig,
    *,
    pose_name: str,
    confirm_safe_motion: bool,
) -> RobotPose:
    if config.suction_allowed:
        raise SafeProbeError("SUCTION_NOT_ALLOWED", "suctionAllowed must be false")
    if config.pickup_allowed:
        raise SafeProbeError("PICKUP_NOT_ALLOWED", "pickupAllowed must be false")
    if config.drop_allowed:
        raise SafeProbeError("DROP_NOT_ALLOWED", "dropAllowed must be false")
    if pose_name not in config.allowed_pose_names:
        raise SafeProbeError("POSE_NOT_ALLOWLISTED", f"pose {pose_name!r} is not allowlisted")
    try:
        pose = config.safe_poses[pose_name]
    except KeyError as exc:
        raise SafeProbeError("POSE_NOT_CONFIGURED", f"pose {pose_name!r} is not configured") from exc
    if config.hardware_motion_requires_confirmation and not confirm_safe_motion:
        raise SafeProbeError(
            "CONFIRMATION_REQUIRED",
            "--confirm-safe-motion is required before opening serial",
        )
    return pose


def build_base_payload(
    config: SafeProbeConfig,
    *,
    run_id: str,
    pose_name: str,
    pose: RobotPose | None,
) -> dict[str, Any]:
    return {
        "runId": run_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "portSanitized": sanitize_port(config.port),
        "baudrate": config.baudrate,
        "timeoutSeconds": config.timeout_seconds,
        "poseName": pose_name,
        "commandPreview": build_pose_command(pose, suction=0) if pose is not None else None,
        "commandSent": None,
        "firmwareResponse": None,
        "timeout": False,
        "serialOpened": False,
        "hardwareMovement": False,
        "suctionActivated": False,
        "pickupExecuted": False,
        "dropExecuted": False,
        "result": "PENDING",
        "errorCode": None,
    }


def run_safe_probe(
    config_path: Path,
    *,
    port_override: str | None = None,
    baudrate_override: int | None = None,
    pose_name_override: str | None = None,
    timeout_override: float | None = None,
    confirm_safe_motion: bool = False,
    serial_factory: SerialFactory | None = None,
    evidence_writer: SafeProbeEvidenceWriter | None = None,
) -> dict[str, Any]:
    config = load_safe_probe_config(config_path)
    if port_override:
        config = SafeProbeConfig(**{**config.__dict__, "port": port_override})
    if baudrate_override is not None:
        config = SafeProbeConfig(**{**config.__dict__, "baudrate": baudrate_override})
    if timeout_override is not None:
        config = SafeProbeConfig(**{**config.__dict__, "timeout_seconds": timeout_override})
    pose_name = pose_name_override or config.default_pose_name
    run_id = str(uuid.uuid4())
    pose: RobotPose | None = None
    adapter: MaxArmSerialAdapter | None = None
    payload: dict[str, Any] | None = None

    try:
        if pose_name in config.allowed_pose_names:
            pose = config.safe_poses.get(pose_name)
        payload = build_base_payload(config, run_id=run_id, pose_name=pose_name, pose=pose)
        pose = validate_safe_probe_request(
            config,
            pose_name=pose_name,
            confirm_safe_motion=confirm_safe_motion,
        )
        payload["commandPreview"] = build_pose_command(pose, suction=0)
        adapter = MaxArmSerialAdapter(
            config.port,
            config.baudrate,
            config.timeout_seconds,
            serial_factory=serial_factory,
        )
        adapter.open()
        payload["serialOpened"] = True
        result = adapter.send_safe_pose(pose)
        payload["commandSent"] = result.command_sent
        payload["firmwareResponse"] = result.firmware_response
        payload["hardwareMovement"] = True
        payload["result"] = "SUCCESS"
    except (SafeProbeError, MaxArmSerialError) as error:
        if payload is None:
            payload = build_base_payload(config, run_id=run_id, pose_name=pose_name, pose=pose)
        payload["result"] = "ERROR"
        payload["errorCode"] = error.code
        payload["timeout"] = error.code == "TIMEOUT"
        payload["firmwareResponse"] = payload.get("firmwareResponse")
    except Exception as error:
        if payload is None:
            payload = build_base_payload(config, run_id=run_id, pose_name=pose_name, pose=pose)
        payload["result"] = "ERROR"
        payload["errorCode"] = "SERIAL_ERROR"
        payload["firmwareResponse"] = str(error)
    finally:
        if adapter is not None:
            adapter.close()
        writer = evidence_writer or SafeProbeEvidenceWriter(config.evidence_directory)
        payload["evidencePath"] = writer.write(payload, run_id)
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(
        description="MaxArm serial safe probe: one safe pose, no suction, no pick/drop.",
    )
    parser.add_argument("--config", required=True)
    parser.add_argument("--port", help="Serial port override, for example COM4.")
    parser.add_argument("--baudrate", type=int, help="Serial baudrate override.")
    parser.add_argument("--pose-name", help="Safe allowlisted pose name.")
    parser.add_argument("--timeout-seconds", type=float, help="Firmware response timeout override.")
    parser.add_argument(
        "--confirm-safe-motion",
        action="store_true",
        help="Required gate: confirms the operator reviewed the physical safe-motion checklist.",
    )
    args = parser.parse_args()

    print("RoboDock AI - MaxArm serial safe probe")
    print("REAL HARDWARE MOTION TEST: one safe allowlisted POSE only.")
    print("No suction, no cubes, no pickup, no drop, no camera, no Dashboard control.")
    result = run_safe_probe(
        Path(args.config),
        port_override=args.port,
        baudrate_override=args.baudrate,
        pose_name_override=args.pose_name,
        timeout_override=args.timeout_seconds,
        confirm_safe_motion=args.confirm_safe_motion,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["result"] == "SUCCESS" else 2


if __name__ == "__main__":
    raise SystemExit(main())

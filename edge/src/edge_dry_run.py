from __future__ import annotations

import argparse
import json
import os
import re
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from .config import EdgeConfig, load_edge_config
    from .models import CubeDetection, DetectionSnapshot, EdgeRunProfile, RobotActionPlan
    from .robot.drop_zone_adapter import DropZoneAdapter
    from .robot.planner import RobotActionPlanner
    from .vision.capture import FrameCapture
    from .vision.color_detector import ColorDetector
    from .vision.cube_selector import CubeSelector
    from .vision.evidence import cube_to_dict, snapshot_to_dict
    from .vision.pipeline import VisionPipeline
    from .vision.qr_reader import QrReader
except ImportError:
    from config import EdgeConfig, load_edge_config
    from models import CubeDetection, DetectionSnapshot, EdgeRunProfile, RobotActionPlan
    from robot.drop_zone_adapter import DropZoneAdapter
    from robot.planner import RobotActionPlanner
    from vision.capture import FrameCapture
    from vision.color_detector import ColorDetector
    from vision.cube_selector import CubeSelector
    from vision.evidence import cube_to_dict, snapshot_to_dict
    from vision.pipeline import VisionPipeline
    from vision.qr_reader import QrReader


class DryRunEvidenceWriter:
    def __init__(self, output_directory: Path) -> None:
        self.output_directory = output_directory

    def write(self, payload: dict[str, Any], run_id: str) -> str:
        self.output_directory.mkdir(parents=True, exist_ok=True)
        safe_run_id = re.sub(r"[^A-Za-z0-9_-]+", "-", run_id).strip("-") or "run"
        filename = f"dry-run-{safe_run_id}.json"
        path = self.output_directory / filename
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
        return filename


def _snapshot_from_simulation(config: EdgeConfig) -> DetectionSnapshot:
    raw_cubes = config.raw.get("vision", {}).get("cubes", [])
    if not isinstance(raw_cubes, list):
        raise ValueError("vision.cubes must be an array for simulated dry-run")
    detections = tuple(
        CubeDetection(
            color=str(cube.get("color", "")).lower(),
            x=int(cube.get("x", 0)),
            y=int(cube.get("y", 0)),
            w=int(cube.get("w", 0)),
            h=int(cube.get("h", 0)),
            confidence=float(cube["confidence"]) if cube.get("confidence") is not None else None,
            metadata={"sizeValid": True, "coordinateSpace": "frame-pixels"},
        )
        for cube in raw_cubes
        if isinstance(cube, dict)
    )
    calibration_version = (
        config.robot_planning.calibration.version
        if config.robot_planning.calibration is not None
        else None
    )
    return DetectionSnapshot(
        run_id=str(uuid.uuid4()),
        source="simulation",
        truck_code=config.truck_code,
        detections=detections,
        calibration_version=calibration_version,
        metadata={"profile": config.profile.value, "dryRun": True},
    )


def _snapshot_from_vision(config: EdgeConfig, allow_camera: bool) -> DetectionSnapshot:
    capture = FrameCapture()
    if config.vision.source == "file":
        if config.vision.image_path is None:
            raise ValueError("vision.imagePath is required when vision.source=file")
        captured = capture.read_file(config.vision.image_path)
    elif config.vision.source == "camera":
        if not allow_camera:
            raise ValueError("Camera capture requires explicit --allow-camera")
        captured = capture.read_camera(config.vision.camera_index)
    else:
        raise ValueError("vision.source must be file or camera for vision dry-run")

    pipeline = VisionPipeline(
        qr_reader=QrReader(
            pattern=config.vision.qr_pattern,
            allowed_truck_codes=config.vision.allowed_truck_codes,
        ),
        color_detector=ColorDetector(
            config.vision.hsv_ranges,
            min_area=config.vision.min_area,
            max_area=config.vision.max_area,
            min_fill_ratio=config.vision.min_fill_ratio,
        ),
    )
    return pipeline.process(
        captured.image,
        run_id=str(uuid.uuid4()),
        source=captured.source,
        frame_source=captured.frame_source,
        qr_roi=config.vision.qr_roi,
        cargo_roi=config.vision.cargo_roi,
        metadata={"profile": config.profile.value, "dryRun": True},
    )


def load_snapshot(path: Path) -> DetectionSnapshot:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Could not load snapshot JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ValueError("Snapshot JSON must be an object")

    raw_detections = payload.get("detections")
    if not isinstance(raw_detections, list):
        raise ValueError("Snapshot detections must be an array")
    detections = tuple(
        CubeDetection(
            color=str(item.get("color", "")).lower(),
            x=int(item.get("x", 0)),
            y=int(item.get("y", 0)),
            w=int(item.get("w", 0)),
            h=int(item.get("h", 0)),
            confidence=float(item["confidence"]) if item.get("confidence") is not None else None,
            metadata=item.get("metadata", {}) if isinstance(item.get("metadata", {}), dict) else {},
        )
        for item in raw_detections
        if isinstance(item, dict)
    )
    timestamp = payload.get("timestamp")
    captured_at = (
        datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        if isinstance(timestamp, str)
        else None
    )
    kwargs: dict[str, Any] = {}
    if captured_at is not None:
        kwargs["captured_at"] = captured_at
    return DetectionSnapshot(
        run_id=str(payload.get("runId", "")).strip(),
        source=str(payload.get("source", "snapshot")),
        truck_code=payload.get("truckCode") if isinstance(payload.get("truckCode"), str) else None,
        detections=detections,
        frame_source=Path(payload["frameSource"]).name if isinstance(payload.get("frameSource"), str) else None,
        frame_id=payload.get("frameId") if isinstance(payload.get("frameId"), str) else None,
        calibration_version=(
            payload.get("calibrationVersion")
            if isinstance(payload.get("calibrationVersion"), str)
            else None
        ),
        metadata=payload.get("metadata", {}) if isinstance(payload.get("metadata", {}), dict) else {},
        **kwargs,
    )


def plan_to_dict(plan: RobotActionPlan) -> dict[str, Any]:
    def pose_dict(pose):
        return pose.as_dict()

    return {
        "runId": plan.run_id,
        "selectedCube": cube_to_dict(plan.selected_cube),
        "dropZoneCode": plan.drop_zone.slot.code,
        "color": plan.selected_cube.color,
        "dryRun": plan.dry_run,
        "profile": plan.profile.value,
        "safeZ": plan.safe_z,
        "candidatePoses": {
            "pickupTarget": pose_dict(plan.pickup_target),
            "pickupSafe": pose_dict(plan.pickup_safe),
            "dropTarget": pose_dict(plan.drop_target),
            "dropSafe": pose_dict(plan.drop_safe),
        },
        "steps": [
            {
                "name": step.name,
                "pose": pose_dict(step.pose),
                "suction": step.suction,
                "critical": step.critical,
                "commandPreview": step.command_preview,
            }
            for step in plan.steps
        ],
        "metadata": plan.metadata,
        "errors": list(plan.errors),
    }


def run_integrated_dry_run(
    config_path: Path,
    *,
    snapshot: DetectionSnapshot | None = None,
    allow_camera: bool = False,
    adapter: DropZoneAdapter | None = None,
    evidence_writer: DryRunEvidenceWriter | None = None,
) -> dict[str, Any]:
    config = load_edge_config(config_path)
    if config.profile not in {EdgeRunProfile.SIMULATION, EdgeRunProfile.VISION_DRY_RUN}:
        raise ValueError("Integrated dry-run only supports simulation or vision-dry-run")
    if not config.safety.dry_run or config.safety.enable_hardware_motion:
        raise ValueError("Integrated dry-run requires dryRun=true and hardware motion disabled")

    if snapshot is None:
        snapshot = (
            _snapshot_from_simulation(config)
            if config.vision.source == "simulation"
            else _snapshot_from_vision(config, allow_camera)
        )
    if not snapshot.run_id:
        raise ValueError("DetectionSnapshot.run_id is required")

    selected_cube = CubeSelector().select(snapshot)
    drop_zone_adapter = adapter or DropZoneAdapter(
        config.drop_zones_path,
        config.profile,
        persist_hardware_state=False,
    )
    selection = None
    try:
        selection = drop_zone_adapter.reserve(selected_cube.color, snapshot.run_id)
        plan = RobotActionPlanner().plan(
            snapshot,
            selected_cube,
            selection,
            config.robot_planning,
            config.profile,
            dry_run=True,
        )
    finally:
        if selection is not None:
            drop_zone_adapter.cancel(selection.run_id)

    payload = {
        "snapshot": snapshot_to_dict(snapshot),
        "selectedCube": cube_to_dict(selected_cube),
        "dropZone": {
            "code": selection.slot.code,
            "color": selection.slot.color,
            "positionOrder": selection.slot.position_order,
            "pose": selection.slot.pose.as_dict(),
            "reservedInMemory": True,
            "occupied": selection.slot.occupied,
        },
        "robotActionPlan": plan_to_dict(plan),
        "resultExpected": {
            "status": "DRY_RUN_PLANNED",
            "hardwareMovement": False,
            "serialOpened": False,
        },
        "reservationOutcome": "CANCELLED_AFTER_DRY_RUN",
    }
    writer = evidence_writer or DryRunEvidenceWriter(config.vision.evidence_directory)
    evidence_file = writer.write(payload, snapshot.run_id)
    return {**payload, "evidence": {"json": evidence_file}}


def main() -> None:
    parser = argparse.ArgumentParser(description="Plan an integrated Edge dry-run without serial.")
    parser.add_argument("--config", default="config/edge.config.example.json")
    parser.add_argument("--snapshot", help="Optional DetectionSnapshot JSON.")
    parser.add_argument(
        "--allow-camera",
        action="store_true",
        help="Explicitly allow one camera frame; serial is never opened.",
    )
    args = parser.parse_args()
    result = run_integrated_dry_run(
        Path(args.config),
        snapshot=load_snapshot(Path(args.snapshot)) if args.snapshot else None,
        allow_camera=args.allow_camera,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

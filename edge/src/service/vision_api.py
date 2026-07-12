from __future__ import annotations

import argparse
import os
import sys
import time
import uuid
from contextlib import asynccontextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
from fastapi import Body, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from ..api_client import BackendApiError, BackendClient
    from ..config import EdgeConfig, EdgeConfigError, load_edge_config
    from ..edge_dry_run import run_integrated_dry_run
    from ..models import DetectionSnapshot, EdgeRunProfile, SUPPORTED_COLORS
    from ..multi_cube_pick_drop import MultiCubePickDropError, MultiHardwareGates, run_multi_cube_pick_drop
    from ..reset_drop_zones import ResetDropZonesError, reset_drop_zones
    from ..vision.capture import CapturedFrame, FrameCapture
    from ..vision.color_detector import ColorDetector
    from ..vision.evidence import EvidenceWriter, snapshot_to_dict
    from ..vision.pipeline import VisionPipeline
    from ..vision.qr_reader import QrReader
except ImportError:
    sys.path.append(str(Path(__file__).resolve().parents[1]))
    from api_client import BackendApiError, BackendClient
    from config import EdgeConfig, EdgeConfigError, load_edge_config
    from edge_dry_run import run_integrated_dry_run
    from models import DetectionSnapshot, EdgeRunProfile, SUPPORTED_COLORS
    from multi_cube_pick_drop import MultiCubePickDropError, MultiHardwareGates, run_multi_cube_pick_drop
    from reset_drop_zones import ResetDropZonesError, reset_drop_zones
    from vision.capture import CapturedFrame, FrameCapture
    from vision.color_detector import ColorDetector
    from vision.evidence import EvidenceWriter, snapshot_to_dict
    from vision.pipeline import VisionPipeline
    from vision.qr_reader import QrReader


@dataclass
class VisionServiceState:
    config: EdgeConfig
    config_path: Path
    unload_config_path: Path
    allow_camera: bool
    backend_client: BackendClient | None = None
    auto_sync_backend: bool = False
    last_snapshot: DetectionSnapshot | None = None
    last_snapshot_monotonic: float | None = None
    last_image: bytes | None = None
    last_error: str | None = None
    active_camera_index: int | None = None
    snapshot_camera_index: int | None = None
    camera_handle: Any | None = None
    camera_handle_index: int | None = None
    last_sync: dict[str, object] | None = None
    last_synced_signature: str | None = None
    last_dry_run_plan: dict[str, object] | None = None
    multi_cube_status: str = "idle"
    multi_cube_run_id: str | None = None
    multi_cube_last_plan: dict[str, object] | None = None
    multi_cube_last_result: dict[str, object] | None = None
    multi_cube_plan_snapshot: DetectionSnapshot | None = None
    multi_cube_last_error: str | None = None
    multi_cube_updated_at: str | None = None
    multi_cube_executing: bool = False
    hardware_port: str | None = None
    hardware_baudrate: int = 115200

    @property
    def source(self) -> str:
        if self.config.vision.source == "file":
            return "opencv-file"
        if self.config.vision.source == "camera":
            return "opencv-camera"
        return "simulation"


def _counts(snapshot: DetectionSnapshot | None) -> dict[str, int]:
    counts = {color: 0 for color in SUPPORTED_COLORS}
    if snapshot is None:
        return counts
    for detection in snapshot.detections:
        counts[detection.color] = counts.get(detection.color, 0) + 1
    return counts


def _status_payload(state: VisionServiceState) -> dict[str, object]:
    return {
        "status": "degraded" if state.last_error else "ok",
        "profile": state.config.profile.value,
        "source": state.source,
        "configPath": str(state.config_path),
        "unloadConfigPath": str(state.unload_config_path),
        "configuredCameraIndex": state.config.vision.camera_index if state.config.vision.source == "camera" else None,
        "activeCameraIndex": state.active_camera_index,
        "snapshotCameraIndex": state.snapshot_camera_index,
        "cameraAllowed": state.allow_camera,
        "lastSnapshotAt": state.last_snapshot.captured_at.isoformat() if state.last_snapshot else None,
        "lastError": state.last_error,
        "lastVisionSync": state.last_sync,
        "lastSyncedSnapshotSignature": state.last_synced_signature,
        "lastDryRunPlan": state.last_dry_run_plan,
        "serialOpened": False,
        "hardwareMovement": False,
    }


def _snapshot_payload(state: VisionServiceState) -> dict[str, object]:
    snapshot = state.last_snapshot
    if snapshot is None:
        return {
            "runId": None,
            "timestamp": None,
            "source": state.source,
            "truckCode": None,
            "counts": _counts(None),
            "detections": [],
            "imageUrl": None,
            "snapshotCameraIndex": None,
            "lastError": state.last_error or "Sin snapshot todavia",
        }

    payload = snapshot_to_dict(snapshot)
    metadata = payload["metadata"] if isinstance(payload["metadata"], dict) else {}
    return {
        "runId": payload["runId"],
        "timestamp": payload["timestamp"],
        "source": payload["source"],
        "truckCode": payload["truckCode"],
        "snapshotSignature": metadata.get("snapshotSignature"),
        "qrDetected": metadata.get("qrDetected"),
        "qrValid": metadata.get("qrValid"),
        "qrStatus": metadata.get("qrStatus"),
        "qrRoi": metadata.get("qrRoi"),
        "cargoRoi": metadata.get("cargoRoi"),
        "counts": _counts(snapshot),
        "detections": payload["detections"],
        "imageUrl": "/vision/snapshot/image" if state.last_image else None,
        "snapshotCameraIndex": state.snapshot_camera_index,
        "lastVisionSync": state.last_sync,
        "lastError": state.last_error,
    }


def _no_store_headers() -> dict[str, str]:
    return {
        "Cache-Control": "no-store, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
    }


def _json_no_store(payload: dict[str, object]) -> JSONResponse:
    return JSONResponse(payload, headers=_no_store_headers())


def _utc_iso() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


def _set_multi_status(
    state: VisionServiceState,
    status: str,
    *,
    run_id: str | None = None,
    plan: dict[str, object] | None = None,
    result: dict[str, object] | None = None,
    error: str | None = None,
) -> None:
    state.multi_cube_status = status
    if run_id is not None:
        state.multi_cube_run_id = run_id
    if plan is not None:
        state.multi_cube_last_plan = plan
    if result is not None:
        state.multi_cube_last_result = result
    state.multi_cube_last_error = error
    state.multi_cube_updated_at = _utc_iso()


def _multi_status_payload(state: VisionServiceState) -> dict[str, object]:
    try:
        port = _configured_hardware_port(state, {})
    except HTTPException:
        port = None
    return {
        "status": state.multi_cube_status,
        "runId": state.multi_cube_run_id,
        "lastPlan": state.multi_cube_last_plan,
        "lastResult": state.multi_cube_last_result,
        "lastError": state.multi_cube_last_error,
        "updatedAt": state.multi_cube_updated_at,
        "executing": state.multi_cube_executing,
        "hardwarePortConfigured": port is not None,
    }


def _reset_multi_cube_operation(state: VisionServiceState) -> None:
    state.multi_cube_status = "idle"
    state.multi_cube_run_id = None
    state.multi_cube_last_plan = None
    state.multi_cube_last_result = None
    state.multi_cube_plan_snapshot = None
    state.multi_cube_last_error = None
    state.multi_cube_updated_at = _utc_iso()
    state.multi_cube_executing = False


def _max_cubes_from_payload(payload: dict[str, Any]) -> int:
    value = payload.get("maxCubes", 6)
    if isinstance(value, str) and value == "all":
        return 6
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise HTTPException(status_code=400, detail="maxCubes must be a positive integer")
    return min(value, 6)


def _default_unload_config_path(config_path: Path) -> Path:
    config_directory = config_path.parent
    local_path = config_directory / "single-cube-pick-drop.local.json"
    if local_path.exists():
        return local_path
    return config_directory / "single-cube-pick-drop.example.json"


def _load_unload_config(state: VisionServiceState) -> EdgeConfig:
    try:
        return load_edge_config(state.unload_config_path)
    except EdgeConfigError as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_UNLOAD_CONFIG", "message": str(exc)},
        ) from exc


def _require_drop_zones_path(config: EdgeConfig) -> None:
    raw = config.raw.get("dropZones")
    if not isinstance(raw, dict) or not isinstance(raw.get("path"), str) or not raw.get("path", "").strip():
        raise HTTPException(
            status_code=400,
            detail={
                "code": "MISSING_DROP_ZONES_CONFIG",
                "message": "dropZones.path is required in unload-config",
            },
        )


def _require_planning_config(config: EdgeConfig) -> None:
    if config.robot_planning.enabled is not True:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "MISSING_PLANNING_CONFIG",
                "message": "MISSING_PLANNING_CONFIG: robotPlanning.enabled=true is required",
            },
        )
    _require_drop_zones_path(config)


def _configured_hardware_port(state: VisionServiceState, payload: dict[str, Any]) -> str | None:
    request_port = payload.get("port")
    if isinstance(request_port, str) and request_port.strip():
        return request_port.strip()
    unload_config = _load_unload_config(state)
    hardware_raw = unload_config.raw.get("hardware")
    if isinstance(hardware_raw, dict):
        configured = hardware_raw.get("port")
        if isinstance(configured, str) and configured.strip():
            return configured.strip()
    if state.hardware_port:
        return state.hardware_port
    return None


def _configured_hardware_baudrate(state: VisionServiceState, payload: dict[str, Any]) -> int:
    request_baudrate = payload.get("baudrate")
    if isinstance(request_baudrate, int) and not isinstance(request_baudrate, bool) and request_baudrate > 0:
        return request_baudrate
    unload_config = _load_unload_config(state)
    hardware_raw = unload_config.raw.get("hardware")
    if isinstance(hardware_raw, dict):
        configured = hardware_raw.get("baudrate")
        if isinstance(configured, int) and not isinstance(configured, bool) and configured > 0:
            return configured
    return state.hardware_baudrate


def _missing_hardware_port_response(state: VisionServiceState) -> HTTPException:
    message = "Configure hardware.port in unload-config or provide port in request"
    _set_multi_status(state, "failed", error=f"MISSING_HARDWARE_PORT: {message}")
    return HTTPException(
        status_code=400,
        detail={
            "code": "MISSING_HARDWARE_PORT",
            "message": message,
        },
    )


def _safety_flags(payload: dict[str, Any]) -> dict[str, bool]:
    safety = payload.get("safety")
    if not isinstance(safety, dict):
        raise HTTPException(status_code=400, detail="safety confirmations are required")
    required = [
        "zoneClear",
        "operatorPresent",
        "emergencyStopReady",
        "suctionReady",
        "physicalExecutionConfirmed",
    ]
    missing = [key for key in required if safety.get(key) is not True]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing safety confirmations: {', '.join(missing)}")
    return {key: True for key in required}


def _normalize_multi_status(status: str) -> str:
    mapping = {
        "DRY_RUN_PLANNED": "planned",
        "SUCCESS": "success",
        "SUCCESS_WITH_BACKEND_SYNC_WARNINGS": "success_with_backend_sync_warnings",
        "PARTIAL_SUCCESS": "partial_success",
        "FAILED": "failed",
        "NO_VALID_QR": "failed",
        "NO_CUBES_DETECTED": "failed",
    }
    return mapping.get(status, status.lower())


def _snapshot_is_stale(state: VisionServiceState, *, ttl_seconds: float = 1.0) -> bool:
    if state.last_snapshot is None or state.last_snapshot_monotonic is None:
        return True
    return time.monotonic() - state.last_snapshot_monotonic >= ttl_seconds


def _validate_config(config: EdgeConfig, *, allow_camera: bool) -> None:
    if config.profile is EdgeRunProfile.HARDWARE:
        raise ValueError("Vision API does not run profile=hardware")
    if not config.safety.dry_run or config.safety.enable_hardware_motion:
        raise ValueError("Vision API requires dryRun=true and hardware motion disabled")
    if config.vision.source == "camera" and not allow_camera:
        raise ValueError("Camera source requires explicit --allow-camera before opening VideoCapture")


def _invalidate_snapshot(state: VisionServiceState) -> None:
    state.last_snapshot = None
    state.last_snapshot_monotonic = None
    state.last_image = None
    state.active_camera_index = None
    state.snapshot_camera_index = None


def _release_camera(state: VisionServiceState) -> None:
    if state.camera_handle is not None:
        state.camera_handle.release()
    state.camera_handle = None
    state.camera_handle_index = None


def _read_configured_camera(state: VisionServiceState) -> Any:
    camera_index = state.config.vision.camera_index
    if state.camera_handle is None:
        state.camera_handle = cv2.VideoCapture(camera_index)
        state.camera_handle_index = camera_index

    if state.camera_handle_index != camera_index:
        _release_camera(state)
        raise RuntimeError(
            f"Configured cameraIndex={camera_index} unavailable: active handle index mismatch"
        )

    if not state.camera_handle.isOpened():
        _release_camera(state)
        raise RuntimeError(f"Configured cameraIndex={camera_index} unavailable")

    ok, frame = state.camera_handle.read()
    if not ok or frame is None:
        _release_camera(state)
        raise RuntimeError(f"Configured cameraIndex={camera_index} unavailable")
    return frame


def _snapshot_signature(snapshot: DetectionSnapshot) -> str | None:
    value = snapshot.metadata.get("snapshotSignature")
    return value if isinstance(value, str) and value else None


def _qr_status(snapshot: DetectionSnapshot) -> str:
    value = snapshot.metadata.get("qrStatus")
    return value if isinstance(value, str) else "QR_NOT_DETECTED"


def _sync_payload(snapshot: DetectionSnapshot, state: VisionServiceState) -> dict[str, object]:
    signature = _snapshot_signature(snapshot)
    if not signature:
        raise ValueError("Snapshot has no snapshotSignature")
    return {
        "runId": snapshot.run_id,
        "snapshotSignature": signature,
        "timestamp": snapshot.captured_at.isoformat(),
        "source": snapshot.source,
        "truckCode": snapshot.truck_code,
        "qrDetected": bool(snapshot.metadata.get("qrDetected")),
        "qrValid": bool(snapshot.metadata.get("qrValid")),
        "qrStatus": _qr_status(snapshot),
        "cameraIndex": state.snapshot_camera_index,
        "counts": _counts(snapshot),
        "detections": [
            {
                "color": detection.color,
                "x": detection.x,
                "y": detection.y,
                "w": detection.w,
                "h": detection.h,
                "confidence": detection.confidence,
                "metadata": detection.metadata,
            }
            for detection in snapshot.detections
        ],
        "metadata": {
            "profile": state.config.profile.value,
            "dryRun": True,
            "serialOpened": False,
            "hardwareMovement": False,
            "qrRoi": snapshot.metadata.get("qrRoi"),
            "cargoRoi": snapshot.metadata.get("cargoRoi"),
            "frameSource": snapshot.frame_source,
        },
    }


def sync_snapshot_to_backend(state: VisionServiceState, snapshot: DetectionSnapshot) -> dict[str, object]:
    signature = _snapshot_signature(snapshot)
    qr_status = _qr_status(snapshot)
    if not snapshot.truck_code or qr_status != "OK":
        result: dict[str, object] = {
            "synced": False,
            "status": qr_status,
            "snapshotSignature": signature,
            "truckCode": snapshot.truck_code,
            "reason": "Valid QR is required before syncing vision detections",
        }
        state.last_sync = result
        return result
    if state.backend_client is None:
        result = {
            "synced": False,
            "status": "BACKEND_SYNC_DISABLED",
            "snapshotSignature": signature,
            "truckCode": snapshot.truck_code,
            "reason": "Backend sync is not configured",
        }
        state.last_sync = result
        return result
    if signature and state.last_synced_signature == signature:
        result = {
            "synced": False,
            "status": "DUPLICATE_LOCAL",
            "snapshotSignature": signature,
            "truckCode": snapshot.truck_code,
            "reason": "Snapshot already synced by this Edge Vision process",
        }
        state.last_sync = result
        return result

    response = state.backend_client.sync_vision_snapshot(_sync_payload(snapshot, state))
    vision_sync = response.get("visionSync") if isinstance(response.get("visionSync"), dict) else response
    result = {
        "synced": True,
        "status": "SYNCED",
        "snapshotSignature": signature,
        "truckCode": snapshot.truck_code,
        "backend": vision_sync,
    }
    state.last_synced_signature = signature
    state.last_sync = result
    return result


def plan_dry_run_from_latest_snapshot(state: VisionServiceState) -> dict[str, object]:
    snapshot = refresh_snapshot_if_needed(state)
    try:
        result = run_integrated_dry_run(
            state.config_path,
            snapshot=snapshot,
            allow_camera=False,
            backend_client=state.backend_client,
        )
    except Exception as exc:
        code = getattr(exc, "code", None)
        plan_result: dict[str, object] = {
            "planned": False,
            "status": code if isinstance(code, str) and code else "DRY_RUN_FAILED",
            "reason": str(exc),
            "runId": snapshot.run_id,
            "snapshotSignature": _snapshot_signature(snapshot),
            "truckCode": snapshot.truck_code,
            "serialOpened": False,
            "hardwareMovement": False,
        }
        state.last_dry_run_plan = plan_result
        return plan_result

    robot_plan = result.get("robotActionPlan") if isinstance(result.get("robotActionPlan"), dict) else {}
    selected_cube = result.get("selectedCube") if isinstance(result.get("selectedCube"), dict) else None
    drop_zone = result.get("dropZone") if isinstance(result.get("dropZone"), dict) else None
    backend = result.get("backend") if isinstance(result.get("backend"), dict) else None
    plan_result = {
        "planned": True,
        "status": "DRY_RUN_PLANNED",
        "runId": snapshot.run_id,
        "snapshotSignature": _snapshot_signature(snapshot),
        "truckCode": snapshot.truck_code,
        "selectedCube": selected_cube,
        "selectedCubeColor": selected_cube.get("color") if selected_cube else None,
        "dropZoneCode": drop_zone.get("code") if drop_zone else robot_plan.get("dropZoneCode"),
        "dropZonePose": drop_zone.get("pose") if drop_zone else None,
        "positionOrder": drop_zone.get("positionOrder") if drop_zone else None,
        "dryRun": True,
        "profile": state.config.profile.value,
        "serialOpened": False,
        "hardwareMovement": False,
        "sequencePreview": [
            step.get("name")
            for step in robot_plan.get("steps", [])
            if isinstance(step, dict) and isinstance(step.get("name"), str)
        ],
        "commandsPreview": [
            step.get("commandPreview")
            for step in robot_plan.get("steps", [])
            if isinstance(step, dict) and isinstance(step.get("commandPreview"), str)
        ],
        "backend": backend,
        "evidence": result.get("evidence") if isinstance(result.get("evidence"), dict) else None,
    }
    state.last_dry_run_plan = plan_result
    return plan_result


def capture_snapshot(state: VisionServiceState) -> DetectionSnapshot:
    _validate_config(state.config, allow_camera=state.allow_camera)
    if state.config.vision.source == "simulation":
        raise ValueError("Vision API snapshot requires vision.source=file or camera")

    capture = FrameCapture()
    if state.config.vision.source == "file":
        if state.config.vision.image_path is None:
            raise ValueError("vision.imagePath is required when vision.source=file")
        captured = capture.read_file(state.config.vision.image_path)
        active_camera_index = None
    elif state.config.vision.source == "camera":
        _invalidate_snapshot(state)
        frame = _read_configured_camera(state)
        captured = CapturedFrame(
            image=frame,
            source="camera",
            frame_source=f"camera:{state.config.vision.camera_index}",
        )
        active_camera_index = state.config.vision.camera_index
    else:
        raise ValueError("vision.source must be simulation, file, or camera")

    pipeline = VisionPipeline(
        qr_reader=QrReader(
            pattern=state.config.vision.qr_pattern,
            allowed_truck_codes=state.config.vision.allowed_truck_codes,
        ),
        color_detector=ColorDetector(
            state.config.vision.hsv_ranges,
            min_area=state.config.vision.min_area,
            max_area=state.config.vision.max_area,
            min_width=state.config.vision.min_width,
            max_width=state.config.vision.max_width,
            min_height=state.config.vision.min_height,
            max_height=state.config.vision.max_height,
            min_fill_ratio=state.config.vision.min_fill_ratio,
            min_aspect_ratio=state.config.vision.min_aspect_ratio,
            max_aspect_ratio=state.config.vision.max_aspect_ratio,
            overlap_threshold=state.config.vision.overlap_threshold,
            size_valid=state.config.vision.size_valid,
            morphology_kernel_size=state.config.vision.morphology_kernel_size,
        ),
    )
    snapshot = pipeline.process(
        captured.image,
        run_id=str(uuid.uuid4()),
        source=f"opencv-{captured.source}",
        frame_source=captured.frame_source,
        qr_roi=state.config.vision.qr_roi,
        cargo_roi=state.config.vision.cargo_roi,
        metadata={"profile": state.config.profile.value, "dryRun": True},
    )

    annotated = EvidenceWriter(Path("."), enabled=False).annotate(captured.image, snapshot)
    ok, encoded = cv2.imencode(".png", annotated)
    if not ok:
        raise RuntimeError("Could not encode annotated snapshot image")

    state.last_snapshot = snapshot
    state.last_snapshot_monotonic = time.monotonic()
    state.last_image = encoded.tobytes()
    state.last_error = None
    state.active_camera_index = active_camera_index
    state.snapshot_camera_index = active_camera_index
    if state.auto_sync_backend:
        try:
            sync_snapshot_to_backend(state, snapshot)
        except Exception as exc:
            state.last_sync = {
                "synced": False,
                "status": "BACKEND_ERROR",
                "snapshotSignature": _snapshot_signature(snapshot),
                "truckCode": snapshot.truck_code,
                "reason": str(exc),
            }
    return snapshot


def refresh_snapshot_if_needed(state: VisionServiceState, *, ttl_seconds: float = 1.0) -> DetectionSnapshot:
    if _snapshot_is_stale(state, ttl_seconds=ttl_seconds):
        return capture_snapshot(state)
    return state.last_snapshot


def create_app(
    config_path: Path,
    *,
    unload_config_path: Path | None = None,
    allow_camera: bool = False,
    sync_backend: bool = False,
    backend_url: str | None = None,
    hardware_port: str | None = None,
    hardware_baudrate: int = 115200,
) -> FastAPI:
    config = load_edge_config(config_path)
    backend_client = BackendClient(backend_url) if backend_url else None
    state = VisionServiceState(
        config=config,
        config_path=config_path,
        unload_config_path=unload_config_path or _default_unload_config_path(config_path),
        allow_camera=allow_camera,
        backend_client=backend_client,
        auto_sync_backend=sync_backend,
        hardware_port=hardware_port,
        hardware_baudrate=hardware_baudrate,
    )

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        try:
            yield
        finally:
            _release_camera(state)

    app = FastAPI(title="RoboDock Edge Vision API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    app.state.vision_state = state

    try:
        _validate_config(config, allow_camera=allow_camera)
    except Exception as exc:
        state.last_error = str(exc)

    @app.get("/health")
    def health() -> JSONResponse:
        return _json_no_store({
            "status": "ok",
            "service": "robodock-edge-vision",
            "serialOpened": False,
            "hardwareMovement": False,
        })

    @app.get("/vision/status")
    def vision_status() -> JSONResponse:
        return _json_no_store(_status_payload(state))

    @app.get("/vision/snapshot")
    def vision_snapshot() -> JSONResponse:
        try:
            refresh_snapshot_if_needed(state)
        except Exception as exc:
            state.last_error = str(exc)
        return _json_no_store(_snapshot_payload(state))

    @app.post("/vision/sync-backend")
    def vision_sync_backend() -> JSONResponse:
        try:
            snapshot = refresh_snapshot_if_needed(state)
            result = sync_snapshot_to_backend(state, snapshot)
        except BackendApiError as exc:
            result = {
                "synced": False,
                "status": "BACKEND_ERROR",
                "reason": str(exc),
            }
            state.last_sync = result
        except Exception as exc:
            result = {
                "synced": False,
                "status": "SYNC_ERROR",
                "reason": str(exc),
            }
            state.last_sync = result
        return _json_no_store(result)

    @app.post("/vision/plan-dry-run")
    def vision_plan_dry_run() -> JSONResponse:
        result = plan_dry_run_from_latest_snapshot(state)
        return _json_no_store(result)

    @app.post("/drop-zones/reset")
    def drop_zones_reset(payload: dict[str, Any] = Body(default_factory=dict)) -> JSONResponse:
        scope = payload.get("scope", "all")
        if scope != "all":
            raise HTTPException(status_code=400, detail="Only scope=all is supported by the dashboard reset")
        try:
            unload_config = _load_unload_config(state)
            _require_drop_zones_path(unload_config)
            result = reset_drop_zones(state.unload_config_path, reset_all=True, confirm_reset=True)
        except ResetDropZonesError as exc:
            raise HTTPException(status_code=400, detail={"code": exc.code, "message": str(exc)}) from exc
        return _json_no_store(
            {
                "status": "SUCCESS",
                "dropZonesPath": result["file"],
                "backupPath": result["backup"],
                "totalSlots": result["totalSlotsReviewed"],
                "resetSlots": result["totalSlotsReset"],
                "affectedColors": result["affectedColors"],
            }
        )

    @app.post("/operation/reset")
    def operation_reset(payload: dict[str, Any] = Body(default_factory=dict)) -> JSONResponse:
        reset_drop_zones_requested = payload.get("resetDropZones", True) is not False
        drop_zones_result: dict[str, object] | None = None
        drop_zones_warning: str | None = None

        _reset_multi_cube_operation(state)

        if reset_drop_zones_requested:
            try:
                unload_config = _load_unload_config(state)
                _require_drop_zones_path(unload_config)
                result = reset_drop_zones(state.unload_config_path, reset_all=True, confirm_reset=True)
                drop_zones_result = {
                    "status": "SUCCESS",
                    "dropZonesPath": result["file"],
                    "backupPath": result["backup"],
                    "totalSlots": result["totalSlotsReviewed"],
                    "resetSlots": result["totalSlotsReset"],
                    "affectedColors": result["affectedColors"],
                }
            except (ResetDropZonesError, HTTPException) as exc:
                detail = exc.detail if isinstance(exc, HTTPException) else {"code": exc.code, "message": str(exc)}
                drop_zones_warning = str(detail)

        return _json_no_store(
            {
                "status": "SUCCESS",
                "multiCubeStatus": _multi_status_payload(state),
                "dropZonesReset": drop_zones_result,
                "warning": drop_zones_warning,
            }
        )

    @app.post("/robot/multi-cube/plan")
    def robot_multi_cube_plan(payload: dict[str, Any] = Body(default_factory=dict)) -> JSONResponse:
        if state.multi_cube_executing:
            raise HTTPException(status_code=409, detail="A multi-cube execution is already in progress")
        max_cubes = _max_cubes_from_payload(payload)
        _set_multi_status(state, "planning", error=None)
        try:
            unload_config = _load_unload_config(state)
            _require_planning_config(unload_config)
            snapshot = refresh_snapshot_if_needed(state, ttl_seconds=0)
            result = run_multi_cube_pick_drop(
                state.unload_config_path,
                snapshot=snapshot,
                max_cubes=max_cubes,
                plan_only=True,
                backend_client=None,
            )
        except HTTPException as exc:
            detail = exc.detail
            message = detail.get("message") if isinstance(detail, dict) else str(detail)
            _set_multi_status(state, "failed", error=str(message))
            raise
        except MultiCubePickDropError as exc:
            error = str(exc)
            _set_multi_status(state, "failed", error=error)
            raise HTTPException(status_code=400, detail={"code": exc.code, "message": error}) from exc
        except Exception as exc:
            error = str(exc)
            _set_multi_status(state, "failed", error=error)
            raise HTTPException(status_code=400, detail=error) from exc

        status = str(result.get("status", "FAILED"))
        normalized = _normalize_multi_status(status)
        _set_multi_status(
            state,
            normalized,
            run_id=str(result.get("runId")) if result.get("runId") else None,
            plan=result,
            error=None if normalized == "planned" else status,
        )
        if normalized == "planned":
            state.multi_cube_plan_snapshot = snapshot
        return _json_no_store(result)

    @app.post("/robot/multi-cube/execute")
    def robot_multi_cube_execute(payload: dict[str, Any] = Body(default_factory=dict)) -> JSONResponse:
        if state.multi_cube_executing:
            raise HTTPException(status_code=409, detail="A multi-cube execution is already in progress")
        if not state.multi_cube_last_plan or state.multi_cube_status != "planned":
            raise HTTPException(status_code=409, detail="Planificacion previa requerida")

        _safety_flags(payload)
        max_cubes = _max_cubes_from_payload(payload)
        requested_run_id = payload.get("runId")
        if requested_run_id and requested_run_id != state.multi_cube_run_id:
            raise HTTPException(status_code=409, detail="runId does not match the latest planned run")
        if state.multi_cube_plan_snapshot is None:
            raise HTTPException(status_code=409, detail="Plan snapshot is not available")

        port = _configured_hardware_port(state, payload)
        baudrate = _configured_hardware_baudrate(state, payload)
        if port is None:
            raise _missing_hardware_port_response(state)
        evidence = state.multi_cube_last_plan.get("evidence")
        evidence_path = None
        if isinstance(evidence, dict) and isinstance(evidence.get("json"), str):
            evidence_path = Path(evidence["json"])
        if evidence_path is None:
            raise HTTPException(status_code=409, detail="Plan evidence is not available")

        state.multi_cube_executing = True
        _set_multi_status(state, "executing", error=None)
        try:
            snapshot = state.multi_cube_plan_snapshot
            result = run_multi_cube_pick_drop(
                state.unload_config_path,
                snapshot=snapshot,
                max_cubes=max_cubes,
                dry_run_evidence_path=evidence_path,
                gates=MultiHardwareGates(
                    confirm_multi_pick_drop=True,
                    enable_hardware_motion=True,
                    confirm_zone_clear=True,
                    confirm_operator_present=True,
                    confirm_emergency_stop_ready=True,
                    confirm_suction=True,
                    port=port,
                    baudrate=baudrate,
                ),
                backend_client=state.backend_client,
                post_drop_snapshot_loader=lambda: refresh_snapshot_if_needed(state, ttl_seconds=0),
            )
        except HTTPException:
            raise
        except MultiCubePickDropError as exc:
            error = str(exc)
            _set_multi_status(state, "failed", error=error)
            raise HTTPException(status_code=400, detail={"code": exc.code, "message": error}) from exc
        except Exception as exc:
            error = str(exc)
            _set_multi_status(state, "failed", error=error)
            raise HTTPException(status_code=400, detail=error) from exc
        finally:
            state.multi_cube_executing = False

        status = str(result.get("status", "FAILED"))
        normalized = _normalize_multi_status(status)
        _set_multi_status(
            state,
            normalized,
            run_id=str(result.get("runId")) if result.get("runId") else None,
            result=result,
            error=None if normalized in {"success", "partial_success"} else str(result.get("errorMessage") or status),
        )
        return _json_no_store(result)

    @app.get("/robot/multi-cube/status")
    def robot_multi_cube_status() -> JSONResponse:
        return _json_no_store(_multi_status_payload(state))

    @app.get("/vision/snapshot/image")
    def vision_snapshot_image() -> Response:
        if (
            state.config.vision.source == "camera"
            and state.snapshot_camera_index != state.config.vision.camera_index
        ):
            return Response(
                "Imagen no disponible",
                status_code=404,
                media_type="text/plain",
                headers=_no_store_headers(),
            )
        if not state.last_image:
            return Response(
                "Imagen no disponible",
                status_code=404,
                media_type="text/plain",
                headers=_no_store_headers(),
            )
        return Response(
            content=state.last_image,
            media_type="image/png",
            headers=_no_store_headers(),
        )

    return app


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve safe Edge Vision status and snapshots.")
    parser.add_argument("--config", default="config/edge.vision.example.json", help="Path to Edge config JSON.")
    parser.add_argument(
        "--unload-config",
        default=None,
        help=(
            "Path to operational unload config with robotPlanning/dropZones. "
            "If omitted, Edge uses config/single-cube-pick-drop.local.json when present, "
            "then config/single-cube-pick-drop.example.json as development/test fallback."
        ),
    )
    parser.add_argument(
        "--allow-camera",
        action="store_true",
        help="Explicitly allow opening the configured camera for snapshots.",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Bind host.")
    parser.add_argument("--port", type=int, default=8001, help="Bind port.")
    parser.add_argument(
        "--sync-backend",
        action="store_true",
        help="Sync each fresh valid-QR snapshot to Backend without frontend involvement.",
    )
    parser.add_argument("--backend-url", default="http://localhost:3000", help="Backend URL for vision sync.")
    parser.add_argument("--hardware-port", default=os.getenv("EDGE_MAXARM_PORT"), help="Serial port used by dashboard hardware execution, for example COM4.")
    parser.add_argument("--hardware-baudrate", type=int, default=115200, help="Serial baudrate used by dashboard hardware execution.")
    args = parser.parse_args()

    import uvicorn

    uvicorn.run(
        create_app(
            Path(args.config),
            unload_config_path=Path(args.unload_config) if args.unload_config else None,
            allow_camera=args.allow_camera,
            sync_backend=args.sync_backend,
            backend_url=args.backend_url if args.sync_backend else args.backend_url,
            hardware_port=args.hardware_port,
            hardware_baudrate=args.hardware_baudrate,
        ),
        host=args.host,
        port=args.port,
    )


if __name__ == "__main__":
    main()

from __future__ import annotations

import argparse
import sys
import time
import uuid
from contextlib import asynccontextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from ..config import EdgeConfig, load_edge_config
    from ..models import DetectionSnapshot, EdgeRunProfile, SUPPORTED_COLORS
    from ..vision.capture import CapturedFrame, FrameCapture
    from ..vision.color_detector import ColorDetector
    from ..vision.evidence import EvidenceWriter, snapshot_to_dict
    from ..vision.pipeline import VisionPipeline
    from ..vision.qr_reader import QrReader
except ImportError:
    sys.path.append(str(Path(__file__).resolve().parents[1]))
    from config import EdgeConfig, load_edge_config
    from models import DetectionSnapshot, EdgeRunProfile, SUPPORTED_COLORS
    from vision.capture import CapturedFrame, FrameCapture
    from vision.color_detector import ColorDetector
    from vision.evidence import EvidenceWriter, snapshot_to_dict
    from vision.pipeline import VisionPipeline
    from vision.qr_reader import QrReader


@dataclass
class VisionServiceState:
    config: EdgeConfig
    allow_camera: bool
    last_snapshot: DetectionSnapshot | None = None
    last_snapshot_monotonic: float | None = None
    last_image: bytes | None = None
    last_error: str | None = None
    active_camera_index: int | None = None
    snapshot_camera_index: int | None = None
    camera_handle: Any | None = None
    camera_handle_index: int | None = None

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
        "configuredCameraIndex": state.config.vision.camera_index if state.config.vision.source == "camera" else None,
        "activeCameraIndex": state.active_camera_index,
        "snapshotCameraIndex": state.snapshot_camera_index,
        "cameraAllowed": state.allow_camera,
        "lastSnapshotAt": state.last_snapshot.captured_at.isoformat() if state.last_snapshot else None,
        "lastError": state.last_error,
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
    return {
        "runId": payload["runId"],
        "timestamp": payload["timestamp"],
        "source": payload["source"],
        "truckCode": payload["truckCode"],
        "counts": _counts(snapshot),
        "detections": payload["detections"],
        "imageUrl": "/vision/snapshot/image" if state.last_image else None,
        "snapshotCameraIndex": state.snapshot_camera_index,
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
    return snapshot


def refresh_snapshot_if_needed(state: VisionServiceState, *, ttl_seconds: float = 1.0) -> DetectionSnapshot:
    if _snapshot_is_stale(state, ttl_seconds=ttl_seconds):
        return capture_snapshot(state)
    return state.last_snapshot


def create_app(config_path: Path, *, allow_camera: bool = False) -> FastAPI:
    config = load_edge_config(config_path)
    state = VisionServiceState(config=config, allow_camera=allow_camera)

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
        allow_methods=["GET"],
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
        "--allow-camera",
        action="store_true",
        help="Explicitly allow opening the configured camera for snapshots.",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Bind host.")
    parser.add_argument("--port", type=int, default=8001, help="Bind port.")
    args = parser.parse_args()

    import uvicorn

    uvicorn.run(
        create_app(Path(args.config), allow_camera=args.allow_camera),
        host=args.host,
        port=args.port,
    )


if __name__ == "__main__":
    main()

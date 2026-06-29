from __future__ import annotations

import argparse
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

try:
    from ..config import EdgeConfig, load_edge_config
    from ..models import DetectionSnapshot, EdgeRunProfile, SUPPORTED_COLORS
    from ..vision.capture import FrameCapture
    from ..vision.color_detector import ColorDetector
    from ..vision.evidence import EvidenceWriter, snapshot_to_dict
    from ..vision.pipeline import VisionPipeline
    from ..vision.qr_reader import QrReader
except ImportError:
    sys.path.append(str(Path(__file__).resolve().parents[1]))
    from config import EdgeConfig, load_edge_config
    from models import DetectionSnapshot, EdgeRunProfile, SUPPORTED_COLORS
    from vision.capture import FrameCapture
    from vision.color_detector import ColorDetector
    from vision.evidence import EvidenceWriter, snapshot_to_dict
    from vision.pipeline import VisionPipeline
    from vision.qr_reader import QrReader


@dataclass
class VisionServiceState:
    config: EdgeConfig
    allow_camera: bool
    last_snapshot: DetectionSnapshot | None = None
    last_image: bytes | None = None
    last_error: str | None = None

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
        "lastError": state.last_error,
    }


def _validate_config(config: EdgeConfig, *, allow_camera: bool) -> None:
    if config.profile is EdgeRunProfile.HARDWARE:
        raise ValueError("Vision API does not run profile=hardware")
    if not config.safety.dry_run or config.safety.enable_hardware_motion:
        raise ValueError("Vision API requires dryRun=true and hardware motion disabled")
    if config.vision.source == "camera" and not allow_camera:
        raise ValueError("Camera source requires explicit --allow-camera before opening VideoCapture")


def capture_snapshot(state: VisionServiceState) -> DetectionSnapshot:
    _validate_config(state.config, allow_camera=state.allow_camera)
    if state.config.vision.source == "simulation":
        raise ValueError("Vision API snapshot requires vision.source=file or camera")

    capture = FrameCapture()
    if state.config.vision.source == "file":
        if state.config.vision.image_path is None:
            raise ValueError("vision.imagePath is required when vision.source=file")
        captured = capture.read_file(state.config.vision.image_path)
    elif state.config.vision.source == "camera":
        captured = capture.read_camera(state.config.vision.camera_index)
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
            min_fill_ratio=state.config.vision.min_fill_ratio,
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
    state.last_image = encoded.tobytes()
    state.last_error = None
    return snapshot


def create_app(config_path: Path, *, allow_camera: bool = False) -> FastAPI:
    config = load_edge_config(config_path)
    state = VisionServiceState(config=config, allow_camera=allow_camera)

    app = FastAPI(title="RoboDock Edge Vision API")
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
    def health() -> dict[str, object]:
        return {
            "status": "ok",
            "service": "robodock-edge-vision",
            "serialOpened": False,
            "hardwareMovement": False,
        }

    @app.get("/vision/status")
    def vision_status() -> dict[str, object]:
        return _status_payload(state)

    @app.get("/vision/snapshot")
    def vision_snapshot() -> dict[str, object]:
        try:
            capture_snapshot(state)
        except Exception as exc:
            state.last_error = str(exc)
        return _snapshot_payload(state)

    @app.get("/vision/snapshot/image")
    def vision_snapshot_image() -> Response:
        if not state.last_image:
            return Response("Imagen no disponible", status_code=404, media_type="text/plain")
        return Response(content=state.last_image, media_type="image/png")

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

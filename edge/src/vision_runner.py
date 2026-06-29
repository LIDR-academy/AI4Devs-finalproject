from __future__ import annotations

import argparse
import json
import uuid
from pathlib import Path

try:
    from .config import load_edge_config
    from .models import EdgeRunProfile
    from .vision.capture import FrameCapture
    from .vision.color_detector import ColorDetector
    from .vision.evidence import EvidenceWriter, snapshot_to_dict
    from .vision.pipeline import VisionPipeline
    from .vision.qr_reader import QrReader
except ImportError:
    from config import load_edge_config
    from models import EdgeRunProfile
    from vision.capture import FrameCapture
    from vision.color_detector import ColorDetector
    from vision.evidence import EvidenceWriter, snapshot_to_dict
    from vision.pipeline import VisionPipeline
    from vision.qr_reader import QrReader


def run_vision(
    config_path: Path,
    *,
    allow_camera: bool = False,
    save_evidence: bool = False,
) -> dict[str, object]:
    config = load_edge_config(config_path)
    if config.profile is not EdgeRunProfile.VISION_DRY_RUN:
        raise ValueError("Vision runner requires profile=vision-dry-run")
    if not config.safety.dry_run or config.safety.enable_hardware_motion:
        raise ValueError("Vision runner requires dryRun=true and hardware motion disabled")

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
        raise ValueError("Vision runner requires vision.source=file or camera")

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
    snapshot = pipeline.process(
        captured.image,
        run_id=str(uuid.uuid4()),
        source=f"opencv-{captured.source}",
        frame_source=captured.frame_source,
        qr_roi=config.vision.qr_roi,
        cargo_roi=config.vision.cargo_roi,
        metadata={"profile": config.profile.value, "dryRun": True},
    )
    evidence = EvidenceWriter(
        config.vision.evidence_directory,
        enabled=save_evidence,
    ).write(snapshot, frame=captured.image)
    return {**snapshot_to_dict(snapshot), "evidence": evidence}


def main() -> None:
    parser = argparse.ArgumentParser(description="Process one image or camera frame without robot movement.")
    parser.add_argument("--config", default="config/edge.config.example.json", help="Path to Edge config JSON.")
    parser.add_argument(
        "--allow-camera",
        action="store_true",
        help="Explicitly allow opening the configured camera for one frame.",
    )
    parser.add_argument(
        "--save-evidence",
        action="store_true",
        help="Write snapshot JSON and annotated image to the configured evidence directory.",
    )
    args = parser.parse_args()
    result = run_vision(
        Path(args.config),
        allow_camera=args.allow_camera,
        save_evidence=args.save_evidence,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

import numpy as np

from src.models import CubeDetection, DetectionSnapshot
from src.vision.evidence import EvidenceWriter, snapshot_to_dict


class EvidenceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.snapshot = DetectionSnapshot(
            run_id="run-safe",
            source="file",
            truck_code="TRUCK-001",
            detections=(CubeDetection("red", 1, 2, 3, 4, None),),
            frame_source="fixtures/truck.png",
            metadata={"apiToken": "remove-me", "safe": "keep-me"},
        )

    def test_snapshot_serialization_has_one_detection_structure(self) -> None:
        payload = snapshot_to_dict(self.snapshot)

        self.assertIn("detections", payload)
        self.assertNotIn("cubes", payload)
        self.assertEqual("truck.png", payload["frameSource"])
        self.assertNotIn("apiToken", payload["metadata"])
        json.dumps(payload)

    def test_disabled_evidence_does_not_create_directory(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "evidence"

            result = EvidenceWriter(output, enabled=False).write(self.snapshot)

            self.assertEqual({}, result)
            self.assertFalse(output.exists())

    def test_writes_json_without_requiring_frame(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory)

            result = EvidenceWriter(output, enabled=True).write(self.snapshot)
            payload = json.loads((output / result["json"]).read_text(encoding="utf-8"))

            self.assertEqual("run-safe", payload["runId"])
            self.assertNotIn("annotatedImage", result)

    def test_sanitizes_run_id_used_in_evidence_filename(self) -> None:
        unsafe_snapshot = DetectionSnapshot(
            run_id="../unsafe run",
            source="file",
            detections=(),
        )
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory)

            result = EvidenceWriter(output, enabled=True).write(unsafe_snapshot)

            self.assertNotIn("..", result["json"])
            self.assertNotIn("/", result["json"])
            self.assertTrue((output / result["json"]).exists())

    def test_annotate_draws_cargo_roi_overlay(self) -> None:
        frame = np.zeros((100, 120, 3), dtype=np.uint8)
        snapshot = DetectionSnapshot(
            run_id="run-roi",
            source="file",
            detections=(),
            metadata={
                "cargoRoi": {"x": 10, "y": 20, "w": 50, "h": 40},
                "qrStatus": "QR_NOT_DETECTED",
            },
        )

        annotated = EvidenceWriter.annotate(frame, snapshot)

        self.assertGreater(int(annotated[60, 10, 1]), 150)

    def test_annotate_draws_qr_roi_overlay_without_qr_detection(self) -> None:
        frame = np.zeros((100, 120, 3), dtype=np.uint8)
        snapshot = DetectionSnapshot(
            run_id="run-qr-roi",
            source="file",
            detections=(),
            metadata={
                "qrRoi": {"x": 70, "y": 15, "w": 30, "h": 30},
                "qrStatus": "QR_NOT_DETECTED",
            },
        )

        annotated = EvidenceWriter.annotate(frame, snapshot)

        self.assertGreater(int(annotated[45, 70, 0]), 150)
        self.assertGreater(int(annotated[45, 70, 2]), 150)

    def test_annotate_keeps_qr_roi_visible_with_qr_detected(self) -> None:
        frame = np.zeros((100, 120, 3), dtype=np.uint8)
        snapshot = DetectionSnapshot(
            run_id="run-qr-ok",
            source="file",
            truck_code="TRUCK-001",
            detections=(CubeDetection("red", 20, 30, 20, 20, None),),
            metadata={
                "qrRoi": {"x": 70, "y": 15, "w": 30, "h": 30},
                "qrStatus": "OK",
                "qrDetected": True,
                "qrValid": True,
            },
        )

        annotated = EvidenceWriter.annotate(frame, snapshot)

        self.assertGreater(int(annotated[45, 70, 0]), 150)
        self.assertGreater(int(annotated[45, 70, 2]), 150)


if __name__ == "__main__":
    unittest.main()

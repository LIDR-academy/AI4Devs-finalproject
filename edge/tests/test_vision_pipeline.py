from __future__ import annotations

import unittest
from unittest.mock import Mock

import numpy as np

from src.models import CubeDetection
from src.vision.pipeline import VisionPipeline
from src.vision.qr_reader import QrReadResult


class VisionPipelineTests(unittest.TestCase):
    def test_generates_complete_detection_snapshot(self) -> None:
        qr_reader = Mock()
        qr_reader.read.return_value = QrReadResult(
            raw_value="TRUCK-001",
            truck_code="TRUCK-001",
            is_valid=True,
            detected=True,
        )
        color_detector = Mock()
        color_detector.detect.return_value = (
            CubeDetection("red", 10, 20, 30, 40, None),
        )
        frame = np.zeros((120, 160, 3), dtype=np.uint8)

        result = VisionPipeline(qr_reader, color_detector).process(
            frame,
            run_id="run-vision",
            source="file",
            frame_source="fixture.png",
            qr_roi=None,
            cargo_roi=None,
            metadata={"qrValid": False},
        )

        self.assertEqual("run-vision", result.run_id)
        self.assertEqual("TRUCK-001", result.truck_code)
        self.assertEqual(1, len(result.detections))
        self.assertEqual(160, result.metadata["frameWidth"])
        self.assertEqual(120, result.metadata["frameHeight"])
        self.assertEqual("TRUCK-001", result.metadata["qrRawValue"])
        self.assertTrue(result.metadata["qrValid"])
        self.assertEqual("OK", result.metadata["qrStatus"])
        self.assertEqual({"red": 1, "blue": 0, "green": 0, "yellow": 0, "total": 1}, result.metadata["counts"])
        self.assertIsInstance(result.metadata["snapshotSignature"], str)

    def test_snapshot_marks_missing_qr_without_blocking_detections(self) -> None:
        qr_reader = Mock()
        qr_reader.read.return_value = QrReadResult(
            raw_value=None,
            truck_code=None,
            is_valid=False,
            detected=False,
        )
        color_detector = Mock()
        color_detector.detect.return_value = (
            CubeDetection("blue", 10, 20, 30, 40, None),
        )
        frame = np.zeros((120, 160, 3), dtype=np.uint8)

        result = VisionPipeline(qr_reader, color_detector).process(
            frame,
            run_id="run-vision",
            source="file",
            frame_source="fixture.png",
            qr_roi=None,
            cargo_roi=None,
        )

        self.assertIsNone(result.truck_code)
        self.assertFalse(result.metadata["qrDetected"])
        self.assertFalse(result.metadata["qrValid"])
        self.assertEqual("QR_NOT_DETECTED", result.metadata["qrStatus"])
        self.assertEqual(1, result.metadata["counts"]["total"])

    def test_same_visual_state_generates_same_snapshot_signature(self) -> None:
        qr_reader = Mock()
        qr_reader.read.return_value = QrReadResult(
            raw_value="TRUCK-001",
            truck_code="TRUCK-001",
            is_valid=True,
            detected=True,
        )
        color_detector = Mock()
        color_detector.detect.return_value = (
            CubeDetection("red", 10, 20, 30, 40, None, {"sizeValid": True}),
        )
        frame = np.zeros((120, 160, 3), dtype=np.uint8)
        pipeline = VisionPipeline(qr_reader, color_detector)

        first = pipeline.process(
            frame,
            run_id="run-1",
            source="opencv-file",
            frame_source="fixture.png",
            qr_roi=None,
            cargo_roi=None,
        )
        second = pipeline.process(
            frame,
            run_id="run-2",
            source="opencv-file",
            frame_source="fixture.png",
            qr_roi=None,
            cargo_roi=None,
        )

        self.assertEqual(first.metadata["snapshotSignature"], second.metadata["snapshotSignature"])

    def test_different_detections_generate_different_snapshot_signature(self) -> None:
        qr_reader = Mock()
        qr_reader.read.return_value = QrReadResult(
            raw_value="TRUCK-001",
            truck_code="TRUCK-001",
            is_valid=True,
            detected=True,
        )
        color_detector = Mock()
        frame = np.zeros((120, 160, 3), dtype=np.uint8)
        pipeline = VisionPipeline(qr_reader, color_detector)

        color_detector.detect.return_value = (
            CubeDetection("red", 10, 20, 30, 40, None, {"sizeValid": True}),
        )
        first = pipeline.process(
            frame,
            run_id="run-1",
            source="opencv-file",
            frame_source="fixture.png",
            qr_roi=None,
            cargo_roi=None,
        )
        color_detector.detect.return_value = (
            CubeDetection("red", 11, 20, 30, 40, None, {"sizeValid": True}),
        )
        second = pipeline.process(
            frame,
            run_id="run-2",
            source="opencv-file",
            frame_source="fixture.png",
            qr_roi=None,
            cargo_roi=None,
        )

        self.assertNotEqual(first.metadata["snapshotSignature"], second.metadata["snapshotSignature"])


if __name__ == "__main__":
    unittest.main()

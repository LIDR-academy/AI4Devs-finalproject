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


if __name__ == "__main__":
    unittest.main()

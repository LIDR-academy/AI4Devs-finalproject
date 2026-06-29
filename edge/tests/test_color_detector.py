from __future__ import annotations

import unittest

import cv2
import numpy as np

from src.config import DEFAULT_HSV_RANGES
from src.models import RegionOfInterest
from src.vision.capture import VisionInputError
from src.vision.color_detector import ColorDetector


def synthetic_color_frame() -> np.ndarray:
    hsv = np.zeros((220, 420, 3), dtype=np.uint8)
    patches = [
        ((20, 20), (80, 80), (0, 255, 255)),
        ((100, 20), (160, 80), (175, 255, 255)),
        ((180, 20), (240, 80), (115, 255, 255)),
        ((260, 20), (320, 80), (60, 255, 255)),
        ((340, 20), (400, 80), (28, 255, 255)),
    ]
    for top_left, bottom_right, color in patches:
        cv2.rectangle(hsv, top_left, bottom_right, color, -1)
    cv2.rectangle(hsv, (10, 150), (12, 152), (0, 255, 255), -1)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)


class ColorDetectorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.detector = ColorDetector(
            DEFAULT_HSV_RANGES,
            min_area=100,
            max_area=10000,
            min_fill_ratio=0.5,
            morphology_kernel_size=3,
        )

    def test_detects_supported_colors_and_both_red_ranges(self) -> None:
        detections = self.detector.detect(synthetic_color_frame())
        colors = [detection.color for detection in detections]

        self.assertEqual(2, colors.count("red"))
        self.assertEqual(1, colors.count("blue"))
        self.assertEqual(1, colors.count("green"))
        self.assertEqual(1, colors.count("yellow"))
        self.assertEqual(5, len(detections))
        self.assertTrue(all(detection.metadata["sizeValid"] for detection in detections))

    def test_roi_keeps_global_coordinates(self) -> None:
        frame = np.zeros((200, 200, 3), dtype=np.uint8)
        frame[70:120, 80:130] = (0, 0, 255)

        detections = self.detector.detect(
            frame,
            RegionOfInterest(x=50, y=50, w=100, h=100),
        )

        self.assertEqual(1, len(detections))
        self.assertGreaterEqual(detections[0].x, 79)
        self.assertGreaterEqual(detections[0].y, 69)

    def test_roi_out_of_range_fails_closed(self) -> None:
        frame = np.zeros((100, 100, 3), dtype=np.uint8)

        with self.assertRaises(VisionInputError):
            self.detector.detect(frame, RegionOfInterest(x=90, y=0, w=20, h=20))


if __name__ == "__main__":
    unittest.main()


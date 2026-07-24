from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

import cv2
import numpy as np

from src.models import RegionOfInterest
from src.vision.capture import FrameCapture, VisionInputError, crop_frame


class CaptureTests(unittest.TestCase):
    def test_file_capture_does_not_open_camera(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            image_path = Path(temporary_directory) / "fixture.png"
            cv2.imwrite(str(image_path), np.zeros((20, 30, 3), dtype=np.uint8))

            with patch("src.vision.capture.cv2.VideoCapture") as video_capture:
                captured = FrameCapture().read_file(image_path)

            video_capture.assert_not_called()
            self.assertEqual("file", captured.source)
            self.assertEqual("fixture.png", captured.frame_source)
            self.assertEqual((20, 30, 3), captured.image.shape)

    def test_camera_open_failure_is_controlled_and_releases_handle(self) -> None:
        camera = Mock()
        camera.isOpened.return_value = False

        with patch("src.vision.capture.cv2.VideoCapture", return_value=camera):
            with self.assertRaises(VisionInputError):
                FrameCapture().read_camera(3)

        camera.release.assert_called_once()

    def test_roi_partially_outside_frame_fails_closed(self) -> None:
        frame = np.zeros((100, 100, 3), dtype=np.uint8)

        with self.assertRaises(VisionInputError):
            crop_frame(frame, RegionOfInterest(x=80, y=80, w=30, h=30))


if __name__ == "__main__":
    unittest.main()


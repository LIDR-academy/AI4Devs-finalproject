from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import cv2
import numpy as np

from src.vision_runner import run_vision
from tests.helpers import write_json


class VisionRunnerTests(unittest.TestCase):
    def test_processes_image_file_without_opening_camera(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            image_path = directory / "fixture.png"
            frame = np.zeros((120, 160, 3), dtype=np.uint8)
            frame[20:80, 30:90] = (0, 0, 255)
            cv2.imwrite(str(image_path), frame)
            config_path = directory / "edge.json"
            write_json(
                config_path,
                {
                    "profile": "vision-dry-run",
                    "vision": {
                        "source": "file",
                        "imagePath": "fixture.png",
                        "detection": {
                            "minArea": 100,
                            "maxArea": 10000,
                            "minFillRatio": 0.5,
                        },
                    },
                },
            )

            with patch("src.vision.capture.cv2.VideoCapture") as video_capture:
                result = run_vision(config_path)

            video_capture.assert_not_called()
            self.assertEqual("file", result["source"])
            self.assertEqual("fixture.png", result["frameSource"])
            self.assertEqual("red", result["detections"][0]["color"])
            self.assertEqual({}, result["evidence"])

    def test_camera_source_requires_explicit_flag_before_open(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = Path(temporary_directory) / "edge.json"
            write_json(
                config_path,
                {
                    "profile": "vision-dry-run",
                    "vision": {"source": "camera", "cameraIndex": 1},
                },
            )

            with patch("src.vision_runner.FrameCapture.read_camera") as read_camera:
                with self.assertRaisesRegex(ValueError, "explicit --allow-camera"):
                    run_vision(config_path)

            read_camera.assert_not_called()


if __name__ == "__main__":
    unittest.main()


from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import cv2
import numpy as np
from fastapi.testclient import TestClient

from src.service.vision_api import create_app
from tests.helpers import write_json


class VisionApiTests(unittest.TestCase):
    def _write_file_config(self, directory: Path) -> Path:
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
        return config_path

    def test_health_returns_safe_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))
            client = TestClient(create_app(config_path))

            response = client.get("/health")

            self.assertEqual(200, response.status_code)
            self.assertEqual("ok", response.json()["status"])
            self.assertFalse(response.json()["serialOpened"])
            self.assertFalse(response.json()["hardwareMovement"])

    def test_status_without_snapshot_does_not_open_camera(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))

            with patch("src.vision.capture.cv2.VideoCapture") as video_capture:
                client = TestClient(create_app(config_path))
                response = client.get("/vision/status")

            video_capture.assert_not_called()
            payload = response.json()
            self.assertEqual("ok", payload["status"])
            self.assertEqual("vision-dry-run", payload["profile"])
            self.assertEqual("opencv-file", payload["source"])
            self.assertIsNone(payload["lastSnapshotAt"])
            self.assertFalse(payload["serialOpened"])
            self.assertFalse(payload["hardwareMovement"])

    def test_snapshot_from_fixture_returns_counts_and_image_url(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))

            with patch("src.vision.capture.cv2.VideoCapture") as video_capture:
                client = TestClient(create_app(config_path))
                response = client.get("/vision/snapshot")

            video_capture.assert_not_called()
            payload = response.json()
            self.assertEqual(200, response.status_code)
            self.assertEqual("opencv-file", payload["source"])
            self.assertEqual(1, payload["counts"]["red"])
            self.assertEqual("red", payload["detections"][0]["color"])
            self.assertEqual("/vision/snapshot/image", payload["imageUrl"])
            self.assertIsNone(payload["lastError"])

            image_response = client.get("/vision/snapshot/image")
            self.assertEqual(200, image_response.status_code)
            self.assertEqual("image/png", image_response.headers["content-type"])

    def test_image_endpoint_is_controlled_when_no_snapshot_exists(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))
            client = TestClient(create_app(config_path))

            response = client.get("/vision/snapshot/image")

            self.assertEqual(404, response.status_code)
            self.assertIn("Imagen no disponible", response.text)

    def test_camera_source_is_blocked_without_allow_camera(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = Path(temporary_directory) / "edge.json"
            write_json(
                config_path,
                {
                    "profile": "vision-dry-run",
                    "vision": {"source": "camera", "cameraIndex": 0},
                },
            )

            with patch("src.service.vision_api.FrameCapture.read_camera") as read_camera:
                client = TestClient(create_app(config_path, allow_camera=False))
                status_response = client.get("/vision/status")
                snapshot_response = client.get("/vision/snapshot")

            read_camera.assert_not_called()
            self.assertIn("requires explicit --allow-camera", status_response.json()["lastError"])
            self.assertIn("requires explicit --allow-camera", snapshot_response.json()["lastError"])
            self.assertFalse(status_response.json()["cameraAllowed"])

    def test_unsafe_config_fails_before_capture(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            image_path = directory / "fixture.png"
            cv2.imwrite(str(image_path), np.zeros((20, 20, 3), dtype=np.uint8))
            config_path = directory / "edge.json"
            write_json(
                config_path,
                {
                    "profile": "vision-dry-run",
                    "safety": {
                        "dryRun": False,
                        "enableHardwareMotion": True,
                    },
                    "vision": {
                        "source": "file",
                        "imagePath": "fixture.png",
                    },
                },
            )

            with patch("src.service.vision_api.FrameCapture.read_file") as read_file:
                client = TestClient(create_app(config_path))
                response = client.get("/vision/snapshot")

            read_file.assert_not_called()
            self.assertIn("dryRun=true", response.json()["lastError"])


if __name__ == "__main__":
    unittest.main()

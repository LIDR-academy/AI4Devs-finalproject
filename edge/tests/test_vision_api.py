from __future__ import annotations

import tempfile
import unittest
import json
from pathlib import Path
from unittest.mock import Mock, call, patch

import cv2
import numpy as np
from fastapi.testclient import TestClient

from src.models import CubeDetection, DetectionSnapshot
from src.service.vision_api import create_app, refresh_snapshot_if_needed
from src.vision.qr_reader import QrReadResult
from tests.helpers import valid_drop_zones, write_json


def enabled_planning_payload() -> dict[str, object]:
    return {
        "enabled": True,
        "safeZ": 150,
        "pickZ": 100,
        "dropSafeZ": 150,
        "liftZDelta": 50,
        "readyPose": {"x": 0, "y": 0, "z": 220},
        "resetPose": {"x": 0, "y": 0, "z": 190},
        "calibration": {
            "version": "test-v1",
            "imageRoi": {"x": 0, "y": 0, "w": 200, "h": 200},
            "robotCorners": {
                "topLeft": {"x": -100, "y": -100, "z": 100},
                "topRight": {"x": 100, "y": -100, "z": 100},
                "bottomRight": {"x": 100, "y": 100, "z": 100},
                "bottomLeft": {"x": -100, "y": 100, "z": 100},
            },
        },
        "workspace": {
            "minX": -300,
            "maxX": 300,
            "minY": -300,
            "maxY": 300,
            "minZ": 0,
            "maxZ": 300,
        },
    }


def valid_multi_cube_safety() -> dict[str, bool]:
    return {
        "zoneClear": True,
        "operatorPresent": True,
        "emergencyStopReady": True,
        "suctionReady": True,
        "physicalExecutionConfirmed": True,
    }


class VisionApiTests(unittest.TestCase):
    def assert_no_store(self, response) -> None:
        self.assertIn("no-store", response.headers["cache-control"])
        self.assertEqual("no-cache", response.headers["pragma"])
        self.assertEqual("0", response.headers["expires"])

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
                    "qrRoi": {"x": 2, "y": 3, "w": 30, "h": 30},
                    "cargoRoi": {"x": 20, "y": 20, "w": 100, "h": 80},
                    "detection": {
                        "minArea": 100,
                        "maxArea": 10000,
                        "minFillRatio": 0.5,
                    },
                },
            },
        )
        return config_path

    def _write_planning_file_config(self, directory: Path) -> Path:
        image_path = directory / "fixture.png"
        frame = np.zeros((200, 200, 3), dtype=np.uint8)
        frame[80:120, 80:120] = (0, 0, 255)
        cv2.imwrite(str(image_path), frame)
        write_json(directory / "drop-zones.json", valid_drop_zones())
        config_path = directory / "edge.json"
        write_json(
            config_path,
            {
                "profile": "vision-dry-run",
                "dropZones": {"path": "drop-zones.json"},
                "safety": {
                    "dryRun": True,
                    "enableHardwareMotion": False,
                    "humanConfirmationRequired": True,
                },
                "robotPlanning": enabled_planning_payload(),
                "vision": {
                    "source": "file",
                    "imagePath": "fixture.png",
                    "detection": {
                        "minArea": 100,
                        "maxArea": 10000,
                        "minFillRatio": 0.5,
                    },
                    "evidence": {"directory": "evidence"},
                },
            },
        )
        return config_path

    def _write_camera_config(self, directory: Path, camera_index: int = 1) -> Path:
        config_path = directory / "edge.json"
        write_json(
            config_path,
            {
                "profile": "vision-dry-run",
                "vision": {
                    "source": "camera",
                    "cameraIndex": camera_index,
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
            self.assert_no_store(response)

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
            self.assertIsNone(payload["configuredCameraIndex"])
            self.assertIsNone(payload["activeCameraIndex"])
            self.assertIsNone(payload["snapshotCameraIndex"])
            self.assertIsNone(payload["lastSnapshotAt"])
            self.assertFalse(payload["serialOpened"])
            self.assertFalse(payload["hardwareMovement"])
            self.assert_no_store(response)

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
            self.assertEqual("QR_NOT_DETECTED", payload["qrStatus"])
            self.assertFalse(payload["qrDetected"])
            self.assertFalse(payload["qrValid"])
            self.assertIsNotNone(payload["snapshotSignature"])
            self.assertEqual({"x": 2, "y": 3, "w": 30, "h": 30}, payload["qrRoi"])
            self.assertEqual({"x": 20, "y": 20, "w": 100, "h": 80}, payload["cargoRoi"])
            self.assertEqual("/vision/snapshot/image", payload["imageUrl"])
            self.assertIsNone(payload["snapshotCameraIndex"])
            self.assertIsNone(payload["lastError"])
            self.assert_no_store(response)

    def test_sync_backend_without_qr_does_not_call_backend(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))
            app = create_app(config_path, backend_url="http://localhost:3000")
            backend_client = Mock()
            app.state.vision_state.backend_client = backend_client
            client = TestClient(app)

            response = client.post("/vision/sync-backend")

            backend_client.sync_vision_snapshot.assert_not_called()
            payload = response.json()
            self.assertFalse(payload["synced"])
            self.assertEqual("QR_NOT_DETECTED", payload["status"])
            self.assert_no_store(response)

    def test_sync_backend_with_valid_qr_is_idempotent_in_process(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))
            qr_reader = Mock()
            qr_reader.return_value.read.return_value = QrReadResult(
                raw_value="TRUCK-001",
                truck_code="TRUCK-001",
                is_valid=True,
                detected=True,
            )

            with patch("src.service.vision_api.QrReader", qr_reader):
                app = create_app(config_path, backend_url="http://localhost:3000")
                backend_client = Mock()
                backend_client.sync_vision_snapshot.return_value = {
                    "visionSync": {
                        "sessionId": "session-1",
                        "truckCode": "TRUCK-001",
                        "detectionsRegistered": 1,
                    }
                }
                app.state.vision_state.backend_client = backend_client
                client = TestClient(app)

                first = client.post("/vision/sync-backend").json()
                second = client.post("/vision/sync-backend").json()
                status = client.get("/vision/status").json()

            backend_client.sync_vision_snapshot.assert_called_once()
            self.assertTrue(first["synced"])
            self.assertEqual("SYNCED", first["status"])
            self.assertFalse(second["synced"])
            self.assertEqual("DUPLICATE_LOCAL", second["status"])
            self.assertEqual(first["snapshotSignature"], status["lastSyncedSnapshotSignature"])

    def test_sync_backend_with_invalid_qr_does_not_call_backend(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))
            qr_reader = Mock()
            qr_reader.return_value.read.return_value = QrReadResult(
                raw_value="NOT-A-TRUCK",
                truck_code=None,
                is_valid=False,
                detected=True,
            )

            with patch("src.service.vision_api.QrReader", qr_reader):
                app = create_app(config_path, backend_url="http://localhost:3000")
                backend_client = Mock()
                app.state.vision_state.backend_client = backend_client
                client = TestClient(app)
                response = client.post("/vision/sync-backend")

            backend_client.sync_vision_snapshot.assert_not_called()
            self.assertFalse(response.json()["synced"])
            self.assertEqual("QR_INVALID", response.json()["status"])

            image_response = client.get("/vision/snapshot/image")
            self.assertEqual(200, image_response.status_code)
            self.assertEqual("image/png", image_response.headers["content-type"])
            self.assert_no_store(image_response)

    def test_plan_dry_run_without_qr_returns_controlled_error(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))
            app = create_app(config_path, backend_url="http://localhost:3000")
            backend_client = Mock()
            app.state.vision_state.backend_client = backend_client
            client = TestClient(app)

            response = client.post("/vision/plan-dry-run")
            status_response = client.get("/vision/status")

            backend_client.register_robot_action.assert_not_called()
            self.assertFalse(response.json()["planned"])
            self.assertEqual("QR_NOT_DETECTED", response.json()["status"])
            self.assertEqual("QR_NOT_DETECTED", status_response.json()["lastDryRunPlan"]["status"])
            self.assert_no_store(response)

    def test_plan_dry_run_uses_latest_valid_snapshot_and_registers_backend_trace(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_planning_file_config(Path(temporary_directory))
            qr_reader = Mock()
            qr_reader.return_value.read.return_value = QrReadResult(
                raw_value="TRUCK-001",
                truck_code="TRUCK-001",
                is_valid=True,
                detected=True,
            )

            with patch("src.service.vision_api.QrReader", qr_reader), patch(
                "src.vision.capture.cv2.VideoCapture"
            ) as video_capture:
                app = create_app(config_path, backend_url="http://localhost:3000")
                backend_client = Mock()
                backend_client.create_session.return_value = {"session": {"id": "session-1"}}
                backend_client.register_cubes.return_value = {"session": {"id": "session-1"}}
                backend_client.register_robot_action.return_value = {"action": {"id": "action-1"}}
                backend_client.update_robot_action.return_value = {
                    "action": {"id": "action-1", "status": "SUCCESS"}
                }
                app.state.vision_state.backend_client = backend_client
                client = TestClient(app)

                snapshot = client.get("/vision/snapshot").json()
                response = client.post("/vision/plan-dry-run")
                status_response = client.get("/vision/status")

            video_capture.assert_not_called()
            payload = response.json()
            self.assertTrue(payload["planned"])
            self.assertEqual("DRY_RUN_PLANNED", payload["status"])
            self.assertEqual(snapshot["runId"], payload["runId"])
            self.assertEqual("red", payload["selectedCubeColor"])
            self.assertEqual("DROP_RED_01", payload["dropZoneCode"])
            self.assertFalse(payload["serialOpened"])
            self.assertFalse(payload["hardwareMovement"])
            self.assertEqual("DRY_RUN_PLANNED", status_response.json()["lastDryRunPlan"]["status"])
            backend_client.register_robot_action.assert_called_once()
            backend_client.update_robot_action.assert_called_once()

    def test_image_endpoint_is_controlled_when_no_snapshot_exists(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))
            client = TestClient(create_app(config_path))

            response = client.get("/vision/snapshot/image")

            self.assertEqual(404, response.status_code)
            self.assertIn("Imagen no disponible", response.text)
            self.assert_no_store(response)

    def test_snapshot_polling_reuses_fresh_snapshot_under_ttl(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))
            client = TestClient(create_app(config_path))

            first = client.get("/vision/snapshot").json()
            second = client.get("/vision/snapshot").json()

            self.assertEqual(first["runId"], second["runId"])
            self.assertEqual(first["timestamp"], second["timestamp"])

    def test_snapshot_polling_refreshes_when_ttl_expires(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_file_config(Path(temporary_directory))
            app = create_app(config_path)
            state = app.state.vision_state

            first = refresh_snapshot_if_needed(state, ttl_seconds=0)
            second = refresh_snapshot_if_needed(state, ttl_seconds=0)

            self.assertNotEqual(first.run_id, second.run_id)

    def test_camera_source_is_blocked_without_allow_camera(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_camera_config(Path(temporary_directory), camera_index=1)

            with patch("src.vision.capture.cv2.VideoCapture") as video_capture:
                client = TestClient(create_app(config_path, allow_camera=False))
                status_response = client.get("/vision/status")
                snapshot_response = client.get("/vision/snapshot")

            video_capture.assert_not_called()
            self.assertIn("requires explicit --allow-camera", status_response.json()["lastError"])
            self.assertIn("requires explicit --allow-camera", snapshot_response.json()["lastError"])
            self.assertEqual(1, status_response.json()["configuredCameraIndex"])
            self.assertIsNone(status_response.json()["activeCameraIndex"])
            self.assertIsNone(status_response.json()["snapshotCameraIndex"])
            self.assertFalse(status_response.json()["cameraAllowed"])
            self.assert_no_store(status_response)
            self.assert_no_store(snapshot_response)

    def test_camera_snapshot_uses_only_configured_camera_index(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_camera_config(Path(temporary_directory), camera_index=1)
            frame = np.zeros((120, 160, 3), dtype=np.uint8)
            frame[20:80, 30:90] = (0, 0, 255)
            camera = Mock()
            camera.isOpened.return_value = True
            camera.read.return_value = (True, frame)

            with patch("src.vision.capture.cv2.VideoCapture", return_value=camera) as video_capture:
                client = TestClient(create_app(config_path, allow_camera=True))
                response = client.get("/vision/snapshot")
                status_response = client.get("/vision/status")

            video_capture.assert_called_once_with(1)
            self.assertNotIn(call(0), video_capture.mock_calls)
            self.assertEqual("opencv-camera", response.json()["source"])
            self.assertEqual(1, response.json()["snapshotCameraIndex"])
            self.assertEqual(1, status_response.json()["configuredCameraIndex"])
            self.assertEqual(1, status_response.json()["activeCameraIndex"])
            self.assertEqual(1, status_response.json()["snapshotCameraIndex"])
            self.assertFalse(status_response.json()["serialOpened"])
            self.assertFalse(status_response.json()["hardwareMovement"])

    def test_camera_unavailable_reports_configured_index_without_fallback(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_camera_config(Path(temporary_directory), camera_index=1)
            camera = Mock()
            camera.isOpened.return_value = False

            with patch("src.vision.capture.cv2.VideoCapture", return_value=camera) as video_capture:
                client = TestClient(create_app(config_path, allow_camera=True))
                response = client.get("/vision/snapshot")
                status_response = client.get("/vision/status")

            video_capture.assert_called_once_with(1)
            self.assertIn("Configured cameraIndex=1 unavailable", response.json()["lastError"])
            self.assertEqual(1, status_response.json()["configuredCameraIndex"])
            self.assertIsNone(status_response.json()["activeCameraIndex"])
            self.assertIsNone(status_response.json()["snapshotCameraIndex"])

    def test_repeated_camera_polling_keeps_configured_camera_index(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_camera_config(Path(temporary_directory), camera_index=1)
            frame = np.zeros((120, 160, 3), dtype=np.uint8)
            camera = Mock()
            camera.isOpened.return_value = True
            camera.read.return_value = (True, frame)

            with patch("src.vision.capture.cv2.VideoCapture", return_value=camera) as video_capture:
                client = TestClient(create_app(config_path, allow_camera=True))
                first = client.get("/vision/snapshot").json()
                second = client.get("/vision/snapshot").json()
                status_response = client.get("/vision/status")

            video_capture.assert_called_once_with(1)
            self.assertEqual(first["runId"], second["runId"])
            self.assertEqual(1, status_response.json()["configuredCameraIndex"])
            self.assertEqual(1, status_response.json()["activeCameraIndex"])
            self.assertEqual(1, status_response.json()["snapshotCameraIndex"])

    def test_camera_failure_invalidates_previous_image_for_same_service(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_camera_config(Path(temporary_directory), camera_index=1)
            frame = np.zeros((120, 160, 3), dtype=np.uint8)
            camera = Mock()
            camera.isOpened.return_value = True
            camera.read.side_effect = [(True, frame), (False, None)]

            with patch("src.vision.capture.cv2.VideoCapture", return_value=camera) as video_capture:
                client = TestClient(create_app(config_path, allow_camera=True))
                first_response = client.get("/vision/snapshot")
                first_image = client.get("/vision/snapshot/image")
                state = client.app.state.vision_state
                state.last_snapshot_monotonic = None
                failed_response = client.get("/vision/snapshot")
                failed_image = client.get("/vision/snapshot/image")
                status_response = client.get("/vision/status")

            video_capture.assert_called_once_with(1)
            self.assertNotIn(call(0), video_capture.mock_calls)
            self.assertEqual(1, first_response.json()["snapshotCameraIndex"])
            self.assertEqual(200, first_image.status_code)
            self.assertIn("Configured cameraIndex=1 unavailable", failed_response.json()["lastError"])
            self.assertIsNone(status_response.json()["activeCameraIndex"])
            self.assertIsNone(status_response.json()["snapshotCameraIndex"])
            self.assertEqual(404, failed_image.status_code)

    def test_camera_polling_reuses_persistent_configured_capture(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_camera_config(Path(temporary_directory), camera_index=1)
            frame = np.zeros((120, 160, 3), dtype=np.uint8)
            camera = Mock()
            camera.isOpened.return_value = True
            camera.read.return_value = (True, frame)

            with patch("src.vision.capture.cv2.VideoCapture", return_value=camera) as video_capture:
                client = TestClient(create_app(config_path, allow_camera=True))
                first = client.get("/vision/snapshot").json()
                state = client.app.state.vision_state
                state.last_snapshot_monotonic = None
                second = client.get("/vision/snapshot").json()
                status_response = client.get("/vision/status")

            video_capture.assert_called_once_with(1)
            self.assertNotIn(call(0), video_capture.mock_calls)
            self.assertNotEqual(first["runId"], second["runId"])
            self.assertEqual(1, first["snapshotCameraIndex"])
            self.assertEqual(1, second["snapshotCameraIndex"])
            self.assertEqual(1, status_response.json()["configuredCameraIndex"])
            self.assertEqual(1, status_response.json()["activeCameraIndex"])
            self.assertEqual(1, status_response.json()["snapshotCameraIndex"])

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
            self.assert_no_store(response)

    def test_drop_zones_reset_endpoint_requires_all_scope_and_resets_occupied(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = self._write_planning_file_config(directory)
            payload = valid_drop_zones()
            payload["red"][0]["occupied"] = True
            write_json(directory / "drop-zones.json", payload)
            client = TestClient(create_app(config_path, unload_config_path=unload_config_path))

            invalid = client.post("/drop-zones/reset", json={"scope": "red"})
            response = client.post("/drop-zones/reset", json={"scope": "all"})

            self.assertEqual(400, invalid.status_code)
            self.assertEqual(200, response.status_code)
            body = response.json()
            self.assertEqual("SUCCESS", body["status"])
            self.assertEqual(1, body["resetSlots"])
            self.assertTrue(Path(body["backupPath"]).exists())
            after = json.loads((directory / "drop-zones.json").read_text(encoding="utf-8"))
            self.assertFalse(after["red"][0]["occupied"])
            self.assertTrue(after["red"][0]["active"])

    def test_drop_zones_reset_endpoint_requires_drop_zones_path_in_unload_config(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = directory / "unload-without-drop-zones.json"
            write_json(
                unload_config_path,
                {
                    "profile": "vision-dry-run",
                    "robotPlanning": enabled_planning_payload(),
                    "vision": {"source": "simulation"},
                },
            )
            client = TestClient(create_app(config_path, unload_config_path=unload_config_path))

            response = client.post("/drop-zones/reset", json={"scope": "all"})

            self.assertEqual(400, response.status_code)
            self.assertEqual("MISSING_DROP_ZONES_CONFIG", response.json()["detail"]["code"])

    def test_create_app_accepts_explicit_unload_config_path(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = self._write_planning_file_config(directory)

            app = create_app(config_path, unload_config_path=unload_config_path)

            self.assertEqual(unload_config_path, app.state.vision_state.unload_config_path)

    def test_multi_cube_plan_endpoint_generates_plan_from_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = self._write_planning_file_config(directory)
            snapshot = DetectionSnapshot(
                "run-api-plan",
                "opencv-camera",
                (CubeDetection("red", 80, 80, 20, 20, 0.9, {"sizeValid": True}),),
                truck_code="TRUCK-001",
                metadata={"snapshotSignature": "sig-api-plan", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
            )
            plan = {
                "status": "DRY_RUN_PLANNED",
                "runId": "multi-run-api-plan",
                "truckCode": "TRUCK-001",
                "totalDetectedCubes": 1,
                "totalPlannedCubes": 1,
                "plannedActions": [{"sequenceNumber": 1, "selectedCubeColor": "red"}],
                "evidence": {"json": str(Path(temporary_directory) / "plan.json")},
            }
            with patch("src.service.vision_api.refresh_snapshot_if_needed", return_value=snapshot), patch(
                "src.service.vision_api.run_multi_cube_pick_drop", return_value=plan
            ) as runner:
                client = TestClient(create_app(config_path, unload_config_path=unload_config_path))
                response = client.post("/robot/multi-cube/plan", json={"maxCubes": 6})
                status = client.get("/robot/multi-cube/status").json()

            self.assertEqual(200, response.status_code)
            runner.assert_called_once()
            self.assertEqual(unload_config_path, runner.call_args.args[0])
            self.assertEqual("DRY_RUN_PLANNED", response.json()["status"])
            self.assertEqual("planned", status["status"])
            self.assertEqual("multi-run-api-plan", status["runId"])
            self.assertIsNone(status["lastError"])

    def test_multi_cube_plan_endpoint_reports_missing_planning_from_unload_config(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = directory / "unload-without-planning.json"
            write_json(
                unload_config_path,
                {
                    "profile": "vision-dry-run",
                    "dropZones": {"path": "drop-zones.json"},
                    "robotPlanning": {"enabled": False},
                    "vision": {"source": "simulation"},
                },
            )
            write_json(directory / "drop-zones.json", valid_drop_zones())
            client = TestClient(create_app(config_path, unload_config_path=unload_config_path))

            response = client.post("/robot/multi-cube/plan", json={"maxCubes": 1})
            status = client.get("/robot/multi-cube/status").json()

            self.assertEqual(400, response.status_code)
            self.assertEqual("MISSING_PLANNING_CONFIG", response.json()["detail"]["code"])
            self.assertEqual("failed", status["status"])

    def test_multi_cube_status_clears_previous_error_after_successful_plan(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = self._write_planning_file_config(directory)
            snapshot = DetectionSnapshot(
                "run-api-plan-clean-error",
                "opencv-camera",
                (CubeDetection("red", 80, 80, 20, 20, 0.9, {"sizeValid": True}),),
                truck_code="TRUCK-001",
                metadata={"snapshotSignature": "sig-api-plan-clean-error", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
            )
            plan = {
                "status": "DRY_RUN_PLANNED",
                "runId": "multi-run-clean-error",
                "truckCode": "TRUCK-001",
                "totalDetectedCubes": 1,
                "totalPlannedCubes": 1,
                "plannedActions": [{"sequenceNumber": 1, "selectedCubeColor": "red"}],
                "evidence": {"json": str(directory / "plan.json")},
            }
            app = create_app(config_path, unload_config_path=unload_config_path)
            app.state.vision_state.multi_cube_last_error = "MISSING_PLANNING_CONFIG: robotPlanning.enabled=true is required"
            client = TestClient(app)

            with patch("src.service.vision_api.refresh_snapshot_if_needed", return_value=snapshot), patch(
                "src.service.vision_api.run_multi_cube_pick_drop", return_value=plan
            ):
                response = client.post("/robot/multi-cube/plan", json={"maxCubes": 1})
                status = client.get("/robot/multi-cube/status").json()

            self.assertEqual(200, response.status_code)
            self.assertEqual("planned", status["status"])
            self.assertIsNone(status["lastError"])

    def test_multi_cube_execute_requires_plan_and_safety_confirmations(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_planning_file_config(Path(temporary_directory))
            client = TestClient(create_app(config_path, hardware_port="COM4"))

            without_plan = client.post("/robot/multi-cube/execute", json={"maxCubes": 1, "safety": {}})
            self.assertEqual(409, without_plan.status_code)

            app = create_app(config_path, hardware_port="COM4")
            app.state.vision_state.multi_cube_status = "planned"
            app.state.vision_state.multi_cube_run_id = "multi-run"
            app.state.vision_state.multi_cube_last_plan = {"runId": "multi-run", "evidence": {"json": None}}
            client = TestClient(app)
            without_safety = client.post("/robot/multi-cube/execute", json={"runId": "multi-run", "maxCubes": 1})

            self.assertEqual(400, without_safety.status_code)
            self.assertIn("safety", str(without_safety.json()["detail"]))

    def test_multi_cube_execute_uses_hardware_port_and_baudrate_from_unload_config(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = self._write_planning_file_config(directory)
            unload_payload = json.loads(unload_config_path.read_text(encoding="utf-8"))
            unload_payload["hardware"] = {"port": "COM4", "baudrate": 57600}
            write_json(unload_config_path, unload_payload)
            app = create_app(config_path, unload_config_path=unload_config_path)
            app.state.vision_state.multi_cube_status = "planned"
            app.state.vision_state.multi_cube_run_id = "multi-run"
            app.state.vision_state.multi_cube_last_plan = {
                "runId": "multi-run",
                "evidence": {"json": str(directory / "plan.json")},
            }
            app.state.vision_state.multi_cube_plan_snapshot = DetectionSnapshot(
                "run-api-execute",
                "opencv-camera",
                (CubeDetection("red", 80, 80, 20, 20, 0.9, {"sizeValid": True}),),
                truck_code="TRUCK-001",
                metadata={"snapshotSignature": "sig-api-execute", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
            )
            result = {"status": "SUCCESS", "runId": "multi-run", "totalExecutedCubes": 1, "executedActions": []}

            with patch("src.service.vision_api.run_multi_cube_pick_drop", return_value=result) as runner:
                client = TestClient(app)
                response = client.post(
                    "/robot/multi-cube/execute",
                    json={"runId": "multi-run", "maxCubes": 1, "safety": valid_multi_cube_safety()},
                )

            self.assertEqual(200, response.status_code)
            gates = runner.call_args.kwargs["gates"]
            self.assertEqual("COM4", gates.port)
            self.assertEqual(57600, gates.baudrate)

    def test_multi_cube_execute_request_port_overrides_unload_config_and_default_baudrate_is_used(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = self._write_planning_file_config(directory)
            unload_payload = json.loads(unload_config_path.read_text(encoding="utf-8"))
            unload_payload["hardware"] = {"port": "COM4"}
            write_json(unload_config_path, unload_payload)
            app = create_app(config_path, unload_config_path=unload_config_path)
            app.state.vision_state.multi_cube_status = "planned"
            app.state.vision_state.multi_cube_run_id = "multi-run"
            app.state.vision_state.multi_cube_last_plan = {
                "runId": "multi-run",
                "evidence": {"json": str(directory / "plan.json")},
            }
            app.state.vision_state.multi_cube_plan_snapshot = DetectionSnapshot(
                "run-api-execute",
                "opencv-camera",
                (CubeDetection("red", 80, 80, 20, 20, 0.9, {"sizeValid": True}),),
                truck_code="TRUCK-001",
                metadata={"snapshotSignature": "sig-api-execute", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
            )
            result = {"status": "SUCCESS", "runId": "multi-run", "totalExecutedCubes": 1, "executedActions": []}

            with patch("src.service.vision_api.run_multi_cube_pick_drop", return_value=result) as runner:
                client = TestClient(app)
                response = client.post(
                    "/robot/multi-cube/execute",
                    json={
                        "runId": "multi-run",
                        "maxCubes": 1,
                        "port": "COM5",
                        "safety": valid_multi_cube_safety(),
                    },
                )

            self.assertEqual(200, response.status_code)
            gates = runner.call_args.kwargs["gates"]
            self.assertEqual("COM5", gates.port)
            self.assertEqual(115200, gates.baudrate)

    def test_multi_cube_execute_request_baudrate_overrides_unload_config(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = self._write_planning_file_config(directory)
            unload_payload = json.loads(unload_config_path.read_text(encoding="utf-8"))
            unload_payload["hardware"] = {"port": "COM4", "baudrate": 57600}
            write_json(unload_config_path, unload_payload)
            app = create_app(config_path, unload_config_path=unload_config_path)
            app.state.vision_state.multi_cube_status = "planned"
            app.state.vision_state.multi_cube_run_id = "multi-run"
            app.state.vision_state.multi_cube_last_plan = {
                "runId": "multi-run",
                "evidence": {"json": str(directory / "plan.json")},
            }
            app.state.vision_state.multi_cube_plan_snapshot = DetectionSnapshot(
                "run-api-execute",
                "opencv-camera",
                (CubeDetection("red", 80, 80, 20, 20, 0.9, {"sizeValid": True}),),
                truck_code="TRUCK-001",
                metadata={"snapshotSignature": "sig-api-execute", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
            )
            result = {"status": "SUCCESS", "runId": "multi-run", "totalExecutedCubes": 1, "executedActions": []}

            with patch("src.service.vision_api.run_multi_cube_pick_drop", return_value=result) as runner:
                client = TestClient(app)
                response = client.post(
                    "/robot/multi-cube/execute",
                    json={
                        "runId": "multi-run",
                        "maxCubes": 1,
                        "baudrate": 38400,
                        "safety": valid_multi_cube_safety(),
                    },
                )

            self.assertEqual(200, response.status_code)
            gates = runner.call_args.kwargs["gates"]
            self.assertEqual("COM4", gates.port)
            self.assertEqual(38400, gates.baudrate)

    def test_multi_cube_execute_missing_hardware_port_returns_clear_error_without_runner(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = self._write_planning_file_config(directory)
            app = create_app(config_path, unload_config_path=unload_config_path)
            app.state.vision_state.multi_cube_status = "planned"
            app.state.vision_state.multi_cube_run_id = "multi-run"
            app.state.vision_state.multi_cube_last_plan = {
                "runId": "multi-run",
                "evidence": {"json": str(directory / "plan.json")},
            }
            app.state.vision_state.multi_cube_plan_snapshot = DetectionSnapshot(
                "run-api-execute",
                "opencv-camera",
                (CubeDetection("red", 80, 80, 20, 20, 0.9, {"sizeValid": True}),),
                truck_code="TRUCK-001",
                metadata={"snapshotSignature": "sig-api-execute", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
            )

            with patch("src.service.vision_api.run_multi_cube_pick_drop") as runner:
                client = TestClient(app)
                response = client.post(
                    "/robot/multi-cube/execute",
                    json={"runId": "multi-run", "maxCubes": 1, "safety": valid_multi_cube_safety()},
                )
                status = client.get("/robot/multi-cube/status").json()

            self.assertEqual(400, response.status_code)
            self.assertEqual("MISSING_HARDWARE_PORT", response.json()["detail"]["code"])
            self.assertEqual(
                "Configure hardware.port in unload-config or provide port in request",
                response.json()["detail"]["message"],
            )
            self.assertIn("MISSING_HARDWARE_PORT", status["lastError"])
            self.assertFalse(status["hardwarePortConfigured"])
            runner.assert_not_called()

    def test_multi_cube_execute_blocks_concurrent_execution(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_planning_file_config(Path(temporary_directory))
            app = create_app(config_path, hardware_port="COM4")
            app.state.vision_state.multi_cube_executing = True
            client = TestClient(app)

            response = client.post("/robot/multi-cube/execute", json={"maxCubes": 1, "safety": {}})

            self.assertEqual(409, response.status_code)

    def test_multi_cube_status_returns_idle_shape(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            config_path = self._write_planning_file_config(Path(temporary_directory))
            client = TestClient(create_app(config_path))

            response = client.get("/robot/multi-cube/status")

            self.assertEqual(200, response.status_code)
            self.assertEqual("idle", response.json()["status"])
            self.assertIsNone(response.json()["lastError"])

    def test_operation_reset_clears_multi_cube_memory_and_resets_drop_zones(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            config_path = self._write_file_config(directory)
            unload_config_path = self._write_planning_file_config(directory)
            payload = valid_drop_zones()
            payload["red"][0]["occupied"] = True
            write_json(directory / "drop-zones.json", payload)
            app = create_app(config_path, unload_config_path=unload_config_path)
            app.state.vision_state.multi_cube_status = "planned"
            app.state.vision_state.multi_cube_run_id = "multi-run"
            app.state.vision_state.multi_cube_last_plan = {"runId": "multi-run"}
            app.state.vision_state.multi_cube_last_result = {"status": "SUCCESS"}
            app.state.vision_state.multi_cube_last_error = "previous error"
            client = TestClient(app)

            response = client.post("/operation/reset", json={"resetDropZones": True})
            status = client.get("/robot/multi-cube/status").json()
            after = json.loads((directory / "drop-zones.json").read_text(encoding="utf-8"))

            self.assertEqual(200, response.status_code)
            self.assertEqual("SUCCESS", response.json()["status"])
            self.assertEqual("idle", status["status"])
            self.assertIsNone(status["runId"])
            self.assertIsNone(status["lastPlan"])
            self.assertIsNone(status["lastResult"])
            self.assertIsNone(status["lastError"])
            self.assertFalse(after["red"][0]["occupied"])


if __name__ == "__main__":
    unittest.main()

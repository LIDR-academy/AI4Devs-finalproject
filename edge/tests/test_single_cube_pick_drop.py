from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from src.models import CubeDetection, DetectionSnapshot
from src.single_cube_pick_drop import (
    HardwareGates,
    PickDropEvidenceWriter,
    SingleCubePickDropError,
    run_single_cube_pick_drop,
)
from tests.helpers import valid_drop_zones, write_json
from tests.test_edge_dry_run import enabled_planning_payload


def hardware_ready_planning_payload() -> dict[str, object]:
    payload = enabled_planning_payload()
    payload.update(
        {
            "safeZ": 150,
            "pickZ": 138,
            "dropSafeZ": 150,
            "readyPose": {"x": 124, "y": -83, "z": 212},
            "resetPose": {"x": 0, "y": -79, "z": 176},
            "calibration": {
                "version": "pickup-robot-local-2026-07-04",
                "imageRoi": {"x": 10, "y": 10, "w": 180, "h": 180},
                "visualCalibration": {
                    "pickupWidthCm": 13.5,
                    "pickupHeightCm": 7,
                    "cubeSizeCm": 2.5,
                    "cornersPx": {
                        "topLeft": {"x": 10, "y": 10},
                        "topRight": {"x": 190, "y": 12},
                        "bottomRight": {"x": 188, "y": 190},
                        "bottomLeft": {"x": 12, "y": 188},
                    },
                },
                "robotCorners": {
                    "topLeft": {"x": 86, "y": -157, "z": 148},
                    "topRight": {"x": -34, "y": -169, "z": 148},
                    "bottomRight": {"x": -34, "y": -239, "z": 148},
                    "bottomLeft": {"x": 94, "y": -233, "z": 148},
                },
            },
        }
    )
    return payload


class FakeSerial:
    opened_count = 0
    instances: list["FakeSerial"] = []

    def __init__(self, responses: list[bytes] | None = None) -> None:
        self.is_open = True
        self.responses = responses or [b"DONE\n"] * 20
        self.writes: list[bytes] = []
        self.closed = False
        FakeSerial.opened_count += 1
        FakeSerial.instances.append(self)

    def write(self, payload: bytes) -> None:
        self.writes.append(payload)

    def readline(self) -> bytes:
        return self.responses.pop(0) if self.responses else b"DONE\n"

    def close(self) -> None:
        self.closed = True
        self.is_open = False


class SingleCubePickDropTests(unittest.TestCase):
    def setUp(self) -> None:
        FakeSerial.opened_count = 0
        FakeSerial.instances = []
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.directory = Path(self.temporary_directory.name)
        self.drop_zones_path = self.directory / "drop-zones.json"
        write_json(self.drop_zones_path, valid_drop_zones())
        self.config_path = self.directory / "edge.json"
        write_json(
            self.config_path,
            {
                "profile": "vision-dry-run",
                "truckCode": "TRUCK-001",
                "dropZones": {"path": "drop-zones.json"},
                "safety": {
                    "dryRun": True,
                    "enableHardwareMotion": False,
                    "humanConfirmationRequired": True,
                },
                "robotPlanning": enabled_planning_payload(),
                "vision": {
                    "source": "simulation",
                    "evidence": {"directory": "evidence"},
                    "cubes": [],
                },
            },
        )
        self.snapshot = DetectionSnapshot(
            "run-single",
            "opencv-camera",
            (CubeDetection("red", 80, 80, 20, 20, 0.9, {"sizeValid": True}),),
            truck_code="TRUCK-001",
            metadata={
                "snapshotSignature": "sig-single",
                "qrDetected": True,
                "qrValid": True,
                "qrStatus": "OK",
            },
        )
        self.writer = PickDropEvidenceWriter(self.directory / "evidence")

    def gates(self) -> HardwareGates:
        return HardwareGates(
            confirm_pick_drop=True,
            enable_hardware_motion=True,
            confirm_zone_clear=True,
            confirm_operator_present=True,
            confirm_emergency_stop_ready=True,
            confirm_suction=True,
            port="COM4",
        )

    def plan_only(self) -> dict[str, object]:
        return run_single_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            plan_only=True,
            evidence_writer=self.writer,
        )

    def write_hardware_ready_config(self) -> None:
        write_json(
            self.config_path,
            {
                "profile": "vision-dry-run",
                "truckCode": "TRUCK-001",
                "dropZones": {"path": "drop-zones.json"},
                "safety": {
                    "dryRun": True,
                    "enableHardwareMotion": False,
                    "humanConfirmationRequired": True,
                },
                "robotPlanning": hardware_ready_planning_payload(),
                "vision": {
                    "source": "simulation",
                    "evidence": {"directory": "evidence"},
                    "cubes": [],
                },
            },
        )

    def write_hardware_ready_config_with_movement(
        self,
        *,
        delay_seconds: float = 0.8,
        pickup_hold_seconds: float | None = None,
        release_hold_seconds: float | None = None,
    ) -> None:
        payload: dict[str, object] = {"delay_seconds": delay_seconds}
        if pickup_hold_seconds is not None:
            payload["pickup_hold_seconds"] = pickup_hold_seconds
        if release_hold_seconds is not None:
            payload["release_hold_seconds"] = release_hold_seconds
        write_json(
            self.config_path,
            {
                "profile": "vision-dry-run",
                "truckCode": "TRUCK-001",
                "dropZones": {"path": "drop-zones.json"},
                "movement": payload,
                "safety": {
                    "dryRun": True,
                    "enableHardwareMotion": False,
                    "humanConfirmationRequired": True,
                },
                "robotPlanning": hardware_ready_planning_payload(),
                "vision": {
                    "source": "simulation",
                    "evidence": {"directory": "evidence"},
                    "cubes": [],
                },
            },
        )

    def test_plan_only_writes_evidence_and_never_opens_serial(self) -> None:
        result = self.plan_only()

        self.assertEqual("DRY_RUN_PLANNED", result["status"])
        self.assertEqual("DROP_RED_01", result["dropZone"]["code"])
        self.assertEqual(0, FakeSerial.opened_count)
        self.assertTrue(Path(result["evidence"]["json"]).exists())
        self.assertIn("PLACEHOLDER_ROBOT_CORNERS", result["safetyWarnings"])

    def test_plan_only_cancels_reservation_and_does_not_persist_occupied(self) -> None:
        first = self.plan_only()
        second = self.plan_only()
        persisted = json.loads(self.drop_zones_path.read_text(encoding="utf-8"))

        self.assertEqual("DROP_RED_01", first["dropZone"]["code"])
        self.assertEqual("DROP_RED_01", second["dropZone"]["code"])
        self.assertFalse(persisted["red"][0]["occupied"])

    def test_without_confirmation_does_not_open_serial(self) -> None:
        self.write_hardware_ready_config()
        dry_run = self.plan_only()

        with self.assertRaises(SingleCubePickDropError) as context:
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
                gates=HardwareGates(port="COM4"),
                serial_factory=lambda *_: FakeSerial(),
                evidence_writer=self.writer,
            )

        self.assertEqual("CONFIRMATION_REQUIRED", context.exception.code)
        self.assertEqual(0, FakeSerial.opened_count)

    def test_without_dry_run_evidence_does_not_open_serial(self) -> None:
        self.write_hardware_ready_config()
        with self.assertRaises(SingleCubePickDropError) as context:
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                gates=self.gates(),
                serial_factory=lambda *_: FakeSerial(),
                evidence_writer=self.writer,
            )

        self.assertEqual("CONFIRMATION_REQUIRED", context.exception.code)
        self.assertEqual(0, FakeSerial.opened_count)

    def test_invalid_qr_does_not_open_serial(self) -> None:
        invalid = DetectionSnapshot(
            "run-invalid",
            "opencv-camera",
            self.snapshot.detections,
            metadata={"qrDetected": True, "qrValid": False, "qrStatus": "QR_INVALID"},
        )

        with self.assertRaises(SingleCubePickDropError) as context:
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=invalid,
                gates=self.gates(),
                serial_factory=lambda *_: FakeSerial(),
                evidence_writer=self.writer,
            )

        self.assertEqual("QR_INVALID", context.exception.code)
        self.assertEqual(0, FakeSerial.opened_count)

    def test_no_drop_zone_available_does_not_open_serial(self) -> None:
        payload = valid_drop_zones()
        for slot in payload["red"]:
            slot["occupied"] = True
        write_json(self.drop_zones_path, payload)

        with self.assertRaises(Exception):
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                gates=self.gates(),
                serial_factory=lambda *_: FakeSerial(),
                evidence_writer=self.writer,
            )

        self.assertEqual(0, FakeSerial.opened_count)

    def test_blue_plan_uses_drop_blue_02_when_drop_blue_01_is_occupied(self) -> None:
        payload = valid_drop_zones()
        payload["blue"][0]["occupied"] = True
        write_json(self.drop_zones_path, payload)
        snapshot = DetectionSnapshot(
            "run-blue",
            "opencv-camera",
            (CubeDetection("blue", 80, 80, 20, 20, 0.9, {"sizeValid": True}),),
            truck_code="TRUCK-001",
            metadata={
                "snapshotSignature": "sig-blue",
                "qrDetected": True,
                "qrValid": True,
                "qrStatus": "OK",
            },
        )

        result = run_single_cube_pick_drop(
            self.config_path,
            snapshot=snapshot,
            plan_only=True,
            evidence_writer=self.writer,
        )

        self.assertEqual("DROP_BLUE_02", result["dropZone"]["code"])
        persisted = json.loads(self.drop_zones_path.read_text(encoding="utf-8"))
        self.assertTrue(persisted["blue"][0]["occupied"])
        self.assertFalse(persisted["blue"][1]["occupied"])

    def test_hardware_blocks_placeholder_calibration_before_serial(self) -> None:
        payload = hardware_ready_planning_payload()
        payload["calibration"]["version"] = "REPLACE_WITH_LOCAL_CALIBRATION"
        write_json(
            self.config_path,
            {
                "profile": "vision-dry-run",
                "truckCode": "TRUCK-001",
                "dropZones": {"path": "drop-zones.json"},
                "robotPlanning": payload,
                "vision": {"source": "simulation", "evidence": {"directory": "evidence"}},
            },
        )
        dry_run = self.plan_only()

        with self.assertRaises(SingleCubePickDropError) as context:
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
                gates=self.gates(),
                serial_factory=lambda *_: FakeSerial(),
                evidence_writer=self.writer,
            )

        self.assertEqual("MISSING_REAL_PICKUP_ROBOT_CALIBRATION", context.exception.code)
        self.assertEqual(0, FakeSerial.opened_count)

    def test_hardware_blocks_placeholder_robot_corners_before_serial(self) -> None:
        payload = enabled_planning_payload()
        payload["calibration"]["version"] = "pickup-robot-local-2026-07-04"
        payload["calibration"]["visualCalibration"]["cornersPx"] = {
            "topLeft": {"x": 10, "y": 10},
            "topRight": {"x": 190, "y": 12},
            "bottomRight": {"x": 188, "y": 190},
            "bottomLeft": {"x": 12, "y": 188},
        }
        write_json(
            self.config_path,
            {
                "profile": "vision-dry-run",
                "truckCode": "TRUCK-001",
                "dropZones": {"path": "drop-zones.json"},
                "robotPlanning": payload,
                "vision": {"source": "simulation", "evidence": {"directory": "evidence"}},
            },
        )
        dry_run = self.plan_only()

        with self.assertRaises(SingleCubePickDropError) as context:
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
                gates=self.gates(),
                serial_factory=lambda *_: FakeSerial(),
                evidence_writer=self.writer,
            )

        self.assertEqual("PLACEHOLDER_ROBOT_CORNERS", context.exception.code)
        self.assertEqual(0, FakeSerial.opened_count)

    def test_hardware_blocks_image_roi_only_before_serial(self) -> None:
        payload = hardware_ready_planning_payload()
        payload["calibration"].pop("visualCalibration")
        write_json(
            self.config_path,
            {
                "profile": "vision-dry-run",
                "truckCode": "TRUCK-001",
                "dropZones": {"path": "drop-zones.json"},
                "robotPlanning": payload,
                "vision": {"source": "simulation", "evidence": {"directory": "evidence"}},
            },
        )
        dry_run = self.plan_only()

        with self.assertRaises(SingleCubePickDropError) as context:
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
                gates=self.gates(),
                serial_factory=lambda *_: FakeSerial(),
                evidence_writer=self.writer,
            )

        self.assertEqual("MISSING_VISUAL_PICKUP_CALIBRATION", context.exception.code)
        self.assertEqual(0, FakeSerial.opened_count)

    def test_hardware_blocks_incomplete_visual_calibration_before_serial(self) -> None:
        payload = hardware_ready_planning_payload()
        payload["calibration"]["visualCalibration"]["cornersPx"].pop("bottomLeft")
        write_json(
            self.config_path,
            {
                "profile": "vision-dry-run",
                "truckCode": "TRUCK-001",
                "dropZones": {"path": "drop-zones.json"},
                "robotPlanning": payload,
                "vision": {"source": "simulation", "evidence": {"directory": "evidence"}},
            },
        )

        with self.assertRaises(Exception):
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                plan_only=True,
                evidence_writer=self.writer,
            )

        self.assertEqual(0, FakeSerial.opened_count)

    def test_plan_only_with_visual_calibration_reports_pickup_position_and_homography(self) -> None:
        self.write_hardware_ready_config()
        result = self.plan_only()

        self.assertTrue(result["visualCalibrationUsed"])
        self.assertTrue(result["homographyUsed"])
        self.assertIsNotNone(result["pickupPositionCm"])
        self.assertIn("pickupTarget", result)

    def test_plan_only_with_movement_config_never_sleeps(self) -> None:
        self.write_hardware_ready_config_with_movement(delay_seconds=0.8)

        result = run_single_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            plan_only=True,
            sleeper=lambda _: (_ for _ in ()).throw(AssertionError("plan-only must not sleep")),
            evidence_writer=self.writer,
        )

        self.assertEqual("DRY_RUN_PLANNED", result["status"])
        self.assertEqual(0.8, result["movementDelaySeconds"])
        self.assertEqual(0.8, result["pickupHoldSeconds"])
        self.assertEqual(0.8, result["releaseHoldSeconds"])

    def test_hardware_execution_applies_configured_step_delays(self) -> None:
        self.write_hardware_ready_config_with_movement(
            delay_seconds=0.8,
            pickup_hold_seconds=1.2,
            release_hold_seconds=0.5,
        )
        dry_run = self.plan_only()
        sleep_calls: list[float] = []

        result = run_single_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
            gates=self.gates(),
            serial_factory=lambda *_: FakeSerial(),
            sleeper=sleep_calls.append,
            evidence_writer=self.writer,
        )

        self.assertEqual("SUCCESS", result["status"])
        self.assertEqual(12, len(sleep_calls))
        self.assertEqual(1.2, sleep_calls[3])
        self.assertEqual(0.5, sleep_calls[8])
        self.assertTrue(all(value == 0.8 for index, value in enumerate(sleep_calls) if index not in {3, 8}))
        responses = result["firmwareResponses"]
        self.assertEqual(1.2, responses[3]["postStepDelaySeconds"])
        self.assertEqual("cube_target_pick", responses[3]["step"])
        self.assertEqual(0.5, responses[8]["postStepDelaySeconds"])
        self.assertEqual("drop_zone_release", responses[8]["step"])
        self.assertIn("stepStartedAt", responses[0])
        self.assertIn("responseReceivedAt", responses[0])
        self.assertIsInstance(responses[0]["elapsedMs"], float)
        self.assertEqual("command_execution_only", result["successMeaning"])

    def test_dry_run_evidence_detects_pickup_offset_change(self) -> None:
        self.write_hardware_ready_config()
        dry_run = self.plan_only()
        config = json.loads(self.config_path.read_text(encoding="utf-8"))
        config["robotPlanning"]["pickupOffset"] = {"x": 5, "y": 0, "z": 0}
        write_json(self.config_path, config)

        with self.assertRaises(SingleCubePickDropError) as context:
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
                gates=self.gates(),
                serial_factory=lambda *_: FakeSerial(),
                evidence_writer=self.writer,
            )

        self.assertEqual("DRY_RUN_MISMATCH", context.exception.code)
        self.assertEqual(0, FakeSerial.opened_count)

    def test_missing_movement_config_defaults_to_zero_delay(self) -> None:
        self.write_hardware_ready_config()
        dry_run = self.plan_only()
        sleep_calls: list[float] = []

        result = run_single_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
            gates=self.gates(),
            serial_factory=lambda *_: FakeSerial(),
            sleeper=sleep_calls.append,
            evidence_writer=self.writer,
        )

        self.assertEqual("SUCCESS", result["status"])
        self.assertEqual(0.0, result["movementDelaySeconds"])
        self.assertEqual(0.0, result["pickupHoldSeconds"])
        self.assertEqual(0.0, result["releaseHoldSeconds"])
        self.assertEqual([], sleep_calls)

    def test_executes_one_cube_sequence_with_mock_serial_and_marks_occupied_after_release(self) -> None:
        self.write_hardware_ready_config()
        dry_run = self.plan_only()
        result = run_single_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
            gates=self.gates(),
            serial_factory=lambda *_: FakeSerial(),
            evidence_writer=self.writer,
        )

        self.assertEqual("SUCCESS", result["status"])
        self.assertTrue(result["serialOpened"])
        self.assertTrue(result["hardwareMovement"])
        self.assertTrue(result["suctionActivated"])
        self.assertTrue(result["pickupExecuted"])
        self.assertTrue(result["dropExecuted"])
        self.assertTrue(result["releaseConfirmed"])
        self.assertTrue(result["occupiedPersisted"])
        self.assertEqual(1, FakeSerial.opened_count)
        fake = FakeSerial.instances[0]
        commands = [item.decode("utf-8").strip() for item in fake.writes]
        self.assertEqual(result["planFingerprint"]["commandsPreview"], commands)
        self.assertIn("POSE 1 -1 81 0", commands)
        self.assertEqual(
            [
                "ready_to_take",
                "reset",
                "cube_safe_pose",
                "cube_target_pick",
                "lift_after_pick",
                "reset_with_cube",
                "drop_safe_pose",
                "drop_zone_with_cube",
                "drop_zone_release",
                "retract_after_release",
                "reset_without_cube",
                "ready_to_take_end",
            ],
            [response["step"] for response in result["firmwareResponses"]],
        )
        self.assertTrue(fake.closed)
        persisted = json.loads(self.drop_zones_path.read_text(encoding="utf-8"))
        self.assertTrue(persisted["red"][0]["occupied"])

    def test_sync_backend_payload_omits_unavailable_error_code(self) -> None:
        self.write_hardware_ready_config()
        dry_run = self.plan_only()

        class FakeBackend:
            def __init__(self) -> None:
                self.payload: dict[str, object] | None = None

            def create_session(self, truck_code: str) -> dict[str, object]:
                return {"session": {"id": f"session-{truck_code}"}}

            def register_robot_action(self, payload: dict[str, object]) -> dict[str, object]:
                self.payload = payload
                return {"action": {"id": "action-1"}}

        backend = FakeBackend()

        result = run_single_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
            gates=self.gates(),
            serial_factory=lambda *_: FakeSerial(),
            evidence_writer=self.writer,
            backend_client=backend,
        )

        metadata = backend.payload["metadata"]
        self.assertEqual("SUCCESS", result["status"])
        self.assertNotIn("errorCode", metadata)
        self.assertIn("pickupOffset", metadata)

    def test_failure_before_release_cancels_reservation_and_closes_serial(self) -> None:
        self.write_hardware_ready_config()
        dry_run = self.plan_only()

        def serial_factory(*_: object) -> FakeSerial:
            return FakeSerial([b"DONE\n", b"ERROR blocked\n"])

        with self.assertRaises(SingleCubePickDropError):
            run_single_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                dry_run_evidence_path=Path(dry_run["evidence"]["json"]),
                gates=self.gates(),
                serial_factory=serial_factory,
                evidence_writer=self.writer,
            )

        self.assertTrue(FakeSerial.instances[0].closed)
        persisted = json.loads(self.drop_zones_path.read_text(encoding="utf-8"))
        self.assertFalse(persisted["red"][0]["occupied"])


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from src.models import CubeDetection, DetectionSnapshot
from src.multi_cube_pick_drop import (
    MultiCubePickDropError,
    MultiHardwareGates,
    run_multi_cube_pick_drop,
)
from src.single_cube_pick_drop import PickDropEvidenceWriter
from tests.helpers import valid_drop_zones, write_json
from tests.test_single_cube_pick_drop import hardware_ready_planning_payload


class FakeSerial:
    opened_count = 0
    instances: list["FakeSerial"] = []

    def __init__(self, responses: list[bytes] | None = None) -> None:
        self.is_open = True
        self.responses = responses or [b"DONE\n"] * 100
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


class MultiCubePickDropTests(unittest.TestCase):
    def setUp(self) -> None:
        FakeSerial.opened_count = 0
        FakeSerial.instances = []
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.directory = Path(self.temporary_directory.name)
        self.drop_zones_path = self.directory / "drop-zones.json"
        write_json(self.drop_zones_path, valid_drop_zones(slots_per_color=3))
        self.config_path = self.directory / "edge.json"
        self.write_config()
        self.writer = PickDropEvidenceWriter(self.directory / "multi-evidence")
        self.snapshot = DetectionSnapshot(
            "run-multi",
            "opencv-camera",
            (
                CubeDetection("blue", 40, 90, 20, 20, 0.8, {"sizeValid": True}),
                CubeDetection("red", 80, 80, 20, 20, 0.9, {"sizeValid": True}),
                CubeDetection("yellow", 10, 70, 20, 20, 0.7, {"sizeValid": True}),
            ),
            truck_code="TRUCK-001",
            metadata={"snapshotSignature": "sig-multi", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
        )

    def write_config(self, *, pickup_offset: dict[str, float] | None = None) -> None:
        planning = hardware_ready_planning_payload()
        if pickup_offset is not None:
            planning["pickupOffset"] = pickup_offset
        write_json(
            self.config_path,
            {
                "profile": "vision-dry-run",
                "truckCode": "TRUCK-001",
                "dropZones": {"path": "drop-zones.json"},
                "movement": {"delay_seconds": 0.0},
                "safety": {
                    "dryRun": True,
                    "enableHardwareMotion": False,
                    "humanConfirmationRequired": True,
                },
                "robotPlanning": planning,
                "vision": {"source": "simulation", "evidence": {"directory": "evidence"}, "cubes": []},
            },
        )

    def gates(self) -> MultiHardwareGates:
        return MultiHardwareGates(
            confirm_multi_pick_drop=True,
            enable_hardware_motion=True,
            confirm_zone_clear=True,
            confirm_operator_present=True,
            confirm_emergency_stop_ready=True,
            confirm_suction=True,
            port="COM4",
        )

    def test_plan_multi_cube_with_three_detected_cubes_is_stable_by_color(self) -> None:
        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            max_cubes=3,
            plan_only=True,
            evidence_writer=self.writer,
        )

        self.assertEqual("DRY_RUN_PLANNED", result["status"])
        self.assertEqual(3, result["totalDetectedCubes"])
        self.assertEqual(3, result["totalPlannedCubes"])
        self.assertEqual(["red", "blue", "yellow"], [action["selectedCubeColor"] for action in result["plannedActions"]])
        self.assertEqual(0, FakeSerial.opened_count)
        self.assertTrue(Path(result["evidence"]["json"]).exists())

    def test_max_cubes_limits_planned_actions(self) -> None:
        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            max_cubes=2,
            plan_only=True,
            evidence_writer=self.writer,
        )

        self.assertEqual(2, result["totalPlannedCubes"])
        self.assertEqual(["red", "blue"], [action["selectedCubeColor"] for action in result["plannedActions"]])

    def test_same_color_cubes_use_distinct_drop_zones_by_position_order(self) -> None:
        snapshot = DetectionSnapshot(
            "run-reds",
            "opencv-camera",
            (
                CubeDetection("red", 20, 10, 20, 20, 0.9, {"sizeValid": True}),
                CubeDetection("red", 40, 20, 20, 20, 0.8, {"sizeValid": True}),
            ),
            truck_code="TRUCK-001",
            metadata={"snapshotSignature": "sig-reds", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
        )

        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=snapshot,
            max_cubes=2,
            plan_only=True,
            evidence_writer=self.writer,
        )

        self.assertEqual(["DROP_RED_01", "DROP_RED_02"], [action["dropZoneCode"] for action in result["plannedActions"]])
        self.assertEqual([1, 2], [action["positionOrder"] for action in result["plannedActions"]])

    def test_cube_without_available_drop_zone_is_skipped(self) -> None:
        payload = valid_drop_zones(slots_per_color=1)
        payload["green"][0]["occupied"] = True
        write_json(self.drop_zones_path, payload)
        snapshot = DetectionSnapshot(
            "run-green",
            "opencv-camera",
            (CubeDetection("green", 20, 10, 20, 20, 0.9, {"sizeValid": True}),),
            truck_code="TRUCK-001",
            metadata={"snapshotSignature": "sig-green", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
        )

        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=snapshot,
            max_cubes=1,
            plan_only=True,
            evidence_writer=self.writer,
        )

        self.assertEqual("FAILED", result["status"])
        self.assertEqual(0, result["totalPlannedCubes"])
        self.assertEqual(1, result["totalSkippedCubes"])
        self.assertEqual("ZONE_UNAVAILABLE", result["skippedCubes"][0]["reason"])

    def test_pickup_offset_applies_to_each_cube_and_not_drop_target(self) -> None:
        self.write_config(pickup_offset={"x": 5, "y": -1, "z": 2})

        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            max_cubes=2,
            plan_only=True,
            evidence_writer=self.writer,
        )

        for action in result["plannedActions"]:
            self.assertEqual({"x": 5.0, "y": -1.0, "z": 2.0}, action["pickupOffset"])
            self.assertAlmostEqual(action["pickupTargetBase"]["x"] + 5.0, action["pickupTarget"]["x"])
            self.assertNotEqual(action["pickupTarget"]["x"], action["dropZonePose"]["x"])

    def test_plan_only_does_not_move_hardware_or_persist_occupied(self) -> None:
        before = self.drop_zones_path.read_bytes()

        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            max_cubes=3,
            plan_only=True,
            serial_factory=lambda *_: FakeSerial(),
            evidence_writer=self.writer,
        )

        self.assertEqual("DRY_RUN_PLANNED", result["status"])
        self.assertEqual(0, FakeSerial.opened_count)
        self.assertEqual(before, self.drop_zones_path.read_bytes())

    def test_hardware_mode_requires_multi_cube_safety_gates(self) -> None:
        with self.assertRaises(MultiCubePickDropError) as context:
            run_multi_cube_pick_drop(
                self.config_path,
                snapshot=self.snapshot,
                max_cubes=2,
                gates=MultiHardwareGates(port="COM4"),
                serial_factory=lambda *_: FakeSerial(),
                evidence_writer=self.writer,
            )

        self.assertEqual("CONFIRMATION_REQUIRED", context.exception.code)
        self.assertEqual(0, FakeSerial.opened_count)

    def test_error_on_second_cube_generates_partial_success(self) -> None:
        responses = [b"DONE\n"] * 12 + [b"ERROR blocked\n"]

        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            max_cubes=2,
            gates=self.gates(),
            serial_factory=lambda *_: FakeSerial(responses),
            evidence_writer=self.writer,
        )

        self.assertEqual("PARTIAL_SUCCESS", result["status"])
        self.assertEqual(1, result["totalExecutedCubes"])
        self.assertEqual("FAILED", result["executedActions"][1]["status"])
        self.assertEqual("FIRMWARE_ERROR", result["errorCode"])
        persisted = json.loads(self.drop_zones_path.read_text(encoding="utf-8"))
        self.assertTrue(persisted["red"][0]["occupied"])
        self.assertFalse(persisted["blue"][0]["occupied"])

    def test_backend_metadata_multi_cube_is_json_safe(self) -> None:
        class FakeBackend:
            def __init__(self) -> None:
                self.payloads: list[dict[str, object]] = []

            def create_session(self, truck_code: str) -> dict[str, object]:
                return {"session": {"id": f"session-{truck_code}"}}

            def register_robot_action(self, payload: dict[str, object]) -> dict[str, object]:
                json.dumps(payload)
                self.payloads.append(payload)
                return {"action": {"id": f"action-{len(self.payloads)}"}}

        backend = FakeBackend()

        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=self.snapshot,
            max_cubes=2,
            gates=self.gates(),
            serial_factory=lambda *_: FakeSerial(),
            evidence_writer=self.writer,
            backend_client=backend,
        )

        self.assertEqual("SUCCESS", result["status"])
        self.assertEqual(2, len(backend.payloads))
        metadata = backend.payloads[0]["metadata"]
        self.assertIn("multiCubeRunId", metadata)
        self.assertEqual(1, metadata["sequenceNumber"])
        self.assertEqual(2, metadata["totalPlannedCubes"])
        self.assertIn("firmwareResponses", metadata)

    def test_no_cubes_detected_writes_clear_status_without_motion(self) -> None:
        snapshot = DetectionSnapshot(
            "run-empty",
            "opencv-camera",
            (),
            truck_code="TRUCK-001",
            metadata={"snapshotSignature": "sig-empty", "qrDetected": True, "qrValid": True, "qrStatus": "OK"},
        )

        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=snapshot,
            max_cubes=3,
            gates=self.gates(),
            serial_factory=lambda *_: FakeSerial(),
            evidence_writer=self.writer,
        )

        self.assertEqual("NO_CUBES_DETECTED", result["status"])
        self.assertEqual(0, FakeSerial.opened_count)

    def test_no_valid_qr_writes_clear_status_without_motion(self) -> None:
        snapshot = DetectionSnapshot(
            "run-no-qr",
            "opencv-camera",
            self.snapshot.detections,
            metadata={"snapshotSignature": "sig-no-qr", "qrDetected": False, "qrValid": False},
        )

        result = run_multi_cube_pick_drop(
            self.config_path,
            snapshot=snapshot,
            max_cubes=3,
            gates=self.gates(),
            serial_factory=lambda *_: FakeSerial(),
            evidence_writer=self.writer,
        )

        self.assertEqual("NO_VALID_QR", result["status"])
        self.assertEqual(0, FakeSerial.opened_count)


if __name__ == "__main__":
    unittest.main()

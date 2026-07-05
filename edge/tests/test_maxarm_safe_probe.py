from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from src.maxarm_safe_probe import run_safe_probe


class FakeSerial:
    instances: list["FakeSerial"] = []

    def __init__(self, responses: list[bytes] | None = None) -> None:
        self.is_open = True
        self.responses = [b"DONE\n"] if responses is None else responses
        self.writes: list[bytes] = []
        self.closed = False
        FakeSerial.instances.append(self)

    def write(self, payload: bytes) -> None:
        self.writes.append(payload)

    def readline(self) -> bytes:
        return self.responses.pop(0) if self.responses else b""

    def close(self) -> None:
        self.closed = True
        self.is_open = False


class MaxArmSafeProbeTests(unittest.TestCase):
    def setUp(self) -> None:
        FakeSerial.instances.clear()
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.directory = Path(self.temporary_directory.name)
        self.config_path = self.directory / "safe-probe.json"

    def write_config(self, **overrides: object) -> None:
        payload: dict[str, object] = {
            "serial": {"port": "COM4", "baudrate": 115200, "timeoutSeconds": 0.05},
            "safePoses": {
                "reset": {"x": 0, "y": -79.4, "z": 176.2},
                "ready": {"x": 124, "y": -83, "z": 212},
            },
            "allowedPoseNames": ["reset", "ready"],
            "defaultPoseName": "reset",
            "suctionAllowed": False,
            "pickupAllowed": False,
            "dropAllowed": False,
            "hardwareMotionRequiresConfirmation": True,
            "evidence": {"directory": str(self.directory / "evidence")},
        }
        payload.update(overrides)
        self.config_path.write_text(json.dumps(payload), encoding="utf-8")

    def test_does_not_open_serial_without_confirmation(self) -> None:
        self.write_config()

        result = run_safe_probe(
            self.config_path,
            confirm_safe_motion=False,
            serial_factory=lambda *_: FakeSerial(),
        )

        self.assertEqual("ERROR", result["result"])
        self.assertEqual("CONFIRMATION_REQUIRED", result["errorCode"])
        self.assertFalse(result["serialOpened"])
        self.assertFalse(result["hardwareMovement"])
        self.assertEqual([], FakeSerial.instances)
        self.assertTrue(Path(result["evidencePath"]).exists())

    def test_opens_serial_with_confirmation_and_allowlisted_pose(self) -> None:
        self.write_config()

        result = run_safe_probe(
            self.config_path,
            confirm_safe_motion=True,
            pose_name_override="reset",
            serial_factory=lambda *_: FakeSerial([b"DONE\n"]),
        )

        self.assertEqual("SUCCESS", result["result"])
        self.assertTrue(result["serialOpened"])
        self.assertTrue(result["hardwareMovement"])
        self.assertFalse(result["suctionActivated"])
        self.assertEqual("POSE 0 -79 176 0", result["commandSent"])
        self.assertEqual([b"POSE 0 -79 176 0\n"], FakeSerial.instances[0].writes)
        self.assertTrue(FakeSerial.instances[0].closed)

    def test_rejects_pose_not_allowlisted_before_serial(self) -> None:
        self.write_config(safePoses={"pickup": {"x": 1, "y": 2, "z": 3}}, allowedPoseNames=["reset"])

        result = run_safe_probe(
            self.config_path,
            confirm_safe_motion=True,
            pose_name_override="pickup",
            serial_factory=lambda *_: FakeSerial(),
        )

        self.assertEqual("POSE_NOT_ALLOWLISTED", result["errorCode"])
        self.assertFalse(result["serialOpened"])
        self.assertEqual([], FakeSerial.instances)

    def test_rejects_suction_pickup_and_drop_flags(self) -> None:
        for flag, code in (
            ("suctionAllowed", "SUCTION_NOT_ALLOWED"),
            ("pickupAllowed", "PICKUP_NOT_ALLOWED"),
            ("dropAllowed", "DROP_NOT_ALLOWED"),
        ):
            FakeSerial.instances.clear()
            self.write_config(**{flag: True})
            result = run_safe_probe(
                self.config_path,
                confirm_safe_motion=True,
                serial_factory=lambda *_: FakeSerial(),
            )
            self.assertEqual(code, result["errorCode"])
            self.assertFalse(result["serialOpened"])
            self.assertEqual([], FakeSerial.instances)

    def test_timeout_closes_serial_and_writes_evidence(self) -> None:
        self.write_config()

        result = run_safe_probe(
            self.config_path,
            confirm_safe_motion=True,
            serial_factory=lambda *_: FakeSerial([]),
        )

        self.assertEqual("ERROR", result["result"])
        self.assertEqual("TIMEOUT", result["errorCode"])
        self.assertTrue(result["timeout"])
        self.assertTrue(FakeSerial.instances[0].closed)
        evidence = json.loads(Path(result["evidencePath"]).read_text(encoding="utf-8"))
        self.assertEqual(result["runId"], evidence["runId"])
        self.assertEqual("COM4", evidence["portSanitized"])
        self.assertIn("commandPreview", evidence)
        self.assertFalse(evidence["pickupExecuted"])
        self.assertFalse(evidence["dropExecuted"])

    def test_no_camera_dependency_in_probe(self) -> None:
        self.write_config()

        result = run_safe_probe(
            self.config_path,
            confirm_safe_motion=True,
            serial_factory=lambda *_: FakeSerial([b"DONE\n"]),
        )

        encoded = json.dumps(result)
        self.assertNotIn("camera", encoded.lower())
        self.assertNotIn("opencv", encoded.lower())


if __name__ == "__main__":
    unittest.main()

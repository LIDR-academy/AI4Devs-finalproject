from __future__ import annotations

import unittest

from src.models import RobotPose
from src.robot.maxarm_serial import (
    MaxArmSerialAdapter,
    MaxArmSerialError,
    MaxArmSerialTimeout,
    build_pose_command,
)


class FakeSerial:
    def __init__(self, responses: list[bytes] | None = None) -> None:
        self.is_open = True
        self.responses = responses or []
        self.writes: list[bytes] = []
        self.closed = False

    def write(self, payload: bytes) -> None:
        self.writes.append(payload)

    def readline(self) -> bytes:
        return self.responses.pop(0) if self.responses else b""

    def close(self) -> None:
        self.closed = True
        self.is_open = False


class MaxArmSerialAdapterTests(unittest.TestCase):
    def test_build_pose_command_rounds_coordinates_and_disables_suction(self) -> None:
        self.assertEqual("POSE 1 -3 4 0", build_pose_command(RobotPose(1.2, -2.6, 4.49)))
        with self.assertRaises(MaxArmSerialError) as context:
            build_pose_command(RobotPose(1, 2, 3), suction=1)
        self.assertEqual("SUCTION_NOT_ALLOWED", context.exception.code)

    def test_sends_pose_and_handles_done(self) -> None:
        fake = FakeSerial([b"DONE\n"])
        adapter = MaxArmSerialAdapter("COM4", 115200, 1, serial_factory=lambda *_: fake)
        adapter.open()

        result = adapter.send_safe_pose(RobotPose(0, -79, 176))
        adapter.close()

        self.assertTrue(result.success)
        self.assertEqual("POSE 0 -79 176 0", result.command_sent)
        self.assertEqual([b"POSE 0 -79 176 0\n"], fake.writes)
        self.assertTrue(fake.closed)

    def test_firmware_error_is_controlled(self) -> None:
        fake = FakeSerial([b"ERROR bad pose\n"])
        adapter = MaxArmSerialAdapter("COM4", 115200, 1, serial_factory=lambda *_: fake)
        adapter.open()

        with self.assertRaises(MaxArmSerialError) as context:
            adapter.send_safe_pose(RobotPose(0, 0, 100))
        adapter.close()

        self.assertEqual("FIRMWARE_ERROR", context.exception.code)
        self.assertTrue(fake.closed)

    def test_timeout_is_controlled(self) -> None:
        fake = FakeSerial([])
        adapter = MaxArmSerialAdapter("COM4", 115200, 0.01, serial_factory=lambda *_: fake)
        adapter.open()

        with self.assertRaises(MaxArmSerialTimeout):
            adapter.send_safe_pose(RobotPose(0, 0, 100))
        adapter.close()

        self.assertTrue(fake.closed)

    def test_requires_open_serial_before_send(self) -> None:
        adapter = MaxArmSerialAdapter("COM4", 115200, 1, serial_factory=lambda *_: FakeSerial())

        with self.assertRaises(MaxArmSerialError) as context:
            adapter.send_safe_pose(RobotPose(0, 0, 100))

        self.assertEqual("SERIAL_NOT_OPEN", context.exception.code)


if __name__ == "__main__":
    unittest.main()

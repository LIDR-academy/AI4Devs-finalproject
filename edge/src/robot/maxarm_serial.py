from __future__ import annotations

import math
import time
from dataclasses import dataclass
from typing import Callable, Protocol

try:
    from ..models import RobotPose
except ImportError:
    from models import RobotPose


class SerialTransport(Protocol):
    is_open: bool

    def write(self, payload: bytes) -> object:
        ...

    def readline(self) -> bytes:
        ...

    def close(self) -> object:
        ...


SerialFactory = Callable[[str, int, float], SerialTransport]


class MaxArmSerialError(RuntimeError):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(f"{code}: {message}")


class MaxArmSerialTimeout(MaxArmSerialError):
    def __init__(self, message: str = "Timeout waiting for DONE from MaxArm firmware") -> None:
        super().__init__("TIMEOUT", message)


@dataclass(frozen=True)
class MaxArmSerialResult:
    command_sent: str
    firmware_response: str | None
    success: bool


def default_serial_factory(port: str, baudrate: int, timeout_seconds: float) -> SerialTransport:
    try:
        import serial
    except ImportError as exc:
        raise MaxArmSerialError(
            "PYSERIAL_NOT_INSTALLED",
            "pyserial is required for MaxArm serial communication",
        ) from exc
    return serial.Serial(port, baudrate, timeout=timeout_seconds)


def build_pose_command(pose: RobotPose, *, suction: int = 0) -> str:
    if suction != 0:
        raise MaxArmSerialError("SUCTION_NOT_ALLOWED", "safe probe only allows suction=0")
    coordinates = (pose.x, pose.y, pose.z)
    if not all(math.isfinite(value) for value in coordinates):
        raise MaxArmSerialError("INVALID_POSE", "pose coordinates must be finite")
    x, y, z = (int(round(value)) for value in coordinates)
    return f"POSE {x} {y} {z} 0"


class MaxArmSerialAdapter:
    def __init__(
        self,
        port: str,
        baudrate: int,
        timeout_seconds: float,
        *,
        serial_factory: SerialFactory | None = None,
    ) -> None:
        if not port.strip():
            raise MaxArmSerialError("INVALID_SERIAL_CONFIG", "serial port is required")
        if baudrate <= 0:
            raise MaxArmSerialError("INVALID_SERIAL_CONFIG", "baudrate must be positive")
        if timeout_seconds <= 0:
            raise MaxArmSerialError("INVALID_SERIAL_CONFIG", "timeout must be positive")
        self.port = port
        self.baudrate = baudrate
        self.timeout_seconds = timeout_seconds
        self._serial_factory = serial_factory or default_serial_factory
        self._transport: SerialTransport | None = None

    @property
    def is_open(self) -> bool:
        return self._transport is not None and bool(getattr(self._transport, "is_open", False))

    def open(self) -> None:
        if self.is_open:
            return
        self._transport = self._serial_factory(self.port, self.baudrate, self.timeout_seconds)

    def close(self) -> None:
        transport = self._transport
        try:
            if transport is not None and bool(getattr(transport, "is_open", False)):
                transport.close()
        finally:
            self._transport = None

    def send_safe_pose(self, pose: RobotPose) -> MaxArmSerialResult:
        if not self.is_open or self._transport is None:
            raise MaxArmSerialError("SERIAL_NOT_OPEN", "open serial before sending a pose")
        command = build_pose_command(pose, suction=0)
        self._transport.write(f"{command}\n".encode("utf-8"))

        deadline = time.monotonic() + self.timeout_seconds
        last_response: str | None = None
        while time.monotonic() < deadline:
            raw_response = self._transport.readline()
            response = raw_response.decode("utf-8", errors="ignore").strip()
            if not response:
                continue
            last_response = response
            response_upper = response.upper()
            if "ERROR" in response_upper:
                raise MaxArmSerialError("FIRMWARE_ERROR", response)
            if "DONE" in response_upper:
                return MaxArmSerialResult(
                    command_sent=command,
                    firmware_response=response,
                    success=True,
                )

        raise MaxArmSerialTimeout(
            f"Timeout waiting for DONE from MaxArm firmware; lastResponse={last_response!r}"
        )

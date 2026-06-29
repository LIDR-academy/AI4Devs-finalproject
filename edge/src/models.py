from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import datetime, timezone
from enum import Enum
from typing import Any


SUPPORTED_COLORS = ("red", "blue", "yellow", "green")


class EdgeRunProfile(str, Enum):
    SIMULATION = "simulation"
    VISION_DRY_RUN = "vision-dry-run"
    HARDWARE = "hardware"

    @classmethod
    def parse(cls, value: object) -> "EdgeRunProfile":
        try:
            return cls(str(value))
        except ValueError as exc:
            supported = ", ".join(profile.value for profile in cls)
            raise ValueError(f"Unsupported Edge run profile: {value!r}. Expected one of: {supported}") from exc


@dataclass(frozen=True)
class RobotPose:
    x: float
    y: float
    z: float

    def as_dict(self) -> dict[str, float]:
        return {"x": self.x, "y": self.y, "z": self.z}


@dataclass(frozen=True)
class CubeDetection:
    color: str
    x: int
    y: int
    w: int
    h: int
    confidence: float | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class DetectionSnapshot:
    source: str
    detections: tuple[CubeDetection, ...]
    frame_id: str | None = None
    calibration_version: str | None = None
    captured_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class DropZoneSlot:
    code: str
    color: str
    position_order: int
    pose: RobotPose
    active: bool
    occupied: bool

    def with_occupied(self, occupied: bool) -> "DropZoneSlot":
        return replace(self, occupied=occupied)

    def as_dict(self) -> dict[str, object]:
        return {
            "code": self.code,
            "color": self.color,
            "position_order": self.position_order,
            **self.pose.as_dict(),
            "active": self.active,
            "occupied": self.occupied,
        }


@dataclass(frozen=True)
class DropZoneSelection:
    run_id: str
    slot: DropZoneSlot


@dataclass(frozen=True)
class RobotActionPlan:
    run_id: str
    profile: EdgeRunProfile
    cube: CubeDetection
    drop_zone: DropZoneSelection
    steps: tuple[RobotPose, ...]


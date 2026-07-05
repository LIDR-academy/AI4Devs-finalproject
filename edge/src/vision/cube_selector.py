from __future__ import annotations

from collections.abc import Iterable

try:
    from ..models import CubeDetection, DetectionSnapshot, SUPPORTED_COLORS
except ImportError:
    from models import CubeDetection, DetectionSnapshot, SUPPORTED_COLORS


class CubeUnavailableError(RuntimeError):
    code = "CUBE_UNAVAILABLE"

    def __init__(self) -> None:
        super().__init__(f"{self.code}: no eligible cube in detection snapshot")


class CubeSelector:
    """Pure deterministic selection without drop-zone, I/O, or device dependencies."""

    def __init__(self, *, policy: str = "highest-confidence", min_confidence: float = 0.0) -> None:
        if policy not in {"highest-confidence", "largest-area"}:
            raise ValueError("policy must be highest-confidence or largest-area")
        if not 0 <= min_confidence <= 1:
            raise ValueError("min_confidence must be between 0 and 1")
        self.policy = policy
        self.min_confidence = min_confidence

    def select(
        self,
        snapshot: DetectionSnapshot,
        allowed_colors: Iterable[str] = SUPPORTED_COLORS,
    ) -> CubeDetection:
        eligible = self.eligible(snapshot, allowed_colors)
        if not eligible:
            raise CubeUnavailableError()

        if self.policy == "largest-area":
            key = lambda cube: (-cube.area, -(cube.confidence or 0.0), cube.color, cube.x, cube.y)
        else:
            key = lambda cube: (-(cube.confidence or 0.0), -cube.area, cube.color, cube.x, cube.y)
        return min(eligible, key=key)

    def eligible(
        self,
        snapshot: DetectionSnapshot,
        allowed_colors: Iterable[str] = SUPPORTED_COLORS,
    ) -> list[CubeDetection]:
        colors = frozenset(str(color).lower() for color in allowed_colors)
        return [
            cube
            for cube in snapshot.detections
            if cube.color in SUPPORTED_COLORS
            and cube.color in colors
            and cube.w > 0
            and cube.h > 0
            and cube.metadata.get("sizeValid", True) is True
            and (cube.confidence is None or cube.confidence >= self.min_confidence)
        ]

    def select_many(
        self,
        snapshot: DetectionSnapshot,
        *,
        max_cubes: int,
        allowed_colors: Iterable[str] = SUPPORTED_COLORS,
    ) -> list[CubeDetection]:
        if max_cubes <= 0:
            return []
        eligible = self.eligible(snapshot, allowed_colors)
        if not eligible:
            return []

        color_order = {color: index for index, color in enumerate(("red", "blue", "yellow", "green"))}
        return sorted(
            eligible,
            key=lambda cube: (
                color_order.get(cube.color, len(color_order)),
                cube.y,
                cube.x,
                -(cube.confidence or 0.0),
                -cube.area,
            ),
        )[:max_cubes]

from __future__ import annotations

from collections.abc import Iterable

try:
    from ..models import DropZoneSlot, SUPPORTED_COLORS
except ImportError:
    from models import DropZoneSlot, SUPPORTED_COLORS


class DropZoneError(RuntimeError):
    code = "DROP_ZONE_ERROR"


class DropZoneUnavailableError(DropZoneError):
    code = "ZONE_UNAVAILABLE"

    def __init__(self, color: str) -> None:
        self.color = color
        super().__init__(f"{self.code}: no active and unoccupied drop-zone slot for color={color}")


class DropZonePlanner:
    """Selects a slot without filesystem, camera, serial, or input mutation."""

    def select(self, color: str, slots: Iterable[DropZoneSlot]) -> DropZoneSlot:
        normalized_color = str(color).strip().lower()
        if normalized_color not in SUPPORTED_COLORS:
            raise DropZoneUnavailableError(normalized_color)

        available = [
            slot
            for slot in slots
            if slot.color == normalized_color and slot.active is True and slot.occupied is False
        ]
        if not available:
            raise DropZoneUnavailableError(normalized_color)

        return min(available, key=lambda slot: (slot.position_order, slot.code))


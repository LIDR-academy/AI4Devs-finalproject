from __future__ import annotations

import json
import math
import os
import tempfile
from dataclasses import replace
from pathlib import Path

try:
    from ..models import (
        DropZoneSelection,
        DropZoneSlot,
        EdgeRunProfile,
        RobotPose,
        SUPPORTED_COLORS,
    )
    from .drop_zone_planner import DropZonePlanner
except ImportError:
    from models import DropZoneSelection, DropZoneSlot, EdgeRunProfile, RobotPose, SUPPORTED_COLORS
    from robot.drop_zone_planner import DropZonePlanner


class DropZoneConfigError(ValueError):
    pass


class DropZoneStateError(RuntimeError):
    pass


class DropZoneAdapter:
    """
    Owns drop-zone JSON validation and runtime reservations.

    Simulation and vision-dry-run are always in-memory. Hardware persistence is
    opt-in and uses an atomic replace; this class never opens camera or serial.
    """

    def __init__(
        self,
        path: Path,
        profile: EdgeRunProfile = EdgeRunProfile.SIMULATION,
        *,
        persist_hardware_state: bool = False,
        planner: DropZonePlanner | None = None,
    ) -> None:
        self.path = path
        self.profile = profile
        self.persist_hardware_state = persist_hardware_state and profile is EdgeRunProfile.HARDWARE
        self.planner = planner or DropZonePlanner()
        self._slots = self._load_slots()
        self._reservations: dict[str, DropZoneSelection] = {}
        self._blocked = False

    @property
    def slots(self) -> tuple[DropZoneSlot, ...]:
        return self._slots

    @property
    def blocked(self) -> bool:
        return self._blocked

    def reserve(self, color: str, run_id: str) -> DropZoneSelection:
        self._ensure_available()
        normalized_run_id = str(run_id).strip()
        if not normalized_run_id:
            raise DropZoneStateError("run_id must not be empty")

        existing = self._reservations.get(normalized_run_id)
        if existing is not None:
            if existing.slot.color != str(color).strip().lower():
                raise DropZoneStateError(f"run_id={normalized_run_id} already reserved another color")
            return existing

        reserved_codes = {selection.slot.code for selection in self._reservations.values()}
        effective_slots = tuple(
            replace(slot, occupied=True) if slot.code in reserved_codes else slot
            for slot in self._slots
        )
        slot = self.planner.select(color, effective_slots)
        selection = DropZoneSelection(run_id=normalized_run_id, slot=slot)
        self._reservations[normalized_run_id] = selection
        return selection

    def cancel(self, run_id: str) -> DropZoneSelection:
        self._ensure_available()
        try:
            return self._reservations.pop(run_id)
        except KeyError as exc:
            raise DropZoneStateError(f"No drop-zone reservation for run_id={run_id}") from exc

    def confirm(self, run_id: str) -> DropZoneSlot:
        self._ensure_available()
        selection = self._reservations.get(run_id)
        if selection is None:
            raise DropZoneStateError(f"No drop-zone reservation for run_id={run_id}")

        updated_slots = tuple(
            slot.with_occupied(True) if slot.code == selection.slot.code else slot
            for slot in self._slots
        )
        self._slots = updated_slots

        try:
            self._persist_if_enabled()
        except Exception as exc:
            self._blocked = True
            raise DropZoneStateError(
                "Drop-zone release was confirmed but occupancy could not be persisted; adapter is blocked"
            ) from exc

        self._reservations.pop(run_id)
        return next(slot for slot in self._slots if slot.code == selection.slot.code)

    def reset_occupancy(self, *, confirmed: bool = False) -> int:
        self._ensure_available()
        if not confirmed:
            raise DropZoneStateError("Drop-zone reset requires explicit confirmation")
        if self._reservations:
            raise DropZoneStateError("Cannot reset drop zones while reservations are active")

        changed = sum(1 for slot in self._slots if slot.occupied)
        previous_slots = self._slots
        self._slots = tuple(slot.with_occupied(False) for slot in self._slots)
        try:
            self._persist_if_enabled()
        except Exception:
            self._slots = previous_slots
            raise
        return changed

    def _ensure_available(self) -> None:
        if self._blocked:
            raise DropZoneStateError("Drop-zone adapter is blocked pending human reconciliation")

    def _load_slots(self) -> tuple[DropZoneSlot, ...]:
        try:
            with self.path.open("r", encoding="utf-8") as file:
                payload = json.load(file)
        except (OSError, json.JSONDecodeError) as exc:
            raise DropZoneConfigError(f"Could not load drop-zone JSON from {self.path}: {exc}") from exc

        if not isinstance(payload, dict):
            raise DropZoneConfigError("Drop-zone JSON must be an object keyed by color")

        payload_colors = set(payload)
        supported_colors = set(SUPPORTED_COLORS)
        if payload_colors != supported_colors:
            missing = sorted(supported_colors - payload_colors)
            unknown = sorted(payload_colors - supported_colors)
            raise DropZoneConfigError(
                f"Drop-zone colors must be exactly {sorted(supported_colors)}; missing={missing}, unknown={unknown}"
            )

        slots: list[DropZoneSlot] = []
        seen_codes: set[str] = set()
        seen_orders: dict[str, set[int]] = {color: set() for color in SUPPORTED_COLORS}

        for color in SUPPORTED_COLORS:
            raw_slots = payload[color]
            if not isinstance(raw_slots, list) or not raw_slots:
                raise DropZoneConfigError(f"Drop-zone color {color} must contain a non-empty list")

            for index, raw_slot in enumerate(raw_slots):
                label = f"{color}[{index}]"
                if not isinstance(raw_slot, dict):
                    raise DropZoneConfigError(f"{label} must be an object")

                required = {"code", "color", "position_order", "x", "y", "z", "active", "occupied"}
                missing_fields = required - raw_slot.keys()
                if missing_fields:
                    raise DropZoneConfigError(f"{label} missing fields: {sorted(missing_fields)}")

                code = raw_slot["code"]
                if not isinstance(code, str) or not code.strip():
                    raise DropZoneConfigError(f"{label}.code must be a non-empty string")
                code = code.strip()
                if code in seen_codes:
                    raise DropZoneConfigError(f"Duplicate drop-zone code: {code}")
                seen_codes.add(code)

                slot_color = raw_slot["color"]
                if slot_color != color:
                    raise DropZoneConfigError(f"{label}.color must equal its parent color {color}")

                position_order = raw_slot["position_order"]
                if isinstance(position_order, bool) or not isinstance(position_order, int) or position_order <= 0:
                    raise DropZoneConfigError(f"{label}.position_order must be a positive integer")
                if position_order in seen_orders[color]:
                    raise DropZoneConfigError(
                        f"Duplicate position_order={position_order} for color={color}"
                    )
                seen_orders[color].add(position_order)

                coordinates = {
                    axis: self._parse_coordinate(raw_slot[axis], f"{label}.{axis}")
                    for axis in ("x", "y", "z")
                }

                active = raw_slot["active"]
                occupied = raw_slot["occupied"]
                if not isinstance(active, bool) or not isinstance(occupied, bool):
                    raise DropZoneConfigError(f"{label}.active and occupied must be booleans")

                slots.append(
                    DropZoneSlot(
                        code=code,
                        color=color,
                        position_order=position_order,
                        pose=RobotPose(**coordinates),
                        active=active,
                        occupied=occupied,
                    )
                )

        return tuple(slots)

    @staticmethod
    def _parse_coordinate(value: object, field_name: str) -> float:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise DropZoneConfigError(f"{field_name} must be numeric")
        number = float(value)
        if not math.isfinite(number):
            raise DropZoneConfigError(f"{field_name} must be finite")
        return number

    def _persist_if_enabled(self) -> None:
        if not self.persist_hardware_state:
            return

        payload = {color: [] for color in SUPPORTED_COLORS}
        for slot in self._slots:
            payload[slot.color].append(slot.as_dict())
        for color in SUPPORTED_COLORS:
            payload[color].sort(key=lambda item: (int(item["position_order"]), str(item["code"])))

        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                "w",
                encoding="utf-8",
                dir=self.path.parent,
                prefix=f".{self.path.name}.",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                json.dump(payload, temporary_file, indent=2)
                temporary_file.write("\n")
                temporary_file.flush()
                os.fsync(temporary_file.fileno())
                temporary_path = Path(temporary_file.name)
            os.replace(temporary_path, self.path)
        finally:
            if temporary_path is not None and temporary_path.exists():
                temporary_path.unlink()


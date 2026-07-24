from __future__ import annotations

import copy
import json
import tempfile
import unittest
from pathlib import Path

from src.models import EdgeRunProfile
from src.robot.drop_zone_adapter import (
    DropZoneAdapter,
    DropZoneConfigError,
    DropZoneStateError,
)
from src.robot.drop_zone_planner import DropZoneUnavailableError
from tests.helpers import valid_drop_zones, write_json


class DropZoneAdapterTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.path = Path(self.temporary_directory.name) / "drop_zones.json"
        write_json(self.path, valid_drop_zones())

    def test_two_reservations_do_not_use_the_same_slot(self) -> None:
        adapter = DropZoneAdapter(self.path)

        first = adapter.reserve("red", "run-1")
        second = adapter.reserve("red", "run-2")

        self.assertEqual("DROP_RED_01", first.slot.code)
        self.assertEqual("DROP_RED_02", second.slot.code)
        self.assertFalse(first.slot.occupied)
        self.assertFalse(second.slot.occupied)

    def test_confirm_explicitly_marks_only_reserved_slot(self) -> None:
        adapter = DropZoneAdapter(self.path)
        selection = adapter.reserve("blue", "run-1")

        confirmed = adapter.confirm("run-1")

        self.assertEqual(selection.slot.code, confirmed.code)
        self.assertTrue(confirmed.occupied)
        other_slots = [item for item in adapter.slots if item.color == "blue" and item.code != confirmed.code]
        self.assertTrue(all(not item.occupied for item in other_slots))

    def test_confirm_unknown_reservation_fails_closed(self) -> None:
        adapter = DropZoneAdapter(self.path)

        with self.assertRaises(DropZoneStateError):
            adapter.confirm("unknown-run")

    def test_full_zone_returns_zone_unavailable_without_mutation(self) -> None:
        payload = valid_drop_zones()
        for raw_slot in payload["yellow"]:
            raw_slot["occupied"] = True
        write_json(self.path, payload)
        adapter = DropZoneAdapter(self.path)
        before = adapter.slots

        with self.assertRaises(DropZoneUnavailableError) as context:
            adapter.reserve("yellow", "run-1")

        self.assertEqual("ZONE_UNAVAILABLE", context.exception.code)
        self.assertEqual(before, adapter.slots)

    def test_reset_requires_confirmation_and_no_active_reservations(self) -> None:
        adapter = DropZoneAdapter(self.path)
        adapter.reserve("green", "run-1")

        with self.assertRaises(DropZoneStateError):
            adapter.reset_occupancy(confirmed=True)

        adapter.cancel("run-1")
        with self.assertRaises(DropZoneStateError):
            adapter.reset_occupancy()

    def test_hardware_reset_preserves_configuration_fields(self) -> None:
        payload = valid_drop_zones()
        payload["red"][0]["occupied"] = True
        write_json(self.path, payload)
        before = copy.deepcopy(payload)
        adapter = DropZoneAdapter(
            self.path,
            EdgeRunProfile.HARDWARE,
            persist_hardware_state=True,
        )

        changed = adapter.reset_occupancy(confirmed=True)
        after = json.loads(self.path.read_text(encoding="utf-8"))

        self.assertEqual(1, changed)
        for color, raw_slots in after.items():
            for index, raw_slot in enumerate(raw_slots):
                self.assertFalse(raw_slot["occupied"])
                for key in ("code", "color", "position_order", "x", "y", "z", "active"):
                    self.assertEqual(before[color][index][key], raw_slot[key])

    def test_simulation_and_dry_run_do_not_modify_source_json(self) -> None:
        initial_content = self.path.read_bytes()

        for profile in (EdgeRunProfile.SIMULATION, EdgeRunProfile.VISION_DRY_RUN):
            with self.subTest(profile=profile.value):
                adapter = DropZoneAdapter(self.path, profile)
                adapter.reserve("red", f"run-{profile.value}")
                adapter.confirm(f"run-{profile.value}")
                adapter.reset_occupancy(confirmed=True)
                self.assertEqual(initial_content, self.path.read_bytes())

    def test_invalid_json_fails_before_planning(self) -> None:
        self.path.write_text("{not-json", encoding="utf-8")

        with self.assertRaises(DropZoneConfigError):
            DropZoneAdapter(self.path)

    def test_duplicate_code_fails_closed(self) -> None:
        payload = valid_drop_zones()
        payload["blue"][0]["code"] = payload["red"][0]["code"]
        write_json(self.path, payload)

        with self.assertRaises(DropZoneConfigError):
            DropZoneAdapter(self.path)

    def test_duplicate_position_order_per_color_fails_closed(self) -> None:
        payload = valid_drop_zones()
        payload["green"][1]["position_order"] = payload["green"][0]["position_order"]
        write_json(self.path, payload)

        with self.assertRaises(DropZoneConfigError):
            DropZoneAdapter(self.path)

    def test_invalid_coordinate_or_boolean_fails_closed(self) -> None:
        invalid_payloads = []

        coordinate_bool = valid_drop_zones()
        coordinate_bool["red"][0]["x"] = True
        invalid_payloads.append(coordinate_bool)

        invalid_boolean = valid_drop_zones()
        invalid_boolean["blue"][0]["active"] = 1
        invalid_payloads.append(invalid_boolean)

        for payload in invalid_payloads:
            with self.subTest(payload=payload):
                write_json(self.path, payload)
                with self.assertRaises(DropZoneConfigError):
                    DropZoneAdapter(self.path)


if __name__ == "__main__":
    unittest.main()


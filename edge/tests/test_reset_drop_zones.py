from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from src.reset_drop_zones import ResetDropZonesError, reset_drop_zones
from tests.helpers import valid_drop_zones, write_json


class ResetDropZonesTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.directory = Path(self.temporary_directory.name)
        self.drop_zones_path = self.directory / "drop-zones.json"
        payload = valid_drop_zones()
        payload["red"][0]["occupied"] = True
        payload["blue"][0]["occupied"] = True
        payload["blue"][0]["active"] = False
        write_json(self.drop_zones_path, payload)
        self.config_path = self.directory / "edge.json"
        write_json(self.config_path, {"dropZones": {"path": "drop-zones.json"}})

    def read_drop_zones(self) -> dict[str, list[dict[str, object]]]:
        return json.loads(self.drop_zones_path.read_text(encoding="utf-8"))

    def test_reset_all_creates_backup_and_preserves_non_occupied_fields(self) -> None:
        before = self.read_drop_zones()

        summary = reset_drop_zones(
            self.config_path,
            reset_all=True,
            confirm_reset=True,
            backup_timestamp="20260705-120000",
        )
        after = self.read_drop_zones()

        self.assertEqual(8, summary["totalSlotsReviewed"])
        self.assertEqual(2, summary["totalSlotsReset"])
        self.assertEqual(["blue", "red"], summary["affectedColors"])
        self.assertTrue(Path(summary["backup"]).exists())
        for color, slots in after.items():
            for index, slot in enumerate(slots):
                self.assertFalse(slot["occupied"])
                for field in ("active", "x", "y", "z", "code", "color", "position_order"):
                    self.assertEqual(before[color][index][field], slot[field])

    def test_reset_by_color_only_changes_that_color(self) -> None:
        summary = reset_drop_zones(
            self.config_path,
            color="blue",
            confirm_reset=True,
            backup_timestamp="20260705-120001",
        )
        after = self.read_drop_zones()

        self.assertEqual(2, summary["totalSlotsReviewed"])
        self.assertEqual(1, summary["totalSlotsReset"])
        self.assertEqual(["blue"], summary["affectedColors"])
        self.assertTrue(after["red"][0]["occupied"])
        self.assertFalse(after["blue"][0]["occupied"])
        self.assertFalse(after["blue"][0]["active"])

    def test_requires_confirmation(self) -> None:
        with self.assertRaises(ResetDropZonesError) as context:
            reset_drop_zones(self.config_path, reset_all=True)

        self.assertEqual("CONFIRMATION_REQUIRED", context.exception.code)
        self.assertTrue(self.read_drop_zones()["red"][0]["occupied"])

    def test_requires_exactly_one_target(self) -> None:
        with self.assertRaises(ResetDropZonesError):
            reset_drop_zones(self.config_path, confirm_reset=True)
        with self.assertRaises(ResetDropZonesError):
            reset_drop_zones(self.config_path, reset_all=True, color="red", confirm_reset=True)


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import unittest

from src.models import DropZoneSlot, RobotPose
from src.robot.drop_zone_planner import DropZonePlanner, DropZoneUnavailableError


def slot(
    code: str,
    color: str,
    order: int,
    *,
    active: bool = True,
    occupied: bool = False,
) -> DropZoneSlot:
    return DropZoneSlot(
        code=code,
        color=color,
        position_order=order,
        pose=RobotPose(x=order, y=-order, z=80),
        active=active,
        occupied=occupied,
    )


class DropZonePlannerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.planner = DropZonePlanner()

    def test_selects_same_color_with_lowest_position_order(self) -> None:
        slots = (
            slot("BLUE-01", "blue", 1),
            slot("RED-03", "red", 3),
            slot("RED-01", "red", 1),
            slot("RED-02", "red", 2),
        )

        selected = self.planner.select("red", slots)

        self.assertEqual("RED-01", selected.code)
        self.assertEqual("red", selected.color)

    def test_ignores_inactive_and_occupied_slots(self) -> None:
        slots = (
            slot("RED-01", "red", 1, active=False),
            slot("RED-02", "red", 2, occupied=True),
            slot("RED-03", "red", 3),
        )

        selected = self.planner.select("red", slots)

        self.assertEqual("RED-03", selected.code)

    def test_selects_second_blue_slot_when_first_is_occupied(self) -> None:
        slots = (
            slot("DROP_BLUE_01", "blue", 1, occupied=True),
            slot("DROP_BLUE_02", "blue", 2),
            slot("DROP_BLUE_03", "blue", 3),
        )

        selected = self.planner.select("blue", slots)

        self.assertEqual("DROP_BLUE_02", selected.code)

    def test_zone_full_returns_zone_unavailable(self) -> None:
        slots = (
            slot("GREEN-01", "green", 1, occupied=True),
            slot("GREEN-02", "green", 2, active=False),
        )

        with self.assertRaises(DropZoneUnavailableError) as context:
            self.planner.select("green", slots)

        self.assertEqual("ZONE_UNAVAILABLE", context.exception.code)

    def test_unsupported_color_returns_zone_unavailable(self) -> None:
        with self.assertRaises(DropZoneUnavailableError) as context:
            self.planner.select("purple", ())

        self.assertEqual("ZONE_UNAVAILABLE", context.exception.code)

    def test_does_not_mutate_input(self) -> None:
        slots = [slot("YELLOW-02", "yellow", 2), slot("YELLOW-01", "yellow", 1)]
        before = list(slots)

        self.planner.select("yellow", slots)

        self.assertEqual(before, slots)


if __name__ == "__main__":
    unittest.main()

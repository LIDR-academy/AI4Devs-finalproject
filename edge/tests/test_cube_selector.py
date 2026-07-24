from __future__ import annotations

import unittest

from src.models import CubeDetection, DetectionSnapshot
from src.vision.cube_selector import CubeSelector, CubeUnavailableError


def snapshot(*detections: CubeDetection) -> DetectionSnapshot:
    return DetectionSnapshot(
        run_id="run-001",
        source="file",
        truck_code="TRUCK-001",
        detections=tuple(detections),
        frame_source="fixture.png",
    )


class CubeSelectorTests(unittest.TestCase):
    def test_selects_valid_cube_deterministically(self) -> None:
        small = CubeDetection("red", 20, 20, 20, 20, 0.9)
        large = CubeDetection("blue", 10, 10, 40, 40, 0.9)

        selected = CubeSelector().select(snapshot(small, large))

        self.assertEqual(large, selected)

    def test_filters_invalid_size_and_unsupported_color(self) -> None:
        invalid_size = CubeDetection(
            "red",
            0,
            0,
            30,
            30,
            0.99,
            {"sizeValid": False},
        )
        unsupported = CubeDetection("purple", 0, 0, 30, 30, 1.0)
        valid = CubeDetection("green", 5, 5, 20, 20, 0.5)

        selected = CubeSelector().select(snapshot(invalid_size, unsupported, valid))

        self.assertEqual(valid, selected)

    def test_allowed_colors_are_respected(self) -> None:
        red = CubeDetection("red", 0, 0, 20, 20, 0.9)
        blue = CubeDetection("blue", 30, 0, 20, 20, 1.0)

        selected = CubeSelector().select(snapshot(red, blue), allowed_colors=("red",))

        self.assertEqual(red, selected)

    def test_snapshot_without_valid_cubes_returns_controlled_error(self) -> None:
        with self.assertRaises(CubeUnavailableError) as context:
            CubeSelector().select(snapshot())

        self.assertEqual("CUBE_UNAVAILABLE", context.exception.code)


if __name__ == "__main__":
    unittest.main()


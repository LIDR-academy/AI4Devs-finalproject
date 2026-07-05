from __future__ import annotations

import builtins
import unittest
from dataclasses import replace
from unittest.mock import patch

from src.config import (
    PickupRobotCalibration,
    RobotPlanningConfig,
    VisualPickupCalibration,
    WorkspaceLimits,
)
from src.models import (
    CubeDetection,
    DetectionSnapshot,
    DropZoneSelection,
    DropZoneSlot,
    EdgeRunProfile,
    ImagePoint,
    RegionOfInterest,
    RobotPose,
)
from src.robot.planner import RobotActionPlanner, RobotPlanningError


def planning_config() -> RobotPlanningConfig:
    return RobotPlanningConfig(
        enabled=True,
        safe_z=150,
        pick_z=100,
        drop_safe_z=150,
        lift_z_delta=50,
        ready_pose=RobotPose(0, 0, 220),
        reset_pose=RobotPose(0, 0, 190),
        calibration=PickupRobotCalibration(
            version="test-v1",
            image_roi=RegionOfInterest(0, 0, 100, 100),
            visual=None,
            top_left=RobotPose(-100, -100, 100),
            top_right=RobotPose(100, -100, 100),
            bottom_right=RobotPose(100, 100, 100),
            bottom_left=RobotPose(-100, 100, 100),
        ),
        workspace=WorkspaceLimits(-300, 300, -300, 300, 0, 300),
    )


def planner_inputs(color: str = "red"):
    cube = CubeDetection(color, 40, 40, 20, 20, 0.9, {"sizeValid": True})
    snapshot = DetectionSnapshot("run-1", "simulation", (cube,))
    slot = DropZoneSlot(
        code=f"DROP_{color.upper()}_01",
        color=color,
        position_order=1,
        pose=RobotPose(120, -80, 80),
        active=True,
        occupied=False,
    )
    return snapshot, cube, DropZoneSelection("run-1", slot)


class RobotActionPlannerTests(unittest.TestCase):
    def test_builds_safe_dry_run_plan(self) -> None:
        snapshot, cube, selection = planner_inputs("red")

        plan = RobotActionPlanner().plan(
            snapshot,
            cube,
            selection,
            planning_config(),
            EdgeRunProfile.VISION_DRY_RUN,
        )

        self.assertTrue(plan.dry_run)
        self.assertEqual("red", plan.selected_cube.color)
        self.assertEqual("DROP_RED_01", plan.drop_zone.slot.code)
        self.assertEqual(150, plan.safe_z)
        self.assertEqual(0, plan.pickup_target.x)
        self.assertEqual(0, plan.pickup_target.y)
        self.assertEqual("drop_zone_release", plan.steps[8].name)
        self.assertTrue(all(step.command_preview.startswith("POSE ") for step in plan.steps))
        self.assertFalse(plan.metadata["serialOpened"])
        self.assertFalse(plan.metadata["visualCalibrationUsed"])
        self.assertFalse(plan.metadata["homographyUsed"])

    def test_visual_calibration_maps_frame_pixels_to_pickup_cm_and_robot_pose(self) -> None:
        snapshot, cube, selection = planner_inputs("red")
        config = replace(
            planning_config(),
            calibration=PickupRobotCalibration(
                version="visual-v1",
                image_roi=RegionOfInterest(0, 0, 100, 100),
                visual=VisualPickupCalibration(
                    pickup_width_cm=13.5,
                    pickup_height_cm=7.0,
                    cube_size_cm=2.5,
                    top_left=ImagePoint(10, 20),
                    top_right=ImagePoint(110, 20),
                    bottom_right=ImagePoint(110, 120),
                    bottom_left=ImagePoint(10, 120),
                ),
                top_left=RobotPose(86, -157, 148),
                top_right=RobotPose(-34, -169, 148),
                bottom_right=RobotPose(-34, -239, 148),
                bottom_left=RobotPose(94, -233, 148),
            ),
        )

        plan = RobotActionPlanner().plan(
            snapshot,
            cube,
            selection,
            config,
            EdgeRunProfile.VISION_DRY_RUN,
        )

        self.assertEqual({"x": 5.4, "y": 2.1}, plan.pickup_position_cm.as_dict())
        self.assertAlmostEqual(39.44, plan.pickup_target.x, places=2)
        self.assertAlmostEqual(-183.88, plan.pickup_target.y, places=2)
        self.assertTrue(plan.metadata["visualCalibrationUsed"])
        self.assertTrue(plan.metadata["homographyUsed"])

    def test_visual_calibration_uses_corner_order_top_left_top_right_bottom_right_bottom_left(self) -> None:
        cube = CubeDetection("red", 30, 15, 20, 20, 0.9, {"sizeValid": True})
        snapshot = DetectionSnapshot("run-1", "simulation", (cube,))
        slot = DropZoneSlot(
            code="DROP_RED_01",
            color="red",
            position_order=1,
            pose=RobotPose(120, -80, 80),
            active=True,
            occupied=False,
        )
        selection = DropZoneSelection("run-1", slot)
        config = replace(
            planning_config(),
            calibration=PickupRobotCalibration(
                version="visual-skewed-v1",
                image_roi=None,
                visual=VisualPickupCalibration(
                    pickup_width_cm=10,
                    pickup_height_cm=5,
                    cube_size_cm=2.5,
                    top_left=ImagePoint(0, 0),
                    top_right=ImagePoint(100, 0),
                    bottom_right=ImagePoint(80, 50),
                    bottom_left=ImagePoint(0, 50),
                ),
                top_left=RobotPose(0, 0, 100),
                top_right=RobotPose(100, 0, 100),
                bottom_right=RobotPose(100, 50, 100),
                bottom_left=RobotPose(0, 50, 100),
            ),
        )

        plan = RobotActionPlanner().plan(
            snapshot,
            cube,
            selection,
            config,
            EdgeRunProfile.VISION_DRY_RUN,
        )

        self.assertEqual({"x": 4.444, "y": 2.222}, plan.pickup_position_cm.as_dict())
        self.assertAlmostEqual(44.44, plan.pickup_target.x, places=2)
        self.assertAlmostEqual(22.22, plan.pickup_target.y, places=2)

    def test_sequence_preserves_spike_order_with_documented_safe_extra_steps(self) -> None:
        snapshot, cube, selection = planner_inputs("red")

        plan = RobotActionPlanner().plan(
            snapshot,
            cube,
            selection,
            planning_config(),
            EdgeRunProfile.VISION_DRY_RUN,
        )

        step_names = [step.name for step in plan.steps]
        spike_order = [
            "ready_to_take",
            "reset",
            "cube_safe_pose",
            "cube_target_pick",
            "lift_after_pick",
            "reset_with_cube",
            "drop_zone_with_cube",
            "drop_zone_release",
            "reset_without_cube",
            "ready_to_take_end",
        ]
        self.assertEqual(
            [
                "ready_to_take",
                "reset",
                "cube_safe_pose",
                "cube_target_pick",
                "lift_after_pick",
                "reset_with_cube",
                "drop_safe_pose",
                "drop_zone_with_cube",
                "drop_zone_release",
                "retract_after_release",
                "reset_without_cube",
                "ready_to_take_end",
            ],
            step_names,
        )
        self.assertEqual(spike_order, [name for name in step_names if name not in {"drop_safe_pose", "retract_after_release"}])

    def test_blue_plan_uses_blue_slot(self) -> None:
        snapshot, cube, selection = planner_inputs("blue")

        plan = RobotActionPlanner().plan(
            snapshot,
            cube,
            selection,
            planning_config(),
            EdgeRunProfile.SIMULATION,
        )

        self.assertEqual("blue", plan.selected_cube.color)
        self.assertEqual("DROP_BLUE_01", plan.drop_zone.slot.code)

    def test_missing_calibration_fails_closed(self) -> None:
        snapshot, cube, selection = planner_inputs()
        config = replace(planning_config(), calibration=None)

        with self.assertRaises(RobotPlanningError) as context:
            RobotActionPlanner().plan(
                snapshot,
                cube,
                selection,
                config,
                EdgeRunProfile.VISION_DRY_RUN,
            )

        self.assertEqual("MISSING_CALIBRATION", context.exception.code)

    def test_hardware_profile_and_color_mismatch_fail_closed(self) -> None:
        snapshot, cube, selection = planner_inputs()
        with self.assertRaises(RobotPlanningError) as hardware_context:
            RobotActionPlanner().plan(
                snapshot,
                cube,
                selection,
                planning_config(),
                EdgeRunProfile.HARDWARE,
            )
        self.assertEqual("UNSAFE_PROFILE", hardware_context.exception.code)

        mismatched = replace(selection, slot=replace(selection.slot, color="blue"))
        with self.assertRaises(RobotPlanningError) as color_context:
            RobotActionPlanner().plan(
                snapshot,
                cube,
                mismatched,
                planning_config(),
                EdgeRunProfile.VISION_DRY_RUN,
            )
        self.assertEqual("COLOR_MISMATCH", color_context.exception.code)

    def test_planner_never_imports_serial(self) -> None:
        snapshot, cube, selection = planner_inputs()
        original_import = builtins.__import__

        def guarded_import(name, *args, **kwargs):
            if name == "serial" or name.startswith("serial."):
                raise AssertionError("serial import is forbidden in planner")
            return original_import(name, *args, **kwargs)

        with patch("builtins.__import__", side_effect=guarded_import):
            RobotActionPlanner().plan(
                snapshot,
                cube,
                selection,
                planning_config(),
                EdgeRunProfile.VISION_DRY_RUN,
            )


if __name__ == "__main__":
    unittest.main()

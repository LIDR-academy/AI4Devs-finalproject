from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from src.config import EdgeConfigError, load_edge_config
from src.models import EdgeRunProfile
from tests.helpers import write_json


class EdgeConfigTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.path = Path(self.temporary_directory.name) / "edge.json"

    def test_missing_profile_defaults_to_safe_simulation(self) -> None:
        write_json(self.path, {"truckCode": "TRUCK-001"})

        config = load_edge_config(self.path)

        self.assertIs(EdgeRunProfile.SIMULATION, config.profile)
        self.assertTrue(config.safety.dry_run)
        self.assertFalse(config.safety.enable_hardware_motion)
        self.assertTrue(config.safety.human_confirmation_required)

    def test_accepts_all_explicit_profiles(self) -> None:
        for profile in EdgeRunProfile:
            with self.subTest(profile=profile.value):
                write_json(self.path, {"profile": profile.value})
                self.assertIs(profile, load_edge_config(self.path).profile)

    def test_rejects_unknown_profile(self) -> None:
        write_json(self.path, {"profile": "unsafe-auto"})

        with self.assertRaises(EdgeConfigError):
            load_edge_config(self.path)

    def test_supports_legacy_mode_simulation(self) -> None:
        write_json(self.path, {"mode": "simulation"})

        self.assertIs(EdgeRunProfile.SIMULATION, load_edge_config(self.path).profile)

    def test_parses_vision_file_and_independent_rois(self) -> None:
        write_json(
            self.path,
            {
                "profile": "vision-dry-run",
                "vision": {
                    "source": "file",
                    "imagePath": "fixtures/scene.png",
                    "qrRoi": {"x": 10, "y": 20, "w": 30, "h": 40},
                    "cargoRoi": {"x": 50, "y": 60, "w": 70, "h": 80},
                },
            },
        )

        config = load_edge_config(self.path)

        self.assertEqual(self.path.parent / "fixtures/scene.png", config.vision.image_path)
        self.assertEqual(10, config.vision.qr_roi.x)
        self.assertEqual(50, config.vision.cargo_roi.x)

    def test_parses_detection_geometry_filters(self) -> None:
        write_json(
            self.path,
            {
                "profile": "vision-dry-run",
                "vision": {
                    "detection": {
                        "minArea": 1200,
                        "maxArea": 14000,
                        "minWidth": 25,
                        "maxWidth": 105,
                        "minHeight": 25,
                        "maxHeight": 105,
                        "minFillRatio": 0.45,
                        "minAspectRatio": 0.55,
                        "maxAspectRatio": 1.8,
                        "overlapThreshold": 0.35,
                        "sizeValid": True,
                        "morphologyKernelSize": 5,
                    },
                },
            },
        )

        config = load_edge_config(self.path)

        self.assertEqual(25, config.vision.min_width)
        self.assertEqual(105, config.vision.max_width)
        self.assertEqual(25, config.vision.min_height)
        self.assertEqual(105, config.vision.max_height)
        self.assertEqual(0.55, config.vision.min_aspect_ratio)
        self.assertEqual(1.8, config.vision.max_aspect_ratio)
        self.assertEqual(0.35, config.vision.overlap_threshold)
        self.assertTrue(config.vision.size_valid)
        self.assertEqual(5, config.vision.morphology_kernel_size)

    def test_rejects_invalid_detection_geometry_filters(self) -> None:
        write_json(
            self.path,
            {
                "profile": "vision-dry-run",
                "vision": {
                    "detection": {
                        "minWidth": 80,
                        "maxWidth": 20,
                    },
                },
            },
        )

        with self.assertRaisesRegex(EdgeConfigError, "minWidth"):
            load_edge_config(self.path)

    def test_rejects_invalid_roi_before_capture(self) -> None:
        write_json(
            self.path,
            {
                "profile": "vision-dry-run",
                "vision": {
                    "source": "file",
                    "imagePath": "fixture.png",
                    "qrRoi": {"x": -1, "y": 0, "w": 10, "h": 10},
                },
            },
        )

        with self.assertRaises(EdgeConfigError):
            load_edge_config(self.path)

    def test_camera_source_requires_explicit_camera_index(self) -> None:
        write_json(
            self.path,
            {
                "profile": "vision-dry-run",
                "vision": {"source": "camera"},
            },
        )

        with self.assertRaisesRegex(EdgeConfigError, "cameraIndex is required"):
            load_edge_config(self.path)

    def test_loads_ready_and_reset_poses_from_named_poses_config(self) -> None:
        named_poses_path = self.path.parent / "arm_named_poses.json"
        write_json(
            named_poses_path,
            {
                "reset": {"x": 0, "y": -79, "z": 176},
                "ready_to_take": {"x": 124, "y": -83, "z": 212},
            },
        )
        write_json(
            self.path,
            {
                "profile": "vision-dry-run",
                "robotPlanning": {
                    "enabled": True,
                    "safeZ": 150,
                    "pickZ": 138,
                    "dropSafeZ": 150,
                    "liftZDelta": 50,
                    "namedPosesPath": "arm_named_poses.json",
                    "readyPoseName": "ready_to_take",
                    "resetPoseName": "reset",
                    "calibration": {
                        "version": "pickup-robot-local-2026-07-04",
                        "imageRoi": {"x": 8, "y": 135, "w": 345, "h": 210},
                        "robotCorners": {
                            "topLeft": {"x": 86, "y": -157, "z": 148},
                            "topRight": {"x": -34, "y": -169, "z": 148},
                            "bottomRight": {"x": -34, "y": -239, "z": 148},
                            "bottomLeft": {"x": 94, "y": -233, "z": 148},
                        },
                    },
                    "workspace": {
                        "minX": -300,
                        "maxX": 300,
                        "minY": -300,
                        "maxY": 300,
                        "minZ": 0,
                        "maxZ": 300,
                    },
                },
            },
        )

        config = load_edge_config(self.path)

        self.assertEqual(124, config.robot_planning.ready_pose.x)
        self.assertEqual(-83, config.robot_planning.ready_pose.y)
        self.assertEqual(212, config.robot_planning.ready_pose.z)
        self.assertEqual(0, config.robot_planning.reset_pose.x)
        self.assertEqual(-79, config.robot_planning.reset_pose.y)
        self.assertEqual(176, config.robot_planning.reset_pose.z)

    def test_parses_visual_pickup_calibration_corners_px(self) -> None:
        write_json(
            self.path,
            {
                "profile": "vision-dry-run",
                "robotPlanning": {
                    "enabled": True,
                    "safeZ": 150,
                    "pickZ": 138,
                    "dropSafeZ": 150,
                    "liftZDelta": 50,
                    "readyPose": {"x": 124, "y": -83, "z": 212},
                    "resetPose": {"x": 0, "y": -79, "z": 176},
                    "calibration": {
                        "version": "pickup-visual-local-2026-07-05",
                        "visualCalibration": {
                            "pickupWidthCm": 13.5,
                            "pickupHeightCm": 7,
                            "cubeSizeCm": 2.5,
                            "cornersPx": {
                                "topLeft": [8, 135],
                                "topRight": [353, 138],
                                "bottomRight": [353, 339],
                                "bottomLeft": [13, 345],
                            },
                        },
                        "robotCorners": {
                            "topLeft": {"x": 86, "y": -157, "z": 148},
                            "topRight": {"x": -34, "y": -169, "z": 148},
                            "bottomRight": {"x": -34, "y": -239, "z": 148},
                            "bottomLeft": {"x": 94, "y": -233, "z": 148},
                        },
                    },
                    "workspace": {
                        "minX": -300,
                        "maxX": 300,
                        "minY": -300,
                        "maxY": 300,
                        "minZ": 0,
                        "maxZ": 300,
                    },
                },
            },
        )

        config = load_edge_config(self.path)

        visual = config.robot_planning.calibration.visual
        self.assertEqual(13.5, visual.pickup_width_cm)
        self.assertEqual(7, visual.pickup_height_cm)
        self.assertEqual(2.5, visual.cube_size_cm)
        self.assertEqual(8, visual.top_left.x)
        self.assertEqual(345, visual.bottom_left.y)

    def test_parses_movement_timing_with_safe_defaults(self) -> None:
        write_json(self.path, {"truckCode": "TRUCK-001"})

        config = load_edge_config(self.path)

        self.assertEqual(0.0, config.movement.delay_seconds)
        self.assertEqual(0.0, config.movement.pickup_hold_seconds)
        self.assertEqual(0.0, config.movement.release_hold_seconds)

        write_json(
            self.path,
            {
                "movement": {
                    "delay_seconds": 0.8,
                    "pickup_hold_seconds": 1.2,
                    "release_hold_seconds": 0.5,
                },
            },
        )

        config = load_edge_config(self.path)

        self.assertEqual(0.8, config.movement.delay_seconds)
        self.assertEqual(1.2, config.movement.pickup_hold_seconds)
        self.assertEqual(0.5, config.movement.release_hold_seconds)

    def test_pickup_and_release_hold_default_to_movement_delay(self) -> None:
        write_json(self.path, {"movement": {"delay_seconds": 0.8}})

        config = load_edge_config(self.path)

        self.assertEqual(0.8, config.movement.delay_seconds)
        self.assertEqual(0.8, config.movement.pickup_hold_seconds)
        self.assertEqual(0.8, config.movement.release_hold_seconds)

    def test_parses_robot_planning_pickup_offset_with_zero_default(self) -> None:
        write_json(
            self.path,
            {
                "profile": "vision-dry-run",
                "robotPlanning": {
                    "enabled": True,
                    "safeZ": 150,
                    "pickZ": 138,
                    "dropSafeZ": 150,
                    "liftZDelta": 50,
                    "pickupOffset": {"x": 5, "y": -1, "z": 2},
                    "readyPose": {"x": 124, "y": -83, "z": 212},
                    "resetPose": {"x": 0, "y": -79, "z": 176},
                    "calibration": {
                        "version": "pickup-visual-local-2026-07-05",
                        "imageRoi": {"x": 8, "y": 135, "w": 345, "h": 210},
                        "robotCorners": {
                            "topLeft": {"x": 86, "y": -157, "z": 148},
                            "topRight": {"x": -34, "y": -169, "z": 148},
                            "bottomRight": {"x": -34, "y": -239, "z": 148},
                            "bottomLeft": {"x": 94, "y": -233, "z": 148},
                        },
                    },
                    "workspace": {
                        "minX": -300,
                        "maxX": 300,
                        "minY": -300,
                        "maxY": 300,
                        "minZ": 0,
                        "maxZ": 300,
                    },
                },
            },
        )

        config = load_edge_config(self.path)

        self.assertEqual(5, config.robot_planning.pickup_offset.x)
        self.assertEqual(-1, config.robot_planning.pickup_offset.y)
        self.assertEqual(2, config.robot_planning.pickup_offset.z)


if __name__ == "__main__":
    unittest.main()

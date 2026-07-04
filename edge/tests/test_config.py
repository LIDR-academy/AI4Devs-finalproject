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


if __name__ == "__main__":
    unittest.main()

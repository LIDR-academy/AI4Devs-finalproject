from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

import cv2
import numpy as np

from src.edge_dry_run import DryRunEvidenceWriter, run_integrated_dry_run
from src.models import CubeDetection, DetectionSnapshot, EdgeRunProfile
from src.robot.drop_zone_adapter import DropZoneAdapter
from src.robot.drop_zone_planner import DropZoneUnavailableError
from src.robot.planner import RobotPlanningError
from src.vision.cube_selector import CubeUnavailableError
from tests.helpers import valid_drop_zones, write_json


def enabled_planning_payload() -> dict[str, object]:
    return {
        "enabled": True,
        "safeZ": 150,
        "pickZ": 100,
        "dropSafeZ": 150,
        "liftZDelta": 50,
        "readyPose": {"x": 0, "y": 0, "z": 220},
        "resetPose": {"x": 0, "y": 0, "z": 190},
        "calibration": {
            "version": "test-v1",
            "imageRoi": {"x": 0, "y": 0, "w": 200, "h": 200},
            "robotCorners": {
                "topLeft": {"x": -100, "y": -100, "z": 100},
                "topRight": {"x": 100, "y": -100, "z": 100},
                "bottomRight": {"x": 100, "y": 100, "z": 100},
                "bottomLeft": {"x": -100, "y": 100, "z": 100},
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
    }


class EdgeDryRunTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.directory = Path(self.temporary_directory.name)
        self.drop_zones_path = self.directory / "drop-zones.json"
        write_json(self.drop_zones_path, valid_drop_zones())
        self.config_path = self.directory / "edge.json"

    def write_config(self, color: str, profile: str = "simulation") -> None:
        write_json(
            self.config_path,
            {
                "profile": profile,
                "dropZones": {"path": "drop-zones.json"},
                "safety": {
                    "dryRun": True,
                    "enableHardwareMotion": False,
                    "humanConfirmationRequired": True,
                },
                "robotPlanning": enabled_planning_payload(),
                "vision": {
                    "source": "simulation",
                    "evidence": {"directory": "evidence"},
                    "cubes": [
                        {
                            "color": color,
                            "x": 80,
                            "y": 80,
                            "w": 20,
                            "h": 20,
                            "confidence": 0.9,
                        }
                    ],
                },
            },
        )

    def test_successful_red_dry_run_writes_evidence_without_persisting_state(self) -> None:
        self.write_config("red")
        before = self.drop_zones_path.read_bytes()

        with patch("src.vision.capture.cv2.VideoCapture") as video_capture:
            result = run_integrated_dry_run(self.config_path)

        video_capture.assert_not_called()
        self.assertEqual("red", result["selectedCube"]["color"])
        self.assertEqual("DROP_RED_01", result["dropZone"]["code"])
        self.assertFalse(result["dropZone"]["occupied"])
        self.assertEqual("CANCELLED_AFTER_DRY_RUN", result["reservationOutcome"])
        self.assertFalse(result["resultExpected"]["serialOpened"])
        self.assertEqual(before, self.drop_zones_path.read_bytes())
        self.assertTrue((self.directory / "evidence" / result["evidence"]["json"]).exists())

    def test_successful_blue_vision_dry_run(self) -> None:
        self.write_config("blue", profile="vision-dry-run")

        result = run_integrated_dry_run(self.config_path)

        self.assertEqual("blue", result["robotActionPlan"]["color"])
        self.assertEqual("DROP_BLUE_01", result["robotActionPlan"]["dropZoneCode"])
        self.assertEqual("vision-dry-run", result["robotActionPlan"]["profile"])

    def test_integrated_dry_run_processes_image_without_camera(self) -> None:
        image_path = self.directory / "fixture.png"
        frame = np.zeros((200, 200, 3), dtype=np.uint8)
        frame[80:120, 80:120] = (0, 0, 255)
        cv2.imwrite(str(image_path), frame)
        write_json(
            self.config_path,
            {
                "profile": "vision-dry-run",
                "dropZones": {"path": "drop-zones.json"},
                "safety": {
                    "dryRun": True,
                    "enableHardwareMotion": False,
                },
                "robotPlanning": enabled_planning_payload(),
                "vision": {
                    "source": "file",
                    "imagePath": "fixture.png",
                    "detection": {
                        "minArea": 100,
                        "maxArea": 10000,
                        "minFillRatio": 0.5,
                    },
                    "evidence": {"directory": "evidence"},
                },
            },
        )

        with patch("src.vision.capture.cv2.VideoCapture") as video_capture:
            result = run_integrated_dry_run(self.config_path)

        video_capture.assert_not_called()
        self.assertEqual("file", result["snapshot"]["source"])
        self.assertEqual("red", result["selectedCube"]["color"])

    def test_full_zone_returns_zone_unavailable(self) -> None:
        payload = valid_drop_zones()
        for slot in payload["red"]:
            slot["occupied"] = True
        write_json(self.drop_zones_path, payload)
        self.write_config("red")

        with self.assertRaises(DropZoneUnavailableError) as context:
            run_integrated_dry_run(self.config_path)

        self.assertEqual("ZONE_UNAVAILABLE", context.exception.code)

    def test_unsupported_or_missing_cube_fails_safe(self) -> None:
        self.write_config("purple")
        with self.assertRaises(CubeUnavailableError):
            run_integrated_dry_run(self.config_path)

        self.write_config("red")
        snapshot = DetectionSnapshot("empty-run", "simulation", ())
        with self.assertRaises(CubeUnavailableError):
            run_integrated_dry_run(self.config_path, snapshot=snapshot)

    def test_planner_error_releases_reservation(self) -> None:
        self.write_config("red")
        snapshot = DetectionSnapshot(
            "run-error",
            "simulation",
            (CubeDetection("red", 80, 80, 20, 20, 0.9),),
        )
        adapter = DropZoneAdapter(
            self.drop_zones_path,
            EdgeRunProfile.SIMULATION,
        )

        with patch(
            "src.edge_dry_run.RobotActionPlanner.plan",
            side_effect=RobotPlanningError("MISSING_CALIBRATION", "forced"),
        ):
            with self.assertRaises(RobotPlanningError):
                run_integrated_dry_run(
                    self.config_path,
                    snapshot=snapshot,
                    adapter=adapter,
                    evidence_writer=DryRunEvidenceWriter(self.directory / "evidence"),
                )

        next_selection = adapter.reserve("red", "run-after-error")
        self.assertEqual("DROP_RED_01", next_selection.slot.code)

    def test_dry_run_never_confirms_occupied(self) -> None:
        self.write_config("red")
        adapter = DropZoneAdapter(self.drop_zones_path, EdgeRunProfile.SIMULATION)
        adapter.confirm = Mock(side_effect=AssertionError("confirm must not be called by dry-run"))

        run_integrated_dry_run(
            self.config_path,
            adapter=adapter,
            evidence_writer=DryRunEvidenceWriter(self.directory / "evidence"),
        )

        adapter.confirm.assert_not_called()
        self.assertTrue(all(not slot.occupied for slot in adapter.slots))


if __name__ == "__main__":
    unittest.main()

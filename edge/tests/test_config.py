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


if __name__ == "__main__":
    unittest.main()


from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from src.edge_runner import run_edge_flow
from tests.helpers import write_json


class EdgeRunnerSafetyTests(unittest.TestCase):
    def test_non_simulation_profile_aborts_before_backend_effects(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "edge.json"
            write_json(path, {"profile": "hardware"})

            with patch("src.edge_runner.BackendClient") as client_class:
                with self.assertRaisesRegex(ValueError, "not executable"):
                    run_edge_flow("http://localhost:3000", path)

            client_class.assert_not_called()

    def test_simulation_flow_keeps_contract_and_summary(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "edge.json"
            write_json(
                path,
                {
                    "profile": "simulation",
                    "truckCode": "TRUCK-001",
                    "vision": {
                        "source": "simulation",
                        "cubes": [
                            {"color": "red", "x": 1, "y": 2, "w": 3, "h": 4, "confidence": 0.9}
                        ],
                    },
                    "robot": {"color": "red"},
                },
            )
            client = Mock()
            client.health.return_value = {"status": "ok"}
            client.create_session.return_value = {
                "session": {"id": "session-id", "code": "UNLOAD-001"}
            }
            client.register_cubes.return_value = {"session": {"id": "session-id"}}
            client.register_robot_action.return_value = {
                "action": {"code": "ACTION-001", "mode": "simulation"}
            }
            client.get_operational_dashboard.return_value = {
                "counts": {"red": 1, "blue": 0, "green": 0, "yellow": 0, "total": 1}
            }

            with patch("src.edge_runner.BackendClient", return_value=client):
                summary = run_edge_flow("http://localhost:3000", path)

            self.assertEqual("simulation", summary["profile"])
            self.assertEqual("session-id", summary["sessionId"])
            self.assertEqual(1, summary["cubesSent"])
            robot_payload = client.register_robot_action.call_args.args[0]
            self.assertEqual("simulation", robot_payload["mode"])
            self.assertTrue(robot_payload["metadata"]["dryRun"])


if __name__ == "__main__":
    unittest.main()


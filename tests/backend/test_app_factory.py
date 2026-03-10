"""Unit tests for Flask app factory behavior."""

import unittest
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from core import create_app


class TestAppFactory(unittest.TestCase):
    """Validate app creation and route registration."""

    def setUp(self) -> None:
        self.app = create_app("config.testing.TestingConfig")
        self.client = self.app.test_client()

    def test_factory_creates_testing_app(self) -> None:
        """Factory should load the requested testing configuration."""
        self.assertTrue(self.app.config["TESTING"])
        self.assertEqual(self.app.config["APP_ENV"], "testing")

    def test_users_blueprint_route_exists(self) -> None:
        """Users blueprint endpoint should be registered and reachable."""
        response = self.client.get("/api/v1/users/status")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"status": "active"})

    def test_files_blueprint_route_exists(self) -> None:
        """Files blueprint endpoint should be registered and reachable."""
        response = self.client.get("/api/v1/files/retrieve/example-cid")
        # Route exists and is protected by API key auth.
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()

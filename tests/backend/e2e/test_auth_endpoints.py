"""E2E tests for authentication endpoints using real external configuration."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
import sys

from sqlmodel import SQLModel

from tests.backend.e2e.conftest import e2e_ready

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine


class TestAuthEndpointsE2E(unittest.TestCase):
    """Exercise auth routes in an e2e profile."""

    @classmethod
    def setUpClass(cls) -> None:
        ready, missing = e2e_ready()
        if not ready:
            raise unittest.SkipTest(f"e2e disabled or missing env: {', '.join(missing)}")

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "e2e_auth.db"

        class E2EAuthConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(E2EAuthConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_register_and_status_flow(self) -> None:
        """Registration and status check should work end-to-end."""
        register = self.client.post(
            "/api/v1/users/register",
            json={"email": "e2e.auth@example.com", "password": "StrongPassword123!"},
            environ_overrides={"REMOTE_ADDR": "198.51.100.10"},
        )
        self.assertEqual(register.status_code, 201)

        api_key = register.get_json()["data"]["api_key"]
        status = self.client.post("/api/v1/users/status", headers={"X-API-Key": api_key})
        self.assertEqual(status.status_code, 200)
        self.assertEqual(status.get_json()["data"]["api_key_status"], "active")

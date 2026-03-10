"""E2E tests for admin-only endpoints."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
import sys

from sqlmodel import SQLModel, Session, select

from tests.backend.e2e.conftest import e2e_ready

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.users.models import User


class TestAdminEndpointsE2E(unittest.TestCase):
    """Exercise admin status and audit routes in e2e profile."""

    @classmethod
    def setUpClass(cls) -> None:
        ready, missing = e2e_ready()
        if not ready:
            raise unittest.SkipTest(f"e2e disabled or missing env: {', '.join(missing)}")

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "e2e_admin.db"

        class E2EAdminConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(E2EAdminConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        with Session(get_engine()) as session:
            admin = User(
                email="e2e.admin@example.com",
                password_hash="hashed",
                api_key="ipfs_gw_e2e_admin_key",
                is_active=True,
                is_admin=True,
            )
            regular = User(
                email="e2e.regular@example.com",
                password_hash="hashed",
                api_key="ipfs_gw_e2e_regular_key",
                is_active=True,
                is_admin=False,
            )
            session.add(admin)
            session.add(regular)
            session.commit()

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_admin_endpoint_requires_admin_key(self) -> None:
        """Admin status route should reject non-admin keys."""
        denied = self.client.get(
            "/api/v1/users/admin",
            headers={"X-API-Key": "ipfs_gw_e2e_regular_key"},
        )
        self.assertEqual(denied.status_code, 403)

        allowed = self.client.get(
            "/api/v1/users/admin",
            headers={"X-API-Key": "ipfs_gw_e2e_admin_key"},
        )
        self.assertEqual(allowed.status_code, 200)

    def test_admin_audit_logs_returns_payload(self) -> None:
        """Audit logs endpoint should respond with pagination metadata."""
        response = self.client.get(
            "/api/v1/users/admin/audit-logs?page=1&per_page=10",
            headers={"X-API-Key": "ipfs_gw_e2e_admin_key"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("pagination", response.get_json()["data"])

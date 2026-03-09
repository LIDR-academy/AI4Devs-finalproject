"""Integration tests for user registration and authentication bootstrap endpoints."""

import tempfile
import unittest
from pathlib import Path
import sys

from sqlmodel import SQLModel, Session, select

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.common.models import AuditLog
from core.users.models import User


class TestUserRegistration(unittest.TestCase):
    """Validate registration endpoint behavior and side effects."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "us003_test.db"

        class RegistrationTestConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(RegistrationTestConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_register_success_returns_api_key(self) -> None:
        """Registration should create user and return success payload with API key."""
        response = self.client.post(
            "/api/v1/users/register",
            json={"email": "new.user@example.com", "password": "StrongPassword123!"},
            environ_overrides={"REMOTE_ADDR": "203.0.113.1"},
        )

        self.assertEqual(response.status_code, 201)
        payload = response.get_json()
        self.assertEqual(payload["message"], "Registration successful")
        self.assertEqual(payload["data"]["email"], "new.user@example.com")
        self.assertTrue(payload["data"]["api_key"].startswith("ipfs_gw_"))

    def test_register_creates_audit_log_entry(self) -> None:
        """Registration flow should persist one audit event for the created account."""
        response = self.client.post(
            "/api/v1/users/register",
            json={"email": "audit@example.com", "password": "StrongPassword123!"},
            environ_overrides={"REMOTE_ADDR": "203.0.113.2"},
        )
        self.assertEqual(response.status_code, 201)

        with Session(get_engine()) as session:
            user = session.exec(select(User).where(User.email == "audit@example.com")).first()
            self.assertIsNotNone(user)
            logs = session.exec(select(AuditLog).where(AuditLog.user_id == user.id)).all()
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs[0].action, "user_registered")

    def test_register_duplicate_email_returns_422(self) -> None:
        """Registering with an existing email should fail with 422."""
        first = self.client.post(
            "/api/v1/users/register",
            json={"email": "duplicate@example.com", "password": "StrongPassword123!"},
            environ_overrides={"REMOTE_ADDR": "203.0.113.3"},
        )
        self.assertEqual(first.status_code, 201)

        second = self.client.post(
            "/api/v1/users/register",
            json={"email": "duplicate@example.com", "password": "StrongPassword123!"},
            environ_overrides={"REMOTE_ADDR": "203.0.113.4"},
        )
        self.assertEqual(second.status_code, 422)
        self.assertEqual(second.get_json()["message"], "Email already registered")

    def test_register_invalid_email_returns_422(self) -> None:
        """Invalid email payload should trigger validation error response."""
        response = self.client.post(
            "/api/v1/users/register",
            json={"email": "not-an-email", "password": "StrongPassword123!"},
            environ_overrides={"REMOTE_ADDR": "203.0.113.5"},
        )
        self.assertEqual(response.status_code, 422)

    def test_register_rate_limit_enforced(self) -> None:
        """Registration endpoint should enforce 5 requests per hour per IP."""
        for idx in range(5):
            response = self.client.post(
                "/api/v1/users/register",
                json={"email": f"rate{idx}@example.com", "password": "StrongPassword123!"},
                environ_overrides={"REMOTE_ADDR": "203.0.113.10"},
            )
            self.assertEqual(response.status_code, 201)

        limited = self.client.post(
            "/api/v1/users/register",
            json={"email": "rate-limit@example.com", "password": "StrongPassword123!"},
            environ_overrides={"REMOTE_ADDR": "203.0.113.10"},
        )
        self.assertEqual(limited.status_code, 429)


if __name__ == "__main__":
    unittest.main()

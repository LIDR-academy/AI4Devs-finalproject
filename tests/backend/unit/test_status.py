"""Integration tests for API key status endpoint."""

import tempfile
import unittest
from pathlib import Path
import sys

from sqlmodel import SQLModel, Session, select

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
	sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.users.models import User


class TestStatusEndpoint(unittest.TestCase):
	"""Test API key status check functionality."""

	def setUp(self) -> None:
		self.temp_dir = tempfile.TemporaryDirectory()
		db_path = Path(self.temp_dir.name) / "status_test.db"

		class StatusTestConfig(TestingConfig):
			DATABASE_URL = f"sqlite:///{db_path}"
			TESTING = True

		self.app = create_app(StatusTestConfig)
		self.client = self.app.test_client()
		SQLModel.metadata.create_all(get_engine())

		# Create test user
		with Session(get_engine()) as session:
			self.test_user = User(
				email="test@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_test_key_12345",
				is_active=True,
				usage_count=42,
			)
			session.add(self.test_user)
			session.commit()

	def tearDown(self) -> None:
		SQLModel.metadata.drop_all(get_engine())
		self.temp_dir.cleanup()

	def test_status_returns_active_for_valid_key(self) -> None:
		"""Valid API key should return active status with user data."""
		response = self.client.post(
			"/api/v1/users/status",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
		)

		self.assertEqual(response.status_code, 200)
		data = response.get_json()["data"]
		self.assertEqual(data["api_key_status"], "active")
		self.assertEqual(data["usage_count"], 42)
		self.assertIsNotNone(data["created_at"])

	def test_status_returns_401_for_invalid_key(self) -> None:
		"""Invalid API key should return 401."""
		response = self.client.post(
			"/api/v1/users/status",
			headers={"X-API-Key": "invalid_key"},
		)

		self.assertEqual(response.status_code, 401)

	def test_status_returns_401_for_missing_key(self) -> None:
		"""Missing API key header should return 401."""
		response = self.client.post("/api/v1/users/status")

		self.assertEqual(response.status_code, 401)

	def test_status_returns_revoked_for_deleted_user(self) -> None:
		"""Deleted user should show revoked status."""
		with Session(get_engine()) as session:
			user = session.exec(
				select(User).where(User.api_key == "ipfs_gw_test_key_12345")
			).first()
			user.is_deleted = True
			session.add(user)
			session.commit()

		response = self.client.post(
			"/api/v1/users/status",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
		)

		self.assertEqual(response.status_code, 200)
		data = response.get_json()["data"]
		self.assertEqual(data["api_key_status"], "revoked")

	def test_status_returns_inactive_for_inactive_user(self) -> None:
		"""Inactive user should show inactive status."""
		with Session(get_engine()) as session:
			user = session.exec(
				select(User).where(User.api_key == "ipfs_gw_test_key_12345")
			).first()
			user.is_active = False
			session.add(user)
			session.commit()

		response = self.client.post(
			"/api/v1/users/status",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
		)

		self.assertEqual(response.status_code, 200)
		data = response.get_json()["data"]
		self.assertEqual(data["api_key_status"], "inactive")


if __name__ == "__main__":
	unittest.main()

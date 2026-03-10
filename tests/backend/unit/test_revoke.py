"""Integration tests for API key revocation endpoint."""

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
from core.common.models import AuditLog
from core.users.models import User


class TestRevokeEndpoint(unittest.TestCase):
	"""Test admin API key revocation."""

	def setUp(self) -> None:
		self.temp_dir = tempfile.TemporaryDirectory()
		db_path = Path(self.temp_dir.name) / "revoke_test.db"

		class RevokeTestConfig(TestingConfig):
			DATABASE_URL = f"sqlite:///{db_path}"
			TESTING = True

		self.app = create_app(RevokeTestConfig)
		self.client = self.app.test_client()
		SQLModel.metadata.create_all(get_engine())

		# Create admin and regular users
		with Session(get_engine()) as session:
			self.admin_user = User(
				email="admin@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_admin_key_12345",
				is_active=True,
				is_admin=True,
			)
			self.regular_user = User(
				email="user@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_user_key_12345",
				is_active=True,
				is_admin=False,
			)
			session.add(self.admin_user)
			session.add(self.regular_user)
			session.commit()

	def tearDown(self) -> None:
		SQLModel.metadata.drop_all(get_engine())
		self.temp_dir.cleanup()

	def test_revoke_with_admin_key_succeeds(self) -> None:
		"""Admin can revoke user API keys."""
		response = self.client.post(
			"/api/v1/users/revoke",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={"user_email": "user@example.com"},
		)

		self.assertEqual(response.status_code, 200)
		
		# Verify user is marked as deleted
		with Session(get_engine()) as session:
			user = session.exec(select(User).where(User.email == "user@example.com")).first()
			self.assertTrue(user.is_deleted)
			self.assertFalse(user.is_active)

	def test_revoke_logs_audit_event(self) -> None:
		"""Revocation should create audit log entry."""
		self.client.post(
			"/api/v1/users/revoke",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={"user_email": "user@example.com"},
		)

		with Session(get_engine()) as session:
			user = session.exec(select(User).where(User.email == "user@example.com")).first()
			logs = session.exec(
				select(AuditLog).where(
					AuditLog.user_id == user.id,
					AuditLog.action == "api_key_revoked_by_admin",
				)
			).all()
			self.assertEqual(len(logs), 1)
			config_logs = session.exec(
				select(AuditLog).where(
					AuditLog.user_id == user.id,
					AuditLog.action == "audit_configuration_updated",
				)
			).all()
			self.assertEqual(len(config_logs), 1)

	def test_revoke_with_non_admin_key_returns_403(self) -> None:
		"""Non-admin users cannot revoke API keys."""
		response = self.client.post(
			"/api/v1/users/revoke",
			headers={"X-API-Key": "ipfs_gw_user_key_12345"},
			json={"user_email": "user@example.com"},
		)

		self.assertEqual(response.status_code, 403)

	def test_revoke_nonexistent_user_returns_404(self) -> None:
		"""Revoking nonexistent user should return 404."""
		response = self.client.post(
			"/api/v1/users/revoke",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={"user_email": "nonexistent@example.com"},
		)

		self.assertEqual(response.status_code, 404)

	def test_revoke_without_email_returns_422(self) -> None:
		"""Missing user_email should return 422."""
		response = self.client.post(
			"/api/v1/users/revoke",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={},
		)

		self.assertEqual(response.status_code, 422)

	def test_revoke_already_revoked_returns_200(self) -> None:
		"""Revoking already revoked key should return 200."""
		self.client.post(
			"/api/v1/users/revoke",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={"user_email": "user@example.com"},
		)
		
		response = self.client.post(
			"/api/v1/users/revoke",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={"user_email": "user@example.com"},
		)
		
		self.assertEqual(response.status_code, 200)
		self.assertIn("already revoked", response.get_json()["message"])


if __name__ == "__main__":
	unittest.main()

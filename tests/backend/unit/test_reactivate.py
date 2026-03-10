"""Integration tests for API key reactivation endpoint."""

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


class TestReactivateEndpoint(unittest.TestCase):
	"""Test admin API key reactivation."""

	def setUp(self) -> None:
		self.temp_dir = tempfile.TemporaryDirectory()
		db_path = Path(self.temp_dir.name) / "reactivate_test.db"

		class ReactivateTestConfig(TestingConfig):
			DATABASE_URL = f"sqlite:///{db_path}"
			TESTING = True

		self.app = create_app(ReactivateTestConfig)
		self.client = self.app.test_client()
		SQLModel.metadata.create_all(get_engine())

		# Create admin, regular, and revoked users
		with Session(get_engine()) as session:
			self.admin_user = User(
				email="admin@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_admin_key_12345",
				is_active=True,
				is_admin=True,
			)
			self.regular_user = User(
				email="regular@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_regular_key_12345",
				is_active=True,
				is_admin=False,
			)
			self.revoked_user = User(
				email="revoked@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_revoked_key_12345",
				is_active=False,
				is_admin=False,
				is_deleted=True,
			)
			session.add(self.admin_user)
			session.add(self.regular_user)
			session.add(self.revoked_user)
			session.commit()

	def tearDown(self) -> None:
		SQLModel.metadata.drop_all(get_engine())
		self.temp_dir.cleanup()

	def test_reactivate_with_admin_key_succeeds(self) -> None:
		"""Admin can reactivate revoked API keys."""
		response = self.client.post(
			"/api/v1/users/reactivate",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={"user_email": "revoked@example.com"},
		)

		self.assertEqual(response.status_code, 200)
		
		# Verify user is reactivated
		with Session(get_engine()) as session:
			user = session.exec(select(User).where(User.email == "revoked@example.com")).first()
			self.assertFalse(user.is_deleted)
			self.assertTrue(user.is_active)

	def test_reactivate_logs_audit_event(self) -> None:
		"""Reactivation should create audit log entry."""
		self.client.post(
			"/api/v1/users/reactivate",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={"user_email": "revoked@example.com"},
		)

		with Session(get_engine()) as session:
			user = session.exec(select(User).where(User.email == "revoked@example.com")).first()
			logs = session.exec(
				select(AuditLog).where(
					AuditLog.user_id == user.id,
					AuditLog.action == "api_key_reactivated_by_admin",
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

	def test_reactivate_with_non_admin_key_returns_403(self) -> None:
		"""Non-admin users cannot reactivate API keys."""
		response = self.client.post(
			"/api/v1/users/reactivate",
			headers={"X-API-Key": "ipfs_gw_regular_key_12345"},
			json={"user_email": "revoked@example.com"},
		)

		self.assertEqual(response.status_code, 403)

	def test_reactivate_active_user_returns_200(self) -> None:
		"""Reactivating active user returns success message."""
		response = self.client.post(
			"/api/v1/users/reactivate",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={"user_email": "admin@example.com"},
		)

		self.assertEqual(response.status_code, 200)
		self.assertIn("already active", response.get_json()["message"])

	def test_reactivate_nonexistent_user_returns_404(self) -> None:
		"""Reactivating nonexistent user should return 404."""
		response = self.client.post(
			"/api/v1/users/reactivate",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={"user_email": "nonexistent@example.com"},
		)

		self.assertEqual(response.status_code, 404)

	def test_reactivate_without_email_returns_422(self) -> None:
		"""Missing user_email should return 422."""
		response = self.client.post(
			"/api/v1/users/reactivate",
			headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
			json={},
		)

		self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
	unittest.main()

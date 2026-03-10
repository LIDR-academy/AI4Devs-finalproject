"""Integration tests for the admin audit-log endpoint."""

from datetime import datetime, timedelta
from pathlib import Path
import sys
import tempfile
import unittest

from sqlmodel import SQLModel, Session, select

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
	sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.common.models import AuditLog
from core.users.models import User


class TestAdminAuditLogsEndpoint(unittest.TestCase):
	"""Validate admin audit-log listing, filtering, and IP redaction behavior."""

	def setUp(self) -> None:
		self.temp_dir = tempfile.TemporaryDirectory()
		db_path = Path(self.temp_dir.name) / "audit_logs_test.db"

		class AuditLogsTestConfig(TestingConfig):
			DATABASE_URL = f"sqlite:///{db_path}"
			TESTING = True
			AUDIT_IP_RETENTION_DAYS = 30
			AUDIT_IP_REDACTION_MODE = "mask"

		self.app = create_app(AuditLogsTestConfig)
		self.client = self.app.test_client()
		engine = get_engine()
		self.assertIsNotNone(engine)
		SQLModel.metadata.create_all(engine)

		with Session(engine) as session:
			admin_user = User(
				email="admin@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_admin_audit_key",
				is_active=True,
				is_admin=True,
			)
			user_one = User(
				email="user.one@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_user_one_key",
				is_active=True,
			)
			user_two = User(
				email="user.two@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_user_two_key",
				is_active=True,
			)
			session.add(admin_user)
			session.add(user_one)
			session.add(user_two)
			session.commit()
			session.refresh(admin_user)
			session.refresh(user_one)
			session.refresh(user_two)
			self.admin_id = admin_user.id
			self.user_one_id = user_one.id
			self.user_two_id = user_two.id

	def tearDown(self) -> None:
		engine = get_engine()
		self.assertIsNotNone(engine)
		SQLModel.metadata.drop_all(engine)
		self.temp_dir.cleanup()

	def _create_audit_log(
		self,
		*,
		user_id: int,
		action: str,
		timestamp: datetime,
		ip_address: str,
		request_id: str,
		details: str = "{}",
	) -> AuditLog:
		engine = get_engine()
		self.assertIsNotNone(engine)
		with Session(engine) as session:
			log = AuditLog(
				user_id=user_id,
				action=action,
				timestamp=timestamp,
				details=details,
				ip_address=ip_address,
				user_agent="pytest",
				request_id=request_id,
			)
			session.add(log)
			session.commit()
			session.refresh(log)
			return log

	def test_admin_audit_logs_requires_admin(self) -> None:
		"""Non-admin users should not access the audit log listing."""
		response = self.client.get(
			"/api/v1/users/admin/audit-logs",
			headers={"X-API-Key": "ipfs_gw_user_one_key"},
		)
		self.assertEqual(response.status_code, 403)

	def test_admin_audit_logs_support_filters_and_pagination(self) -> None:
		"""Endpoint should filter by user/action and paginate results."""
		now = datetime.utcnow()
		self._create_audit_log(
			user_id=self.user_one_id,
			action="file_upload",
			timestamp=now - timedelta(hours=2),
			ip_address="203.0.113.10",
			request_id="req-user-one-upload",
			details='{"filename": "first.txt"}',
		)
		self._create_audit_log(
			user_id=self.user_one_id,
			action="file_pin",
			timestamp=now - timedelta(hours=1),
			ip_address="203.0.113.11",
			request_id="req-user-one-pin",
			details='{"cid": "bafy..."}',
		)
		self._create_audit_log(
			user_id=self.user_two_id,
			action="file_upload",
			timestamp=now,
			ip_address="198.51.100.20",
			request_id="req-user-two-upload",
		)

		response = self.client.get(
			f"/api/v1/users/admin/audit-logs?user_id={self.user_one_id}&action=file_upload&page=1&per_page=1",
			headers={"X-API-Key": "ipfs_gw_admin_audit_key"},
		)

		self.assertEqual(response.status_code, 200)
		payload = response.get_json()["data"]
		self.assertEqual(payload["pagination"]["total"], 1)
		self.assertEqual(payload["pagination"]["pages"], 1)
		self.assertEqual(len(payload["logs"]), 1)
		self.assertEqual(payload["logs"][0]["user_id"], self.user_one_id)
		self.assertEqual(payload["logs"][0]["action"], "file_upload")
		self.assertEqual(payload["logs"][0]["request_id"], "req-user-one-upload")

	def test_admin_audit_logs_mask_ip_by_default_and_allow_raw_opt_in(self) -> None:
		"""Endpoint should mask recent IPs by default and reveal them only when requested by an admin."""
		self._create_audit_log(
			user_id=self.user_one_id,
			action="user_registered",
			timestamp=datetime.utcnow(),
			ip_address="203.0.113.25",
			request_id="req-mask-check",
		)

		masked_response = self.client.get(
			"/api/v1/users/admin/audit-logs",
			headers={"X-API-Key": "ipfs_gw_admin_audit_key"},
		)
		masked_log = masked_response.get_json()["data"]["logs"][0]
		self.assertEqual(masked_log["details"]["ip_address"], "203.0.113.0/24")
		self.assertTrue(masked_log["details"]["ip_redacted"])

		raw_response = self.client.get(
			"/api/v1/users/admin/audit-logs?include_raw_ip=true",
			headers={"X-API-Key": "ipfs_gw_admin_audit_key"},
		)
		raw_log = raw_response.get_json()["data"]["logs"][0]
		self.assertEqual(raw_log["details"]["ip_address"], "203.0.113.25")
		self.assertFalse(raw_log["details"]["ip_redacted"])

	def test_admin_audit_logs_redact_expired_ip_and_record_redaction_event(self) -> None:
		"""Expired IP addresses should be redacted in storage before the admin response is returned."""
		original_log = self._create_audit_log(
			user_id=self.user_one_id,
			action="file_upload",
			timestamp=datetime.utcnow() - timedelta(days=45),
			ip_address="198.51.100.42",
			request_id="req-expired-ip",
		)

		response = self.client.get(
			"/api/v1/users/admin/audit-logs?action=file_upload&include_raw_ip=true",
			headers={"X-API-Key": "ipfs_gw_admin_audit_key"},
		)

		self.assertEqual(response.status_code, 200)
		payload = response.get_json()["data"]
		self.assertEqual(len(payload["logs"]), 1)
		self.assertEqual(payload["logs"][0]["details"]["ip_address"], "198.51.100.0/24")
		self.assertTrue(payload["logs"][0]["details"]["ip_redacted"])

		engine = get_engine()
		self.assertIsNotNone(engine)
		with Session(engine) as session:
			stored_log = session.get(AuditLog, original_log.id)
			self.assertTrue(stored_log.ip_redacted)
			self.assertEqual(stored_log.ip_address, "198.51.100.0/24")
			self.assertEqual(stored_log.ip_redaction_method, "mask_ipv4_last_octet")
			self.assertIsNotNone(stored_log.ip_redacted_at)

			redaction_events = session.exec(
				select(AuditLog).where(
					AuditLog.action == "ip_redaction_applied",
					AuditLog.resource_id == original_log.id,
				)
			).all()
			self.assertEqual(len(redaction_events), 1)


if __name__ == "__main__":
	unittest.main()
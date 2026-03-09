"""Integration tests for API key renewal endpoints."""

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
from core.users.models import User
from core.users.verification import (
	_test_get_verification_code, 
	_test_clear_all_codes
)


class TestRenewEndpoint(unittest.TestCase):
	"""Test API key renewal with step-up verification."""

	def setUp(self) -> None:
		self.temp_dir = tempfile.TemporaryDirectory()
		db_path = Path(self.temp_dir.name) / "renew_test.db"

		class RenewTestConfig(TestingConfig):
			DATABASE_URL = f"sqlite:///{db_path}"
			TESTING = True

		self.app = create_app(RenewTestConfig)
		self.client = self.app.test_client()
		SQLModel.metadata.create_all(get_engine())

		# Create test user
		with Session(get_engine()) as session:
			self.test_user = User(
				email="test@example.com",
				password_hash="hashed_password",
				api_key="ipfs_gw_test_key_12345",
				is_active=True,
			)
			session.add(self.test_user)
			session.commit()
			session.refresh(self.test_user)
			self.user_id = self.test_user.id

	def tearDown(self) -> None:
		_test_clear_all_codes(self.app)
		SQLModel.metadata.drop_all(get_engine())
		self.temp_dir.cleanup()

	def test_challenge_returns_202(self) -> None:
		"""Challenge endpoint should return 202 and generate code."""
		response = self.client.post(
			"/api/v1/users/renew/challenge",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
		)

		self.assertEqual(response.status_code, 202)
		self.assertIsNotNone(_test_get_verification_code(self.user_id, self.app))

	def test_challenge_requires_api_key(self) -> None:
		"""Challenge endpoint should require valid API key."""
		response = self.client.post("/api/v1/users/renew/challenge")

		self.assertEqual(response.status_code, 401)

	def test_renew_with_valid_code_returns_new_key(self) -> None:
		"""Valid verification code should generate new API key."""
		# Request challenge
		self.client.post(
			"/api/v1/users/renew/challenge",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
		)
		
		code = _test_get_verification_code(self.user_id, self.app)
		self.assertIsNotNone(code)
		
		# Renew with code
		response = self.client.post(
			"/api/v1/users/renew",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
			json={"verification_code": code},
		)

		self.assertEqual(response.status_code, 200)
		data = response.get_json()
		new_key = data["data"]["api_key"]
		self.assertTrue(new_key.startswith("ipfs_gw_"))
		self.assertNotEqual(new_key, "ipfs_gw_test_key_12345")

	def test_renew_with_invalid_code_returns_401(self) -> None:
		"""Invalid verification code should return 401."""
		response = self.client.post(
			"/api/v1/users/renew",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
			json={"verification_code": "000000"},
		)

		self.assertEqual(response.status_code, 401)

	def test_renew_without_code_returns_422(self) -> None:
		"""Missing verification code should return 422."""
		response = self.client.post(
			"/api/v1/users/renew",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
			json={},
		)

		self.assertEqual(response.status_code, 422)

	def test_renew_old_key_becomes_invalid(self) -> None:
		"""After renewal, old API key should not work."""
		# Request challenge
		self.client.post(
			"/api/v1/users/renew/challenge",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
		)
		
		code = _test_get_verification_code(self.user_id, self.app)
		self.assertIsNotNone(code)
		
		# Renew with code
		response = self.client.post(
			"/api/v1/users/renew",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
			json={"verification_code": code},
		)
		
		# Assert renewal succeeded before testing old key
		self.assertEqual(response.status_code, 200)
		data = response.get_json()
		self.assertIn("api_key", data.get("data", {}))
		
		# Try to use old key
		old_key_response = self.client.post(
			"/api/v1/users/renew/challenge",
			headers={"X-API-Key": "ipfs_gw_test_key_12345"},
		)
		
		self.assertEqual(old_key_response.status_code, 401)


if __name__ == "__main__":
	unittest.main()

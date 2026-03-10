"""Unit tests for user authentication decorators."""

import hmac
import tempfile
import unittest
from pathlib import Path
import sys
from unittest.mock import patch

from sqlmodel import SQLModel, Session

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
	sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.auth.decorators import require_api_key, require_admin, get_current_user
from core.common.exceptions import AuthenticationError, AuthorizationError
from core.users.models import User


class TestRequireApiKey(unittest.TestCase):
	"""Test cases for @require_api_key decorator."""
	
	def setUp(self):
		"""Set up test fixtures."""
		self.temp_dir = tempfile.TemporaryDirectory()
		db_path = Path(self.temp_dir.name) / "auth_decorators_test.db"
		
		class AuthDecoratorTestConfig(TestingConfig):
			DATABASE_URL = f"sqlite:///{db_path}"
			TESTING = True
		
		self.app = create_app(AuthDecoratorTestConfig)
		self.client = self.app.test_client()
		SQLModel.metadata.create_all(get_engine())
		
		# Create test users
		with Session(get_engine()) as session:
			# Active user
			self.active_user = User(
				email="active@test.com",
				password_hash="hashed",
				api_key="test-api-key-active",
				is_active=True,
				is_deleted=False
			)
			session.add(self.active_user)
			
			# Inactive user
			self.inactive_user = User(
				email="inactive@test.com",
				password_hash="hashed",
				api_key="test-api-key-inactive",
				is_active=False,
				is_deleted=False
			)
			session.add(self.inactive_user)
			
			# Deleted user
			self.deleted_user = User(
				email="deleted@test.com",
				password_hash="hashed",
				api_key="test-api-key-deleted",
				is_active=True,
				is_deleted=True
			)
			session.add(self.deleted_user)
			
			session.commit()
		
		# Register test route
		@self.app.route("/protected")
		@require_api_key
		def protected_route():
			return {"message": "success"}
		
		# Register error handlers
		@self.app.errorhandler(AuthenticationError)
		def handle_auth_error(error):
			return {"error": str(error)}, 401
	
	def tearDown(self):
		"""Clean up test database."""
		SQLModel.metadata.drop_all(get_engine())
		self.temp_dir.cleanup()
	
	def test_missing_api_key(self):
		"""Test request without X-API-Key header."""
		response = self.client.get("/protected")
		self.assertEqual(response.status_code, 401)
		self.assertIn("Missing X-API-Key header", response.json["error"])
	
	def test_invalid_api_key(self):
		"""Test request with non-existent API key."""
		response = self.client.get(
			"/protected",
			headers={"X-API-Key": "invalid-key"}
		)
		self.assertEqual(response.status_code, 401)
		self.assertIn("Invalid API key", response.json["error"])
	
	def test_valid_api_key(self):
		"""Test request with valid active API key."""
		response = self.client.get(
			"/protected",
			headers={"X-API-Key": "test-api-key-active"}
		)
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json["message"], "success")

	@patch("core.auth.decorators.hmac.compare_digest", wraps=hmac.compare_digest)
	def test_valid_api_key_uses_constant_time_compare(self, compare_digest_mock):
		"""Decorator should use constant-time comparison for API key validation."""
		response = self.client.get(
			"/protected",
			headers={"X-API-Key": "test-api-key-active"}
		)
		self.assertEqual(response.status_code, 200)
		compare_digest_mock.assert_called()
	
	def test_inactive_api_key(self):
		"""Test request with inactive user API key."""
		response = self.client.get(
			"/protected",
			headers={"X-API-Key": "test-api-key-inactive"}
		)
		self.assertEqual(response.status_code, 401)
		self.assertIn("API key is inactive", response.json["error"])
	
	def test_deleted_api_key(self):
		"""Test request with revoked (deleted) API key."""
		response = self.client.get(
			"/protected",
			headers={"X-API-Key": "test-api-key-deleted"}
		)
		self.assertEqual(response.status_code, 401)
		self.assertIn("API key has been revoked", response.json["error"])


class TestRequireAdmin(unittest.TestCase):
	"""Test cases for @require_admin decorator."""
	
	def setUp(self):
		"""Set up test fixtures."""
		self.temp_dir = tempfile.TemporaryDirectory()
		db_path = Path(self.temp_dir.name) / "auth_admin_test.db"
		
		class AuthAdminTestConfig(TestingConfig):
			DATABASE_URL = f"sqlite:///{db_path}"
			TESTING = True
		
		self.app = create_app(AuthAdminTestConfig)
		self.client = self.app.test_client()
		SQLModel.metadata.create_all(get_engine())
		
		# Create test users
		with Session(get_engine()) as session:
			# Admin user
			self.admin_user = User(
				email="admin@test.com",
				password_hash="hashed",
				api_key="test-api-key-admin",
				is_active=True,
				is_deleted=False,
				is_admin=True
			)
			session.add(self.admin_user)
			
			# Regular user
			self.regular_user = User(
				email="regular@test.com",
				password_hash="hashed",
				api_key="test-api-key-regular",
				is_active=True,
				is_deleted=False,
				is_admin=False
			)
			session.add(self.regular_user)
			
			session.commit()
		
		# Register test route
		@self.app.route("/admin-only")
		@require_admin
		def admin_only_route():
			return {"message": "admin access granted"}
		
		# Register error handlers
		@self.app.errorhandler(AuthenticationError)
		def handle_auth_error(error):
			return {"error": str(error)}, 401
		
		@self.app.errorhandler(AuthorizationError)
		def handle_authz_error(error):
			return {"error": str(error)}, 403
	
	def tearDown(self):
		"""Clean up test database."""
		SQLModel.metadata.drop_all(get_engine())
		self.temp_dir.cleanup()
	
	def test_missing_api_key(self):
		"""Test admin route without X-API-Key header."""
		response = self.client.get("/admin-only")
		self.assertEqual(response.status_code, 401)
		self.assertIn("Missing X-API-Key header", response.json["error"])
	
	def test_invalid_api_key(self):
		"""Test admin route with invalid API key."""
		response = self.client.get(
			"/admin-only",
			headers={"X-API-Key": "invalid-key"}
		)
		self.assertEqual(response.status_code, 401)
		self.assertIn("Invalid API key", response.json["error"])
	
	def test_regular_user_forbidden(self):
		"""Test admin route with non-admin API key."""
		response = self.client.get(
			"/admin-only",
			headers={"X-API-Key": "test-api-key-regular"}
		)
		self.assertEqual(response.status_code, 403)
		self.assertIn("Admin privileges required", response.json["error"])
	
	def test_admin_user_success(self):
		"""Test admin route with valid admin API key."""
		response = self.client.get(
			"/admin-only",
			headers={"X-API-Key": "test-api-key-admin"}
		)
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json["message"], "admin access granted")


class TestGetCurrentUser(unittest.TestCase):
	"""Test cases for get_current_user helper function."""
	
	def setUp(self):
		"""Set up test fixtures."""
		self.temp_dir = tempfile.TemporaryDirectory()
		db_path = Path(self.temp_dir.name) / "get_current_user_test.db"
		
		class GetCurrentUserTestConfig(TestingConfig):
			DATABASE_URL = f"sqlite:///{db_path}"
			TESTING = True
		
		self.app = create_app(GetCurrentUserTestConfig)
		self.client = self.app.test_client()
		SQLModel.metadata.create_all(get_engine())
		
		# Create test user
		with Session(get_engine()) as session:
			self.test_user = User(
				email="user@test.com",
				password_hash="hashed",
				api_key="test-api-key-user",
				is_active=True,
				is_deleted=False
			)
			session.add(self.test_user)
			session.commit()
			self.user_email = self.test_user.email
		
		# Register test route
		@self.app.route("/me")
		@require_api_key
		def get_me():
			user = get_current_user()
			return {"email": user.email}
		
		# Register error handlers
		@self.app.errorhandler(AuthenticationError)
		def handle_auth_error(error):
			return {"error": str(error)}, 401
	
	def tearDown(self):
		"""Clean up test database."""
		SQLModel.metadata.drop_all(get_engine())
		self.temp_dir.cleanup()
	
	def test_get_current_user_success(self):
		"""Test getting current user from valid API key."""
		response = self.client.get(
			"/me",
			headers={"X-API-Key": "test-api-key-user"}
		)
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json["email"], self.user_email)
	
	def test_get_current_user_no_key(self):
		"""Test get_current_user without API key."""
		with self.app.test_request_context("/me"):
			with self.assertRaises(AuthenticationError) as context:
				get_current_user()
			self.assertIn("Missing X-API-Key header", str(context.exception))


if __name__ == "__main__":
	unittest.main()

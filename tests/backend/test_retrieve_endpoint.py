"""Unit tests for file retrieval endpoint."""

import unittest
from datetime import datetime
from unittest.mock import MagicMock, Mock, patch

from flask import Flask

from core.files.models import File
from core.users.models import User


class TestRetrieveEndpoint(unittest.TestCase):
	"""Test cases for file retrieval HTTP endpoint."""
	
	def setUp(self):
		"""Set up test fixtures."""
		# Create Flask app with test config
		self.app = Flask(__name__)
		self.app.config["TESTING"] = True
		
		# Mock database and services
		self.mock_session = MagicMock()
		self.mock_user = User(
			id=1,
			username="testuser",
			email="test@example.com",
			api_key="test-api-key",
		)
		
		self.mock_file = File(
			id=10,
			filename="test.txt",
			cid="QmTest123",
			size=1024,
			user_id=1,
			storage_key="test-file.txt",
			mime_type="text/plain",
			retrieval_count=0,
			last_retrieved_at=None,
			created_at=datetime(2024, 1, 1, 12, 0, 0),
			deleted_at=None,
		)
		
		# Register routes
		from core.files.routes.retrieve import register_routes
		from flask import Blueprint
		
		test_bp = Blueprint("test_files", __name__, url_prefix="/api/v1/files")
		register_routes(test_bp)
		self.app.register_blueprint(test_bp)
		
		self.client = self.app.test_client()
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	@patch("core.files.routes.retrieve.ipfs_service")
	def test_retrieve_file_success(
		self, mock_ipfs, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test successful file retrieval."""
		# Arrange
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (True, self.mock_file, "Access granted")
		
		# Mock IPFS streaming
		test_content = [b"test ", b"file ", b"content"]
		mock_ipfs.retrieve_file_stream.return_value = iter(test_content)
		
		# Act
		response = self.client.get(
			"/api/v1/files/retrieve/QmTest123",
			headers={"X-API-Key": "test-api-key"},
		)
		
		# Assert
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data, b"test file content")
		self.assertEqual(response.content_type, "text/plain; charset=utf-8")
		
		# Verify ETag header
		self.assertEqual(response.headers["ETag"], '"QmTest123"')
		
		# Verify Cache-Control header
		self.assertIn("public", response.headers["Cache-Control"])
		self.assertIn("immutable", response.headers["Cache-Control"])
		
		# Verify Content-Disposition
		self.assertIn("inline", response.headers["Content-Disposition"])
		self.assertIn("test.txt", response.headers["Content-Disposition"])
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	def test_retrieve_file_not_found(
		self, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test retrieval of non-existent file."""
		# Arrange
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (False, None, "File not found")
		
		# Act
		response = self.client.get(
			"/api/v1/files/retrieve/QmNonexistent",
			headers={"X-API-Key": "test-api-key"},
		)
		
		# Assert
		self.assertEqual(response.status_code, 404)
		self.assertEqual(response.json["status"], 404)
		self.assertEqual(response.json["code"], "NOT_FOUND")
		self.assertIn("message", response.json)
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	def test_retrieve_file_access_denied(
		self, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test retrieval with access denied."""
		# Arrange
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (
			False,
			self.mock_file,
			"Access denied: not file owner",
		)
		
		# Act
		response = self.client.get(
			"/api/v1/files/retrieve/QmTest123",
			headers={"X-API-Key": "test-api-key"},
		)
		
		# Assert
		self.assertEqual(response.status_code, 403)
		self.assertEqual(response.json["status"], 403)
		self.assertEqual(response.json["code"], "FORBIDDEN")
		self.assertIn("denied", response.json["message"].lower())
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	def test_retrieve_file_returns_304_when_cached(
		self, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test 304 Not Modified response when client cache is valid."""
		# Arrange
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (True, self.mock_file, "Access granted")
		
		# Act
		response = self.client.get(
			"/api/v1/files/retrieve/QmTest123",
			headers={
				"X-API-Key": "test-api-key",
				"If-None-Match": '"QmTest123"',
			},
		)
		
		# Assert
		self.assertEqual(response.status_code, 304)
		self.assertEqual(response.data, b"")
		self.assertEqual(response.headers["ETag"], '"QmTest123"')
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	@patch("core.files.routes.retrieve.ipfs_service")
	def test_retrieve_file_updates_statistics(
		self, mock_ipfs, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test file retrieval updates retrieval count and timestamp."""
		# Arrange
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (True, self.mock_file, "Access granted")
		mock_ipfs.retrieve_file_stream.return_value = iter([b"content"])
		
		# Track initial state
		initial_count = self.mock_file.retrieval_count
		
		# Act
		self.client.get(
			"/api/v1/files/retrieve/QmTest123",
			headers={"X-API-Key": "test-api-key"},
		)
		
		# Assert - file record should be updated
		self.assertEqual(self.mock_file.retrieval_count, initial_count + 1)
		self.assertIsNotNone(self.mock_file.last_retrieved_at)
		self.mock_session.add.assert_called_with(self.mock_file)
		self.mock_session.commit.assert_called()
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	@patch("core.files.routes.retrieve.ipfs_service")
	def test_retrieve_file_with_download_parameter(
		self, mock_ipfs, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test file retrieval with download query parameter."""
		# Arrange
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (True, self.mock_file, "Access granted")
		mock_ipfs.retrieve_file_stream.return_value = iter([b"content"])
		
		# Act
		response = self.client.get(
			"/api/v1/files/retrieve/QmTest123?download",
			headers={"X-API-Key": "test-api-key"},
		)
		
		# Assert
		self.assertEqual(response.status_code, 200)
		# Should use attachment disposition
		self.assertIn("attachment", response.headers["Content-Disposition"])
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	@patch("core.files.routes.retrieve.ipfs_service")
	def test_retrieve_file_logs_audit_entry(
		self, mock_ipfs, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test file retrieval creates audit log entry."""
		# Arrange
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (True, self.mock_file, "Access granted")
		mock_ipfs.retrieve_file_stream.return_value = iter([b"content"])
		
		# Act
		self.client.get(
			"/api/v1/files/retrieve/QmTest123",
			headers={"X-API-Key": "test-api-key"},
		)
		
		# Assert - audit log should be created
		# Check that session.add was called with an AuditLog object
		calls = self.mock_session.add.call_args_list
		self.assertTrue(len(calls) >= 2)  # File update + audit log
		
		# Verify commit was called
		self.assertTrue(self.mock_session.commit.called)
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	@patch("core.files.routes.retrieve.ipfs_service")
	def test_retrieve_file_handles_ipfs_error(
		self, mock_ipfs, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test retrieval handles IPFS errors gracefully."""
		# Arrange
		from core.services.ipfs_service import RetrievalError
		
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (True, self.mock_file, "Access granted")
		mock_ipfs.retrieve_file_stream.side_effect = RetrievalError("IPFS unavailable")
		
		# Act
		response = self.client.get(
			"/api/v1/files/retrieve/QmTest123",
			headers={"X-API-Key": "test-api-key"},
		)
		
		# Assert
		self.assertEqual(response.status_code, 500)
		self.assertEqual(response.json["status"], 500)
		self.assertEqual(response.json["code"], "RETRIEVAL_ERROR")
		self.assertIn("message", response.json)
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	@patch("core.files.routes.retrieve.ipfs_service")
	def test_retrieve_file_detects_mime_type(
		self, mock_ipfs, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test retrieval uses correct MIME type detection."""
		# Arrange
		pdf_file = File(
			id=20,
			filename="document.pdf",
			cid="QmPDF123",
			size=2048,
			user_id=1,
			storage_key="document.pdf",
			mime_type="application/pdf",
			retrieval_count=0,
			created_at=datetime(2024, 1, 1, 12, 0, 0),
		)
		
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (True, pdf_file, "Access granted")
		mock_ipfs.retrieve_file_stream.return_value = iter([b"%PDF-1.4"])
		
		# Act
		response = self.client.get(
			"/api/v1/files/retrieve/QmPDF123",
			headers={"X-API-Key": "test-api-key"},
		)
		
		# Assert
		self.assertEqual(response.status_code, 200)
		self.assertIn("application/pdf", response.content_type)
	
	@patch("core.files.routes.retrieve.get_session")
	@patch("core.files.routes.retrieve.get_current_user")
	@patch("core.files.routes.retrieve.check_file_access_by_cid")
	@patch("core.files.routes.retrieve.ipfs_service")
	def test_retrieve_file_uses_storage_key(
		self, mock_ipfs, mock_check_access, mock_get_user, mock_get_session
	):
		"""Test retrieval uses storage_key when available."""
		# Arrange
		mock_get_session.return_value = iter([self.mock_session])
		mock_get_user.return_value = self.mock_user
		mock_check_access.return_value = (True, self.mock_file, "Access granted")
		mock_ipfs.retrieve_file_stream.return_value = iter([b"content"])
		
		# Act
		self.client.get(
			"/api/v1/files/retrieve/QmTest123",
			headers={"X-API-Key": "test-api-key"},
		)
		
		# Assert - should use storage_key
		mock_ipfs.retrieve_file_stream.assert_called_once()
		call_args = mock_ipfs.retrieve_file_stream.call_args
		self.assertEqual(call_args.kwargs["key"], "test-file.txt")


if __name__ == "__main__":
	unittest.main()

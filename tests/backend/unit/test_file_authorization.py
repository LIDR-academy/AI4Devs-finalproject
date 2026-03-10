"""Unit tests for file authorization helpers."""

import unittest
from datetime import datetime
from unittest.mock import MagicMock

from core.files.authorization import check_file_access_by_cid, check_file_access_by_id
from core.files.models import File
from core.users.models import User


class TestFileAuthorization(unittest.TestCase):
	"""Test cases for file authorization helpers."""
	
	def setUp(self):
		"""Set up test fixtures."""
		# Create mock session
		self.session = MagicMock()
		
		# Create mock user
		self.user = User(
			id=1,
			username="testuser",
			email="test@example.com",
			api_key="test-api-key",
		)
		
		# Create mock file
		self.file = File(
			id=10,
			filename="test.txt",
			cid="QmTest123",
			size=1024,
			user_id=1,
			storage_key="test-file.txt",
			mime_type="text/plain",
			retrieval_count=0,
			created_at=datetime.utcnow(),
			deleted_at=None,
		)
	
	def test_check_access_by_cid_success(self):
		"""Test successful access check by CID."""
		# Arrange
		mock_result = MagicMock()
		mock_result.first.return_value = self.file
		self.session.exec.return_value = mock_result
		
		# Act
		has_access, file_record, reason = check_file_access_by_cid(
			session=self.session,
			cid="QmTest123",
			user=self.user,
		)
		
		# Assert
		self.assertTrue(has_access)
		self.assertEqual(file_record, self.file)
		self.assertEqual(reason, "Access granted")
	
	def test_check_access_by_cid_file_not_found(self):
		"""Test access check when file doesn't exist."""
		# Arrange
		mock_result = MagicMock()
		mock_result.first.return_value = None
		self.session.exec.return_value = mock_result
		
		# Act
		has_access, file_record, reason = check_file_access_by_cid(
			session=self.session,
			cid="QmNonexistent",
			user=self.user,
		)
		
		# Assert
		self.assertFalse(has_access)
		self.assertIsNone(file_record)
		self.assertEqual(reason, "File not found")
	
	def test_check_access_by_cid_no_user(self):
		"""Test access check without authenticated user."""
		# Arrange
		mock_result = MagicMock()
		mock_result.first.return_value = self.file
		self.session.exec.return_value = mock_result
		
		# Act
		has_access, file_record, reason = check_file_access_by_cid(
			session=self.session,
			cid="QmTest123",
			user=None,
		)
		
		# Assert
		self.assertFalse(has_access)
		self.assertEqual(file_record, self.file)
		self.assertEqual(reason, "Authentication required")
	
	def test_check_access_by_cid_wrong_owner(self):
		"""Test access check when user doesn't own file."""
		# Arrange
		other_user = User(
			id=2,
			username="otheruser",
			email="other@example.com",
			api_key="other-api-key",
		)
		
		mock_result = MagicMock()
		mock_result.first.return_value = self.file
		self.session.exec.return_value = mock_result
		
		# Act
		has_access, file_record, reason = check_file_access_by_cid(
			session=self.session,
			cid="QmTest123",
			user=other_user,
		)
		
		# Assert
		self.assertFalse(has_access)
		self.assertEqual(file_record, self.file)
		self.assertIn("not file owner", reason.lower())
	
	def test_check_access_by_cid_deleted_file(self):
		"""Test access check returns false for deleted files."""
		# Arrange
		deleted_file = File(
			id=11,
			filename="deleted.txt",
			cid="QmDeleted",
			size=512,
			user_id=1,
			deleted_at=datetime.utcnow(),
		)
		
		# Query should filter out deleted files, so return None
		mock_result = MagicMock()
		mock_result.first.return_value = None
		self.session.exec.return_value = mock_result
		
		# Act
		has_access, file_record, reason = check_file_access_by_cid(
			session=self.session,
			cid="QmDeleted",
			user=self.user,
		)
		
		# Assert
		self.assertFalse(has_access)
		self.assertIsNone(file_record)
		self.assertEqual(reason, "File not found")
	
	def test_check_access_by_id_success(self):
		"""Test successful access check by file ID."""
		# Arrange
		mock_result = MagicMock()
		mock_result.first.return_value = self.file
		self.session.exec.return_value = mock_result
		
		# Act
		has_access, file_record, reason = check_file_access_by_id(
			session=self.session,
			file_id=10,
			user=self.user,
		)
		
		# Assert
		self.assertTrue(has_access)
		self.assertEqual(file_record, self.file)
		self.assertEqual(reason, "Access granted")
	
	def test_check_access_by_id_file_not_found(self):
		"""Test access check by ID when file doesn't exist."""
		# Arrange
		mock_result = MagicMock()
		mock_result.first.return_value = None
		self.session.exec.return_value = mock_result
		
		# Act
		has_access, file_record, reason = check_file_access_by_id(
			session=self.session,
			file_id=999,
			user=self.user,
		)
		
		# Assert
		self.assertFalse(has_access)
		self.assertIsNone(file_record)
		self.assertEqual(reason, "File not found")
	
	def test_check_access_by_id_no_user(self):
		"""Test access check by ID without authenticated user."""
		# Arrange
		mock_result = MagicMock()
		mock_result.first.return_value = self.file
		self.session.exec.return_value = mock_result
		
		# Act
		has_access, file_record, reason = check_file_access_by_id(
			session=self.session,
			file_id=10,
			user=None,
		)
		
		# Assert
		self.assertFalse(has_access)
		self.assertEqual(file_record, self.file)
		self.assertEqual(reason, "Authentication required")
	
	def test_check_access_by_id_wrong_owner(self):
		"""Test access check by ID when user doesn't own file."""
		# Arrange
		other_user = User(
			id=3,
			username="unauthorized",
			email="unauthorized@example.com",
			api_key="unauth-key",
		)
		
		mock_result = MagicMock()
		mock_result.first.return_value = self.file
		self.session.exec.return_value = mock_result
		
		# Act
		has_access, file_record, reason = check_file_access_by_id(
			session=self.session,
			file_id=10,
			user=other_user,
		)
		
		# Assert
		self.assertFalse(has_access)
		self.assertEqual(file_record, self.file)
		self.assertIn("not file owner", reason.lower())


if __name__ == "__main__":
	unittest.main()

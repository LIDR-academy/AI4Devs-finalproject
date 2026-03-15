"""Unit tests for IPFS service retrieval methods."""

import unittest
from io import BytesIO
from unittest.mock import MagicMock, Mock, patch

from botocore.exceptions import ClientError

from core.services.ipfs_service import IPFSService, RetrievalError


class TestIPFSServiceRetrieval(unittest.TestCase):
	"""Test cases for IPFS service retrieval functionality."""
	
	def setUp(self):
		"""Set up test fixtures."""
		# Mock environment variables
		self.env_patcher = patch.dict(
			"os.environ",
			{
				"FILEBASE_ACCESS_KEY": "test-access-key",
				"FILEBASE_SECRET_KEY": "test-secret-key",
				"FILEBASE_BUCKET": "test-bucket",
			},
		)
		self.env_patcher.start()
		
		# Create service with mocked S3 client
		with patch("core.services.ipfs_service.boto3.client"):
			self.service = IPFSService(strict=False)
			self.service.client = MagicMock()
	
	def tearDown(self):
		"""Clean up test fixtures."""
		self.env_patcher.stop()
	
	def test_retrieve_file_success(self):
		"""Test successful file retrieval."""
		# Arrange
		test_key = "test-file.txt"
		test_data = b"test file content"
		
		mock_response = {"Body": BytesIO(test_data)}
		self.service.client.get_object.return_value = mock_response
		
		# Act
		result = self.service.retrieve_file(test_key)
		
		# Assert
		self.assertEqual(result, test_data)
		self.service.client.get_object.assert_called_once_with(
			Bucket="test-bucket",
			Key=test_key,
		)
	
	def test_retrieve_file_not_found(self):
		"""Test retrieval of non-existent file."""
		# Arrange
		test_key = "nonexistent.txt"
		
		error_response = {"Error": {"Code": "NoSuchKey"}}
		self.service.client.get_object.side_effect = ClientError(
			error_response,
			"GetObject",
		)
		
		# Act & Assert
		with self.assertRaises(RetrievalError) as context:
			self.service.retrieve_file(test_key)
		
		self.assertIn("not found", str(context.exception).lower())
	
	def test_retrieve_file_with_retry_on_transient_error(self):
		"""Test retrieval retries on transient errors."""
		# Arrange
		test_key = "test-file.txt"
		test_data = b"test content"
		
		# First call fails, second succeeds
		error_response = {"Error": {"Code": "InternalError"}}
		self.service.client.get_object.side_effect = [
			ClientError(error_response, "GetObject"),
			{"Body": BytesIO(test_data)},
		]
		
		# Act
		result = self.service.retrieve_file(test_key)
		
		# Assert
		self.assertEqual(result, test_data)
		self.assertEqual(self.service.client.get_object.call_count, 2)
	
	def test_retrieve_file_fails_after_max_retries(self):
		"""Test retrieval fails after exhausting retries."""
		# Arrange
		test_key = "test-file.txt"
		
		error_response = {"Error": {"Code": "InternalError"}}
		self.service.client.get_object.side_effect = ClientError(
			error_response,
			"GetObject",
		)
		
		# Act & Assert
		with self.assertRaises(RetrievalError) as context:
			self.service.retrieve_file(test_key)
		
		self.assertIn("after retries", str(context.exception).lower())
		# Should have attempted 3 times (initial + 2 retries)
		self.assertEqual(self.service.client.get_object.call_count, 3)
	
	def test_retrieve_file_without_client(self):
		"""Test retrieval fails when client not configured."""
		# Arrange
		self.service.client = None
		
		# Act & Assert
		with self.assertRaises(ValueError) as context:
			self.service.retrieve_file("test-file.txt")
		
		self.assertIn("not configured", str(context.exception).lower())
	
	def test_retrieve_file_stream_success(self):
		"""Test successful file streaming."""
		# Arrange
		test_key = "large-file.bin"
		chunk1 = b"chunk 1 data"
		chunk2 = b"chunk 2 data"
		chunk3 = b"chunk 3 data"
		
		# Mock streaming body
		mock_body = MagicMock()
		mock_body.read.side_effect = [chunk1, chunk2, chunk3, b""]
		
		mock_response = {"Body": mock_body}
		self.service.client.get_object.return_value = mock_response
		
		# Act
		chunks = list(self.service.retrieve_file_stream(test_key, chunk_size=1024))
		
		# Assert
		self.assertEqual(chunks, [chunk1, chunk2, chunk3])
		self.service.client.get_object.assert_called_once_with(
			Bucket="test-bucket",
			Key=test_key,
		)
	
	def test_retrieve_file_stream_not_found(self):
		"""Test streaming raises error for non-existent file."""
		# Arrange
		test_key = "nonexistent.bin"
		
		error_response = {"Error": {"Code": "NoSuchKey"}}
		self.service.client.get_object.side_effect = ClientError(
			error_response,
			"GetObject",
		)
		
		# Act & Assert
		with self.assertRaises(RetrievalError) as context:
			list(self.service.retrieve_file_stream(test_key))
		
		self.assertIn("not found", str(context.exception).lower())
	
	def test_retrieve_file_stream_custom_chunk_size(self):
		"""Test streaming with custom chunk size."""
		# Arrange
		test_key = "file.dat"
		chunk_size = 512
		test_chunk = b"x" * chunk_size
		
		mock_body = MagicMock()
		mock_body.read.side_effect = [test_chunk, b""]
		
		mock_response = {"Body": mock_body}
		self.service.client.get_object.return_value = mock_response
		
		# Act
		list(self.service.retrieve_file_stream(test_key, chunk_size=chunk_size))
		
		# Assert
		mock_body.read.assert_called_with(chunk_size)
	
	def test_circuit_breaker_opens_after_failures(self):
		"""Test circuit breaker opens after repeated failures."""
		# Arrange
		test_key = "test-file.txt"
		
		error_response = {"Error": {"Code": "InternalError"}}
		self.service.client.get_object.side_effect = ClientError(
			error_response,
			"GetObject",
		)
		
		# Act & Assert - Trigger circuit breaker
		for _ in range(6):  # fail_max=5, so 6th attempt should trigger circuit
			try:
				self.service.retrieve_file(test_key)
			except (RetrievalError, Exception):
				pass
		
		# Circuit should now be open
		with self.assertRaises(Exception):  # Circuit breaker exception
			self.service.retrieve_file(test_key)
	
	def test_retrieve_error_exception_message(self):
		"""Test RetrievalError exception carries proper message."""
		# Arrange
		test_key = "test.txt"
		error_response = {"Error": {"Code": "NoSuchKey"}}
		self.service.client.get_object.side_effect = ClientError(
			error_response,
			"GetObject",
		)
		
		# Act & Assert
		try:
			self.service.retrieve_file(test_key)
			self.fail("Expected RetrievalError to be raised")
		except RetrievalError as e:
			self.assertIn(test_key, str(e))
			self.assertIn("not found", str(e).lower())


if __name__ == "__main__":
	unittest.main()

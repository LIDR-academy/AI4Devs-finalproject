"""Unit tests for cache headers utilities."""

import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch

from flask import Flask, Response

from core.files.cache_headers import (
	add_cache_headers,
	create_304_response,
	generate_etag,
	should_return_304,
)


class TestCacheHeaders(unittest.TestCase):
	"""Test cases for HTTP caching utilities."""
	
	def setUp(self):
		"""Set up test fixtures."""
		self.app = Flask(__name__)
		self.app_context = self.app.app_context()
		self.app_context.push()
	
	def tearDown(self):
		"""Clean up test fixtures."""
		self.app_context.pop()
	
	def test_generate_etag(self):
		"""Test ETag generation from CID."""
		# Arrange
		cid = "QmTest123"
		
		# Act
		etag = generate_etag(cid)
		
		# Assert
		self.assertEqual(etag, '"QmTest123"')
		self.assertTrue(etag.startswith('"'))
		self.assertTrue(etag.endswith('"'))
	
	def test_should_return_304_with_matching_etag(self):
		"""Test 304 decision with matching ETag."""
		# Arrange
		etag = '"QmTest123"'
		
		with self.app.test_request_context(
			headers={"If-None-Match": '"QmTest123"'}
		):
			# Act
			result = should_return_304(etag)
			
			# Assert
			self.assertTrue(result)
	
	def test_should_return_304_with_multiple_etags(self):
		"""Test 304 decision with multiple ETags in If-None-Match."""
		# Arrange
		etag = '"QmTest123"'
		
		with self.app.test_request_context(
			headers={"If-None-Match": '"QmOther", "QmTest123", "QmAnother"'}
		):
			# Act
			result = should_return_304(etag)
			
			# Assert
			self.assertTrue(result)
	
	def test_should_return_304_with_wildcard(self):
		"""Test 304 decision with wildcard ETag."""
		# Arrange
		etag = '"QmTest123"'
		
		with self.app.test_request_context(
			headers={"If-None-Match": "*"}
		):
			# Act
			result = should_return_304(etag)
			
			# Assert
			self.assertTrue(result)
	
	def test_should_not_return_304_with_different_etag(self):
		"""Test 304 not returned with different ETag."""
		# Arrange
		etag = '"QmTest123"'
		
		with self.app.test_request_context(
			headers={"If-None-Match": '"QmDifferent"'}
		):
			# Act
			result = should_return_304(etag)
			
			# Assert
			self.assertFalse(result)
	
	def test_should_not_return_304_without_if_none_match(self):
		"""Test 304 not returned without If-None-Match header."""
		# Arrange
		etag = '"QmTest123"'
		
		with self.app.test_request_context():
			# Act
			result = should_return_304(etag)
			
			# Assert
			self.assertFalse(result)
	
	def test_should_return_304_with_if_modified_since(self):
		"""Test 304 decision with If-Modified-Since header."""
		# Arrange
		etag = '"QmTest123"'
		last_modified = datetime(2024, 1, 1, 12, 0, 0)
		if_modified_since = "Sun, 01 Jan 2024 13:00:00 GMT"
		
		with self.app.test_request_context(
			headers={"If-Modified-Since": if_modified_since}
		):
			# Act
			result = should_return_304(etag, last_modified)
			
			# Assert
			self.assertTrue(result)
	
	def test_should_not_return_304_with_newer_content(self):
		"""Test 304 not returned when content is newer."""
		# Arrange
		etag = '"QmTest123"'
		last_modified = datetime(2024, 1, 1, 14, 0, 0)
		if_modified_since = "Sun, 01 Jan 2024 13:00:00 GMT"
		
		with self.app.test_request_context(
			headers={"If-Modified-Since": if_modified_since}
		):
			# Act
			result = should_return_304(etag, last_modified)
			
			# Assert
			self.assertFalse(result)
	
	def test_should_return_304_handles_invalid_date(self):
		"""Test 304 check handles invalid If-Modified-Since gracefully."""
		# Arrange
		etag = '"QmTest123"'
		last_modified = datetime(2024, 1, 1, 12, 0, 0)
		
		with self.app.test_request_context(
			headers={"If-Modified-Since": "invalid-date-format"}
		):
			# Act
			result = should_return_304(etag, last_modified)
			
			# Assert
			self.assertFalse(result)
	
	def test_add_cache_headers(self):
		"""Test adding cache headers to response."""
		# Arrange
		response = Response(b"test content")
		cid = "QmTest123"
		file_id = 42
		created_at = datetime(2024, 1, 1, 12, 0, 0)
		
		# Act
		result = add_cache_headers(response, cid, file_id, created_at)
		
		# Assert
		self.assertEqual(result.headers["ETag"], '"QmTest123"')
		self.assertIn("public", result.headers["Cache-Control"])
		self.assertIn("immutable", result.headers["Cache-Control"])
		self.assertIn("max-age=31536000", result.headers["Cache-Control"])
		self.assertEqual(result.headers["Last-Modified"], "Mon, 01 Jan 2024 12:00:00 GMT")
		self.assertEqual(result.headers["X-File-ID"], "42")
		self.assertEqual(result.headers["X-Content-CID"], cid)
	
	def test_add_cache_headers_custom_max_age(self):
		"""Test adding cache headers with custom max-age."""
		# Arrange
		response = Response(b"test content")
		cid = "QmTest456"
		file_id = 99
		created_at = datetime(2024, 2, 1, 10, 30, 0)
		custom_max_age = 86400  # 1 day
		
		# Act
		result = add_cache_headers(
			response, cid, file_id, created_at, max_age=custom_max_age
		)
		
		# Assert
		self.assertIn(f"max-age={custom_max_age}", result.headers["Cache-Control"])
	
	def test_create_304_response(self):
		"""Test creating 304 Not Modified response."""
		# Arrange
		etag = '"QmTest789"'
		last_modified = datetime(2024, 3, 1, 8, 15, 0)
		
		# Act
		response = create_304_response(etag, last_modified)
		
		# Assert
		self.assertEqual(response.status_code, 304)
		self.assertEqual(response.headers["ETag"], etag)
		self.assertIn("public", response.headers["Cache-Control"])
		self.assertIn("immutable", response.headers["Cache-Control"])
		self.assertEqual(
			response.headers["Last-Modified"],
			"Fri, 01 Mar 2024 08:15:00 GMT"
		)
	
	def test_create_304_response_has_no_body(self):
		"""Test 304 response has no content body."""
		# Arrange
		etag = '"QmTest999"'
		last_modified = datetime(2024, 4, 1, 16, 45, 0)
		
		# Act
		response = create_304_response(etag, last_modified)
		
		# Assert
		self.assertEqual(response.get_data(), b"")


if __name__ == "__main__":
	unittest.main()

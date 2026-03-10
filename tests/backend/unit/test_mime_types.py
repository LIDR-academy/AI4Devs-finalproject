"""Unit tests for MIME type detection and utilities."""

import unittest

from core.files.mime_types import (
	detect_mime_type,
	get_content_disposition,
	is_compressible,
)


class TestMimeTypes(unittest.TestCase):
	"""Test cases for MIME type utilities."""
	
	def test_detect_mime_type_from_extension(self):
		"""Test MIME type detection from file extension."""
		test_cases = [
			("document.pdf", "application/pdf"),
			("image.png", "image/png"),
			("photo.jpg", "image/jpeg"),
			("video.mp4", "video/mp4"),
			("audio.mp3", "audio/mpeg"),
			("data.json", "application/json"),
			("page.html", "text/html"),
			("script.js", "application/javascript"),
			("style.css", "text/css"),
		]
		
		for filename, expected_mime_type in test_cases:
			with self.subTest(filename=filename):
				result = detect_mime_type(filename)
				self.assertEqual(result, expected_mime_type)
	
	def test_detect_mime_type_custom_types(self):
		"""Test detection of custom MIME types."""
		test_cases = [
			("README.md", "text/markdown"),
			("config.yaml", "application/yaml"),
			("config.yml", "application/yaml"),
			("image.webp", "image/webp"),
			("icon.svg", "image/svg+xml"),
		]
		
		for filename, expected_mime_type in test_cases:
			with self.subTest(filename=filename):
				result = detect_mime_type(filename)
				self.assertEqual(result, expected_mime_type)
	
	def test_detect_mime_type_multi_part_extension(self):
		"""Test MIME type detection for multi-part extensions."""
		# Archive files with multiple extensions
		result = detect_mime_type("archive.tar.gz")
		self.assertEqual(result, "application/gzip")
	
	def test_detect_mime_type_unknown_extension(self):
		"""Test fallback for unknown file extensions."""
		result = detect_mime_type("file.xyz")
		self.assertEqual(result, "application/octet-stream")
	
	def test_detect_mime_type_no_extension(self):
		"""Test fallback for files without extension."""
		result = detect_mime_type("README")
		self.assertEqual(result, "application/octet-stream")
	
	def test_detect_mime_type_with_stored_mime(self):
		"""Test using stored MIME type when available."""
		filename = "document.pdf"
		stored_mime_type = "application/x-pdf"
		
		result = detect_mime_type(filename, stored_mime_type)
		
		# Should use stored MIME type
		self.assertEqual(result, stored_mime_type)
	
	def test_detect_mime_type_ignores_empty_stored_mime(self):
		"""Test detection falls back when stored MIME is empty."""
		filename = "image.png"
		stored_mime_type = ""
		
		result = detect_mime_type(filename, stored_mime_type)
		
		# Should detect from extension
		self.assertEqual(result, "image/png")
	
	def test_detect_mime_type_ignores_whitespace_stored_mime(self):
		"""Test detection falls back when stored MIME is whitespace."""
		filename = "file.json"
		stored_mime_type = "   "
		
		result = detect_mime_type(filename, stored_mime_type)
		
		# Should detect from extension
		self.assertEqual(result, "application/json")
	
	def test_is_compressible_text_types(self):
		"""Test compressibility check for text-based types."""
		compressible_types = [
			"text/plain",
			"text/html",
			"text/css",
			"text/javascript",
			"text/markdown",
		]
		
		for mime_type in compressible_types:
			with self.subTest(mime_type=mime_type):
				self.assertTrue(is_compressible(mime_type))
	
	def test_is_compressible_json_and_xml(self):
		"""Test compressibility check for JSON and XML."""
		compressible_types = [
			"application/json",
			"application/xml",
			"application/json+ld",
		]
		
		for mime_type in compressible_types:
			with self.subTest(mime_type=mime_type):
				self.assertTrue(is_compressible(mime_type))
	
	def test_is_compressible_svg_and_javascript(self):
		"""Test compressibility check for SVG and JavaScript."""
		self.assertTrue(is_compressible("image/svg+xml"))
		self.assertTrue(is_compressible("application/javascript"))
		self.assertTrue(is_compressible("application/x-javascript"))
	
	def test_is_not_compressible_images(self):
		"""Test non-compressibility of image formats."""
		non_compressible_types = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
		]
		
		for mime_type in non_compressible_types:
			with self.subTest(mime_type=mime_type):
				self.assertFalse(is_compressible(mime_type))
	
	def test_is_not_compressible_media(self):
		"""Test non-compressibility of media formats."""
		non_compressible_types = [
			"video/mp4",
			"video/webm",
			"audio/mpeg",
			"audio/ogg",
			"audio/mp4",
		]
		
		for mime_type in non_compressible_types:
			with self.subTest(mime_type=mime_type):
				self.assertFalse(is_compressible(mime_type))
	
	def test_is_not_compressible_archives(self):
		"""Test non-compressibility of archive formats."""
		non_compressible_types = [
			"application/zip",
			"application/gzip",
			"application/x-gzip",
			"application/x-bzip2",
			"application/x-7z-compressed",
			"application/x-rar-compressed",
		]
		
		for mime_type in non_compressible_types:
			with self.subTest(mime_type=mime_type):
				self.assertFalse(is_compressible(mime_type))
	
	def test_is_not_compressible_pdf(self):
		"""Test non-compressibility of PDF."""
		self.assertFalse(is_compressible("application/pdf"))
	
	def test_is_not_compressible_unknown(self):
		"""Test default non-compressibility for unknown types."""
		self.assertFalse(is_compressible("application/unknown"))
		self.assertFalse(is_compressible("weird/type"))
	
	def test_get_content_disposition_inline(self):
		"""Test Content-Disposition header for inline display."""
		filename = "document.pdf"
		
		result = get_content_disposition(filename, inline=True)
		
		self.assertEqual(result, 'inline; filename="document.pdf"')
	
	def test_get_content_disposition_attachment(self):
		"""Test Content-Disposition header for download."""
		filename = "archive.zip"
		
		result = get_content_disposition(filename, inline=False)
		
		self.assertEqual(result, 'attachment; filename="archive.zip"')
	
	def test_get_content_disposition_filename_with_quotes(self):
		"""Test Content-Disposition escapes quotes in filename."""
		filename = 'file"with"quotes.txt'
		
		result = get_content_disposition(filename, inline=True)
		
		self.assertEqual(result, 'inline; filename="file\\"with\\"quotes.txt"')
	
	def test_get_content_disposition_filename_with_spaces(self):
		"""Test Content-Disposition handles filenames with spaces."""
		filename = "my document with spaces.pdf"
		
		result = get_content_disposition(filename, inline=False)
		
		self.assertEqual(result, 'attachment; filename="my document with spaces.pdf"')
	
	def test_get_content_disposition_default_inline(self):
		"""Test Content-Disposition defaults to inline."""
		filename = "image.png"
		
		result = get_content_disposition(filename)
		
		self.assertTrue(result.startswith("inline"))


if __name__ == "__main__":
	unittest.main()

"""Tests for file validation utilities."""

import unittest
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from core.common.exceptions import ValidationError  # pyright: ignore[reportMissingImports]
from core.files.validators import (  # pyright: ignore[reportMissingImports]
    validate_filename,
    validate_file_size,
    validate_mime_type,
    generate_safe_filename,
    sanitize_filename,
    MAX_FILE_SIZE,
    ALLOWED_MIME_TYPES,
)


class TestValidateFilename(unittest.TestCase):
    """Test filename validation."""
    
    def test_validate_filename_valid(self):
        """Valid filenames should not raise."""
        validate_filename("document.pdf")
        validate_filename("test_file_123.txt")
        validate_filename("my-file.docx")
        validate_filename("archive.tar.gz")
    
    def test_validate_filename_empty(self):
        """Should reject empty filenames."""
        with self.assertRaises(ValidationError) as ctx:
            validate_filename("")
        self.assertIn("non-empty", str(ctx.exception))
    
    def test_validate_filename_none(self):
        """Should reject None."""
        with self.assertRaises(ValidationError):
            validate_filename(None)
    
    def test_validate_filename_path_traversal(self):
        """Should reject path traversal attempts."""
        with self.assertRaises(ValidationError):
            validate_filename("../../../etc/passwd")
        
        with self.assertRaises(ValidationError):
            validate_filename("file\\..\\..\\windows")
    
    def test_validate_filename_null_bytes(self):
        """Should reject null bytes."""
        with self.assertRaises(ValidationError):
            validate_filename("file\x00.txt")
    
    def test_validate_filename_absolute_path(self):
        """Should reject absolute paths."""
        with self.assertRaises(ValidationError):
            validate_filename("/etc/passwd")
        
        with self.assertRaises(ValidationError):
            validate_filename("~/file.txt")
    
    def test_validate_filename_too_long(self):
        """Should reject filenames > 255 chars."""
        long_name = "a" * 256 + ".txt"
        with self.assertRaises(ValidationError):
            validate_filename(long_name)
    
    def test_validate_filename_max_length(self):
        """Should accept filenames at max length."""
        max_name = "a" * 251 + ".txt"  # 255 chars total
        validate_filename(max_name)  # Should not raise


class TestValidateFileSize(unittest.TestCase):
    """Test file size validation."""
    
    def test_validate_file_size_valid(self):
        """Valid sizes should not raise."""
        validate_file_size(1024)
        validate_file_size(1024 * 1024)
        validate_file_size(100 * 1024 * 1024)
    
    def test_validate_file_size_empty(self):
        """Should reject empty files."""
        with self.assertRaises(ValidationError):
            validate_file_size(0)
    
    def test_validate_file_size_negative(self):
        """Should reject negative sizes."""
        with self.assertRaises(ValidationError):
            validate_file_size(-1)
    
    def test_validate_file_size_too_large(self):
        """Should reject oversized files."""
        with self.assertRaises(ValidationError) as ctx:
            validate_file_size(101 * 1024 * 1024)
        self.assertIn("exceeds", str(ctx.exception).lower())
    
    def test_validate_file_size_non_integer(self):
        """Should reject non-integer sizes."""
        with self.assertRaises(ValidationError):
            validate_file_size("1024")
        
        with self.assertRaises(ValidationError):
            validate_file_size(1024.5)
    
    def test_validate_file_size_custom_limits(self):
        """Should respect custom size limits."""
        # Custom max of 10MB
        validate_file_size(10 * 1024 * 1024, max_size=10 * 1024 * 1024)
        
        with self.assertRaises(ValidationError):
            validate_file_size(11 * 1024 * 1024, max_size=10 * 1024 * 1024)


class TestValidateMimeType(unittest.TestCase):
    """Test MIME type validation."""
    
    def test_validate_mime_type_valid(self):
        """Valid MIME types should not raise."""
        validate_mime_type("text/plain")
        validate_mime_type("application/pdf")
        validate_mime_type("image/jpeg")
    
    def test_validate_mime_type_with_charset(self):
        """Should handle MIME types with parameters."""
        validate_mime_type("text/plain; charset=utf-8")
        validate_mime_type("application/json; charset=utf-8")
    
    def test_validate_mime_type_invalid(self):
        """Should reject non-whitelisted MIME types."""
        with self.assertRaises(ValidationError):
            validate_mime_type("application/x-executable")
        
        with self.assertRaises(ValidationError):
            validate_mime_type("application/vnd.apple.installer+xml")
    
    def test_validate_mime_type_empty(self):
        """Should reject empty MIME type."""
        with self.assertRaises(ValidationError):
            validate_mime_type("")
        
        with self.assertRaises(ValidationError):
            validate_mime_type(None)
    
    def test_validate_mime_type_custom_whitelist(self):
        """Should respect custom whitelist."""
        custom_types = {"application/custom", "text/custom"}
        
        validate_mime_type("application/custom", allowed_types=custom_types)
        
        with self.assertRaises(ValidationError):
            validate_mime_type("text/plain", allowed_types=custom_types)


class TestGenerateSafeFilename(unittest.TestCase):
    """Test safe filename generation."""
    
    def test_generate_safe_filename(self):
        """Should generate UUID-prefixed filename."""
        safe_name = generate_safe_filename("document.pdf")
        
        self.assertTrue(safe_name.endswith(".pdf"))
        self.assertGreater(len(safe_name), len(".pdf"))
        self.assertNotIn(" ", safe_name)
        self.assertNotIn("..", safe_name)
    
    def test_generate_safe_filename_no_extension(self):
        """Should handle files without extension."""
        safe_name = generate_safe_filename("README")
        
        self.assertGreater(len(safe_name), 0)
        self.assertNotIn(" ", safe_name)
    
    def test_generate_safe_filename_invalid_input(self):
        """Should reject invalid filenames."""
        with self.assertRaises(ValidationError):
            generate_safe_filename("../etc/passwd")
    
    def test_generate_safe_filename_uniqueness(self):
        """Generated filenames should be unique."""
        name1 = generate_safe_filename("test.txt")
        name2 = generate_safe_filename("test.txt")
        
        self.assertNotEqual(name1, name2)
    
    def test_generate_safe_filename_preserves_extension(self):
        """Should preserve file extensions."""
        extensions = [".pdf", ".jpg", ".docx", ".tar.gz"]
        
        for ext in extensions:
            safe_name = generate_safe_filename(f"file{ext}")
            self.assertTrue(safe_name.endswith(ext))


class TestSanitizeFilename(unittest.TestCase):
    """Test filename sanitization."""
    
    def test_sanitize_filename_removes_traversal(self):
        """Should remove path traversal patterns."""
        self.assertEqual(
            sanitize_filename("../file.txt"),
            "file.txt"
        )
    
    def test_sanitize_filename_removes_backslash(self):
        """Should remove backslashes."""
        self.assertEqual(
            sanitize_filename("file\\..\\test.txt"),
            "file_test.txt"
        )
    
    def test_sanitize_filename_multiple_underscores(self):
        """Should collapse multiple underscores."""
        result = sanitize_filename("file___name.txt")
        self.assertNotIn("__", result)
    
    def test_sanitize_filename_special_chars(self):
        """Should remove special characters."""
        result = sanitize_filename("file@#$%name.txt")
        self.assertNotIn("@", result)
        self.assertNotIn("#", result)
    
    def test_sanitize_filename_empty_result(self):
        """Should return 'file' if result would be empty."""
        result = sanitize_filename("...")
        self.assertEqual(result, "file")


if __name__ == "__main__":
    unittest.main()

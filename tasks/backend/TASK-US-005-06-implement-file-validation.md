# TASK-US-005-06: Implement File Validation

[Trello Card](https://trello.com/c/YDVXgt3j)

## Parent User Story
[US-005: File Upload to IPFS](../../user-stories/backend/US-005-file-upload-ipfs.md)

## Description
Implement file validation utilities: sanitize filenames to prevent path traversal attacks, enforce file size limits, generate safe filenames with UUID prefix, and validate MIME types against a whitelist.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Create File Validators Module
Create `backend/core/files/validators.py`:

```python
"""File validation utilities."""

import os
import uuid
import logging
from pathlib import Path

from core.common.exceptions import ValidationError

logger = logging.getLogger(__name__)

# Allowed MIME types
ALLOWED_MIME_TYPES = {
    "text/plain",
    "application/pdf",
    "application/json",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/zip",
    "application/x-tar",
    "application/gzip",
    "video/mp4",
    "audio/mpeg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

# Maximum file size (100MB)
MAX_FILE_SIZE = 100 * 1024 * 1024

# Dangerous filename patterns
DANGEROUS_PATTERNS = [
    "..",
    "/",
    "\\",
    "\x00",
]


def validate_filename(filename: str) -> None:
    """Validate filename for security and legality.
    
    Args:
        filename: The filename to validate.
        
    Raises:
        ValidationError: If filename is invalid.
    """
    if not filename or not isinstance(filename, str):
        raise ValidationError("Filename must be a non-empty string")
    
    if len(filename) > 255:
        raise ValidationError("Filename exceeds maximum length of 255 characters")
    
    # Check for dangerous patterns
    for pattern in DANGEROUS_PATTERNS:
        if pattern in filename:
            raise ValidationError(
                f"Filename contains dangerous pattern: {pattern}"
            )
    
    # Check for null bytes
    if "\x00" in filename:
        raise ValidationError("Filename contains null bytes")
    
    # Check for path traversal attempts
    path = Path(filename)
    try:
        path.resolve()
    except (ValueError, RuntimeError) as e:
        raise ValidationError(f"Invalid filename: {e}")


def validate_file_size(size: int, max_size: int = MAX_FILE_SIZE) -> None:
    """Validate file size.
    
    Args:
        size: File size in bytes.
        max_size: Maximum allowed size in bytes.
        
    Raises:
        ValidationError: If file exceeds size limit.
    """
    if not isinstance(size, int) or size < 0:
        raise ValidationError("File size must be a positive integer")
    
    if size == 0:
        raise ValidationError("Cannot upload empty files")
    
    if size > max_size:
        max_mb = max_size / (1024 * 1024)
        raise ValidationError(
            f"File size ({size} bytes) exceeds maximum limit "
            f"({max_mb:.0f}MB)"
        )


def validate_mime_type(
    mime_type: str,
    allowed_types: set = None
) -> None:
    """Validate MIME type against whitelist.
    
    Args:
        mime_type: The MIME type to validate.
        allowed_types: Set of allowed MIME types. Defaults to ALLOWED_MIME_TYPES.
        
    Raises:
        ValidationError: If MIME type is not allowed.
    """
    if allowed_types is None:
        allowed_types = ALLOWED_MIME_TYPES
    
    if not mime_type or not isinstance(mime_type, str):
        raise ValidationError("MIME type must be a non-empty string")
    
    # Handle MIME type with parameters (e.g., "text/plain; charset=utf-8")
    base_mime_type = mime_type.split(";")[0].strip()
    
    if base_mime_type not in allowed_types:
        raise ValidationError(
            f"MIME type '{base_mime_type}' is not allowed. "
            f"Allowed types: {', '.join(sorted(allowed_types))}"
        )


def generate_safe_filename(original_filename: str) -> str:
    """Generate a safe filename with UUID prefix.
    
    Args:
        original_filename: The original filename from request.
        
    Returns:
        str: Safe filename with UUID prefix (e.g., "550e8400_document.pdf")
        
    Raises:
        ValidationError: If original filename is invalid.
    """
    # Validate first
    validate_filename(original_filename)
    
    # Get file extension
    _, ext = os.path.splitext(original_filename)
    
    # Generate UUID prefix
    uuid_prefix = str(uuid.uuid4()).replace("-", "_")
    
    # Create safe filename
    safe_filename = f"{uuid_prefix}{ext}"
    
    logger.info(
        f"Generated safe filename: {original_filename} → {safe_filename}"
    )
    
    return safe_filename


def sanitize_filename(filename: str) -> str:
    """Sanitize filename by removing/replacing dangerous characters.
    
    Args:
        filename: The filename to sanitize.
        
    Returns:
        str: Sanitized filename.
    """
    # Remove dangerous characters
    sanitized = filename
    
    for pattern in DANGEROUS_PATTERNS:
        sanitized = sanitized.replace(pattern, "_")
    
    # Replace multiple underscores with single
    while "__" in sanitized:
        sanitized = sanitized.replace("__", "_")
    
    # Remove leading/trailing dots
    sanitized = sanitized.strip(".")
    
    # Keep only safe characters
    safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-"
    sanitized = "".join(c if c in safe_chars else "_" for c in sanitized)
    
    return sanitized.strip("_")
```

### 2. Create File Model
Create/update `backend/core/files/models.py`:

```python
"""File models for IPFS gateway."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from core.common.models import TimestampMixin


class File(SQLModel, TimestampMixin, table=True):
    """Model for uploaded files."""
    
    __tablename__ = "files"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    cid: str = Field(index=True, description="IPFS Content Identifier")
    original_filename: str = Field(description="Original filename from upload")
    safe_filename: str = Field(description="Safe filename used for storage")
    size: int = Field(description="File size in bytes")
    content_type: str = Field(default="application/octet-stream")
    pinned: bool = Field(default=True, description="Whether file is pinned on IPFS")
    deleted_at: Optional[datetime] = Field(
        default=None,
        description="Soft delete timestamp"
    )
    
    def soft_delete(self) -> None:
        """Mark file as deleted without removing from database."""
        self.deleted_at = datetime.utcnow()
```

### 3. Create Validator Tests
Create `backend/tests/backend/test_file_validators.py`:

```python
"""Tests for file validation."""

import unittest

from core.common.exceptions import ValidationError
from core.files.validators import (
    validate_filename,
    validate_file_size,
    validate_mime_type,
    generate_safe_filename,
    sanitize_filename,
)


class TestFileValidators(unittest.TestCase):
    """Test file validation functions."""
    
    def test_validate_filename_valid(self):
        """Valid filenames should not raise."""
        validate_filename("document.pdf")
        validate_filename("test_file_123.txt")
        validate_filename("my-file.docx")
    
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
    
    def test_validate_filename_empty(self):
        """Should reject empty filenames."""
        with self.assertRaises(ValidationError):
            validate_filename("")
    
    def test_validate_file_size_valid(self):
        """Valid sizes should not raise."""
        validate_file_size(1024)
        validate_file_size(1024 * 1024)
        validate_file_size(100 * 1024 * 1024)
    
    def test_validate_file_size_empty(self):
        """Should reject empty files."""
        with self.assertRaises(ValidationError):
            validate_file_size(0)
    
    def test_validate_file_size_too_large(self):
        """Should reject oversized files."""
        with self.assertRaises(ValidationError):
            validate_file_size(101 * 1024 * 1024)
    
    def test_validate_mime_type_valid(self):
        """Valid MIME types should not raise."""
        validate_mime_type("text/plain")
        validate_mime_type("application/pdf")
        validate_mime_type("image/jpeg")
    
    def test_validate_mime_type_with_charset(self):
        """Should handle MIME types with parameters."""
        validate_mime_type("text/plain; charset=utf-8")
    
    def test_validate_mime_type_invalid(self):
        """Should reject non-whitelisted MIME types."""
        with self.assertRaises(ValidationError):
            validate_mime_type("application/x-executable")
    
    def test_generate_safe_filename(self):
        """Should generate UUID-prefixed filename."""
        safe_name = generate_safe_filename("document.pdf")
        
        self.assertTrue(safe_name.endswith(".pdf"))
        self.assertIn("_", safe_name)
        self.assertNotIn(" ", safe_name)
    
    def test_sanitize_filename(self):
        """Should remove dangerous characters."""
        self.assertEqual(
            sanitize_filename("../file.txt"),
            "file.txt"
        )
        self.assertEqual(
            sanitize_filename("file\\..\\test.txt"),
            "file_test.txt"
        )


if __name__ == "__main__":
    unittest.main()
```

## Acceptance Criteria
- [ ] `validate_filename()` prevents path traversal and null bytes
- [ ] `validate_file_size()` enforces min (> 0) and max (100MB) limits
- [ ] `validate_mime_type()` checks whitelist
- [ ] `generate_safe_filename()` creates UUID-prefixed names
- [ ] `sanitize_filename()` removes dangerous characters
- [ ] File model is created with proper fields
- [ ] All validator tests pass
- [ ] Filenames > 255 chars are rejected
- [ ] Empty files are rejected
- [ ] MIME types with parameters are handled correctly
- [ ] Exceptions are raised with clear error messages

## Notes
- ALLOWED_MIME_TYPES should be customizable per environment
- UUID prefix prevents filename collision
- Validation should happen before any file operations
- Sanitization is defensive layer (validation is primary)
- File model should reference User model via foreign key

## Completion Status
- [x] 100% - Completed

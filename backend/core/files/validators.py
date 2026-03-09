"""File validation utilities for IPFS gateway uploads."""

import os
import uuid
import logging
from pathlib import Path
from typing import Optional, Set

from core.common.exceptions import ValidationError

logger = logging.getLogger(__name__)

# Allowed MIME types (update as needed)
ALLOWED_MIME_TYPES = {
    "text/plain",
    "application/pdf",
    "application/json",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/zip",
    "application/x-tar",
    "application/gzip",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}

# Maximum file size (100MB)
MAX_FILE_SIZE = 100 * 1024 * 1024

# Minimum file size (> 0 bytes)
MIN_FILE_SIZE = 1

# Dangerous filename patterns that indicate path traversal
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
                f"Filename contains dangerous pattern: '{pattern}'"
            )
    
    # Check for null bytes
    if "\x00" in filename:
        raise ValidationError("Filename contains null bytes")
    
    # Verify path safety
    try:
        # Ensure the filename doesn't contain absolute paths
        if filename.startswith("/") or filename.startswith("~"):
            raise ValidationError("Filename cannot be an absolute path")
        
        # Prevent directory traversal by checking resolved path
        safe_path = Path(filename).resolve()
        normalized = Path(filename)
        if ".." in normalized.parts:
            raise ValidationError("Filename contains path traversal attempts")
    except (ValueError, RuntimeError) as e:
        raise ValidationError(f"Invalid filename: {e}")


def validate_file_size(
    size: int,
    max_size: int = MAX_FILE_SIZE,
    min_size: int = MIN_FILE_SIZE
) -> None:
    """Validate file size.
    
    Args:
        size: File size in bytes.
        max_size: Maximum allowed size in bytes. Defaults to 100MB.
        min_size: Minimum allowed size in bytes. Defaults to 1 byte.
        
    Raises:
        ValidationError: If file size is invalid.
    """
    if not isinstance(size, int) or size < 0:
        raise ValidationError("File size must be a positive integer")
    
    if size < min_size:
        raise ValidationError("Cannot upload empty files (size must be > 0 bytes)")
    
    if size > max_size:
        max_mb = max_size / (1024 * 1024)
        raise ValidationError(
            f"File size ({size} bytes) exceeds maximum limit ({max_mb:.0f}MB)"
        )


def validate_mime_type(
    mime_type: str,
    allowed_types: Optional[Set[str]] = None
) -> None:
    """Validate MIME type against whitelist.
    
    Args:
        mime_type: The MIME type to validate.
        allowed_types: Set of allowed MIME types. 
                      Defaults to ALLOWED_MIME_TYPES.
        
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
            f"MIME type '{base_mime_type}' is not allowed"
        )


def generate_safe_filename(original_filename: str) -> str:
    """Generate a safe filename with UUID prefix.
    
    Prevents filename collisions and ensures safety by:
    1. Validating the original filename
    2. Extracting file extension
    3. Generating UUID prefix
    4. Combining into safe filename
    
    Args:
        original_filename: The original filename from request.
        
    Returns:
        str: Safe filename with UUID prefix (e.g., "550e8400_document.pdf")
        
    Raises:
        ValidationError: If original filename is invalid.
    """
    # Validate first
    validate_filename(original_filename)
    
    # Preserve multi-part suffixes (for example, .tar.gz)
    ext = "".join(Path(original_filename).suffixes)
    
    # Ensure extension is safe
    if ext and len(ext) > 10:
        ext = ext[:10]  # Limit extension length
    
    # Generate UUID prefix (remove hyphens for cleaner filenames)
    uuid_prefix = str(uuid.uuid4()).replace("-", "")[:12]
    
    # Create safe filename
    safe_filename = f"{uuid_prefix}{ext}" if ext else f"{uuid_prefix}.bin"
    
    logger.info(
        f"Generated safe filename: {original_filename} → {safe_filename}"
    )
    
    return safe_filename


def sanitize_filename(filename: str) -> str:
    """Sanitize filename by removing/replacing dangerous characters.
    
    This is a defensive layer that cleans up filenames even if they
    pass validation. It removes special characters that could be
    problematic in file systems.
    
    Args:
        filename: The filename to sanitize.
        
    Returns:
        str: Sanitized filename safe for file systems.
    """
    sanitized = filename
    
    # Remove dangerous characters
    for pattern in DANGEROUS_PATTERNS:
        sanitized = sanitized.replace(pattern, "_")
    
    # Replace multiple underscores with single
    while "__" in sanitized:
        sanitized = sanitized.replace("__", "_")
    
    # Remove leading/trailing dots and underscores
    sanitized = sanitized.strip("._")
    
    # Keep only safe characters
    safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-"
    sanitized = "".join(c if c in safe_chars else "_" for c in sanitized)
    
    # Clean up any leftover underscores
    while "__" in sanitized:
        sanitized = sanitized.replace("__", "_")
    
    return sanitized.strip("._") or "file"

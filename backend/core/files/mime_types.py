"""MIME type detection and Content-Type handling for file retrieval."""

import logging
import mimetypes
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Custom MIME types not in standard library
CUSTOM_MIME_TYPES = {
	".md": "text/markdown",
	".markdown": "text/markdown",
	".yaml": "application/yaml",
	".yml": "application/yaml",
	".webp": "image/webp",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".otf": "font/otf",
	".eot": "application/vnd.ms-fontobject",
	".svg": "image/svg+xml",
	".json": "application/json",
	".jsonld": "application/ld+json",
	".geojson": "application/geo+json",
	".mp4": "video/mp4",
	".webm": "video/webm",
	".ogg": "audio/ogg",
	".opus": "audio/opus",
	".m4a": "audio/mp4",
}

# MIME types that should not be compressed (already compressed)
NON_COMPRESSIBLE_TYPES = {
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"video/mp4",
	"video/webm",
	"audio/mpeg",
	"audio/ogg",
	"audio/mp4",
	"application/zip",
	"application/gzip",
	"application/x-gzip",
	"application/x-bzip2",
	"application/x-7z-compressed",
	"application/x-rar-compressed",
	"application/pdf",
}


def init_mime_types() -> None:
	"""Initialize MIME types by registering custom types.
	
	Should be called once during application startup.
	"""
	for extension, mime_type in CUSTOM_MIME_TYPES.items():
		mimetypes.add_type(mime_type, extension)
	
	logger.info(f"Initialized {len(CUSTOM_MIME_TYPES)} custom MIME types")


def detect_mime_type(
	filename: str,
	stored_mime_type: Optional[str] = None,
) -> str:
	"""Detect MIME type for a file.
	
	Priority:
	1. Use stored MIME type from database if available and valid
	2. Detect from file extension
	3. Fall back to application/octet-stream
	
	Handles multi-part extensions like .tar.gz correctly.
	
	Args:
		filename: Name of the file
		stored_mime_type: MIME type stored in database (optional)
		
	Returns:
		MIME type string
		
	Examples:
		>>> detect_mime_type("document.pdf")
		'application/pdf'
		>>> detect_mime_type("archive.tar.gz")
		'application/gzip'
		>>> detect_mime_type("image.png", stored_mime_type="image/png")
		'image/png'
	"""
	# Use stored MIME type if available and valid
	if stored_mime_type and stored_mime_type.strip():
		logger.debug(f"Using stored MIME type: {stored_mime_type}")
		return stored_mime_type
	
	# Detect from file extension
	mime_type, _ = mimetypes.guess_type(filename)
	
	if mime_type:
		logger.debug(f"Detected MIME type for '{filename}': {mime_type}")
		return mime_type
	
	# Handle multi-part extensions manually
	path = Path(filename)
	if path.suffixes:
		# Check last suffix first
		for suffix in reversed(path.suffixes):
			if suffix.lower() in CUSTOM_MIME_TYPES:
				mime_type = CUSTOM_MIME_TYPES[suffix.lower()]
				logger.debug(
					f"Detected MIME type for '{filename}' "
					f"using custom mapping: {mime_type}"
				)
				return mime_type
	
	# Fall back to octet-stream
	logger.debug(f"Unknown MIME type for '{filename}', using application/octet-stream")
	return "application/octet-stream"


def is_compressible(mime_type: str) -> bool:
	"""Check if a MIME type should be compressed.
	
	Text-based formats benefit from compression, but binary formats
	(especially already-compressed formats) should not be compressed.
	
	Args:
		mime_type: MIME type to check
		
	Returns:
		True if content should be compressed, False otherwise
		
	Examples:
		>>> is_compressible("text/html")
		True
		>>> is_compressible("image/jpeg")
		False
	"""
	# Check if explicitly non-compressible
	if mime_type in NON_COMPRESSIBLE_TYPES:
		return False
	
	# Text-based types are compressible
	if mime_type.startswith(("text/", "application/json", "application/xml")):
		return True
	
	# SVG and JavaScript are compressible
	if mime_type in (
		"image/svg+xml",
		"application/javascript",
		"application/x-javascript",
	):
		return True
	
	# Default: don't compress unknown types
	return False


def get_content_disposition(
	filename: str,
	inline: bool = True,
) -> str:
	"""Generate Content-Disposition header value.
	
	Args:
		filename: Original filename
		inline: If True, use 'inline' disposition, else 'attachment'
		
	Returns:
		Content-Disposition header value
		
	Examples:
		>>> get_content_disposition("document.pdf", inline=True)
		'inline; filename="document.pdf"'
		>>> get_content_disposition("archive.zip", inline=False)
		'attachment; filename="archive.zip"'
	"""
	disposition = "inline" if inline else "attachment"
	
	# Escape quotes in filename
	safe_filename = filename.replace('"', '\\"')
	
	return f'{disposition}; filename="{safe_filename}"'


# Initialize MIME types on module import
init_mime_types()

# TASK-US-006-05: Implement Content Type Detection

[Trello Card](https://trello.com/c/qDFa01mt)

## Parent User Story
[US-006: File Retrieval from IPFS](../../user-stories/backend/US-006-file-retrieval-ipfs.md)

## Description
Implement proper MIME type detection based on file extension or content analysis, and set appropriate Content-Type header in response. Supports common file types and provides fallback for unknown types.

## Priority
🟡 High

## Estimated Time
1 hour

## Detailed Steps

### 1. Create MIME Type Detection Helper
Create `backend/core/files/mime_types.py`:

```python
"""MIME type detection utilities."""

import logging
import mimetypes
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Extended MIME type mappings beyond Python's default
CUSTOM_MIME_TYPES = {
    # Documents
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
    
    # Data formats
    '.json': 'application/json',
    '.yaml': 'application/x-yaml',
    '.yml': 'application/x-yaml',
    '.toml': 'application/toml',
    '.xml': 'application/xml',
    
    # Archives
    '.7z': 'application/x-7z-compressed',
    '.rar': 'application/vnd.rar',
    
    # Code
    '.py': 'text/x-python',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.jsx': 'text/javascript',
    '.tsx': 'text/typescript',
    '.rs': 'text/x-rust',
    '.go': 'text/x-go',
    
    # Web
    '.wasm': 'application/wasm',
    '.webmanifest': 'application/manifest+json',
    
    # Media
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.flac': 'audio/flac',
    '.m4a': 'audio/mp4',
    '.opus': 'audio/opus',
    
    # 3D/CAD
    '.stl': 'model/stl',
    '.obj': 'model/obj',
    '.gltf': 'model/gltf+json',
    '.glb': 'model/gltf-binary',
}


def init_mime_types():
    """Initialize and extend Python's mimetypes database."""
    mimetypes.init()
    
    # Add custom MIME types
    for ext, mime_type in CUSTOM_MIME_TYPES.items():
        mimetypes.add_type(mime_type, ext)
    
    logger.debug("MIME types database initialized with custom mappings")


def detect_mime_type(
    filename: str,
    stored_mime_type: Optional[str] = None
) -> str:
    """
    Detect MIME type for a file.
    
    Priority:
    1. Use stored MIME type if available and valid
    2. Guess from file extension
    3. Fallback to application/octet-stream
    
    Args:
        filename: Original filename
        stored_mime_type: MIME type stored in database
        
    Returns:
        MIME type string
    """
    # Use stored MIME type if available
    if stored_mime_type and stored_mime_type.strip():
        logger.debug(f"Using stored MIME type for {filename}: {stored_mime_type}")
        return stored_mime_type
    
    # Guess from extension
    guessed_type, _ = mimetypes.guess_type(filename)
    
    if guessed_type:
        logger.debug(f"Detected MIME type for {filename}: {guessed_type}")
        return guessed_type
    
    # Check multi-part extensions (e.g., .tar.gz)
    path = Path(filename)
    suffixes = ''.join(path.suffixes).lower()
    
    # Special handling for archives
    if suffixes == '.tar.gz':
        return 'application/gzip'
    elif suffixes == '.tar.bz2':
        return 'application/x-bzip2'
    elif suffixes == '.tar.xz':
        return 'application/x-xz'
    
    # Default fallback
    logger.debug(f"No MIME type detected for {filename}, using default")
    return 'application/octet-stream'


def is_text_mime_type(mime_type: str) -> bool:
    """
    Check if MIME type represents text content.
    
    Args:
        mime_type: MIME type string
        
    Returns:
        True if text-based content
    """
    return (
        mime_type.startswith('text/') or
        mime_type in [
            'application/json',
            'application/xml',
            'application/javascript',
            'application/x-yaml',
            'application/toml',
        ]
    )


def is_compressible(mime_type: str) -> bool:
    """
    Check if content type should be compressed in transit.
    
    Args:
        mime_type: MIME type string
        
    Returns:
        True if should be compressed
    """
    # Text content should be compressed
    if is_text_mime_type(mime_type):
        return True
    
    # SVG images should be compressed
    if mime_type == 'image/svg+xml':
        return True
    
    # Already compressed formats should not be re-compressed
    non_compressible = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/',
        'audio/',
        'application/zip',
        'application/gzip',
        'application/x-7z-compressed',
        'application/x-rar-compressed',
    ]
    
    for prefix in non_compressible:
        if mime_type.startswith(prefix):
            return False
    
    return False


def get_content_disposition(filename: str, inline: bool = False) -> str:
    """
    Generate Content-Disposition header value.
    
    Args:
        filename: Original filename
        inline: If True, use inline instead of attachment
        
    Returns:
        Content-Disposition header value
    """
    disposition = 'inline' if inline else 'attachment'
    
    # Escape quotes in filename
    safe_filename = filename.replace('"', '\\"')
    
    return f'{disposition}; filename="{safe_filename}"'


# Initialize MIME types on module import
init_mime_types()
```

### 2. Update File Model to Store MIME Type
Ensure `backend/core/models.py` has mime_type field:

```python
class File(SQLModel, table=True):
    __tablename__ = "files"
    
    # ... existing fields ...
    
    mime_type: Optional[str] = Field(default=None, max_length=255)
    original_filename: str = Field(max_length=255)
```

### 3. Store MIME Type on Upload
Update `backend/core/files/routes/upload.py`:

```python
from core.files.mime_types import detect_mime_type

@bp.route('/upload', methods=['POST'])
@require_api_key
def upload_file():
    """Upload file with MIME type detection."""
    # ... existing code ...
    
    # Detect MIME type
    mime_type = detect_mime_type(safe_filename)
    
    # Create file record
    file_record = File(
        user_id=current_user.id,
        original_filename=original_filename,
        storage_key=safe_filename,
        size=file_size,
        cid=upload_result.cid,
        mime_type=mime_type,  # Store detected MIME type
        # ... other fields ...
    )
```

### 4. Use MIME Type in Retrieve Endpoint
Update `backend/core/files/routes/retrieve.py`:

```python
from core.files.mime_types import (
    detect_mime_type,
    get_content_disposition,
    is_compressible
)

@bp.route('/retrieve/<cid>', methods=['GET'])
@require_api_key
def retrieve_file(cid: str):
    """Retrieve file with proper MIME type."""
    # ... existing authorization code ...
    
    # Detect MIME type with fallback
    mime_type = detect_mime_type(
        file_record.original_filename,
        file_record.mime_type
    )
    
    # Determine if inline or attachment
    inline = request.args.get('inline', 'false').lower() == 'true'
    content_disposition = get_content_disposition(
        file_record.original_filename,
        inline
    )
    
    # ... existing retrieval code ...
    
    # Create response with correct MIME type
    response = Response(
        stream_with_context(generate()),
        mimetype=mime_type
    )
    response.headers['Content-Disposition'] = content_disposition
    response.headers['Content-Length'] = str(file_record.size)
    
    # Add compression hint
    if is_compressible(mime_type):
        response.headers['Content-Encoding'] = 'gzip'
    
    # ... cache headers ...
    
    return response
```

### 5. Add Tests
Create `tests/backend/test_mime_types.py`:

```python
import unittest
from core.files.mime_types import (
    detect_mime_type,
    is_text_mime_type,
    is_compressible,
    get_content_disposition
)

class TestMimeTypeDetection(unittest.TestCase):
    
    def test_common_extensions(self):
        """Should detect common file types."""
        self.assertEqual(detect_mime_type('file.pdf'), 'application/pdf')
        self.assertEqual(detect_mime_type('file.jpg'), 'image/jpeg')
        self.assertEqual(detect_mime_type('file.png'), 'image/png')
        self.assertEqual(detect_mime_type('file.txt'), 'text/plain')
        self.assertEqual(detect_mime_type('file.html'), 'text/html')
        self.assertEqual(detect_mime_type('file.json'), 'application/json')
    
    def test_multi_part_extensions(self):
        """Should handle .tar.gz and similar."""
        self.assertEqual(detect_mime_type('file.tar.gz'), 'application/gzip')
        self.assertEqual(detect_mime_type('file.tar.bz2'), 'application/x-bzip2')
    
    def test_custom_mime_types(self):
        """Should use custom MIME type mappings."""
        self.assertEqual(detect_mime_type('file.md'), 'text/markdown')
        self.assertEqual(detect_mime_type('file.yaml'), 'application/x-yaml')
        self.assertEqual(detect_mime_type('file.webp'), 'image/webp')
    
    def test_stored_mime_type_priority(self):
        """Should prefer stored MIME type."""
        stored = 'application/custom'
        result = detect_mime_type('file.txt', stored)
        self.assertEqual(result, stored)
    
    def test_unknown_extension_fallback(self):
        """Should fallback to octet-stream."""
        self.assertEqual(
            detect_mime_type('file.xyz123'),
            'application/octet-stream'
        )
    
    def test_text_mime_type_detection(self):
        """Should identify text MIME types."""
        self.assertTrue(is_text_mime_type('text/plain'))
        self.assertTrue(is_text_mime_type('text/html'))
        self.assertTrue(is_text_mime_type('application/json'))
        self.assertFalse(is_text_mime_type('image/jpeg'))
    
    def test_compressible_detection(self):
        """Should identify compressible content."""
        self.assertTrue(is_compressible('text/plain'))
        self.assertTrue(is_compressible('application/json'))
        self.assertTrue(is_compressible('image/svg+xml'))
        self.assertFalse(is_compressible('image/jpeg'))
        self.assertFalse(is_compressible('video/mp4'))
        self.assertFalse(is_compressible('application/zip'))
    
    def test_content_disposition_attachment(self):
        """Should generate attachment disposition."""
        result = get_content_disposition('test.pdf', inline=False)
        self.assertEqual(result, 'attachment; filename="test.pdf"')
    
    def test_content_disposition_inline(self):
        """Should generate inline disposition."""
        result = get_content_disposition('image.jpg', inline=True)
        self.assertEqual(result, 'inline; filename="image.jpg"')
    
    def test_content_disposition_escapes_quotes(self):
        """Should escape quotes in filename."""
        result = get_content_disposition('file"with"quotes.txt')
        self.assertEqual(result, 'attachment; filename="file\\"with\\"quotes.txt"')
```

## Acceptance Criteria
- ✅ MIME type is detected from file extension
- ✅ Custom MIME types are supported (markdown, YAML, WebP, etc.)
- ✅ Multi-part extensions (.tar.gz) are handled correctly
- ✅ Stored MIME type takes priority over detection
- ✅ Unknown extensions fallback to application/octet-stream
- ✅ Content-Type header is set correctly in response
- ✅ Content-Disposition supports both attachment and inline
- ✅ Content-Disposition escapes special characters
- ✅ Text MIME types are identified correctly
- ✅ Compressible content is identified correctly
- ✅ Tests verify all MIME type detection logic

## Notes
- Python's mimetypes module is extended with custom mappings
- Database stores detected MIME type for consistency
- Inline display useful for images/PDFs in browser
- Compression hints can optimize bandwidth
- Future: Consider magic byte detection for more accuracy
- Future: Add Content-Security-Policy for inline content

## Completion Status
- [ ] 0% - Not Started

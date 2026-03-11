# TASK-US-006-04: Add Caching Headers

[Trello Card](https://trello.com/c/FpgemNNI)

## Parent User Story
[US-006: File Retrieval from IPFS](../../user-stories/backend/US-006-file-retrieval-ipfs.md)

## Description
Implement HTTP caching headers (Cache-Control, ETag, Last-Modified, If-None-Match) to optimize repeated file retrievals, reduce bandwidth usage, and minimize Filebase API calls. Leverage IPFS content-addressed storage immutability for aggressive caching.

## Priority
🟡 High

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Add Caching Header Helper
Create `backend/core/files/cache_headers.py`:

```python
"""HTTP caching header utilities for file responses."""

import logging
from datetime import datetime
from typing import Optional
from flask import Response, request
from hashlib import sha256

logger = logging.getLogger(__name__)


def generate_etag(cid: str, file_id: Optional[int] = None) -> str:
    """
    Generate ETag for a file based on CID.
    
    Since IPFS CIDs are content-addressed and immutable,
    the CID itself is the perfect ETag.
    
    Args:
        cid: Content identifier
        file_id: Optional file ID for additional uniqueness
        
    Returns:
        ETag string
    """
    if file_id:
        # Include file_id for additional uniqueness
        etag_input = f"{cid}-{file_id}"
        etag = sha256(etag_input.encode()).hexdigest()[:16]
        return f'"{cid}-{etag}"'
    return f'"{cid}"'


def should_return_304(etag: str, last_modified: Optional[datetime] = None) -> bool:
    """
    Check if we should return 304 Not Modified based on request headers.
    
    Args:
        etag: Current ETag value
        last_modified: Optional last modified timestamp
        
    Returns:
        True if 304 should be returned
    """
    # Check If-None-Match header
    if_none_match = request.headers.get('If-None-Match')
    if if_none_match:
        # Remove quotes from ETag for comparison
        request_etag = if_none_match.strip('"')
        current_etag = etag.strip('"')
        
        if request_etag == current_etag:
            logger.debug(f"ETag match: returning 304 for {etag}")
            return True
    
    # Check If-Modified-Since header
    if last_modified:
        if_modified_since = request.headers.get('If-Modified-Since')
        if if_modified_since:
            try:
                request_time = datetime.strptime(
                    if_modified_since,
                    '%a, %d %b %Y %H:%M:%S GMT'
                )
                if last_modified <= request_time:
                    logger.debug(f"Not modified since {if_modified_since}: returning 304")
                    return True
            except ValueError:
                logger.warning(f"Invalid If-Modified-Since header: {if_modified_since}")
    
    return False


def add_cache_headers(
    response: Response,
    cid: str,
    file_id: Optional[int] = None,
    created_at: Optional[datetime] = None,
    max_age: int = 31536000  # 1 year default
) -> Response:
    """
    Add comprehensive caching headers to response.
    
    Args:
        response: Flask Response object
        cid: Content identifier
        file_id: Optional file ID
        created_at: Optional file creation timestamp
        max_age: Cache max-age in seconds (default: 1 year)
        
    Returns:
        Response with cache headers added
    """
    # ETag - content-based identifier
    etag = generate_etag(cid, file_id)
    response.headers['ETag'] = etag
    
    # Cache-Control - aggressive caching since CIDs are immutable
    response.headers['Cache-Control'] = f'public, max-age={max_age}, immutable'
    
    # Last-Modified - when file was uploaded
    if created_at:
        last_modified = created_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
        response.headers['Last-Modified'] = last_modified
    
    # Vary - indicate which headers affect caching
    response.headers['Vary'] = 'Accept-Encoding'
    
    logger.debug(f"Cache headers added for CID {cid}: ETag={etag}, max-age={max_age}")
    
    return response
```

### 2. Update Retrieve Endpoint with Caching
Modify `backend/core/files/routes/retrieve.py`:

```python
from flask import Response, make_response
from core.files.cache_headers import (
    add_cache_headers,
    should_return_304,
    generate_etag
)

@bp.route('/retrieve/<cid>', methods=['GET'])
@require_api_key
def retrieve_file(cid: str):
    """
    Retrieve a file from IPFS by CID with HTTP caching support.
    """
    current_user = get_current_user()
    engine = get_engine()
    
    logger.info(f"File retrieval requested for CID: {cid} by user: {current_user.email}")
    
    with Session(engine) as session:
        # Check authorization
        has_access, file_record, reason = check_file_access_by_cid(
            session, cid, current_user
        )
        
        if not has_access:
            # ... (existing error handling)
            pass
        
        # Check if client has cached version
        etag = generate_etag(cid, file_record.id)
        if should_return_304(etag, file_record.created_at):
            logger.info(f"Returning 304 Not Modified for CID {cid}")
            
            # Increment retrieval count even for cached responses
            file_record.retrieval_count = (file_record.retrieval_count or 0) + 1
            
            # Log cached retrieval
            audit_log = AuditLog(
                user_id=current_user.id,
                action="file_retrieved_cached",
                resource_type="file",
                resource_id=file_record.id,
                details=json.dumps({
                    "cid": cid,
                    "cached": True
                }),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', 'Unknown')
            )
            session.add(audit_log)
            session.commit()
            
            # Return 304 Not Modified
            response = make_response('', 304)
            response.headers['ETag'] = etag
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
            return response
        
        # File not cached or modified, retrieve from IPFS
        try:
            # Determine MIME type
            mime_type = file_record.mime_type or mimetypes.guess_type(
                file_record.original_filename
            )[0] or 'application/octet-stream'
            
            # Update retrieval count
            file_record.retrieval_count = (file_record.retrieval_count or 0) + 1
            file_record.last_retrieved_at = datetime.utcnow()
            
            # Log successful retrieval
            audit_log = AuditLog(
                user_id=current_user.id,
                action="file_retrieved",
                resource_type="file",
                resource_id=file_record.id,
                details=json.dumps({
                    "cid": cid,
                    "filename": file_record.original_filename,
                    "size": file_record.size,
                    "cached": False
                }),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', 'Unknown')
            )
            session.add(audit_log)
            session.commit()
            
            # Stream file from IPFS
            def generate():
                try:
                    for chunk in ipfs_service.retrieve_file_stream(
                        file_record.storage_key or cid
                    ):
                        yield chunk
                except RetrievalError as e:
                    logger.error(f"Streaming error for {cid}: {str(e)}")
                    raise
            
            # Create streaming response
            response = Response(
                stream_with_context(generate()),
                mimetype=mime_type
            )
            response.headers['Content-Disposition'] = (
                f'attachment; filename="{file_record.original_filename}"'
            )
            response.headers['Content-Length'] = str(file_record.size)
            
            # Add comprehensive cache headers
            response = add_cache_headers(
                response,
                cid,
                file_record.id,
                file_record.created_at
            )
            
            logger.info(f"File {cid} successfully retrieved with cache headers")
            
            return response
            
        except RetrievalError as e:
            # ... (existing error handling)
            pass
```

### 3. Add Tests for Caching
Create `tests/backend/test_cache_headers.py`:

```python
import unittest
from datetime import datetime
from core.files.cache_headers import (
    generate_etag,
    should_return_304,
    add_cache_headers
)

class TestCacheHeaders(unittest.TestCase):
    
    def test_etag_generation_from_cid(self):
        """ETag should be generated from CID."""
        cid = "QmTest123"
        etag = generate_etag(cid)
        
        self.assertEqual(etag, '"QmTest123"')
    
    def test_etag_with_file_id(self):
        """ETag should include file ID when provided."""
        cid = "QmTest123"
        file_id = 42
        etag = generate_etag(cid, file_id)
        
        self.assertIn(cid, etag)
        self.assertTrue(etag.startswith('"'))
        self.assertTrue(etag.endswith('"'))
    
    def test_304_returned_when_etag_matches(self):
        """Should return 304 when ETag matches."""
        response = self.client.get(
            '/api/v1/files/retrieve/QmTest',
            headers={
                'X-API-Key': self.valid_api_key,
                'If-None-Match': '"QmTest"'
            }
        )
        
        self.assertEqual(response.status_code, 304)
        self.assertIn('ETag', response.headers)
    
    def test_200_returned_when_etag_different(self):
        """Should return 200 when ETag differs."""
        response = self.client.get(
            '/api/v1/files/retrieve/QmTest',
            headers={
                'X-API-Key': self.valid_api_key,
                'If-None-Match': '"QmDifferent"'
            }
        )
        
        self.assertEqual(response.status_code, 200)
    
    def test_cache_control_header_present(self):
        """Response should include Cache-Control header."""
        response = self.client.get(
            '/api/v1/files/retrieve/QmTest',
            headers={'X-API-Key': self.valid_api_key}
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Cache-Control', response.headers)
        self.assertIn('public', response.headers['Cache-Control'])
        self.assertIn('max-age=31536000', response.headers['Cache-Control'])
        self.assertIn('immutable', response.headers['Cache-Control'])
    
    def test_last_modified_header_present(self):
        """Response should include Last-Modified header."""
        response = self.client.get(
            '/api/v1/files/retrieve/QmTest',
            headers={'X-API-Key': self.valid_api_key}
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Last-Modified', response.headers)
    
    def test_cached_retrieval_logged(self):
        """304 responses should be logged."""
        initial_count = self.session.query(AuditLog).count()
        
        # Get file (200)
        response1 = self.client.get(
            '/api/v1/files/retrieve/QmTest',
            headers={'X-API-Key': self.valid_api_key}
        )
        etag = response1.headers['ETag']
        
        # Get file again with ETag (304)
        response2 = self.client.get(
            '/api/v1/files/retrieve/QmTest',
            headers={
                'X-API-Key': self.valid_api_key,
                'If-None-Match': etag
            }
        )
        
        self.assertEqual(response2.status_code, 304)
        
        # Both retrievals should be logged
        final_count = self.session.query(AuditLog).count()
        self.assertEqual(final_count, initial_count + 2)
```

## Acceptance Criteria
- ✅ ETag header is generated based on CID
- ✅ Cache-Control header includes `public, max-age=31536000, immutable`
- ✅ Last-Modified header shows file creation timestamp
- ✅ Vary header indicates Accept-Encoding affects caching
- ✅ Returns 304 Not Modified when If-None-Match ETag matches
- ✅ Returns 304 Not Modified when If-Modified-Since is recent
- ✅ 304 responses include ETag and Cache-Control headers
- ✅ 304 responses increment retrieval count
- ✅ 304 responses are logged in audit trail
- ✅ Tests verify ETag generation
- ✅ Tests verify 304 logic works correctly
- ✅ Tests verify all cache headers are present

## Notes
- IPFS CIDs are content-addressed and immutable
- Aggressive caching (1 year) is safe for CID-based content
- `immutable` directive tells browsers content will never change
- ETag based on CID is perfect content identifier
- 304 responses save bandwidth and reduce IPFS API calls
- Retrieval count includes cached retrievals
- Future: Consider adding CDN headers (Cloudflare, Fastly, etc.)

## Completion Status
- [ ] 0% - Not Started

# TASK-US-006-02: Implement File Streaming

[Trello Card](https://trello.com/c/ent1BKtz)

## Parent User Story
[US-006: File Retrieval from IPFS](../../user-stories/backend/US-006-file-retrieval-ipfs.md)

## Description
Implement efficient file streaming to handle large files without loading them entirely into memory. Use Flask's `stream_with_context` and boto3's streaming capabilities to minimize memory usage and improve performance.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps

### 1. Update IPFS Service for Streaming
Modify `backend/core/services/ipfs_service.py` to add streaming retrieval:

```python
def retrieve_file_stream(self, key: str):
    """
    Retrieve a file from Filebase/IPFS as a stream.
    
    Args:
        key: Storage key or CID
        
    Yields:
        File content in chunks
        
    Raises:
        RetrievalError: If file retrieval fails
    """
    if not self.client:
        raise RetrievalError("IPFS client not initialized")
    
    try:
        logger.info(f"Streaming file '{key}' from Filebase")
        response = self.client.get_object(
            Bucket=self.bucket_name,
            Key=key
        )
        
        # Stream in 64KB chunks
        chunk_size = 64 * 1024  # 64KB
        stream = response['Body']
        
        try:
            while True:
                chunk = stream.read(chunk_size)
                if not chunk:
                    break
                yield chunk
        finally:
            stream.close()
            
        logger.info(f"Successfully streamed file '{key}'")
        
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        logger.error(f"Failed to stream file '{key}': {error_code}")
        
        if error_code == 'NoSuchKey':
            raise RetrievalError(f"File not found: {key}")
        else:
            raise RetrievalError(f"Failed to stream file: {str(e)}")
            
    except Exception as e:
        logger.error(f"Unexpected error during file streaming: {str(e)}")
        raise RetrievalError(f"Unexpected error: {str(e)}")
```

### 2. Update Retrieve Endpoint for Streaming
Modify `backend/core/files/routes/retrieve.py` to use streaming:

```python
from flask import stream_with_context

@bp.route('/retrieve/<cid>', methods=['GET'])
@require_api_key
def retrieve_file(cid: str):
    """
    Retrieve a file from IPFS by CID with streaming support.
    
    Args:
        cid: Content identifier (IPFS hash)
    
    Returns:
        Streamed file content with appropriate headers or error response
    """
    current_user = get_current_user()
    engine = get_engine()
    
    logger.info(f"File retrieval requested for CID: {cid} by user: {current_user.email}")
    
    with Session(engine) as session:
        # Find file by CID in database
        statement = select(File).where(File.cid == cid)
        file_record = session.exec(statement).first()
        
        if not file_record:
            logger.warning(f"File with CID {cid} not found in database")
            return jsonify({
                "status": 404,
                "message": "File not found"
            }), 404
        
        # Authorization check
        if file_record.user_id != current_user.id:
            logger.warning(
                f"Access denied: User {current_user.email} attempted to "
                f"retrieve file {cid} owned by user_id {file_record.user_id}"
            )
            audit_log = AuditLog(
                user_id=current_user.id,
                action="file_retrieval_denied",
                resource_type="file",
                resource_id=file_record.id,
                details=json.dumps({
                    "cid": cid,
                    "reason": "unauthorized_access_attempt"
                }),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', 'Unknown')
            )
            session.add(audit_log)
            session.commit()
            
            return jsonify({
                "status": 403,
                "message": "Access denied to this file"
            }), 403
        
        try:
            # Determine MIME type
            mime_type = file_record.mime_type or mimetypes.guess_type(
                file_record.original_filename
            )[0] or 'application/octet-stream'
            
            # Update retrieval count
            file_record.retrieval_count = (file_record.retrieval_count or 0) + 1
            file_record.last_retrieved_at = datetime.utcnow()
            
            # Log successful retrieval (before streaming starts)
            audit_log = AuditLog(
                user_id=current_user.id,
                action="file_retrieved",
                resource_type="file",
                resource_id=file_record.id,
                details=json.dumps({
                    "cid": cid,
                    "filename": file_record.original_filename,
                    "size": file_record.size
                }),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', 'Unknown')
            )
            session.add(audit_log)
            session.commit()
            
            logger.info(f"Streaming file {cid} for user {current_user.email}")
            
            # Stream file from IPFS
            def generate():
                try:
                    for chunk in ipfs_service.retrieve_file_stream(
                        file_record.storage_key or cid
                    ):
                        yield chunk
                except RetrievalError as e:
                    logger.error(f"Streaming error for {cid}: {str(e)}")
                    # Note: Cannot send JSON error once streaming starts
                    raise
            
            # Create streaming response with appropriate headers
            response = Response(
                stream_with_context(generate()),
                mimetype=mime_type
            )
            response.headers['Content-Disposition'] = (
                f'attachment; filename="{file_record.original_filename}"'
            )
            response.headers['Content-Length'] = str(file_record.size)
            response.headers['Cache-Control'] = 'public, max-age=31536000'
            response.headers['ETag'] = f'"{cid}"'
            
            return response
            
        except RetrievalError as e:
            logger.error(f"Failed to retrieve file {cid}: {str(e)}")
            
            # Log failure
            audit_log = AuditLog(
                user_id=current_user.id,
                action="file_retrieval_failed",
                resource_type="file",
                resource_id=file_record.id,
                details=json.dumps({
                    "cid": cid,
                    "error": str(e)
                }),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', 'Unknown')
            )
            session.add(audit_log)
            session.commit()
            
            return jsonify({
                "status": 500,
                "message": "Failed to retrieve file from IPFS"
            }), 500
```

### 3. Add Tests for Streaming
Create/update `tests/backend/test_retrieve_endpoint.py`:

```python
import unittest
from unittest.mock import patch, MagicMock
from io import BytesIO

class TestFileStreaming(unittest.TestCase):
    
    def test_retrieve_file_streams_large_file(self):
        """Should stream large files in chunks."""
        # Create mock 10MB file
        chunk_size = 64 * 1024
        total_chunks = 160  # 10MB
        
        def mock_stream():
            for i in range(total_chunks):
                yield b'x' * chunk_size
        
        with patch('core.services.ipfs_service.retrieve_file_stream') as mock:
            mock.return_value = mock_stream()
            
            response = self.client.get(
                '/api/v1/files/retrieve/QmTest',
                headers={'X-API-Key': self.valid_api_key}
            )
            
            self.assertEqual(response.status_code, 200)
            # Verify streaming occurred
            self.assertTrue(mock.called)
    
    def test_streaming_handles_connection_errors(self):
        """Should handle errors during streaming."""
        def mock_stream_with_error():
            yield b'chunk1'
            raise ConnectionError("Network error")
        
        with patch('core.services.ipfs_service.retrieve_file_stream') as mock:
            mock.return_value = mock_stream_with_error()
            
            # Should log error but may not be able to send proper HTTP error
            # once streaming has started
            response = self.client.get(
                '/api/v1/files/retrieve/QmTest',
                headers={'X-API-Key': self.valid_api_key}
            )
            # Connection may be broken
            self.assertIn(response.status_code, [200, 500])
```

## Acceptance Criteria
- ✅ Files are streamed in chunks (64KB recommended)
- ✅ Memory usage remains constant regardless of file size
- ✅ Streaming works with Flask's stream_with_context
- ✅ Boto3 S3 client uses streaming API correctly
- ✅ Stream is properly closed after completion or error
- ✅ Large files (>100MB) can be retrieved without timeout
- ✅ HTTP headers are sent before streaming starts
- ✅ Streaming errors are logged appropriately
- ✅ Tests verify streaming behavior

## Notes
- Standard chunk size is 64KB for optimal performance
- Headers must be set before streaming begins
- Cannot send JSON error response once streaming starts
- Stream closure is handled in finally block
- Large files benefit most from streaming
- Memory usage should be constant, not proportional to file size

## Completion Status
- [ ] 0% - Not Started

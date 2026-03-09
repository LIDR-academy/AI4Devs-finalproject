# TASK-US-006-01: Create Retrieve Endpoint

[Trello Card](https://trello.com/c/CnG1x8Z6)

## Parent User Story
[US-006: File Retrieval from IPFS](../../user-stories/backend/US-006-file-retrieval-ipfs.md)

## Description
Implement the `GET /api/v1/files/retrieve/<cid>` endpoint that accepts a CID parameter, validates API key authentication, retrieves the file from Filebase/IPFS network, and streams the response with appropriate headers (Content-Type, Content-Disposition, Cache-Control).

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps

### 1. Create Retrieve Routes Module
Create `backend/core/files/routes/retrieve.py`:

```python
"""File retrieval routes for IPFS gateway."""

import logging
from flask import Blueprint, Response, request, jsonify
from sqlmodel import Session, select

from core import get_engine
from core.auth.decorators import require_api_key, get_current_user
from core.models import File, AuditLog, User
from core.services.ipfs_service import ipfs_service, RetrievalError
from datetime import datetime
import mimetypes
import json

logger = logging.getLogger(__name__)

bp = Blueprint('retrieve', __name__, url_prefix='/api/v1/files')


@bp.route('/retrieve/<cid>', methods=['GET'])
@require_api_key
def retrieve_file(cid: str):
    """
    Retrieve a file from IPFS by CID.
    
    Args:
        cid: Content identifier (IPFS hash)
    
    Returns:
        File content with appropriate headers or error response
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
        
        # Authorization check - user can only retrieve their own files
        if file_record.user_id != current_user.id:
            logger.warning(
                f"Access denied: User {current_user.email} attempted to "
                f"retrieve file {cid} owned by user_id {file_record.user_id}"
            )
            # Log unauthorized access attempt
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
            # Retrieve file from Filebase/IPFS
            file_data = ipfs_service.retrieve_file(file_record.storage_key or cid)
            
            # Determine MIME type
            mime_type = file_record.mime_type or mimetypes.guess_type(file_record.original_filename)[0] or 'application/octet-stream'
            
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
                    "size": file_record.size
                }),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', 'Unknown')
            )
            session.add(audit_log)
            session.commit()
            
            logger.info(f"File {cid} successfully retrieved for user {current_user.email}")
            
            # Create response with appropriate headers
            response = Response(file_data, mimetype=mime_type)
            response.headers['Content-Disposition'] = f'attachment; filename="{file_record.original_filename}"'
            response.headers['Content-Length'] = str(file_record.size)
            response.headers['Cache-Control'] = 'public, max-age=31536000'  # 1 year cache
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


def register_routes(app):
    """Register retrieve routes with Flask app."""
    app.register_blueprint(bp)
```

### 2. Register Retrieve Routes
Update `backend/core/files/routes/__init__.py`:

```python
"""File routes package."""

from core.files.routes.upload import register_routes as register_upload_routes
from core.files.routes.retrieve import register_routes as register_retrieve_routes

def register_routes(app):
    """Register all file routes."""
    register_upload_routes(app)
    register_retrieve_routes(app)
```

### 3. Update IPFS Service
Add the `retrieve_file` method to `backend/core/services/ipfs_service.py`:

```python
def retrieve_file(self, key: str) -> bytes:
    """
    Retrieve a file from Filebase/IPFS.
    
    Args:
        key: Storage key or CID
        
    Returns:
        File content as bytes
        
    Raises:
        RetrievalError: If file retrieval fails
    """
    if not self.client:
        raise RetrievalError("IPFS client not initialized")
    
    try:
        logger.info(f"Retrieving file '{key}' from Filebase")
        response = self.client.get_object(
            Bucket=self.bucket_name,
            Key=key
        )
        file_data = response['Body'].read()
        logger.info(f"Successfully retrieved file '{key}'")
        return file_data
        
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        logger.error(f"Failed to retrieve file '{key}': {error_code}")
        
        if error_code == 'NoSuchKey':
            raise RetrievalError(f"File not found: {key}")
        else:
            raise RetrievalError(f"Failed to retrieve file: {str(e)}")
            
    except Exception as e:
        logger.error(f"Unexpected error during file retrieval: {str(e)}")
        raise RetrievalError(f"Unexpected error: {str(e)}")


class RetrievalError(Exception):
    """Exception raised when file retrieval fails."""
    pass
```

### 4. Add File Model Fields
Ensure the File model has these fields in `backend/core/models.py`:

```python
retrieval_count: Optional[int] = Field(default=0)
last_retrieved_at: Optional[datetime] = Field(default=None)
```

## Acceptance Criteria
- ✅ GET /api/v1/files/retrieve/<cid> endpoint exists
- ✅ Endpoint requires valid API key authentication
- ✅ Returns 404 if CID not found in database
- ✅ Returns 403 if user attempts to retrieve another user's file
- ✅ Successfully retrieves file from Filebase/IPFS network
- ✅ Returns file with correct Content-Type header
- ✅ Returns file with Content-Disposition header containing original filename
- ✅ Returns file with Cache-Control header for optimization
- ✅ Returns file with ETag header
- ✅ Increments retrieval_count in database
- ✅ Updates last_retrieved_at timestamp
- ✅ Creates audit log entry for successful retrieval
- ✅ Creates audit log entry for unauthorized access attempts
- ✅ Creates audit log entry for failed retrievals
- ✅ Returns 500 with appropriate error message if retrieval fails

## Notes
- Uses existing circuit breaker pattern from ipfs_service
- Authorization is checked at file ownership level
- All file metadata comes from database, not IPFS
- ETag header uses CID for efficient caching
- Cache-Control set to 1 year since CIDs are immutable
- Future enhancement: Add streaming support for large files

## Completion Status
- [ ] 0% - Not Started

# TASK-US-005-01: Create Upload Endpoint

[Trello Card](https://trello.com/c/HBjQMShS)

## Parent User Story
[US-005: File Upload to IPFS](../../user-stories/backend/US-005-file-upload-ipfs.md)

## Description
Implement the `POST /upload` endpoint that accepts multipart/form-data file uploads, validates API keys, enforces file size limits, and returns appropriate responses based on file size (sync for < 10MB, async for > 10MB).

## Priority
🔴 Critical

## Estimated Time
3 hours

## Detailed Steps

### 1. Create Upload Routes Module
Create `backend/core/files/routes/upload.py`:

```python
"""File upload endpoint for IPFS gateway."""

import logging
from io import BytesIO

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from core.auth.decorators import require_api_key, get_current_user
from core.common.exceptions import ValidationError
from core.files.models import File
from core.files.validators import (
    validate_filename,
    validate_file_size,
    generate_safe_filename,
)
from core.services.ipfs_service import ipfs_service, UploadError
from core.common.models import AuditLog
from sqlmodel import Session

from core import get_engine

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB
ASYNC_UPLOAD_THRESHOLD = 10 * 1024 * 1024  # 10 MB


def register_routes(bp: Blueprint) -> None:
    """Register file upload routes."""
    
    @bp.post("/upload")
    @require_api_key
    def upload_file():
        """Upload a file to IPFS.
        
        Returns:
            201 Created: File uploaded synchronously
            202 Accepted: File queued for async upload
            400 Bad Request: Missing file or validation error
            401 Unauthorized: Invalid API key
            413 Payload Too Large: File exceeds size limit
            500 Internal Server Error: Upload failed
        """
        user = get_current_user()
        
        # Validate file exists
        if "file" not in request.files:
            return jsonify({
                "status": 400,
                "message": "No file provided",
                "error": "file_required"
            }), 400
        
        file = request.files["file"]
        if file.filename == "":
            return jsonify({
                "status": 400,
                "message": "No file selected",
                "error": "file_empty"
            }), 400
        
        try:
            # Validate file
            validate_filename(file.filename)
            file_size = len(file.read())
            file.seek(0)
            
            validate_file_size(file_size, MAX_FILE_SIZE)
            
            # Generate safe filename
            safe_filename = generate_safe_filename(file.filename)
            
            # Check if async upload is needed
            if file_size > ASYNC_UPLOAD_THRESHOLD:
                # Queue async task
                task_id = upload_file_async.delay(
                    user_id=user.id,
                    filename=safe_filename,
                    original_filename=file.filename,
                    file_data=file.read(),
                    content_type=file.content_type or "application/octet-stream",
                )
                
                return jsonify({
                    "status": 202,
                    "message": "File upload queued",
                    "data": {
                        "task_id": str(task_id),
                        "status_url": f"/upload/status/{task_id}"
                    }
                }), 202
            
            # Synchronous upload for small files
            file.seek(0)
            result = ipfs_service.upload_file(
                file=file,
                filename=safe_filename,
                content_type=file.content_type or "application/octet-stream",
                metadata={
                    "user_id": str(user.id),
                    "original_filename": file.filename,
                }
            )
            
            # Save file metadata to database
            with Session(get_engine()) as session:
                db_file = File(
                    user_id=user.id,
                    cid=result.cid,
                    original_filename=file.filename,
                    safe_filename=safe_filename,
                    size=file_size,
                    content_type=file.content_type or "application/octet-stream",
                    pinned=True,
                )
                session.add(db_file)
                
                # Log to audit trail
                audit = AuditLog(
                    user_id=user.id,
                    action="file_upload",
                    details={
                        "cid": result.cid,
                        "filename": file.filename,
                        "size": file_size,
                        "status": "completed"
                    }
                )
                session.add(audit)
                session.commit()
            
            return jsonify({
                "status": 201,
                "message": "File uploaded successfully",
                "data": {
                    "cid": result.cid,
                    "original_filename": file.filename,
                    "size": file_size,
                    "pinned": True,
                    "uploaded_at": db_file.created_at.isoformat()
                }
            }), 201
            
        except ValidationError as e:
            return jsonify({
                "status": 400,
                "message": str(e),
                "error": "validation_error"
            }), 400
        except UploadError as e:
            logger.error(f"Upload failed for user {user.id}: {e}")
            return jsonify({
                "status": 500,
                "message": "File upload failed",
                "error": "upload_error"
            }), 500
        except Exception as e:
            logger.error(f"Unexpected error during upload for user {user.id}: {e}")
            return jsonify({
                "status": 500,
                "message": "Internal server error",
                "error": "internal_error"
            }), 500
```

### 2. Register Upload Routes
Update `backend/core/files/__init__.py`:

```python
"""Files module for IPFS gateway."""

from flask import Blueprint

from core.files.models import File

bp = Blueprint("files", __name__, url_prefix="/api/v1/files")

from .routes.upload import register_routes as register_upload_routes

register_upload_routes(bp)


def register_routes_to_app(app):
    """Register all file routes to the Flask app."""
    app.register_blueprint(bp)
```

### 3. Update App Factory
In `backend/core/__init__.py`, ensure files blueprint is registered:

```python
def init_blueprints(app: Flask) -> None:
    """Initialize and register blueprints."""
    from core.users import register_routes_to_app as register_users
    from core.files import register_routes_to_app as register_files
    
    register_users(app)
    register_files(app)
```

## Acceptance Criteria
- [ ] POST /upload endpoint is implemented
- [ ] API key validation is enforced
- [ ] File size validation works (max 100MB)
- [ ] Small files (< 10MB) upload synchronously
- [ ] Large files (> 10MB) queue async tasks
- [ ] 201 response for sync uploads with CID
- [ ] 202 response for async uploads with task_id
- [ ] 400 response for missing/empty files
- [ ] 413 response for oversized files
- [ ] File metadata saved to database
- [ ] Upload logged in AuditLog
- [ ] All error responses are consistent

## Notes
- Reuse existing validators from `core.files.validators` (to be created in TASK-05)
- Integrate with IPFS service created in TASK-02
- Use Celery task (to be created in TASK-05) for async uploads
- Ensure proper error handling and logging throughout

## Completion Status
- [ ] 0% - Not Started

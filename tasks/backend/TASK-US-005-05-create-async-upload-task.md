# TASK-US-005-05: Create Async Upload Task

[Trello Card](https://trello.com/c/qnDAqyDW)

## Parent User Story
[US-005: File Upload to IPFS](../../user-stories/backend/US-005-file-upload-ipfs.md)

## Description
Implement Celery task for asynchronous file uploads. Files larger than 10MB should be queued and processed by background workers. Implement status tracking endpoint to monitor upload progress.

## Priority
🟠 High

## Estimated Time
3 hours

## Detailed Steps

### 1. Create Celery Task for File Upload
Create `backend/core/tasks/file_tasks.py`:

```python
"""Celery tasks for file operations."""

import logging
from typing import BinaryIO

from celery import shared_task
from sqlmodel import Session

from core import get_engine
from core.files.models import File
from core.common.models import AuditLog
from core.services.ipfs_service import ipfs_service, UploadError

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    track_started=True,
)
def upload_file_async(
    self,
    user_id: int,
    filename: str,
    original_filename: str,
    file_data: bytes,
    content_type: str = "application/octet-stream",
):
    """Asynchronously upload a file to IPFS.
    
    Args:
        user_id: User ID uploading the file
        filename: Safe filename for upload
        original_filename: Original filename from request
        file_data: File content as bytes
        content_type: MIME type of file
        
    Returns:
        dict: Upload result with cid and metadata
    """
    try:
        logger.info(f"Starting async upload for user {user_id}: {original_filename}")
        
        # Convert bytes to file-like object
        from io import BytesIO
        file_obj = BytesIO(file_data)
        
        # Upload to Filebase/IPFS
        result = ipfs_service.upload_file(
            file=file_obj,
            filename=filename,
            content_type=content_type,
            metadata={
                "user_id": str(user_id),
                "original_filename": original_filename,
            }
        )
        
        # Save file metadata to database
        with Session(get_engine()) as session:
            db_file = File(
                user_id=user_id,
                cid=result.cid,
                original_filename=original_filename,
                safe_filename=filename,
                size=result.size,
                content_type=content_type,
                pinned=True,
            )
            session.add(db_file)
            
            # Log to audit trail
            audit = AuditLog(
                user_id=user_id,
                action="file_upload",
                details={
                    "cid": result.cid,
                    "filename": original_filename,
                    "size": result.size,
                    "status": "completed",
                    "task_id": self.request.id,
                }
            )
            session.add(audit)
            session.commit()
            
            logger.info(
                f"Async upload completed for user {user_id}. "
                f"CID: {result.cid}, Size: {result.size}"
            )
            
            return {
                "status": "completed",
                "cid": result.cid,
                "filename": original_filename,
                "size": result.size,
                "file_id": db_file.id,
            }
    
    except UploadError as e:
        logger.error(f"Upload error for user {user_id}: {e}")
        
        # Retry with exponential backoff
        try:
            raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        except self.MaxRetriesExceededError:
            # Log final failure
            with Session(get_engine()) as session:
                audit = AuditLog(
                    user_id=user_id,
                    action="file_upload",
                    details={
                        "filename": original_filename,
                        "status": "failed",
                        "error": str(e),
                        "task_id": self.request.id,
                    }
                )
                session.add(audit)
                session.commit()
            
            return {
                "status": "failed",
                "filename": original_filename,
                "error": str(e),
            }
    
    except Exception as e:
        logger.error(f"Unexpected error during async upload for user {user_id}: {e}")
        
        with Session(get_engine()) as session:
            audit = AuditLog(
                user_id=user_id,
                action="file_upload",
                details={
                    "filename": original_filename,
                    "status": "failed",
                    "error": f"Unexpected error: {str(e)}",
                    "task_id": self.request.id,
                }
            )
            session.add(audit)
            session.commit()
        
        return {
            "status": "failed",
            "filename": original_filename,
            "error": "Unexpected error during upload",
        }
```

### 2. Create Upload Status Tracking
Add to `backend/core/files/routes/upload.py`:

```python
from core.tasks.file_tasks import upload_file_async
from celery.result import AsyncResult


@bp.get("/upload/status/<task_id>")
def upload_status(task_id: str):
    """Get status of async upload task.
    
    Returns:
        200 OK: Task in progress
        201 Created: Task completed
        500 Error: Task failed
    """
    task_result = AsyncResult(task_id)
    
    if task_result.state == "PENDING":
        return jsonify({
            "status": "pending",
            "task_id": task_id,
            "progress": 0,
        }), 200
    
    elif task_result.state == "STARTED":
        return jsonify({
            "status": "in_progress",
            "task_id": task_id,
            "progress": 50,
        }), 200
    
    elif task_result.state == "SUCCESS":
        result = task_result.result
        return jsonify({
            "status": "completed",
            "task_id": task_id,
            "progress": 100,
            "data": result,
        }), 201
    
    elif task_result.state == "FAILURE":
        return jsonify({
            "status": "failed",
            "task_id": task_id,
            "error": str(task_result.info),
        }), 500
    
    else:
        return jsonify({
            "status": task_result.state.lower(),
            "task_id": task_id,
        }), 200
```

### 3. Update Celery Configuration
In `backend/config/default.py`:

```python
# Celery task configuration
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
```

### 4. Create Task Tests
Create `backend/tests/backend/test_file_tasks.py`:

```python
"""Tests for file upload tasks."""

import unittest
from unittest.mock import patch, MagicMock
from io import BytesIO

from celery import Celery

from core.tasks.file_tasks import upload_file_async
from core.services.ipfs_service import UploadError, UploadResult


class TestFileUploadTask(unittest.TestCase):
    """Test async file upload task."""
    
    @patch('core.tasks.file_tasks.ipfs_service')
    def test_upload_file_async_success(self, mock_ipfs):
        """Task should succeed and save to database."""
        mock_ipfs.upload_file.return_value = UploadResult(
            cid="QmTest123",
            size=1024,
            key="test.txt"
        )
        
        task = upload_file_async.apply_async(
            kwargs={
                "user_id": 1,
                "filename": "test.txt",
                "original_filename": "Test Document.txt",
                "file_data": b"test content",
                "content_type": "text/plain",
            }
        )
        
        result = task.get(timeout=5)
        
        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["cid"], "QmTest123")
        self.assertEqual(result["filename"], "Test Document.txt")
    
    @patch('core.tasks.file_tasks.ipfs_service')
    def test_upload_file_async_failure(self, mock_ipfs):
        """Task should handle upload errors."""
        mock_ipfs.upload_file.side_effect = UploadError("Upload failed")
        
        task = upload_file_async.apply_async(
            kwargs={
                "user_id": 1,
                "filename": "test.txt",
                "original_filename": "Test Document.txt",
                "file_data": b"test content",
            }
        )
        
        # Task should eventually fail
        from celery.exceptions import MaxRetriesExceededError
        # In testing, we expect retries to exhaust


if __name__ == "__main__":
    unittest.main()
```

## Acceptance Criteria
- [ ] Celery task `upload_file_async` is implemented
- [ ] Task handles files > 10MB
- [ ] Task tracks progress (STARTED, SUCCESS, FAILURE states)
- [ ] Upload result is saved to database
- [ ] Failure is logged to AuditLog
- [ ] Retry logic with exponential backoff (60s base)
- [ ] Max 3 retries before permanent failure
- [ ] Status endpoint returns task state (pending, in_progress, completed, failed)
- [ ] All task tests pass
- [ ] Task serialization is JSON
- [ ] Task result tracking is enabled

## Notes
- Files < 10MB should still upload synchronously
- Use AsyncResult to check task status
- Task ID is returned in 202 response
- Progress estimates: pending=0%, started=50%, success=100%
- Celery worker must be running for async uploads

## Completion Status
- [ ] 0% - Not Started

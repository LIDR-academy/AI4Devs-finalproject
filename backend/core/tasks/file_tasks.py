"""Celery tasks for file operations."""

import logging
from io import BytesIO

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
        filename: Safe filename for storage
        original_filename: Original filename from request
        file_data: File content as bytes
        content_type: MIME type of file
        
    Returns:
        dict: Upload result with cid and metadata
    """
    try:
        logger.info(f"Starting async upload for user {user_id}: {original_filename}")
        
        # Convert bytes to file-like object
        file_obj = BytesIO(file_data)
        file_size = len(file_data)
        
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
                size=file_size,
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
                    "size": file_size,
                    "status": "completed",
                    "task_id": self.request.id,
                }
            )
            session.add(audit)
            session.commit()
            
            logger.info(
                f"Async upload completed for user {user_id}. "
                f"CID: {result.cid}, Size: {file_size}"
            )
            
            return {
                "status": "completed",
                "cid": result.cid,
                "filename": original_filename,
                "size": file_size,
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
        logger.error(
            f"Unexpected error during async upload for user {user_id}: {e}",
            exc_info=True
        )
        
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

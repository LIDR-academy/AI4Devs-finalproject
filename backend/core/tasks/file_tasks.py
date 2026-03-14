"""Celery tasks for file operations."""

import json
import logging
from io import BytesIO

import arrow
from celery import shared_task
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from core import get_engine
from core.files.models import File
from core.services.audit_service import add_audit_log
from core.services.ipfs_service import ipfs_service, UploadError

logger = logging.getLogger(__name__)


def _restore_soft_deleted_file(
    session: Session,
    *,
    user_id: int,
    cid: str,
    original_filename: str,
    safe_filename: str,
    file_size: int,
    mime_type: str,
) -> File | None:
    """Restore a soft-deleted file row for a duplicate CID upload."""
    existing = session.exec(
        select(File).where(File.user_id == user_id, File.cid == cid)
    ).first()
    if existing is None or existing.deleted_at is None:
        return None

    now = arrow.utcnow().datetime
    existing.deleted_at = None
    existing.pinned = True
    existing.original_filename = original_filename
    existing.safe_filename = safe_filename
    existing.storage_key = safe_filename
    existing.size = file_size
    existing.mime_type = mime_type
    existing.uploaded_at = now
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


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
        self.update_state(state="PROGRESS", meta={"progress": 10, "message": "Preparing upload"})
        
        # Convert bytes to file-like object
        file_obj = BytesIO(file_data)
        file_size = len(file_data)
        self.update_state(state="PROGRESS", meta={"progress": 35, "message": "Uploading to IPFS"})
        
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
            self.update_state(state="PROGRESS", meta={"progress": 80, "message": "Persisting metadata"})
            db_file = File(
                user_id=user_id,
                cid=result.cid,
                original_filename=original_filename,
                safe_filename=filename,
                storage_key=filename,
                size=file_size,
                mime_type=content_type,
                pinned=True,
            )
            session.add(db_file)
            try:
                session.commit()
            except IntegrityError as exc:
                session.rollback()
                restored_file = _restore_soft_deleted_file(
                    session,
                    user_id=user_id,
                    cid=result.cid,
                    original_filename=original_filename,
                    safe_filename=filename,
                    file_size=file_size,
                    mime_type=content_type,
                )
                if restored_file is None:
                    raise exc
                db_file = restored_file
                logger.info(
                    "Async upload restored soft-deleted file for user %s and cid %s",
                    user_id,
                    result.cid,
                )

            session.refresh(db_file)
            
            # Log to audit trail
            add_audit_log(
                session,
                user_id=user_id,
                action="file_upload",
                resource_type="file",
                resource_id=db_file.id,
                details={
                    "cid": result.cid,
                    "filename": original_filename,
                    "size": file_size,
                    "status": "completed",
                    "task_id": self.request.id,
                },
            )
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
                "progress": 100,
            }
    
    except UploadError as e:
        logger.error(f"Upload error for user {user_id}: {e}")
        
        # Retry with exponential backoff
        try:
            raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        except self.MaxRetriesExceededError:
            # Log final failure
            with Session(get_engine()) as session:
                add_audit_log(
                    session,
                    user_id=user_id,
                    action="file_upload",
                    details={
                        "filename": original_filename,
                        "status": "failed",
                        "error": str(e),
                        "task_id": self.request.id,
                    },
                )
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
            add_audit_log(
                session,
                user_id=user_id,
                action="file_upload",
                details={
                    "filename": original_filename,
                    "status": "failed",
                    "error": f"Unexpected error: {str(e)}",
                    "task_id": self.request.id,
                },
            )
            session.commit()
        
        return {
            "status": "failed",
            "filename": original_filename,
            "error": "Unexpected error during upload",
        }

"""
Upload service - Business logic for file upload operations.

This module contains the core business logic for handling file uploads,
separate from the API routing layer to follow Clean Architecture principles.
"""
import uuid
from datetime import datetime
from typing import Optional, Tuple
from supabase import Client

from constants import (
    STORAGE_BUCKET_RAW_UPLOADS,
    STORAGE_UPLOAD_PATH_PREFIX,
    EVENT_TYPE_UPLOAD_CONFIRMED,
    TABLE_EVENTS,
    TABLE_BLOCKS,
    TASK_VALIDATE_FILE,
    BLOCK_TIPOLOGIA_PENDING,
    BLOCK_ISO_CODE_PREFIX,
)


class UploadService:
    """
    Service class for handling file upload operations.
    
    This class encapsulates all business logic related to file uploads,
    including storage verification and event creation.
    """
    
    def __init__(self, supabase_client: Client, celery_client=None):
        """
        Initialize the upload service.

        Args:
            supabase_client: Configured Supabase client instance
            celery_client: Optional Celery client for enqueuing tasks
        """
        self.supabase = supabase_client
        self.celery = celery_client
    
    def generate_presigned_url(self, file_id: str, filename: str) -> Tuple[str, str]:
        """
        Generate a signed upload URL for Supabase Storage.

        Args:
            file_id: UUID identifying the upload
            filename: Original filename

        Returns:
            Tuple of (signed_url, file_key)
        """
        file_key = f"{STORAGE_UPLOAD_PATH_PREFIX}/{file_id}/{filename}"
        result = self.supabase.storage.from_(STORAGE_BUCKET_RAW_UPLOADS).create_signed_upload_url(file_key)
        return result["signed_url"], file_key

    def verify_file_exists_in_storage(self, file_key: str) -> bool:
        """
        Verify that a file exists in Supabase Storage.
        
        Args:
            file_key: The S3 object key (path) of the file
            
        Returns:
            True if file exists, False otherwise
        """
        try:
            # Extract directory path and filename
            if '/' in file_key:
                path = file_key.rsplit('/', 1)[0]
                file_name = file_key.split('/')[-1]
            else:
                path = ''
                file_name = file_key
            
            # List files in the directory
            files = self.supabase.storage.from_(STORAGE_BUCKET_RAW_UPLOADS).list(path=path)
            
            # Check if our file is in the list
            return any(f.get('name') == file_name for f in files)
        except Exception:
            # Any error means file not accessible
            return False
    
    def create_upload_event(
        self,
        file_id: str,
        file_key: str
    ) -> str:
        """
        Create an event record for a confirmed upload.
        
        Args:
            file_id: UUID of the uploaded file
            file_key: S3 object key where file was uploaded
            
        Returns:
            str: UUID of the created event
            
        Raises:
            Exception: If event creation fails
        """
        event_id = str(uuid.uuid4())
        event_data = {
            "id": event_id,
            "file_id": file_id,
            "event_type": EVENT_TYPE_UPLOAD_CONFIRMED,
            "metadata": {
                "file_key": file_key,
                "confirmed_at": datetime.utcnow().isoformat()
            },
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = self.supabase.table(TABLE_EVENTS).insert(event_data).execute()
        
        if not result.data:
            raise Exception("Failed to create event record - no data returned")
        
        return event_id
    
    def create_block_record(self, file_id: str, file_key: str) -> str:
        """
        Create a block record with temporary pending values.

        Args:
            file_id: UUID of the uploaded file
            file_key: S3 object key where file was uploaded

        Returns:
            str: UUID of the created block

        Raises:
            Exception: If INSERT fails
        """
        iso_code = f"{BLOCK_ISO_CODE_PREFIX}-{file_id[:8]}"
        block_data = {
            "iso_code": iso_code,
            "tipologia": BLOCK_TIPOLOGIA_PENDING,
            "url_original": file_key,
        }

        result = self.supabase.table(TABLE_BLOCKS).insert(block_data).execute()
        return result.data[0]["id"]

    def enqueue_validation(self, block_id: str, file_key: str) -> str:
        """
        Send a Celery task to validate the uploaded file.

        Args:
            block_id: UUID of the block record
            file_key: S3 object key where file was uploaded

        Returns:
            str: Celery task ID

        Raises:
            RuntimeError: If no celery client is configured
        """
        if self.celery is None:
            raise RuntimeError("Celery client not configured")

        result = self.celery.send_task(
            TASK_VALIDATE_FILE,
            args=[block_id, file_key]
        )
        return result.id

    def confirm_upload(
        self,
        file_id: str,
        file_key: str
    ) -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
        """
        Confirm a completed file upload.

        This method orchestrates the full confirmation process:
        1. Verify file exists in storage
        2. Create event record in database
        3. Create block record
        4. Enqueue validation task

        Args:
            file_id: UUID of the uploaded file
            file_key: S3 object key where file was uploaded

        Returns:
            Tuple of (success, event_id, task_id, error_message)
        """
        # Step 1: Verify file exists
        if not self.verify_file_exists_in_storage(file_key):
            return False, None, None, f"File not found in storage: {file_key}"

        # Step 2: Create event record
        try:
            event_id = self.create_upload_event(file_id, file_key)
        except Exception as e:
            return False, None, None, f"Database error: {str(e)}"

        # Step 3: Create block record
        try:
            block_id = self.create_block_record(file_id, file_key)
        except Exception as e:
            return False, event_id, None, f"Block creation error: {str(e)}"

        # Step 4: Enqueue validation task
        try:
            task_id = self.enqueue_validation(block_id, file_key)
        except Exception as e:
            return True, event_id, None, f"Enqueue error: {str(e)}"

        return True, event_id, task_id, None

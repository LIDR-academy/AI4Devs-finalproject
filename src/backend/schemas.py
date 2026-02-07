from typing import Optional
from pydantic import BaseModel, Field

class UploadRequest(BaseModel):
    """
    Schema for the upload request payload.

    Attributes:
        filename (str): The name of the file to upload. Must end with .3dm.
        size (int): The size of the file in bytes. Must be greater than 0.
        checksum (Optional[str]): optional checksum of the file for integrity verification.
    """
    filename: str = Field(..., description="Name of the file to upload (must be .3dm)")
    size: int = Field(..., gt=0, description="Size in bytes")
    checksum: Optional[str] = Field(None, description="Optional checksum for validation")

class UploadResponse(BaseModel):
    """
    Schema for the upload response payload.

    Attributes:
        upload_url (str): The presigned URL to upload the file to S3.
        file_id (str): The unique identifier assigned to the file.
        filename (str): The original filename.
    """
    upload_url: str = Field(..., description="Presigned URL for S3 upload")
    file_id: str = Field(..., description="Unique identifier for the file")
    filename: str = Field(..., description="Original filename")


# ===== T-004-BACK: Confirm Upload Schemas =====

class ConfirmUploadRequest(BaseModel):
    """
    Schema for confirming a completed file upload.
    
    This request is sent by the frontend after successfully uploading
    a file to the presigned URL, to trigger backend processing.

    Attributes:
        file_id (str): The unique identifier returned from the presigned URL request.
        file_key (str): The S3 object key where the file was uploaded.
    """
    file_id: str = Field(..., description="UUID of the uploaded file")
    file_key: str = Field(..., description="S3 object key (path in bucket)")


class ConfirmUploadResponse(BaseModel):
    """
    Schema for the confirm upload response.
    
    Attributes:
        success (bool): Whether the confirmation was successful.
        message (str): Human-readable status message.
        event_id (Optional[str]): ID of the created event record (if applicable).
        task_id (Optional[str]): ID of the launched Celery task (if applicable).
    """
    success: bool = Field(..., description="Confirmation status")
    message: str = Field(..., description="Status message")
    event_id: Optional[str] = Field(None, description="Created event record ID")
    task_id: Optional[str] = Field(None, description="Celery task ID for processing")

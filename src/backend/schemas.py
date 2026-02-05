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

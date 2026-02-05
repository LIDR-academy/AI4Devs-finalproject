import uuid
from fastapi import APIRouter, HTTPException
from schemas import UploadRequest, UploadResponse

router = APIRouter()

@router.post("/url", response_model=UploadResponse)
async def generate_upload_url(request: UploadRequest) -> UploadResponse:
    """
    Generate a presigned URL for uploading a file to S3.

    This endpoint validates the file extension and returns a unique file ID
    along with a presigned URL that the client can use to upload the file directly to S3.

    Args:
        request (UploadRequest): The request body containing filename and size.

    Returns:
        UploadResponse: An object containing the file_id and the presigned upload_url.

    Raises:
        HTTPException: If the filename does not end with '.3dm'.
    """
    # Validation logic
    if not request.filename.lower().endswith('.3dm'):
        raise HTTPException(status_code=400, detail="Only .3dm files are allowed")

    # Generate unique ID and mock URL
    file_id: str = str(uuid.uuid4())
    # Mocking the S3 URL for now as per Green Phase instructions.
    # TODO: Replace with actual boto3 call in future iteration.
    mock_url: str = f"https://s3.amazonaws.com/bucket/{file_id}/{request.filename}?signature=mock"
    
    return UploadResponse(
        file_id=file_id,
        upload_url=mock_url,
        filename=request.filename
    )

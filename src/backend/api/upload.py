import uuid
from fastapi import APIRouter, HTTPException
from schemas import UploadRequest, UploadResponse, ConfirmUploadRequest, ConfirmUploadResponse
from infra.supabase_client import get_supabase_client
from datetime import datetime

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


@router.post("/confirm", response_model=ConfirmUploadResponse)
async def confirm_upload(request: ConfirmUploadRequest) -> ConfirmUploadResponse:
    """
    Confirm a completed file upload and trigger processing.
    
    This endpoint is called by the frontend after successfully uploading
    a file to the presigned URL. It verifies the file exists in storage,
    creates an event record, and (in future) triggers async processing.

    Args:
        request (ConfirmUploadRequest): Contains file_id and file_key

    Returns:
        ConfirmUploadResponse: Confirmation status with event_id

    Raises:
        HTTPException: 404 if file not found in storage
    """
    # Get Supabase client
    supabase = get_supabase_client()
    
    # Step 1: Verify file exists in storage
    bucket_name = "raw-uploads"
    
    try:
        # Check if file exists by listing it
        # Note: Supabase Storage doesn't have a direct "exists" method,
        # so we attempt to list the specific file
        files = supabase.storage.from_(bucket_name).list(path=request.file_key.rsplit('/', 1)[0] if '/' in request.file_key else '')
        
        # Check if our file is in the list
        file_name = request.file_key.split('/')[-1]
        file_exists = any(f.get('name') == file_name for f in files)
        
        if not file_exists:
            raise HTTPException(
                status_code=404,
                detail=f"File not found in storage: {request.file_key}"
            )
    
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        # If storage check fails for other reasons, assume file doesn't exist
        raise HTTPException(
            status_code=404,
            detail=f"File not found in storage: {request.file_key}"
        )
    
    # Step 2: Create event record in database
    event_id = str(uuid.uuid4())
    event_data = {
        "id": event_id,
        "file_id": request.file_id,
        "event_type": "upload.confirmed",
        "metadata": {
            "file_key": request.file_key,
            "confirmed_at": datetime.utcnow().isoformat()
        },
        "created_at": datetime.utcnow().isoformat()
    }
    
    try:
        # Insert event into events table
        result = supabase.table("events").insert(event_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to create event record"
            )
    
    except Exception as e:
        # If events table doesn't exist or insert fails
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )
    
    # Step 3: Return success response
    # TODO: In future, launch Celery task here and return task_id
    return ConfirmUploadResponse(
        success=True,
        message="Upload confirmed successfully",
        event_id=event_id,
        task_id=None  # MVP: No Celery integration yet
    )

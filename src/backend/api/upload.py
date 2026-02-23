import uuid
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from schemas import UploadRequest, UploadResponse, ConfirmUploadRequest, ConfirmUploadResponse
from infra.supabase_client import get_supabase_client
from infra.celery_client import get_celery_client
from services import UploadService
from constants import ALLOWED_EXTENSION

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/url", response_model=UploadResponse)
@limiter.limit("10/minute")  # Rate limit: 10 presigned URLs per minute per IP
async def generate_upload_url(request: Request, body: UploadRequest) -> UploadResponse:
    """
    Generate a presigned URL for uploading a file to Supabase Storage.

    This endpoint validates the file extension and returns a unique file ID
    along with a signed upload URL that the client can use to upload
    the file directly to Supabase Storage.

    **Rate Limit:** 10 requests per minute per IP address to prevent DoS/cost attacks.

    Args:
        request (Request): FastAPI request object (for rate limiting)
        body (UploadRequest): The request body containing filename and size.

    Returns:
        UploadResponse: An object containing the file_id and the presigned upload_url.

    Raises:
        HTTPException: If the filename does not end with '.3dm'.
        RateLimitExceeded: If client exceeds 10 requests/minute (429 Too Many Requests).
    """
    if not body.filename.lower().endswith(ALLOWED_EXTENSION):
        raise HTTPException(status_code=400, detail=f"Only {ALLOWED_EXTENSION} files are allowed")

    file_id: str = str(uuid.uuid4())

    try:
        supabase = get_supabase_client()
        upload_service = UploadService(supabase)
        signed_url, _ = upload_service.generate_presigned_url(file_id, body.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate upload URL: {str(e)}")

    return UploadResponse(
        file_id=file_id,
        upload_url=signed_url,
        filename=body.filename
    )


@router.post("/confirm", response_model=ConfirmUploadResponse)
async def confirm_upload(request: ConfirmUploadRequest) -> ConfirmUploadResponse:
    """
    Confirm a completed file upload and trigger async validation.

    Verifies the file exists in storage, creates an event record,
    creates a block record, and enqueues a Celery validation task.

    Args:
        request (ConfirmUploadRequest): Contains file_id and file_key

    Returns:
        ConfirmUploadResponse: Confirmation status with event_id and task_id

    Raises:
        HTTPException: 404 if file not found, 500 for database/enqueue errors
    """
    # Get service instances
    supabase = get_supabase_client()
    celery = get_celery_client()
    upload_service = UploadService(supabase, celery_client=celery)

    # Execute confirmation via service
    success, event_id, task_id, error_msg = upload_service.confirm_upload(
        file_id=request.file_id,
        file_key=request.file_key
    )

    # Handle errors
    if not success:
        if error_msg and "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        else:
            raise HTTPException(status_code=500, detail=error_msg)

    return ConfirmUploadResponse(
        success=True,
        message="Upload confirmed and validation enqueued",
        event_id=event_id,
        task_id=task_id,
    )

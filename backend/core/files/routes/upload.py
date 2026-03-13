"""File upload routes for IPFS gateway."""

import logging
from io import BytesIO

from flask import request
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session
from werkzeug.datastructures import FileStorage

from core import configured_limit, get_engine
from core.auth.decorators import get_current_user, require_api_key
from core.common.exceptions import ValidationError
from core.common.responses import error_response, success_response
from core.files.models import File
from core.files.validators import (
    generate_safe_filename,
    validate_file_size,
    validate_filename,
    validate_mime_type,
)
from core.services.audit_service import queue_audit_log
from core.services.ipfs_service import UploadError, ipfs_service

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 100 * 1024 * 1024
ASYNC_UPLOAD_THRESHOLD = 10 * 1024 * 1024


def register_routes(bp):
    """Register file upload endpoints to blueprint."""

    @bp.post("/upload")
    @configured_limit("RATE_LIMIT_UPLOAD")
    @require_api_key
    def upload_file() -> tuple:
        """Upload a file to IPFS.
        ---
        tags:
          - Files
        summary: Upload file
        description: Upload a file to IPFS/Filebase; large files are queued asynchronously.
        consumes:
          - multipart/form-data
        produces:
          - application/json
        parameters:
          - in: formData
            name: file
            type: file
            required: true
            description: File to upload
        responses:
          201:
            description: File uploaded immediately
            schema:
              allOf:
                - $ref: '#/definitions/SuccessEnvelope'
                - type: object
                  properties:
                    data:
                      type: object
                      properties:
                        cid:
                          type: string
                          example: bafybeigdyrzt5x6...
                        original_filename:
                          type: string
                          example: report.pdf
                        size:
                          type: integer
                          example: 1048576
                        pinned:
                          type: boolean
                          example: true
          202:
            description: File queued for async upload
            schema:
              allOf:
                - $ref: '#/definitions/SuccessEnvelope'
                - type: object
                  properties:
                    data:
                      type: object
                      properties:
                        task_id:
                          type: string
                          example: 2b7e1516-28ae-4a6f-bf6f-0f4d9f152f59
                        status_url:
                          type: string
                          example: /api/v1/files/upload/status/2b7e1516-28ae-4a6f-bf6f-0f4d9f152f59
          400:
            description: Missing file or empty selection
            schema:
              $ref: '#/definitions/ErrorEnvelope'
          401:
            description: Invalid API key
            schema:
              $ref: '#/definitions/ErrorEnvelope'
          413:
            description: File too large
            schema:
              $ref: '#/definitions/ErrorEnvelope'
          422:
            description: Validation error
            schema:
              $ref: '#/definitions/ErrorEnvelope'
          503:
            description: Upload service unavailable
            schema:
              $ref: '#/definitions/ErrorEnvelope'
          429:
            description: Rate limit exceeded
            schema:
              $ref: '#/definitions/ErrorEnvelope'
        security:
          - ApiKeyAuth: []
        """
        user = get_current_user()
        user_id = int(user.id) if user.id is not None else 0

        if "file" not in request.files:
            return error_response(400, "No file provided", code="FILE_REQUIRED")

        file: FileStorage = request.files["file"]
        if not file or file.filename == "":
            return error_response(400, "No file selected", code="FILE_EMPTY")

        try:
            validate_filename(file.filename)
            declared_content_type = (file.content_type or "").strip()
            if declared_content_type and declared_content_type != "application/octet-stream":
                validate_mime_type(declared_content_type)
            file_content = file.read()
            file_size = len(file_content)
            validate_file_size(file_size, MAX_FILE_SIZE)
            safe_filename = generate_safe_filename(file.filename)
            original_filename = file.filename or safe_filename

            if file_size > ASYNC_UPLOAD_THRESHOLD:
                from core.tasks.file_tasks import upload_file_async

                task = upload_file_async.delay(
                    user_id=user_id,
                    filename=safe_filename,
                    original_filename=original_filename,
                    file_data=file_content,
                    content_type=file.content_type or "application/octet-stream",
                )
                return success_response(
                    202,
                    message="File upload queued",
                    data={
                        "task_id": str(task.id),
                        "status_url": f"/api/v1/files/upload/status/{task.id}",
                    },
                )

            result = ipfs_service.upload_file(
                file=BytesIO(file_content),
                filename=safe_filename,
                content_type=file.content_type or "application/octet-stream",
                metadata={"user_id": str(user_id), "original_filename": original_filename},
            )

            with Session(get_engine()) as session:
                db_file = File(
                    user_id=user_id,
                    cid=result.cid,
                    original_filename=original_filename,
                    safe_filename=safe_filename,
                    size=file_size,
                    pinned=True,
                )
                session.add(db_file)
                try:
                  session.commit()
                except IntegrityError as exc:
                  session.rollback()
                  logger.info(
                    "Duplicate upload rejected for user %s and cid %s: %s",
                    user_id,
                    result.cid,
                    exc,
                  )
                  return error_response(
                    409,
                    "File already exists. Duplicate uploads are not allowed.",
                    code="FILE_ALREADY_EXISTS",
                    details={"cid": result.cid},
                  )
                queue_audit_log(
                    user_id=user_id,
                    action="file_upload",
                    resource_type="file",
                    resource_id=db_file.id,
                    details={
                        "cid": result.cid,
                        "filename": original_filename,
                        "size": file_size,
                        "status": "completed",
                    },
                )

                return success_response(
                    201,
                    message="File uploaded successfully",
                    data={
                        "cid": result.cid,
                        "original_filename": original_filename,
                        "size": file_size,
                        "pinned": True,
                        "uploaded_at": db_file.uploaded_at.isoformat(),
                    },
                )

        except ValidationError as exc:
            logger.warning("Validation error for user %s: %s", user.id, exc)
            return error_response(exc.status_code, exc.message, code=exc.code, details=exc.details)
        except UploadError as exc:
            logger.error("Upload error for user %s: %s", user.id, exc)
            return error_response(
                503,
                "File upload service temporarily unavailable",
                code="UPLOAD_SERVICE_ERROR",
            )
        except Exception as exc:
            logger.error("Unexpected error during upload for user %s: %s", user.id, exc, exc_info=True)
            return error_response(500, "Internal server error", code="INTERNAL_ERROR")

    @bp.get("/upload/status/<task_id>")
    @configured_limit("RATE_LIMIT_TASKS")
    @require_api_key
    def upload_status(task_id: str) -> tuple:
        """Get status of an asynchronous file upload task.
        ---
        tags:
          - Tasks
        summary: Upload task status
        produces:
          - application/json
        parameters:
          - in: path
            name: task_id
            type: string
            required: true
            example: 2b7e1516-28ae-4a6f-bf6f-0f4d9f152f59
        responses:
          200:
            description: Task state information
            schema:
              allOf:
                - $ref: '#/definitions/SuccessEnvelope'
                - type: object
                  properties:
                    data:
                      type: object
                      properties:
                        task_id:
                          type: string
                        state:
                          type: string
                          enum: [PENDING, STARTED, SUCCESS, FAILURE, RETRY]
                        progress:
                          type: integer
                          example: 50
          401:
            description: Invalid API key
            schema:
              $ref: '#/definitions/ErrorEnvelope'
          429:
            description: Rate limit exceeded
            schema:
              $ref: '#/definitions/ErrorEnvelope'
          500:
            description: Task failed or status error
            schema:
              $ref: '#/definitions/ErrorEnvelope'
        security:
          - ApiKeyAuth: []
        """
        try:
            from celery.result import AsyncResult
            from core.celery_worker import celery

            task_result = AsyncResult(task_id, app=celery)
            if task_result.state == "PENDING":
                return success_response(200, data={"task_id": task_id, "state": "PENDING", "progress": 0, "message": "Task is pending"})
            if task_result.state == "STARTED":
                return success_response(200, data={"task_id": task_id, "state": "STARTED", "progress": 50, "message": "Task is in progress"})
            if task_result.state == "SUCCESS":
                return success_response(
                    200,
                    data={
                        "task_id": task_id,
                        "state": "SUCCESS",
                        "progress": 100,
                        "result": task_result.result,
                    },
                )
            if task_result.state == "FAILURE":
                return error_response(500, "Task failed", code="TASK_FAILED", details={"task_id": task_id, "error": str(task_result.info)})
            return success_response(
                200,
                data={
                    "task_id": task_id,
                    "state": task_result.state,
                    "progress": 50 if task_result.state == "RETRY" else 0,
                },
            )
        except Exception as exc:
            logger.error("Error retrieving task status %s: %s", task_id, exc)
            return error_response(500, "Unable to retrieve task status", code="TASK_STATUS_ERROR", details={"task_id": task_id})

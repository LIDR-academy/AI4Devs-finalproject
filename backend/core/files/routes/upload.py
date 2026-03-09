"""File upload routes for IPFS gateway."""

import json
import logging
from io import BytesIO

from flask import jsonify, request
from sqlmodel import Session
from werkzeug.datastructures import FileStorage

from core.auth.decorators import get_current_user, require_api_key
from core.common.exceptions import ValidationError
from core.common.models import AuditLog
from core import get_engine
from core.files.models import File
from core.files.validators import generate_safe_filename, validate_file_size, validate_filename
from core.services.ipfs_service import UploadError, ipfs_service

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 100 * 1024 * 1024
ASYNC_UPLOAD_THRESHOLD = 10 * 1024 * 1024


def register_routes(bp):
    """Register file upload endpoints to blueprint."""

    @bp.post("/upload")
    @require_api_key
    def upload_file() -> tuple:
        user = get_current_user()

        if "file" not in request.files:
            return jsonify({"status": 400, "message": "No file provided", "error": "file_required"}), 400

        file: FileStorage = request.files["file"]
        if not file or file.filename == "":
            return jsonify({"status": 400, "message": "No file selected", "error": "file_empty"}), 400

        try:
            validate_filename(file.filename)
            file_content = file.read()
            file_size = len(file_content)
            validate_file_size(file_size, MAX_FILE_SIZE)
            safe_filename = generate_safe_filename(file.filename)

            if file_size > ASYNC_UPLOAD_THRESHOLD:
                from core.tasks.file_tasks import upload_file_async

                task = upload_file_async.delay(
                    user_id=user.id,
                    filename=safe_filename,
                    original_filename=file.filename,
                    file_data=file_content,
                    content_type=file.content_type or "application/octet-stream",
                )
                return jsonify(
                    {
                        "status": 202,
                        "message": "File upload queued",
                        "data": {
                            "task_id": str(task.id),
                            "status_url": f"/api/v1/files/upload/status/{task.id}",
                        },
                    }
                ), 202

            result = ipfs_service.upload_file(
                file=BytesIO(file_content),
                filename=safe_filename,
                content_type=file.content_type or "application/octet-stream",
                metadata={"user_id": str(user.id), "original_filename": file.filename},
            )

            with Session(get_engine()) as session:
                db_file = File(
                    user_id=user.id,
                    cid=result.cid,
                    original_filename=file.filename,
                    safe_filename=safe_filename,
                    size=file_size,
                    pinned=True,
                )
                session.add(db_file)
                session.add(
                    AuditLog(
                        user_id=user.id,
                        action="file_upload",
                        details=json.dumps(
                            {
                                "cid": result.cid,
                                "filename": file.filename,
                                "size": file_size,
                                "status": "completed",
                            }
                        ),
                    )
                )
                session.commit()

                return jsonify(
                    {
                        "status": 201,
                        "message": "File uploaded successfully",
                        "data": {
                            "cid": result.cid,
                            "original_filename": file.filename,
                            "size": file_size,
                            "pinned": True,
                            "uploaded_at": db_file.uploaded_at.isoformat(),
                        },
                    }
                ), 201

        except ValidationError as exc:
            logger.warning("Validation error for user %s: %s", user.id, exc)
            return jsonify({"status": 400, "message": str(exc), "error": "validation_error"}), 400
        except UploadError as exc:
            logger.error("Upload error for user %s: %s", user.id, exc)
            return (
                jsonify(
                    {
                        "status": 503,
                        "message": "File upload service temporarily unavailable",
                        "error": "upload_service_error",
                    }
                ),
                503,
            )
        except Exception as exc:
            logger.error("Unexpected error during upload for user %s: %s", user.id, exc, exc_info=True)
            return jsonify({"status": 500, "message": "Internal server error", "error": "internal_error"}), 500

    @bp.get("/upload/status/<task_id>")
    @require_api_key
    def upload_status(task_id: str) -> tuple:
        try:
            from celery.result import AsyncResult
            from core.celery_worker import celery

            task_result = AsyncResult(task_id, app=celery)
            if task_result.state == "PENDING":
                return jsonify({"status": "pending", "task_id": task_id, "progress": 0}), 200
            if task_result.state == "STARTED":
                return jsonify({"status": "in_progress", "task_id": task_id, "progress": 50}), 200
            if task_result.state == "SUCCESS":
                return jsonify(
                    {
                        "status": "completed",
                        "task_id": task_id,
                        "progress": 100,
                        "data": task_result.result,
                    }
                ), 201
            if task_result.state == "FAILURE":
                return jsonify({"status": "failed", "task_id": task_id, "error": str(task_result.info)}), 500
            return (
                jsonify(
                    {
                        "status": task_result.state.lower(),
                        "task_id": task_id,
                        "progress": 50 if task_result.state == "RETRY" else 0,
                    }
                ),
                200,
            )
        except Exception as exc:
            logger.error("Error retrieving task status %s: %s", task_id, exc)
            return (
                jsonify(
                    {
                        "status": "error",
                        "task_id": task_id,
                        "error": "Unable to retrieve task status",
                    }
                ),
                500,
            )


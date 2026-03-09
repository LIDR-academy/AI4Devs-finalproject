"""File upload routes for IPFS gateway."""

import logging
from io import BytesIO

from flask import Blueprint, current_app, jsonify, request
from werkzeug.datastructures import FileStorage

from core.auth.decorators import require_api_key, get_current_user
from core.common.exceptions import ValidationError
from core.common.models import AuditLog
from core.db import get_engine
from core.files.models import File
from core.files.validators import (
	validate_filename,
	validate_file_size,
	generate_safe_filename,
)
from core.services.ipfs_service import ipfs_service, UploadError
from sqlmodel import Session

logger = logging.getLogger(__name__)

# Configuration
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ASYNC_UPLOAD_THRESHOLD = 10 * 1024 * 1024  # 10MB


def register_routes(bp):
	"""Register file upload endpoints to blueprint."""
    
	@bp.post("/upload")
@require_api_key
def upload_file() -> tuple:
	"""Upload a file to IPFS.
    
	Returns:
		201: File uploaded synchronously with CID
		202: File queued for async upload with task ID
		400: Validation error
		413: File too large
		503: Service unavailable (circuit breaker open)
	"""
	user = get_current_user()
    
	# Validate file exists
	if "file" not in request.files:
		return jsonify({
			"status": 400,
			"message": "No file provided",
			"error": "file_required"
		}), 400
    
	file: FileStorage = request.files["file"]
	if not file or file.filename == "":
		return jsonify({
			"status": 400,
			"message": "No file selected",
			"error": "file_empty"
		}), 400
    
	try:
		# Validate filename
		validate_filename(file.filename)
        
		# Read file and check size
		file_content = file.read()
		file_size = len(file_content)
        
		validate_file_size(file_size, MAX_FILE_SIZE)
        
		# Generate safe filename
		safe_filename = generate_safe_filename(file.filename)
        
		# Check if async upload needed
		if file_size > ASYNC_UPLOAD_THRESHOLD:
			# Import here to avoid circular imports
			from core.tasks.file_tasks import upload_file_async
            
			task = upload_file_async.delay(
				user_id=user.id,
				filename=safe_filename,
				original_filename=file.filename,
				file_data=file_content,
				content_type=file.content_type or "application/octet-stream",
			)
            
			return jsonify({
				"status": 202,
				"message": "File upload queued",
				"data": {
					"task_id": str(task.id),
					"status_url": f"/api/v1/files/upload/status/{task.id}"
				}
			}), 202
        
		# Sync upload for small files
		file_obj = BytesIO(file_content)
		result = ipfs_service.upload_file(
			file=file_obj,
			filename=safe_filename,
			content_type=file.content_type or "application/octet-stream",
			metadata={
				"user_id": str(user.id),
				"original_filename": file.filename,
			}
		)
        
		# Save to database
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
            
			# Log to audit trail
			audit = AuditLog(
				user_id=user.id,
				action="file_upload",
				details={
					"cid": result.cid,
					"filename": file.filename,
					"size": file_size,
					"status": "completed"
				}
			)
			session.add(audit)
			session.commit()
        
		return jsonify({
			"status": 201,
			"message": "File uploaded successfully",
			"data": {
				"cid": result.cid,
				"original_filename": file.filename,
				"size": file_size,
				"pinned": True,
				"uploaded_at": db_file.uploaded_at.isoformat()
			}
		}), 201
    
	except ValidationError as e:
		logger.warning(f"Validation error for user {user.id}: {e}")
		return jsonify({
			"status": 400,
			"message": str(e),
			"error": "validation_error"
		}), 400
    
	except UploadError as e:
		logger.error(f"Upload error for user {user.id}: {e}")
		return jsonify({
			"status": 503,
			"message": "File upload service temporarily unavailable",
			"error": "upload_service_error"
		}), 503
    
	except Exception as e:
		logger.error(f"Unexpected error during upload for user {user.id}: {e}", exc_info=True)
		return jsonify({
			"status": 500,
			"message": "Internal server error",
			"error": "internal_error"
		}), 500


    
	@bp.get("/upload/status/<task_id>")
@require_api_key
def upload_status(task_id: str) -> tuple:
	"""Get status of async upload task.
    
	Returns:
		200: Task in progress or pending
		201: Task completed
		500: Task failed
	"""
	try:
		from celery.result import AsyncResult
		from core.celery_worker import celery
        
		task_result = AsyncResult(task_id, app=celery)
        
		if task_result.state == "PENDING":
			return jsonify({
				"status": "pending",
				"task_id": task_id,
				"progress": 0,
			}), 200
        
		elif task_result.state == "STARTED":
			return jsonify({
				"status": "in_progress",
				"task_id": task_id,
				"progress": 50,
			}), 200
        
		elif task_result.state == "SUCCESS":
			result = task_result.result
			return jsonify({
				"status": "completed",
				"task_id": task_id,
				"progress": 100,
				"data": result,
			}), 201
        
		elif task_result.state == "FAILURE":
			return jsonify({
				"status": "failed",
				"task_id": task_id,
				"error": str(task_result.info),
			}), 500
        
		else:
			return jsonify({
				"status": task_result.state.lower(),
				"task_id": task_id,
				"progress": 50 if task_result.state == "RETRY" else 0,
			}), 200
    
	except Exception as e:
		logger.error(f"Error retrieving task status {task_id}: {e}")
		return jsonify({
			"status": "error",
			"task_id": task_id,
			"error": "Unable to retrieve task status"
		}), 500


"""File retrieval routes."""

import logging
from datetime import datetime
from typing import Optional
import json

from flask import jsonify, request, Response, stream_with_context
from sqlmodel import Session

from core import get_engine
from core.auth.decorators import get_current_user
from core.common.models import AuditLog
from core.files.authorization import check_file_access_by_cid
from core.files.cache_headers import (
	add_cache_headers,
	create_304_response,
	generate_etag,
	should_return_304,
)
from core.files.mime_types import detect_mime_type, get_content_disposition
from core.services.ipfs_service import ipfs_service, RetrievalError
from core.users.models import User

logger = logging.getLogger(__name__)


def get_session():
	"""Yield a DB session.

	Kept as a thin wrapper to simplify test patching.
	"""
	with Session(get_engine()) as session:
		yield session


def log_file_retrieval(
	session: Session,
	user: User,
	file_id: int,
	action: str,
	status: str,
	details: Optional[str] = None,
) -> None:
	"""Log file retrieval attempt to audit log.
	
	Args:
		session: Database session
		user: User performing the action
		file_id: ID of the file being retrieved
		action: Action being performed
		status: Status of the action (success, failure, denied, cached)
		details: Optional additional details
	"""
	# Get request metadata
	ip_address = request.remote_addr
	user_agent = request.headers.get("User-Agent", "Unknown")
	
	audit_entry = AuditLog(
		user_id=user.id,
		action=action,
		resource_type="file",
		resource_id=file_id,
		ip_address=ip_address,
		user_agent=user_agent,
		details=json.dumps({"status": status, "details": details or ""}),
	)
	
	session.add(audit_entry)
	session.commit()
	
	logger.debug(
		f"Audit log created: user_id={user.id}, "
		f"action={action}, status={status}, file_id={file_id}"
	)


def register_routes(bp):
	"""Register file retrieval endpoints to blueprint."""
	
	@bp.route("/retrieve/<string:cid>", methods=["GET"])
	def retrieve_file_by_cid(cid: str):
		"""Retrieve a file from IPFS by its Content Identifier (CID)."""
		user = get_current_user()

		for session in get_session():
			try:
				# Check file access authorization
				has_access, file_record, reason = check_file_access_by_cid(
					session=session,
					cid=cid,
					user=user,
				)
				
				if not has_access:
					# Log unauthorized access attempt
					if file_record:
						log_file_retrieval(
							session=session,
							user=user,
							file_id=file_record.id,
							action="file_retrieval_denied",
							status="failure",
							details=reason,
						)
					
					logger.warning(
						f"Access denied for user {user.id} to CID {cid}: {reason}"
					)
					return jsonify({"error": reason}), 403 if file_record else 404
				
				# Check cache headers (304 Not Modified)
				etag = generate_etag(cid)
				created_at = (
					getattr(file_record, "uploaded_at", None)
					or getattr(file_record, "created_at", None)
					or datetime.utcnow()
				)
				if should_return_304(etag, created_at):
					# Log cached retrieval
					log_file_retrieval(
						session=session,
						user=user,
						file_id=file_record.id,
						action="file_retrieved_cached",
						status="success",
						details="Client cache valid, returned 304",
					)
					
					logger.info(
						f"Returning 304 Not Modified for CID {cid}, user {user.id}"
					)
					return create_304_response(etag, created_at)
				
				# Detect MIME type
				extra = getattr(file_record, "__pydantic_extra__", None) or {}
				filename = (
					getattr(file_record, "original_filename", None)
					or getattr(file_record, "safe_filename", None)
					or getattr(file_record, "filename", None)
					or extra.get("filename")
				)
				if not filename:
					storage_name = getattr(file_record, "storage_key", None)
					if storage_name:
						# Legacy compatibility: some old keys used '-file.' suffix.
						filename = storage_name.replace("-file.", ".", 1)
					else:
						filename = "download.bin"
				mime_type = detect_mime_type(filename, file_record.mime_type)
				
				# Determine if download or inline
				force_download = "download" in request.args
				content_disposition = get_content_disposition(
					filename=filename,
					inline=not force_download,
				)
				
				# Retrieve file from IPFS/Filebase
				# Use storage_key if available, fallback to CID
				storage_key = file_record.storage_key or cid
				
				try:
					# Resolve stream source first so provider errors return a proper API error.
					stream_source = ipfs_service.retrieve_file_stream(
						key=storage_key,
						chunk_size=65536,
					)

					def generate():
						"""Generate file chunks for streaming."""
						for chunk in stream_source:
							yield chunk
					
					# Create streaming response
					response = Response(
						stream_with_context(generate()),
						mimetype=mime_type,
					)
					
					# Add caching and metadata headers
					response = add_cache_headers(
						response=response,
						cid=cid,
						file_id=file_record.id,
						created_at=created_at,
					)
					response.headers["Content-Disposition"] = content_disposition
					
					# Log successful retrieval
					log_file_retrieval(
						session=session,
						user=user,
						file_id=file_record.id,
						action="file_retrieved",
						status="success",
						details=f"Retrieved {filename} ({mime_type})",
					)

					# Update retrieval statistics
					file_record.retrieval_count += 1
					file_record.last_retrieved_at = datetime.utcnow()
					session.add(file_record)
					session.commit()
					
					logger.info(
						f"Successfully retrieved file: CID={cid}, "
						f"user_id={user.id}, file_id={file_record.id}, "
						f"mime_type={mime_type}"
					)
					
					return response
				
				except RetrievalError as e:
					# Log failed retrieval
					log_file_retrieval(
						session=session,
						user=user,
						file_id=file_record.id,
						action="file_retrieval_failed",
						status="failure",
						details=str(e),
					)
					
					logger.error(f"Failed to retrieve file from IPFS: {e}")
					
					# Check if file not found in IPFS
					if "not found" in str(e).lower():
						return jsonify({"error": "File not found in IPFS storage"}), 404
					
					return jsonify({"error": "Failed to retrieve file"}), 500
			
			except Exception as e:
				logger.error(f"Unexpected error during file retrieval: {e}", exc_info=True)
				return jsonify({"error": "Internal server error"}), 500


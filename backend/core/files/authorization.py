"""Authorization helpers for file access control."""

import logging
from typing import Optional, Tuple

from sqlmodel import Session, select

from core.files.models import File
from core.users.models import User

logger = logging.getLogger(__name__)


def check_file_access_by_cid(
	session: Session,
	cid: str,
	user: Optional[User] = None,
) -> Tuple[bool, Optional[File], str]:
	"""Check if user has access to a file by CID.
	
	Files are accessible if:
	- User is authenticated and owns the file
	- File exists and is not soft-deleted
	
	Args:
		session: Database session
		cid: Content Identifier to check access for
		user: Current authenticated user (optional)
		
	Returns:
		Tuple of (has_access, file_record, reason):
		- has_access: Boolean indicating if access is granted
		- file_record: File model instance if found, None otherwise
		- reason: Human-readable reason for access decision
		
	Examples:
		>>> has_access, file_obj, reason = check_file_access_by_cid(session, cid, user)
		>>> if not has_access:
		>>>     return {"error": reason}, 403
	"""
	# Check if file exists
	statement = select(File).where(File.cid == cid, File.deleted_at == None)
	file_record = session.exec(statement).first()
	
	if not file_record:
		logger.warning(f"File not found or deleted: CID={cid}")
		return False, None, "File not found"
	
	# Check user authentication
	if not user:
		logger.warning(f"Unauthenticated access attempt to file: CID={cid}")
		return False, file_record, "Authentication required"
	
	# Check file ownership
	if file_record.user_id != user.id:
		logger.warning(
			f"Unauthorized access attempt: user_id={user.id}, "
			f"file_owner_id={file_record.user_id}, CID={cid}"
		)
		return False, file_record, "Access denied: not file owner"
	
	# Access granted
	logger.debug(f"Access granted: user_id={user.id}, CID={cid}")
	return True, file_record, "Access granted"


def check_file_access_by_id(
	session: Session,
	file_id: int,
	user: Optional[User] = None,
) -> Tuple[bool, Optional[File], str]:
	"""Check if user has access to a file by ID.
	
	Files are accessible if:
	- User is authenticated and owns the file
	- File exists and is not soft-deleted
	
	Args:
		session: Database session
		file_id: File ID to check access for
		user: Current authenticated user (optional)
		
	Returns:
		Tuple of (has_access, file_record, reason):
		- has_access: Boolean indicating if access is granted
		- file_record: File model instance if found, None otherwise
		- reason: Human-readable reason for access decision
	"""
	# Check if file exists
	statement = select(File).where(File.id == file_id, File.deleted_at == None)
	file_record = session.exec(statement).first()
	
	if not file_record:
		logger.warning(f"File not found or deleted: ID={file_id}")
		return False, None, "File not found"
	
	# Check user authentication
	if not user:
		logger.warning(f"Unauthenticated access attempt to file: ID={file_id}")
		return False, file_record, "Authentication required"
	
	# Check file ownership
	if file_record.user_id != user.id:
		logger.warning(
			f"Unauthorized access attempt: user_id={user.id}, "
			f"file_owner_id={file_record.user_id}, file_id={file_id}"
		)
		return False, file_record, "Access denied: not file owner"
	
	# Access granted
	logger.debug(f"Access granted: user_id={user.id}, file_id={file_id}")
	return True, file_record, "Access granted"

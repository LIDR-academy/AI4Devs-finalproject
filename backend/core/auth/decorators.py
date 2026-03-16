"""Authentication and authorization decorators for user API keys."""

import hmac
from functools import wraps
from typing import TYPE_CHECKING

from flask import request
from sqlmodel import Session, select

from core import get_engine
from core.common.exceptions import AuthenticationError, AuthorizationError

if TYPE_CHECKING:
	from core.users.models import User


DUMMY_API_KEY = "ipfs_gw_" + ("0" * 64)


def _extract_api_key_from_request() -> str:
	"""Return the API key header value or raise when it is missing."""
	api_key = request.headers.get("X-API-Key", "").strip()
	if not api_key:
		raise AuthenticationError("Missing X-API-Key header")
	return api_key


def find_user_by_api_key(session: Session, api_key: str) -> "User | None":
	"""Find a user by API key while performing constant-time value verification."""
	from core.users.models import User

	candidate = session.exec(select(User).where(User.api_key == api_key)).first()
	reference_key = candidate.api_key if candidate else DUMMY_API_KEY
	if not hmac.compare_digest(api_key, reference_key):
		return None
	return candidate


def require_api_key(f):
	"""Decorator to require valid user API key in X-API-Key header.
	
	Validates that:
	- X-API-Key header is present
	- API key exists in database
	- User is active and not deleted
	
	Raises:
		AuthenticationError: If API key is missing, invalid, or user is inactive/deleted.
	"""
	@wraps(f)
	def decorated_function(*args, **kwargs):
		api_key = _extract_api_key_from_request()
		
		with Session(get_engine()) as session:
			user = find_user_by_api_key(session, api_key)
			
			if not user:
				raise AuthenticationError("Invalid API key")
			
			if user.is_deleted:
				raise AuthenticationError("API key has been revoked")
			
			if not user.is_active:
				raise AuthenticationError("API key is inactive")
		
		return f(*args, **kwargs)
	
	return decorated_function


def require_admin(f):
	"""Decorator to require admin privileges.
	
	Validates that:
	- Valid API key is present (via require_api_key logic)
	- User has admin privileges (is_admin=True)
	
	Raises:
		AuthenticationError: If API key is missing or invalid.
		AuthorizationError: If user is not an admin.
	"""
	@wraps(f)
	def decorated_function(*args, **kwargs):
		api_key = _extract_api_key_from_request()
		
		with Session(get_engine()) as session:
			user = find_user_by_api_key(session, api_key)
			
			if not user:
				raise AuthenticationError("Invalid API key")
			
			if user.is_deleted:
				raise AuthenticationError("API key has been revoked")
			
			if not user.is_active:
				raise AuthenticationError("API key is inactive")
			
			if not user.is_admin:
				raise AuthorizationError("Admin privileges required")
		
		return f(*args, **kwargs)
	
	return decorated_function


def get_current_user() -> "User":
	"""Get the currently authenticated user from request context.
	
	Must be called within a request context after @require_api_key.
	
	Returns:
		User: The authenticated user.
		
	Raises:
		AuthenticationError: If no valid API key in request.
	"""
	api_key = _extract_api_key_from_request()
	
	with Session(get_engine()) as session:
		user = find_user_by_api_key(session, api_key)
		
		if not user or user.is_deleted or not user.is_active:
			raise AuthenticationError("Invalid or inactive API key")
		
		session.expunge(user)  # Detach from session to use outside context
		return user

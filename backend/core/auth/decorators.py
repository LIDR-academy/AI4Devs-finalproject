"""Authentication and authorization decorators for user API keys."""

from functools import wraps
from typing import TYPE_CHECKING
from flask import request
from sqlmodel import Session, select

from core import get_engine
from core.common.exceptions import AuthenticationError, AuthorizationError

if TYPE_CHECKING:
	from core.users.models import User


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
		api_key = request.headers.get("X-API-Key")
		
		if not api_key:
			raise AuthenticationError("Missing X-API-Key header")
		
		with Session(get_engine()) as session:
			from core.users.models import User

			user = session.exec(
				select(User).where(User.api_key == api_key)
			).first()
			
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
		api_key = request.headers.get("X-API-Key")
		
		if not api_key:
			raise AuthenticationError("Missing X-API-Key header")
		
		with Session(get_engine()) as session:
			from core.users.models import User

			user = session.exec(
				select(User).where(User.api_key == api_key)
			).first()
			
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
	api_key = request.headers.get("X-API-Key")
	
	if not api_key:
		raise AuthenticationError("Missing X-API-Key header")
	
	with Session(get_engine()) as session:
		from core.users.models import User

		user = session.exec(
			select(User).where(User.api_key == api_key)
		).first()
		
		if not user or user.is_deleted or not user.is_active:
			raise AuthenticationError("Invalid or inactive API key")
		
		session.expunge(user)  # Detach from session to use outside context
		return user

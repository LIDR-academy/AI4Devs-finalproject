"""Admin authorization decorator."""

from __future__ import annotations

from functools import wraps

from flask import current_app, request

from core.common.exceptions import AuthorizationError


def admin_required(func):
	"""Require admin token in headers for protected endpoints."""

	@wraps(func)
	def wrapper(*args, **kwargs):
		token = request.headers.get("X-Admin-Token")
		expected = current_app.config.get("ADMIN_TOKEN")
		if not expected:
			raise AuthorizationError("Admin token is not configured")
		if token != expected:
			raise AuthorizationError("Admin privileges required")
		return func(*args, **kwargs)

	return wrapper


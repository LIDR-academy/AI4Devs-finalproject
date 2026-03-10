"""API key authorization decorator."""

from __future__ import annotations

import hmac
from functools import wraps

from flask import current_app, request

from core.common.exceptions import AuthenticationError


def api_key_required(func):
	"""Require a valid API key in request headers."""

	@wraps(func)
	def wrapper(*args, **kwargs):
		provided_key = request.headers.get("X-API-Key")
		expected_key = current_app.config.get("INTERNAL_API_KEY")
		provided_key = str(provided_key or "")
		expected_key = str(expected_key or "")

		if not expected_key:
			raise AuthenticationError("Internal API key is not configured")
		if not hmac.compare_digest(provided_key, expected_key):
			raise AuthenticationError("Invalid API key")
		return func(*args, **kwargs)

	return wrapper


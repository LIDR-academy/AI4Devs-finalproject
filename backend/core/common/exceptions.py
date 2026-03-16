"""Custom API exceptions used by the Flask app."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class APIException(Exception):
	"""Base API exception with serializable payload."""

	message: str
	status_code: int = 400
	code: str = "API_ERROR"
	details: Any = None

	def __post_init__(self) -> None:
		# Ensure Exception stringification returns the API message.
		super().__init__(self.message)

	def to_dict(self) -> dict[str, Any]:
		payload: dict[str, Any] = {"status": self.status_code, "code": self.code, "message": self.message}
		if self.details is not None:
			payload["details"] = self.details
		return payload


class ValidationError(APIException):
	"""Raised when request data is invalid."""

	def __init__(self, message: str, details: Any = None):
		super().__init__(message=message, status_code=422, code="VALIDATION_ERROR", details=details)


class AuthenticationError(APIException):
	"""Raised when authentication fails."""

	def __init__(self, message: str):
		super().__init__(message=message, status_code=401, code="AUTHENTICATION_FAILED")


class AuthorizationError(APIException):
	"""Raised when user does not have required permissions."""

	def __init__(self, message: str):
		super().__init__(message=message, status_code=403, code="AUTHORIZATION_FAILED")


class NotFoundError(APIException):
	"""Raised when a domain resource cannot be found."""

	def __init__(self, message: str):
		super().__init__(message=message, status_code=404, code="NOT_FOUND")


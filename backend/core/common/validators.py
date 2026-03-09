"""Validation helper functions."""

from __future__ import annotations

import re

from email_validator import EmailNotValidError, validate_email as email_validate

from core.common.exceptions import ValidationError

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_PASSWORD_LEN = 8
MAX_PASSWORD_LEN = 128


def validate_email(email: str) -> str:
	"""Validate and normalize email values."""
	normalized = sanitize_text(email).lower()
	if not EMAIL_RE.match(normalized):
		raise ValidationError("Invalid email format")
	try:
		result = email_validate(normalized, check_deliverability=False)
		return result.normalized
	except EmailNotValidError as exc:
		raise ValidationError("Invalid email format") from exc


def validate_password(password: str) -> str:
	"""Validate password constraints used for registration."""
	clean = sanitize_text(password)
	if len(clean) < MIN_PASSWORD_LEN or len(clean) > MAX_PASSWORD_LEN:
		raise ValidationError("Password must be between 8 and 128 characters")
	return clean


def sanitize_text(value: str) -> str:
	"""Trim, normalize, and reject control characters in user input."""
	if not isinstance(value, str):
		raise ValidationError("Invalid request payload")
	cleaned = value.strip()
	if not cleaned:
		raise ValidationError("Field cannot be empty")
	if any(ord(char) < 32 for char in cleaned):
		raise ValidationError("Invalid characters in input")
	return cleaned


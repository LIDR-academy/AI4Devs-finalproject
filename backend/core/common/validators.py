"""Validation helper functions."""

from __future__ import annotations

import re

from email_validator import EmailNotValidError, validate_email as email_validate

from core.common.exceptions import ValidationError

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
VERIFICATION_CODE_RE = re.compile(r"^\d{6}$")
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
	if not isinstance(password, str):
		raise ValidationError("Invalid request payload")
	if any(ord(char) < 32 or ord(char) == 127 for char in password):
		raise ValidationError("Password contains invalid control characters")
	if password != password.strip():
		raise ValidationError("Password must not include leading or trailing whitespace")
	if len(password) < MIN_PASSWORD_LEN or len(password) > MAX_PASSWORD_LEN:
		raise ValidationError(
			f"Password must be between {MIN_PASSWORD_LEN} and {MAX_PASSWORD_LEN} characters"
		)
	if not any(char.isupper() for char in password):
		raise ValidationError("Password must contain at least one uppercase letter")
	if not any(char.isdigit() for char in password):
		raise ValidationError("Password must contain at least one digit")
	return password


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


def validate_verification_code(code: str) -> str:
	"""Validate a six-digit step-up verification code."""
	cleaned = sanitize_text(code)
	if not VERIFICATION_CODE_RE.fullmatch(cleaned):
		raise ValidationError("verification_code must be a 6-digit string")
	return cleaned


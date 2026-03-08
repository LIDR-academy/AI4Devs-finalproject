"""Validation helper functions."""

from __future__ import annotations

import re

from core.common.exceptions import ValidationError

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_email(email: str) -> str:
	"""Validate and normalize email values."""
	normalized = email.strip().lower()
	if not EMAIL_RE.match(normalized):
		raise ValidationError("Invalid email format")
	return normalized


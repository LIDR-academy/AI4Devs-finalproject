"""Verification code management for step-up authentication."""

import secrets
import time
from typing import Optional

# In-memory storage for MVP (use Redis in production)
_verification_codes = {}


def generate_verification_code(user_id: int) -> str:
	"""Generate a 6-digit verification code for user.
	
	Args:
		user_id: User ID to generate code for.
		
	Returns:
		6-digit verification code.
	"""
	code = str(secrets.randbelow(1000000)).zfill(6)
	_verification_codes[user_id] = {
		"code": code,
		"expires_at": time.time() + 600,  # 10 minutes
	}
	return code


def verify_code(user_id: int, code: str) -> bool:
	"""Verify a code for the given user.
	
	Args:
		user_id: User ID to verify.
		code: Code provided by user.
		
	Returns:
		True if code is valid and not expired.
	"""
	stored = _verification_codes.get(user_id)
	if not stored:
		return False
	
	if time.time() > stored["expires_at"]:
		del _verification_codes[user_id]
		return False
	
	if stored["code"] == code:
		del _verification_codes[user_id]
		return True
	
	return False


def clear_code(user_id: int) -> None:
	"""Clear verification code for a user.
	
	Args:
		user_id: User ID to clear code for.
	"""
	if user_id in _verification_codes:
		del _verification_codes[user_id]

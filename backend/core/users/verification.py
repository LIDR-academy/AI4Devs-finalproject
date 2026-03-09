"""Verification code management for step-up authentication."""

from __future__ import annotations

import secrets
from typing import TYPE_CHECKING

from flask import current_app
from redis import Redis

if TYPE_CHECKING:
	pass

# In-memory storage for testing (when Redis is unavailable/mocked)
_test_verification_codes = {}


def _get_redis_client() -> Redis:
	"""Get Redis client from Flask app config.
	
	Returns:
		Redis client connected to REDIS_URL from config.
		Falls back to test in-memory dict if Redis is unavailable.
	"""
	# Check if we're using in-memory test storage (for testing)
	if current_app.config.get("USE_MEMORY_VERIFICATION_STORE", False):
		return _MemoryRedisAdapter()
	
	redis_url = current_app.config.get("REDIS_URL", "redis://localhost:6379/0")
	try:
		return Redis.from_url(redis_url, decode_responses=True)
	except Exception:
		# Fallback to in-memory storage if Redis connection fails
		return _MemoryRedisAdapter()


class _MemoryRedisAdapter:
	"""In-memory adapter that mimics Redis interface for testing."""
	
	def setex(self, key: str, ttl: int, value: str) -> None:
		"""Set a key with expiration."""
		_test_verification_codes[key] = value
	
	def getdel(self, key: str) -> str | None:
		"""Atomically get and delete a key."""
		return _test_verification_codes.pop(key, None)
	
	def get(self, key: str) -> str | None:
		"""Get a key value."""
		return _test_verification_codes.get(key)
	
	def delete(self, key: str) -> int:
		"""Delete a key."""
		if key in _test_verification_codes:
			del _test_verification_codes[key]
			return 1
		return 0
	
	def scan_iter(self, match: str = "*") -> list[str]:
		"""Scan keys matching pattern."""
		if match == "verify:*":
			return [k for k in _test_verification_codes.keys() if k.startswith("verify:")]
		return list(_test_verification_codes.keys())


def generate_verification_code(user_id: int) -> str:
	"""Generate a 6-digit verification code and store in Redis.
	
	Args:
		user_id: User ID to generate code for.
		
	Returns:
		6-digit verification code.
	"""
	code = str(secrets.randbelow(1000000)).zfill(6)
	redis_client = _get_redis_client()
	key = f"verify:{user_id}"
	
	# Store code in Redis with 10-minute expiration
	redis_client.setex(key, 600, code)
	
	return code


def verify_code(user_id: int, code: str) -> bool:
	"""Verify a code for the given user using atomicgetdel semantics.
	
	Args:
		user_id: User ID to verify.
		code: Code provided by user.
		
	Returns:
		True if code is valid and matches the stored value.
	"""
	redis_client = _get_redis_client()
	key = f"verify:{user_id}"
	
	# Atomically fetch and delete the key to prevent race conditions
	# across multiple workers. GETDEL is atomic (single Redis operation).
	stored_code = redis_client.getdel(key)
	
	if stored_code is None:
		return False
	
	return stored_code == code


def clear_code(user_id: int) -> None:
	"""Clear verification code for a user by deleting the Redis key.
	
	Args:
		user_id: User ID to clear code for.
	"""
	redis_client = _get_redis_client()
	key = f"verify:{user_id}"
	redis_client.delete(key)


# Test helper functions (for accessing Redis in tests)
def _test_get_verification_code(user_id: int, app=None) -> str | None:
	"""Get verification code from Redis (test helper only).
	
	Args:
		user_id: User ID to retrieve code for.
		app: Flask app instance (optional, uses current_app if not provided).
		
	Returns:
		Verification code if it exists, None otherwise.
	"""
	def _do_get():
		redis_client = _get_redis_client()
		key = f"verify:{user_id}"
		return redis_client.get(key)
	
	try:
		return _do_get()
	except RuntimeError:
		# Outside of app context - use provided app instance if available
		if app:
			with app.app_context():
				return _do_get()
		return None


def _test_clear_all_codes(app=None) -> None:
	"""Clear all verification codes from Redis (test helper only).
	
	Args:
		app: Flask app instance (optional, uses current_app if not provided).
	"""
	def _do_clear():
		redis_client = _get_redis_client()
		pattern = "verify:*"
		for key in redis_client.scan_iter(match=pattern):
			redis_client.delete(key)
		# Also clear the in-memory dict if using adapter
		global _test_verification_codes
		_test_verification_codes.clear()
	
	try:
		_do_clear()
	except RuntimeError:
		# Outside of app context - use provided app instance if available
		if app:
			with app.app_context():
				_do_clear()

# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Symmetric encryption for provider API keys stored in MongoDB.

Uses Fernet (AES-128-CBC + HMAC) with a key derived via SHA-256 from
LLM_KEYS_SECRET, falling back to SESSION_SECRET. Plaintext keys never leave
the backend: the admin API only exposes masked versions.
"""
import base64
import hashlib
import logging
import os

from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)


def _fernet() -> Fernet:
    secret = os.environ.get("LLM_KEYS_SECRET") or os.environ.get("SESSION_SECRET") or ""
    if not secret:
        raise RuntimeError(
            "LLM_KEYS_SECRET (or SESSION_SECRET) must be configured to store provider API keys"
        )
    key = base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())
    return Fernet(key)


def encrypt_key(plain: str) -> str:
    """Encrypt a plaintext API key for storage. Returns a urlsafe token."""
    return _fernet().encrypt(plain.encode()).decode()


def decrypt_key(token: str) -> str:
    """Decrypt a stored key token back to plaintext."""
    return _fernet().decrypt(token.encode()).decode()


def try_encrypt(plain: str) -> str:
    """encrypt_key that degrades to "" (with a warning) when no secret is set,
    so seeding never crashes application startup."""
    if not plain:
        return ""
    try:
        return encrypt_key(plain)
    except Exception as e:
        logger.warning("LLM key encryption unavailable (%s) — storing empty key", e)
        return ""


def try_decrypt(token: str) -> str:
    """decrypt_key that returns "" instead of raising (bad token / rotated secret)."""
    if not token:
        return ""
    try:
        return decrypt_key(token)
    except Exception as e:
        logger.warning("LLM key decryption failed (%s)", e)
        return ""


def mask_key(plain: str) -> str:
    """Display-safe version of a key: only the last 4 chars."""
    if not plain:
        return ""
    return f"••••{plain[-4:]}" if len(plain) > 4 else "••••"

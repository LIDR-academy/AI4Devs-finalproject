"""Helpers to build standardized API JSON responses."""

from __future__ import annotations

from typing import Any

from flask import jsonify


def _get_request_id() -> str | None:
    """Read the request id from Flask context when available."""
    try:
        # Import lazily to avoid circular imports during app bootstrap.
        from core import get_request_id

        return get_request_id()
    except Exception:
        return None


def build_success_payload(
    status: int,
    *,
    message: str | None = None,
    data: Any = None,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a success payload with optional message/data/meta fields."""
    payload: dict[str, Any] = {"status": status}
    if message is not None:
        payload["message"] = message
    if data is not None:
        payload["data"] = data
    if meta is not None:
        payload["meta"] = meta

    request_id = _get_request_id()
    if request_id:
        payload["request_id"] = request_id
    return payload


def build_error_payload(
    status: int,
    message: str,
    *,
    code: str | None = None,
    details: Any = None,
) -> dict[str, Any]:
    """Build an error payload aligned with the API contract."""
    payload: dict[str, Any] = {
        "status": status,
        "message": message,
    }
    if code:
        payload["code"] = code
    if details is not None:
        payload["details"] = details

    request_id = _get_request_id()
    if request_id:
        payload["request_id"] = request_id
    return payload


def success_response(
    status: int,
    *,
    message: str | None = None,
    data: Any = None,
    meta: dict[str, Any] | None = None,
) -> tuple[Any, int]:
    """Return a Flask JSON success response."""
    return jsonify(build_success_payload(status, message=message, data=data, meta=meta)), status


def error_response(
    status: int,
    message: str,
    *,
    code: str | None = None,
    details: Any = None,
) -> tuple[Any, int]:
    """Return a Flask JSON error response."""
    return jsonify(build_error_payload(status, message, code=code, details=details)), status

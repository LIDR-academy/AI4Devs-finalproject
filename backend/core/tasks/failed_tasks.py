"""Failed Celery task capture, inspection, and replay helpers."""

from __future__ import annotations

import json
import time
import uuid
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from flask import current_app
from redis import Redis

_failed_task_store: dict[str, dict[str, str]] = {}
_failed_task_index: list[str] = []


def _utc_now_iso() -> str:
    """Return timezone-aware UTC timestamp in ISO8601 format."""
    return datetime.now(timezone.utc).isoformat()


def _redact_redis_url(redis_url: str) -> str:
    """Return Redis URL without credentials for safe logs/errors."""
    parsed = urlparse(redis_url)
    host = parsed.hostname or "unknown-host"
    port = parsed.port
    if port is not None:
        return f"{parsed.scheme}://{host}:{port}"
    return f"{parsed.scheme}://{host}"


class _MemoryFailedTaskStore:
    """In-memory adapter for tests when Redis is intentionally bypassed."""

    def set(self, key: str, value: str) -> None:
        _failed_task_store[key] = {"value": value}

    def get(self, key: str) -> str | None:
        entry = _failed_task_store.get(key)
        if not entry:
            return None
        return entry["value"]

    def delete(self, key: str) -> int:
        if key in _failed_task_store:
            del _failed_task_store[key]
            return 1
        return 0

    def lpush(self, key: str, value: str) -> None:
        if key != "_failed_index":
            return
        _failed_task_index.insert(0, value)

    def lrange(self, key: str, start: int, end: int) -> list[str]:
        if key != "_failed_index":
            return []
        if end < 0:
            end = len(_failed_task_index) - 1
        return _failed_task_index[start : end + 1]

    def lrem(self, key: str, _count: int, value: str) -> int:
        if key != "_failed_index":
            return 0
        removed = 0
        while value in _failed_task_index:
            _failed_task_index.remove(value)
            removed += 1
        return removed


def _get_store_client() -> Any:
    """Return Redis client or in-memory adapter based on app config."""
    if current_app.config.get("USE_MEMORY_FAILED_TASK_STORE", False):
        if current_app.testing or current_app.config.get("TESTING", False):
            return _MemoryFailedTaskStore()
        raise RuntimeError(
            "USE_MEMORY_FAILED_TASK_STORE is enabled outside testing. "
            "Disable it for non-test environments."
        )

    redis_url = current_app.config.get("CELERY_FAILED_TASKS_REDIS_URL")
    if not redis_url:
        redis_url = current_app.config.get("REDIS_URL", "redis://localhost:6379/1")

    safe_url = _redact_redis_url(redis_url)
    try:
        client = Redis.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
        client.ping()
        return client
    except Exception as exc:
        raise RuntimeError(
            f"Failed to connect to Redis at {safe_url}. "
            "Verify failed-task Redis configuration."
        ) from exc


def _base_key() -> str:
    """Return configured key prefix for failed tasks."""
    return current_app.config.get("CELERY_FAILED_TASKS_KEY", "celery:failed_tasks")


def _entry_key(failure_id: str) -> str:
    return f"{_base_key()}:entry:{failure_id}"


def _index_key() -> str:
    return f"{_base_key()}:index"


def _to_json(payload: dict[str, Any]) -> str:
    """Serialize with fallback for non-JSON-native values."""
    return json.dumps(payload, default=str)


def _from_json(raw: str | None) -> dict[str, Any] | None:
    if not raw:
        return None
    return json.loads(raw)


def record_failed_task(
    *,
    task_id: str | None,
    task_name: str | None,
    args: list[Any] | tuple[Any, ...] | None,
    kwargs: dict[str, Any] | None,
    exception: str,
    traceback: str | None = None,
    retries: int | None = None,
    queue: str | None = None,
) -> dict[str, Any]:
    """Persist failed-task payload metadata for later inspection/replay."""
    client = _get_store_client()
    failure_id = str(uuid.uuid4())

    payload: dict[str, Any] = {
        "failure_id": failure_id,
        "captured_at": _utc_now_iso(),
        "task_id": task_id,
        "task_name": task_name,
        "args": list(args or []),
        "kwargs": kwargs or {},
        "exception": exception,
        "traceback": traceback,
        "retries": retries if retries is not None else 0,
        "queue": queue,
        "status": "failed",
    }

    client.set(_entry_key(failure_id), _to_json(payload))
    client.lpush("_failed_index" if isinstance(client, _MemoryFailedTaskStore) else _index_key(), failure_id)
    return payload


def list_failed_tasks(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    """Return paginated failed task entries (newest first)."""
    client = _get_store_client()
    index_name = "_failed_index" if isinstance(client, _MemoryFailedTaskStore) else _index_key()
    ids = client.lrange(index_name, offset, offset + max(limit - 1, 0))

    entries: list[dict[str, Any]] = []
    for failure_id in ids:
        raw = client.get(_entry_key(failure_id))
        data = _from_json(raw)
        if data is not None:
            entries.append(data)
    return entries


def get_failed_task(failure_id: str) -> dict[str, Any] | None:
    """Return one failed task payload by failure id."""
    client = _get_store_client()
    raw = client.get(_entry_key(failure_id))
    return _from_json(raw)


def replay_failed_task(failure_id: str) -> dict[str, Any]:
    """Replay a failed task and update stored metadata with replay details."""
    payload = get_failed_task(failure_id)
    if payload is None:
        raise KeyError(f"Failed task '{failure_id}' not found")

    result = _dispatch_task(
        payload.get("task_name"),
        args=payload.get("args", []),
        kwargs=payload.get("kwargs", {}),
        queue=payload.get("queue") or None,
    )

    payload["status"] = "replayed"
    payload["replayed_at"] = _utc_now_iso()
    payload["replay_task_id"] = str(result.id)

    client = _get_store_client()
    client.set(_entry_key(failure_id), _to_json(payload))

    return {
        "failure_id": failure_id,
        "replay_task_id": str(result.id),
        "status": "queued",
    }


def _dispatch_task(task_name: str | None, args: list[Any], kwargs: dict[str, Any], queue: str | None) -> Any:
    """Dispatch a task using the Celery app and return async result."""
    from core.celery_worker import celery

    return celery.send_task(task_name, args=args, kwargs=kwargs, queue=queue)


def clear_failed_tasks() -> None:
    """Test helper to clear in-memory failed task storage."""
    _failed_task_store.clear()
    _failed_task_index.clear()

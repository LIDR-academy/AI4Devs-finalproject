# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""TTL cache with Redis-first backend and in-memory fallback.

Preserves the previous sync-style API (`get`, `set_value`, `invalidate`,
`get_or_set`) so existing callers keep working. Internally, when `REDIS_URL`
is configured and reachable at startup, values are mirrored to Redis for
multi-instance consistency. If Redis is unavailable, we transparently fall
back to a per-process dict.

Public API (sync for in-memory lookups, async for network paths):
  cache.get(key)                              -> Optional[Any]
  cache.set_value(key, value, ttl_seconds)    -> None
  cache.invalidate(prefix)                    -> int (memory only)
  await cache.get_or_set(key, ttl, loader)    -> Any
  await cache.health()                        -> {"backend": "redis"|"memory"}

Use for: expensive reads, LLM results, low-cardinality catalogs. Do NOT use
for critical data — MongoDB remains the source of truth.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from typing import Any, Awaitable, Callable, Dict, Optional, Tuple

logger = logging.getLogger(__name__)

# ---------- In-memory store (always active, acts as L1 cache) ----------

_store: Dict[str, Tuple[float, Any]] = {}
_locks: Dict[str, asyncio.Lock] = {}


def _lock_for(key: str) -> asyncio.Lock:
    lock = _locks.get(key)
    if lock is None:
        lock = asyncio.Lock()
        _locks[key] = lock
    return lock


# ---------- Redis lazy client ----------

_redis = None
_redis_checked = False
_redis_lock = asyncio.Lock()


async def _ensure_redis() -> None:
    global _redis, _redis_checked
    if _redis_checked:
        return
    async with _redis_lock:
        if _redis_checked:
            return
        url = os.environ.get("REDIS_URL")
        if not url:
            logger.info("cache: REDIS_URL not set → in-memory only")
            _redis_checked = True
            return
        try:
            import redis.asyncio as aioredis  # type: ignore

            client = aioredis.from_url(url, decode_responses=True, socket_timeout=2)
            await client.ping()
            _redis = client
            logger.info("cache: connected to Redis at %s", url)
        except Exception as e:  # pragma: no cover
            logger.warning("cache: Redis unavailable (%s) — falling back to memory", e)
            _redis = None
        _redis_checked = True


# ---------- Sync-style API preserved (in-memory read path) ----------

def get(key: str) -> Optional[Any]:
    entry = _store.get(key)
    if entry is None:
        return None
    expires_at, value = entry
    if expires_at < time.monotonic():
        _store.pop(key, None)
        return None
    return value


def set_value(key: str, value: Any, ttl_seconds: int) -> None:
    _store[key] = (time.monotonic() + ttl_seconds, value)
    # Best-effort mirror to Redis if event loop is running
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_mirror_to_redis(key, value, ttl_seconds))
    except RuntimeError:
        pass  # no loop → sync context; skip


def invalidate(prefix: str) -> int:
    """Remove all entries whose key starts with the given prefix (memory only).

    Note: does NOT invalidate Redis keys — caller should use `cache.delete()`
    for a specific key if cross-instance consistency is required.
    """
    keys = [k for k in _store if k.startswith(prefix)]
    for k in keys:
        _store.pop(k, None)
    return len(keys)


async def _mirror_to_redis(key: str, value: Any, ttl: int) -> None:
    await _ensure_redis()
    if not _redis:
        return
    try:
        await _redis.set(key, json.dumps(value, default=str), ex=ttl)
    except Exception as e:
        logger.debug("cache: mirror-to-redis failed (%s)", e)


async def get_or_set(
    key: str, ttl_seconds: int, loader: Callable[[], Awaitable[Any]]
) -> Any:
    """Cache-aside with L1 (memory) + L2 (Redis) + per-key lock to prevent dogpile."""
    cached = get(key)
    if cached is not None:
        return cached

    # Try Redis L2
    await _ensure_redis()
    if _redis:
        try:
            raw = await _redis.get(key)
            if raw is not None:
                parsed = json.loads(raw)
                # Promote to L1
                _store[key] = (time.monotonic() + ttl_seconds, parsed)
                return parsed
        except Exception as e:
            logger.debug("cache: L2 read error (%s)", e)

    async with _lock_for(key):
        cached = get(key)
        if cached is not None:
            return cached
        value = await loader()
        set_value(key, value, ttl_seconds)
        return value


# ---------- Extra helpers for Redis-native ops ----------

async def get_async(key: str) -> Optional[Any]:
    """Read a key from L1 (memory) first, then L2 (Redis) when configured.

    Use this instead of sync `get()` when cross-instance consistency matters
    (e.g. LLM circuit-breaker flags mirrored to Redis).
    """
    value = get(key)
    if value is not None:
        return value
    await _ensure_redis()
    if _redis:
        try:
            raw = await _redis.get(key)
            return json.loads(raw) if raw is not None else None
        except Exception as e:
            logger.debug("cache: L2 read error (%s)", e)
    return None


async def delete(key: str) -> int:
    """Delete key from both L1 and L2."""
    mem_hit = 1 if _store.pop(key, None) is not None else 0
    await _ensure_redis()
    if _redis:
        try:
            return max(mem_hit, int(await _redis.delete(key)))
        except Exception:
            pass
    return mem_hit


async def incr(key: str, amount: int = 1, ttl: Optional[int] = None) -> int:
    """Increment a counter key (useful for rate limiting)."""
    await _ensure_redis()
    if _redis:
        try:
            v = int(await _redis.incrby(key, amount))
            if ttl:
                await _redis.expire(key, ttl)
            return v
        except Exception as e:
            logger.debug("cache.incr redis error (%s)", e)
    # Fallback to memory counter
    cur = get(key) or 0
    new = int(cur) + amount
    set_value(key, new, ttl or 3600)
    return new


async def health() -> Dict[str, Any]:
    await _ensure_redis()
    return {
        "backend": "redis" if _redis else "memory",
        "redis_connected": bool(_redis),
        "in_memory_keys": len(_store),
    }

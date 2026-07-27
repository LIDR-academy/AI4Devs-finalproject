# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Per-provider circuit breaker backed by cache.py (Redis when available, so
cooldowns are shared across instances; in-memory otherwise).

Model: N consecutive failures open the breaker for COOLDOWN_SECONDS; any
success resets the counter. All helpers are fail-open and never raise — a
broken health store must never block an LLM call.
"""
import logging

import cache

logger = logging.getLogger(__name__)

FAILURE_THRESHOLD = 3
COOLDOWN_SECONDS = 60
_FAILURES_TTL = 300  # rolling window for the consecutive-failure counter


def _failures_key(provider: str) -> str:
    return f"llm_health:failures:{provider}"


def _cooldown_key(provider: str) -> str:
    return f"llm_health:cooldown:{provider}"


async def is_available(provider: str) -> bool:
    """True unless the provider's breaker is open (in cooldown)."""
    try:
        return (await cache.get_async(_cooldown_key(provider))) is None
    except Exception:
        return True


async def mark_success(provider: str) -> None:
    """Reset the consecutive-failure counter after a successful call."""
    try:
        await cache.delete(_failures_key(provider))
    except Exception:
        pass


async def mark_failure(provider: str) -> int:
    """Record a failure; opens the breaker after FAILURE_THRESHOLD in a row.
    Returns the current consecutive-failure count (0 on store errors)."""
    try:
        count = await cache.incr(_failures_key(provider), ttl=_FAILURES_TTL)
        if count >= FAILURE_THRESHOLD:
            await cache.set_value(_cooldown_key(provider), "1", COOLDOWN_SECONDS)
            await cache.delete(_failures_key(provider))
            logger.warning(
                "LLM circuit breaker OPEN for %s after %d consecutive failures (cooldown %ds)",
                provider, count, COOLDOWN_SECONDS,
            )
        return count
    except Exception:
        return 0


async def get_status(provider: str) -> dict:
    """Health snapshot for one provider (used by future admin endpoints)."""
    try:
        in_cooldown = (await cache.get_async(_cooldown_key(provider))) is not None
        failures = 0
        if not in_cooldown:
            failures = int(await cache.get_async(_failures_key(provider)) or 0)
        return {
            "provider": provider,
            "available": not in_cooldown,
            "consecutive_failures": failures,
        }
    except Exception:
        return {"provider": provider, "available": True, "consecutive_failures": 0}

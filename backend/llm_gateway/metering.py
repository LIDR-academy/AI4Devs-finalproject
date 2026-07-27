# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Usage metering for LLM calls. Fire-and-forget: metering failures are logged
but never break the LLM call itself (same philosophy as email_service).
"""
import asyncio
import hashlib
import logging
import time
from datetime import datetime, timezone
from typing import Any, Callable, Optional, Tuple

import cache
from database import db
from llm_gateway import health
from llm_gateway.context import get_llm_context
from llm_gateway.pricing import estimate_cost

logger = logging.getLogger(__name__)


async def record_llm_usage(
    *,
    provider: str,
    model: str,
    tokens_in: int = 0,
    tokens_out: int = 0,
    latency_ms: int = 0,
    status: str = "ok",
    error: Optional[str] = None,
) -> None:
    """Insert one usage document into the llm_usage collection. Never raises."""
    try:
        tokens_in = int(tokens_in or 0)
        tokens_out = int(tokens_out or 0)
        ctx = get_llm_context()
        await db.llm_usage.insert_one({
            "user_id": ctx["user_id"],
            "endpoint": ctx["endpoint"],
            "provider": provider,
            "model": model,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "cost_usd": estimate_cost(model, tokens_in, tokens_out, provider),
            "latency_ms": int(latency_ms),
            "status": status,
            "error": (error or "")[:300] or None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        logger.warning("Failed to record LLM usage (%s/%s)", provider, model, exc_info=True)


def _elapsed_ms(started: float) -> int:
    return int((time.monotonic() - started) * 1000)


def extract_openai_response(response: Any) -> Tuple[str, int, int]:
    """Extract (content, tokens_in, tokens_out) from an OpenAI SDK response."""
    usage = getattr(response, "usage", None)
    return (
        response.choices[0].message.content,
        getattr(usage, "prompt_tokens", 0) or 0,
        getattr(usage, "completion_tokens", 0) or 0,
    )


def extract_anthropic_response(response: Any) -> Tuple[str, int, int]:
    """Extract (content, tokens_in, tokens_out) from an Anthropic SDK response."""
    usage = getattr(response, "usage", None)
    return (
        response.content[0].text,
        getattr(usage, "input_tokens", 0) or 0,
        getattr(usage, "output_tokens", 0) or 0,
    )


async def run_metered(
    provider: str,
    model: str,
    sync_call: Callable[[], Any],
    extract: Callable[[Any], Tuple[str, int, int]],
) -> str:
    """Run a blocking provider call in a thread, record usage, return content.

    sync_call performs the HTTP/SDK request and returns the raw response.
    extract(raw) must return (content, tokens_in, tokens_out).
    Errors are recorded with status="error" and re-raised unchanged.
    """
    started = time.monotonic()
    try:
        raw = await asyncio.to_thread(sync_call)
    except Exception as exc:
        await health.mark_failure(provider)
        await record_llm_usage(
            provider=provider, model=model, latency_ms=_elapsed_ms(started),
            status="error", error=str(exc),
        )
        raise
    content, tokens_in, tokens_out = extract(raw)
    await health.mark_success(provider)
    await record_llm_usage(
        provider=provider, model=model, tokens_in=tokens_in, tokens_out=tokens_out,
        latency_ms=_elapsed_ms(started), status="ok",
    )
    return content


def response_cache_key(provider: str, model: str, payload: str) -> str:
    """Deterministic cache key for an idempotent LLM request."""
    digest = hashlib.sha256(payload.encode()).hexdigest()[:32]
    return f"llm_resp:{provider}:{model}:{digest}"


async def run_metered_cached(
    provider: str,
    model: str,
    sync_call: Callable[[], Any],
    extract: Callable[[Any], Tuple[str, int, int]],
    *,
    cache_payload: str,
    cache_ttl: int,
) -> str:
    """run_metered with a response cache in front (Phase 5a).

    Identical requests (same provider/model/payload) within `cache_ttl`
    seconds skip the provider call entirely. Hits are metered with
    status="cache_hit", zero tokens and zero cost, so the admin dashboard
    can quantify savings.
    """
    key = response_cache_key(provider, model, cache_payload)
    try:
        cached = await cache.get_async(key)
    except Exception:
        cached = None
    if cached is not None:
        await record_llm_usage(
            provider=provider, model=model, latency_ms=0, status="cache_hit",
        )
        return cached
    content = await run_metered(provider, model, sync_call, extract)
    try:
        cache.set_value(key, content, cache_ttl)
    except Exception:
        pass  # cache is best-effort; the call already succeeded
    return content

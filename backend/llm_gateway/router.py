# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Routing and automatic fallback across LLM providers.

- call_pinned: invoke one explicit provider (unknown keys fall back to
  deepseek, preserving the legacy dispatcher behavior).
- call_with_fallback: walk an ordered chain, skipping providers that are
  unconfigured or circuit-broken, and falling through on retryable errors
  (429 / 5xx / timeouts / connection errors). Non-retryable errors (4xx,
  auth, config) raise immediately — they would fail on every provider.
- anthropic_to_internal: translate Anthropic Messages API request to the
  internal (system_msg, user_msg) format used by providers.
- internal_to_anthropic_response: translate provider output back to
  Anthropic Messages API response format.
"""
import asyncio
import logging
import re
import uuid
from typing import Any, Optional, Sequence, Tuple

from llm_gateway import config_store, health, registry

logger = logging.getLogger(__name__)

# Ordered fallback chains per logical task, used when Mongo has no provider
# docs (fresh env-only deployment). Once llm_providers is seeded, the default
# chain is built from the docs ordered by `priority` (admin-editable).
TASK_ROUTES: dict[str, list[str]] = {
    "default": ["deepseek", "minimax", "mimo"],
}

RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}

_RETRYABLE_CLASS_NAMES = {
    "APIConnectionError",   # openai: network-level failure
    "APITimeoutError",      # openai: request timeout
    "RateLimitError",       # openai: 429 (also has status_code, belt & braces)
    "InternalServerError",  # openai: 5xx
    "TimeoutException",     # httpx
    "TransportError",       # httpx
}

_STATUS_IN_MSG_RE = re.compile(r"returned (\d{3})")


def _is_retryable(exc: Exception) -> bool:
    """Classify whether an error is worth retrying on the next provider."""
    # FastAPI HTTPException (e.g. "API key not configured") -> never retryable
    status = getattr(exc, "status_code", None)
    detail = getattr(exc, "detail", None)
    if isinstance(status, int) and detail is not None:
        return False
    # openai.APIStatusError and friends expose .status_code
    if isinstance(status, int):
        return status in RETRYABLE_STATUS_CODES
    # Class-name checks avoid importing openai/httpx here
    for cls in type(exc).__mro__:
        if cls.__name__ in _RETRYABLE_CLASS_NAMES:
            return True
    # MiniMax adapter raises RuntimeError("MiniMax returned <code>: ...")
    match = _STATUS_IN_MSG_RE.search(str(exc))
    if match:
        return int(match.group(1)) in RETRYABLE_STATUS_CODES
    return False


async def _invoke(provider_key: str, system_msg: str, user_msg: str,
                  max_tokens: Optional[int], model: Optional[str]) -> str:
    entry = registry.get_provider(provider_key)
    if entry is None:
        raise RuntimeError(f"LLM provider '{provider_key}' is not registered")
    kwargs: dict = {}
    if max_tokens is not None:
        kwargs["max_tokens"] = max_tokens
    if model is not None and entry["accepts_model"]:
        kwargs["model"] = model
    return await entry["call"](system_msg, user_msg, **kwargs)


async def _is_usable(provider_key: str, entry: dict) -> bool:
    """Whether a provider can serve traffic right now: not admin-disabled and
    with credentials either in Mongo (Phase 3) or in the environment."""
    cfg = await config_store.get_config(provider_key)
    if cfg is not None:
        if not cfg.get("enabled", True):
            return False
        if cfg.get("api_key_enc"):
            return True
    return entry["is_configured"]()


async def get_default_chain(task: str = "default") -> list[str]:
    """Effective fallback chain: Mongo provider docs ordered by priority
    (enabled + registered only); falls back to the static TASK_ROUTES when
    the collection is empty or unreadable."""
    static = list(TASK_ROUTES.get(task, TASK_ROUTES["default"]))
    try:
        cfgs = await config_store.get_all_configs()
        if not cfgs:
            return static
        ordered = sorted(cfgs.values(), key=lambda c: c.get("priority", 999))
        chain = [
            c["key"] for c in ordered
            if c.get("enabled", True) and registry.get_provider(c["key"]) is not None
        ]
        return chain or static
    except Exception:
        return static


# Model aliases (Phase 5b), resolvable by call_pinned:
#   auto  → the whole default fallback chain (OmniRoute-style "never stop")
#   cheap → enabled provider with the lowest per-token cost (Mongo pricing)
#   fast  → deepseek with the flash variant
MODEL_ALIASES = ("auto", "cheap", "fast")


async def _cheapest_provider() -> Optional[str]:
    """Enabled + registered provider with the lowest in+out cost per 1M tokens.
    Subscription providers (0/0) win — zero marginal cost."""
    try:
        cfgs = await config_store.get_all_configs()
        best_key, best_cost = None, float("inf")
        for cfg in cfgs.values():
            if not cfg.get("enabled", True):
                continue
            if registry.get_provider(cfg["key"]) is None:
                continue
            cost = float(cfg.get("cost_in_per_1m", 0)) + float(cfg.get("cost_out_per_1m", 0))
            if cost < best_cost:
                best_key, best_cost = cfg["key"], cost
        return best_key
    except Exception:
        return None


async def call_pinned(
    provider: str,
    system_msg: str,
    user_msg: str,
    *,
    max_tokens: Optional[int] = None,
    model: Optional[str] = None,
) -> str:
    """Call one explicit provider. Aliases (auto/cheap/fast) are resolved first.
    Unknown providers fall back to deepseek, matching the legacy dispatchers."""
    if provider == "auto":
        return await call_with_fallback(
            await get_default_chain(), system_msg, user_msg,
            max_tokens=max_tokens, model=model,
        )
    if provider == "cheap":
        provider = (await _cheapest_provider()) or "deepseek"
    elif provider == "fast":
        provider, model = "deepseek", model or "deepseek-v4-flash"

    entry = registry.get_provider(provider)
    if entry is None:
        logger.warning("Unknown LLM provider '%s' — falling back to deepseek", provider)
        provider = "deepseek"
    return await _invoke(provider, system_msg, user_msg, max_tokens, model)


async def call_with_fallback(
    chain: Sequence[str],
    system_msg: str,
    user_msg: str,
    *,
    max_tokens: Optional[int] = None,
    model: Optional[str] = None,
    retries_per_provider: int = 0,
    retry_base_delay: float = 1.0,
) -> str:
    """Try each provider in `chain` until one succeeds.

    Skips providers that are unconfigured or circuit-broken. Falls through on
    retryable errors; raises non-retryable errors immediately. Optionally
    retries the same provider (exponential backoff) before moving on.
    Raises the last retryable error when every candidate fails.
    """
    last_exc: Optional[Exception] = None
    attempted: list[str] = []

    for provider_key in chain:
        entry = registry.get_provider(provider_key)
        if entry is None or not await _is_usable(provider_key, entry):
            continue
        if not await health.is_available(provider_key):
            logger.info("LLM routing: skipping %s (circuit breaker open)", provider_key)
            continue

        attempted.append(provider_key)
        for attempt in range(retries_per_provider + 1):
            try:
                if attempted and provider_key != attempted[0]:
                    logger.info("LLM routing: falling back to %s", provider_key)
                return await _invoke(provider_key, system_msg, user_msg, max_tokens, model)
            except Exception as exc:
                if not _is_retryable(exc):
                    raise
                last_exc = exc
                if attempt < retries_per_provider:
                    delay = retry_base_delay * (2 ** attempt)
                    logger.warning(
                        "LLM provider %s failed (retryable: %s) — retrying in %.1fs",
                        provider_key, exc, delay,
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.warning(
                        "LLM provider %s failed (retryable: %s) — trying next in chain",
                        provider_key, exc,
                    )

    if last_exc is None:
        raise RuntimeError(
            f"No configured LLM provider available (chain={list(chain)}). "
            "Check API keys in the environment."
        )
    raise last_exc


# ---------------------------------------------------------------------------
# Anthropic Messages API ↔ Internal format translation
# ---------------------------------------------------------------------------

def _extract_text(content: Any) -> str:
    """Extract plain text from an Anthropic content block (string or list)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
            elif isinstance(block, str):
                parts.append(block)
        return "\n".join(parts)
    return str(content)


def anthropic_to_internal(
    messages: list[dict],
    system: Optional[str] = None,
) -> Tuple[str, str]:
    """Translate an Anthropic Messages API request to internal format.

    Accepts the ``messages`` array and optional ``system`` parameter from an
    Anthropic-style request and returns ``(system_msg, user_msg)`` — the
    plain-string pair consumed by every registered provider.

    Extraction rules:
    - ``system`` param (or first ``{"role": "system"}`` message) → system_msg
    - All ``{"role": "user"}`` messages → concatenated user_msg
    - Content can be a plain string or a list of content blocks
    """
    system_msg = system or ""
    user_parts: list[str] = []

    for msg in messages:
        role = msg.get("role", "")
        text = _extract_text(msg.get("content", ""))
        if role == "system" and not system_msg:
            system_msg = text
        elif role == "user":
            user_parts.append(text)

    user_msg = "\n".join(user_parts) or ""
    return system_msg, user_msg


def internal_to_anthropic_response(
    content: str,
    model: str = "",
    tokens_in: int = 0,
    tokens_out: int = 0,
) -> dict:
    """Wrap a plain-text provider response in Anthropic Messages API format."""
    return {
        "id": f"msg_{uuid.uuid4().hex[:24]}",
        "type": "message",
        "role": "assistant",
        "content": [{"type": "text", "text": content}],
        "model": model,
        "stop_reason": "end_turn",
        "usage": {
            "input_tokens": tokens_in,
            "output_tokens": tokens_out,
        },
    }

# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""LLM gateway: unified metering, pricing, routing and resilience for LLM calls.

Phase 1: every provider call funnels through run_metered(), capturing token
usage, latency and cost into the llm_usage collection.
Phase 2: provider registry, per-provider circuit breaker (health) and
fallback routing (router).
"""
from llm_gateway.context import get_llm_context, set_llm_endpoint, set_llm_user
from llm_gateway.metering import (
    extract_anthropic_response,
    extract_openai_response,
    record_llm_usage,
    response_cache_key,
    run_metered,
    run_metered_cached,
)
from llm_gateway.pricing import estimate_cost
from llm_gateway.registry import configured_providers, get_provider, register_provider
from llm_gateway.router import (
    TASK_ROUTES,
    anthropic_to_internal,
    call_pinned,
    call_with_fallback,
    internal_to_anthropic_response,
)

__all__ = [
    "get_llm_context",
    "set_llm_endpoint",
    "set_llm_user",
    "extract_anthropic_response",
    "extract_openai_response",
    "record_llm_usage",
    "response_cache_key",
    "run_metered",
    "run_metered_cached",
    "estimate_cost",
    "configured_providers",
    "get_provider",
    "register_provider",
    "TASK_ROUTES",
    "anthropic_to_internal",
    "call_pinned",
    "call_with_fallback",
    "internal_to_anthropic_response",
]

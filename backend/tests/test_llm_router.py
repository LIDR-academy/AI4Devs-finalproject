# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Unit tests for llm_gateway Phase 2: registry, circuit breaker and fallback
routing. Self-contained: fake providers, in-memory cache, no server/Mongo.
"""
import sys
from pathlib import Path

import pytest
import pytest_asyncio

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import cache  # noqa: E402
from llm_gateway import config_store, health, registry, router  # noqa: E402


@pytest.fixture(autouse=True)
def _stub_config_store(monkeypatch):
    """Phase-2 tests ignore Mongo configs: stub the store to 'empty' so tests
    stay hermetic and fast (no server-selection timeouts)."""
    async def _none(key):
        return None

    async def _empty():
        return {}

    monkeypatch.setattr(config_store, "get_config", _none)
    monkeypatch.setattr(config_store, "get_all_configs", _empty)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def fake_registry():
    """Swap the global registry with fakes; restore afterwards."""
    snapshot = dict(registry._providers)
    registry._providers.clear()
    yield registry
    registry._providers.clear()
    registry._providers.update(snapshot)


@pytest_asyncio.fixture(autouse=True)
async def _clean_health_keys():
    for provider in ("p1", "p2", "p3", "deepseek", "minimax", "mimo"):
        await cache.delete(f"llm_health:failures:{provider}")
        await cache.delete(f"llm_health:cooldown:{provider}")
    yield


def make_provider(response="ok", error=None, configured=True, accepts_model=False):
    """Build a fake registry entry. `calls` captures invocation kwargs."""
    calls = []

    async def _call(system_msg, user_msg, **kwargs):
        calls.append({"system": system_msg, "user": user_msg, **kwargs})
        if error is not None:
            raise error
        return response

    entry = {
        "call": _call,
        "is_configured": lambda: configured,
        "accepts_model": accepts_model,
        "calls": calls,
    }
    return entry


class _StatusError(Exception):
    """openai-style error carrying .status_code (and no .detail)."""

    def __init__(self, status_code, msg="boom"):
        super().__init__(msg)
        self.status_code = status_code


# ---------------------------------------------------------------------------
# registry
# ---------------------------------------------------------------------------

class TestRegistry:
    def test_register_and_resolve(self, fake_registry):
        entry = make_provider()
        fake_registry.register_provider("p1", entry["call"], is_configured=entry["is_configured"])
        assert fake_registry.get_provider("p1") is not None
        assert fake_registry.get_provider("nope") is None

    def test_configured_providers_filters_by_key_presence(self, fake_registry):
        fake_registry.register_provider("p1", make_provider()["call"], is_configured=lambda: True)
        fake_registry.register_provider("p2", make_provider()["call"], is_configured=lambda: False)
        assert fake_registry.configured_providers() == ["p1"]


# ---------------------------------------------------------------------------
# health (circuit breaker)
# ---------------------------------------------------------------------------

class TestHealth:
    @pytest.mark.asyncio
    async def test_available_by_default(self):
        assert await health.is_available("p1") is True

    @pytest.mark.asyncio
    async def test_breaker_opens_after_threshold(self):
        for _ in range(health.FAILURE_THRESHOLD - 1):
            await health.mark_failure("p1")
        assert await health.is_available("p1") is True
        await health.mark_failure("p1")
        assert await health.is_available("p1") is False

    @pytest.mark.asyncio
    async def test_success_resets_counter(self):
        await health.mark_failure("p1")
        await health.mark_failure("p1")
        await health.mark_success("p1")
        await health.mark_failure("p1")
        assert await health.is_available("p1") is True

    @pytest.mark.asyncio
    async def test_counter_resets_after_opening(self):
        for _ in range(health.FAILURE_THRESHOLD):
            await health.mark_failure("p1")
        status = await health.get_status("p1")
        assert status["available"] is False
        assert status["consecutive_failures"] == 0

    @pytest.mark.asyncio
    async def test_fail_open_on_store_error(self, monkeypatch):
        async def boom(*args, **kwargs):
            raise RuntimeError("cache down")
        monkeypatch.setattr(cache, "get_async", boom)
        assert await health.is_available("p1") is True


# ---------------------------------------------------------------------------
# router._is_retryable
# ---------------------------------------------------------------------------

class TestRetryable:
    def test_openai_style_status_codes(self):
        assert router._is_retryable(_StatusError(429)) is True
        assert router._is_retryable(_StatusError(503)) is True
        assert router._is_retryable(_StatusError(500)) is True
        assert router._is_retryable(_StatusError(400)) is False
        assert router._is_retryable(_StatusError(401)) is False

    def test_fastapi_http_exception_not_retryable(self):
        from fastapi import HTTPException
        assert router._is_retryable(HTTPException(status_code=500, detail="key not configured")) is False
        assert router._is_retryable(HTTPException(status_code=503, detail="wrapped")) is False

    def test_minimax_runtime_error_message(self):
        assert router._is_retryable(RuntimeError("MiniMax returned 503: overloaded")) is True
        assert router._is_retryable(RuntimeError("MiniMax returned 429: slow down")) is True
        assert router._is_retryable(RuntimeError("MiniMax returned 400: bad request")) is False

    def test_class_name_detection(self):
        class APITimeoutError(Exception):
            pass
        assert router._is_retryable(APITimeoutError("t/o")) is True

    def test_plain_value_error_not_retryable(self):
        assert router._is_retryable(ValueError("bad json")) is False


# ---------------------------------------------------------------------------
# router.call_pinned
# ---------------------------------------------------------------------------

class TestCallPinned:
    @pytest.mark.asyncio
    async def test_calls_registered_provider(self, fake_registry):
        entry = make_provider(response="hola")
        fake_registry.register_provider("p1", entry["call"], is_configured=entry["is_configured"])
        result = await router.call_pinned("p1", "sys", "usr")
        assert result == "hola"
        assert entry["calls"][0]["system"] == "sys"

    @pytest.mark.asyncio
    async def test_unknown_provider_falls_back_to_deepseek(self, fake_registry):
        entry = make_provider(response="ds")
        fake_registry.register_provider("deepseek", entry["call"], is_configured=entry["is_configured"])
        result = await router.call_pinned("provider-inexistente", "sys", "usr")
        assert result == "ds"

    @pytest.mark.asyncio
    async def test_model_only_passed_when_accepted(self, fake_registry):
        accepts = make_provider(accepts_model=True)
        rejects = make_provider(accepts_model=False)
        fake_registry.register_provider("p1", accepts["call"], is_configured=accepts["is_configured"], accepts_model=True)
        fake_registry.register_provider("p2", rejects["call"], is_configured=rejects["is_configured"], accepts_model=False)
        await router.call_pinned("p1", "s", "u", model="deepseek-v4-flash")
        await router.call_pinned("p2", "s", "u", model="deepseek-v4-flash")
        assert accepts["calls"][0]["model"] == "deepseek-v4-flash"
        assert "model" not in rejects["calls"][0]

    @pytest.mark.asyncio
    async def test_max_tokens_omitted_when_none(self, fake_registry):
        entry = make_provider()
        fake_registry.register_provider("p1", entry["call"], is_configured=entry["is_configured"])
        await router.call_pinned("p1", "s", "u")
        assert "max_tokens" not in entry["calls"][0]
        await router.call_pinned("p1", "s", "u", max_tokens=8192)
        assert entry["calls"][1]["max_tokens"] == 8192


# ---------------------------------------------------------------------------
# router.call_with_fallback
# ---------------------------------------------------------------------------

class TestCallWithFallback:
    @pytest.mark.asyncio
    async def test_success_on_first_provider(self, fake_registry):
        entry = make_provider(response="primero")
        fake_registry.register_provider("p1", entry["call"], is_configured=entry["is_configured"])
        result = await router.call_with_fallback(["p1", "p2"], "s", "u")
        assert result == "primero"

    @pytest.mark.asyncio
    async def test_skips_unconfigured_providers(self, fake_registry):
        off = make_provider(configured=False)
        on = make_provider(response="segundo")
        fake_registry.register_provider("p1", off["call"], is_configured=off["is_configured"])
        fake_registry.register_provider("p2", on["call"], is_configured=on["is_configured"])
        result = await router.call_with_fallback(["p1", "p2"], "s", "u")
        assert result == "segundo"
        assert off["calls"] == []

    @pytest.mark.asyncio
    async def test_falls_through_on_retryable_error(self, fake_registry):
        failing = make_provider(error=_StatusError(429, "rate limited"))
        backup = make_provider(response="backup")
        fake_registry.register_provider("p1", failing["call"], is_configured=failing["is_configured"])
        fake_registry.register_provider("p2", backup["call"], is_configured=backup["is_configured"])
        result = await router.call_with_fallback(["p1", "p2"], "s", "u")
        assert result == "backup"
        assert len(failing["calls"]) == 1
        assert len(backup["calls"]) == 1

    @pytest.mark.asyncio
    async def test_non_retryable_raises_immediately(self, fake_registry):
        failing = make_provider(error=_StatusError(400, "bad request"))
        backup = make_provider(response="backup")
        fake_registry.register_provider("p1", failing["call"], is_configured=failing["is_configured"])
        fake_registry.register_provider("p2", backup["call"], is_configured=backup["is_configured"])
        with pytest.raises(_StatusError):
            await router.call_with_fallback(["p1", "p2"], "s", "u")
        assert backup["calls"] == []

    @pytest.mark.asyncio
    async def test_skips_circuit_open_provider(self, fake_registry):
        broken = make_provider(response="roto")
        healthy = make_provider(response="sano")
        fake_registry.register_provider("p1", broken["call"], is_configured=broken["is_configured"])
        fake_registry.register_provider("p2", healthy["call"], is_configured=healthy["is_configured"])
        for _ in range(health.FAILURE_THRESHOLD):
            await health.mark_failure("p1")
        result = await router.call_with_fallback(["p1", "p2"], "s", "u")
        assert result == "sano"
        assert broken["calls"] == []

    @pytest.mark.asyncio
    async def test_all_fail_raises_last_error(self, fake_registry):
        e1 = make_provider(error=_StatusError(500, "uno"))
        e2 = make_provider(error=_StatusError(503, "dos"))
        fake_registry.register_provider("p1", e1["call"], is_configured=e1["is_configured"])
        fake_registry.register_provider("p2", e2["call"], is_configured=e2["is_configured"])
        with pytest.raises(_StatusError, match="dos"):
            await router.call_with_fallback(["p1", "p2"], "s", "u")

    @pytest.mark.asyncio
    async def test_none_configured_raises_runtime_error(self, fake_registry):
        off = make_provider(configured=False)
        fake_registry.register_provider("p1", off["call"], is_configured=off["is_configured"])
        with pytest.raises(RuntimeError, match="No configured LLM provider"):
            await router.call_with_fallback(["p1"], "s", "u")

    @pytest.mark.asyncio
    async def test_retry_same_provider_with_backoff(self, fake_registry):
        flaky_calls = []

        async def flaky(system_msg, user_msg, **kwargs):
            flaky_calls.append(1)
            if len(flaky_calls) < 3:
                raise _StatusError(429, "slow down")
            return "tercera"

        fake_registry.register_provider("p1", flaky, is_configured=lambda: True)
        result = await router.call_with_fallback(
            ["p1"], "s", "u", retries_per_provider=2, retry_base_delay=0.01,
        )
        assert result == "tercera"
        assert len(flaky_calls) == 3


# ---------------------------------------------------------------------------
# routers.ai integration: _call_default_llm + registration
# ---------------------------------------------------------------------------

class TestAiModuleIntegration:
    @pytest.mark.asyncio
    async def test_providers_registered_on_import(self):
        from routers import ai  # noqa: F401
        for key in ("deepseek", "minimax", "mimo", "opencode", "opencode-go"):
            assert registry.get_provider(key) is not None

    @pytest.mark.asyncio
    async def test_default_llm_falls_back_deepseek_to_minimax(self, fake_registry, monkeypatch):
        from routers import ai

        failing = make_provider(error=_StatusError(503, "deepseek down"))
        backup = make_provider(response="minimax contesta")
        fake_registry.register_provider("deepseek", failing["call"], is_configured=lambda: True, accepts_model=True)
        fake_registry.register_provider("minimax", backup["call"], is_configured=lambda: True)
        monkeypatch.setattr(ai, "DEFAULT_LLM_PROVIDER", "deepseek")

        result = await ai._call_default_llm("sys", "user")
        assert result == "minimax contesta"

    @pytest.mark.asyncio
    async def test_default_llm_honors_pinned_provider(self, fake_registry, monkeypatch):
        from routers import ai

        pinned = make_provider(response="mimo directo")
        fake_registry.register_provider("mimo", pinned["call"], is_configured=lambda: True)
        monkeypatch.setattr(ai, "DEFAULT_LLM_PROVIDER", "mimo")

        result = await ai._call_default_llm("sys", "user")
        assert result == "mimo directo"

    @pytest.mark.asyncio
    async def test_default_llm_unknown_env_provider_uses_chain(self, fake_registry, monkeypatch):
        from routers import ai

        entry = make_provider(response="chain")
        fake_registry.register_provider("deepseek", entry["call"], is_configured=lambda: True)
        monkeypatch.setattr(ai, "DEFAULT_LLM_PROVIDER", "typo-provider")

        result = await ai._call_default_llm("sys", "user")
        assert result == "chain"

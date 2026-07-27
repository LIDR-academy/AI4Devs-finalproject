# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Unit tests for llm_gateway Phase 5: response cache (5a) and model aliases
auto/cheap/fast (5b). Self-contained: fake db, in-memory cache.
"""
import sys
from pathlib import Path

import pytest
import pytest_asyncio

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import cache  # noqa: E402
from llm_gateway import config_store, metering, registry, router  # noqa: E402
from routers import ai_generator  # noqa: E402  (import-time provider registration)


# ---------------------------------------------------------------------------
# Fakes & fixtures
# ---------------------------------------------------------------------------

class _FakeUsageCollection:
    def __init__(self):
        self.docs = []

    async def insert_one(self, doc):
        self.docs.append(doc)


class _FakeDb:
    def __init__(self):
        self.llm_usage = _FakeUsageCollection()
        self._providers_docs = []


@pytest.fixture
def fake_db(monkeypatch):
    fake = _FakeDb()
    monkeypatch.setattr(metering, "db", fake)
    return fake


@pytest.fixture
def fake_registry():
    snapshot = dict(registry._providers)
    registry._providers.clear()
    yield registry
    registry._providers.clear()
    registry._providers.update(snapshot)


@pytest_asyncio.fixture(autouse=True)
async def _clean_cache():
    await cache.delete(config_store.CONFIG_CACHE_KEY)
    yield
    # purge response-cache keys created by tests
    for key in list(cache._store.keys()):
        if key.startswith("llm_resp:"):
            cache._store.pop(key, None)
    await cache.delete(config_store.CONFIG_CACHE_KEY)


def _register(key, response="ok", configured=True, accepts_model=True):
    calls = []

    async def _call(system_msg, user_msg, **kwargs):
        calls.append({"system": system_msg, "user": user_msg, **kwargs})
        return response

    registry.register_provider(key, _call, is_configured=lambda: configured,
                               accepts_model=accepts_model)
    return calls


def _stub_configs(monkeypatch, docs):
    async def _all():
        return {d["key"]: d for d in docs}

    async def _one(key):
        return {d["key"]: d for d in docs}.get(key)

    monkeypatch.setattr(config_store, "get_all_configs", _all)
    monkeypatch.setattr(config_store, "get_config", _one)


# ---------------------------------------------------------------------------
# 5a — response cache
# ---------------------------------------------------------------------------

class TestResponseCache:
    def test_cache_key_deterministic(self):
        k1 = metering.response_cache_key("deepseek", "flash", "payload")
        k2 = metering.response_cache_key("deepseek", "flash", "payload")
        k3 = metering.response_cache_key("deepseek", "flash", "otro")
        assert k1 == k2
        assert k1 != k3
        assert k1.startswith("llm_resp:deepseek:flash:")

    @pytest.mark.asyncio
    async def test_second_identical_call_hits_cache(self, fake_db):
        provider_calls = []

        def sync_call():
            provider_calls.append(1)
            return "raw"

        def extract(raw):
            return ("contenido-cacheable", 100, 50)

        kwargs = dict(cache_payload="mismo-payload", cache_ttl=300)
        first = await metering.run_metered_cached("deepseek", "m", sync_call, extract, **kwargs)
        second = await metering.run_metered_cached("deepseek", "m", sync_call, extract, **kwargs)

        assert first == second == "contenido-cacheable"
        assert len(provider_calls) == 1, "la segunda llamada no debe llegar al provider"

        statuses = [d["status"] for d in fake_db.llm_usage.docs]
        assert statuses == ["ok", "cache_hit"]
        hit = fake_db.llm_usage.docs[1]
        assert hit["tokens_in"] == 0
        assert hit["cost_usd"] == 0.0

    @pytest.mark.asyncio
    async def test_different_payloads_miss_cache(self, fake_db):
        calls = []

        def sync_call():
            calls.append(1)
            return "raw"

        extract = lambda raw: ("resp", 1, 1)  # noqa: E731

        await metering.run_metered_cached("deepseek", "m", sync_call, extract,
                                          cache_payload="a", cache_ttl=300)
        await metering.run_metered_cached("deepseek", "m", sync_call, extract,
                                          cache_payload="b", cache_ttl=300)
        assert len(calls) == 2

    @pytest.mark.asyncio
    async def test_cache_read_failure_still_calls_provider(self, fake_db, monkeypatch):
        async def boom(key):
            raise RuntimeError("cache down")
        monkeypatch.setattr(metering.cache, "get_async", boom)

        extract = lambda raw: ("resp-directa", 1, 1)  # noqa: E731
        result = await metering.run_metered_cached(
            "deepseek", "m", lambda: "raw", extract,
            cache_payload="x", cache_ttl=300,
        )
        assert result == "resp-directa"


# ---------------------------------------------------------------------------
# 5b — model aliases
# ---------------------------------------------------------------------------

class TestAliases:
    @pytest.mark.asyncio
    async def test_auto_walks_default_chain(self, fake_registry, monkeypatch):
        calls_p1 = _register("p1", response="p1-ok")
        _register("p2")
        _stub_configs(monkeypatch, [
            {"key": "p1", "enabled": True, "priority": 1},
            {"key": "p2", "enabled": True, "priority": 2},
        ])
        result = await router.call_pinned("auto", "s", "u")
        assert result == "p1-ok"
        assert len(calls_p1) == 1

    @pytest.mark.asyncio
    async def test_auto_falls_back_on_retryable_error(self, fake_registry, monkeypatch):
        class _Err(Exception):
            status_code = 503

        async def failing(s, u, **kw):
            raise _Err("down")

        registry.register_provider("p1", failing, is_configured=lambda: True)
        _register("p2", response="p2-salva")
        _stub_configs(monkeypatch, [
            {"key": "p1", "enabled": True, "priority": 1},
            {"key": "p2", "enabled": True, "priority": 2},
        ])
        result = await router.call_pinned("auto", "s", "u")
        assert result == "p2-salva"

    @pytest.mark.asyncio
    async def test_cheap_picks_lowest_cost(self, fake_registry, monkeypatch):
        _register("expensive", response="caro")
        _register("cheap-one", response="barato")
        _stub_configs(monkeypatch, [
            {"key": "expensive", "enabled": True, "priority": 1,
             "cost_in_per_1m": 1.0, "cost_out_per_1m": 3.0},
            {"key": "cheap-one", "enabled": True, "priority": 2,
             "cost_in_per_1m": 0.1, "cost_out_per_1m": 0.2},
        ])
        result = await router.call_pinned("cheap", "s", "u")
        assert result == "barato"

    @pytest.mark.asyncio
    async def test_cheap_subscription_wins(self, fake_registry, monkeypatch):
        _register("sub", response="suscripcion")
        _register("paid", response="pago")
        _stub_configs(monkeypatch, [
            {"key": "sub", "enabled": True, "priority": 1,
             "cost_in_per_1m": 0.0, "cost_out_per_1m": 0.0},
            {"key": "paid", "enabled": True, "priority": 2,
             "cost_in_per_1m": 0.27, "cost_out_per_1m": 1.10},
        ])
        assert await router.call_pinned("cheap", "s", "u") == "suscripcion"

    @pytest.mark.asyncio
    async def test_cheap_without_mongo_falls_back_deepseek(self, fake_registry, monkeypatch):
        calls = _register("deepseek", response="ds")
        _stub_configs(monkeypatch, [])
        assert await router.call_pinned("cheap", "s", "u") == "ds"
        assert len(calls) == 1

    @pytest.mark.asyncio
    async def test_fast_uses_deepseek_flash(self, fake_registry, monkeypatch):
        calls = _register("deepseek", response="rapido")
        _stub_configs(monkeypatch, [])
        result = await router.call_pinned("fast", "s", "u")
        assert result == "rapido"
        assert calls[0]["model"] == "deepseek-v4-flash"

    @pytest.mark.asyncio
    async def test_ai_generator_call_llm_accepts_aliases(self, fake_registry, monkeypatch):
        _register("deepseek", response="via-alias")
        _stub_configs(monkeypatch, [])
        result = await ai_generator._call_llm("fast", "sys", "user")
        assert result == "via-alias"
        # and the validation set includes them
        assert {"auto", "cheap", "fast"} <= ai_generator.VALID_MODELS

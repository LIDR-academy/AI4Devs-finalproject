# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Unit tests for the llm_gateway module (Phase 1: metering + pricing + context).

These tests are self-contained: they mock the Mongo handle and the provider
SDKs, so they run without a server, database or API keys.
"""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from llm_gateway import config_store, metering, pricing  # noqa: E402
from llm_gateway.context import get_llm_context, set_llm_endpoint, set_llm_user  # noqa: E402


@pytest.fixture(autouse=True)
def _stub_config_store(monkeypatch):
    """Keep tests hermetic: no Mongo-backed provider configs (Phase 3 store)."""
    async def _none(key):
        return None

    async def _empty():
        return {}

    monkeypatch.setattr(config_store, "get_config", _none)
    monkeypatch.setattr(config_store, "get_all_configs", _empty)


# ---------------------------------------------------------------------------
# Fakes
# ---------------------------------------------------------------------------

class _FakeCollection:
    def __init__(self):
        self.docs = []

    async def insert_one(self, doc):
        self.docs.append(doc)


class _FakeDb:
    def __init__(self):
        self.llm_usage = _FakeCollection()


@pytest.fixture
def fake_db(monkeypatch):
    fake = _FakeDb()
    monkeypatch.setattr(metering, "db", fake)
    return fake


@pytest.fixture(autouse=True)
def _reset_context():
    user_token = set_llm_user(None)
    ep_token = set_llm_endpoint(None)
    yield
    # contextvars reset implicitly per test via fresh set above


# ---------------------------------------------------------------------------
# pricing.estimate_cost
# ---------------------------------------------------------------------------

class TestPricing:
    def test_known_model(self):
        # deepseek-v4-pro: $0.27 in / $1.10 out per 1M
        cost = pricing.estimate_cost("deepseek-v4-pro", 1_000_000, 1_000_000)
        assert cost == pytest.approx(1.37)

    def test_known_model_partial_tokens(self):
        cost = pricing.estimate_cost("MiniMax-M3", 1000, 500)  # 0.30 / 1.20 per 1M
        assert cost == pytest.approx((1000 * 0.30 + 500 * 1.20) / 1_000_000)

    def test_unknown_model_falls_back_to_provider(self):
        cost = pricing.estimate_cost("some-new-model", 1_000_000, 0, provider="mimo")
        assert cost == pytest.approx(1.00)

    def test_subscription_provider_is_zero(self):
        assert pricing.estimate_cost("whatever", 999_999, 999_999, provider="opencode-go") == 0.0

    def test_unknown_everything_uses_generic_fallback(self):
        cost = pricing.estimate_cost("mystery", 1_000_000, 1_000_000)
        assert cost == pytest.approx(0.30 + 1.20)


# ---------------------------------------------------------------------------
# context
# ---------------------------------------------------------------------------

class TestContext:
    def test_defaults_are_none(self):
        assert get_llm_context() == {"user_id": None, "endpoint": None}

    def test_setters(self):
        set_llm_user("user_123")
        set_llm_endpoint("/api/ai/deepseek/chat")
        assert get_llm_context() == {"user_id": "user_123", "endpoint": "/api/ai/deepseek/chat"}


# ---------------------------------------------------------------------------
# metering.record_llm_usage
# ---------------------------------------------------------------------------

class TestRecordUsage:
    @pytest.mark.asyncio
    async def test_inserts_expected_document(self, fake_db):
        set_llm_user("user_abc")
        set_llm_endpoint("/api/ai/generate-bpmn")
        await metering.record_llm_usage(
            provider="deepseek", model="deepseek-v4-pro",
            tokens_in=1000, tokens_out=500, latency_ms=123,
        )
        assert len(fake_db.llm_usage.docs) == 1
        doc = fake_db.llm_usage.docs[0]
        assert doc["user_id"] == "user_abc"
        assert doc["endpoint"] == "/api/ai/generate-bpmn"
        assert doc["provider"] == "deepseek"
        assert doc["model"] == "deepseek-v4-pro"
        assert doc["tokens_in"] == 1000
        assert doc["tokens_out"] == 500
        assert doc["cost_usd"] == pytest.approx((1000 * 0.27 + 500 * 1.10) / 1_000_000)
        assert doc["latency_ms"] == 123
        assert doc["status"] == "ok"
        assert doc["error"] is None
        assert doc["created_at"]

    @pytest.mark.asyncio
    async def test_error_status_truncates_message(self, fake_db):
        await metering.record_llm_usage(
            provider="mimo", model="mimo-v2-pro", status="error", error="x" * 500,
        )
        doc = fake_db.llm_usage.docs[0]
        assert doc["status"] == "error"
        assert len(doc["error"]) == 300

    @pytest.mark.asyncio
    async def test_never_raises_when_db_fails(self, monkeypatch):
        class _Boom:
            @property
            def llm_usage(self):
                raise RuntimeError("mongo down")
        monkeypatch.setattr(metering, "db", _Boom())
        # Must not raise
        await metering.record_llm_usage(provider="deepseek", model="deepseek-v4-pro")


# ---------------------------------------------------------------------------
# metering.run_metered
# ---------------------------------------------------------------------------

class TestRunMetered:
    @pytest.mark.asyncio
    async def test_success_returns_content_and_records(self, fake_db):
        def sync_call():
            return {"raw": True}

        def extract(raw):
            return ("contenido", 10, 5)

        result = await metering.run_metered("deepseek", "deepseek-v4-flash", sync_call, extract)
        assert result == "contenido"
        doc = fake_db.llm_usage.docs[0]
        assert doc["status"] == "ok"
        assert doc["tokens_in"] == 10
        assert doc["tokens_out"] == 5
        assert doc["model"] == "deepseek-v4-flash"
        assert doc["latency_ms"] >= 0

    @pytest.mark.asyncio
    async def test_error_is_recorded_and_reraised(self, fake_db):
        def sync_call():
            raise ValueError("provider exploded")

        with pytest.raises(ValueError, match="provider exploded"):
            await metering.run_metered("minimax", "MiniMax-M3", sync_call, lambda r: ("", 0, 0))
        doc = fake_db.llm_usage.docs[0]
        assert doc["status"] == "error"
        assert "provider exploded" in doc["error"]
        assert doc["tokens_in"] == 0

    def test_extract_openai_response(self):
        class Usage:
            prompt_tokens = 42
            completion_tokens = 7

        class Msg:
            content = "hola"

        class Choice:
            message = Msg()

        class Resp:
            choices = [Choice()]
            usage = Usage()

        content, tin, tout = metering.extract_openai_response(Resp())
        assert (content, tin, tout) == ("hola", 42, 7)


# ---------------------------------------------------------------------------
# Provider instrumentation in routers/ai.py
# ---------------------------------------------------------------------------

class TestProviderInstrumentation:
    @pytest.mark.asyncio
    async def test_deepseek_records_usage(self, monkeypatch, fake_db):
        import openai
        from routers import ai

        class Usage:
            prompt_tokens = 120
            completion_tokens = 45

        class Msg:
            content = "xml generado"

        class Choice:
            message = Msg()

        class Resp:
            choices = [Choice()]
            usage = Usage()

        class Completions:
            def create(self, **kwargs):
                return Resp()

        class Chat:
            completions = Completions()

        class FakeOpenAI:
            def __init__(self, **kwargs):
                self.chat = Chat()

        monkeypatch.setattr(openai, "OpenAI", FakeOpenAI)
        monkeypatch.setattr(ai, "DEEPSEEK_API_KEY", "sk-test")

        result = await ai._call_deepseek("sys", "user", model="deepseek-v4-flash")

        assert result == "xml generado"
        assert len(fake_db.llm_usage.docs) == 1
        doc = fake_db.llm_usage.docs[0]
        assert doc["provider"] == "deepseek"
        assert doc["model"] == "deepseek-v4-flash"
        assert doc["tokens_in"] == 120
        assert doc["tokens_out"] == 45
        assert doc["status"] == "ok"

    @pytest.mark.asyncio
    async def test_deepseek_error_records_and_raises(self, monkeypatch, fake_db):
        import openai
        from routers import ai

        class FakeOpenAI:
            def __init__(self, **kwargs):
                raise ConnectionError("deepseek unreachable")

        monkeypatch.setattr(openai, "OpenAI", FakeOpenAI)
        monkeypatch.setattr(ai, "DEEPSEEK_API_KEY", "sk-test")

        with pytest.raises(ConnectionError):
            await ai._call_deepseek("sys", "user")

        doc = fake_db.llm_usage.docs[0]
        assert doc["provider"] == "deepseek"
        assert doc["status"] == "error"
        assert "unreachable" in doc["error"]

    @pytest.mark.asyncio
    async def test_minimax_records_usage(self, monkeypatch, fake_db):
        import httpx
        from routers import ai

        class Resp:
            status_code = 200
            text = ""

            def json(self):
                return {
                    "content": [{"type": "text", "text": "respuesta"}],
                    "usage": {"input_tokens": 10, "output_tokens": 5},
                }

        class FakeClient:
            def __init__(self, **kwargs):
                pass

            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def post(self, url, json=None, headers=None):
                return Resp()

        monkeypatch.setattr(httpx, "Client", FakeClient)
        monkeypatch.setattr(ai, "MINIMAX_API_KEY", "sk-test")

        result = await ai._call_minimax("sys", "user")

        assert result == "respuesta"
        doc = fake_db.llm_usage.docs[0]
        assert doc["provider"] == "minimax"
        assert doc["model"] == "MiniMax-M3"
        assert doc["tokens_in"] == 10
        assert doc["tokens_out"] == 5

    @pytest.mark.asyncio
    async def test_opencode_go_labeled_separately(self, monkeypatch, fake_db):
        import openai
        from routers import ai

        class Msg:
            content = "ok"

        class Choice:
            message = Msg()

        class Resp:
            choices = [Choice()]
            usage = None  # gateway may omit usage; must not break

        class Completions:
            def create(self, **kwargs):
                return Resp()

        class Chat:
            completions = Completions()

        class FakeOpenAI:
            def __init__(self, **kwargs):
                self.chat = Chat()

        monkeypatch.setattr(openai, "OpenAI", FakeOpenAI)
        monkeypatch.setattr(ai, "OPENCODE_API_KEY", "sk-test")

        result = await ai._call_opencode_go("sys", "user")

        assert result == "ok"
        doc = fake_db.llm_usage.docs[0]
        assert doc["provider"] == "opencode-go"
        assert doc["tokens_in"] == 0
        assert doc["tokens_out"] == 0
        assert doc["cost_usd"] == 0.0  # subscription provider

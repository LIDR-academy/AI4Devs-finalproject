# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Unit tests for llm_gateway Phase 3: key encryption, Mongo-backed provider
configs, runtime resolution and priority-ordered routing. Self-contained:
fake db, in-memory cache, no server/Mongo.
"""
import sys
from pathlib import Path

import pytest
import pytest_asyncio

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import cache  # noqa: E402
from llm_gateway import config_store, crypto, registry, router  # noqa: E402
from routers import llm_admin  # noqa: E402


# ---------------------------------------------------------------------------
# Fakes & fixtures
# ---------------------------------------------------------------------------

class _FakeCursor:
    def __init__(self, docs):
        self._docs = docs

    def sort(self, *args, **kwargs):
        return self

    async def to_list(self, n):
        return list(self._docs)


class _FakeProvidersCollection:
    def __init__(self):
        self.docs = []

    async def count_documents(self, q):
        return len(self.docs)

    async def insert_one(self, doc):
        self.docs.append(dict(doc))

    def find(self, q=None, projection=None):
        return _FakeCursor(self.docs)


class _FakeDb:
    def __init__(self):
        self.llm_providers = _FakeProvidersCollection()


@pytest.fixture
def fake_db(monkeypatch):
    fake = _FakeDb()
    monkeypatch.setattr(config_store, "db", fake)
    return fake


@pytest_asyncio.fixture(autouse=True)
async def _clean_state(monkeypatch):
    monkeypatch.setenv("LLM_KEYS_SECRET", "test-secret-phase3")
    await cache.delete(config_store.CONFIG_CACHE_KEY)
    snapshot = dict(registry._providers)
    yield
    registry._providers.clear()
    registry._providers.update(snapshot)
    await cache.delete(config_store.CONFIG_CACHE_KEY)


def _register(key, configured=True, response="ok"):
    calls = []

    async def _call(system_msg, user_msg, **kwargs):
        calls.append(kwargs)
        return response

    registry.register_provider(key, _call, is_configured=lambda: configured)
    return calls


# ---------------------------------------------------------------------------
# crypto
# ---------------------------------------------------------------------------

class TestCrypto:
    def test_roundtrip(self):
        token = crypto.encrypt_key("sk-super-secret-1234")
        assert token != "sk-super-secret-1234"
        assert crypto.decrypt_key(token) == "sk-super-secret-1234"

    def test_try_decrypt_garbage_returns_empty(self):
        assert crypto.try_decrypt("not-a-token") == ""

    def test_mask_key(self):
        assert crypto.mask_key("sk-abcdef123456") == "••••3456"
        assert crypto.mask_key("abc") == "••••"
        assert crypto.mask_key("") == ""

    def test_encrypt_without_secret_raises(self, monkeypatch):
        monkeypatch.delenv("LLM_KEYS_SECRET", raising=False)
        monkeypatch.delenv("SESSION_SECRET", raising=False)
        with pytest.raises(RuntimeError, match="LLM_KEYS_SECRET"):
            crypto.encrypt_key("sk-x")


# ---------------------------------------------------------------------------
# seed
# ---------------------------------------------------------------------------

SEEDS = [
    {"key": "deepseek", "label": "DeepSeek", "base_url": "https://api.deepseek.com",
     "env_api_key": "sk-env-deepseek", "models": ["deepseek-v4-pro"],
     "default_model": "deepseek-v4-pro", "priority": 10,
     "cost_in_per_1m": 0.27, "cost_out_per_1m": 1.10},
    {"key": "minimax", "label": "MiniMax", "base_url": "https://api.minimax.io",
     "env_api_key": "", "models": ["MiniMax-M3"], "default_model": "MiniMax-M3",
     "priority": 20, "cost_in_per_1m": 0.30, "cost_out_per_1m": 1.20},
]


class TestSeed:
    @pytest.mark.asyncio
    async def test_seed_inserts_docs_with_encrypted_keys(self, fake_db):
        inserted = await config_store.seed_providers_from_env(SEEDS)
        assert inserted is True
        docs = fake_db.llm_providers.docs
        assert len(docs) == 2
        ds = next(d for d in docs if d["key"] == "deepseek")
        assert ds["api_key_enc"]  # encrypted, non-empty
        assert "sk-env-deepseek" not in ds["api_key_enc"]
        assert crypto.decrypt_key(ds["api_key_enc"]) == "sk-env-deepseek"
        assert ds["has_env_key"] is True
        mm = next(d for d in docs if d["key"] == "minimax")
        assert mm["api_key_enc"] == ""
        assert mm["has_env_key"] is False

    @pytest.mark.asyncio
    async def test_seed_skips_when_collection_not_empty(self, fake_db):
        assert await config_store.seed_providers_from_env(SEEDS) is True
        assert await config_store.seed_providers_from_env(SEEDS) is False
        assert len(fake_db.llm_providers.docs) == 2

    @pytest.mark.asyncio
    async def test_seed_never_raises_on_db_error(self, monkeypatch):
        class _Boom:
            @property
            def llm_providers(self):
                raise RuntimeError("mongo down")
        monkeypatch.setattr(config_store, "db", _Boom())
        assert await config_store.seed_providers_from_env(SEEDS) is False


# ---------------------------------------------------------------------------
# resolve_runtime
# ---------------------------------------------------------------------------

class TestResolveRuntime:
    @pytest.mark.asyncio
    async def test_env_fallback_when_no_mongo_doc(self, fake_db):
        rt = await config_store.resolve_runtime(
            "deepseek", env_api_key="sk-env", default_base_url="https://env", default_model="m-env",
        )
        assert rt == {"api_key": "sk-env", "base_url": "https://env", "model": "m-env",
                      "enabled": True, "config_source": "env"}

    @pytest.mark.asyncio
    async def test_mongo_overrides_env(self, fake_db):
        await config_store.seed_providers_from_env(SEEDS)
        rt = await config_store.resolve_runtime(
            "deepseek", env_api_key="sk-env", default_base_url="https://env", default_model="m-env",
        )
        assert rt["api_key"] == "sk-env-deepseek"
        assert rt["base_url"] == "https://api.deepseek.com"
        assert rt["model"] == "deepseek-v4-pro"
        assert rt["config_source"] == "mongo"

    @pytest.mark.asyncio
    async def test_disabled_provider_reported(self, fake_db):
        await config_store.seed_providers_from_env(SEEDS)
        fake_db.llm_providers.docs[0]["enabled"] = False
        await config_store.invalidate_configs()
        rt = await config_store.resolve_runtime("deepseek", env_api_key="sk-env")
        assert rt["enabled"] is False

    @pytest.mark.asyncio
    async def test_corrupt_key_falls_back_to_env(self, fake_db):
        await config_store.seed_providers_from_env(SEEDS)
        fake_db.llm_providers.docs[0]["api_key_enc"] = "garbage-token"
        await config_store.invalidate_configs()
        rt = await config_store.resolve_runtime("deepseek", env_api_key="sk-env")
        assert rt["api_key"] == "sk-env"


# ---------------------------------------------------------------------------
# router: enabled flag, mongo-only keys, priority chain
# ---------------------------------------------------------------------------

class TestRouterPhase3:
    @pytest.mark.asyncio
    async def test_disabled_provider_skipped(self, fake_db):
        _register("p1", configured=True, response="p1")
        _register("p2", configured=True, response="p2-responde")
        fake_db.llm_providers.docs.append({
            "key": "p1", "enabled": False, "api_key_enc": "", "priority": 1,
        })
        await config_store.invalidate_configs()
        result = await router.call_with_fallback(["p1", "p2"], "s", "u")
        assert result == "p2-responde"

    @pytest.mark.asyncio
    async def test_mongo_only_key_is_usable(self, fake_db):
        _register("p1", configured=False, response="mongo-key-ok")
        fake_db.llm_providers.docs.append({
            "key": "p1", "enabled": True, "api_key_enc": crypto.encrypt_key("sk-mongo"),
            "priority": 1,
        })
        await config_store.invalidate_configs()
        result = await router.call_with_fallback(["p1"], "s", "u")
        assert result == "mongo-key-ok"

    @pytest.mark.asyncio
    async def test_default_chain_ordered_by_priority(self, fake_db):
        _register("deepseek")
        _register("minimax")
        _register("mimo")
        fake_db.llm_providers.docs.extend([
            {"key": "mimo", "enabled": True, "priority": 5},
            {"key": "deepseek", "enabled": True, "priority": 10},
            {"key": "minimax", "enabled": False, "priority": 1},  # disabled → excluded
        ])
        await config_store.invalidate_configs()
        chain = await router.get_default_chain()
        assert chain == ["mimo", "deepseek"]

    @pytest.mark.asyncio
    async def test_default_chain_static_when_no_mongo(self, fake_db):
        _register("deepseek")
        chain = await router.get_default_chain()
        assert chain == router.TASK_ROUTES["default"]

    @pytest.mark.asyncio
    async def test_default_chain_static_when_all_disabled(self, fake_db):
        _register("deepseek")
        fake_db.llm_providers.docs.append({"key": "deepseek", "enabled": False, "priority": 1})
        await config_store.invalidate_configs()
        chain = await router.get_default_chain()
        assert chain == router.TASK_ROUTES["default"]


# ---------------------------------------------------------------------------
# admin serialization (no secret leaks)
# ---------------------------------------------------------------------------

class TestAdminSerialization:
    def test_serialize_masks_key_and_hides_ciphertext(self):
        doc = {
            "key": "deepseek", "label": "DeepSeek", "base_url": "https://api.deepseek.com",
            "api_key_enc": crypto.encrypt_key("sk-live-9876"), "has_env_key": False,
            "models": ["deepseek-v4-pro"], "default_model": "deepseek-v4-pro",
            "enabled": True, "priority": 10,
            "cost_in_per_1m": 0.27, "cost_out_per_1m": 1.10,
            "created_at": "2026-01-01", "updated_at": "2026-01-02",
        }
        out = llm_admin.serialize_provider(doc)
        assert out["api_key_masked"] == "••••9876"
        assert out["has_api_key"] is True
        assert "api_key_enc" not in out
        assert "sk-live-9876" not in str(out)

    def test_serialize_without_key(self):
        out = llm_admin.serialize_provider({"key": "x", "api_key_enc": "", "has_env_key": False})
        assert out["has_api_key"] is False
        assert out["api_key_masked"] == ""

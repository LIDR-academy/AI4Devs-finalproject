# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""MongoDB-backed LLM provider configuration with env-var fallback.

The `llm_providers` collection is seeded from environment variables on first
startup (see routers/ai.py:LLM_PROVIDER_SEEDS and server.py). When a provider
doc exists and is enabled, its values (api_key, base_url, default_model,
priority, pricing) override the env defaults at call time. Reads go through a
short-TTL cache; admin writes invalidate it.

This module intentionally knows nothing about individual providers — seeds
and runtime fallbacks are passed in by callers, keeping it dependency-free.
"""
import logging
from datetime import datetime, timezone
from typing import Optional

import cache
from database import db
from llm_gateway.crypto import try_decrypt, try_encrypt

logger = logging.getLogger(__name__)

CONFIG_CACHE_KEY = "llm_gateway:provider_configs:v1"
CONFIG_CACHE_TTL = 30  # seconds


# ---------------------------------------------------------------------------
# Reads (cached)
# ---------------------------------------------------------------------------

async def _load_all() -> dict:
    docs = await db.llm_providers.find({}, {"_id": 0}).to_list(200)
    return {d["key"]: d for d in docs}


async def get_all_configs() -> dict:
    """All provider configs keyed by provider key. Never raises."""
    try:
        return await cache.get_or_set(CONFIG_CACHE_KEY, CONFIG_CACHE_TTL, _load_all)
    except Exception as e:
        logger.warning("LLM config store unavailable (%s) — env fallback active", e)
        return {}


async def get_config(key: str) -> Optional[dict]:
    return (await get_all_configs()).get(key)


async def invalidate_configs() -> None:
    await cache.delete(CONFIG_CACHE_KEY)


# ---------------------------------------------------------------------------
# Seed
# ---------------------------------------------------------------------------

async def seed_providers_from_env(seed_defs: list[dict]) -> bool:
    """Insert initial provider docs if the collection is empty.

    seed_defs items: {key, label, base_url, env_api_key, models, default_model,
                      priority, cost_in_per_1m, cost_out_per_1m}
    Returns True when seeding happened. Never raises (startup-safe)."""
    try:
        count = await db.llm_providers.count_documents({})
        if count:
            return False
        now = datetime.now(timezone.utc).isoformat()
        for s in seed_defs:
            env_key = s.get("env_api_key", "")
            await db.llm_providers.insert_one({
                "key": s["key"],
                "label": s.get("label", s["key"]),
                "base_url": s.get("base_url", ""),
                "api_key_enc": try_encrypt(env_key),
                "has_env_key": bool(env_key),
                "models": list(s.get("models", [])),
                "default_model": s.get("default_model", ""),
                "enabled": True,
                "priority": int(s.get("priority", 999)),
                "cost_in_per_1m": float(s.get("cost_in_per_1m", 0.0)),
                "cost_out_per_1m": float(s.get("cost_out_per_1m", 0.0)),
                "created_at": now,
                "updated_at": now,
            })
        logger.info("LLM providers seeded from environment (%d)", len(seed_defs))
        await invalidate_configs()
        return True
    except Exception as e:
        logger.error("LLM provider seeding failed (%s) — continuing with env config", e)
        return False


# ---------------------------------------------------------------------------
# Runtime resolution (used by provider call functions)
# ---------------------------------------------------------------------------

async def resolve_runtime(
    key: str,
    *,
    env_api_key: str = "",
    default_base_url: str = "",
    default_model: str = "",
) -> dict:
    """Effective runtime config for a provider: Mongo (when enabled) over env.

    Returns {api_key, base_url, model, enabled, config_source}.
    """
    cfg = await get_config(key)
    if cfg is None:
        return {
            "api_key": env_api_key,
            "base_url": default_base_url,
            "model": default_model,
            "enabled": True,
            "config_source": "env",
        }
    api_key = try_decrypt(cfg.get("api_key_enc", "")) or env_api_key
    return {
        "api_key": api_key,
        "base_url": cfg.get("base_url") or default_base_url,
        "model": cfg.get("default_model") or default_model,
        "enabled": bool(cfg.get("enabled", True)),
        "config_source": "mongo",
    }

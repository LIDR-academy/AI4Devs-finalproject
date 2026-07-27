# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Admin API for the LLM gateway (Phase 3).

Admin router (/admin/llm): CRUD over the llm_providers collection (API keys
stored Fernet-encrypted, never returned — only masked), connection testing,
usage analytics and circuit-breaker health.

Public router (/llm): enabled providers + models + pricing for the frontend
model selectors (replaces hardcoded lists).
"""
import json
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from database import db
from llm_gateway import health, registry
from llm_gateway.config_store import get_all_configs, get_config, invalidate_configs
from llm_gateway.crypto import mask_key, try_decrypt, try_encrypt
from llm_gateway.router import (
    anthropic_to_internal,
    call_pinned,
    internal_to_anthropic_response,
)
from routers.audit import record_audit
from routers.auth import get_current_user, require_admin, require_auth_any

router = APIRouter(prefix="/admin/llm", tags=["llm-admin"])
public_router = APIRouter(prefix="/llm", tags=["llm"])

# --- Heartbeat: track per-user last activity to reject stale LLM calls ---
_last_heartbeat: dict[str, float] = {}
_HEARTBEAT_TIMEOUT_S = 300  # 5 minutes


def _check_user_active(user_id: str) -> None:
    """Reject LLM calls from users who haven't pinged recently."""
    ts = _last_heartbeat.get(user_id)
    if ts is None or (time.time() - ts) > _HEARTBEAT_TIMEOUT_S:
        raise HTTPException(status_code=429, detail="Heartbeat timeout — please refresh the page.")


class ProviderUpsert(BaseModel):
    label: Optional[str] = None
    base_url: Optional[str] = None
    api_key: Optional[str] = None       # plaintext; "" clears; None keeps
    models: Optional[list[str]] = None
    default_model: Optional[str] = None
    enabled: Optional[bool] = None
    priority: Optional[int] = None
    cost_in_per_1m: Optional[float] = None
    cost_out_per_1m: Optional[float] = None


def serialize_provider(doc: dict) -> dict:
    """Admin-safe view: no ciphertext, only a masked key hint."""
    plain = try_decrypt(doc.get("api_key_enc", ""))
    return {
        "key": doc["key"],
        "label": doc.get("label", doc["key"]),
        "base_url": doc.get("base_url", ""),
        "has_api_key": bool(plain) or bool(doc.get("has_env_key")),
        "api_key_masked": mask_key(plain),
        "models": doc.get("models", []),
        "default_model": doc.get("default_model", ""),
        "enabled": bool(doc.get("enabled", True)),
        "priority": doc.get("priority", 999),
        "cost_in_per_1m": doc.get("cost_in_per_1m", 0.0),
        "cost_out_per_1m": doc.get("cost_out_per_1m", 0.0),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

@router.get("/providers")
async def list_providers(request: Request):
    await require_admin(request)
    docs = await db.llm_providers.find({}, {"_id": 0}).sort("priority", 1).to_list(200)
    return [serialize_provider(d) for d in docs]


@router.post("/providers", status_code=201)
async def create_provider(body: ProviderUpsert, request: Request, key: str = Query(...)):
    admin = await require_admin(request)
    key = key.strip().lower()
    if not key or not key.replace("-", "").replace("_", "").isalnum():
        raise HTTPException(status_code=400, detail="Invalid provider key")
    if await db.llm_providers.find_one({"key": key}):
        raise HTTPException(status_code=409, detail="Provider already exists")
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "key": key,
        "label": body.label or key,
        "base_url": body.base_url or "",
        "api_key_enc": try_encrypt(body.api_key or ""),
        "has_env_key": False,
        "models": body.models or [],
        "default_model": body.default_model or "",
        "enabled": body.enabled if body.enabled is not None else True,
        "priority": body.priority if body.priority is not None else 999,
        "cost_in_per_1m": body.cost_in_per_1m or 0.0,
        "cost_out_per_1m": body.cost_out_per_1m or 0.0,
        "created_at": now,
        "updated_at": now,
    }
    await db.llm_providers.insert_one(doc)
    await invalidate_configs()
    await record_audit(
        "llm_provider.created", actor_email=admin.email, actor_user_id=admin.user_id,
        actor_role=admin.role, resource_type="llm_provider", resource_id=key,
        details={"label": doc["label"]}, request=request,
    )
    return serialize_provider(doc)


@router.put("/providers/{key}")
async def update_provider(key: str, body: ProviderUpsert, request: Request):
    admin = await require_admin(request)
    doc = await db.llm_providers.find_one({"key": key})
    if not doc:
        raise HTTPException(status_code=404, detail="Provider not found")
    updates: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    for field in ("label", "base_url", "models", "default_model", "enabled", "priority",
                  "cost_in_per_1m", "cost_out_per_1m"):
        value = getattr(body, field)
        if value is not None:
            updates[field] = value
    if body.api_key is not None:
        updates["api_key_enc"] = try_encrypt(body.api_key) if body.api_key else ""
        updates["has_env_key"] = False
    await db.llm_providers.update_one({"key": key}, {"$set": updates})
    await invalidate_configs()
    await record_audit(
        "llm_provider.updated", actor_email=admin.email, actor_user_id=admin.user_id,
        actor_role=admin.role, resource_type="llm_provider", resource_id=key,
        details={"fields": sorted(k for k in updates if k != "updated_at"),
                 "key_rotated": body.api_key is not None}, request=request,
    )
    updated = await db.llm_providers.find_one({"key": key}, {"_id": 0})
    return serialize_provider(updated)


@router.delete("/providers/{key}")
async def delete_provider(key: str, request: Request):
    admin = await require_admin(request)
    result = await db.llm_providers.delete_one({"key": key})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Provider not found")
    await invalidate_configs()
    await record_audit(
        "llm_provider.deleted", actor_email=admin.email, actor_user_id=admin.user_id,
        actor_role=admin.role, resource_type="llm_provider", resource_id=key,
        details={}, request=request,
    )
    return {"status": "ok", "deleted": key}


@router.post("/providers/{key}/test")
async def test_provider(key: str, request: Request):
    """Minimal real call through the gateway (meters + feeds the breaker)."""
    await require_admin(request)
    entry = registry.get_provider(key)
    if entry is None:
        raise HTTPException(status_code=404, detail="Provider not registered in the gateway")
    started = time.monotonic()
    try:
        content = await entry["call"]("Responde exactamente: ok", "ping", max_tokens=8)
        return {"ok": True, "latency_ms": int((time.monotonic() - started) * 1000),
                "response_preview": (content or "")[:80]}
    except Exception as e:
        return {"ok": False, "latency_ms": int((time.monotonic() - started) * 1000),
                "error": str(e)[:300]}


# ---------------------------------------------------------------------------
# Analytics & health
# ---------------------------------------------------------------------------

@router.get("/usage/stats")
async def usage_stats(request: Request, days: int = Query(30, ge=1, le=365)):
    await require_admin(request)
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    match = {"$match": {"created_at": {"$gte": since}}}

    def _group(key):
        return {"$group": {
            "_id": key,
            "calls": {"$sum": 1},
            "tokens_in": {"$sum": "$tokens_in"},
            "tokens_out": {"$sum": "$tokens_out"},
            "cost_usd": {"$sum": "$cost_usd"},
            "errors": {"$sum": {"$cond": [{"$eq": ["$status", "error"]}, 1, 0]}},
            "avg_latency_ms": {"$avg": "$latency_ms"},
        }}

    by_provider = await db.llm_usage.aggregate([match, _group("$provider")]).to_list(50)
    by_model = await db.llm_usage.aggregate([match, _group("$model")]).to_list(100)
    by_day = await db.llm_usage.aggregate([
        match,
        {"$group": {
            "_id": {"$substr": ["$created_at", 0, 10]},
            "calls": {"$sum": 1},
            "tokens_in": {"$sum": "$tokens_in"},
            "tokens_out": {"$sum": "$tokens_out"},
            "cost_usd": {"$sum": "$cost_usd"},
            "errors": {"$sum": {"$cond": [{"$eq": ["$status", "error"]}, 1, 0]}},
        }},
        {"$sort": {"_id": 1}},
    ]).to_list(400)

    def _rows(items):
        return [
            {
                "key": r["_id"], "calls": r["calls"],
                "tokens_in": r["tokens_in"], "tokens_out": r["tokens_out"],
                "cost_usd": round(r["cost_usd"], 6), "errors": r["errors"],
                **({"avg_latency_ms": round(r["avg_latency_ms"])} if "avg_latency_ms" in r else {}),
            }
            for r in items
        ]

    totals = {
        "calls": sum(r["calls"] for r in by_provider),
        "tokens_in": sum(r["tokens_in"] for r in by_provider),
        "tokens_out": sum(r["tokens_out"] for r in by_provider),
        "cost_usd": round(sum(r["cost_usd"] for r in by_provider), 6),
        "errors": sum(r["errors"] for r in by_provider),
    }
    return {"days": days, "since": since, "totals": totals,
            "by_provider": _rows(by_provider), "by_model": _rows(by_model),
            "by_day": _rows(by_day)}


@router.get("/health")
async def llm_health(request: Request):
    """Per-provider: registration, config source, enabled flag and breaker."""
    await require_admin(request)
    cfgs = await get_all_configs()
    result = []
    for key, entry in registry._providers.items():
        cfg = cfgs.get(key)
        status = await health.get_status(key)
        result.append({
            "provider": key,
            "configured": bool(entry["is_configured"]() or (cfg or {}).get("api_key_enc")),
            "enabled": bool((cfg or {}).get("enabled", True)),
            "config_source": "mongo" if cfg else "env",
            "priority": (cfg or {}).get("priority"),
            "breaker_open": not status["available"],
            "consecutive_failures": status["consecutive_failures"],
        })
    result.sort(key=lambda r: (r["priority"] if r["priority"] is not None else 999))
    return result


# ---------------------------------------------------------------------------
# Public (authenticated) models catalog for frontend selectors
# ---------------------------------------------------------------------------

@public_router.get("/models")
async def public_models(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    cfgs = await get_all_configs()
    providers = []
    for key, entry in registry._providers.items():
        cfg = cfgs.get(key)
        if cfg is not None and not cfg.get("enabled", True):
            continue
        if not await _has_credentials(key, entry, cfg):
            continue
        providers.append({
            "key": key,
            "label": (cfg or {}).get("label", key),
            "models": (cfg or {}).get("models", []),
            "default_model": (cfg or {}).get("default_model", ""),
            "accepts_model": bool(entry["accepts_model"]),
            "cost_in_per_1m": (cfg or {}).get("cost_in_per_1m", 0.0),
            "cost_out_per_1m": (cfg or {}).get("cost_out_per_1m", 0.0),
            "priority": (cfg or {}).get("priority", 999),
        })
    providers.sort(key=lambda p: p["priority"])
    aliases = [
        {"key": "auto", "label": "Auto (fallback inteligente)", "models": [], "default_model": "",
         "accepts_model": False, "cost_in_per_1m": 0.0, "cost_out_per_1m": 0.0, "priority": 1,
         "description": "Cadena completa por prioridad con fallback automático"},
        {"key": "cheap", "label": "Más barato", "models": [], "default_model": "",
         "accepts_model": False, "cost_in_per_1m": 0.0, "cost_out_per_1m": 0.0, "priority": 2,
         "description": "Provider activo con menor coste por token"},
        {"key": "fast", "label": "Rápido (DeepSeek Flash)", "models": [], "default_model": "",
         "accepts_model": False, "cost_in_per_1m": 0.0, "cost_out_per_1m": 0.0, "priority": 3,
         "description": "DeepSeek V4-Flash, menor latencia"},
    ]
    return {"providers": providers, "aliases": aliases}


async def _has_credentials(key: str, entry: dict, cfg: Optional[dict]) -> bool:
    if cfg is not None and cfg.get("api_key_enc"):
        return True
    return entry["is_configured"]()


# ---------------------------------------------------------------------------
# Unified Anthropic Messages API endpoint
# ---------------------------------------------------------------------------

class AnthropicMessageRequest(BaseModel):
    messages: list[dict]
    model: str
    system: Optional[str] = None
    max_tokens: int = 4096
    provider: Optional[str] = None  # explicit provider key; default auto-detect


def _guess_provider(model: str) -> str:
    """Infer provider key from model name prefix."""
    m = model.lower()
    if m.startswith("claude"):
        return "claude"
    if m.startswith("deepseek"):
        return "deepseek"
    if m.startswith("minimax"):
        return "minimax"
    if m.startswith("mimo"):
        return "mimo"
    return "auto"


_MAX_PAYLOAD_BYTES = 100 * 1024  # 100 KB cap per stored payload


def _cap_payload(obj: dict) -> dict:
    """Cap a dict to _MAX_PAYLOAD_BYTES when serialized to JSON."""
    raw = json.dumps(obj, ensure_ascii=False, default=str)
    if len(raw.encode("utf-8")) <= _MAX_PAYLOAD_BYTES:
        return obj
    truncated = raw[:_MAX_PAYLOAD_BYTES]
    return {"_truncated": True, "_original_size": len(raw), "_preview": truncated}


async def _record_api_usage(
    *,
    key_id: str,
    user_id: str,
    provider: str,
    model: str,
    request_body: dict,
    response_body: Optional[dict],
    tokens_in: int = 0,
    tokens_out: int = 0,
    cost_usd: float = 0.0,
    latency_ms: int = 0,
    status: str = "ok",
    error: Optional[str] = None,
) -> None:
    """Insert one API-key usage record with full payloads. Never raises."""
    try:
        await db.api_usage.insert_one({
            "id": str(uuid.uuid4()),
            "key_id": key_id,
            "user_id": user_id,
            "endpoint": "/llm/messages",
            "provider": provider,
            "model": model,
            "request_body": _cap_payload(request_body),
            "response_body": _cap_payload(response_body) if response_body else None,
            "tokens_in": int(tokens_in or 0),
            "tokens_out": int(tokens_out or 0),
            "cost_usd": cost_usd,
            "latency_ms": int(latency_ms),
            "status": status,
            "error": (error or "")[:300] or None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        import logging
        logging.getLogger(__name__).warning("Failed to record API usage", exc_info=True)


@public_router.post("/messages")
async def anthropic_messages(body: AnthropicMessageRequest, request: Request):
    """Unified LLM endpoint: accepts Anthropic Messages API format, routes to
    any configured provider, returns Anthropic-format response.

    Supports both session auth (browser) and X-Api-Key auth (external clients).
    """
    user, api_key_doc = await require_auth_any(request)

    # Heartbeat gating only for browser sessions (external scripts can't heartbeat)
    if api_key_doc is None:
        _check_user_active(user.get("_id") or user.get("id", ""))

    system_msg, user_msg = anthropic_to_internal(body.messages, body.system)
    provider = body.provider or _guess_provider(body.model)

    started = time.monotonic()
    try:
        content = await call_pinned(
            provider, system_msg, user_msg,
            max_tokens=body.max_tokens, model=body.model,
        )
    except Exception as e:
        # Record API usage on error if called via API key
        if api_key_doc:
            await _record_api_usage(
                key_id=api_key_doc["key_id"],
                user_id=user.user_id,
                provider=provider,
                model=body.model,
                request_body=body.model_dump(),
                response_body=None,
                latency_ms=int((time.monotonic() - started) * 1000),
                status="error",
                error=str(e),
            )
        raise HTTPException(status_code=502, detail={
            "type": "error",
            "error": {"type": "api_error", "message": str(e)[:500]},
        })

    latency_ms = int((time.monotonic() - started) * 1000)
    response = internal_to_anthropic_response(content, model=body.model)

    # Record full request/response for API key calls
    if api_key_doc:
        usage = response.get("usage", {})
        await _record_api_usage(
            key_id=api_key_doc["key_id"],
            user_id=user.user_id,
            provider=provider,
            model=body.model,
            request_body=body.model_dump(),
            response_body=response,
            tokens_in=usage.get("input_tokens", 0),
            tokens_out=usage.get("output_tokens", 0),
            latency_ms=latency_ms,
            status="ok",
        )

    return response


@public_router.post("/heartbeat")
async def heartbeat(request: Request):
    """Lightweight ping to track user activity for LLM gating."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    uid = user.get("_id") or user.get("id", "")
    _last_heartbeat[uid] = time.time()
    return {"ok": True}

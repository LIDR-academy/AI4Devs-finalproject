# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""User API key management router.

Provides CRUD for personal API keys that external clients use to
authenticate against the LLM gateway via X-Api-Key header, plus
paginated usage history with full request/response payloads.
"""

import hashlib
import json
import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from database import db
from llm_gateway.crypto import try_encrypt
from models_api_keys import ApiKeyCreate, ApiKeyCreateResponse, ApiKeySummary, ApiUsageRecord
from routers.auth import require_auth

router = APIRouter(prefix="/api-keys", tags=["api-keys"])

MAX_KEYS_PER_USER = 10
_KEY_PREFIX_LEN = 11  # "sk-" + 8 chars


def _generate_key() -> str:
    return "sk-" + secrets.token_urlsafe(36)


@router.post("", response_model=ApiKeyCreateResponse)
async def create_api_key(body: ApiKeyCreate, request: Request):
    user = await require_auth(request)

    # Enforce max active keys
    count = await db.api_keys.count_documents({"user_id": user.user_id, "is_active": True})
    if count >= MAX_KEYS_PER_USER:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum of {MAX_KEYS_PER_USER} active API keys reached. Revoke one first.",
        )

    plain_key = _generate_key()
    key_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "key_id": key_id,
        "user_id": user.user_id,
        "name": body.name.strip()[:100],
        "key_hash": hashlib.sha256(plain_key.encode()).hexdigest(),
        "key_prefix": plain_key[:_KEY_PREFIX_LEN],
        "key_encrypted": try_encrypt(plain_key),
        "is_active": True,
        "last_used_at": None,
        "created_at": now,
    }
    await db.api_keys.insert_one(doc)

    return ApiKeyCreateResponse(
        key_id=key_id,
        name=doc["name"],
        key=plain_key,
        key_prefix=doc["key_prefix"],
        created_at=now,
    )


@router.get("", response_model=list[ApiKeySummary])
async def list_api_keys(request: Request):
    user = await require_auth(request)
    cursor = db.api_keys.find(
        {"user_id": user.user_id},
        {"_id": 0, "key_id": 1, "name": 1, "key_prefix": 1, "is_active": 1,
         "last_used_at": 1, "created_at": 1},
    ).sort("created_at", -1)
    docs = await cursor.to_list(50)
    return [ApiKeySummary(**d) for d in docs]


@router.delete("/{key_id}")
async def revoke_api_key(key_id: str, request: Request):
    user = await require_auth(request)
    result = await db.api_keys.update_one(
        {"key_id": key_id, "user_id": user.user_id},
        {"$set": {"is_active": False}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"status": "ok", "key_id": key_id}


@router.get("/usage", response_model=dict)
async def list_api_usage(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    user = await require_auth(request)
    skip = (page - 1) * per_page

    total = await db.api_usage.count_documents({"user_id": user.user_id})
    cursor = db.api_usage.find(
        {"user_id": user.user_id},
        {"_id": 0, "request_body": 0, "response_body": 0},  # exclude heavy fields in list
    ).sort("created_at", -1).skip(skip).limit(per_page)
    rows = await cursor.to_list(per_page)

    # Attach key names
    key_ids = {r["key_id"] for r in rows if r.get("key_id")}
    if key_ids:
        key_docs = await db.api_keys.find(
            {"key_id": {"$in": list(key_ids)}},
            {"_id": 0, "key_id": 1, "name": 1},
        ).to_list(len(key_ids))
        name_map = {k["key_id"]: k["name"] for k in key_docs}
        for r in rows:
            r["key_name"] = name_map.get(r.get("key_id"), "")

    return {
        "items": rows,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
    }


@router.get("/usage/{usage_id}")
async def get_api_usage_detail(usage_id: str, request: Request):
    user = await require_auth(request)
    doc = await db.api_usage.find_one(
        {"id": usage_id, "user_id": user.user_id},
        {"_id": 0},
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Usage record not found")
    return doc

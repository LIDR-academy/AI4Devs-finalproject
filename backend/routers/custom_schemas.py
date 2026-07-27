# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Custom Schemas (Enterprise feature).

Allows Enterprise-tier users (or admins) to define custom JSON-Schema-like
metadata definitions that can be applied as extensions to OOP classes.

Storage shape (collection: `custom_schemas`):
{
  id: str (uuid),
  owner_email: str,
  name: str,
  description: str,
  scope: "oop_class" | "diagram",
  schema: dict (JSON Schema fragment, e.g. {"type":"object","properties":{...},"required":[...]}),
  created_at: iso str,
  updated_at: iso str,
}

All endpoints require Enterprise plan or admin role.
"""
from __future__ import annotations

import uuid
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field

from database import db
from routers.auth import require_auth

router = APIRouter(tags=["custom-schemas"])


# ---------------- Models ----------------

class CustomSchemaCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=(), populate_by_name=True)
    name: str
    description: Optional[str] = ""
    scope: str = "oop_class"  # "oop_class" | "diagram"
    json_schema: Dict[str, Any] = Field(default_factory=dict, alias="schema")


class CustomSchemaUpdate(BaseModel):
    model_config = ConfigDict(protected_namespaces=(), populate_by_name=True)
    name: Optional[str] = None
    description: Optional[str] = None
    scope: Optional[str] = None
    json_schema: Optional[Dict[str, Any]] = Field(default=None, alias="schema")


# ---------------- Authorization ----------------

async def _require_enterprise(request: Request):
    user = await require_auth(request)
    user_doc = await db.users.find_one(
        {"user_id": user.user_id},
        {"_id": 0, "plan": 1, "role": 1},
    )
    plan = (user_doc or {}).get("plan")
    role = (user_doc or {}).get("role") or user.role
    if role == "admin" or plan == "enterprise":
        return user
    raise HTTPException(
        status_code=403,
        detail="Custom Schemas requires Enterprise plan",
    )


# ---------------- JSON Schema validation ----------------

ALLOWED_TYPES = {"string", "number", "integer", "boolean", "array", "object", "null"}


def _validate_schema(schema: Dict[str, Any]) -> List[str]:
    """Lightweight validation of a JSON Schema fragment.

    Returns list of error strings (empty = valid).
    """
    errors: List[str] = []
    if not isinstance(schema, dict):
        return ["Schema must be a JSON object"]

    t = schema.get("type")
    if t is not None and t not in ALLOWED_TYPES:
        errors.append(f"Invalid root type: {t}")

    props = schema.get("properties")
    if props is not None:
        if not isinstance(props, dict):
            errors.append("'properties' must be an object")
        else:
            for prop_name, prop_def in props.items():
                if not isinstance(prop_def, dict):
                    errors.append(f"Property '{prop_name}' must be an object")
                    continue
                pt = prop_def.get("type")
                if pt is not None and pt not in ALLOWED_TYPES:
                    errors.append(f"Property '{prop_name}' has invalid type: {pt}")

    req = schema.get("required")
    if req is not None and not isinstance(req, list):
        errors.append("'required' must be an array of strings")

    return errors


# ---------------- Endpoints ----------------

@router.get("/custom-schemas")
async def list_custom_schemas(request: Request, scope: Optional[str] = None):
    user = await _require_enterprise(request)
    q: Dict[str, Any] = {"owner_email": user.email}
    if scope:
        q["scope"] = scope
    items = await db.custom_schemas.find(q, {"_id": 0}).sort("updated_at", -1).to_list(200)
    return items


@router.get("/custom-schemas/{schema_id}")
async def get_custom_schema(schema_id: str, request: Request):
    user = await _require_enterprise(request)
    item = await db.custom_schemas.find_one(
        {"id": schema_id, "owner_email": user.email}, {"_id": 0}
    )
    if not item:
        raise HTTPException(status_code=404, detail="Schema not found")
    return item


@router.post("/custom-schemas")
async def create_custom_schema(payload: CustomSchemaCreate, request: Request):
    user = await _require_enterprise(request)

    if payload.scope not in {"oop_class", "diagram"}:
        raise HTTPException(status_code=400, detail="scope must be 'oop_class' or 'diagram'")

    errs = _validate_schema(payload.json_schema)
    if errs:
        raise HTTPException(status_code=400, detail={"errors": errs})

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "owner_email": user.email,
        "name": payload.name,
        "description": payload.description or "",
        "scope": payload.scope,
        "schema": payload.json_schema,
        "created_at": now,
        "updated_at": now,
    }
    await db.custom_schemas.insert_one(doc.copy())
    try:
        from routers.audit import record_audit
        await record_audit(
            "custom_schema.created",
            actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
            resource_type="custom_schema", resource_id=doc["id"],
            details={"name": doc["name"], "scope": doc["scope"]},
            request=request,
        )
    except Exception:
        pass
    return doc


@router.put("/custom-schemas/{schema_id}")
async def update_custom_schema(
    schema_id: str, payload: CustomSchemaUpdate, request: Request
):
    user = await _require_enterprise(request)
    existing = await db.custom_schemas.find_one(
        {"id": schema_id, "owner_email": user.email}, {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Schema not found")

    update: Dict[str, Any] = {}
    if payload.name is not None:
        update["name"] = payload.name
    if payload.description is not None:
        update["description"] = payload.description
    if payload.scope is not None:
        if payload.scope not in {"oop_class", "diagram"}:
            raise HTTPException(status_code=400, detail="invalid scope")
        update["scope"] = payload.scope
    if payload.json_schema is not None:
        errs = _validate_schema(payload.json_schema)
        if errs:
            raise HTTPException(status_code=400, detail={"errors": errs})
        update["schema"] = payload.json_schema

    if not update:
        return existing

    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.custom_schemas.update_one({"id": schema_id}, {"$set": update})
    return await db.custom_schemas.find_one({"id": schema_id}, {"_id": 0})


@router.delete("/custom-schemas/{schema_id}")
async def delete_custom_schema(schema_id: str, request: Request):
    user = await _require_enterprise(request)
    res = await db.custom_schemas.delete_one(
        {"id": schema_id, "owner_email": user.email}
    )
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schema not found")
    try:
        from routers.audit import record_audit
        await record_audit(
            "custom_schema.deleted",
            actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
            resource_type="custom_schema", resource_id=schema_id,
            request=request,
        )
    except Exception:
        pass
    return {"ok": True}


# ---------------- Apply / Validate against an OOP class ----------------

class ApplyPayload(BaseModel):
    schema_id: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


def _coerce_and_validate(schema: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
    """Validate `metadata` against a JSON Schema fragment.

    Supports type checks for primitives, required fields, and enum values.
    """
    errors: List[str] = []
    props = schema.get("properties") or {}
    required = schema.get("required") or []

    for r in required:
        if r not in metadata or metadata[r] in (None, ""):
            errors.append(f"Missing required field: {r}")

    for key, val in metadata.items():
        spec = props.get(key)
        if not spec:
            continue
        t = spec.get("type")
        if t == "string" and not isinstance(val, str):
            errors.append(f"Field '{key}' must be string")
        elif t == "number" and not isinstance(val, (int, float)):
            errors.append(f"Field '{key}' must be number")
        elif t == "integer" and not isinstance(val, int):
            errors.append(f"Field '{key}' must be integer")
        elif t == "boolean" and not isinstance(val, bool):
            errors.append(f"Field '{key}' must be boolean")
        elif t == "array" and not isinstance(val, list):
            errors.append(f"Field '{key}' must be array")
        elif t == "object" and not isinstance(val, dict):
            errors.append(f"Field '{key}' must be object")
        enum = spec.get("enum")
        if enum and val not in enum:
            errors.append(f"Field '{key}' must be one of {enum}")
    return errors


@router.post("/oop-classes/{class_id}/apply-custom-schema")
async def apply_schema_to_oop_class(
    class_id: str, payload: ApplyPayload, request: Request
):
    user = await _require_enterprise(request)
    schema_doc = await db.custom_schemas.find_one(
        {"id": payload.schema_id, "owner_email": user.email}, {"_id": 0}
    )
    if not schema_doc:
        raise HTTPException(status_code=404, detail="Schema not found")
    if schema_doc.get("scope") != "oop_class":
        raise HTTPException(status_code=400, detail="Schema scope is not oop_class")

    oop = await db.oop_classes.find_one({"id": class_id}, {"_id": 0})
    if not oop:
        raise HTTPException(status_code=404, detail="OOP class not found")

    errors = _coerce_and_validate(schema_doc["schema"], payload.metadata)
    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    custom_meta = oop.get("custom_metadata") or {}
    custom_meta[payload.schema_id] = {
        "schema_name": schema_doc["name"],
        "data": payload.metadata,
        "applied_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.oop_classes.update_one(
        {"id": class_id},
        {
            "$set": {
                "custom_metadata": custom_meta,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    return {"ok": True, "custom_metadata": custom_meta}

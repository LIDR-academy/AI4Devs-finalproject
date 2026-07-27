# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Audit logs module.

Provides:
- `record_audit()` helper to be called from routers when critical actions occur
- Admin endpoints to list/filter/export audit entries

Actions are stored in the `audit_logs` collection:
{
  id: str (uuid),
  ts: ISO datetime UTC,
  actor_email: str,
  actor_user_id: str | None,
  actor_role: str,
  action: str,            # canonical verb e.g. "issue.status_changed"
  resource_type: str,     # "issue", "user", "spec", "custom_schema", "payment"...
  resource_id: str | None,
  details: dict,          # free-form context (before/after, reason, etc.)
  ip: str | None,
  user_agent: str | None,
}

Logging is best-effort: if the audit write fails, we log a warning but never
break the primary action.
"""
from __future__ import annotations

import csv
import io
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import StreamingResponse

from database import db
# require_auth imported lazily to avoid circular import

logger = logging.getLogger(__name__)
router = APIRouter(tags=["audit"])


# --------------- Helper (called by other routers) ---------------

async def record_audit(
    action: str,
    *,
    actor_email: Optional[str] = None,
    actor_user_id: Optional[str] = None,
    actor_role: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None,
) -> None:
    """Fire-and-forget audit write. Never raises."""
    try:
        ip = None
        user_agent = None
        if request is not None:
            # Prefer X-Forwarded-For for proxied deployments
            xff = request.headers.get("x-forwarded-for") or ""
            ip = xff.split(",")[0].strip() or (request.client.host if request.client else None)
            user_agent = request.headers.get("user-agent")

        doc = {
            "id": str(uuid.uuid4()),
            "ts": datetime.now(timezone.utc).isoformat(),
            "actor_email": actor_email or "",
            "actor_user_id": actor_user_id,
            "actor_role": actor_role or "",
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": details or {},
            "ip": ip,
            "user_agent": user_agent,
        }
        await db.audit_logs.insert_one(doc.copy())
    except Exception as e:
        logger.warning("record_audit failed (%s) action=%s", e, action)


async def record_audit_from_request(action: str, request: Request, **kwargs) -> None:
    """Convenience: extract actor from the request session if present."""
    try:
        from routers.auth import get_current_user

        user = await get_current_user(request)
        if user:
            kwargs.setdefault("actor_email", user.email)
            kwargs.setdefault("actor_user_id", user.user_id)
            kwargs.setdefault("actor_role", user.role)
    except Exception:
        pass
    await record_audit(action, request=request, **kwargs)


# --------------- Admin helper ---------------

async def _require_admin(request: Request):
    from routers.auth import require_auth as _require_auth
    user = await _require_auth(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# --------------- Admin endpoints ---------------

@router.get("/audit-logs")
async def list_audit_logs(
    request: Request,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    actor_email: Optional[str] = None,
    since: Optional[str] = None,   # ISO datetime filter >=
    until: Optional[str] = None,   # ISO datetime filter <=
    q: Optional[str] = None,       # full-text-ish search over action / actor_email
    limit: int = Query(200, ge=1, le=1000),
):
    await _require_admin(request)

    query: Dict[str, Any] = {}
    if action:
        query["action"] = action
    if resource_type:
        query["resource_type"] = resource_type
    if resource_id:
        query["resource_id"] = resource_id
    if actor_email:
        query["actor_email"] = actor_email
    if since or until:
        ts_range: Dict[str, str] = {}
        if since:
            ts_range["$gte"] = since
        if until:
            ts_range["$lte"] = until
        query["ts"] = ts_range
    if q:
        # Case-insensitive regex on action OR actor_email
        query["$or"] = [
            {"action": {"$regex": q, "$options": "i"}},
            {"actor_email": {"$regex": q, "$options": "i"}},
            {"resource_id": {"$regex": q, "$options": "i"}},
        ]

    items = await db.audit_logs.find(query, {"_id": 0}).sort("ts", -1).to_list(limit)
    return items


@router.get("/audit-logs/stats")
async def audit_stats(request: Request):
    await _require_admin(request)
    total = await db.audit_logs.count_documents({})
    by_action: Dict[str, int] = {}
    async for r in db.audit_logs.aggregate(
        [{"$group": {"_id": "$action", "n": {"$sum": 1}}}, {"$sort": {"n": -1}}, {"$limit": 10}]
    ):
        by_action[r["_id"] or "(unknown)"] = r["n"]
    last = await db.audit_logs.find({}, {"_id": 0}).sort("ts", -1).limit(1).to_list(1)
    return {"total": total, "top_actions": by_action, "last_ts": (last[0]["ts"] if last else None)}


@router.get("/audit-logs/export")
async def export_audit_logs(
    request: Request,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    actor_email: Optional[str] = None,
    since: Optional[str] = None,
    until: Optional[str] = None,
    limit: int = Query(5000, ge=1, le=20000),
):
    await _require_admin(request)

    query: Dict[str, Any] = {}
    if action:
        query["action"] = action
    if resource_type:
        query["resource_type"] = resource_type
    if actor_email:
        query["actor_email"] = actor_email
    if since or until:
        ts_range: Dict[str, str] = {}
        if since:
            ts_range["$gte"] = since
        if until:
            ts_range["$lte"] = until
        query["ts"] = ts_range

    items = await db.audit_logs.find(query, {"_id": 0}).sort("ts", -1).to_list(limit)

    def _iter_csv():
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "ts", "actor_email", "actor_role", "action",
            "resource_type", "resource_id", "ip", "user_agent", "details_json",
        ])
        yield buf.getvalue()
        buf.seek(0)
        buf.truncate(0)
        for it in items:
            writer.writerow([
                it.get("ts", ""),
                it.get("actor_email", ""),
                it.get("actor_role", ""),
                it.get("action", ""),
                it.get("resource_type", "") or "",
                it.get("resource_id", "") or "",
                it.get("ip", "") or "",
                (it.get("user_agent", "") or "")[:200],
                _safe_json_dumps(it.get("details") or {}),
            ])
            yield buf.getvalue()
            buf.seek(0)
            buf.truncate(0)

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    headers = {"Content-Disposition": f'attachment; filename="audit-logs-{stamp}.csv"'}
    return StreamingResponse(_iter_csv(), media_type="text/csv", headers=headers)


def _safe_json_dumps(d: Any) -> str:
    import json as _j
    try:
        return _j.dumps(d, default=str, ensure_ascii=False)
    except Exception:
        return ""


@router.get("/audit-logs/actions")
async def list_distinct_actions(request: Request):
    """Return distinct action names (for filter UI suggestions)."""
    await _require_admin(request)
    distinct: List[str] = await db.audit_logs.distinct("action")
    distinct.sort()
    return distinct

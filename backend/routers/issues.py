# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Issue / bug report manager.

User-facing module:
- POST /api/issues                 → authenticated user submits an issue
- GET  /api/issues/mine            → user sees their own reports
Admin-only:
- GET    /api/issues               → list with filters
- GET    /api/issues/stats         → counts per status / severity
- PATCH  /api/issues/{id}          → update status + admin note
- DELETE /api/issues/{id}          → delete

Screenshots are stored as data-URLs (base64 PNG/JPEG) embedded in the document
to keep the deployment storage-free. 2 MB hard cap enforced server-side.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from database import db
from routers.auth import require_auth

router = APIRouter(tags=["issues"])

ALLOWED_SEVERITY = {"low", "medium", "high", "critical"}
ALLOWED_CATEGORY = {"bug", "improvement", "question"}
ALLOWED_STATUS = {"open", "in_progress", "resolved", "closed", "wontfix"}

SCREENSHOT_MAX_BYTES = 2 * 1024 * 1024  # 2 MB


# ---------------- Models ----------------

class IssueCreate(BaseModel):
    title: str
    description: str
    severity: str = "medium"
    category: str = "bug"
    page_url: Optional[str] = None
    screenshot: Optional[str] = None  # data URL (data:image/...;base64,...)


class IssueUpdate(BaseModel):
    status: Optional[str] = None
    admin_note: Optional[str] = None


# ---------------- Helpers ----------------

def _validate_create(payload: IssueCreate) -> List[str]:
    errs: List[str] = []
    if not payload.title.strip():
        errs.append("title is required")
    if not payload.description.strip():
        errs.append("description is required")
    if payload.severity not in ALLOWED_SEVERITY:
        errs.append(f"severity must be one of {sorted(ALLOWED_SEVERITY)}")
    if payload.category not in ALLOWED_CATEGORY:
        errs.append(f"category must be one of {sorted(ALLOWED_CATEGORY)}")
    if payload.screenshot:
        # Rough byte estimate: base64 length * 3/4
        approx = int(len(payload.screenshot) * 3 / 4)
        if approx > SCREENSHOT_MAX_BYTES:
            errs.append(f"screenshot too large (max {SCREENSHOT_MAX_BYTES // 1024}KB)")
        if not payload.screenshot.startswith("data:image/"):
            errs.append("screenshot must be a data:image/... URL")
    return errs


async def _require_admin(request: Request):
    user = await require_auth(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# ---------------- User endpoints ----------------

@router.post("/issues")
async def create_issue(payload: IssueCreate, request: Request):
    user = await require_auth(request)

    errs = _validate_create(payload)
    if errs:
        raise HTTPException(status_code=400, detail={"errors": errs})

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "severity": payload.severity,
        "category": payload.category,
        "status": "open",
        "page_url": (payload.page_url or "").strip() or None,
        "screenshot": payload.screenshot,  # nullable data URL
        "reporter_email": user.email,
        "reporter_name": user.name,
        "reporter_user_id": user.user_id,
        "admin_note": "",
        "created_at": now,
        "updated_at": now,
        "resolved_at": None,
    }
    await db.issues.insert_one(doc.copy())
    # Don't return the (potentially big) screenshot on create
    out = {k: v for k, v in doc.items() if k != "screenshot"}
    out["has_screenshot"] = bool(doc.get("screenshot"))
    return out


@router.get("/issues/mine")
async def list_my_issues(request: Request):
    user = await require_auth(request)
    items = (
        await db.issues.find(
            {"reporter_email": user.email},
            {"_id": 0, "screenshot": 0},
        )
        .sort("created_at", -1)
        .to_list(200)
    )
    return items


# ---------------- Admin endpoints ----------------

@router.get("/issues")
async def list_issues(
    request: Request,
    status_: Optional[str] = None,
    severity: Optional[str] = None,
    category: Optional[str] = None,
    reporter_email: Optional[str] = None,
):
    await _require_admin(request)
    q: Dict[str, Any] = {}
    if status_:
        if status_ not in ALLOWED_STATUS:
            raise HTTPException(status_code=400, detail="invalid status filter")
        q["status"] = status_
    if severity:
        if severity not in ALLOWED_SEVERITY:
            raise HTTPException(status_code=400, detail="invalid severity filter")
        q["severity"] = severity
    if category:
        if category not in ALLOWED_CATEGORY:
            raise HTTPException(status_code=400, detail="invalid category filter")
        q["category"] = category
    if reporter_email:
        q["reporter_email"] = reporter_email
    items = (
        await db.issues.find(q, {"_id": 0, "screenshot": 0}).sort("created_at", -1).to_list(500)
    )
    return items


@router.get("/issues/stats")
async def issue_stats(request: Request):
    await _require_admin(request)
    pipeline_status = [{"$group": {"_id": "$status", "n": {"$sum": 1}}}]
    pipeline_sev = [{"$group": {"_id": "$severity", "n": {"$sum": 1}}}]
    by_status = {r["_id"]: r["n"] async for r in db.issues.aggregate(pipeline_status)}
    by_severity = {r["_id"]: r["n"] async for r in db.issues.aggregate(pipeline_sev)}
    total = sum(by_status.values())
    return {"total": total, "by_status": by_status, "by_severity": by_severity}


@router.get("/issues/{issue_id}")
async def get_issue(issue_id: str, request: Request):
    """Admin fetches full issue (includes screenshot data URL).

    Non-admin can fetch only if they are the reporter.
    """
    user = await require_auth(request)
    doc = await db.issues.find_one({"id": issue_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Issue not found")
    if user.role != "admin" and doc.get("reporter_email") != user.email:
        raise HTTPException(status_code=403, detail="Not your issue")
    return doc


@router.patch("/issues/{issue_id}")
async def update_issue(issue_id: str, payload: IssueUpdate, request: Request):
    user = await _require_admin(request)
    existing = await db.issues.find_one({"id": issue_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Issue not found")

    update: Dict[str, Any] = {}
    if payload.status is not None:
        if payload.status not in ALLOWED_STATUS:
            raise HTTPException(status_code=400, detail="invalid status")
        update["status"] = payload.status
        if payload.status in {"resolved", "closed"} and not existing.get("resolved_at"):
            update["resolved_at"] = datetime.now(timezone.utc).isoformat()
    if payload.admin_note is not None:
        update["admin_note"] = payload.admin_note

    if not update:
        return {k: v for k, v in existing.items() if k != "screenshot"}

    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.issues.update_one({"id": issue_id}, {"$set": update})
    try:
        from routers.audit import record_audit
        if "status" in update and update["status"] != existing.get("status"):
            await record_audit(
                "issue.status_changed",
                actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
                resource_type="issue", resource_id=issue_id,
                details={"from": existing.get("status"), "to": update["status"]},
                request=request,
            )
        if "admin_note" in update:
            await record_audit(
                "issue.note_updated",
                actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
                resource_type="issue", resource_id=issue_id,
                details={"note_len": len(update.get("admin_note", ""))},
                request=request,
            )
    except Exception:
        pass
    fresh = await db.issues.find_one({"id": issue_id}, {"_id": 0, "screenshot": 0})
    return fresh


@router.delete("/issues/{issue_id}")
async def delete_issue(issue_id: str, request: Request):
    admin = await _require_admin(request)
    res = await db.issues.delete_one({"id": issue_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Issue not found")
    try:
        from routers.audit import record_audit
        await record_audit(
            "issue.deleted",
            actor_email=admin.email, actor_user_id=admin.user_id, actor_role=admin.role,
            resource_type="issue", resource_id=issue_id,
            request=request,
        )
    except Exception:
        pass
    return {"ok": True}

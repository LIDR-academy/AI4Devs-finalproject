# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Global announcements (admin-published banners shown to all users).

One or more announcements can be active at the same time. Every authenticated
user can dismiss individual announcements; the dismissal is persisted so the
banner does not reappear on subsequent sessions (unless the admin updates the
announcement, which bumps `updated_at` and invalidates dismissals when the
field `invalidates_dismissals` is true).

Audience targeting is supported via `audience`:
  - all         → everyone (authenticated or not)
  - free        → role=free
  - subscription→ role=subscription
  - admin       → role=admin
  - enterprise  → plan=enterprise (from user doc)
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, Literal, List

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from database import db
from routers.audit import record_audit
from routers.auth import get_current_user, require_auth, require_admin

router = APIRouter(prefix="/announcements", tags=["announcements"])
logger = logging.getLogger(__name__)

SEVERITIES = ("info", "success", "warning", "critical")
AUDIENCES = ("all", "free", "subscription", "admin", "enterprise")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _is_active(doc: dict, now_iso: str) -> bool:
    if not doc.get("active", True):
        return False
    starts = doc.get("starts_at")
    ends = doc.get("ends_at")
    if starts and starts > now_iso:
        return False
    if ends and ends < now_iso:
        return False
    return True


def _audience_match(doc: dict, user) -> bool:
    aud = doc.get("audience", "all")
    if aud == "all":
        return True
    if not user:
        return False  # targeted audiences require auth
    if aud == "admin":
        return user.role == "admin"
    if aud == "free":
        return user.role == "free"
    if aud == "subscription":
        return user.role == "subscription"
    if aud == "enterprise":
        return (user.plan or "").lower() == "enterprise" or user.role == "admin"
    return False


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    body: str = Field(min_length=1, max_length=4000)
    severity: Literal["info", "success", "warning", "critical"] = "info"
    audience: Literal["all", "free", "subscription", "admin", "enterprise"] = "all"
    active: bool = True
    dismissible: bool = True
    starts_at: Optional[str] = None  # ISO 8601
    ends_at: Optional[str] = None
    cta_label: Optional[str] = Field(default=None, max_length=60)
    cta_url: Optional[str] = Field(default=None, max_length=500)


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=160)
    body: Optional[str] = Field(default=None, min_length=1, max_length=4000)
    severity: Optional[Literal["info", "success", "warning", "critical"]] = None
    audience: Optional[Literal["all", "free", "subscription", "admin", "enterprise"]] = None
    active: Optional[bool] = None
    dismissible: Optional[bool] = None
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    cta_label: Optional[str] = None
    cta_url: Optional[str] = None
    invalidate_dismissals: bool = False


# ---------------------------------------------------------------------------
# Public — active banners for the current viewer
# ---------------------------------------------------------------------------

@router.get("/active")
async def list_active_announcements(request: Request):
    """Return all announcements the current viewer should see right now.

    Auth is OPTIONAL: anonymous visitors get `audience=all` banners.
    Dismissed-by-user announcements are filtered out (only for authed users).
    """
    user = await get_current_user(request)  # may be None
    now_iso = _now_iso()
    docs = await db.announcements.find({"active": True}, {"_id": 0}).sort("created_at", -1).to_list(200)

    by_ann: dict[str, int] = {}
    if user:
        rows = await db.user_announcement_dismissals.find(
            {"user_email": user.email},
            {"_id": 0, "announcement_id": 1, "dismissed_version": 1},
        ).to_list(500)
        # Map of announcement_id -> dismissed_version to compare against `version`.
        by_ann = {r["announcement_id"]: r.get("dismissed_version") for r in rows if r.get("dismissed_version")}

    result = []
    for d in docs:
        if not _is_active(d, now_iso):
            continue
        if not _audience_match(d, user):
            continue
        ann_id = d["id"]
        # Version-aware dismiss: admins can bump `version` to re-show the banner.
        version = d.get("version", 1)
        if user and ann_id in by_ann and by_ann[ann_id] >= version:
            continue
        result.append({
            "id": ann_id,
            "title": d["title"],
            "body": d["body"],
            "severity": d.get("severity", "info"),
            "dismissible": d.get("dismissible", True),
            "cta_label": d.get("cta_label"),
            "cta_url": d.get("cta_url"),
            "version": version,
            "created_at": d.get("created_at"),
        })
    return {"items": result, "count": len(result)}


# ---------------------------------------------------------------------------
# User — dismiss a banner for themselves
# ---------------------------------------------------------------------------

@router.post("/{announcement_id}/dismiss")
async def dismiss_announcement(announcement_id: str, request: Request):
    user = await require_auth(request)
    ann = await db.announcements.find_one({"id": announcement_id}, {"_id": 0})
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    now = _now_iso()
    await db.user_announcement_dismissals.update_one(
        {"user_email": user.email, "announcement_id": announcement_id},
        {"$set": {
            "user_email": user.email,
            "announcement_id": announcement_id,
            "dismissed_version": ann.get("version", 1),
            "dismissed_at": now,
        }},
        upsert=True,
    )
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Admin — full CRUD
# ---------------------------------------------------------------------------

@router.get("")
async def list_announcements(request: Request):
    await require_admin(request)
    docs = await db.announcements.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@router.post("")
async def create_announcement(data: AnnouncementCreate, request: Request):
    user = await require_admin(request)
    now = _now_iso()
    doc = {
        "id": str(uuid.uuid4()),
        "title": data.title.strip(),
        "body": data.body.strip(),
        "severity": data.severity,
        "audience": data.audience,
        "active": data.active,
        "dismissible": data.dismissible,
        "starts_at": data.starts_at,
        "ends_at": data.ends_at,
        "cta_label": (data.cta_label or "").strip() or None,
        "cta_url": (data.cta_url or "").strip() or None,
        "version": 1,
        "created_at": now,
        "updated_at": now,
        "created_by": user.email,
    }
    await db.announcements.insert_one(doc.copy())
    await record_audit(
        "announcement.created", actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
        resource_type="announcement", resource_id=doc["id"],
        details={"title": doc["title"], "severity": doc["severity"], "audience": doc["audience"]},
        request=request,
    )
    return doc


@router.put("/{announcement_id}")
async def update_announcement(announcement_id: str, data: AnnouncementUpdate, request: Request):
    user = await require_admin(request)
    ann = await db.announcements.find_one({"id": announcement_id}, {"_id": 0})
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    update = {k: v for k, v in data.model_dump(exclude={"invalidate_dismissals"}).items() if v is not None}
    if update:
        update["updated_at"] = _now_iso()
    if data.invalidate_dismissals:
        update["version"] = (ann.get("version", 1)) + 1
    if update:
        await db.announcements.update_one({"id": announcement_id}, {"$set": update})
    await record_audit(
        "announcement.updated", actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
        resource_type="announcement", resource_id=announcement_id,
        details={"fields": list(update.keys())},
        request=request,
    )
    return await db.announcements.find_one({"id": announcement_id}, {"_id": 0})


@router.delete("/{announcement_id}")
async def delete_announcement(announcement_id: str, request: Request):
    user = await require_admin(request)
    result = await db.announcements.delete_one({"id": announcement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    # Also clean up dismissals (keeps collection tidy)
    await db.user_announcement_dismissals.delete_many({"announcement_id": announcement_id})
    await record_audit(
        "announcement.deleted", actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
        resource_type="announcement", resource_id=announcement_id,
        details={},
        request=request,
    )
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Idempotent seeding hook (called at startup)
# ---------------------------------------------------------------------------

async def seed_demo_announcement_once():
    """Insert the initial 'Demo version' banner exactly once.

    Uses the `_seed_runs` ledger (same pattern as the rest of the app) so the
    seed never overwrites admin edits or re-inserts the record.
    """
    seed_id = "announcement_demo_version_v1"
    existing = await db["_seed_runs"].find_one({"seed_id": seed_id}, {"_id": 0})
    if existing:
        return
    now = _now_iso()
    doc = {
        "id": "announcement-demo-version",
        "title": "Version demo",
        "body": "Esta es una version de demostracion. No guardes datos importantes: el contenido se borra periodicamente. Para un entorno persistente y privado, contacta con el administrador.",
        "severity": "warning",
        "audience": "all",
        "active": True,
        "dismissible": True,
        "starts_at": None,
        "ends_at": None,
        "cta_label": "Ver planes",
        "cta_url": "/pricing",
        "version": 1,
        "created_at": now,
        "updated_at": now,
        "created_by": "system",
    }
    # Only insert if not already present (id collision safety)
    prev = await db.announcements.find_one({"id": doc["id"]}, {"_id": 0})
    if not prev:
        await db.announcements.insert_one(doc.copy())
    await db["_seed_runs"].insert_one({"seed_id": seed_id, "applied_at": now})
    logger.info("Seeded demo-version announcement")

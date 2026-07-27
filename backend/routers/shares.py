# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Share system: grant another user viewer/editor permission on a project or diagram."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid

from database import db
from routers.auth import require_auth, get_current_user, _is_owner_or_admin

router = APIRouter(prefix="/shares", tags=["shares"])


ResourceType = Literal["project", "diagram"]
ShareRole = Literal["viewer", "editor"]


class ShareCreate(BaseModel):
    resource_type: ResourceType
    resource_id: str
    email: EmailStr
    role: ShareRole = "viewer"


class ShareUpdate(BaseModel):
    role: ShareRole


async def _get_resource(resource_type: str, resource_id: str) -> Optional[dict]:
    coll = db.projects if resource_type == "project" else db.diagrams
    return await coll.find_one({"id": resource_id}, {"_id": 0})


async def _assert_owner_or_admin(user, resource: dict):
    if not _is_owner_or_admin(user, resource.get("created_by")):
        raise HTTPException(status_code=403, detail="Solo el propietario puede gestionar shares")


@router.post("")
async def create_share(data: ShareCreate, request: Request):
    user = await require_auth(request)
    resource = await _get_resource(data.resource_type, data.resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail=f"{data.resource_type} not found")
    await _assert_owner_or_admin(user, resource)

    if data.email == user.email:
        raise HTTPException(status_code=400, detail="No puedes compartir contigo mismo")

    # Upsert: one share per (resource, email)
    existing = await db.resource_shares.find_one({
        "resource_type": data.resource_type,
        "resource_id": data.resource_id,
        "shared_with_email": data.email,
    }, {"_id": 0})

    now = datetime.now(timezone.utc).isoformat()
    invite_token = str(uuid.uuid4())

    if existing:
        await db.resource_shares.update_one(
            {"id": existing["id"]},
            {"$set": {"role": data.role, "updated_at": now}}
        )
        share = {**existing, "role": data.role, "updated_at": now}
    else:
        share = {
            "id": str(uuid.uuid4()),
            "resource_type": data.resource_type,
            "resource_id": data.resource_id,
            "resource_name": resource.get("name", ""),
            "owner_email": user.email,
            "shared_with_email": data.email,
            "role": data.role,
            "invite_token": invite_token,
            "created_at": now,
            "updated_at": now,
            "accepted": False,
        }
        await db.resource_shares.insert_one(share.copy())

    return {
        **share,
        "invite_url": f"/shares/accept?token={share.get('invite_token')}",
    }


@router.get("")
async def list_shares(request: Request, resource_type: str, resource_id: str):
    """List all shares for a specific resource (owner/admin only)."""
    user = await require_auth(request)
    resource = await _get_resource(resource_type, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    await _assert_owner_or_admin(user, resource)
    shares = await db.resource_shares.find(
        {"resource_type": resource_type, "resource_id": resource_id},
        {"_id": 0},
    ).sort("created_at", -1).to_list(100)
    return {"shares": shares}


@router.get("/shared-with-me")
async def list_shared_with_me(request: Request):
    """Resources shared with the current user."""
    user = await require_auth(request)
    shares = await db.resource_shares.find(
        {"shared_with_email": user.email},
        {"_id": 0},
    ).sort("created_at", -1).to_list(200)
    return {"shares": shares}


@router.patch("/{share_id}")
async def update_share_role(share_id: str, data: ShareUpdate, request: Request):
    user = await require_auth(request)
    share = await db.resource_shares.find_one({"id": share_id}, {"_id": 0})
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    if user.role != "admin" and share.get("owner_email") != user.email:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.resource_shares.update_one(
        {"id": share_id},
        {"$set": {"role": data.role, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"message": "Share updated", "role": data.role}


@router.delete("/{share_id}")
async def revoke_share(share_id: str, request: Request):
    user = await require_auth(request)
    share = await db.resource_shares.find_one({"id": share_id}, {"_id": 0})
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    # Owner, admin, OR the recipient can revoke
    allowed = (
        user.role == "admin"
        or share.get("owner_email") == user.email
        or share.get("shared_with_email") == user.email
    )
    if not allowed:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.resource_shares.delete_one({"id": share_id})
    return {"message": "Share revoked"}


@router.post("/accept")
async def accept_invite(request: Request):
    """Accept an invite token: marks the share as accepted for the current user."""
    user = await require_auth(request)
    body = await request.json()
    token = body.get("token", "")
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
    share = await db.resource_shares.find_one({"invite_token": token}, {"_id": 0})
    if not share:
        raise HTTPException(status_code=404, detail="Invite not found")
    if share.get("shared_with_email") != user.email:
        raise HTTPException(status_code=403, detail="Este invite no es para ti")
    await db.resource_shares.update_one(
        {"id": share["id"]},
        {"$set": {"accepted": True, "accepted_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {
        "message": "Invite accepted",
        "resource_type": share["resource_type"],
        "resource_id": share["resource_id"],
        "role": share["role"],
    }

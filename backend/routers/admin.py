# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import FileResponse
from datetime import datetime, timezone
import asyncio
import uuid
import re
import os

from database import db, LOG_FILE
from routers.auth import require_admin
from routers.audit import record_audit
from email_service import send_email, render_welcome_email, is_configured as email_is_configured

router = APIRouter(prefix="/admin", tags=["admin"])

VALID_ROLES = ["free", "subscription", "admin"]
EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _normalize_user(doc: dict) -> dict:
    """Ensure missing flags have explicit defaults so the UI always renders."""
    doc["is_active"] = doc.get("is_active", True)
    doc["plan"] = doc.get("plan")
    return doc


@router.get("/users")
async def list_users(request: Request):
    """List all users (admin only)."""
    await require_admin(request)
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return [_normalize_user(u) for u in users]


@router.post("/users")
async def create_user(request: Request):
    """Admin-driven user creation.

    Body fields:
      - name (required)
      - email (required, unique)
      - last_name, country, phone, document (optional)
      - role (free|subscription|admin, default subscription)
    """
    admin = await require_admin(request)
    body = await request.json()

    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    if not name:
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")
    if not email or not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Email no valido")

    role = body.get("role") or "subscription"
    if role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Rol invalido. Debe ser uno de: {VALID_ROLES}")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe un usuario con ese email")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "last_name": (body.get("last_name") or "").strip() or None,
        "country": (body.get("country") or "").strip() or None,
        "phone": (body.get("phone") or "").strip() or None,
        "document": (body.get("document") or "").strip() or None,
        "picture": None,
        "role": role,
        "is_active": True,
        "created_by_admin": admin.email,
        "created_at": now,
    }
    await db.users.insert_one(doc.copy())

    await record_audit(
        "user.created",
        actor_email=admin.email, actor_user_id=admin.user_id, actor_role=admin.role,
        resource_type="user", resource_id=user_id,
        details={"target_email": email, "role": role},
        request=request,
    )

    # Fire-and-forget welcome email (never blocks nor fails the request)
    if email_is_configured():
        subject, html, text = render_welcome_email(
            user_name=name,
            user_email=email,
            role=role,
            created_by_admin=admin.email,
        )
        asyncio.create_task(
            send_email(to=email, subject=subject, html=html, plain_text=text)
        )

    return _normalize_user(doc)


@router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, request: Request):
    """Change a user's role (admin only)."""
    admin = await require_admin(request)
    body = await request.json()
    new_role = body.get("role")
    if new_role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {VALID_ROLES}")
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if admin.user_id == user_id and new_role != "admin":
        raise HTTPException(status_code=400, detail="Admins cannot demote themselves")
    prev_role = user.get("role", "subscription")
    await db.users.update_one({"user_id": user_id}, {"$set": {"role": new_role}})
    await record_audit(
        "user.role_changed",
        actor_email=admin.email, actor_user_id=admin.user_id, actor_role=admin.role,
        resource_type="user", resource_id=user_id,
        details={"target_email": user.get("email"), "from": prev_role, "to": new_role},
        request=request,
    )
    return {"status": "ok", "user_id": user_id, "role": new_role}


@router.patch("/users/{user_id}/status")
async def update_user_status(user_id: str, request: Request):
    """Activate or block a user (admin only).

    Body: { "is_active": bool }
    Blocking invalidates all the user's active sessions so they get logged out
    immediately on the next protected request.
    """
    admin = await require_admin(request)
    body = await request.json()
    is_active = body.get("is_active")
    if not isinstance(is_active, bool):
        raise HTTPException(status_code=400, detail="Field 'is_active' must be a boolean")

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if admin.user_id == user_id and not is_active:
        raise HTTPException(status_code=400, detail="Admins cannot block themselves")

    await db.users.update_one({"user_id": user_id}, {"$set": {"is_active": is_active}})

    # Hard-revoke active sessions so the block takes effect immediately.
    if not is_active:
        await db.user_sessions.delete_many({"user_id": user_id})

    await record_audit(
        "user.blocked" if not is_active else "user.activated",
        actor_email=admin.email, actor_user_id=admin.user_id, actor_role=admin.role,
        resource_type="user", resource_id=user_id,
        details={"target_email": user.get("email"), "is_active": is_active},
        request=request,
    )
    return {"status": "ok", "user_id": user_id, "is_active": is_active}


@router.post("/users/{user_id}/revoke-sessions")
async def revoke_user_sessions(user_id: str, request: Request):
    """Force-logout a user by deleting all their active sessions (admin only).

    Useful for incident response (suspicious activity, lost device, etc.) without
    blocking the account permanently. The user can log in again next time.
    Admins cannot revoke their own sessions through this endpoint to avoid
    accidental self-lockout.
    """
    admin = await require_admin(request)
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if admin.user_id == user_id:
        raise HTTPException(status_code=400, detail="Use /auth/logout to end your own session")

    result = await db.user_sessions.delete_many({"user_id": user_id})
    revoked = result.deleted_count

    await record_audit(
        "user.sessions_revoked",
        actor_email=admin.email, actor_user_id=admin.user_id, actor_role=admin.role,
        resource_type="user", resource_id=user_id,
        details={"target_email": user.get("email"), "sessions_revoked": revoked},
        request=request,
    )
    return {"status": "ok", "user_id": user_id, "sessions_revoked": revoked}


@router.get("/users/{user_id}/details")
async def get_user_details(user_id: str, request: Request):
    """Detailed admin view: user profile + reported issues + payment transactions."""
    await require_admin(request)
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = _normalize_user(user)

    email = user.get("email", "")

    # Issues reported by this user (matched by reporter_email)
    issues = await db.issues.find(
        {"reporter_email": email},
        {"_id": 0, "screenshot_data_url": 0},  # exclude heavy field
    ).sort("created_at", -1).to_list(200)

    # Stripe transactions (matched by user_id or user_email)
    tx_query = {"$or": [{"user_id": user_id}, {"user_email": email}]} if email else {"user_id": user_id}
    transactions = await db.payment_transactions.find(
        tx_query, {"_id": 0}
    ).sort("created_at", -1).to_list(200)

    # Headline metrics for the drawer header
    total_paid = sum(
        float(t.get("amount") or 0)
        for t in transactions
        if t.get("payment_status") == "paid"
    )
    issues_open = sum(1 for i in issues if i.get("status") in (None, "open", "in_progress"))

    # Active session count for transparency
    active_sessions = await db.user_sessions.count_documents({"user_id": user_id})

    return {
        "user": user,
        "issues": issues,
        "transactions": transactions,
        "summary": {
            "issues_total": len(issues),
            "issues_open": issues_open,
            "transactions_total": len(transactions),
            "amount_paid_total": round(total_paid, 2),
            "active_sessions": active_sessions,
        },
    }


@router.get("/logs")
async def get_logs(
    request: Request,
    lines: int = Query(200, ge=10, le=10000),
    level: str = Query("", max_length=10),
    search: str = Query("", max_length=200),
    download: bool = Query(False),
):
    """Read application logs (admin only). Supports filtering and download."""
    await require_admin(request)

    if not os.path.isfile(LOG_FILE):
        return {"lines": [], "total": 0, "file": LOG_FILE, "message": "Log file not found"}

    if download:
        return FileResponse(LOG_FILE, media_type="text/plain", filename="app.log")

    with open(LOG_FILE, "r", encoding="utf-8", errors="replace") as f:
        all_lines = f.readlines()

    # Filter by level if specified
    if level:
        pattern = f" - {level.upper()} - "
        all_lines = [l for l in all_lines if pattern in l]

    # Filter by search text
    if search:
        term = search.lower()
        all_lines = [l for l in all_lines if term in l.lower()]

    total = len(all_lines)
    result = all_lines[-lines:] if lines > 0 else all_lines

    return {
        "lines": [l.rstrip("\n").rstrip("\r") for l in result],
        "total": total,
        "showing": len(result),
        "file": LOG_FILE,
    }

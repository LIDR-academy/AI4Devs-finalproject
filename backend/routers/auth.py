# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

# Auth helpers and routes
from fastapi import APIRouter, HTTPException, Request, Response
from datetime import datetime, timezone, timedelta
from typing import Optional
import hashlib
import uuid
import os
import logging

from database import db
from models import User
from routers.audit import record_audit
from llm_gateway.context import set_llm_user

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

ADMIN_EMAILS = os.environ.get("ADMIN_EMAILS", "").split(",")


def resolve_role(email: str, existing_role: str = None) -> str:
    if email in ADMIN_EMAILS:
        return "admin"
    if existing_role:
        return existing_role
    return "subscription"


async def get_session_from_cookie(request: Request) -> Optional[dict]:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    if not session_token:
        # Fallback: explicit ?session_token=X (used by sandbox-safe download
        # links that open in a new tab where Authorization header can't be set)
        session_token = request.query_params.get("session_token")
    if not session_token:
        return None
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        return None
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    return session_doc


async def get_current_user(request: Request) -> Optional[User]:
    session = await get_session_from_cookie(request)
    if not session:
        return None
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    # Blocked users (is_active explicitly False) are treated as unauthenticated.
    if user_doc.get("is_active") is False:
        return None
    set_llm_user(user_doc["user_id"])
    return User(**user_doc)


async def require_auth(request: Request) -> User:
    # Distinguish "no session" (401) from "blocked user" (403) so the frontend
    # can show a clear message and redirect to login.
    session = await get_session_from_cookie(request)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user_doc.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Account blocked. Contact an administrator.")
    set_llm_user(user_doc["user_id"])
    return User(**user_doc)


async def require_admin(request: Request) -> User:
    user = await require_auth(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def get_user_from_api_key(api_key: str) -> Optional[tuple[User, dict]]:
    """Look up a user by their API key. Returns (User, api_key_doc) or None."""
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    key_doc = await db.api_keys.find_one({"key_hash": key_hash, "is_active": True}, {"_id": 0})
    if not key_doc:
        return None
    user_doc = await db.users.find_one({"user_id": key_doc["user_id"]}, {"_id": 0})
    if not user_doc or user_doc.get("is_active") is False:
        return None
    set_llm_user(user_doc["user_id"])
    # Update last_used_at asynchronously
    await db.api_keys.update_one(
        {"key_id": key_doc["key_id"]},
        {"$set": {"last_used_at": datetime.now(timezone.utc).isoformat()}},
    )
    return User(**user_doc), key_doc


async def require_auth_any(request: Request) -> tuple[User, Optional[dict]]:
    """Authenticate via session token OR X-Api-Key header.

    Returns (User, api_key_doc) where api_key_doc is None for session auth
    or the api_keys document for API key auth.
    """
    # Try X-Api-Key first
    api_key = request.headers.get("X-Api-Key")
    if api_key:
        result = await get_user_from_api_key(api_key)
        if result:
            user, key_doc = result
            return user, key_doc
        raise HTTPException(status_code=401, detail="Invalid or revoked API key")

    # Fall back to session auth
    user = await require_auth(request)
    return user, None


# ==================== ROW-LEVEL SECURITY HELPERS ====================

# Seed/system-owned ids are considered public (read-only for non-owners/non-admin).
_PUBLIC_OWNERS = {"system", "", None}


def _is_owner_or_admin(user: User, resource_owner: Optional[str]) -> bool:
    if user.role == "admin":
        return True
    if not resource_owner:
        return False
    return resource_owner in (user.email, user.user_id)


def can_read_resource(user: Optional[User], resource: dict) -> bool:
    """Read rule: admins + owners always; others only for system/seed resources."""
    owner = resource.get("created_by")
    if owner in _PUBLIC_OWNERS:
        return True
    if not user:
        return False
    return _is_owner_or_admin(user, owner)


def can_write_resource(user: Optional[User], resource: dict) -> bool:
    """Write rule: must be authenticated; admins + owners only. System resources
    are writable only by admin to protect seed data."""
    if not user:
        return False
    owner = resource.get("created_by")
    if owner in _PUBLIC_OWNERS:
        return user.role == "admin"
    return _is_owner_or_admin(user, owner)


def rls_filter(user: Optional[User]) -> dict:
    """Mongo filter that restricts list queries to what the user may read.
    Admin gets everything; anonymous gets only public/system; user gets own + public.
    NOTE: this does not include shared-with-me; use `rls_filter_with_shares` for that."""
    if user and user.role == "admin":
        return {}
    if not user:
        return {"$or": [{"created_by": {"$in": list(_PUBLIC_OWNERS)}}]}
    return {
        "$or": [
            {"created_by": {"$in": [user.email, user.user_id]}},
            {"created_by": {"$in": list(_PUBLIC_OWNERS)}},
        ]
    }


async def get_shared_resource_ids(user: Optional[User], resource_type: str) -> list:
    """Return ids of resources shared with the user (viewer or editor)."""
    if not user:
        return []
    cursor = db.resource_shares.find(
        {"shared_with_email": user.email, "resource_type": resource_type},
        {"_id": 0, "resource_id": 1},
    )
    docs = await cursor.to_list(500)
    return [d["resource_id"] for d in docs]


async def rls_filter_with_shares(user: Optional[User], resource_type: str) -> dict:
    """Same as rls_filter but also includes resources shared with the user."""
    base = rls_filter(user)
    if user and user.role != "admin":
        shared_ids = await get_shared_resource_ids(user, resource_type)
        if shared_ids:
            base = {"$or": base["$or"] + [{"id": {"$in": shared_ids}}]}
    return base


async def get_share_role(user: Optional[User], resource_type: str, resource_id: str) -> Optional[str]:
    """Return 'viewer' / 'editor' if the user has a share on the resource; None otherwise."""
    if not user:
        return None
    share = await db.resource_shares.find_one(
        {"resource_type": resource_type, "resource_id": resource_id, "shared_with_email": user.email},
        {"_id": 0, "role": 1},
    )
    return share.get("role") if share else None


async def can_read_resource_async(user: Optional[User], resource: dict, resource_type: str) -> bool:
    """Async read check including share grants."""
    if can_read_resource(user, resource):
        return True
    return (await get_share_role(user, resource_type, resource.get("id", ""))) is not None


async def can_write_resource_async(user: Optional[User], resource: dict, resource_type: str) -> bool:
    """Async write check: owner/admin OR a share with role=editor."""
    if can_write_resource(user, resource):
        return True
    role = await get_share_role(user, resource_type, resource.get("id", ""))
    return role == "editor"


@router.get("/session")
async def get_session_data(request: Request, response: Response):
    """Exchange a session_token (issued by /api/auth/google/callback and passed
    via the URL hash to the frontend AuthCallback) for the corresponding user
    profile. The X-Session-ID header IS the local session token — no external
    OAuth proxy hop. Returns 401 if the token is unknown/expired or the user
    is blocked.
    """
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")

    local_session = await db.user_sessions.find_one({"session_token": session_id}, {"_id": 0})
    if not local_session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    user = await db.users.find_one({"user_id": local_session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Account blocked. Contact an administrator.")

    # Refresh the cookie (some browsers drop it across the OAuth redirect chain).
    response.set_cookie(
        key="session_token",
        value=session_id,
        path="/",
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
    )
    return {
        "session_token": session_id,
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user.get("name"),
        "picture": user.get("picture"),
        "role": user.get("role"),
        "github_login": user.get("github_login"),
        "github_connected_at": user.get("github_connected_at"),
    }


@router.get("/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    data = user.model_dump()
    data.pop("github_access_token", None)
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    data["is_demo"] = user_doc.get("is_demo", False) if user_doc else False
    data["plan"] = user_doc.get("plan") if user_doc else None
    return data


@router.patch("/me")
async def patch_me(request: Request):
    """Update own user fields (e.g. noticias)."""
    user = await require_auth(request)
    body = await request.json()
    allowed = {"noticias"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No updatable fields provided")
    await db.users.update_one({"user_id": user.user_id}, {"$set": updates})
    for k, v in updates.items():
        setattr(user, k, v)
    return user.model_dump()


@router.get("/me/permissions")
async def get_my_permissions(request: Request):
    """Return a summary of what the authenticated user can access (RLS surface)."""
    user = await require_auth(request)

    is_admin = user.role == "admin"
    public = {"created_by": {"$in": list(_PUBLIC_OWNERS)}}
    mine = {"created_by": {"$in": [user.email, user.user_id]}}

    owned_projects = await db.projects.find(
        mine, {"_id": 0, "id": 1, "name": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1).to_list(200)
    owned_diagrams = await db.diagrams.find(
        mine, {"_id": 0, "id": 1, "name": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1).to_list(200)

    public_projects = await db.projects.find(
        public, {"_id": 0, "id": 1, "name": 1, "created_by": 1}
    ).to_list(200)
    public_diagrams = await db.diagrams.find(
        public, {"_id": 0, "id": 1, "name": 1, "created_by": 1}
    ).to_list(200)

    shared_projects_count = 0
    shared_diagrams_count = 0
    if is_admin:
        shared_projects_count = await db.projects.count_documents(
            {"created_by": {"$nin": list(_PUBLIC_OWNERS) + [user.email, user.user_id]}}
        )
        shared_diagrams_count = await db.diagrams.count_documents(
            {"created_by": {"$nin": list(_PUBLIC_OWNERS) + [user.email, user.user_id]}}
        )

    shared_with_me = await db.resource_shares.find(
        {"shared_with_email": user.email},
        {"_id": 0},
    ).sort("created_at", -1).to_list(200)

    return {
        "user": {
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_admin": is_admin,
            "noticias": user.noticias if hasattr(user, "noticias") else False,
        },
        "rules": {
            "read": "Admin ve todo. Propietarios y recursos públicos (seed) son legibles por todos los usuarios autenticados. Los recursos compartidos contigo también están visibles.",
            "write": "Solo el propietario, un administrador o un colaborador con rol 'editor' puede modificar. Eliminar está reservado al propietario/admin.",
            "public_owners": sorted([o for o in _PUBLIC_OWNERS if o]) or ["system"],
        },
        "owned": {
            "projects": owned_projects,
            "diagrams": owned_diagrams,
            "projects_count": len(owned_projects),
            "diagrams_count": len(owned_diagrams),
        },
        "shared_public": {
            "projects": public_projects,
            "diagrams": public_diagrams,
            "projects_count": len(public_projects),
            "diagrams_count": len(public_diagrams),
        },
        "shared_with_me": {
            "items": shared_with_me,
            "count": len(shared_with_me),
        },
        "admin_only": {
            "other_users_projects": shared_projects_count,
            "other_users_diagrams": shared_diagrams_count,
        } if is_admin else None,
    }


@router.put("/me/github")
async def connect_github(request: Request):
    """Connect the user's GitHub account by storing their PAT."""
    user = await require_auth(request)
    body = await request.json()
    github_login = body.get("github_login", "").strip()
    github_access_token = body.get("github_access_token", "").strip()
    if not github_login or not github_access_token:
        logger.warning("GitHub connect failed: missing fields — user=%s", user.email)
        raise HTTPException(status_code=400, detail="github_login and github_access_token are required")
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "github_login": github_login,
            "github_access_token": github_access_token,
            "github_connected_at": datetime.now(timezone.utc).isoformat(),
        }}
    )
    logger.info("GitHub connected: user=%s login=%s", user.email, github_login)
    return {"github_login": github_login, "github_connected_at": datetime.now(timezone.utc).isoformat()}


@router.delete("/me/github")
async def disconnect_github(request: Request):
    """Disconnect the user's GitHub account."""
    user = await require_auth(request)
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$unset": {"github_login": "", "github_access_token": "", "github_connected_at": ""}}
    )
    logger.info("GitHub disconnected: user=%s", user.email)
    return {"message": "GitHub disconnected"}


@router.get("/limits")
async def get_user_limits(request: Request):
    """Get current user's plan limits and usage."""
    user = await require_auth(request)
    from limits import FREE_LIMITS, check_diagram_limit, check_ai_limit, check_oop_limit, check_component_limit
    if user.role != "free":
        return {"role": user.role, "restricted": False, "limits": {}}
    diagram_check = await check_diagram_limit(user.user_id)
    ai_check = await check_ai_limit(user.user_id)
    oop_check = await check_oop_limit(user.user_id, user.email)
    comp_check = await check_component_limit(user.user_id, user.email)
    return {
        "role": user.role,
        "restricted": True,
        "limits": {
            "diagrams": {"max": FREE_LIMITS["max_diagrams"], "current": diagram_check.get("current", 0), "allowed": diagram_check["allowed"]},
            "ai": {"max": FREE_LIMITS["max_ai_per_month"], "current": ai_check.get("current", 0), "allowed": ai_check["allowed"]},
            "oop": {"max": FREE_LIMITS["max_oop_classes"], "current": oop_check.get("current", 0), "allowed": oop_check["allowed"]},
            "components": {"max": FREE_LIMITS["max_components"], "current": comp_check.get("current", 0), "allowed": comp_check["allowed"]},
            "export": {"allowed": False},
        }
    }



@router.post("/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    auth_header = request.headers.get("Authorization")
    if not session_token and auth_header and auth_header.startswith("Bearer "):
        session_token = auth_header.split(" ")[1]
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token")
    return {"message": "Logged out"}


@router.post("/dev-login")
async def dev_login():
    test_email = "test@bpmnmodeler.dev"
    test_user_id = "user_test_dev_001"
    existing = await db.users.find_one({"email": test_email}, {"_id": 0})
    if existing and existing.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Account blocked. Contact an administrator.")
    if not existing:
        await db.users.insert_one({
            "user_id": test_user_id, "email": test_email, "name": "Dev Tester",
            "picture": None, "role": "subscription",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.delete_many({"user_id": test_user_id})
    await db.user_sessions.insert_one({
        "user_id": test_user_id, "session_token": session_token,
        "expires_at": expires_at.isoformat(), "created_at": datetime.now(timezone.utc).isoformat()
    })
    role = resolve_role(test_email, existing.get("role") if existing else None)
    return {"user_id": test_user_id, "email": test_email, "name": "Dev Tester", "role": role, "session_token": session_token}


@router.post("/token-login")
async def token_login(request: Request):
    """Login using an existing session_token from production. Use this for local/self-hosted servers."""
    body = await request.json()
    token = body.get("token", "")
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Account blocked. Contact an administrator.")
    await record_audit(
        "auth.token_login",
        actor_email=user["email"],
        actor_user_id=user["user_id"],
        actor_role=user.get("role", "subscription"),
        resource_type="session",
        resource_id=token,
        request=request,
    )
    return {"user_id": user["user_id"], "email": user["email"], "name": user["name"], "role": user.get("role", "subscription"), "session_token": token}

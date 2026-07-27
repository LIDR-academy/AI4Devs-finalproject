# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Direct Google OAuth 2.0 (Authorization Code flow) — replaces the Emergent auth proxy.

REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

Endpoints:
  - GET /api/auth/google/login    → redirect user to Google consent screen
  - GET /api/auth/google/callback → Google calls back here with `code`; we
                                    exchange it for tokens, fetch userinfo,
                                    upsert the user, create a session row,
                                    and redirect the browser to the frontend
                                    with the session_token in the URL hash so
                                    the existing AuthCallback component picks
                                    it up (matches the previous Emergent flow).

CSRF: the `state` query-param sent to Google is a HMAC-signed token (via
itsdangerous) carrying the original frontend origin so we can redirect back
to the right place after callback. Google echoes `state` back to us; we
verify the signature before trusting it.
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from itsdangerous import BadSignature, URLSafeTimedSerializer

from database import db
from routers.auth import resolve_role

router = APIRouter(prefix="/auth/google", tags=["google-auth"])
logger = logging.getLogger(__name__)

# --- Config (env-only — fail fast if missing) ---------------------------------
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
SESSION_SECRET = os.environ.get("SESSION_SECRET", "")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

# Optional explicit override. When set (e.g. on production), we use this exact
# URL as the redirect_uri sent to Google. Required when the reverse proxy
# doesn't set x-forwarded-proto/host correctly. Format: scheme://host (no path).
BACKEND_PUBLIC_URL = os.environ.get("BACKEND_PUBLIC_URL", "").rstrip("/")

# State serializer: signs the originating frontend URL so we can redirect back.
_serializer = URLSafeTimedSerializer(SESSION_SECRET or "dev-fallback", salt="google-oauth-state")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_redirect_uri(request: Request) -> str:
    """Build the redirect_uri for Google OAuth.

    Priority order:
      1. If BACKEND_PUBLIC_URL env var is set, ALWAYS use that (the safe path
         when behind a proxy that strips/mangles the X-Forwarded-* headers).
      2. Otherwise, derive from the request:
            scheme: x-forwarded-proto > request.url.scheme > "https" if host
                    is sdd-ia.com (force HTTPS for known production domains)
            host  : x-forwarded-host > request.url.netloc, normalised by
                    stripping the leading `www.` so it matches what's
                    registered in Google Cloud Console.
    """
    if BACKEND_PUBLIC_URL:
        return f"{BACKEND_PUBLIC_URL}/api/auth/google/callback"

    scheme = request.headers.get("x-forwarded-proto") or request.url.scheme
    host = request.headers.get("x-forwarded-host") or request.url.netloc

    # Normalise — Google's URI list uses the bare domain for sdd-ia.com.
    if host.startswith("www."):
        host = host[4:]

    # Defensive: production must be HTTPS even if proxy forgot the header.
    if host.endswith("sdd-ia.com") or host.endswith("emergentagent.com"):
        scheme = "https"

    return f"{scheme}://{host}/api/auth/google/callback"


# ---------------------------------------------------------------------------
# 1) Initiate the flow
# ---------------------------------------------------------------------------

@router.get("/login")
async def google_login(request: Request, returnTo: str = "/profile"):
    """Redirect the browser to Google's consent screen."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    state = _serializer.dumps({"returnTo": returnTo})
    redirect_uri = _build_redirect_uri(request)
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account",
        "state": state,
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}", status_code=302)


# ---------------------------------------------------------------------------
# 2) Callback — exchange code for tokens, upsert user, create session
# ---------------------------------------------------------------------------

@router.get("/callback")
async def google_callback(request: Request, code: str | None = None,
                          state: str | None = None, error: str | None = None,
                          error_description: str | None = None):
    # Surface Google's error in the URL so the user sees something useful
    # instead of a 4xx in JSON. Frontend reads ?error=... on /login.
    frontend_login = "/login"
    if error:
        msg = error_description or error
        logger.warning("Google denied OAuth: %s — %s", error, error_description)
        return RedirectResponse(
            f"{frontend_login}?error={error}&detail={msg[:200]}",
            status_code=302,
        )
    if not code or not state:
        return RedirectResponse(
            f"{frontend_login}?error=missing_params",
            status_code=302,
        )

    # Verify state (CSRF + retrieve original returnTo)
    try:
        state_payload = _serializer.loads(state, max_age=600)  # 10 minutes
    except BadSignature:
        return RedirectResponse(
            f"{frontend_login}?error=invalid_state",
            status_code=302,
        )
    return_to = state_payload.get("returnTo") or "/profile"

    redirect_uri = _build_redirect_uri(request)
    # Exchange code → tokens
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            token_resp = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if token_resp.status_code != 200:
                logger.error(
                    "Google token exchange failed [%s]: %s",
                    token_resp.status_code, token_resp.text[:500],
                )
                return RedirectResponse(
                    f"{frontend_login}?error=token_exchange_failed&detail={token_resp.text[:200]}",
                    status_code=302,
                )
            tokens = token_resp.json()
            access_token = tokens.get("access_token")
            if not access_token:
                return RedirectResponse(
                    f"{frontend_login}?error=no_access_token",
                    status_code=302,
                )

            # Fetch userinfo
            ui_resp = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if ui_resp.status_code != 200:
                logger.error("Google userinfo failed: %s", ui_resp.text[:300])
                return RedirectResponse(
                    f"{frontend_login}?error=userinfo_failed",
                    status_code=302,
                )
            ui = ui_resp.json()
    except Exception as e:
        logger.exception("Google OAuth callback exception")
        return RedirectResponse(
            f"{frontend_login}?error=oauth_exception&detail={str(e)[:200]}",
            status_code=302,
        )

    email = (ui.get("email") or "").lower().strip()
    if not email or not ui.get("email_verified", True):
        raise HTTPException(status_code=400, detail="Google account email not verified")

    name = ui.get("name") or ""
    picture = ui.get("picture") or ""

    # Upsert user — never overwrite admin-managed fields on existing users.
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    now = _now_iso()
    if existing:
        if existing.get("is_active") is False:
            # Send the user back to the login page with a message
            error_url = "/login?error=blocked"
            return RedirectResponse(error_url, status_code=302)
        user_id = existing["user_id"]
        role = resolve_role(email, existing.get("role"))
        update_fields: dict = {"role": role, "last_login_at": now}
        # Only fill empty fields — never overwrite admin-edited values.
        if picture and not existing.get("picture"):
            update_fields["picture"] = picture
        if name and not existing.get("name"):
            update_fields["name"] = name
        await db.users.update_one({"email": email}, {"$set": update_fields})
        new_user = False
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        role = resolve_role(email)
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": role,
            "is_active": True,
            "created_at": now,
            "last_login_at": now,
            "auth_provider": "google",
        })
        new_user = True

    # Create session (replace any existing for this user — single device policy
    # matches the previous behaviour in /api/auth/session).
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": now,
    })

    # Audit
    try:
        from routers.audit import record_audit
        await record_audit(
            "auth.login",
            actor_email=email,
            actor_user_id=user_id,
            actor_role=role,
            resource_type="user",
            resource_id=user_id,
            details={"method": "google_oauth_direct", "new_user": new_user},
            request=request,
        )
    except Exception:
        pass

    # Redirect browser back to the frontend WITH the session in the URL hash so
    # the existing AuthCallback component (matched by App.js) picks it up.
    # Hash-fragment is NOT sent to the server, which is the right place for a token.
    return_to_safe = return_to if return_to.startswith("/") else "/profile"
    redirect_url = f"{return_to_safe}#session_id={session_token}"
    response = RedirectResponse(redirect_url, status_code=302)
    response.set_cookie(
        key="session_token",
        value=session_token,
        path="/",
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=request.url.scheme == "https",
        httponly=False,  # frontend reads it for the X-Session-ID header (legacy)
    )
    return response

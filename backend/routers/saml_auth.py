# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""SAML 2.0 Service Provider integration (multi-tenant).

Per-domain IdP configuration stored in `sso_configs` collection.
Flow (SP-initiated):
  1. User → GET /api/auth/saml/login?domain=acme.com
     → 302 redirect to IdP SSO URL with signed AuthnRequest
  2. IdP authenticates user and POSTs SAMLResponse to /api/auth/saml/acs
     → we validate signature + assertion, match user by email, create session
     → 302 redirect to frontend with ?session_token=<token>
  3. SP metadata at /api/auth/saml/metadata?domain=acme.com (admin uploads to IdP)

Admin CRUD of `sso_configs` gated by plan=enterprise OR role=admin.

All SAML validation runs in a thread pool (python3-saml is sync).
"""
from __future__ import annotations

import asyncio
import os
import re
import uuid
import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import RedirectResponse, PlainTextResponse
from pydantic import BaseModel, Field

from database import db
from routers.auth import require_auth

logger = logging.getLogger(__name__)
router = APIRouter(tags=["saml"])

# SP certificate + private key loaded once at startup
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_CERT_DIR = os.path.join(_BASE_DIR, "certs")
try:
    with open(os.path.join(_CERT_DIR, "sp_cert.pem"), "r") as f:
        SP_CERT = f.read()
    with open(os.path.join(_CERT_DIR, "sp_private.key"), "r") as f:
        SP_KEY = f.read()
except FileNotFoundError:
    SP_CERT = ""
    SP_KEY = ""
    logger.warning("SAML: SP certificate files missing at %s", _CERT_DIR)

_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="saml")


# ---------------- Models ----------------

class SSOConfigCreate(BaseModel):
    email_domain: str           # e.g. "acme.com"
    organization_name: str
    idp_entity_id: str           # IdP EntityID
    idp_sso_url: str             # IdP SSO endpoint (HTTP-Redirect)
    idp_slo_url: Optional[str] = None
    x509_cert: str               # IdP public cert (PEM)
    name_id_format: str = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"


class SSOConfigUpdate(BaseModel):
    organization_name: Optional[str] = None
    idp_entity_id: Optional[str] = None
    idp_sso_url: Optional[str] = None
    idp_slo_url: Optional[str] = None
    x509_cert: Optional[str] = None
    name_id_format: Optional[str] = None


# ---------------- Helpers ----------------

async def _require_enterprise_or_admin(request: Request):
    user = await require_auth(request)
    u = await db.users.find_one({"user_id": user.user_id}, {"_id": 0, "plan": 1, "role": 1})
    plan = (u or {}).get("plan")
    if user.role == "admin" or plan == "enterprise":
        return user
    raise HTTPException(status_code=403, detail="SSO admin requires Enterprise plan")


def _backend_public_url(request: Request) -> str:
    """Return the externally-visible base URL so SAML URLs match what the IdP sees."""
    base = os.environ.get("SAML_SP_BASE_URL") or str(request.base_url).rstrip("/")
    # Prefer explicit env. base_url from ingress typically contains correct https host.
    return base


def _build_saml_settings(sso_doc: Dict[str, Any], request: Request) -> Dict[str, Any]:
    base = _backend_public_url(request)
    acs_url = f"{base}/api/auth/saml/acs"
    metadata_url = f"{base}/api/auth/saml/metadata"
    slo_url = f"{base}/api/auth/saml/sls"
    return {
        "strict": True,
        "debug": False,
        "sp": {
            "entityId": metadata_url,
            "assertionConsumerService": {
                "url": acs_url,
                "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
            },
            "singleLogoutService": {
                "url": slo_url,
                "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
            },
            "NameIDFormat": sso_doc.get(
                "name_id_format",
                "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
            ),
            "x509cert": SP_CERT,
            "privateKey": SP_KEY,
        },
        "idp": {
            "entityId": sso_doc["idp_entity_id"],
            "singleSignOnService": {
                "url": sso_doc["idp_sso_url"],
                "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
            },
            "singleLogoutService": {
                "url": sso_doc.get("idp_slo_url") or sso_doc["idp_sso_url"],
                "binding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
            },
            "x509cert": sso_doc["x509_cert"],
        },
        "security": {
            "authnRequestsSigned": True,
            "wantAssertionsSigned": True,
            "wantMessagesSigned": False,
            "signMetadata": True,
            "signatureAlgorithm": "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
            "digestAlgorithm": "http://www.w3.org/2001/04/xmlenc#sha256",
        },
    }


def _build_req_context(request: Request, form_post: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    url = request.url
    return {
        "http_host": url.hostname or "",
        "server_port": str(url.port) if url.port else ("443" if url.scheme == "https" else "80"),
        "script_name": url.path,
        "get_data": dict(request.query_params),
        "post_data": form_post or {},
        "https": "on" if url.scheme == "https" else "off",
        "request_uri": str(url),
    }


def _login_sync(settings: Dict[str, Any], req: Dict[str, Any], return_to: str) -> str:
    from onelogin.saml2.auth import OneLogin_Saml2_Auth

    auth = OneLogin_Saml2_Auth(req, settings)
    return auth.login(return_to=return_to)


def _acs_sync(settings: Dict[str, Any], req: Dict[str, Any]):
    from onelogin.saml2.auth import OneLogin_Saml2_Auth

    auth = OneLogin_Saml2_Auth(req, settings)
    auth.process_response()
    errors = auth.get_errors()
    if errors:
        return None, f"{', '.join(errors)} | reason: {auth.get_last_error_reason()}"
    if not auth.is_authenticated():
        return None, "Not authenticated"
    return {
        "name_id": auth.get_nameid(),
        "attributes": auth.get_attributes(),
        "session_index": auth.get_session_index(),
    }, None


def _metadata_sync(settings: Dict[str, Any]) -> str:
    from onelogin.saml2.settings import OneLogin_Saml2_Settings

    s = OneLogin_Saml2_Settings(settings=settings, sp_validation_only=True)
    md = s.get_sp_metadata()
    errors = s.validate_metadata(md)
    if errors:
        raise RuntimeError(f"Metadata validation failed: {errors}")
    return md.decode("utf-8") if isinstance(md, bytes) else md


# ---------------- Public SAML endpoints ----------------

@router.get("/auth/saml/login")
async def saml_login(request: Request, domain: str = Query(..., description="Email domain")):
    domain = domain.lower().strip()
    sso_doc = await db.sso_configs.find_one({"email_domain": domain}, {"_id": 0})
    if not sso_doc:
        raise HTTPException(status_code=404, detail=f"No SSO config for domain: {domain}")
    if not SP_KEY:
        raise HTTPException(status_code=500, detail="SP certificate not configured on server")

    settings = _build_saml_settings(sso_doc, request)
    req_ctx = _build_req_context(request)
    # RelayState returns the user to this URL after ACS
    return_to = f"{_backend_public_url(request)}/api/auth/saml/acs-return?domain={domain}"

    loop = asyncio.get_event_loop()
    try:
        redirect_url = await loop.run_in_executor(_executor, _login_sync, settings, req_ctx, return_to)
    except Exception as e:
        logger.error("SAML login failed for %s: %s", domain, e)
        raise HTTPException(status_code=500, detail=f"SAML login failed: {e}")

    try:
        from routers.audit import record_audit
        await record_audit("auth.saml.initiated", resource_type="sso", resource_id=domain, request=request)
    except Exception:
        pass
    return RedirectResponse(url=redirect_url, status_code=302)


@router.post("/auth/saml/acs")
async def saml_acs(request: Request):
    """Assertion Consumer Service: validate SAMLResponse and create session."""
    form = await request.form()
    post_data = {k: v for k, v in form.items()}

    saml_response = post_data.get("SAMLResponse", "")
    if not saml_response:
        raise HTTPException(status_code=400, detail="Missing SAMLResponse")

    # Extract email (NameID) from raw SAMLResponse to know which domain → which IdP config
    import base64
    try:
        decoded = base64.b64decode(saml_response).decode("utf-8", errors="ignore")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid SAMLResponse encoding")

    m = re.search(r"<(?:\w+:)?NameID[^>]*>([^<]+@[^<\s]+)<", decoded)
    if not m:
        raise HTTPException(status_code=400, detail="Could not extract email from SAMLResponse")
    email = m.group(1).strip().lower()
    domain = email.split("@")[1]

    sso_doc = await db.sso_configs.find_one({"email_domain": domain}, {"_id": 0})
    if not sso_doc:
        raise HTTPException(status_code=404, detail=f"No SSO config for domain: {domain}")

    settings = _build_saml_settings(sso_doc, request)
    req_ctx = _build_req_context(request, form_post=post_data)

    loop = asyncio.get_event_loop()
    user_data, err = await loop.run_in_executor(_executor, _acs_sync, settings, req_ctx)
    if err:
        logger.warning("SAML validation failed for %s: %s", email, err)
        try:
            from routers.audit import record_audit
            await record_audit(
                "auth.saml.failed",
                actor_email=email,
                resource_type="sso",
                resource_id=domain,
                details={"error": err[:200]},
                request=request,
            )
        except Exception:
            pass
        raise HTTPException(status_code=401, detail=f"SAML validation failed: {err}")

    nameid = (user_data.get("name_id") or email).strip().lower()

    # Match-by-email: upsert user
    existing = await db.users.find_one({"email": nameid}, {"_id": 0})
    if existing and existing.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Account blocked. Contact an administrator.")
    now = datetime.now(timezone.utc).isoformat()
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"email": nameid},
            {"$set": {
                "sso_enabled": True,
                "plan": existing.get("plan") or "enterprise",
                "organization_name": sso_doc["organization_name"],
                "last_saml_login_at": now,
            }},
        )
        new_user = False
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        name = nameid.split("@")[0]
        attrs = user_data.get("attributes") or {}
        # Try standard attributes for display name
        for key in ("displayName", "name", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"):
            if key in attrs and attrs[key]:
                v = attrs[key]
                name = v[0] if isinstance(v, list) and v else str(v)
                break
        await db.users.insert_one({
            "user_id": user_id,
            "email": nameid,
            "name": name,
            "role": "subscription",
            "plan": "enterprise",
            "sso_enabled": True,
            "organization_name": sso_doc["organization_name"],
            "auth_method": "saml",
            "created_at": now,
            "last_saml_login_at": now,
        })
        new_user = True

    # Create session
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "auth_method": "saml",
        "created_at": now,
    })

    try:
        from routers.audit import record_audit
        await record_audit(
            "auth.saml.success",
            actor_email=nameid, actor_user_id=user_id, actor_role="subscription",
            resource_type="sso", resource_id=domain,
            details={"new_user": new_user, "organization": sso_doc["organization_name"]},
            request=request,
        )
    except Exception:
        pass

    # Redirect to frontend with session token
    frontend_base = os.environ.get("FRONTEND_URL") or _backend_public_url(request)
    redirect = f"{frontend_base}/login?session_token={session_token}&sso=1"
    return RedirectResponse(url=redirect, status_code=302)


@router.get("/auth/saml/metadata")
async def saml_metadata(request: Request, domain: str = Query(...)):
    domain = domain.lower().strip()
    sso_doc = await db.sso_configs.find_one({"email_domain": domain}, {"_id": 0})
    if not sso_doc:
        raise HTTPException(status_code=404, detail=f"No SSO config for domain: {domain}")
    if not SP_KEY:
        raise HTTPException(status_code=500, detail="SP certificate not configured")

    settings = _build_saml_settings(sso_doc, request)
    loop = asyncio.get_event_loop()
    try:
        md = await loop.run_in_executor(_executor, _metadata_sync, settings)
    except Exception as e:
        logger.error("metadata generation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
    return PlainTextResponse(
        md,
        media_type="application/xml",
        headers={"Content-Disposition": f'attachment; filename="sp-metadata-{domain}.xml"'},
    )


# ---------------- Admin CRUD for SSO configs ----------------

@router.get("/sso-configs")
async def list_sso_configs(request: Request):
    await _require_enterprise_or_admin(request)
    items = await db.sso_configs.find({}, {"_id": 0}).sort("email_domain", 1).to_list(200)
    # Don't leak the full private IdP cert in list view; show only fingerprint/truncated
    for it in items:
        cert = it.get("x509_cert") or ""
        it["x509_cert_preview"] = (cert[:60] + "...") if len(cert) > 60 else cert
        it.pop("x509_cert", None)
    return items


@router.get("/sso-configs/{domain}")
async def get_sso_config(domain: str, request: Request):
    await _require_enterprise_or_admin(request)
    doc = await db.sso_configs.find_one({"email_domain": domain.lower()}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc


@router.post("/sso-configs")
async def create_sso_config(payload: SSOConfigCreate, request: Request):
    user = await _require_enterprise_or_admin(request)
    domain = payload.email_domain.lower().strip()
    if not re.match(r"^[a-z0-9.-]+\.[a-z]{2,}$", domain):
        raise HTTPException(status_code=400, detail="Invalid email domain")

    existing = await db.sso_configs.find_one({"email_domain": domain})
    if existing:
        raise HTTPException(status_code=409, detail="SSO config already exists for this domain")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "email_domain": domain,
        "organization_name": payload.organization_name,
        "idp_entity_id": payload.idp_entity_id,
        "idp_sso_url": payload.idp_sso_url,
        "idp_slo_url": payload.idp_slo_url or "",
        "x509_cert": payload.x509_cert,
        "name_id_format": payload.name_id_format,
        "created_by": user.email,
        "created_at": now,
        "updated_at": now,
    }
    await db.sso_configs.insert_one(doc.copy())

    try:
        from routers.audit import record_audit
        await record_audit(
            "sso_config.created",
            actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
            resource_type="sso_config", resource_id=domain,
            details={"organization": payload.organization_name},
            request=request,
        )
    except Exception:
        pass
    return doc


@router.put("/sso-configs/{domain}")
async def update_sso_config(domain: str, payload: SSOConfigUpdate, request: Request):
    user = await _require_enterprise_or_admin(request)
    existing = await db.sso_configs.find_one({"email_domain": domain.lower()}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")

    update: Dict[str, Any] = {}
    for k, v in payload.model_dump(exclude_none=True).items():
        update[k] = v
    if not update:
        return existing
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.sso_configs.update_one({"email_domain": domain.lower()}, {"$set": update})
    try:
        from routers.audit import record_audit
        await record_audit(
            "sso_config.updated",
            actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
            resource_type="sso_config", resource_id=domain, details={"fields": list(update.keys())},
            request=request,
        )
    except Exception:
        pass
    return await db.sso_configs.find_one({"email_domain": domain.lower()}, {"_id": 0})


@router.delete("/sso-configs/{domain}")
async def delete_sso_config(domain: str, request: Request):
    user = await _require_enterprise_or_admin(request)
    res = await db.sso_configs.delete_one({"email_domain": domain.lower()})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        from routers.audit import record_audit
        await record_audit(
            "sso_config.deleted",
            actor_email=user.email, actor_user_id=user.user_id, actor_role=user.role,
            resource_type="sso_config", resource_id=domain, request=request,
        )
    except Exception:
        pass
    return {"ok": True}


@router.get("/sso-configs/public/check")
async def public_check_domain(domain: str = Query(...)):
    """Public endpoint: let the login page know if a domain has SSO configured.

    Returns {"sso_enabled": bool, "organization_name": str|null}.
    No auth required (by design — prevents email enumeration? we only confirm whether
    the org exists but NOT user presence).
    """
    domain = domain.lower().strip()
    doc = await db.sso_configs.find_one({"email_domain": domain}, {"_id": 0, "organization_name": 1})
    if not doc:
        return {"sso_enabled": False, "organization_name": None}
    return {"sso_enabled": True, "organization_name": doc.get("organization_name")}

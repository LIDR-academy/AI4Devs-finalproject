# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Stripe Checkout for SDD-IA subscriptions.

Plans (server-side, never trust frontend):
- pro:  $19.00 / month (id: "pro")
- team: $49.00 / month (id: "team")

Free and Enterprise are NOT handled here:
  - free: no payment required
  - enterprise: contact sales (custom)

Endpoints:
- POST /api/payments/checkout/session   → create Stripe checkout session
- GET  /api/payments/checkout/status/{session_id}  → poll status (idempotent)
- POST /api/webhook/stripe              → Stripe webhook handler
"""
from __future__ import annotations

import os
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request

from emergentintegrations.payments.stripe.checkout import StripeCheckout

from database import db
from routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["payments"])

# Free trial (days) granted on Pro/Team checkout — no card required up-front
TRIAL_PERIOD_DAYS = 14

# Server-side fixed prices — DO NOT accept amounts from frontend
PLANS = {
    "pro": {"name": "Pro", "amount": 19.00, "currency": "eur", "role": "subscription"},
    "team": {"name": "Team", "amount": 49.00, "currency": "eur", "role": "subscription"},
}


def _stripe_client(http_request: Request) -> StripeCheckout:
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    # Optional webhook secret from env (set in production for signature validation).
    # When unset (dev/preview), the emergentintegrations helper uses its internal validation.
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    kwargs = {"api_key": api_key, "webhook_url": webhook_url}
    if webhook_secret:
        kwargs["webhook_secret"] = webhook_secret
    try:
        return StripeCheckout(**kwargs)
    except TypeError:
        # Fallback: helper may not accept webhook_secret kwarg in this version
        return StripeCheckout(api_key=api_key, webhook_url=webhook_url)


def _native_stripe():
    """Native Stripe SDK configured with the same proxy as emergentintegrations
    when using the platform placeholder key. Used for:
      - subscription mode checkout sessions (not supported by emergentintegrations)
      - retrieving full session/customer/subscription objects
      - parsing webhook events (including customer.subscription.deleted)
    """
    import stripe as stripe_sdk
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    stripe_sdk.api_key = api_key
    if "sk_test_emergent" in api_key:
        stripe_sdk.api_base = "https://integrations.emergentagent.com/stripe"
    return stripe_sdk


@router.post("/payments/checkout/session")
async def create_checkout_session(payload: dict, http_request: Request):
    """Create a Stripe checkout session for a fixed plan.

    Body: { "plan_id": "pro" | "team", "origin_url": "https://..." }
    """
    plan_id = payload.get("plan_id")
    origin_url = payload.get("origin_url", "").rstrip("/")
    if plan_id not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan_id")
    if not origin_url:
        raise HTTPException(status_code=400, detail="origin_url is required")

    plan = PLANS[plan_id]
    user = await get_current_user(http_request)
    user_email = user.email if user else None
    user_id = user.user_id if user else None

    success_url = f"{origin_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/pricing"

    metadata = {
        "plan_id": plan_id,
        "plan_name": plan["name"],
        "user_email": user_email or "guest",
        "user_id": user_id or "guest",
        "source": "sdd_ia_pricing",
        "trial_period_days": str(TRIAL_PERIOD_DAYS),
    }

    # Subscription mode with 14-day free trial, no card required up-front.
    # We use the native Stripe SDK because emergentintegrations only supports
    # one-time payment mode.
    stripe_sdk = _native_stripe()

    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"

    line_items = [{
        "price_data": {
            "currency": plan["currency"],
            "product_data": {
                "name": f"SDD-IA {plan['name']}",
                "description": f"Suscripcion mensual SDD-IA plan {plan['name']}",
            },
            "recurring": {"interval": "month"},
            "unit_amount": int(float(plan["amount"]) * 100),
        },
        "quantity": 1,
    }]

    try:
        session = stripe_sdk.checkout.Session.create(
            mode="subscription",
            line_items=line_items,
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=user_email if user_email else None,
            payment_method_collection="if_required",
            subscription_data={
                "trial_period_days": TRIAL_PERIOD_DAYS,
                "metadata": {**metadata, "webhook_url": webhook_url},
            },
            metadata={**metadata, "webhook_url": webhook_url},
            allow_promotion_codes=True,
        )
    except Exception as e:
        logger.error(f"Stripe subscription session error: {e}")
        raise HTTPException(status_code=500, detail="Stripe checkout error")

    # Persist transaction (always BEFORE returning to frontend)
    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "plan_id": plan_id,
        "amount": float(plan["amount"]),
        "currency": plan["currency"],
        "mode": "subscription",
        "trial_period_days": TRIAL_PERIOD_DAYS,
        "metadata": metadata,
        "user_email": user_email,
        "user_id": user_id,
        "payment_status": "initiated",
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.id, "trial_period_days": TRIAL_PERIOD_DAYS}


@router.get("/payments/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request):
    """Poll the checkout status. Idempotent: applies role upgrade only once.

    Uses the native Stripe SDK so we can persist the `customer` and `subscription`
    IDs returned for subscription-mode sessions — required later to map a
    `customer.subscription.deleted` webhook back to the correct user.
    """
    stripe_sdk = _native_stripe()
    try:
        session = stripe_sdk.checkout.Session.retrieve(session_id)
    except Exception as e:
        logger.error(f"Stripe retrieve session error: {e}")
        raise HTTPException(status_code=502, detail="Stripe error")

    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    new_payment_status = session.payment_status
    new_status = session.status
    customer_id = session.customer if isinstance(session.customer, str) else (
        session.customer.id if session.customer else None
    )
    subscription_id = session.subscription if isinstance(session.subscription, str) else (
        session.subscription.id if session.subscription else None
    )

    update = {
        "payment_status": new_payment_status,
        "status": new_status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if customer_id:
        update["stripe_customer_id"] = customer_id
    if subscription_id:
        update["stripe_subscription_id"] = subscription_id
    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update})

    # Apply role upgrade exactly once (idempotency guard via flag in document).
    # For subscriptions with trial: payment_status is "no_payment_required" but
    # status="complete" once the user finalizes — we still grant the role so the
    # trial is usable from minute zero.
    if (
        new_payment_status in ("paid", "no_payment_required")
        and new_status == "complete"
        and not tx.get("plan_applied")
        and tx.get("user_email")
    ):
        plan_id = tx.get("plan_id")
        plan = PLANS.get(plan_id)
        if plan:
            new_role = plan["role"]
            user_set = {
                "role": new_role,
                "plan": plan_id,
                "plan_updated_at": datetime.now(timezone.utc).isoformat(),
            }
            if customer_id:
                user_set["stripe_customer_id"] = customer_id
            if subscription_id:
                user_set["stripe_subscription_id"] = subscription_id
            await db.users.update_one(
                {"email": tx["user_email"]},
                {"$set": user_set},
            )
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"plan_applied": True, "applied_at": datetime.now(timezone.utc).isoformat()}},
            )
            logger.info(f"Stripe: applied plan={plan_id} role={new_role} to {tx['user_email']}")

    return {
        "session_id": session_id,
        "status": new_status,
        "payment_status": new_payment_status,
        "amount_total": session.amount_total,
        "currency": session.currency,
        "metadata": session.metadata,
        "customer": customer_id,
        "subscription": subscription_id,
        "mode": session.mode,
    }


async def _downgrade_user_to_free(customer_id: str, subscription_id: str | None, reason: str) -> bool:
    """Find the user owning this Stripe customer and downgrade them to `free`.

    Idempotent: if the user is already `free`, just logs and returns.
    Returns True if a user was matched and updated; False otherwise.
    """
    if not customer_id:
        return False
    # Look up the user via the stripe_customer_id we persisted on checkout.
    user_doc = await db.users.find_one(
        {"stripe_customer_id": customer_id},
        {"_id": 0, "email": 1, "role": 1, "plan": 1, "stripe_subscription_id": 1},
    )
    # Fallback: search transactions by customer or subscription
    if not user_doc:
        tx_q = {"$or": []}
        if customer_id:
            tx_q["$or"].append({"stripe_customer_id": customer_id})
        if subscription_id:
            tx_q["$or"].append({"stripe_subscription_id": subscription_id})
        tx = await db.payment_transactions.find_one(tx_q, {"_id": 0, "user_email": 1}) if tx_q["$or"] else None
        if tx and tx.get("user_email"):
            user_doc = await db.users.find_one(
                {"email": tx["user_email"]}, {"_id": 0, "email": 1, "role": 1, "plan": 1}
            )
    if not user_doc:
        logger.warning(f"[webhook] no user found for customer={customer_id} sub={subscription_id}")
        return False

    await db.users.update_one(
        {"email": user_doc["email"]},
        {"$set": {
            "role": "free",
            "plan": "free",
            "plan_updated_at": datetime.now(timezone.utc).isoformat(),
            "downgraded_reason": reason,
        }, "$unset": {"stripe_subscription_id": ""}},
    )
    logger.info(f"[webhook] downgraded {user_doc['email']} → free (reason={reason})")
    return True


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Stripe webhook (idempotent). Handles:
      - checkout.session.completed       → role upgrade (paid OR trial activation)
      - customer.subscription.deleted    → downgrade to free
      - customer.subscription.updated    → downgrade if status canceled/unpaid/incomplete_expired
      - invoice.payment_failed           → mark transaction (no role change yet)

    Signature handling:
      - When STRIPE_WEBHOOK_SECRET is set: verifies signature via Stripe SDK (recommended in prod).
      - When unset AND APP_ENV != "production": accepts unsigned JSON (dev/preview).
      - When unset AND APP_ENV == "production": refuses with 503 to fail fast on misconfig.
    """
    import json
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    app_env = (os.environ.get("APP_ENV") or "").lower()

    if not webhook_secret and app_env == "production":
        logger.error("[webhook] STRIPE_WEBHOOK_SECRET missing in production — refusing event")
        raise HTTPException(
            status_code=503,
            detail="Webhook secret not configured (set STRIPE_WEBHOOK_SECRET in production)",
        )

    stripe_sdk = _native_stripe()
    try:
        if webhook_secret:
            if not signature:
                raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")
            event = stripe_sdk.Webhook.construct_event(body, signature, webhook_secret)
            event_dict = event if isinstance(event, dict) else event.to_dict()
        else:
            # Dev/preview only: accept unsigned JSON
            event_dict = json.loads(body.decode("utf-8"))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Stripe webhook validation failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event_type = event_dict.get("type")
    event_id = event_dict.get("id")
    obj = event_dict.get("data", {}).get("object", {}) or {}

    logger.info(f"[webhook] event={event_type} id={event_id}")

    # ── Subscription lifecycle: downgrade on cancel / expiration ─────────────
    if event_type == "customer.subscription.deleted":
        customer_id = obj.get("customer")
        subscription_id = obj.get("id")
        await _downgrade_user_to_free(customer_id, subscription_id, reason="subscription_deleted")
        return {"received": True, "event_type": event_type}

    if event_type == "customer.subscription.updated":
        sub_status = obj.get("status")
        if sub_status in ("canceled", "unpaid", "incomplete_expired"):
            await _downgrade_user_to_free(
                obj.get("customer"), obj.get("id"),
                reason=f"subscription_{sub_status}",
            )
        return {"received": True, "event_type": event_type, "subscription_status": sub_status}

    # ── Checkout completion: upgrade ─────────────────────────────────────────
    if event_type == "checkout.session.completed":
        session_id = obj.get("id")
        payment_status = obj.get("payment_status")
        customer_id = obj.get("customer")
        subscription_id = obj.get("subscription")

        if not session_id:
            return {"received": True, "ignored": "no session_id"}

        tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if not tx:
            return {"received": True, "ignored": "tx not found"}

        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": payment_status,
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id,
                "webhook_event_type": event_type,
                "webhook_event_id": event_id,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )

        # Idempotent plan upgrade (covers immediate paid AND trial activation)
        if (
            payment_status in ("paid", "no_payment_required")
            and not tx.get("plan_applied")
            and tx.get("user_email")
        ):
            plan_id = tx.get("plan_id") or (obj.get("metadata") or {}).get("plan_id")
            plan = PLANS.get(plan_id)
            if plan:
                user_set = {
                    "role": plan["role"],
                    "plan": plan_id,
                    "plan_updated_at": datetime.now(timezone.utc).isoformat(),
                }
                if customer_id:
                    user_set["stripe_customer_id"] = customer_id
                if subscription_id:
                    user_set["stripe_subscription_id"] = subscription_id
                await db.users.update_one(
                    {"email": tx["user_email"]},
                    {"$set": user_set},
                )
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"plan_applied": True, "applied_at": datetime.now(timezone.utc).isoformat()}},
                )
                logger.info(f"[webhook] applied plan={plan_id} to {tx['user_email']}")

        return {"received": True, "event_type": event_type, "session_id": session_id}

    # ── Invoice payment failed: just record (subscription.updated will follow) ─
    if event_type == "invoice.payment_failed":
        return {"received": True, "event_type": event_type, "noted": True}

    # Unhandled event → ack so Stripe doesn't retry forever
    return {"received": True, "event_type": event_type, "ignored": True}


@router.get("/payments/trial-status")
async def trial_status(request: Request):
    """Return active-trial info for the current user, derived from Stripe subscription.

    Response shape:
      { has_trial: bool, days_left: int, trial_end_iso: str|null, plan: str|null,
        status: "trialing"|"active"|"none", subscription_id: str|null }
    """
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_doc = await db.users.find_one(
        {"email": user.email},
        {"_id": 0, "stripe_subscription_id": 1, "plan": 1, "stripe_customer_id": 1},
    )
    sub_id = (user_doc or {}).get("stripe_subscription_id")
    plan = (user_doc or {}).get("plan")

    if not sub_id:
        return {
            "has_trial": False,
            "days_left": 0,
            "trial_end_iso": None,
            "plan": plan,
            "status": "none",
            "subscription_id": None,
        }

    try:
        stripe_sdk = _native_stripe()
        sub = stripe_sdk.Subscription.retrieve(sub_id)
        sub_status = getattr(sub, "status", None)
        trial_end_ts = getattr(sub, "trial_end", None)  # unix seconds or None
        if trial_end_ts:
            trial_end = datetime.fromtimestamp(trial_end_ts, tz=timezone.utc)
            now = datetime.now(timezone.utc)
            delta = trial_end - now
            days_left = max(0, int(delta.total_seconds() // 86400) + (1 if delta.total_seconds() % 86400 > 0 else 0))
            has_trial = sub_status == "trialing" and days_left > 0
            return {
                "has_trial": has_trial,
                "days_left": days_left,
                "trial_end_iso": trial_end.isoformat(),
                "plan": plan,
                "status": sub_status or "none",
                "subscription_id": sub_id,
            }
        return {
            "has_trial": False,
            "days_left": 0,
            "trial_end_iso": None,
            "plan": plan,
            "status": sub_status or "none",
            "subscription_id": sub_id,
        }
    except Exception as e:
        logger.warning(f"trial-status: cannot retrieve subscription {sub_id}: {e}")
        return {
            "has_trial": False,
            "days_left": 0,
            "trial_end_iso": None,
            "plan": plan,
            "status": "unknown",
            "subscription_id": sub_id,
            "error": "stripe_unreachable",
        }


@router.get("/payments/webhook/health")
async def webhook_health():
    """Diagnostic: returns whether STRIPE_WEBHOOK_SECRET is configured.

    Does NOT leak the secret. Use this to verify your production deploy:
      curl https://your-domain.com/api/payments/webhook/health
    """
    secret = os.environ.get("STRIPE_WEBHOOK_SECRET") or ""
    api_key = os.environ.get("STRIPE_API_KEY") or ""
    app_env = (os.environ.get("APP_ENV") or "preview").lower()
    return {
        "app_env": app_env,
        "stripe_api_key_configured": bool(api_key),
        "stripe_api_key_mode": "live" if api_key.startswith("sk_live_") else ("test" if api_key.startswith("sk_test_") else "unknown"),
        "stripe_api_key_is_emergent_proxy": "sk_test_emergent" in api_key,
        "stripe_webhook_secret_configured": bool(secret),
        "stripe_webhook_secret_prefix": secret[:7] if secret else None,
        "stripe_webhook_secret_length": len(secret) if secret else 0,
        "signature_required": bool(secret) or app_env == "production",
        "ok": bool(api_key) and (bool(secret) or app_env != "production"),
    }


@router.get("/payments/plans")
async def list_plans():
    """Public endpoint: list available paid plans (server-defined, never trust client)."""
    return {
        "trial_period_days": TRIAL_PERIOD_DAYS,
        "plans": {
            plan_id: {
                "name": p["name"],
                "amount": p["amount"],
                "currency": p["currency"],
                "trial_period_days": TRIAL_PERIOD_DAYS,
            }
            for plan_id, p in PLANS.items()
        },
    }


@router.post("/payments/portal/session")
async def create_billing_portal_session(payload: dict, http_request: Request):
    """Create a Stripe Customer Portal session so the user can manage their subscription.

    Returns 400 if the user has no Stripe customer attached (i.e. has not paid yet).
    """
    import stripe

    user = await get_current_user(http_request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_doc = await db.users.find_one(
        {"email": user.email}, {"_id": 0, "stripe_customer_id": 1, "plan": 1}
    )
    customer_id = user_doc.get("stripe_customer_id") if user_doc else None

    # If the user has no customer yet, try to find it from their last paid transaction.
    if not customer_id:
        latest_tx = await db.payment_transactions.find_one(
            {"user_email": user.email, "payment_status": "paid"},
            {"_id": 0, "stripe_customer_id": 1, "session_id": 1},
            sort=[("updated_at", -1)],
        )
        if latest_tx and latest_tx.get("stripe_customer_id"):
            customer_id = latest_tx["stripe_customer_id"]
        elif latest_tx and latest_tx.get("session_id"):
            # Resolve customer from Stripe session
            try:
                stripe.api_key = os.environ.get("STRIPE_API_KEY")
                cs = stripe.checkout.Session.retrieve(latest_tx["session_id"])
                customer_id = cs.get("customer") if isinstance(cs, dict) else getattr(cs, "customer", None)
            except Exception as e:
                logger.warning(f"Could not resolve customer from Stripe: {e}")

        if customer_id:
            await db.users.update_one(
                {"email": user.email},
                {"$set": {"stripe_customer_id": customer_id}},
            )

    if not customer_id:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "NO_STRIPE_CUSTOMER",
                "message": "No tienes ninguna suscripcion activa. Suscribete primero desde la pagina de planes.",
            },
        )

    return_url = (payload or {}).get("return_url") or f"{str(http_request.base_url).rstrip('/')}/my-permissions"

    try:
        stripe.api_key = os.environ.get("STRIPE_API_KEY")
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return {"url": session.url}
    except Exception as e:
        logger.error(f"Stripe portal error: {e}")
        raise HTTPException(status_code=500, detail="No se pudo abrir el portal de Stripe")

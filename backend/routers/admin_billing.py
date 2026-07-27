# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Admin Billing — read-only KPIs and transaction listing.

All endpoints require role=admin (enforced via routers.auth.require_admin).
Source of truth is `payment_transactions` (own collection) plus `users`
(plan/role/stripe_subscription_id). We do not call Stripe in this router —
that's already covered by webhooks.
"""
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging

from database import db
from routers.auth import require_admin

logger = logging.getLogger(__name__)
router = APIRouter()


def _strip(doc: dict) -> dict:
    """Remove _id and any internal MongoDB types from a document copy."""
    if not doc:
        return {}
    return {k: v for k, v in doc.items() if k != "_id"}


@router.get("/admin/billing/kpis")
async def billing_kpis(request: Request):
    """High-level KPIs: MRR, trial conversion rate, churn (30d), active subs."""
    await require_admin(request)

    now = datetime.now(timezone.utc)
    last_30d = (now - timedelta(days=30)).isoformat()
    last_90d = (now - timedelta(days=90)).isoformat()

    # Fixed plan amounts (mirrors PLANS in payments.py — keep in sync)
    PLAN_AMOUNTS_EUR = {"pro": 19.0, "team": 49.0}

    # Active subscriptions = users currently on a paid plan (role==subscription)
    active_subs_cursor = db.users.find(
        {"role": "subscription", "plan": {"$in": list(PLAN_AMOUNTS_EUR.keys())}},
        {"_id": 0, "email": 1, "plan": 1, "stripe_subscription_id": 1, "plan_updated_at": 1},
    )
    active_subs = await active_subs_cursor.to_list(10000)
    by_plan: dict[str, int] = {}
    mrr_eur = 0.0
    for u in active_subs:
        plan = u.get("plan")
        by_plan[plan] = by_plan.get(plan, 0) + 1
        mrr_eur += PLAN_AMOUNTS_EUR.get(plan, 0)

    # Trial conversion: of trials started in last 90 days, how many ended up paid (status==active and trial fully used).
    # Heuristic from local data: count `payment_transactions` mode=subscription with trial_period_days>0
    # AND user.role still == "subscription" today (not downgraded).
    trial_started_query = {
        "mode": "subscription",
        "trial_period_days": {"$gt": 0},
        "created_at": {"$gte": last_90d},
        "plan_applied": True,
    }
    trial_started_count = await db.payment_transactions.count_documents(trial_started_query)
    # Of those, how many are still on subscription?
    trial_started = await db.payment_transactions.find(
        trial_started_query, {"_id": 0, "user_email": 1}
    ).to_list(2000)
    trial_emails = list({t["user_email"] for t in trial_started if t.get("user_email")})
    if trial_emails:
        still_paid = await db.users.count_documents(
            {"email": {"$in": trial_emails}, "role": "subscription"}
        )
    else:
        still_paid = 0
    trial_conversion_rate = (
        round(still_paid / trial_started_count * 100, 1) if trial_started_count else 0.0
    )

    # Churn (30d): users that were "subscription" in transactions ≥30d ago and are now "free".
    churn_query = {
        "plan_applied": True,
        "created_at": {"$lt": last_30d},
    }
    cohort = await db.payment_transactions.find(
        churn_query, {"_id": 0, "user_email": 1}
    ).to_list(5000)
    cohort_emails = list({c["user_email"] for c in cohort if c.get("user_email")})
    if cohort_emails:
        downgraded = await db.users.count_documents(
            {"email": {"$in": cohort_emails}, "role": "free"}
        )
        churn_rate_30d = round(downgraded / len(cohort_emails) * 100, 1)
    else:
        downgraded = 0
        churn_rate_30d = 0.0

    # Total revenue captured from transactions (mode=payment OR no_payment_required complete)
    revenue_pipeline = [
        {"$match": {"plan_applied": True, "amount": {"$gt": 0}}},
        {"$group": {"_id": "$plan_id", "sum": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]
    revenue_by_plan = {}
    async for row in db.payment_transactions.aggregate(revenue_pipeline):
        revenue_by_plan[row["_id"]] = {"total_eur": row["sum"], "tx_count": row["count"]}

    return {
        "active_subscriptions": len(active_subs),
        "active_by_plan": by_plan,
        "mrr_eur": round(mrr_eur, 2),
        "arr_eur": round(mrr_eur * 12, 2),
        "trial_started_90d": trial_started_count,
        "trial_converted_90d": still_paid,
        "trial_conversion_rate_pct": trial_conversion_rate,
        "churn_rate_30d_pct": churn_rate_30d,
        "churned_users_30d": downgraded,
        "revenue_by_plan": revenue_by_plan,
        "as_of": now.isoformat(),
    }


@router.get("/admin/billing/transactions")
async def billing_transactions(
    request: Request,
    status_: Optional[str] = None,
    plan: Optional[str] = None,
    user_email: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """List payment_transactions with simple filters and pagination.

    Query params:
      - status_:    `open` | `complete` | `expired`
      - plan:       `pro` | `team`
      - user_email: substring match
      - limit:      default 50 (max 200)
      - offset:     default 0
    """
    await require_admin(request)
    limit = max(1, min(200, int(limit)))
    offset = max(0, int(offset))

    q: dict = {}
    if status_:
        q["status"] = status_
    if plan:
        q["plan_id"] = plan
    if user_email:
        q["user_email"] = {"$regex": user_email, "$options": "i"}

    total = await db.payment_transactions.count_documents(q)
    cursor = (
        db.payment_transactions.find(q, {"_id": 0})
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    )
    rows = [_strip(r) for r in await cursor.to_list(limit)]
    return {"total": total, "limit": limit, "offset": offset, "rows": rows}


@router.get("/admin/billing/active-subscriptions")
async def active_subscriptions(request: Request):
    """List users currently on a paid plan (role=subscription)."""
    await require_admin(request)
    users = await db.users.find(
        {"role": "subscription"},
        {
            "_id": 0,
            "email": 1,
            "plan": 1,
            "plan_updated_at": 1,
            "stripe_customer_id": 1,
            "stripe_subscription_id": 1,
        },
    ).sort("plan_updated_at", -1).to_list(2000)
    return {"total": len(users), "users": users}

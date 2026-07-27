# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Landing-page event tracking — privacy-first analytics for marketing CRO.

Anonymous events captured from the public landing page (no auth required) so
the team can A/B test copy and measure conversion funnels: which CTA, quiz
completion rate, level distribution, case-study tab views, etc.

Privacy notes:
  - We DO NOT store full IP addresses; only the country-equivalent /24 prefix
    is kept for spam/dedup heuristics if Mongo TTL has not collected it yet.
  - The `anon_id` is generated client-side (random UUID in localStorage) and
    is NOT linked to any logged-in user account.
  - User-Agent is stored to differentiate desktop/mobile; truncated to 200 ch.
  - All raw events expire after 90 days via TTL index; aggregated stats live
    in `landing_event_stats` if/when daily roll-ups are added.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from database import db
from routers.auth import require_admin

router = APIRouter(prefix="/landing", tags=["landing"])
logger = logging.getLogger("landing_events")

# Allowed event types — explicit allowlist to prevent garbage flooding the DB.
ALLOWED_EVENTS = {
    "page_view",
    "cta_click",
    "roi_calculate",
    "case_tab_view",
    "case_pdf_download",
    "maturity_start",
    "maturity_complete",
    "maturity_email_submit",
    "storyboard_play",
    "storyboard_step_click",
    "risk_cta_click",
    "value_promise_cta_click",
}
MAX_PROPS_BYTES = 4 * 1024  # 4 KB per event payload


class LandingEvent(BaseModel):
    event_type: str = Field(..., max_length=64)
    anon_id: str = Field(..., max_length=64)
    properties: Dict[str, Any] = Field(default_factory=dict)
    referrer: Optional[str] = Field(None, max_length=500)
    path: Optional[str] = Field(None, max_length=200)
    lang: Optional[str] = Field(None, max_length=8)


def _anonymize_ip(ip: str | None) -> str | None:
    if not ip:
        return None
    # Strip last octet (IPv4) or last 80 bits (IPv6) — best-effort
    if ":" in ip:
        # IPv6 — keep only first 3 hextets
        parts = ip.split(":")[:3]
        return ":".join(parts) + "::/48"
    parts = ip.split(".")
    if len(parts) == 4:
        return ".".join(parts[:3]) + ".0/24"
    return None


@router.post("/events")
async def record_event(payload: LandingEvent, request: Request):
    """Record an anonymous landing-page event. No auth required."""
    if payload.event_type not in ALLOWED_EVENTS:
        raise HTTPException(status_code=400, detail=f"Unknown event_type: {payload.event_type}")

    # Cheap size guard: serialize properties and bail on huge payloads.
    import json
    if len(json.dumps(payload.properties)) > MAX_PROPS_BYTES:
        raise HTTPException(status_code=400, detail="Properties too large")

    fwd_for = request.headers.get("x-forwarded-for", "")
    raw_ip = (fwd_for.split(",")[0].strip() if fwd_for else None) or (request.client.host if request.client else None)
    ua = request.headers.get("user-agent", "")[:200]

    doc = {
        "id": str(uuid.uuid4()),
        "event_type": payload.event_type,
        "anon_id": payload.anon_id[:64],
        "properties": payload.properties,
        "referrer": payload.referrer,
        "path": payload.path,
        "lang": payload.lang,
        "ip_prefix": _anonymize_ip(raw_ip),
        "ua": ua,
        "ts": datetime.now(timezone.utc),
    }
    try:
        await db.landing_events.insert_one(doc)
    except Exception as e:
        logger.warning("landing event insert failed: %s", e)
        # Don't break the user's flow — return success regardless.
        return {"status": "skipped"}
    return {"status": "ok", "id": doc["id"]}


@router.get("/events/stats")
async def event_stats(request: Request, days: int = 30):
    """Return aggregated stats for the last N days. Admin only."""
    await require_admin(request)
    days = max(1, min(days, 365))
    from datetime import timedelta
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Total events + unique visitors
    total = await db.landing_events.count_documents({"ts": {"$gte": since}})
    unique_visitors = len(await db.landing_events.distinct("anon_id", {"ts": {"$gte": since}}))

    # Per-event-type counts
    pipeline = [
        {"$match": {"ts": {"$gte": since}}},
        {"$group": {"_id": "$event_type", "count": {"$sum": 1}, "unique": {"$addToSet": "$anon_id"}}},
        {"$project": {"event_type": "$_id", "_id": 0, "count": 1, "unique_count": {"$size": "$unique"}}},
        {"$sort": {"count": -1}},
    ]
    by_type = await db.landing_events.aggregate(pipeline).to_list(None)

    # Maturity level distribution (from maturity_complete events)
    levels_pipeline = [
        {"$match": {"ts": {"$gte": since}, "event_type": "maturity_complete"}},
        {"$group": {"_id": "$properties.level", "count": {"$sum": 1}}},
        {"$project": {"level": "$_id", "_id": 0, "count": 1}},
    ]
    levels = await db.landing_events.aggregate(levels_pipeline).to_list(None)

    # Case study tab popularity
    tabs_pipeline = [
        {"$match": {"ts": {"$gte": since}, "event_type": "case_tab_view"}},
        {"$group": {"_id": "$properties.tab", "count": {"$sum": 1}}},
        {"$project": {"tab": "$_id", "_id": 0, "count": 1}},
        {"$sort": {"count": -1}},
    ]
    tabs = await db.landing_events.aggregate(tabs_pipeline).to_list(None)

    # CTA breakdown (which CTA gets most clicks)
    cta_pipeline = [
        {"$match": {"ts": {"$gte": since}, "event_type": "cta_click"}},
        {"$group": {"_id": "$properties.cta_id", "count": {"$sum": 1}}},
        {"$project": {"cta_id": "$_id", "_id": 0, "count": 1}},
        {"$sort": {"count": -1}},
        {"$limit": 20},
    ]
    ctas = await db.landing_events.aggregate(cta_pipeline).to_list(None)

    # Lang split
    lang_pipeline = [
        {"$match": {"ts": {"$gte": since}}},
        {"$group": {"_id": "$lang", "count": {"$sum": 1}}},
        {"$project": {"lang": "$_id", "_id": 0, "count": 1}},
        {"$sort": {"count": -1}},
    ]
    langs = await db.landing_events.aggregate(lang_pipeline).to_list(None)

    return {
        "since": since.isoformat(),
        "days": days,
        "total_events": total,
        "unique_visitors": unique_visitors,
        "by_event_type": by_type,
        "maturity_levels": levels,
        "case_tabs": tabs,
        "top_ctas": ctas,
        "languages": langs,
    }


@router.get("/events/funnel")
async def funnel(request: Request, days: int = 30):
    """Conversion funnel for the maturity quiz lead magnet. Admin only."""
    await require_admin(request)
    days = max(1, min(days, 365))
    from datetime import timedelta
    since = datetime.now(timezone.utc) - timedelta(days=days)

    async def count(event_type: str) -> int:
        return len(await db.landing_events.distinct("anon_id", {"ts": {"$gte": since}, "event_type": event_type}))

    page_views = len(await db.landing_events.distinct("anon_id", {"ts": {"$gte": since}}))
    started = await count("maturity_start")
    completed = await count("maturity_complete")
    emailed = await count("maturity_email_submit")

    def pct(n: int, d: int) -> float:
        return round((n / d) * 100, 1) if d else 0.0

    return {
        "days": days,
        "steps": [
            {"label": "Visitas", "count": page_views, "pct": 100.0},
            {"label": "Inician quiz", "count": started, "pct": pct(started, page_views)},
            {"label": "Completan quiz", "count": completed, "pct": pct(completed, page_views)},
            {"label": "Envían email", "count": emailed, "pct": pct(emailed, page_views)},
        ],
    }

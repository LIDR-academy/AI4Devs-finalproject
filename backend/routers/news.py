# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request, Query
from datetime import datetime, timezone
import asyncio
import logging
import os
import uuid

from database import db
from email_service import send_email, is_configured as email_is_configured
from routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/news", tags=["news"])

NEWS_API_KEY = os.environ.get("NEWS_API_KEY", "").strip()


async def _require_auth(request: Request):
    """Allow either NEWS_API_KEY or admin session. Returns user if session auth."""
    if NEWS_API_KEY:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
        else:
            token = request.headers.get("X-API-Key", "")
        if token == NEWS_API_KEY:
            return None  # API key auth

    user = await get_current_user(request)
    if user and user.role == "admin":
        return user
    if not NEWS_API_KEY:
        raise HTTPException(status_code=501, detail="NEWS_API_KEY not configured and no admin session")
    raise HTTPException(status_code=401, detail="Invalid API key or admin session required")


async def _broadcast_news(news_id: str, subject: str, html: str):
    """Send the news to all users with noticias=True. Runs as background task."""
    if not email_is_configured():
        logger.warning("Email not configured; skipping news broadcast id=%s", news_id)
        await db.news_posts.update_one(
            {"id": news_id},
            {"$set": {"status": "skipped", "sent_count": 0, "recipients": []}},
        )
        return

    cursor = db.users.find(
        {"noticias": True, "email": {"$exists": True, "$ne": None}},
        {"email": 1, "name": 1, "_id": 0},
    )
    user_list = await cursor.to_list(length=10000)
    recipients = []

    for user in user_list:
        email_to = (user.get("email") or "").strip()
        if not email_to:
            continue
        email_id = await send_email(to=email_to, subject=subject, html=html)
        recipients.append({
            "email": email_to,
            "name": user.get("name", ""),
            "sent": bool(email_id),
        })

    sent = sum(1 for r in recipients if r["sent"])

    await db.news_posts.update_one(
        {"id": news_id},
        {"$set": {"status": "sent", "sent_count": sent, "total_recipients": len(recipients), "recipients": recipients}},
    )
    logger.info("News broadcast done id=%s sent=%s/%s", news_id, sent, len(recipients))


@router.post("")
async def create_news(request: Request):
    """Receive AI news in HTML format, store it, and broadcast to subscribed users.

    Protected by NEWS_API_KEY OR admin session cookie.

    Body:
      - html (required): HTML content of the news
      - subject (optional): subject line; defaults to "Noticias de IA"
    """
    await _require_auth(request)

    body = await request.json()
    html = (body.get("html") or "").strip()
    if not html:
        raise HTTPException(status_code=400, detail="html field is required")

    subject = (body.get("subject") or "").strip() or "Noticias de IA"

    news_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "id": news_id,
        "subject": subject,
        "html": html,
        "status": "sending",
        "sent_count": 0,
        "total_recipients": 0,
        "created_at": now,
    }
    await db.news_posts.insert_one(doc)

    asyncio.create_task(_broadcast_news(news_id, subject, html))

    return {"status": "ok", "id": news_id, "message": "News saved and broadcast started"}


@router.get("")
async def list_news(request: Request, skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=200)):
    """List all news posts (newest first). Admin session required."""
    await _require_auth(request)

    docs = await db.news_posts.find({}, {"_id": 0}) \
        .sort("created_at", -1) \
        .skip(skip) \
        .limit(limit) \
        .to_list(length=limit)

    total = await db.news_posts.count_documents({})
    return {"posts": docs, "total": total, "skip": skip, "limit": limit}


@router.delete("/{news_id}")
async def delete_news(news_id: str, request: Request):
    """Delete a news post by id. Admin session required."""
    await _require_auth(request)

    result = await db.news_posts.delete_one({"id": news_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News post not found")
    return {"status": "ok", "message": "News post deleted"}

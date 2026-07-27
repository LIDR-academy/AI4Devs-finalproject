# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request
from database import db
from routers.auth import require_admin

router = APIRouter(prefix="/i18n", tags=["i18n"])


@router.get("/translations")
async def get_translations():
    """Get all custom translation overrides from the database."""
    docs = await db.translations.find({}, {"_id": 0}).to_list(100)
    result = {}
    for doc in docs:
        lang = doc.get("lang")
        if lang:
            result[lang] = doc.get("translations", {})
    return result


@router.put("/translations/{lang}")
async def update_translations(lang: str, request: Request):
    """Update translations for a specific language (admin only)."""
    await require_admin(request)
    body = await request.json()
    translations = body.get("translations", {})
    await db.translations.update_one(
        {"lang": lang},
        {"$set": {"lang": lang, "translations": translations}},
        upsert=True,
    )
    return {"status": "ok", "lang": lang}


@router.post("/translations/bulk")
async def bulk_update_translations(request: Request):
    """Bulk update translations for all languages (admin only)."""
    await require_admin(request)
    body = await request.json()
    for lang, translations in body.items():
        await db.translations.update_one(
            {"lang": lang},
            {"$set": {"lang": lang, "translations": translations}},
            upsert=True,
        )
    return {"status": "ok", "languages_updated": list(body.keys())}


@router.delete("/translations/{lang}/{key}")
async def delete_translation_key(lang: str, key: str, request: Request):
    """Delete a specific translation key for a language (admin only)."""
    await require_admin(request)
    await db.translations.update_one(
        {"lang": lang},
        {"$unset": {f"translations.{key}": ""}},
    )
    return {"status": "ok"}


@router.get("/user-language")
async def get_user_language(request: Request):
    """Get the preferred language for the authenticated user."""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    user_id = session.get("user_id", "")
    pref = await db.user_preferences.find_one({"user_id": user_id}, {"_id": 0})
    return {"language": pref.get("language", "es") if pref else "es"}


@router.put("/user-language")
async def set_user_language(request: Request):
    """Set the preferred language for the authenticated user."""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    body = await request.json()
    lang = body.get("language", "es")
    if lang not in ["es", "en", "fr", "it", "zh", "ja"]:
        raise HTTPException(status_code=400, detail="Unsupported language")
    user_id = session.get("user_id", "")
    await db.user_preferences.update_one(
        {"user_id": user_id},
        {"$set": {"user_id": user_id, "language": lang}},
        upsert=True,
    )
    return {"status": "ok", "language": lang}

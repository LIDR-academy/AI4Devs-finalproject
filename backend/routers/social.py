# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request
from typing import Optional
from datetime import datetime, timezone

from database import db
from models import Comment, CommentCreate, Notification, Favorite
from routers.auth import get_current_user

router = APIRouter(tags=["social"])


# ==================== COMMENT ROUTES ====================

@router.get("/diagrams/{diagram_id}/comments")
async def get_comments(diagram_id: str, element_id: Optional[str] = None):
    query = {"diagram_id": diagram_id}
    if element_id:
        query["element_id"] = element_id
    comments = await db.comments.find(query, {"_id": 0}).sort("created_at", 1).to_list(500)
    return comments


@router.post("/diagrams/{diagram_id}/comments")
async def create_comment(diagram_id: str, data: CommentCreate, request: Request):
    user = await get_current_user(request)
    
    comment = Comment(
        diagram_id=diagram_id,
        element_id=data.element_id,
        element_name=data.element_name,
        content=data.content,
        mentions=data.mentions,
        parent_comment_id=data.parent_comment_id,
        created_by=user.email if user else "anonymous",
        created_by_name=user.name if user else "Anonymous"
    )
    
    doc = comment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    insert_doc = doc.copy()
    await db.comments.insert_one(insert_doc)
    
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    for mention in data.mentions:
        notification = Notification(
            recipient_email=mention,
            type="mention",
            message=f"You were mentioned in a comment on '{diagram.get('name', 'Unknown')}'",
            from_user=user.email if user else "anonymous",
            diagram_id=diagram_id,
            diagram_name=diagram.get("name"),
            comment_id=comment.id
        )
        notif_doc = notification.model_dump()
        notif_doc['created_at'] = notif_doc['created_at'].isoformat()
        notif_insert = notif_doc.copy()
        await db.notifications.insert_one(notif_insert)
    
    return doc


@router.put("/comments/{comment_id}/resolve")
async def resolve_comment(comment_id: str):
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"is_resolved": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment resolved"}


# ==================== NOTIFICATION ROUTES ====================

@router.get("/notifications")
async def get_notifications(request: Request):
    user = await get_current_user(request)
    if not user:
        return []
    notifications = await db.notifications.find(
        {"recipient_email": user.email},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return notifications


@router.get("/notifications/unread-count")
async def get_unread_count(request: Request):
    user = await get_current_user(request)
    if not user:
        return {"count": 0}
    count = await db.notifications.count_documents({"recipient_email": user.email, "is_read": False})
    return {"count": count}


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    await db.notifications.update_one({"id": notification_id}, {"$set": {"is_read": True}})
    return {"message": "Notification marked as read"}


@router.put("/notifications/read-all")
async def mark_all_notifications_read(request: Request):
    user = await get_current_user(request)
    if user:
        await db.notifications.update_many({"recipient_email": user.email}, {"$set": {"is_read": True}})
    return {"message": "All notifications marked as read"}


# ==================== FAVORITES ROUTES ====================

@router.get("/favorites")
async def get_favorites(request: Request):
    user = await get_current_user(request)
    if not user:
        return []
    favorites = await db.favorites.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return favorites


@router.post("/favorites/{diagram_id}")
async def add_favorite(diagram_id: str, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    existing = await db.favorites.find_one({"user_id": user.user_id, "diagram_id": diagram_id})
    if existing:
        return {"message": "Already favorited"}
    
    favorite = Favorite(
        user_id=user.user_id,
        diagram_id=diagram_id,
        diagram_name=diagram["name"]
    )
    doc = favorite.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    insert_doc = doc.copy()
    await db.favorites.insert_one(insert_doc)
    
    return {"message": "Added to favorites"}


@router.delete("/favorites/{diagram_id}")
async def remove_favorite(diagram_id: str, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    await db.favorites.delete_one({"user_id": user.user_id, "diagram_id": diagram_id})
    return {"message": "Removed from favorites"}

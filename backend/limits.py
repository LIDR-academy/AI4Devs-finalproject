# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Free-user plan limits configuration and checking utilities."""
from datetime import datetime, timezone
from database import db

FREE_LIMITS = {
    "max_projects": 1,
    "max_diagrams_per_project": 3,
    "max_diagrams": 2,
    "max_ai_per_month": 6,
    "max_oop_classes": 10,
    "max_components": 10,
    "can_export": False,
}


async def get_user_role(user_id: str) -> str:
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "role": 1})
    return user.get("role", "subscription") if user else "subscription"


async def check_project_limit(user_id: str, email: str | None = None) -> dict:
    """Free users may have at most FREE_LIMITS['max_projects'] projects."""
    role = await get_user_role(user_id)
    if role != "free":
        return {"allowed": True}
    creators = [user_id]
    if email:
        creators.append(email)
    count = await db.projects.count_documents({"created_by": {"$in": creators}})
    limit = FREE_LIMITS["max_projects"]
    if count >= limit:
        return {"allowed": False, "limit": limit, "current": count, "type": "projects"}
    return {"allowed": True}


async def check_diagrams_per_project_limit(user_id: str, project_id: str | None) -> dict:
    """Free users may have at most FREE_LIMITS['max_diagrams_per_project'] diagrams per project."""
    role = await get_user_role(user_id)
    if role != "free" or not project_id:
        return {"allowed": True}
    project = await db.projects.find_one({"id": project_id}, {"_id": 0, "diagram_ids": 1})
    current = len(project.get("diagram_ids", [])) if project else 0
    limit = FREE_LIMITS["max_diagrams_per_project"]
    if current >= limit:
        return {"allowed": False, "limit": limit, "current": current, "type": "diagrams_per_project"}
    return {"allowed": True}


async def check_diagram_limit(user_id: str) -> dict:
    role = await get_user_role(user_id)
    if role != "free":
        return {"allowed": True}
    count = await db.diagrams.count_documents({"created_by": user_id})
    limit = FREE_LIMITS["max_diagrams"]
    if count >= limit:
        return {"allowed": False, "limit": limit, "current": count, "type": "diagrams"}
    return {"allowed": True}


async def check_ai_limit(user_id: str) -> dict:
    role = await get_user_role(user_id)
    if role != "free":
        return {"allowed": True}
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    count = await db.ai_usage.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": start_of_month.isoformat()}
    })
    limit = FREE_LIMITS["max_ai_per_month"]
    if count >= limit:
        return {"allowed": False, "limit": limit, "current": count, "type": "ai"}
    return {"allowed": True}


async def record_ai_usage(user_id: str):
    await db.ai_usage.insert_one({
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })


async def check_oop_limit(user_id: str, email: str = None) -> dict:
    role = await get_user_role(user_id)
    if role != "free":
        return {"allowed": True}
    # OOP classes store created_by as email, so we need to check by email
    query_field = email if email else user_id
    count = await db.oop_classes.count_documents({"created_by": query_field})
    limit = FREE_LIMITS["max_oop_classes"]
    if count >= limit:
        return {"allowed": False, "limit": limit, "current": count, "type": "oop"}
    return {"allowed": True}


async def check_component_limit(user_id: str, email: str = None) -> dict:
    role = await get_user_role(user_id)
    if role != "free":
        return {"allowed": True}
    # Components store created_by as email, so we need to check by email
    query_field = email if email else user_id
    count = await db.bpmn_components.count_documents({"created_by": query_field})
    limit = FREE_LIMITS["max_components"]
    if count >= limit:
        return {"allowed": False, "limit": limit, "current": count, "type": "components"}
    return {"allowed": True}


async def check_export_allowed(user_id: str) -> dict:
    role = await get_user_role(user_id)
    if role == "free":
        return {"allowed": False, "type": "export"}
    return {"allowed": True}

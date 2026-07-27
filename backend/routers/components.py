# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request
from typing import Optional
from datetime import datetime, timezone

from database import db
from models import BpmnComponent, BpmnComponentCreate
from routers.auth import get_current_user

router = APIRouter(tags=["components"])


@router.get("/components")
async def get_components(search: Optional[str] = None, category: Optional[str] = None):
    query = {"is_public": True}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if category:
        query["category"] = category
    
    components = await db.components.find(query, {"_id": 0}).sort("usage_count", -1).to_list(100)
    return components


@router.post("/components")
async def create_component(data: BpmnComponentCreate, request: Request):
    user = await get_current_user(request)
    if user:
        from limits import check_component_limit
        limit_check = await check_component_limit(user.user_id, user.email)
        if not limit_check["allowed"]:
            raise HTTPException(status_code=403, detail=f"Free plan limit: max {limit_check['limit']} components")
    
    component = BpmnComponent(**data.model_dump())
    if user:
        component.created_by = user.email
    
    doc = component.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    insert_doc = doc.copy()
    await db.components.insert_one(insert_doc)
    
    return doc


@router.put("/components/{component_id}")
async def update_component(component_id: str, data: BpmnComponentCreate):
    result = await db.components.update_one(
        {"id": component_id},
        {"$set": data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Component not found")
    return await db.components.find_one({"id": component_id}, {"_id": 0})


@router.delete("/components/{component_id}")
async def delete_component(component_id: str):
    result = await db.components.delete_one({"id": component_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Component not found")
    return {"message": "Component deleted"}


@router.post("/components/{component_id}/use")
async def increment_component_usage(component_id: str):
    await db.components.update_one({"id": component_id}, {"$inc": {"usage_count": 1}})
    return {"message": "Usage count incremented"}

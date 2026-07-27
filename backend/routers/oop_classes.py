# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request
from typing import Optional
from datetime import datetime, timezone

from database import db
from models import OOPClass, OOPClassCreate, OOPClassUpdate, OOPClassVersion
from routers.auth import get_current_user

router = APIRouter(tags=["oop-classes"])


@router.get("/oop-classes")
async def get_oop_classes(search: Optional[str] = None, category: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if category:
        query["category"] = category
    
    classes = await db.oop_classes.find(query, {"_id": 0}).sort("updated_at", -1).to_list(100)
    return classes


@router.get("/oop-classes/{class_id}")
async def get_oop_class(class_id: str):
    oop_class = await db.oop_classes.find_one({"id": class_id}, {"_id": 0})
    if not oop_class:
        raise HTTPException(status_code=404, detail="Class not found")
    return oop_class


@router.post("/oop-classes")
async def create_oop_class(data: OOPClassCreate, request: Request):
    user = await get_current_user(request)
    if user:
        from limits import check_oop_limit
        limit_check = await check_oop_limit(user.user_id, user.email)
        if not limit_check["allowed"]:
            raise HTTPException(status_code=403, detail=f"Free plan limit: max {limit_check['limit']} OOP classes")
    oop_class = OOPClass(**data.model_dump())
    if user:
        oop_class.created_by = user.email
    
    doc = oop_class.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    insert_doc = doc.copy()
    await db.oop_classes.insert_one(insert_doc)
    
    version = OOPClassVersion(
        class_id=oop_class.id,
        class_name=oop_class.name,
        version_number=1,
        description=oop_class.description,
        properties=oop_class.properties,
        category=oop_class.category,
        tags=oop_class.tags,
        commit_message="Initial version",
        created_by=user.email if user else None
    )
    version_doc = version.model_dump()
    version_doc['created_at'] = version_doc['created_at'].isoformat()
    version_insert = version_doc.copy()
    await db.oop_class_versions.insert_one(version_insert)
    
    return doc


@router.put("/oop-classes/{class_id}")
async def update_oop_class(class_id: str, data: OOPClassUpdate, request: Request):
    oop_class = await db.oop_classes.find_one({"id": class_id}, {"_id": 0})
    if not oop_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.oop_classes.update_one({"id": class_id}, {"$set": update_data})
    return await db.oop_classes.find_one({"id": class_id}, {"_id": 0})


@router.delete("/oop-classes/{class_id}")
async def delete_oop_class(class_id: str):
    result = await db.oop_classes.delete_one({"id": class_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    await db.oop_class_versions.delete_many({"class_id": class_id})
    return {"message": "Class deleted"}


@router.get("/oop-classes/{class_id}/versions")
async def get_oop_class_versions(class_id: str):
    versions = await db.oop_class_versions.find({"class_id": class_id}, {"_id": 0}).sort("version_number", -1).to_list(100)
    return versions

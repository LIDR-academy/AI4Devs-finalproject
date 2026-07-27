# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

from database import db
from models import (
    BpmnDiagram, BpmnDiagramCreate, BpmnDiagramUpdate,
    BpmnVersion, BpmnVersionCreate, Branch, BranchCreate,
)
from routers.auth import (
    get_current_user, require_auth, can_read_resource, can_write_resource,
    rls_filter, rls_filter_with_shares, can_read_resource_async, can_write_resource_async,
)

router = APIRouter(tags=["diagrams"])

DEFAULT_BPMN_XML = """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""


# ==================== DIAGRAM CRUD ====================

@router.get("/diagrams", response_model=List[dict])
async def get_diagrams(request: Request, search: Optional[str] = None, tag: Optional[str] = None):
    user = await get_current_user(request)
    query = await rls_filter_with_shares(user, "diagram")
    extra = {}
    if search:
        extra["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"current_xml": {"$regex": search, "$options": "i"}}
        ]
    if tag:
        extra["tags"] = tag
    if extra:
        query = {"$and": [query, extra]} if query else extra

    diagrams = await db.diagrams.find(query, {"_id": 0}).sort("updated_at", -1).to_list(100)
    for d in diagrams:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
        if isinstance(d.get('updated_at'), str):
            d['updated_at'] = datetime.fromisoformat(d['updated_at'])
    return diagrams


@router.get("/diagrams/{diagram_id}")
async def get_diagram(diagram_id: str, request: Request):
    user = await get_current_user(request)
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    if not await can_read_resource_async(user, diagram, "diagram"):
        raise HTTPException(status_code=403, detail="Forbidden")
    xml = diagram.get("current_xml", "")
    if not xml or len(xml) < 50 or "definitions" not in xml:
        diagram["current_xml"] = DEFAULT_BPMN_XML
    return diagram


@router.post("/diagrams", response_model=dict)
async def create_diagram(data: BpmnDiagramCreate, request: Request):
    user = await get_current_user(request)
    if user:
        from limits import check_diagram_limit, check_diagrams_per_project_limit, FREE_LIMITS
        # Per-project limit (new strategy: 3 diagrams per project for Free plan)
        project_id = getattr(data, "project_id", None) or data.model_dump().get("project_id")
        per_project = await check_diagrams_per_project_limit(user.user_id, project_id)
        if not per_project["allowed"]:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "FREE_PLAN_LIMIT",
                    "type": "diagrams_per_project",
                    "limit": per_project["limit"],
                    "current": per_project["current"],
                    "message": f"Has alcanzado el limite del plan Free ({FREE_LIMITS['max_diagrams_per_project']} diagramas por proyecto). Sube a Pro para diagramas ilimitados.",
                    "upgrade_url": "/pricing#pro",
                },
            )
        # Legacy global cap (keeps backward-compat tests passing)
        limit_check = await check_diagram_limit(user.user_id)
        if not limit_check["allowed"]:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "FREE_PLAN_LIMIT",
                    "type": "diagrams",
                    "limit": limit_check["limit"],
                    "current": limit_check["current"],
                    "message": f"Has alcanzado el limite del plan Free ({limit_check['limit']} diagramas globales). Sube a Pro para diagramas ilimitados.",
                    "upgrade_url": "/pricing#pro",
                },
            )
    diagram = BpmnDiagram(**data.model_dump())
    if user:
        diagram.created_by = user.email
    
    doc = diagram.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    insert_doc = doc.copy()
    await db.diagrams.insert_one(insert_doc)
    
    version = BpmnVersion(
        diagram_id=diagram.id,
        version_number=1,
        xml_content=diagram.current_xml,
        commit_message="Initial version",
        created_by=user.email if user else None
    )
    version_doc = version.model_dump()
    version_doc['created_at'] = version_doc['created_at'].isoformat()
    version_insert = version_doc.copy()
    await db.versions.insert_one(version_insert)
    
    return doc


@router.put("/diagrams/{diagram_id}")
async def update_diagram(diagram_id: str, data: BpmnDiagramUpdate, request: Request):
    user = await require_auth(request)
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    if not await can_write_resource_async(user, diagram, "diagram"):
        raise HTTPException(status_code=403, detail="Forbidden")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.diagrams.update_one({"id": diagram_id}, {"$set": update_data})
    return await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})


@router.delete("/diagrams/{diagram_id}")
async def delete_diagram(diagram_id: str, request: Request):
    user = await require_auth(request)
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    # Delete is owner/admin only
    if not can_write_resource(user, diagram):
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.diagrams.delete_one({"id": diagram_id})
    await db.versions.delete_many({"diagram_id": diagram_id})
    await db.branches.delete_many({"diagram_id": diagram_id})
    await db.comments.delete_many({"diagram_id": diagram_id})
    await db.favorites.delete_many({"diagram_id": diagram_id})
    await db.resource_shares.delete_many({"resource_type": "diagram", "resource_id": diagram_id})
    return {"message": "Diagram deleted"}


# ==================== VERSION ROUTES ====================

@router.get("/diagrams/{diagram_id}/versions")
async def get_versions(diagram_id: str):
    versions = await db.versions.find({"diagram_id": diagram_id}, {"_id": 0}).sort("version_number", -1).to_list(100)
    return versions


def _extract_bpmn_elements(xml_content: str) -> dict:
    import re
    elements = {}
    pattern = r'<bpmn:(\w+)\s+id="([^"]+)"(?:\s+name="([^"]*)")?[^>]*(?:/>|>)'
    for match in re.finditer(pattern, xml_content):
        el_type, el_id, el_name = match.group(1), match.group(2), match.group(3) or ""
        elements[el_id] = {"type": el_type, "name": el_name, "id": el_id}
    flow_pattern = r'<bpmn:sequenceFlow\s+id="([^"]+)"\s+sourceRef="([^"]+)"\s+targetRef="([^"]+)"'
    for match in re.finditer(flow_pattern, xml_content):
        fl_id, src, tgt = match.group(1), match.group(2), match.group(3)
        elements[fl_id] = {"type": "sequenceFlow", "name": f"{src} -> {tgt}", "id": fl_id, "sourceRef": src, "targetRef": tgt}
    return elements


@router.get("/diagrams/{diagram_id}/versions/tree")
async def get_version_tree(diagram_id: str):
    versions = await db.versions.find(
        {"diagram_id": diagram_id}, {"_id": 0}
    ).sort("version_number", 1).to_list(200)
    
    branches = await db.branches.find(
        {"diagram_id": diagram_id}, {"_id": 0}
    ).to_list(50)
    
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0, "current_xml": 0})
    current_version = diagram.get("current_version", 1) if diagram else 1
    
    nodes = []
    for v in versions:
        nodes.append({
            "id": v["id"],
            "version_number": v["version_number"],
            "commit_message": v.get("commit_message", ""),
            "created_by": v.get("created_by"),
            "created_at": v.get("created_at"),
            "parent_version": v.get("parent_version"),
            "tags": v.get("tags", []),
            "validation_status": v.get("validation_status", "valid"),
            "is_current": v["version_number"] == current_version,
            "branch": "main",
        })
    
    branch_nodes = []
    for b in branches:
        branch_nodes.append({
            "id": b["id"],
            "name": b["name"],
            "base_version": b.get("base_version"),
            "current_version": b.get("current_version", 1),
            "status": b.get("status", "active"),
            "is_merged": b.get("is_merged", False),
            "created_at": b.get("created_at"),
        })
    
    return {
        "nodes": nodes,
        "branches": branch_nodes,
        "current_version": current_version,
    }


@router.get("/diagrams/{diagram_id}/versions/{v1}/diff/{v2}")
async def diff_versions(diagram_id: str, v1: int, v2: int):
    version1 = await db.versions.find_one(
        {"diagram_id": diagram_id, "version_number": v1}, {"_id": 0}
    )
    version2 = await db.versions.find_one(
        {"diagram_id": diagram_id, "version_number": v2}, {"_id": 0}
    )
    if not version1 or not version2:
        raise HTTPException(status_code=404, detail="One or both versions not found")
    
    xml1 = version1.get("xml_content", "")
    xml2 = version2.get("xml_content", "")
    elements1 = _extract_bpmn_elements(xml1)
    elements2 = _extract_bpmn_elements(xml2)
    ids1 = set(elements1.keys())
    ids2 = set(elements2.keys())
    
    added = [elements2[eid] for eid in (ids2 - ids1)]
    removed = [elements1[eid] for eid in (ids1 - ids2)]
    modified = []
    for eid in (ids1 & ids2):
        if elements1[eid].get("name") != elements2[eid].get("name") or \
           elements1[eid].get("type") != elements2[eid].get("type"):
            modified.append({"id": eid, "before": elements1[eid], "after": elements2[eid]})
    
    return {
        "version_from": {
            "number": v1,
            "commit_message": version1.get("commit_message", ""),
            "created_at": version1.get("created_at"),
            "created_by": version1.get("created_by"),
        },
        "version_to": {
            "number": v2,
            "commit_message": version2.get("commit_message", ""),
            "created_at": version2.get("created_at"),
            "created_by": version2.get("created_by"),
        },
        "added": added,
        "removed": removed,
        "modified": modified,
        "summary": {
            "total_changes": len(added) + len(removed) + len(modified),
            "added_count": len(added),
            "removed_count": len(removed),
            "modified_count": len(modified),
        }
    }


@router.post("/diagrams/{diagram_id}/versions")
async def create_version(diagram_id: str, data: BpmnVersionCreate, request: Request):
    user = await get_current_user(request)
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    last_version = await db.versions.find_one(
        {"diagram_id": diagram_id},
        {"_id": 0},
        sort=[("version_number", -1)]
    )
    new_version_number = (last_version["version_number"] + 1) if last_version else 1
    
    version = BpmnVersion(
        diagram_id=diagram_id,
        version_number=new_version_number,
        xml_content=diagram["current_xml"],
        commit_message=data.commit_message,
        tags=data.tags,
        annotations=data.annotations,
        parent_version=last_version["version_number"] if last_version else None,
        changed_elements=data.changed_elements,
        created_by=user.email if user else None
    )
    
    version_doc = version.model_dump()
    version_doc['created_at'] = version_doc['created_at'].isoformat()
    insert_doc = version_doc.copy()
    await db.versions.insert_one(insert_doc)
    
    await db.diagrams.update_one(
        {"id": diagram_id},
        {"$set": {"current_version": new_version_number, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return version_doc


@router.get("/diagrams/{diagram_id}/versions/{version_number}")
async def get_version(diagram_id: str, version_number: int):
    version = await db.versions.find_one(
        {"diagram_id": diagram_id, "version_number": version_number},
        {"_id": 0}
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version


@router.post("/diagrams/{diagram_id}/revert/{version_number}")
async def revert_to_version(diagram_id: str, version_number: int, request: Request):
    version = await db.versions.find_one(
        {"diagram_id": diagram_id, "version_number": version_number},
        {"_id": 0}
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    await db.diagrams.update_one(
        {"id": diagram_id},
        {"$set": {
            "current_xml": version["xml_content"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": f"Reverted to version {version_number}"}


# ==================== BRANCH ROUTES ====================

@router.get("/diagrams/{diagram_id}/branches")
async def get_branches(diagram_id: str):
    branches = await db.branches.find({"diagram_id": diagram_id}, {"_id": 0}).to_list(100)
    return branches


@router.post("/diagrams/{diagram_id}/branches")
async def create_branch(diagram_id: str, data: BranchCreate, request: Request):
    user = await get_current_user(request)
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    branch = Branch(
        diagram_id=diagram_id,
        name=data.name,
        description=data.description,
        base_version=diagram["current_version"],
        current_xml=diagram["current_xml"],
        created_by=user.email if user else None
    )
    
    doc = branch.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    insert_doc = doc.copy()
    await db.branches.insert_one(insert_doc)
    
    return doc


@router.put("/branches/{branch_id}")
async def update_branch(branch_id: str, current_xml: str):
    result = await db.branches.update_one(
        {"id": branch_id},
        {"$set": {"current_xml": current_xml}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Branch not found")
    return await db.branches.find_one({"id": branch_id}, {"_id": 0})


@router.post("/branches/{branch_id}/merge")
async def merge_branch(branch_id: str, request: Request):
    branch = await db.branches.find_one({"id": branch_id}, {"_id": 0})
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    if branch.get("is_merged"):
        raise HTTPException(status_code=400, detail="Branch already merged")
    
    diagram = await db.diagrams.find_one({"id": branch["diagram_id"]}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    new_version = diagram["current_version"] + 1
    
    body = {}
    try:
        body = await request.json()
    except:
        pass
    
    resolved_xml = body.get("resolved_xml")
    merge_xml = resolved_xml if resolved_xml else branch["current_xml"]
    
    user = await get_current_user(request)
    await db.versions.insert_one({
        "id": str(uuid.uuid4()),
        "diagram_id": branch["diagram_id"],
        "version_number": new_version,
        "xml_content": merge_xml,
        "commit_message": f"Merge branch '{branch['name']}' into main",
        "parent_version": diagram["current_version"],
        "branch_source": branch["name"],
        "tags": [],
        "created_by": user.email if user else "system",
        "created_at": datetime.now(timezone.utc),
    })
    
    await db.diagrams.update_one(
        {"id": branch["diagram_id"]},
        {"$set": {
            "current_xml": merge_xml,
            "current_version": new_version,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    await db.branches.update_one(
        {"id": branch_id},
        {"$set": {"is_merged": True, "merged_version": new_version, "status": "merged"}}
    )
    
    return {"message": "Branch merged", "new_version": new_version}


@router.post("/branches/{branch_id}/preview-merge")
async def preview_merge(branch_id: str):
    branch = await db.branches.find_one({"id": branch_id}, {"_id": 0})
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    diagram = await db.diagrams.find_one({"id": branch["diagram_id"]}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    main_xml = diagram.get("current_xml", "")
    branch_xml = branch.get("current_xml", "")
    
    base_version = await db.versions.find_one(
        {"diagram_id": branch["diagram_id"], "version_number": branch.get("base_version", 1)},
        {"_id": 0}
    )
    base_xml = base_version.get("xml_content", main_xml) if base_version else main_xml
    
    def extract_elements(xml_str):
        elements = {}
        try:
            root = ET.fromstring(xml_str)
            ns = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}
            for proc in root.findall(".//bpmn:process", ns):
                for child in proc:
                    tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
                    eid = child.get("id", "")
                    if eid:
                        elements[eid] = {
                            "id": eid,
                            "name": child.get("name", ""),
                            "tag": tag,
                            "xml": ET.tostring(child, encoding="unicode")
                        }
        except:
            pass
        return elements
    
    base_els = extract_elements(base_xml)
    main_els = extract_elements(main_xml)
    branch_els = extract_elements(branch_xml)
    
    all_ids = set(list(base_els.keys()) + list(main_els.keys()) + list(branch_els.keys()))
    
    conflicts = []
    added_main = []
    added_branch = []
    removed_main = []
    removed_branch = []
    modified_main = []
    modified_branch = []
    
    for eid in all_ids:
        in_base = eid in base_els
        in_main = eid in main_els
        in_branch = eid in branch_els
        
        if not in_base and in_main and not in_branch:
            added_main.append({"id": eid, "name": main_els[eid]["name"], "tag": main_els[eid]["tag"]})
        elif not in_base and not in_main and in_branch:
            added_branch.append({"id": eid, "name": branch_els[eid]["name"], "tag": branch_els[eid]["tag"]})
        elif in_base and not in_main and in_branch:
            removed_main.append({"id": eid, "name": base_els[eid]["name"], "tag": base_els[eid]["tag"]})
        elif in_base and in_main and not in_branch:
            removed_branch.append({"id": eid, "name": base_els[eid]["name"], "tag": base_els[eid]["tag"]})
        elif in_base and in_main and in_branch:
            main_changed = main_els[eid]["xml"] != base_els[eid]["xml"]
            branch_changed = branch_els[eid]["xml"] != base_els[eid]["xml"]
            if main_changed and branch_changed:
                conflicts.append({
                    "id": eid,
                    "name": main_els[eid]["name"],
                    "tag": main_els[eid]["tag"],
                    "main_version": main_els[eid]["name"],
                    "branch_version": branch_els[eid]["name"],
                })
            elif main_changed:
                modified_main.append({"id": eid, "name": main_els[eid]["name"], "tag": main_els[eid]["tag"]})
            elif branch_changed:
                modified_branch.append({"id": eid, "name": branch_els[eid]["name"], "tag": branch_els[eid]["tag"]})
        elif not in_base and in_main and in_branch:
            if main_els[eid]["xml"] != branch_els[eid]["xml"]:
                conflicts.append({
                    "id": eid, "name": main_els[eid]["name"], "tag": main_els[eid]["tag"],
                    "main_version": main_els[eid]["name"], "branch_version": branch_els[eid]["name"],
                })
    
    has_conflicts = len(conflicts) > 0
    
    return {
        "has_conflicts": has_conflicts,
        "can_auto_merge": not has_conflicts,
        "conflicts": conflicts,
        "summary": {
            "added_main": added_main,
            "added_branch": added_branch,
            "removed_main": removed_main,
            "removed_branch": removed_branch,
            "modified_main": modified_main,
            "modified_branch": modified_branch,
        },
        "main_xml": main_xml,
        "branch_xml": branch_xml,
        "branch_name": branch["name"],
    }

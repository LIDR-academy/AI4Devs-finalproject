# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request
from typing import Optional, Dict, Any, List
import json
import logging
import re
import uuid
from datetime import datetime, timezone

from database import db
from models import Project, ProjectCreate, ProjectUpdate, GeneratePromptRequest, GenerateCodeRequest
from routers.auth import (
    get_current_user, require_auth, can_read_resource, can_write_resource,
    rls_filter, rls_filter_with_shares, can_read_resource_async, can_write_resource_async,
    get_share_role, _PUBLIC_OWNERS,
)
from templates import TEMPLATES
from cache import get_or_set, invalidate as cache_invalidate

logger = logging.getLogger(__name__)

router = APIRouter(tags=["projects"])


# ==================== TEAM METRICS ====================

@router.get("/projects/usage")
async def get_my_usage(request: Request):
    """Return current user's usage and plan limits (powers FreePlanBanner)."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0, "role": 1, "plan": 1})
    role = user_doc.get("role", "subscription") if user_doc else "subscription"
    plan = user_doc.get("plan") if user_doc else None

    project_count = await db.projects.count_documents({"created_by": {"$in": [user.user_id, user.email]}})
    proj_filter = {"created_by": {"$in": [user.user_id, user.email]}}
    user_projects = await db.projects.find(proj_filter, {"_id": 0, "diagram_ids": 1}).to_list(500)
    diagrams_per_project = [{"project_diagram_count": len(p.get("diagram_ids", []))} for p in user_projects]
    total_diagrams = sum(d["project_diagram_count"] for d in diagrams_per_project)
    max_in_any_project = max((d["project_diagram_count"] for d in diagrams_per_project), default=0)

    from limits import FREE_LIMITS

    return {
        "role": role,
        "plan": plan,
        "is_free": role == "free",
        "usage": {
            "projects": project_count,
            "diagrams_total": total_diagrams,
            "diagrams_max_in_project": max_in_any_project,
        },
        "limits": {
            "max_projects": FREE_LIMITS["max_projects"],
            "max_diagrams_per_project": FREE_LIMITS["max_diagrams_per_project"],
        },
    }


@router.get("/projects/team-metrics")
async def get_team_metrics(request: Request, days: int = 30):
    """Aggregate contributions per collaborator across diagrams the user can read.

    Returns per-user counts of versions committed, diagrams created, comments posted,
    requirement changes acknowledged, and most recent activity, restricted to resources
    the requester can access (RLS).

    Cached per-user (60s) since aggregations are heavy and contributions update slowly.
    """
    from datetime import timedelta

    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    days = max(1, min(days, 365))
    cache_key = f"team-metrics:{user.email}:{days}"

    async def _compute():
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

        diag_filter = await rls_filter_with_shares(user, "diagram")
        readable_diagrams = await db.diagrams.find(diag_filter, {"_id": 0, "id": 1}).to_list(2000)
        readable_diag_ids = [d["id"] for d in readable_diagrams]

        proj_filter = await rls_filter_with_shares(user, "project")
        readable_projects = await db.projects.find(proj_filter, {"_id": 0, "id": 1}).to_list(2000)
        readable_proj_ids = [p["id"] for p in readable_projects]

        version_match = {"created_at": {"$gte": cutoff},
                         "diagram_id": {"$in": readable_diag_ids if readable_diag_ids else []}}
        versions_agg = await db.versions.aggregate([
            {"$match": version_match},
            {"$group": {"_id": "$created_by",
                        "versions": {"$sum": 1},
                        "last_activity": {"$max": "$created_at"}}},
        ]).to_list(500)

        diagrams_match = {"created_at": {"$gte": cutoff}}
        if readable_diag_ids:
            diagrams_match["id"] = {"$in": readable_diag_ids}
        diagrams_agg = await db.diagrams.aggregate([
            {"$match": diagrams_match},
            {"$group": {"_id": "$created_by",
                        "diagrams_created": {"$sum": 1},
                        "last_activity": {"$max": "$created_at"}}},
        ]).to_list(500)

        comments_match = {"created_at": {"$gte": cutoff},
                          "diagram_id": {"$in": readable_diag_ids if readable_diag_ids else []}}
        comments_agg = await db.comments.aggregate([
            {"$match": comments_match},
            {"$group": {"_id": "$created_by",
                        "comments": {"$sum": 1},
                        "last_activity": {"$max": "$created_at"}}},
        ]).to_list(500)

        projects_match = {"created_at": {"$gte": cutoff}}
        if readable_proj_ids:
            projects_match["id"] = {"$in": readable_proj_ids}
        projects_agg = await db.projects.aggregate([
            {"$match": projects_match},
            {"$group": {"_id": "$created_by",
                        "projects_created": {"$sum": 1},
                        "last_activity": {"$max": "$created_at"}}},
        ]).to_list(500)

        contributors = {}

        def upsert(user_email, key, value, last_activity=None):
            if not user_email:
                return
            c = contributors.setdefault(user_email, {
                "user": user_email,
                "versions": 0,
                "diagrams_created": 0,
                "projects_created": 0,
                "comments": 0,
                "last_activity": None,
            })
            c[key] = value
            if last_activity and (c["last_activity"] is None or last_activity > c["last_activity"]):
                c["last_activity"] = last_activity

        for r in versions_agg:
            upsert(r["_id"], "versions", r["versions"], r.get("last_activity"))
        for r in diagrams_agg:
            upsert(r["_id"], "diagrams_created", r["diagrams_created"], r.get("last_activity"))
        for r in comments_agg:
            upsert(r["_id"], "comments", r["comments"], r.get("last_activity"))
        for r in projects_agg:
            upsert(r["_id"], "projects_created", r["projects_created"], r.get("last_activity"))

        result = []
        for c in contributors.values():
            c["total_contributions"] = (
                c["versions"] + c["diagrams_created"] * 2 + c["projects_created"] * 3 + c["comments"]
            )
            result.append(c)
        result.sort(key=lambda x: (-x["total_contributions"], x["user"] or ""))

        totals = {
            "contributors": len(result),
            "versions": sum(c["versions"] for c in result),
            "diagrams_created": sum(c["diagrams_created"] for c in result),
            "projects_created": sum(c["projects_created"] for c in result),
            "comments": sum(c["comments"] for c in result),
        }

        return {
            "window_days": days,
            "since": cutoff,
            "totals": totals,
            "contributors": result,
        }

    return await get_or_set(cache_key, ttl_seconds=60, loader=_compute)


# ==================== TEMPLATES ====================

@router.get("/projects/templates/list")
async def list_project_templates():
    """Return the catalog of predefined project templates (without XML payloads).

    Cached for 5 minutes — the template catalog is static at runtime.
    """
    async def _compute():
        return [
            {
                "id": t["id"],
                "name": t["name"],
                "description": t["description"],
                "icon": t.get("icon", "folder"),
                "color": t.get("color", "#2563EB"),
                "tags": t.get("tags", []),
                "diagrams_count": len(t.get("diagrams", [])),
                "diagrams_preview": [
                    {"name": d["name"], "description": d.get("description", "")}
                    for d in t.get("diagrams", [])
                ],
            }
            for t in TEMPLATES
        ]

    return await get_or_set("templates:list", ttl_seconds=300, loader=_compute)


@router.post("/projects/templates/{template_id}/instantiate")
async def instantiate_project_template(template_id: str, request: Request):
    """Create a new project (with diagrams) from a predefined template."""
    user = await require_auth(request)
    template = next((t for t in TEMPLATES if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    from limits import check_project_limit, FREE_LIMITS
    pcheck = await check_project_limit(user.user_id, user.email)
    if not pcheck["allowed"]:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FREE_PLAN_LIMIT",
                "type": "projects",
                "limit": pcheck["limit"],
                "current": pcheck["current"],
                "message": f"Has alcanzado el limite del plan Free ({FREE_LIMITS['max_projects']} proyecto). Sube a Pro para proyectos ilimitados.",
                "upgrade_url": "/pricing#pro",
            },
        )

    now = datetime.now(timezone.utc).isoformat()
    new_project_id = str(uuid.uuid4())

    diagram_ids = []
    for d in template.get("diagrams", []):
        new_diag_id = str(uuid.uuid4())
        diag_doc = {
            "id": new_diag_id,
            "name": d["name"],
            "description": d.get("description", ""),
            "current_xml": d.get("xml", ""),
            "current_version": 1,
            "tags": d.get("tags", []),
            "created_by": user.email,
            "created_at": now,
            "updated_at": now,
        }
        await db.diagrams.insert_one(diag_doc)

        # Initial version snapshot
        await db.versions.insert_one({
            "id": str(uuid.uuid4()),
            "diagram_id": new_diag_id,
            "version_number": 1,
            "xml_content": d.get("xml", ""),
            "commit_message": f"Initial commit from template '{template['name']}'",
            "parent_version": None,
            "tags": ["template"],
            "created_by": user.email,
            "created_at": now,
        })
        diagram_ids.append(new_diag_id)

    project_doc = {
        "id": new_project_id,
        "name": template["name"],
        "description": template["description"],
        "color": template.get("color", "#2563EB"),
        "icon": template.get("icon", "folder"),
        "tags": template.get("tags", []),
        "created_by": user.email,
        "created_at": now,
        "updated_at": now,
        "diagram_ids": diagram_ids,
        "from_template": template_id,
    }
    await db.projects.insert_one(project_doc.copy())

    # Invalidate team-metrics cache for this user (new contribution data)
    cache_invalidate(f"team-metrics:{user.email}:")

    return {
        "message": "Project created from template",
        "project_id": new_project_id,
        "project_name": project_doc["name"],
        "diagrams_created": len(diagram_ids),
    }


# ==================== PROJECT CRUD ====================

@router.get("/projects")
async def get_projects(request: Request, search: Optional[str] = None, tag: Optional[str] = None):
    user = await get_current_user(request)
    query = await rls_filter_with_shares(user, "project")
    extra = {}
    if search:
        extra["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if tag:
        extra["tags"] = tag
    if extra:
        query = {"$and": [query, extra]} if query else extra
    projects = await db.projects.find(query, {"_id": 0}).sort("updated_at", -1).to_list(100)
    for p in projects:
        p["diagram_count"] = len(p.get("diagram_ids", []))
    return projects


@router.get("/projects/{project_id}")
async def get_project(project_id: str, request: Request):
    user = await get_current_user(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_read_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Forbidden")
    diagram_ids = project.get("diagram_ids", [])
    diagrams = []
    if diagram_ids:
        diagrams = await db.diagrams.find({"id": {"$in": diagram_ids}}, {"_id": 0, "current_xml": 0}).to_list(100)
    project["diagrams"] = diagrams
    project["diagram_count"] = len(diagrams)
    return project


@router.post("/projects")
async def create_project(data: ProjectCreate, request: Request):
    user = await require_auth(request)
    from limits import check_project_limit, FREE_LIMITS
    pcheck = await check_project_limit(user.user_id, user.email)
    if not pcheck["allowed"]:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FREE_PLAN_LIMIT",
                "type": "projects",
                "limit": pcheck["limit"],
                "current": pcheck["current"],
                "message": f"Has alcanzado el limite del plan Free ({FREE_LIMITS['max_projects']} proyecto). Sube a Pro para proyectos ilimitados.",
                "upgrade_url": "/pricing#pro",
            },
        )
    project = Project(**data.model_dump())
    project.created_by = user.email
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    insert_doc = doc.copy()
    await db.projects.insert_one(insert_doc)
    cache_invalidate(f"team-metrics:{user.email}:")
    doc["diagram_count"] = 0
    return doc


@router.put("/projects/{project_id}")
async def update_project(project_id: str, data: ProjectUpdate, request: Request):
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_write_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Forbidden")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    return await db.projects.find_one({"id": project_id}, {"_id": 0})


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, request: Request):
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Delete is strictly owner/admin; editors cannot delete
    if not can_write_resource(user, project):
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.projects.delete_one({"id": project_id})
    await db.resource_shares.delete_many({"resource_type": "project", "resource_id": project_id})
    cache_invalidate(f"team-metrics:{user.email}:")
    return {"message": "Project deleted"}


@router.post("/projects/{project_id}/diagrams/{diagram_id}")
async def add_diagram_to_project(project_id: str, diagram_id: str, request: Request):
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not can_write_resource(user, project):
        raise HTTPException(status_code=403, detail="Forbidden")
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    diagram_ids = project.get("diagram_ids", [])
    if diagram_id not in diagram_ids:
        # Free-plan limit: max diagrams per project
        from limits import check_diagrams_per_project_limit, FREE_LIMITS
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
        diagram_ids.append(diagram_id)
        await db.projects.update_one(
            {"id": project_id},
            {"$set": {"diagram_ids": diagram_ids, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        # Also add diagram to the active branch
        active_branch_id = project.get("active_branch_id")
        if active_branch_id:
            await db.project_versions.update_one(
                {"id": active_branch_id},
                {"$addToSet": {"diagram_ids": diagram_id}}
            )
    return {"message": "Diagram added to project"}


@router.delete("/projects/{project_id}/diagrams/{diagram_id}")
async def remove_diagram_from_project(project_id: str, diagram_id: str, request: Request):
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not can_write_resource(user, project):
        raise HTTPException(status_code=403, detail="Forbidden")
    diagram_ids = project.get("diagram_ids", [])
    if diagram_id in diagram_ids:
        diagram_ids.remove(diagram_id)
        await db.projects.update_one(
            {"id": project_id},
            {"$set": {"diagram_ids": diagram_ids, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        # Also remove diagram from the active branch
        active_branch_id = project.get("active_branch_id")
        if active_branch_id:
            await db.project_versions.update_one(
                {"id": active_branch_id},
                {"$pull": {"diagram_ids": diagram_id}}
            )
    return {"message": "Diagram removed from project"}


# ==================== EXPORT / IMPORT ====================

async def _gather_project_specs(project_id: str, diagram_ids: list) -> dict:
    """Fetch all spec-related data tied to the project.

    Returns a dict with `specifications`, `requirements`,
    `element_requirement_links` and `spec_documents` ready to be serialised
    into the export payload.
    """
    specs = await db.specifications.find(
        {"project_id": project_id}, {"_id": 0}
    ).to_list(200)
    spec_ids = [s["id"] for s in specs]
    requirements = []
    spec_documents = []
    if spec_ids:
        requirements = await db.requirements.find(
            {"spec_id": {"$in": spec_ids}}, {"_id": 0}
        ).to_list(2000)
        spec_documents = await db.spec_documents.find(
            {"spec_id": {"$in": spec_ids}}, {"_id": 0}
        ).to_list(500)
    element_links = []
    if diagram_ids:
        element_links = await db.element_requirement_links.find(
            {"diagram_id": {"$in": diagram_ids}}, {"_id": 0}
        ).to_list(5000)
    return {
        "specifications": specs,
        "requirements": requirements,
        "element_requirement_links": element_links,
        "spec_documents": spec_documents,
    }


async def _gather_project_extras(project_id: str, diagram_ids: list) -> dict:
    """Fetch project-scoped extras: snapshots and per-diagram comments."""
    snapshots = await db.snapshots.find(
        {"project_id": project_id}, {"_id": 0}
    ).to_list(500)
    comments = []
    if diagram_ids:
        comments = await db.comments.find(
            {"diagram_id": {"$in": diagram_ids}}, {"_id": 0}
        ).to_list(5000)
    return {
        "snapshots": snapshots,
        "comments": comments,
    }


@router.get("/projects/{project_id}/export")
async def export_project(project_id: str, request: Request):
    from routers.auth import get_current_user
    from limits import check_export_allowed
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    export_check = await check_export_allowed(user.user_id)
    if not export_check["allowed"]:
        raise HTTPException(status_code=403, detail="Export is not available on the free plan")
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    diagram_ids = project.get("diagram_ids", [])
    diagrams = []
    all_versions = []
    all_branches = []

    if diagram_ids:
        diagrams = await db.diagrams.find({"id": {"$in": diagram_ids}}, {"_id": 0}).to_list(100)
        for d in diagrams:
            versions = await db.versions.find({"diagram_id": d["id"]}, {"_id": 0}).to_list(500)
            all_versions.extend(versions)
            branches = await db.branches.find({"diagram_id": d["id"]}, {"_id": 0}).to_list(50)
            all_branches.extend(branches)

    oop_classes = await db.oop_classes.find({}, {"_id": 0}).to_list(200)
    specs_bundle = await _gather_project_specs(project_id, diagram_ids)
    extras = await _gather_project_extras(project_id, diagram_ids)

    def serialize(obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        return str(obj)

    import json
    export_data = {
        "format": "bpmn-modeler-export",
        "version": "1.2",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "project": project,
        "diagrams": diagrams,
        "versions": all_versions,
        "branches": all_branches,
        "oop_classes": oop_classes,
        **specs_bundle,
        **extras,
    }

    return json.loads(json.dumps(export_data, default=serialize))


@router.get("/projects/{project_id}/export-zip")
async def export_project_zip(project_id: str, request: Request):
    """Export project as a ZIP archive with separate `.bpmn` files per diagram + metadata.json.

    Layout inside the ZIP:
      diagrams/<safe-name>--<short-id>.bpmn   (one per diagram, raw BPMN XML)
      metadata.json                           (project + diagram metadata, versions, branches, oop_classes)
      README.md                               (human-readable summary)
    """
    from routers.auth import get_current_user
    from limits import check_export_allowed
    import io
    import json as _json
    import re
    import zipfile
    from fastapi.responses import StreamingResponse

    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    export_check = await check_export_allowed(user.user_id)
    if not export_check["allowed"]:
        raise HTTPException(status_code=403, detail="Export is not available on the free plan")

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    diagram_ids = project.get("diagram_ids", [])
    diagrams: list = []
    all_versions: list = []
    all_branches: list = []
    if diagram_ids:
        diagrams = await db.diagrams.find({"id": {"$in": diagram_ids}}, {"_id": 0}).to_list(100)
        for d in diagrams:
            versions = await db.versions.find({"diagram_id": d["id"]}, {"_id": 0}).to_list(500)
            all_versions.extend(versions)
            branches = await db.branches.find({"diagram_id": d["id"]}, {"_id": 0}).to_list(50)
            all_branches.extend(branches)
    oop_classes = await db.oop_classes.find({}, {"_id": 0}).to_list(200)
    specs_bundle = await _gather_project_specs(project_id, diagram_ids)
    extras = await _gather_project_extras(project_id, diagram_ids)
    specifications = specs_bundle["specifications"]
    requirements = specs_bundle["requirements"]
    element_requirement_links = specs_bundle["element_requirement_links"]
    spec_documents = specs_bundle["spec_documents"]
    snapshots = extras["snapshots"]
    comments = extras["comments"]

    def serialize(obj):
        if hasattr(obj, "isoformat"):
            return obj.isoformat()
        return str(obj)

    def safe_filename(name: str) -> str:
        s = re.sub(r"[^a-zA-Z0-9_-]+", "_", (name or "").strip()) or "diagram"
        return s[:60].strip("_")

    diagram_files: list = []
    speckit_files: list = []
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # Each diagram → its own .bpmn file
        for d in diagrams:
            # Diagrams collection stores XML under `current_xml`.
            # Fallback to `bpmn_xml` for legacy docs that used the old field name.
            xml = d.get("current_xml") or d.get("bpmn_xml") or ""
            short = (d.get("id") or "")[:8]
            filename = f"diagrams/{safe_filename(d.get('name', 'diagram'))}--{short}.bpmn"
            zf.writestr(filename, xml)
            diagram_files.append({"id": d.get("id"), "name": d.get("name"), "file": filename})

        # Each spec with a generated Speckit doc → human-readable .md file
        for s in specifications:
            doc = s.get("speckit_doc")
            if doc:
                short = (s.get("id") or "")[:8]
                fname = f"specs/{safe_filename(s.get('title', 'spec'))}--{short}.md"
                zf.writestr(fname, doc)
                speckit_files.append({"id": s.get("id"), "title": s.get("title"), "file": fname})

        # Strip XML payload from metadata diagrams (already in separate files)
        meta_diagrams = [
            {k: v for k, v in d.items() if k not in ("current_xml", "bpmn_xml")}
            for d in diagrams
        ]

        metadata = {
            "format": "bpmn-modeler-zip-export",
            "version": "1.2",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "project": project,
            "diagrams": meta_diagrams,
            "diagram_files": diagram_files,
            "versions": all_versions,
            "branches": all_branches,
            "oop_classes": oop_classes,
            "specifications": specifications,
            "requirements": requirements,
            "element_requirement_links": element_requirement_links,
            "spec_documents": spec_documents,
            "snapshots": snapshots,
            "comments": comments,
            "speckit_files": speckit_files,
        }
        zf.writestr(
            "metadata.json",
            _json.dumps(metadata, indent=2, ensure_ascii=False, default=serialize),
        )

        # Human-readable summary
        readme_lines = [
            f"# {project.get('name', 'Proyecto')} — Export",
            "",
            f"Exportado: {datetime.now(timezone.utc).isoformat()}",
            (
                f"Diagramas: {len(diagrams)} · Versiones: {len(all_versions)} · "
                f"Ramas: {len(all_branches)} · Clases OOP: {len(oop_classes)} · "
                f"Specs: {len(specifications)} · Requirements: {len(requirements)} · "
                f"Links elemento↔requirement: {len(element_requirement_links)} · "
                f"Spec docs: {len(spec_documents)} · Snapshots: {len(snapshots)} · "
                f"Comentarios: {len(comments)}"
            ),
            "",
            "## Contenido",
            "- `diagrams/*.bpmn` — Un archivo BPMN 2.0 XML por cada diagrama del proyecto.",
            "- `specs/*.md` — Speckit generado por IA (si existe) por cada especificacion.",
            "- `metadata.json` — Toda la metadata: proyecto, versiones, ramas, clases OOP, especificaciones, requirements y enlaces elemento-requirement.",
            "",
            "## Re-importar",
            "Sube el ZIP completo via `POST /api/projects/import` (multipart o application/zip).",
            "",
            "## Diagramas incluidos",
        ] + [f"- `{f['file']}` — {f['name']}" for f in diagram_files]
        if speckit_files:
            readme_lines += ["", "## Specs incluidas"] + [
                f"- `{f['file']}` — {f['title']}" for f in speckit_files
            ]
        zf.writestr("README.md", "\n".join(readme_lines))

    buf.seek(0)
    safe_proj = safe_filename(project.get("name", "proyecto"))
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    headers = {"Content-Disposition": f'attachment; filename="{safe_proj}-{stamp}.zip"'}
    return StreamingResponse(iter([buf.getvalue()]), media_type="application/zip", headers=headers)



@router.post("/projects/import")
async def import_project(request: Request):
    """Import a project from either:
      - application/json  → legacy single-JSON export (`bpmn-modeler-export`)
      - application/zip / multipart upload → ZIP export (`bpmn-modeler-zip-export`)

    Detection is content-type-based, with multipart fallback for browser file
    uploads where the file lives under the `file` form field.
    """
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    content_type = (request.headers.get("content-type") or "").lower()

    # ---------- ZIP path ----------
    if "application/zip" in content_type or "multipart/form-data" in content_type:
        body_bytes: bytes
        if "multipart/form-data" in content_type:
            form = await request.form()
            file = form.get("file")
            if file is None or not hasattr(file, "read"):
                raise HTTPException(status_code=400, detail="Falta el campo 'file' en el formulario")
            body_bytes = await file.read()
        else:
            body_bytes = await request.body()

        return await _import_from_zip(body_bytes, user)

    # ---------- Legacy JSON path ----------
    body = await request.json()
    if body.get("format") == "bpmn-modeler-zip-export":
        # User pasted the metadata.json contents → tell them to send the ZIP
        raise HTTPException(
            status_code=400,
            detail="Detectado metadata.json suelto. Sube el ZIP completo (.zip) en lugar del metadata.json.",
        )
    if body.get("format") != "bpmn-modeler-export":
        raise HTTPException(status_code=400, detail="Formato de archivo no valido")

    return await _import_from_json(body, user)


async def _import_from_json(body: Dict[str, Any], user) -> Dict[str, Any]:
    """Persist the parsed JSON payload as a new project and return summary."""
    now = datetime.now(timezone.utc).isoformat()
    src_project = body.get("project", {})

    new_project_id = str(uuid.uuid4())
    project_doc = {
        "id": new_project_id,
        "name": src_project.get("name", "Proyecto Importado") + " (importado)",
        "description": src_project.get("description", ""),
        "color": src_project.get("color", "#2563EB"),
        "icon": src_project.get("icon", "folder"),
        "tags": src_project.get("tags", []),
        "created_by": user.email,
        "created_at": now,
        "updated_at": now,
        "diagram_ids": [],
    }

    id_map: Dict[str, str] = {}
    imported_diagrams = 0
    imported_versions = 0
    imported_branches = 0

    for diag in body.get("diagrams", []):
        old_id = diag.get("id", "")
        new_id = str(uuid.uuid4())
        id_map[old_id] = new_id

        diag_doc = {
            "id": new_id,
            "name": diag.get("name", "Diagrama"),
            "description": diag.get("description", ""),
            "current_xml": diag.get("current_xml", ""),
            "current_version": diag.get("current_version", 1),
            "tags": diag.get("tags", []),
            "created_by": user.email,
            "created_at": now,
            "updated_at": now,
        }
        # If the diagram came from a ZIP import, current_xml may be missing
        # but bpmn_xml is what was stored. Prefer current_xml, fallback bpmn_xml.
        if not diag_doc["current_xml"] and diag.get("bpmn_xml"):
            diag_doc["current_xml"] = diag["bpmn_xml"]
        await db.diagrams.insert_one(diag_doc)
        project_doc["diagram_ids"].append(new_id)
        imported_diagrams += 1

    for ver in body.get("versions", []):
        old_diag_id = ver.get("diagram_id", "")
        new_diag_id = id_map.get(old_diag_id)
        if not new_diag_id:
            continue
        ver_doc = {
            "id": str(uuid.uuid4()),
            "diagram_id": new_diag_id,
            "version_number": ver.get("version_number", 1),
            "xml_content": ver.get("xml_content", ""),
            "commit_message": ver.get("commit_message", ""),
            "parent_version": ver.get("parent_version"),
            "tags": ver.get("tags", []),
            "created_by": user.email,
            "created_at": now,
        }
        await db.versions.insert_one(ver_doc)
        imported_versions += 1

    for branch in body.get("branches", []):
        old_diag_id = branch.get("diagram_id", "")
        new_diag_id = id_map.get(old_diag_id)
        if not new_diag_id:
            continue
        branch_doc = {
            "id": str(uuid.uuid4()),
            "diagram_id": new_diag_id,
            "name": branch.get("name", ""),
            "description": branch.get("description", ""),
            "base_version": branch.get("base_version", 1),
            "current_xml": branch.get("current_xml", ""),
            "current_version": branch.get("current_version", 1),
            "status": branch.get("status", "active"),
            "is_merged": branch.get("is_merged", False),
            "created_by": user.email,
            "created_at": now,
        }
        await db.branches.insert_one(branch_doc)
        imported_branches += 1

    # ---------- Specifications + requirements + element-requirement links ----------
    spec_id_map: Dict[str, str] = {}
    req_id_map: Dict[str, str] = {}
    imported_specs = 0
    imported_requirements = 0
    imported_element_links = 0

    for spec in body.get("specifications", []):
        old_spec_id = spec.get("id", "")
        new_spec_id = str(uuid.uuid4())
        spec_id_map[old_spec_id] = new_spec_id
        spec_doc = {
            "id": new_spec_id,
            "project_id": new_project_id,
            "title": spec.get("title", "Specification"),
            "description": spec.get("description", ""),
            "mode": spec.get("mode", "full"),
            "status": spec.get("status", "draft"),
            "tags": spec.get("tags", []) or [],
            "speckit_doc": spec.get("speckit_doc"),
            "speckit_status": spec.get("speckit_status"),
            "speckit_phase": spec.get("speckit_phase"),
            "speckit_outdated": bool(spec.get("speckit_outdated", False)),
            "requirements_count": 0,
            "created_by": user.email,
            "created_at": now,
            "updated_at": now,
        }
        await db.specifications.insert_one(spec_doc)
        imported_specs += 1

    for req in body.get("requirements", []):
        old_spec_id = req.get("spec_id", "")
        new_spec_id = spec_id_map.get(old_spec_id)
        if not new_spec_id:
            continue
        new_req_id = str(uuid.uuid4())
        req_id_map[req.get("id", "")] = new_req_id
        # Remap linked_diagrams to new diagram ids
        linked_diagrams = [
            id_map[d] for d in (req.get("linked_diagrams") or []) if d in id_map
        ]
        req_doc = {
            "id": new_req_id,
            "spec_id": new_spec_id,
            "code": req.get("code", ""),
            "title": req.get("title", ""),
            "description": req.get("description", ""),
            "type": req.get("type", "FR"),
            "category": req.get("category", ""),
            "moscow": req.get("moscow", "SHOULD"),
            "raci": req.get("raci") or {},
            "acceptance_criteria": req.get("acceptance_criteria", []) or [],
            "status": req.get("status", "draft"),
            "tags": req.get("tags", []) or [],
            "linked_diagrams": linked_diagrams,
            "linked_classes": req.get("linked_classes", []) or [],
            "created_by": user.email,
            "created_at": now,
            "updated_at": now,
        }
        await db.requirements.insert_one(req_doc)
        imported_requirements += 1

    # Recount requirements per spec
    for new_spec_id in spec_id_map.values():
        cnt = await db.requirements.count_documents({"spec_id": new_spec_id})
        await db.specifications.update_one(
            {"id": new_spec_id},
            {"$set": {"requirements_count": cnt}},
        )

    for link in body.get("element_requirement_links", []):
        new_diag_id = id_map.get(link.get("diagram_id", ""))
        new_req_id = req_id_map.get(link.get("requirement_id", ""))
        if not new_diag_id or not new_req_id:
            continue
        link_doc = {
            "id": str(uuid.uuid4()),
            "diagram_id": new_diag_id,
            "element_id": link.get("element_id", ""),
            "requirement_id": new_req_id,
            "created_by": user.email,
            "created_at": now,
        }
        await db.element_requirement_links.insert_one(link_doc)
        imported_element_links += 1

    # ---------- Spec documents (functional, openspec, raci, ...) ----------
    imported_spec_documents = 0
    for sd in body.get("spec_documents", []):
        new_spec_id = spec_id_map.get(sd.get("spec_id", ""))
        if not new_spec_id:
            continue
        await db.spec_documents.insert_one({
            "id": str(uuid.uuid4()),
            "spec_id": new_spec_id,
            "title": sd.get("title", ""),
            "content": sd.get("content", ""),
            "doc_type": sd.get("doc_type", "functional"),
            "created_by": user.email,
            "created_at": now,
            "updated_at": now,
        })
        imported_spec_documents += 1

    # ---------- Snapshots (Spec-Driven Development phases) ----------
    imported_snapshots = 0
    for snap in body.get("snapshots", []):
        await db.snapshots.insert_one({
            "id": str(uuid.uuid4()),
            "project_id": new_project_id,
            "phase": snap.get("phase", "ideation"),
            "version": snap.get("version", 1),
            "title": snap.get("title", ""),
            "data": snap.get("data") or {},
            "created_by": user.email,
            "created_at": now,
        })
        imported_snapshots += 1

    # ---------- Comments on diagram elements ----------
    imported_comments = 0
    for cm in body.get("comments", []):
        new_diag_id = id_map.get(cm.get("diagram_id", ""))
        if not new_diag_id:
            continue
        await db.comments.insert_one({
            "id": str(uuid.uuid4()),
            "diagram_id": new_diag_id,
            "element_id": cm.get("element_id", ""),
            "element_name": cm.get("element_name") or cm.get("element_id", ""),
            "content": cm.get("content") or cm.get("comment", ""),
            "priority": cm.get("priority"),
            "mentions": cm.get("mentions") or [],
            "parent_comment_id": cm.get("parent_comment_id"),
            "is_resolved": bool(cm.get("is_resolved", False)),
            "created_by": user.email,
            "created_by_name": cm.get("created_by_name") or user.name or user.email,
            "created_at": now,
        })
        imported_comments += 1

    await db.projects.insert_one(project_doc)

    return {
        "message": "Proyecto importado correctamente",
        "project_id": new_project_id,
        "project_name": project_doc["name"],
        "imported_diagrams": imported_diagrams,
        "imported_versions": imported_versions,
        "imported_branches": imported_branches,
        "imported_specifications": imported_specs,
        "imported_requirements": imported_requirements,
        "imported_element_links": imported_element_links,
        "imported_spec_documents": imported_spec_documents,
        "imported_snapshots": imported_snapshots,
        "imported_comments": imported_comments,
        "source_format": "json",
    }


async def _import_from_zip(body_bytes: bytes, user) -> Dict[str, Any]:
    """Parse a ZIP export, reconstruct the JSON payload (rehydrating bpmn_xml
    from the per-diagram .bpmn files), then delegate to _import_from_json."""
    import io
    import json as _json
    import zipfile

    if len(body_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="ZIP demasiado grande (max 50MB)")
    if len(body_bytes) < 22:  # min ZIP size
        raise HTTPException(status_code=400, detail="ZIP vacio o invalido")

    try:
        zf = zipfile.ZipFile(io.BytesIO(body_bytes))
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Archivo ZIP invalido")

    names = zf.namelist()
    if "metadata.json" not in names:
        raise HTTPException(
            status_code=400,
            detail="ZIP sin metadata.json — exportado desde otra herramienta?",
        )

    try:
        meta = _json.loads(zf.read("metadata.json").decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="metadata.json corrupto o no es JSON valido")

    if meta.get("format") != "bpmn-modeler-zip-export":
        raise HTTPException(
            status_code=400,
            detail=f"metadata.json formato desconocido: {meta.get('format')}",
        )

    # Build map of diagram id → file path inside the ZIP
    file_map: Dict[str, str] = {}
    for entry in meta.get("diagram_files", []):
        if entry.get("id") and entry.get("file"):
            file_map[entry["id"]] = entry["file"]

    # Rehydrate bpmn_xml on each diagram from its .bpmn file
    diagrams_full: List[Dict[str, Any]] = []
    missing_xml: List[str] = []
    for d in meta.get("diagrams", []):
        d_copy = dict(d)
        path = file_map.get(d_copy.get("id"))
        if path and path in names:
            try:
                d_copy["current_xml"] = zf.read(path).decode("utf-8")
                d_copy["bpmn_xml"] = d_copy["current_xml"]  # legacy compat
            except Exception:
                missing_xml.append(d_copy.get("name") or d_copy.get("id") or "?")
        else:
            missing_xml.append(d_copy.get("name") or d_copy.get("id") or "?")
        diagrams_full.append(d_copy)

    payload = {
        "format": "bpmn-modeler-export",
        "version": meta.get("version", "1.0"),
        "project": meta.get("project", {}),
        "diagrams": diagrams_full,
        "versions": meta.get("versions", []),
        "branches": meta.get("branches", []),
        "oop_classes": meta.get("oop_classes", []),
        "specifications": meta.get("specifications", []),
        "requirements": meta.get("requirements", []),
        "element_requirement_links": meta.get("element_requirement_links", []),
        "spec_documents": meta.get("spec_documents", []),
        "snapshots": meta.get("snapshots", []),
        "comments": meta.get("comments", []),
    }

    result = await _import_from_json(payload, user)
    result["source_format"] = "zip"
    if missing_xml:
        result["warnings"] = [f"Diagramas sin XML en el ZIP: {', '.join(missing_xml[:5])}"]
    return result


# ==================== CODE GENERATION ====================

def _parse_bpmn_to_description(xml_content: str, diagram_name: str) -> str:
    desc_parts = [f"### Proceso: {diagram_name}"]
    
    tasks = re.findall(r'<bpmn:(?:task|userTask|serviceTask|scriptTask|sendTask|receiveTask)\s+id="([^"]+)"\s+name="([^"]*)"', xml_content)
    gateways = re.findall(r'<bpmn:(?:exclusiveGateway|parallelGateway|inclusiveGateway)\s+id="([^"]+)"\s*(?:name="([^"]*)")?', xml_content)
    start_events = re.findall(r'<bpmn:startEvent\s+id="([^"]+)"\s*(?:name="([^"]*)")?', xml_content)
    end_events = re.findall(r'<bpmn:endEvent\s+id="([^"]+)"\s*(?:name="([^"]*)")?', xml_content)
    flows = re.findall(r'<bpmn:sequenceFlow\s+id="([^"]+)"\s+sourceRef="([^"]+)"\s+targetRef="([^"]+)"', xml_content)
    
    elements = {}
    for eid, name in start_events:
        elements[eid] = name or "Inicio"
    for eid, name in tasks:
        elements[eid] = name or eid
    for eid, name in gateways:
        elements[eid] = name or f"Decision ({eid})"
    for eid, name in end_events:
        elements[eid] = name or "Fin"
    
    if start_events:
        desc_parts.append(f"- Eventos de inicio: {', '.join(name or 'Inicio' for _, name in start_events)}")
    if tasks:
        desc_parts.append(f"- Tareas ({len(tasks)}):")
        for _, name in tasks:
            desc_parts.append(f"  - {name}")
    if gateways:
        desc_parts.append(f"- Decisiones ({len(gateways)}):")
        for _, name in gateways:
            desc_parts.append(f"  - {name or 'Gateway'}")
    if end_events:
        desc_parts.append(f"- Eventos de fin: {', '.join(name or 'Fin' for _, name in end_events)}")
    
    if flows:
        desc_parts.append("- Flujo:")
        for _, src, tgt in flows:
            src_name = elements.get(src, src)
            tgt_name = elements.get(tgt, tgt)
            desc_parts.append(f"  - {src_name} -> {tgt_name}")
    
    return "\n".join(desc_parts)


CODE_TYPE_TEMPLATES = {
    "api": {
        "label": "API Backend (endpoints, servicios, modelos)",
        "instruction": """Generate a complete backend API implementation based on the business processes described below.
Include:
- Data models/schemas for each entity involved
- API endpoints (REST) for each process step
- Service layer with business logic
- Input validation and error handling
- Database operations (CRUD)
- Comments in Spanish explaining the business logic"""
    },
    "automation": {
        "label": "Automatizacion/Workflow (scripts de proceso)",
        "instruction": """Generate automation/workflow scripts that implement the business processes described below.
Include:
- A main orchestrator function that executes the workflow
- Individual step functions for each task
- Decision logic for gateways/branches
- Error handling and retry logic
- Logging at each step
- State management between steps
- Comments in Spanish explaining each step"""
    },
    "custom": {
        "label": "Personalizado",
        "instruction": """Generate code based on the business processes described below, following the custom instructions provided."""
    }
}

LANGUAGE_MAP = {
    "python": "Python",
    "nodejs": "Node.js (TypeScript)",
    "java": "Java",
    "csharp": "C#",
    "go": "Go",
    "sudolang": "SudoLang",
}


@router.post("/projects/{project_id}/generate-prompt")
async def generate_project_prompt(project_id: str, data: GeneratePromptRequest):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    diagram_ids = data.diagram_ids if data.diagram_ids else project.get("diagram_ids", [])
    if not diagram_ids:
        raise HTTPException(status_code=400, detail="No diagrams selected or in project")
    
    diagrams = await db.diagrams.find({"id": {"$in": diagram_ids}}, {"_id": 0}).to_list(50)
    if not diagrams:
        raise HTTPException(status_code=404, detail="No diagrams found")
    
    process_descriptions = []
    for diag in diagrams:
        xml = diag.get("current_xml", "")
        if xml and len(xml) > 50 and "definitions" in xml:
            desc = _parse_bpmn_to_description(xml, diag.get("name", "Sin nombre"))
        else:
            desc = f"### Proceso: {diag.get('name', 'Sin nombre')}\n(Diagrama sin contenido BPMN valido)"
        process_descriptions.append(desc)
    
    code_type_info = CODE_TYPE_TEMPLATES.get(data.code_type, CODE_TYPE_TEMPLATES["api"])
    lang_name = LANGUAGE_MAP.get(data.language, data.language)
    
    prompt_parts = [
        "# Generacion de Codigo desde Procesos BPMN",
        f"## Proyecto: {project.get('name', 'Sin nombre')}",
        f"## Tipo: {code_type_info['label']}",
        f"## Lenguaje: {lang_name}",
        "",
        "## Instrucciones:",
        code_type_info['instruction'],
    ]
    
    if data.custom_instructions:
        prompt_parts.extend([
            "",
            "## Instrucciones adicionales del usuario:",
            data.custom_instructions
        ])
    
    prompt_parts.extend([
        "",
        f"## Procesos de Negocio ({len(process_descriptions)} diagramas):",
        ""
    ])
    
    for desc in process_descriptions:
        prompt_parts.append(desc)
        prompt_parts.append("")
    
    prompt_parts.extend([
        "## Requisitos:",
        f"- Genera codigo completo y funcional en {lang_name}",
        "- Incluye comentarios explicativos en espanol",
        "- Sigue las mejores practicas y patrones del lenguaje",
        "- El codigo debe ser production-ready",
    ])
    
    generated_prompt = "\n".join(prompt_parts)
    
    return {
        "prompt": generated_prompt,
        "project_name": project.get("name"),
        "diagrams_count": len(diagrams),
        "code_type": data.code_type,
        "language": data.language
    }


@router.post("/projects/{project_id}/generate-code")
async def generate_project_code(project_id: str, data: GenerateCodeRequest):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from routers.ai import _call_deepseek

    lang_name = LANGUAGE_MAP.get(data.language, data.language)

    if data.language == "sudolang":
        system_msg = """You are an expert in SudoLang — a pseudocode programming language for collaborating with AI on complex specifications.
Generate a clean, idiomatic SudoLang `.sudo` specification from the BPMN process described by the user.

Rules:
- Use SudoLang syntax: top-level `# Title`, blocks delimited by `{ }`, constraints prefixed with `require`, `forbid`, `should`
- Define interfaces with `interface Name { state, methods }` and use `|` for union types
- Use `/commands` for chat-style operations the AI assistant should expose
- Add comments in Spanish explaining the business logic with `//`
- Wrap the result in a single ```sudolang code block
- Do NOT include explanations outside the code block"""
    else:
        system_msg = f"""You are an expert software engineer. Generate clean, production-ready {lang_name} code based on the BPMN process descriptions provided by the user.

Rules:
- Write complete, runnable code
- Use proper design patterns for {lang_name}
- Add comments in Spanish explaining business logic
- Include imports/dependencies at the top
- Handle errors properly
- Follow {lang_name} best practices and conventions
- Return ONLY the code wrapped in a single markdown code block
- Do NOT include explanations outside the code block"""

    response = await _call_deepseek(system_msg, data.prompt, max_tokens=8192)

    code_content = response
    lang_hint = data.language if data.language != "nodejs" else "typescript"
    if f"```{lang_hint}" in response:
        code_content = response.split(f"```{lang_hint}")[1].split("```")[0].strip()
    elif "```python" in response:
        code_content = response.split("```python")[1].split("```")[0].strip()
    elif "```" in response:
        parts = response.split("```")
        if len(parts) >= 3:
            code_content = parts[1].strip()
            lines = code_content.split("\n")
            if lines[0].strip() in ["python", "typescript", "javascript", "java", "csharp", "go", "cs", "sudolang", "sudo"]:
                code_content = "\n".join(lines[1:])

    return {
        "code": code_content,
        "language": data.language,
        "code_type": data.code_type,
        "project_name": project.get("name")
    }


# ==================== GITHUB PROJECT LINKING ====================

from routers.git import _parse_github_url, _resolve_pat
import base64
import httpx


def _build_requirements_md(reqs: list) -> str:
    """Build a requirements.md from a list of requirement dicts."""
    lines = ["# Requirements", "", f"**Total:** {len(reqs)} requirements", ""]
    for i, r in enumerate(reqs, 1):
        title = r.get("title") or f"Requirement #{i}"
        moscow = (r.get("moscow") or "").upper()
        code = r.get("code") or ""
        lines.append(f"{i}. **[{moscow}]** {code} — {title}")
        if r.get("description"):
            lines.append(f"   {r['description']}")
    return "\n".join(lines) + "\n"


def _build_spec_md(spec: dict, reqs: list) -> str:
    """Build a spec.md from a spec dict and requirements list."""
    lines = ["# Specification", ""]
    if spec.get("title"):
        lines.append(f"**Title:** {spec['title']}")
    if spec.get("mode"):
        lines.append(f"**Mode:** {spec['mode']}")
    if spec.get("description"):
        lines.append(f"\n{spec['description']}")
    if spec.get("speckit_doc"):
        lines.append(f"\n## Speckit\n\n{spec['speckit_doc']}")
    if reqs:
        lines.append(f"\n## Requirements ({len(reqs)})")
        for i, r in enumerate(reqs, 1):
            title = r.get("title") or f"Req #{i}"
            moscow = (r.get("moscow") or "").upper()
            code = r.get("code") or ""
            lines.append(f"\n### {i}. [{moscow}] {code} — {title}")
            if r.get("description"):
                lines.append(r["description"])
    return "\n".join(lines) + "\n"


def _format_phase_md(phase: str, snapshot: dict) -> str:
    """Convert a phase snapshot to a readable Markdown string."""
    payload = snapshot.get("payload") or {}
    label = snapshot.get("label") or ""
    created_at = snapshot.get("created_at") or ""
    created_by = snapshot.get("created_by") or ""

    header = f"# {phase.capitalize()}\n\nVersion {snapshot.get('version', '?')} | {created_at}"
    if label:
        header += f" | {label}"
    if created_by:
        header += f"\n\nBy: {created_by}"

    if phase == "descripcion":
        spec = payload.get("spec") or {}
        content = spec.get("ai_brief") or spec.get("title") or spec.get("description") or payload.get("text") or payload.get("description") or label or ""
        return f"{header}\n\n{content}\n"

    if phase == "requirements":
        reqs = payload.get("requirements") or []
        lines = [header, "", f"**Total:** {len(reqs)} requirements", ""]
        for i, r in enumerate(reqs, 1):
            title = r.get("title") or r.get("description") or f"Requirement #{i}"
            moscow = r.get("moscow") or ""
            lines.append(f"{i}. **[{moscow.upper()}]** {title}")
            if r.get("description"):
                lines.append(f"   {r['description']}")
        return "\n".join(lines) + "\n"

    if phase == "specification":
        spec = payload.get("spec") or {}
        lines = [header, ""]
        if spec.get("title"):
            lines.append(f"**Title:** {spec['title']}")
        if spec.get("mode"):
            lines.append(f"**Mode:** {spec['mode']}")
        if spec.get("speckit_doc"):
            lines.append(f"\n{spec['speckit_doc']}")
        reqs = payload.get("requirements") or []
        if reqs:
            lines.append(f"\n## Requirements ({len(reqs)})")
            for i, r in enumerate(reqs, 1):
                lines.append(f"\n### {i}. {r.get('title', f'Req #{i}')}")
                if r.get("description"):
                    lines.append(r["description"])
        return "\n".join(lines) + "\n"

    if phase == "code":
        code_summary = payload.get("summary") or ""
        files_count = payload.get("files_count") or 0
        stack = payload.get("stack") or {}
        lines = [header, "", f"**Files:** {files_count}", f"**Summary:** {code_summary}"]
        if stack:
            lines.append(f"\n**Stack:** {json.dumps(stack, indent=2)}")
        if payload.get("target"):
            lines.append(f"**Target:** {payload['target']}")
        return "\n".join(lines) + "\n"

    return f"{header}\n"


async def _build_project_file_tree(project_id: str) -> dict:
    """Build a file tree dict from all project phases.

    Returns {"tree": {...}, "files": {path: content}} where tree is a nested
    directory structure and files maps each path to its string content.
    """
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_name = project["name"].replace(" ", "-").replace("/", "-").lower()
    tree = {"name": project_name, "type": "directory", "children": []}
    files = {}

    # README.md
    desc = project.get("description") or ""
    tags = project.get("tags") or []
    tags_str = ", ".join(tags) if tags else ""
    readme = f"# {project['name']}\n\n{desc}\n"
    if tags_str:
        readme += f"\n**Tags:** {tags_str}\n"
    readme += f"\n**Created:** {project.get('created_at', '')}\n"
    readme += f"\n**Updated:** {project.get('updated_at', '')}\n"
    tree["children"].append({"name": "README.md", "type": "file"})
    files[f"{project_name}/README.md"] = readme

    # metadata.json
    meta = {k: v for k, v in project.items() if k not in ("_id",)}
    meta["exported_at"] = datetime.now(timezone.utc).isoformat()
    tree["children"].append({"name": "metadata.json", "type": "file"})
    files[f"{project_name}/metadata.json"] = json.dumps(meta, indent=2, default=str)

    # Helper to add a phase directory
    async def _add_phase_dir(dir_name: str, file_name: str, phase: str):
        d = {"name": dir_name, "type": "directory", "children": []}
        snap = await db.phase_snapshots.find_one(
            {"project_id": project_id, "phase": phase},
            sort=[("version", -1)],
        )
        if snap:
            d["children"].append({"name": file_name, "type": "file"})
            files[f"{project_name}/{dir_name}/{file_name}"] = _format_phase_md(phase, snap)
            # speckit_doc for specification
            if phase == "specification":
                payload = snap.get("payload") or {}
                speckit = (payload.get("spec") or {}).get("speckit_doc")
                if speckit:
                    d["children"].append({"name": "speckit_doc.md", "type": "file"})
                    files[f"{project_name}/{dir_name}/speckit_doc.md"] = speckit
        return d

    # ---- Derive descripcion/requirements/specification from the latest
    #      specification snapshot (same logic as the project tree endpoint).
    #      Falls back to per-phase snapshots if no specification snapshot exists.
    spec_snap = await db.phase_snapshots.find_one(
        {"project_id": project_id, "phase": "specification"},
        sort=[("version", -1)],
    )

    desc_dir = {"name": "descripcion", "type": "directory", "children": []}
    reqs_dir = {"name": "requirements", "type": "directory", "children": []}
    spec_dir_children = {"name": "specification", "type": "directory", "children": []}

    if spec_snap:
        payload = spec_snap.get("payload") or {}
        spec = payload.get("spec") or {}
        reqs = payload.get("requirements") or []

        # descripcion/ — from spec's ai_descripcion or ai_brief
        ai_desc = spec.get("ai_descripcion") or spec.get("ai_brief") or spec.get("description") or ""
        if ai_desc.strip():
            desc_dir["children"].append({"name": "descripcion.md", "type": "file"})
            files[f"{project_name}/descripcion/descripcion.md"] = (
                f"# Descripcion\n\n{spec.get('ai_label', '')}\n\n{ai_desc}"
            )

        # requirements/
        if reqs:
            reqs_md = _build_requirements_md(reqs)
            reqs_dir["children"].append({"name": "requirements.md", "type": "file"})
            files[f"{project_name}/requirements/requirements.md"] = reqs_md

        # specification/
        spec_md = _build_spec_md(spec, reqs)
        spec_dir_children["children"].append({"name": "spec.md", "type": "file"})
        files[f"{project_name}/specification/spec.md"] = spec_md
        if spec.get("speckit_doc"):
            spec_dir_children["children"].append({"name": "speckit_doc.md", "type": "file"})
            files[f"{project_name}/specification/speckit_doc.md"] = spec["speckit_doc"]
    else:
        # Fallback: per-phase snapshots (legacy / manual snapshots)
        desc_snaps = await db.phase_snapshots.find(
            {"project_id": project_id, "phase": "descripcion"},
            {"_id": 0, "label": 1, "payload": 1},
        ).sort("version", -1).to_list(100)
        if desc_snaps:
            for snap in desc_snaps:
                label = (snap.get("label") or "descripcion").strip().replace(" ", "_").replace("/", "-") or "descripcion"
                file_name = f"{label}.md"
                desc_dir["children"].append({"name": file_name, "type": "file"})
                files[f"{project_name}/descripcion/{file_name}"] = _format_phase_md("descripcion", snap)

        fallback_reqs = await db.phase_snapshots.find_one(
            {"project_id": project_id, "phase": "requirements"},
            sort=[("version", -1)],
        )
        if fallback_reqs:
            reqs_dir["children"].append({"name": "requirements.md", "type": "file"})
            files[f"{project_name}/requirements/requirements.md"] = _format_phase_md("requirements", fallback_reqs)

        fallback_spec = await db.phase_snapshots.find_one(
            {"project_id": project_id, "phase": "specification"},
            sort=[("version", -1)],
        )
        if fallback_spec:
            spec_dir_children["children"].append({"name": "spec.md", "type": "file"})
            files[f"{project_name}/specification/spec.md"] = _format_phase_md("specification", fallback_spec)
            payload = fallback_spec.get("payload") or {}
            speckit = (payload.get("spec") or {}).get("speckit_doc")
            if speckit:
                spec_dir_children["children"].append({"name": "speckit_doc.md", "type": "file"})
                files[f"{project_name}/specification/speckit_doc.md"] = speckit

    tree["children"].append(desc_dir)
    tree["children"].append(reqs_dir)
    tree["children"].append(spec_dir_children)

    # bpmn/
    bpmn_dir = {"name": "bpmn", "type": "directory", "children": []}
    for did in project.get("diagram_ids") or []:
        diagram = await db.diagrams.find_one({"id": did}, {"_id": 0})
        if diagram and diagram.get("current_xml"):
            file_name = diagram["name"].replace(" ", "_").replace("/", "-") + ".bpmn"
            bpmn_dir["children"].append({"name": file_name, "type": "file", "diagramId": diagram["id"]})
            files[f"{project_name}/bpmn/{file_name}"] = diagram["current_xml"]
    tree["children"].append(bpmn_dir)

    # code/
    tree["children"].append(await _add_phase_dir("code", "sdd.md", "code"))

    # Include user-created project files (from the file explorer)
    # Wrapped under files/ to avoid clashes with phase-snapshot dirs (code/, bpmn/, etc.)
    proj_files_cursor = db.project_files.find(
        {"project_id": project_id},
        {"_id": 0}
    )
    proj_files = await proj_files_cursor.to_list(2000)

    if proj_files:
        node_map = {f["id"]: f for f in proj_files}
        SYSTEM_DIRS = {"descripcion", "requirements", "specification", "code", "bpmn", "files"}
        roots = sorted(
            [f for f in proj_files
             if not f.get("parent_id")
             and not (f["type"] == "directory" and f["name"] in SYSTEM_DIRS)],
            key=lambda d: (0 if d["type"] == "directory" else 1, d["name"]),
        )

        def _build_file_subtree(node):
            if node["type"] == "file":
                return {"name": node["name"], "type": "file"}
            # Sort and deduplicate children by (name, type) to avoid showing
            # duplicated entries when project_files contains duplicates
            seen = set()
            children_nodes = []
            for f in sorted(
                [f for f in proj_files if f.get("parent_id") == node["id"]],
                key=lambda d: (0 if d["type"] == "directory" else 1, d["name"]),
            ):
                dedup_key = (f["name"], f["type"])
                if dedup_key not in seen:
                    seen.add(dedup_key)
                    children_nodes.append(f)
            return {
                "name": node["name"],
                "type": "directory",
                "children": [_build_file_subtree(c) for c in children_nodes],
            }

        # Find the files/ directory in project_files (created during GitHub pull)
        files_db_dir = next(
            (f for f in proj_files
             if f["type"] == "directory" and f["name"] == "files" and not f.get("parent_id")),
            None,
        )

        # Start with user-created root-level items, then merge children of the
        # files/ DB directory (populated by GitHub pulls) so they also appear
        # under the synthetic files/ tree node.
        all_files_children = list(roots)
        if files_db_dir:
            db_files_children = sorted(
                [f for f in proj_files if f.get("parent_id") == files_db_dir["id"]],
                key=lambda d: (0 if d["type"] == "directory" else 1, d["name"]),
            )
            seen_dup = {(r["name"], r["type"]) for r in all_files_children}
            for child in db_files_children:
                key = (child["name"], child["type"])
                if key not in seen_dup:
                    seen_dup.add(key)
                    all_files_children.append(child)

        files_dir = {
            "name": "files",
            "type": "directory",
            "children": [_build_file_subtree(r) for r in all_files_children],
        }
        tree["children"].append(files_dir)

        for f in proj_files:
            if f["type"] == "file":
                path_parts = []
                current = f
                while current:
                    path_parts.insert(0, current["name"])
                    pid = current.get("parent_id")
                    current = node_map.get(pid) if pid else None
                files[f"{project_name}/files/{'/'.join(path_parts)}"] = f.get("content") or ""

    return {"tree": tree, "files": files}


async def _fetch_github_entries(owner: str, repo: str, branch: str, token: str, sync_path: str, project_name: str):
    """Fetch actual file listing from GitHub Git Trees API (recursive)."""
    url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, timeout=15)
        if resp.status_code != 200:
            return []
        data = resp.json()
        prefix = f"{sync_path.rstrip('/')}/{project_name}/"
        entries = []
        for entry in data.get("tree", []):
            if entry["type"] == "blob" and entry["path"].startswith(prefix):
                entries.append(entry["path"][len(prefix):])
        return entries
    except Exception:
        return []


def _ensure_path_in_tree(node: dict, parts: list):
    """Ensure the given path parts exist as nodes in the tree dict."""
    if not parts:
        return
    name = parts[0]
    children = node.setdefault("children", [])
    if len(parts) == 1:
        for child in children:
            if child["name"] == name:
                return
        children.append({"name": name, "type": "file"})
    else:
        found = None
        for child in children:
            if child["name"] == name and child["type"] == "directory":
                found = child
                break
        if not found:
            found = {"name": name, "type": "directory", "children": []}
            children.append(found)
        _ensure_path_in_tree(found, parts[1:])


async def _ensure_project_file_dir(project_id: str, dir_name: str) -> str:
    """Find or create a project_files directory for a phase name (descripcion, etc.).

    Returns the directory's id (parent_id for files inside it).
    """
    existing = await db.project_files.find_one({
        "project_id": project_id, "name": dir_name,
        "parent_id": None, "type": "directory",
    })
    if existing:
        return existing["id"]
    now = datetime.now(timezone.utc).isoformat()
    dir_id = str(uuid.uuid4())
    await db.project_files.insert_one({
        "id": dir_id, "project_id": project_id, "parent_id": None,
        "type": "directory", "name": dir_name, "content": "",
        "created_by": "system", "created_at": now, "updated_at": now,
    })
    return dir_id


def _merge_github_entries(tree: dict, files: dict, github_entries: list, project_name: str):
    """Add files from GitHub that are not already in the DB-built tree."""
    existing = set()
    prefix = f"{project_name}/"
    for path in files:
        if path.startswith(prefix):
            existing.add(path[len(prefix):])

    for entry in github_entries:
        if entry in existing:
            continue
        # Also skip entries whose content lives under files/ (project_files)
        if f"files/{entry}" in existing:
            continue
        parts = entry.split("/")
        _ensure_path_in_tree(tree, parts)
        # Don't put empty content — files that live only on GitHub
        # must be pulled first (github-pull) to get their content into
        # project_files.  The tree entry is still shown so the user knows
        # the file exists, but double-clicking won't open an empty editor.


@router.get("/projects/{project_id}/github-tree")
async def get_project_github_tree(project_id: str, request: Request):
    """Return the project file tree that would be pushed to GitHub.

    Also includes github_repo_url, branch, sync_path, and last_sync from the project.
    """
    user = await require_auth(request)

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_read_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    repo_url = project.get("github_repo_url")
    result = await _build_project_file_tree(project_id)

    # Merge actual GitHub repo files not represented in the DB tree
    if repo_url:
        try:
            owner, repo = _parse_github_url(repo_url)
            branch = project.get("github_default_branch", "main")
            sync_path = project.get("github_sync_path", "bpmn/")
            project_name = project["name"].replace(" ", "-").replace("/", "-").lower()
            token = await _resolve_pat(user.email, {})
            gh_entries = await _fetch_github_entries(owner, repo, branch, token, sync_path, project_name)
            _merge_github_entries(result["tree"], result["files"], gh_entries, project_name)
        except Exception:
            pass  # If GitHub fetch fails, still return the DB tree

    return {
        **result,
        "github_repo_url": repo_url or "",
        "github_default_branch": project.get("github_default_branch", "main"),
        "github_sync_path": project.get("github_sync_path", "bpmn/"),
        "github_last_sync": project.get("github_last_sync"),
    }


@router.get("/projects/{project_id}/github-link")
async def get_project_github_link(project_id: str, request: Request):
    """Return the GitHub link status for a project."""
    user = await require_auth(request)

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_read_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    repo_url = project.get("github_repo_url")
    if not repo_url:
        return {"linked": False, "github_repo_url": None, "github_default_branch": None, "github_sync_path": None}

    return {
        "linked": True,
        "github_repo_url": repo_url,
        "github_default_branch": project.get("github_default_branch", "main"),
        "github_sync_path": project.get("github_sync_path", "bpmn/"),
        "github_last_sync": project.get("github_last_sync"),
    }


@router.put("/projects/{project_id}/github-link")
async def link_project_github(project_id: str, request: Request):
    """Link a project to a GitHub repository.

    Accepts optional github_login + github_access_token so the user can connect
    their GitHub account directly from the project page without visiting
    My Permissions first.
    """
    user = await require_auth(request)
    body = await request.json()
    repo_url = body.get("repo_url", "").strip()
    branch = body.get("branch", "main")
    sync_path = body.get("sync_path", "bpmn/")
    github_login = body.get("github_login", "").strip()
    github_access_token = body.get("github_access_token", "").strip()

    if not repo_url:
        raise HTTPException(status_code=400, detail="repo_url is required")

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    created_by = project.get("created_by")
    is_system_project = created_by in _PUBLIC_OWNERS

    # System-owned (seed) projects: auto-claim ownership when linking GitHub,
    # so non-admin users can use them as their own. Admin users keep full access.
    if is_system_project and user.role != "admin":
        await db.projects.update_one(
            {"id": project_id},
            {"$set": {"created_by": user.email}}
        )
        logger.info(
            "GitHub link claimed system project: user=%s project=%s old_owner=%s",
            user.email, project_id, created_by,
        )
        project["created_by"] = user.email
    elif not is_system_project and not await can_write_resource_async(user, project, "project"):
        is_owner = can_write_resource(user, project)
        share_role = await get_share_role(user, "project", project_id) if not is_owner else None
        logger.warning(
            "GitHub link denied: user_email=%s user_id=%s project=%s created_by=%s "
            "is_owner=%s is_admin=%s share_role=%s",
            user.email, user.user_id, project_id, created_by,
            is_owner, user.role == "admin", share_role,
        )
        raise HTTPException(status_code=403, detail="Access denied")

    user_doc = await db.users.find_one({"email": user.email}, {"_id": 0, "github_access_token": 1})
    token = user_doc.get("github_access_token") if user_doc else None

    if not token and github_access_token:
        token = github_access_token
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": {
                "github_login": github_login,
                "github_access_token": github_access_token,
                "github_connected_at": datetime.now(timezone.utc).isoformat(),
            }}
        )
        logger.info("GitHub auto-connected during link: user=%s login=%s", user.email, github_login)

    if not token:
        logger.warning("GitHub link failed: user=%s project=%s — GitHub not connected", user.email, project_id)
        raise HTTPException(status_code=401, detail="GitHub not connected. Use PUT /api/auth/me/github first.")

    owner, repo_name = _parse_github_url(repo_url)
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    effective_branch = branch
    repo_private = body.get("repo_private", True)
    created = False

    async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo_name}?ref={branch}",
            headers=headers
        )
        if resp.status_code == 200:
            # Repo exists — proceed normally
            pass
        elif resp.status_code == 404:
            # Repo does not exist — auto-create it
            logger.info("GitHub repo not found, auto-creating: user=%s owner=%s repo=%s",
                        user.email, owner, repo_name)

            # Determine if owner is the authenticated user or an organization
            user_resp = await client.get("https://api.github.com/user", headers=headers)
            if user_resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Cannot verify GitHub identity. Check your token.")

            github_username = user_resp.json().get("login", "")

            if owner.lower() == github_username.lower():
                create_url = "https://api.github.com/user/repos"
            else:
                # Check if owner is an organization
                org_resp = await client.get(f"https://api.github.com/orgs/{owner}", headers=headers)
                if org_resp.status_code == 200:
                    # Verify membership
                    mem_resp = await client.get(
                        f"https://api.github.com/orgs/{owner}/memberships/{github_username}",
                        headers=headers
                    )
                    if mem_resp.status_code == 302:
                        raise HTTPException(
                            status_code=403,
                            detail=f"You have a pending invitation to '{owner}'. Accept the invitation before creating repositories."
                        )
                    if mem_resp.status_code != 200:
                        raise HTTPException(
                            status_code=403,
                            detail=f"You are not a member of the organization '{owner}'. Cannot create repos there."
                        )
                    create_url = f"https://api.github.com/orgs/{owner}/repos"
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Repository owner '{owner}' is not a recognized GitHub user or organization."
                    )

            create_payload = {
                "name": repo_name,
                "private": repo_private,
                "auto_init": True,
                "description": f"BPMN project: {project.get('name', project_id)}",
            }
            create_resp = await client.post(create_url, headers=headers, json=create_payload)

            if create_resp.status_code == 201:
                created_repo = create_resp.json()
                effective_branch = created_repo.get("default_branch", branch)
                created = True
                logger.info("GitHub repo auto-created: user=%s owner=%s repo=%s branch=%s private=%s",
                            user.email, owner, repo_name, effective_branch, repo_private)
            elif create_resp.status_code == 409:
                # Already exists (race condition) — re-fetch to get default branch
                logger.info("GitHub repo already exists (409 on create): owner=%s repo=%s", owner, repo_name)
                existing_resp = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo_name}",
                    headers=headers
                )
                if existing_resp.status_code == 200:
                    effective_branch = existing_resp.json().get("default_branch", branch)
                created = False
            elif create_resp.status_code == 403:
                raise HTTPException(
                    status_code=403,
                    detail="Your GitHub token does not have permission to create repositories. It needs the 'repo' scope."
                )
            elif create_resp.status_code == 422:
                error_detail = create_resp.json()
                error_msg = error_detail.get("errors", [{}])[0].get("message", "Validation failed")
                raise HTTPException(status_code=400, detail=f"Invalid repository: {error_msg}")
            else:
                logger.error("GitHub repo creation failed: user=%s owner=%s repo=%s status=%s body=%s",
                             user.email, owner, repo_name, create_resp.status_code, create_resp.text[:200])
                raise HTTPException(status_code=400, detail=f"Failed to create repository: {create_resp.status_code}")
        elif resp.status_code in (401, 403):
            raise HTTPException(status_code=401, detail="GitHub token lacks permission to access this repository.")
        else:
            logger.warning(
                "GitHub link failed: user=%s project=%s repo=%s/%s branch=%s — GitHub API returned %s: %s",
                user.email, project_id, owner, repo_name, branch, resp.status_code, resp.text[:200]
            )
            raise HTTPException(status_code=400, detail=f"Repository not accessible: {resp.status_code}")

    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "github_repo_url": repo_url,
            "github_default_branch": effective_branch,
            "github_sync_path": sync_path,
        }}
    )

    logger.info("GitHub linked: user=%s project=%s repo=%s/%s branch=%s created=%s",
                user.email, project_id, owner, repo_name, effective_branch, created)
    result = {
        "message": "Project linked to GitHub",
        "github_repo_url": repo_url,
        "github_default_branch": effective_branch,
        "github_sync_path": sync_path,
        "created": created,
    }
    if github_login:
        result["github_login"] = github_login
    return result


@router.delete("/projects/{project_id}/github-link")
async def unlink_project_github(project_id: str, request: Request):
    """Unlink a project from its GitHub repository."""
    user = await require_auth(request)

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_write_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    old_url = project.get("github_repo_url", "")
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"github_repo_url": None, "github_last_sync": None}}
    )

    logger.info("GitHub unlinked: user=%s project=%s repo=%s", user.email, project_id, old_url)
    return {"message": "Project unlinked from GitHub"}


@router.post("/projects/{project_id}/github-push")
async def push_project_github(project_id: str, request: Request):
    """Push the full project file tree to the linked GitHub repository.

    Syncs: README.md, metadata.json, descripcion/, requirements/, specification/,
    bpmn/ (all diagrams), and code/.
    """
    user = await require_auth(request)

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not can_write_resource(user, project):
        raise HTTPException(status_code=403, detail="Access denied")

    repo_url = project.get("github_repo_url")
    if not repo_url:
        raise HTTPException(status_code=400, detail="Project is not linked to a GitHub repository")

    owner, repo_name = _parse_github_url(repo_url)
    token = await _resolve_pat(user.email, {})
    branch = project.get("github_default_branch", "main")
    sync_path = project.get("github_sync_path", "bpmn/")

    logger.info("GitHub push start: user=%s project=%s repo=%s/%s branch=%s", user.email, project_id, owner, repo_name, branch)

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    tree_data = await _build_project_file_tree(project_id)
    files = tree_data["files"]
    project_name = tree_data["tree"]["name"]
    base_path = f"{sync_path}{project_name}"

    results = []
    async with httpx.AsyncClient() as client:
        for rel_path, content in sorted(files.items()):
            file_path = f"{sync_path}{rel_path}"  # already includes project_name/
            is_binary = rel_path.endswith(".bpmn") or rel_path.endswith(".xml")

            encoded = base64.b64encode(
                content.encode() if not is_binary else content.encode()
            ).decode()

            sha = None
            existing = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/contents/{file_path}?ref={branch}",
                headers=headers
            )
            if existing.status_code == 200:
                sha = existing.json().get("sha")

            file_stem = rel_path.replace(f"{project_name}/", "")
            payload = {
                "message": f"Sync {file_stem} from bpmnoo",
                "content": encoded,
                "branch": branch,
            }
            if sha:
                payload["sha"] = sha

            resp = await client.put(
                f"https://api.github.com/repos/{owner}/{repo_name}/contents/{file_path}",
                headers=headers,
                json=payload
            )

            if resp.status_code in (200, 201):
                results.append({"file": rel_path, "status": "pushed"})
            else:
                logger.error(
                    "GitHub push error: user=%s project=%s file=%s — GitHub API returned %s: %s",
                    user.email, project_id, rel_path, resp.status_code, resp.text[:200]
                )
                results.append({"file": rel_path, "status": "error", "detail": resp.text[:200]})

    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"github_last_sync": datetime.now(timezone.utc).isoformat()}}
    )

    pushed = sum(1 for r in results if r["status"] == "pushed")
    errors = sum(1 for r in results if r["status"] == "error")
    logger.info("GitHub push done: user=%s project=%s pushed=%s/%s errors=%s", user.email, project_id, pushed, len(results), errors)
    return {"message": f"Pushed {pushed}/{len(results)} files", "results": results}


@router.post("/projects/{project_id}/github-pull")
async def pull_project_github(project_id: str, request: Request):
    """Pull the full project file tree from the linked GitHub repository.

    Imports: metadata, .md files for each phase, .bpmn diagrams, and code SDD.
    Falls back to flat .bpmn-only pull if the project directory doesn't exist.
    """
    user = await require_auth(request)

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not can_write_resource(user, project):
        raise HTTPException(status_code=403, detail="Access denied")

    repo_url = project.get("github_repo_url")
    if not repo_url:
        raise HTTPException(status_code=400, detail="Project is not linked to a GitHub repository")

    owner, repo_name = _parse_github_url(repo_url)
    token = await _resolve_pat(user.email, {})
    branch = project.get("github_default_branch", "main")
    sync_path = project.get("github_sync_path", "bpmn/")

    logger.info("GitHub pull start: user=%s project=%s repo=%s/%s branch=%s", user.email, project_id, owner, repo_name, branch)

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    project_name = project["name"].replace(" ", "-").replace("/", "-").lower()
    tree_base_path = f"{sync_path}{project_name}"
    results = []

    async with httpx.AsyncClient() as client:
        # Try to list the project directory first
        dir_resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo_name}/contents/{tree_base_path}?ref={branch}",
            headers=headers
        )

        if dir_resp.status_code != 200:
            # Fallback: flat .bpmn pull from sync_path
            logger.info("GitHub pull: project dir not found in repo, trying flat .bpmn pull — user=%s project=%s sync_path=%s", user.email, project_id, sync_path)
            list_resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/contents/{sync_path}?ref={branch}",
                headers=headers
            )
            if list_resp.status_code != 200:
                logger.warning(
                    "GitHub pull failed: cannot list repo contents — user=%s project=%s sync_path=%s status=%s",
                    user.email, project_id, sync_path, list_resp.status_code
                )
                raise HTTPException(status_code=400, detail=f"Cannot list repo contents: {list_resp.status_code}")

            bpmn_files = [f for f in list_resp.json() if isinstance(f, dict) and f.get("name", "").endswith(".bpmn")]
            for bpmn_file in bpmn_files:
                file_resp = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo_name}/contents/{bpmn_file['path']}?ref={branch}",
                    headers=headers
                )
                if file_resp.status_code != 200:
                    logger.error(
                        "GitHub pull error: cannot fetch file — user=%s project=%s file=%s status=%s",
                        user.email, project_id, bpmn_file["name"], file_resp.status_code
                    )
                    results.append({"file": bpmn_file["name"], "status": "error"})
                    continue
                content = base64.b64decode(file_resp.json()["content"]).decode()
                diagram_name = bpmn_file["name"].replace(".bpmn", "").replace("_", " ")
                existing = await db.diagrams.find_one(
                    {"name": diagram_name, "id": {"$in": project.get("diagram_ids", [])}},
                    {"_id": 0}
                )
                if existing:
                    new_version = existing["current_version"] + 1
                    await db.versions.insert_one({
                        "id": str(uuid.uuid4()),
                        "diagram_id": existing["id"],
                        "version_number": new_version,
                        "xml_content": content,
                        "commit_message": f"Pulled from GitHub ({branch})",
                        "parent_version": existing["current_version"],
                        "tags": ["git-pull"],
                        "created_by": user.email,
                        "created_at": datetime.now(timezone.utc),
                    })
                    await db.diagrams.update_one(
                        {"id": existing["id"]},
                        {"$set": {"current_xml": content, "current_version": new_version, "updated_at": datetime.now(timezone.utc).isoformat()}}
                    )
                    results.append({"file": bpmn_file["name"], "status": "updated"})
                else:
                    # Auto-create diagram + link to project (flat mode)
                    diagram_id = str(uuid.uuid4())
                    now = datetime.now(timezone.utc).isoformat()
                    await db.diagrams.insert_one({
                        "id": diagram_id,
                        "name": diagram_name,
                        "description": f"Pulled from GitHub ({branch})",
                        "current_xml": content,
                        "current_version": 1,
                        "tags": ["git-pull"],
                        "created_by": user.email,
                        "created_at": now,
                        "updated_at": now,
                    })
                    await db.projects.update_one(
                        {"id": project_id},
                        {"$push": {"diagram_ids": diagram_id}}
                    )
                    await db.versions.insert_one({
                        "id": str(uuid.uuid4()),
                        "diagram_id": diagram_id,
                        "version_number": 1,
                        "xml_content": content,
                        "commit_message": f"Pulled from GitHub ({branch})",
                        "parent_version": None,
                        "tags": ["git-pull"],
                        "created_by": user.email,
                        "created_at": now,
                    })
                    results.append({"file": bpmn_file["name"], "status": "created", "diagram_id": diagram_id})

            await db.projects.update_one(
                {"id": project_id},
                {"$set": {"github_last_sync": datetime.now(timezone.utc).isoformat()}}
            )
            return {"message": f"Pulled {len(results)} files (flat mode)", "results": results}

        # Full tree pull: fetch all .bpmn files from bpmn/ subdirectory
        entries = dir_resp.json() if isinstance(dir_resp.json(), list) else []

        async def _fetch_dir_contents(path: str) -> list:
            r = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/contents/{path}?ref={branch}",
                headers=headers
            )
            if r.status_code == 200:
                data = r.json()
                return data if isinstance(data, list) else [data]
            return []

        for entry in entries:
            if entry.get("type") != "dir":
                continue
            dir_name = entry["name"]

            if dir_name == "bpmn":
                bpmn_entries = await _fetch_dir_contents(f"{tree_base_path}/bpmn")
                for f in bpmn_entries:
                    if not f.get("name", "").endswith(".bpmn"):
                        continue
                    file_resp = await client.get(
                        f"https://api.github.com/repos/{owner}/{repo_name}/contents/{f['path']}?ref={branch}",
                        headers=headers
                    )
                    if file_resp.status_code != 200:
                        logger.error(
                            "GitHub pull error: cannot fetch bpmn — user=%s project=%s file=%s status=%s",
                            user.email, project_id, f["name"], file_resp.status_code
                        )
                        results.append({"file": f["name"], "status": "error"})
                        continue
                    content = base64.b64decode(file_resp.json()["content"]).decode()
                    diagram_name = f["name"].replace(".bpmn", "").replace("_", " ")
                    existing = await db.diagrams.find_one(
                        {"name": diagram_name, "id": {"$in": project.get("diagram_ids", [])}},
                        {"_id": 0}
                    )
                    if existing:
                        new_version = existing["current_version"] + 1
                        await db.versions.insert_one({
                            "id": str(uuid.uuid4()),
                            "diagram_id": existing["id"],
                            "version_number": new_version,
                            "xml_content": content,
                            "commit_message": f"Pulled from GitHub ({branch})",
                            "parent_version": existing["current_version"],
                            "tags": ["git-pull"],
                            "created_by": user.email,
                            "created_at": datetime.now(timezone.utc),
                        })
                        await db.diagrams.update_one(
                            {"id": existing["id"]},
                            {"$set": {"current_xml": content, "current_version": new_version, "updated_at": datetime.now(timezone.utc).isoformat()}}
                        )
                        results.append({"file": f["name"], "status": "updated", "new_version": new_version})
                    else:
                        # Auto-create diagram + link to project
                        diagram_id = str(uuid.uuid4())
                        now = datetime.now(timezone.utc).isoformat()
                        await db.diagrams.insert_one({
                            "id": diagram_id,
                            "name": diagram_name,
                            "description": f"Pulled from GitHub ({branch})",
                            "current_xml": content,
                            "current_version": 1,
                            "tags": ["git-pull"],
                            "created_by": user.email,
                            "created_at": now,
                            "updated_at": now,
                        })
                        await db.projects.update_one(
                            {"id": project_id},
                            {"$push": {"diagram_ids": diagram_id}}
                        )
                        await db.versions.insert_one({
                            "id": str(uuid.uuid4()),
                            "diagram_id": diagram_id,
                            "version_number": 1,
                            "xml_content": content,
                            "commit_message": f"Pulled from GitHub ({branch})",
                            "parent_version": None,
                            "tags": ["git-pull"],
                            "created_by": user.email,
                            "created_at": now,
                        })
                        results.append({"file": f["name"], "status": "created", "diagram_id": diagram_id})

            elif dir_name == "files":
                # Recursively fetch and upsert all files under files/ into project_files
                async def _fetch_files_recursive(base_path):
                    entries = await _fetch_dir_contents(base_path)
                    result = []
                    for entry in entries:
                        if entry.get("type") == "file":
                            result.append(entry)
                        elif entry.get("type") == "dir":
                            sub = await _fetch_files_recursive(entry["path"])
                            result.extend(sub)
                    return result

                async def _ensure_parent_dirs(project_id, rel_path_parts):
                    """Walk directory chain, find/create dirs, return leaf parent_id."""
                    parent_id = await _ensure_project_file_dir(project_id, "files")
                    for i in range(len(rel_path_parts) - 1):
                        existing = await db.project_files.find_one({
                            "project_id": project_id, "parent_id": parent_id,
                            "name": rel_path_parts[i], "type": "directory",
                        })
                        if existing:
                            parent_id = existing["id"]
                        else:
                            now = datetime.now(timezone.utc).isoformat()
                            dir_id = str(uuid.uuid4())
                            await db.project_files.insert_one({
                                "id": dir_id, "project_id": project_id, "parent_id": parent_id,
                                "type": "directory", "name": rel_path_parts[i], "content": "",
                                "created_by": user.email, "created_at": now, "updated_at": now,
                            })
                            parent_id = dir_id
                    return parent_id

                all_files = await _fetch_files_recursive(tree_base_path + "/files")
                for f in all_files:
                    rel = f["path"]
                    if rel.startswith(tree_base_path + "/files/"):
                        rel = rel[len(tree_base_path + "/files/"):]
                    path_parts = [p for p in rel.split("/") if p]
                    if not path_parts:
                        continue
                    parent_id = await _ensure_parent_dirs(project_id, path_parts)
                    file_resp = await client.get(
                        f"https://api.github.com/repos/{owner}/{repo_name}/contents/{f['path']}?ref={branch}",
                        headers=headers
                    )
                    if file_resp.status_code != 200:
                        results.append({"file": path_parts[-1], "status": "error"})
                        continue
                    content = base64.b64decode(file_resp.json()["content"]).decode()
                    now = datetime.now(timezone.utc).isoformat()
                    existing_file = await db.project_files.find_one({
                        "project_id": project_id, "parent_id": parent_id,
                        "name": path_parts[-1], "type": "file",
                    })
                    if existing_file:
                        await db.project_files.update_one(
                            {"id": existing_file["id"]},
                            {"$set": {"content": content, "updated_at": now}},
                        )
                        results.append({"file": path_parts[-1], "status": "updated"})
                    else:
                        file_id = str(uuid.uuid4())
                        await db.project_files.insert_one({
                            "id": file_id, "project_id": project_id,
                            "parent_id": parent_id, "type": "file",
                            "name": path_parts[-1], "content": content,
                            "created_by": user.email, "created_at": now, "updated_at": now,
                        })
                        results.append({"file": path_parts[-1], "status": "created"})

    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"github_last_sync": datetime.now(timezone.utc).isoformat()}}
    )

    updated = sum(1 for r in results if r["status"] == "updated")
    logger.info("GitHub pull done: user=%s project=%s pulled=%s updated=%s", user.email, project_id, len(results), updated)
    return {"message": f"Pulled {len(results)} files", "results": results}

# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Project Files — user-managed file/folder tree within a project.

Files and directories are stored flat (parent_id references) in the
``project_files`` MongoDB collection.  The client builds the tree.
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from database import db
from models import ProjectFileNode, ProjectFileCreate, ProjectFileUpdate
from routers.audit import record_audit
from routers.auth import require_auth, can_read_resource_async, can_write_resource_async

router = APIRouter()
TEMPLATES = {
    "Descripción general": "## Descripción\n\n",
    "Objetivo": "## Objetivo\n\n",
    "Contexto": "## Contexto\n\n",
    "Requisitos funcionales": "## Requisitos Funcionales\n\n- \n- \n",
    "Requisitos no funcionales": "## Requisitos No Funcionales\n\n- \n- \n",
    "Criterios de aceptación": "## Criterios de Aceptación\n\n- [ ] \n- [ ] ",
    "BDD (Given/When/Then)": "**Given** \n**When** \n**Then** ",
    "Tabla de ejemplos": "| Escenario | Entrada | Esperado |\n| --- | --- | --- |\n| | | |",
}


def _node_to_dict(node: ProjectFileNode) -> dict:
    """Convert a Pydantic model instance to a plain dict for MongoDB."""
    d = node.model_dump(exclude_none=False)
    d["_id"] = d["id"]
    return d


def _doc_to_dict(doc: dict) -> dict:
    """Strip MongoDB _id before returning to client."""
    d = {k: v for k, v in doc.items() if k != "_id"}
    return d


async def _ensure_parent_path(project_id: str, parent_path: str, branch_id: Optional[str] = None) -> Optional[str]:
    """Walk path segments, creating project_file directory records as needed.

    Returns the id of the leaf directory, or None when parent_path is empty.
    """
    if not parent_path or not parent_path.strip():
        return None

    segments = [s for s in parent_path.strip("/").split("/") if s]
    if not segments:
        return None

    current_parent_id: Optional[str] = None

    for segment in segments:
        query = {
            "project_id": project_id,
            "name": segment,
            "type": "directory",
            "parent_id": current_parent_id,
        }
        existing = await db.project_files.find_one(query)
        if existing:
            current_parent_id = existing["id"]
        else:
            now = datetime.now(timezone.utc).isoformat()
            dir_id = str(uuid.uuid4())
            node = ProjectFileNode(
                id=dir_id,
                project_id=project_id,
                parent_id=current_parent_id,
                type="directory",
                name=segment,
                content="",
                template=None,
                branch_id=branch_id,
                created_by="system",
                created_at=now,
                updated_at=now,
            )
            await db.project_files.insert_one(_node_to_dict(node))
            current_parent_id = dir_id

    return current_parent_id


@router.get("/projects/{project_id}/files")
async def list_project_files(project_id: str, request: Request, branch_id: Optional[str] = None):
    """Return all files and directories for a project (flat list with parent_id).

    Optionally filtered by branch_id.  If no branch_id is given, uses the
    project's active branch.
    """
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_read_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    query: dict = {"project_id": project_id}
    effective_branch = branch_id or project.get("active_branch_id")
    if effective_branch:
        query["branch_id"] = effective_branch

    docs = await db.project_files.find(
        query,
        {"_id": 0},
    ).sort("name", 1).to_list(2000)

    return docs


@router.post("/projects/{project_id}/files")
async def create_project_file(project_id: str, body: ProjectFileCreate, request: Request):
    """Create a file or directory inside a project."""
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_write_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    if body.type not in ("file", "directory"):
        raise HTTPException(status_code=400, detail="type must be 'file' or 'directory'")

    # Resolve parent_path to parent_id when the parent is a GitHub-synced directory
    resolved_parent_id = body.parent_id
    branch_id: Optional[str] = None
    if body.parent_path and not body.parent_id:
        branch_id = project.get("active_branch_id")
        resolved_parent_id = await _ensure_parent_path(project_id, body.parent_path, branch_id)

    # Validate parent_id points to an existing directory
    if resolved_parent_id:
        parent = await db.project_files.find_one({"id": resolved_parent_id, "project_id": project_id})
        if not parent:
            raise HTTPException(status_code=400, detail="Parent folder not found")
        if parent["type"] != "directory":
            raise HTTPException(status_code=400, detail="Parent must be a directory")

    # Check for duplicate name in the same parent and branch
    dup_query: dict = {
        "project_id": project_id,
        "parent_id": resolved_parent_id,
        "name": body.name,
    }
    if auto_branch_id:
        dup_query["branch_id"] = auto_branch_id
    existing = await db.project_files.find_one(dup_query)
    if existing:
        raise HTTPException(status_code=409, detail="A file or folder with this name already exists in this location")

    content = body.content or ""
    if body.type == "file" and body.template and body.template in TEMPLATES:
        content = TEMPLATES[body.template]

    now = datetime.now(timezone.utc).isoformat()
    auto_branch_id = branch_id or project.get("active_branch_id")
    node = ProjectFileNode(
        id=str(uuid.uuid4()),
        project_id=project_id,
        parent_id=resolved_parent_id,
        type=body.type,
        name=body.name,
        content=content,
        template=body.template if body.type == "file" else None,
        branch_id=auto_branch_id,
        created_by=user.email,
        created_at=now,
        updated_at=now,
    )

    await db.project_files.insert_one(_node_to_dict(node))

    await record_audit(
        "project_files.create",
        actor_email=user.email,
        actor_user_id=user.user_id,
        actor_role=user.role,
        resource_type=body.type,
        resource_id=node.id,
        details={"name": body.name, "project_id": project_id, "parent_id": resolved_parent_id},
        request=request,
    )

    return _doc_to_dict(_node_to_dict(node))


@router.get("/projects/{project_id}/files/{file_id}")
async def get_project_file(project_id: str, file_id: str, request: Request):
    """Read a single file or directory."""
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_read_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    doc = await db.project_files.find_one({"id": file_id, "project_id": project_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    return doc


@router.put("/projects/{project_id}/files/{file_id}")
async def update_project_file(project_id: str, file_id: str, body: ProjectFileUpdate, request: Request):
    """Update file/folder name, content, or parent."""
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_write_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    doc = await db.project_files.find_one({"id": file_id, "project_id": project_id})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")

    updates = {}
    if body.name is not None:
        # Check for duplicate name in the same parent and branch
        parent_id = body.parent_id if body.parent_id is not None else doc.get("parent_id")
        dup_query: dict = {
            "project_id": project_id,
            "parent_id": parent_id,
            "name": body.name,
            "id": {"$ne": file_id},
        }
        branch = doc.get("branch_id")
        if branch:
            dup_query["branch_id"] = branch
        dup = await db.project_files.find_one(dup_query)
        if dup:
            raise HTTPException(status_code=409, detail="A file or folder with this name already exists in this location")
        updates["name"] = body.name
    if body.content is not None:
        updates["content"] = body.content
    if body.parent_id is not None:
        # Validate target parent exists and is a directory
        if body.parent_id:
            parent = await db.project_files.find_one({"id": body.parent_id, "project_id": project_id})
            if not parent:
                raise HTTPException(status_code=400, detail="Target parent folder not found")
            if parent["type"] != "directory":
                raise HTTPException(status_code=400, detail="Target parent must be a directory")

        # Prevent moving a directory into itself or its descendants
        if doc["type"] == "directory" and body.parent_id:
            if body.parent_id == file_id:
                raise HTTPException(status_code=400, detail="Cannot move a directory into itself")
            # Check that parent_id is not a descendant
            descendant_ids = await _get_descendant_ids(project_id, file_id)
            if body.parent_id in descendant_ids:
                raise HTTPException(status_code=400, detail="Cannot move a directory into its own descendant")
        updates["parent_id"] = body.parent_id

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.project_files.update_one({"id": file_id}, {"$set": updates})
        await record_audit(
            "project_files.update",
            actor_email=user.email,
            actor_user_id=user.user_id,
            actor_role=user.role,
            resource_type=doc["type"],
            resource_id=file_id,
            details={"name": doc["name"], "project_id": project_id, "changed_fields": list(updates.keys())},
            request=request,
        )

    updated = await db.project_files.find_one({"id": file_id}, {"_id": 0})
    return updated


@router.delete("/projects/{project_id}/files/{file_id}")
async def delete_project_file(project_id: str, file_id: str, request: Request):
    """Delete a file or directory.  Directories are deleted recursively."""
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_write_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    doc = await db.project_files.find_one({"id": file_id, "project_id": project_id})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")

    ids_to_delete = [file_id]
    if doc["type"] == "directory":
        ids_to_delete.extend(await _get_descendant_ids(project_id, file_id))

    count = len(ids_to_delete)
    await db.project_files.delete_many({"id": {"$in": ids_to_delete}})

    await record_audit(
        "project_files.delete",
        actor_email=user.email,
        actor_user_id=user.get("id"),
        actor_role=user.get("role", ""),
        resource_type=doc["type"],
        resource_id=file_id,
        details={"name": doc["name"], "project_id": project_id, "descendants_deleted": count - 1},
        request=request,
    )

    return {"deleted": True, "count": count}


async def _get_descendant_ids(project_id: str, parent_id: str) -> list:
    """Recursively collect all descendant ids of a directory."""
    result = []
    queue = [parent_id]
    while queue:
        pid = queue.pop(0)
        children = await db.project_files.find(
            {"project_id": project_id, "parent_id": pid},
            {"_id": 0, "id": 1, "type": 1},
        ).to_list(1000)
        for child in children:
            result.append(child["id"])
            if child["type"] == "directory":
                queue.append(child["id"])
    return result


async def _get_descendant_md_files(project_id: str, parent_id: str) -> list:
    """Recursively collect all descendant .md file documents of a directory."""
    result = []
    queue = [parent_id]
    while queue:
        pid = queue.pop(0)
        children = await db.project_files.find(
            {"project_id": project_id, "parent_id": pid},
            {"_id": 0},
        ).to_list(1000)
        for child in children:
            if child["type"] == "directory":
                queue.append(child["id"])
            elif child["type"] == "file" and child.get("name", "").lower().endswith(".md"):
                result.append(child)
    return result


@router.get("/projects/{project_id}/descripcion-md-files")
async def list_descripcion_md_files(project_id: str, request: Request):
    """Return .md files under the 'descripcion' directory, or root-level .md files.

    Looks for a project_files directory named 'descripcion' (case-insensitive).
    If found, returns all descendant .md files recursively.
    If not found, falls back to root-level .md files (parent_id is null).
    """
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await can_read_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    # Try to find a "descripcion" directory at any level (scoped to active branch)
    branch_id = project.get("active_branch_id")
    desc_query: dict = {
        "project_id": project_id,
        "type": "directory",
        "name": {"$regex": "^descripcion$", "$options": "i"},
    }
    if branch_id:
        desc_query["branch_id"] = branch_id
    desc_dir = await db.project_files.find_one(
        desc_query,
        {"_id": 0, "id": 1},
    )

    if desc_dir:
        files = await _get_descendant_md_files(project_id, desc_dir["id"])
    else:
        # Fallback: root-level .md files (scoped to active branch)
        fallback_query: dict = {
            "project_id": project_id,
            "parent_id": None,
            "type": "file",
            "name": {"$regex": r"\.md$", "$options": "i"},
        }
        if branch_id:
            fallback_query["branch_id"] = branch_id
        cursor = db.project_files.find(
            fallback_query,
            {"_id": 0},
        ).sort("name", 1)
        files = await cursor.to_list(500)

    # Sort by name
    files.sort(key=lambda f: f.get("name", ""))

    return files

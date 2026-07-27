# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Project Branching — git-like branches for project versioning.

Each project can have multiple named branches.  Creating a branch from a parent
deep-copies all project_files from the parent and reference-copies diagram/spec
membership.  The active branch is tracked via ``project.active_branch_id`` and
switching branches updates ``project.diagram_ids`` atomically.
"""

from fastapi import APIRouter, HTTPException, Request, Query
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from database import db, logger
from models import (
    ProjectBranch, CreateBranchRequest, SwitchBranchRequest, BranchStateResponse,
    MergeExecuteRequest,
    # Re-export deprecated models for migration compatibility
    ProjectBaseline, ProjectVersion, CreateProjectVersionRequest,
    ToggleVersionRequest, ProjectStateResponse,
)
from routers.audit import record_audit
from routers.auth import require_auth

router = APIRouter()


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _strip_mongo(doc: dict) -> dict:
    return {k: v for k, v in doc.items() if k != "_id"}


def _safe_get_id(doc: dict, doc_type: str = "document") -> str:
    """Safely extract 'id' field from MongoDB document.

    Args:
        doc: MongoDB document dictionary
        doc_type: Document type description for error messages

    Returns:
        Document ID

    Raises:
        ValueError: If document is missing 'id' field
    """
    if "id" not in doc or not doc["id"]:
        logger.error(f"{doc_type} missing 'id' field: {doc}")
        raise ValueError(f"{doc_type} missing required 'id' field")
    return doc["id"]


async def _get_active_branch_id(project_id: str) -> Optional[str]:
    """Return the active branch id for a project, or None."""
    project = await db.projects.find_one(
        {"id": project_id}, {"active_branch_id": 1, "default_branch_id": 1}
    )
    if not project:
        return None
    return project.get("active_branch_id") or project.get("default_branch_id")


# ---------------------------------------------------------------------------
# branch CRUD
# ---------------------------------------------------------------------------

@router.get("/projects/{project_id}/branches")
async def list_branches(project_id: str, request: Request):
    """List all branches for a project, marking the active one."""
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    active_id = project.get("active_branch_id")
    default_id = project.get("default_branch_id")

    raw = await db.project_versions.find(
        {"project_id": project_id, "file_ids": {"$exists": True}}
    ).sort("created_at", -1).to_list(None)

    result = []
    for v in raw:
        d = _strip_mongo(v)
        d["active"] = d["id"] == active_id
        d["is_default"] = d.get("is_default", d["id"] == default_id)
        result.append(d)

    # If no branches exist yet, return empty (no auto-creation)
    return result


@router.post("/projects/{project_id}/branches")
async def create_branch(
    project_id: str,
    body: CreateBranchRequest,
    request: Request,
):
    """Create a new branch from a parent branch.

    Deep-copies all project_files from the parent (new IDs) and
    reference-copies diagram_ids, spec_ids from the parent.
    If no parent_branch_id is given, uses the project's active or default branch.
    """
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
    # 1) Resolve parent branch
        parent = None
        parent_id = body.parent_branch_id
        if parent_id:
            parent = await db.project_versions.find_one(
                {"id": parent_id, "project_id": project_id}
            )
            if not parent:
                raise HTTPException(status_code=404, detail="Parent branch not found")
        else:
            # No parent specified — try to find an existing branch to fork from
            parent = await db.project_versions.find_one(
                {"project_id": project_id, "file_ids": {"$exists": True}},
                sort=[("created_at", -1)],
            )
            if parent:
                parent_id = parent["id"]
            # else: first branch ever — no parent
    
        # 2) Check branch name uniqueness within project
        existing = await db.project_versions.find_one({
            "project_id": project_id,
            "name": body.name,
            "file_ids": {"$exists": True},
        })
        if existing:
            raise HTTPException(
                status_code=409,
                detail="A branch with this name already exists in the project",
            )
    
        # 3) Determine if this is the first branch
        any_branch = await db.project_versions.find_one({
            "project_id": project_id, "file_ids": {"$exists": True},
        })
        is_first_branch = not any_branch
    
        # 4) Create the branch document
        branch = ProjectBranch(
            project_id=project_id,
            name=body.name,
            parent_branch_id=parent_id,
            description=body.description or "",
            is_default=is_first_branch,
            created_by=user.email,
        )
    
        now = _now_iso()
        new_file_ids: List[str] = []
        new_diagram_ids: List[str] = []
        new_spec_ids: List[str] = []
        new_code_ids: List[str] = []
    
        if parent:
            # 5a) Deep-copy project_files from parent
            parent_files = await db.project_files.find({
                "project_id": project_id,
                "$or": [
                    {"branch_id": parent["id"]},
                    {"branch_id": {"$exists": False}},  # unassigned files
                ],
            }).to_list(None)
    
            for pf in parent_files:
                old_id = _safe_get_id(pf, "project_files")
                new_id = str(uuid.uuid4())
                new_file = {
                    k: v for k, v in pf.items()
                    if k not in ("_id",)
                }
                new_file["id"] = new_id
                new_file["_id"] = new_id
                new_file["branch_id"] = branch.id
                new_file["created_at"] = now
                new_file["updated_at"] = now
                await db.project_files.insert_one(new_file)
                new_file_ids.append(new_id)
    
            # 5b) Reference-copy diagrams/specs/code from parent
            new_diagram_ids = list(parent.get("diagram_ids", []))
            new_spec_ids = list(parent.get("spec_ids", []))
            new_code_ids = list(parent.get("code_snapshot_ids", []))
        else:
            # First branch with no parent: collect existing project resources
            existing_files = await db.project_files.find({
                "project_id": project_id,
                "$or": [
                    {"branch_id": {"$exists": False}},
                    {"branch_id": None},
                ],
            }).to_list(None)
    
            for pf in existing_files:
                new_file_ids.append(_safe_get_id(pf, "project_files"))
                await db.project_files.update_one(
                    {"id": pf["id"]},
                    {"$set": {"branch_id": branch.id, "updated_at": now}},
                )
    
            new_diagram_ids = list(project.get("diagram_ids") or [])
            # Collect existing spec IDs for this project
            specs = await db.specifications.find(
                {"project_id": project_id}, {"id": 1}
            ).to_list(200)
            new_spec_ids = [_safe_get_id(s, "specifications") for s in specs]
    
            # Collect code generations
            code_gens = await db.code_generations.find(
                {"project_id": project_id}, {"id": 1}
            ).sort("created_at", -1).to_list(10)
            new_code_ids = [_safe_get_id(c, "code_generations") for c in code_gens]
    
        # 6) Update branch with resource IDs
        branch.file_ids = new_file_ids
        branch.diagram_ids = new_diagram_ids
        branch.spec_ids = new_spec_ids
        branch.code_snapshot_ids = new_code_ids
        branch.impact_summary = {
            "files_count": len(new_file_ids),
            "diagrams_count": len(new_diagram_ids),
            "specs_count": len(new_spec_ids),
            "code_count": len(new_code_ids),
        }
    
        doc = branch.model_dump()
        doc["_id"] = doc["id"]
        await db.project_versions.insert_one(doc)
    
        # 7) Set as active and (if first) default branch
        set_fields = {
            "active_branch_id": branch.id,
            "updated_at": now,
        }
        if is_first_branch:
            set_fields["default_branch_id"] = branch.id
        await db.projects.update_one(
            {"id": project_id},
            {"$set": set_fields},
        )
    
        # 8) Audit trail
        await record_audit(
            "project.branch.create",
            actor_email=user.email,
            actor_user_id=user.user_id,
            actor_role=user.role,
            resource_type="project_branch",
            resource_id=branch.id,
            details={
                "project_id": project_id,
                "branch_name": body.name,
                "parent_branch_id": parent_id,
                "files_copied": len(new_file_ids),
            },
            request=request,
        )
    
        logger.info("Created branch '%s' (%s) for project %s — %d files",
                    body.name, branch.id, project_id, len(new_file_ids))
    
        result = _strip_mongo(doc)
        result["active"] = True
        return result
    except HTTPException:
        raise
    except ValueError as e:
        # Data validation errors
        logger.error(f"Validation error creating branch: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except KeyError as e:
        # Missing field errors
        logger.error(f"Missing field error creating branch: {e}")
        raise HTTPException(status_code=500, detail="Internal error: required field missing")
    except Exception as e:
        # Unexpected errors
        logger.error(f"Unexpected error creating branch: {e}")
        raise HTTPException(status_code=500, detail="Internal error creating branch")


@router.get("/projects/{project_id}/branches/{branch_id}")
async def get_branch(project_id: str, branch_id: str, request: Request):
    """Get a single branch by id."""
    await require_auth(request)
    v = await db.project_versions.find_one({
        "id": branch_id, "project_id": project_id, "file_ids": {"$exists": True},
    })
    if not v:
        raise HTTPException(status_code=404, detail="Branch not found")

    project = await db.projects.find_one({"id": project_id}, {"active_branch_id": 1})
    active_id = (project or {}).get("active_branch_id")
    result = _strip_mongo(v)
    result["active"] = branch_id == active_id
    return result


@router.post("/projects/{project_id}/branches/{branch_id}/switch")
async def switch_branch(
    project_id: str,
    branch_id: str,
    request: Request,
):
    """Switch the active branch for a project.

    Updates project.active_branch_id and project.diagram_ids atomically.
    """
    user = await require_auth(request)

    branch = await db.project_versions.find_one({
        "id": branch_id, "project_id": project_id, "file_ids": {"$exists": True},
    })
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    old_branch_id = project.get("active_branch_id")
    if old_branch_id == branch_id:
        return {"ok": True, "message": "Already on this branch", "branch_id": branch_id}

    now = _now_iso()

    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "active_branch_id": branch_id,
            "diagram_ids": branch.get("diagram_ids", []),
            "updated_at": now,
        }},
    )

    await record_audit(
        "project.branch.switch",
        actor_email=user.email,
        actor_user_id=user.user_id,
        actor_role=user.role,
        resource_type="project_branch",
        resource_id=branch_id,
        details={
            "project_id": project_id,
            "from_branch_id": old_branch_id,
            "to_branch_id": branch_id,
            "to_branch_name": branch.get("name"),
        },
        request=request,
    )

    logger.info("Switched project %s to branch '%s' (%s)",
                project_id, branch.get("name"), branch_id)

    return {
        "ok": True,
        "branch_id": branch_id,
        "branch_name": branch.get("name"),
        "diagram_count": len(branch.get("diagram_ids", [])),
    }


@router.delete("/projects/{project_id}/branches/{branch_id}")
async def delete_branch(project_id: str, branch_id: str, request: Request):
    """Delete a branch and all its project_files.

    Cannot delete the active branch or the default branch.
    Cannot delete the last remaining branch.
    """
    user = await require_auth(request)

    branch = await db.project_versions.find_one({
        "id": branch_id, "project_id": project_id, "file_ids": {"$exists": True},
    })
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Safety checks
    if branch.get("is_default") or branch_id == project.get("default_branch_id"):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the default branch. Set another branch as default first.",
        )

    if branch_id == project.get("active_branch_id"):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the active branch. Switch to another branch first.",
        )

    # Count remaining branches
    total = await db.project_versions.count_documents({
        "project_id": project_id, "file_ids": {"$exists": True},
    })
    if total <= 1:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the last remaining branch.",
        )

    # Delete all project_files belonging to this branch
    file_count = await db.project_files.count_documents({
        "project_id": project_id, "branch_id": branch_id,
    })
    await db.project_files.delete_many({
        "project_id": project_id, "branch_id": branch_id,
    })

    # Delete the branch document
    await db.project_versions.delete_one({"id": branch_id})

    await record_audit(
        "project.branch.delete",
        actor_email=user.email,
        actor_user_id=user.user_id,
        actor_role=user.role,
        resource_type="project_branch",
        resource_id=branch_id,
        details={
            "project_id": project_id,
            "branch_name": branch.get("name"),
            "files_deleted": file_count,
        },
        request=request,
    )

    logger.info("Deleted branch '%s' (%s) for project %s — %d files removed",
                branch.get("name"), branch_id, project_id, file_count)

    return {"ok": True, "deleted_files": file_count}


@router.get("/projects/{project_id}/state")
async def get_branch_state(project_id: str, request: Request):
    """Summary of the current branch state for a project."""
    await require_auth(request)

    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    active_id = project.get("active_branch_id")
    default_id = project.get("default_branch_id")

    total = await db.project_versions.count_documents({
        "project_id": project_id, "file_ids": {"$exists": True},
    })

    branches = []
    if active_id:
        raw = await db.project_versions.find({
            "project_id": project_id, "file_ids": {"$exists": True},
        }).sort("created_at", -1).to_list(None)
        branches = [_strip_mongo(v) for v in raw]
        for b in branches:
            b["active"] = b["id"] == active_id

    active_name = None
    if active_id:
        active_br = await db.project_versions.find_one({"id": active_id})
        if active_br:
            active_name = active_br.get("name")

    return BranchStateResponse(
        active_branch_id=active_id,
        active_branch_name=active_name,
        default_branch_id=default_id,
        branch_count=total,
        branches=branches,
    ).model_dump()


@router.get("/projects/{project_id}/branches/{branch_id}/impact")
async def get_branch_impact(project_id: str, branch_id: str, request: Request):
    """Return impact analysis for a specific branch."""
    await require_auth(request)

    v = await db.project_versions.find_one({
        "id": branch_id, "project_id": project_id, "file_ids": {"$exists": True},
    })
    if not v:
        raise HTTPException(status_code=404, detail="Branch not found")

    # Find child branches (branches that forked from this one)
    children = await db.project_versions.find({
        "project_id": project_id,
        "parent_branch_id": branch_id,
        "file_ids": {"$exists": True},
    }, {"id": 1, "name": 1, "impact_summary": 1, "created_at": 1},
    ).to_list(None)

    return {
        "branch": _strip_mongo(v),
        "impact_summary": v.get("impact_summary", {}),
        "file_ids": v.get("file_ids", []),
        "diagram_ids": v.get("diagram_ids", []),
        "spec_ids": v.get("spec_ids", []),
        "code_snapshot_ids": v.get("code_snapshot_ids", []),
        "child_branches": [_strip_mongo(c) for c in children],
    }


@router.get("/projects/{project_id}/branches/compare")
async def compare_branches(
    project_id: str,
    b1: str = Query(..., description="First branch ID"),
    b2: str = Query(..., description="Second branch ID"),
    request: Request = None,
):
    """Compare two branches — returns the diff of their resource membership."""
    await require_auth(request)

    br1 = await db.project_versions.find_one({
        "id": b1, "project_id": project_id, "file_ids": {"$exists": True},
    })
    br2 = await db.project_versions.find_one({
        "id": b2, "project_id": project_id, "file_ids": {"$exists": True},
    })
    if not br1 or not br2:
        raise HTTPException(status_code=404, detail="One or both branches not found")

    f1 = set(br1.get("file_ids", []))
    f2 = set(br2.get("file_ids", []))
    d1 = set(br1.get("diagram_ids", []))
    d2 = set(br2.get("diagram_ids", []))
    s1 = set(br1.get("spec_ids", []))
    s2 = set(br2.get("spec_ids", []))

    # Get actual file names for display
    file_names: dict[str, str] = {}
    all_file_ids = f1 | f2
    if all_file_ids:
        files = await db.project_files.find({
            "project_id": project_id,
            "id": {"$in": list(all_file_ids)},
        }, {"id": 1, "name": 1, "type": 1}).to_list(None)
        file_names = {f["id"]: f"{f.get('name','?')} ({f.get('type','?')})" for f in files}

    return {
        "b1": {"id": b1, "name": br1.get("name")},
        "b2": {"id": b2, "name": br2.get("name")},
        "files_only_in_b1": [
            {"id": fid, "name": file_names.get(fid, "?")} for fid in (f1 - f2)
        ],
        "files_only_in_b2": [
            {"id": fid, "name": file_names.get(fid, "?")} for fid in (f2 - f1)
        ],
        "files_in_both": [
            {"id": fid, "name": file_names.get(fid, "?")} for fid in (f1 & f2)
        ],
        "diagrams_only_in_b1": list(d1 - d2),
        "diagrams_only_in_b2": list(d2 - d1),
        "diagrams_in_both": list(d1 & d2),
        "specs_only_in_b1": list(s1 - s2),
        "specs_only_in_b2": list(s2 - s1),
        "specs_in_both": list(s1 & s2),
    }


# ---------------------------------------------------------------------------
# merge
# ---------------------------------------------------------------------------

@router.post("/projects/{project_id}/branches/{branch_id}/merge-preview")
async def merge_preview(
    project_id: str,
    branch_id: str,
    request: Request,
):
    """Preview what would happen when merging a branch into the active branch.

    Compares files by (name, parent_id) and returns files to add,
    files in conflict (same name+parent, different content), and
    diagram/spec diffs.
    """
    user = await require_auth(request)

    try:
        # 1) Fetch source branch
        source = await db.project_versions.find_one({
            "id": branch_id, "project_id": project_id, "file_ids": {"$exists": True},
        })
        if not source:
            raise HTTPException(status_code=404, detail="Source branch not found")
        if source.get("status") == "merged":
            raise HTTPException(status_code=400, detail="Branch is already merged")

        # 2) Get target (active) branch
        target_id = await _get_active_branch_id(project_id)
        if not target_id:
            raise HTTPException(status_code=400, detail="No active branch to merge into")
        target = await db.project_versions.find_one({
            "id": target_id, "project_id": project_id, "file_ids": {"$exists": True},
        })
        if not target:
            raise HTTPException(status_code=400, detail="Target branch not found")
        if source["id"] == target["id"]:
            raise HTTPException(status_code=400, detail="Cannot merge a branch into itself")

        # 3) Fetch all files for both branches
        all_files = await db.project_files.find({
            "project_id": project_id,
            "branch_id": {"$in": [source["id"], target["id"]]},
        }).to_list(5000)

        source_files = [f for f in all_files if f.get("branch_id") == source["id"]]
        target_files = [f for f in all_files if f.get("branch_id") == target["id"]]

        def _file_key(f: dict) -> str:
            pid = f.get("parent_id") or ""
            return f"{f.get('name','')}||{pid}"

        # Build maps keyed by (name, parent_id)
        source_map: dict[str, dict] = {_file_key(f): f for f in source_files}
        target_map: dict[str, dict] = {_file_key(f): f for f in target_files}

        source_keys = set(source_map.keys())
        target_keys = set(target_map.keys())

        files_to_add: list[dict] = []
        files_unchanged: list[dict] = []
        files_conflict: list[dict] = []

        # Files only in source → add
        for key in source_keys - target_keys:
            f = source_map[key]
            files_to_add.append({
                "id": f["id"],
                "name": f.get("name", "?"),
                "type": f.get("type", "file"),
                "parent_id": f.get("parent_id"),
            })

        # Files in both
        for key in source_keys & target_keys:
            sf = source_map[key]
            tf = target_map[key]
            if sf.get("content") == tf.get("content"):
                files_unchanged.append({
                    "id": sf["id"],
                    "name": sf.get("name", "?"),
                    "type": sf.get("type", "file"),
                })
            else:
                files_conflict.append({
                    "name": sf.get("name", "?"),
                    "source_id": sf["id"],
                    "target_id": tf["id"],
                    "source_content": sf.get("content", ""),
                    "target_content": tf.get("content", ""),
                    "parent_id": sf.get("parent_id"),
                })

        # Files only in target → unchanged
        for key in target_keys - source_keys:
            f = target_map[key]
            files_unchanged.append({
                "id": f["id"],
                "name": f.get("name", "?"),
                "type": f.get("type", "file"),
            })

        # 4) Diagram / spec diffs
        sd1 = set(source.get("diagram_ids", []))
        sd2 = set(target.get("diagram_ids", []))
        ss1 = set(source.get("spec_ids", []))
        ss2 = set(target.get("spec_ids", []))

        return {
            "source_branch": {"id": source["id"], "name": source.get("name")},
            "target_branch": {"id": target["id"], "name": target.get("name")},
            "files_to_add": files_to_add,
            "files_unchanged": files_unchanged,
            "files_conflict": files_conflict,
            "diagrams_to_add": list(sd1 - sd2),
            "diagrams_in_both": list(sd1 & sd2),
            "specs_to_add": list(ss1 - ss2),
            "specs_in_both": list(ss1 & ss2),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Merge preview error: {e}")
        raise HTTPException(status_code=500, detail="Internal error building merge preview")


@router.post("/projects/{project_id}/branches/{branch_id}/merge")
async def execute_merge(
    project_id: str,
    branch_id: str,
    body: MergeExecuteRequest,
    request: Request,
):
    """Merge a branch into the active branch.

    Copies source-only files to the target branch, merges diagram/spec
    membership, and marks the source branch as merged.
    """
    user = await require_auth(request)

    try:
        # 1) Validate source branch
        source = await db.project_versions.find_one({
            "id": branch_id, "project_id": project_id, "file_ids": {"$exists": True},
        })
        if not source:
            raise HTTPException(status_code=404, detail="Source branch not found")
        if source.get("status") == "merged":
            raise HTTPException(status_code=400, detail="Branch is already merged")

        # 2) Validate target (active) branch
        target_id = await _get_active_branch_id(project_id)
        if not target_id:
            raise HTTPException(status_code=400, detail="No active branch to merge into")
        target = await db.project_versions.find_one({
            "id": target_id, "project_id": project_id, "file_ids": {"$exists": True},
        })
        if not target:
            raise HTTPException(status_code=400, detail="Target branch not found")
        if source["id"] == target["id"]:
            raise HTTPException(status_code=400, detail="Cannot merge a branch into itself")

        now = _now_iso()

        # 3) Build resolution map from request body
        resolution_map: dict[str, str] = {}
        for item in body.resolved_files:
            fid = item.get("file_id")
            res = item.get("resolution", "target")
            if fid and res in ("source", "target"):
                resolution_map[fid] = res

        # 4) Fetch source and target files
        all_files = await db.project_files.find({
            "project_id": project_id,
            "branch_id": {"$in": [source["id"], target["id"]]},
        }).to_list(5000)

        source_files = [f for f in all_files if f.get("branch_id") == source["id"]]
        target_files = [f for f in all_files if f.get("branch_id") == target["id"]]

        def _file_key(f: dict) -> str:
            pid = f.get("parent_id") or ""
            return f"{f.get('name','')}||{pid}"

        target_map: dict[str, dict] = {_file_key(f): f for f in target_files}

        # 5) Copy files to target branch (two-pass: directories first)
        new_file_ids: list[str] = []
        parent_id_map: dict[str, str] = {}  # old_source_parent_id -> new_target_parent_id

        # Helper: decide whether to copy a file
        def _should_copy(sf: dict) -> bool:
            key = _file_key(sf)
            if key not in target_map:
                return True  # source-only file
            if resolution_map.get(sf["id"]) == "source":
                return True  # user chose source version for conflict
            return False

        # Pass 1: directories first (so parent_id_map is populated before children)
        for sf in source_files:
            if sf.get("type") != "directory":
                continue
            if not _should_copy(sf):
                continue
            new_id = str(uuid.uuid4())
            new_file = {k: v for k, v in sf.items() if k not in ("_id",)}
            new_file["id"] = new_id
            new_file["_id"] = new_id
            new_file["branch_id"] = target["id"]
            new_file["created_at"] = now
            new_file["updated_at"] = now
            # Remap parent_id if the parent directory was also copied
            old_parent = sf.get("parent_id")
            if old_parent and old_parent in parent_id_map:
                new_file["parent_id"] = parent_id_map[old_parent]
            await db.project_files.insert_one(new_file)
            new_file_ids.append(new_id)
            parent_id_map[sf["id"]] = new_id

        # Pass 2: files
        for sf in source_files:
            if sf.get("type") == "directory":
                continue
            if not _should_copy(sf):
                continue
            new_id = str(uuid.uuid4())
            new_file = {k: v for k, v in sf.items() if k not in ("_id",)}
            new_file["id"] = new_id
            new_file["_id"] = new_id
            new_file["branch_id"] = target["id"]
            new_file["created_at"] = now
            new_file["updated_at"] = now
            # Remap parent_id to the copied parent directory
            old_parent = sf.get("parent_id")
            if old_parent and old_parent in parent_id_map:
                new_file["parent_id"] = parent_id_map[old_parent]
            await db.project_files.insert_one(new_file)
            new_file_ids.append(new_id)

        # 6) Merge resource membership
        diagram_union = list(set(source.get("diagram_ids", [])) | set(target.get("diagram_ids", [])))
        spec_union = list(set(source.get("spec_ids", [])) | set(target.get("spec_ids", [])))
        code_union = list(set(source.get("code_snapshot_ids", [])) | set(target.get("code_snapshot_ids", [])))

        # 7) Update target branch
        await db.project_versions.update_one(
            {"id": target["id"]},
            {
                "$set": {
                    "diagram_ids": diagram_union,
                    "spec_ids": spec_union,
                    "code_snapshot_ids": code_union,
                    "impact_summary": {
                        "files_count": len(target.get("file_ids", [])) + len(new_file_ids),
                        "diagrams_count": len(diagram_union),
                        "specs_count": len(spec_union),
                        "code_count": len(code_union),
                    },
                    "updated_at": now,
                },
                "$push": {"file_ids": {"$each": new_file_ids}},
            },
        )

        # 8) Mark source as merged
        await db.project_versions.update_one(
            {"id": source["id"]},
            {"$set": {
                "status": "merged",
                "merged_into": target["id"],
                "updated_at": now,
            }},
        )

        # 9) Audit
        await record_audit(
            "project.branch.merge",
            actor_email=user.email,
            actor_user_id=user.user_id,
            actor_role=user.role,
            resource_type="project_branch",
            resource_id=source["id"],
            details={
                "project_id": project_id,
                "source_branch_name": source.get("name"),
                "target_branch_id": target["id"],
                "target_branch_name": target.get("name"),
                "files_copied": len(new_file_ids),
                "diagrams_merged": len(diagram_union),
                "specs_merged": len(spec_union),
            },
            request=request,
        )

        logger.info("Merged branch '%s' (%s) into '%s' (%s) — %d files, %d diagrams, %d specs",
                    source.get("name"), source["id"], target.get("name"), target["id"],
                    len(new_file_ids), len(diagram_union), len(spec_union))

        return {
            "ok": True,
            "source_branch_id": source["id"],
            "target_branch_id": target["id"],
            "files_copied": len(new_file_ids),
            "diagrams_merged": len(diagram_union),
            "specs_merged": len(spec_union),
            "message": f"Merged '{source.get('name')}' into '{target.get('name')}'",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Merge execution error: {e}")
        raise HTTPException(status_code=500, detail="Internal error executing merge")


# ===================================================================
# DEPRECATED — legacy endpoints kept for migration compatibility
# These redirect to the new branch-based system.
# ===================================================================

@router.get("/projects/{project_id}/versions")
async def list_versions_deprecated(project_id: str, request: Request):
    """[DEPRECATED] Redirect to /branches."""
    return await list_branches(project_id, request)


@router.get("/projects/{project_id}/versions/{version_id}")
async def get_version_deprecated(project_id: str, version_id: str, request: Request):
    """[DEPRECATED] Redirect to /branches/{id}."""
    return await get_branch(project_id, version_id, request)


@router.get("/projects/{project_id}/baseline")
async def get_baseline_deprecated(project_id: str, request: Request):
    """[DEPRECATED] Baselines are no longer used.  Returns the default branch."""
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    default_id = project.get("default_branch_id")
    if not default_id:
        raise HTTPException(status_code=404, detail="No default branch for this project")
    return await get_branch(project_id, default_id, request)

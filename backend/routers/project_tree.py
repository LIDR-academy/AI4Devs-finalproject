# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Phase snapshots & project tree API.

Tracks immutable snapshots of every phase of a project (descripcion, requirements,
specification, bpmn) and exposes a unified tree endpoint that the UI uses to
render the version history at `/projects/{id}/tree`.

We re-use the existing `versions` collection for BPMN diagram revisions, and
introduce a NEW `phase_snapshots` collection for descripcion/requirements/spec
because those weren't versioned before.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from database import db
from routers.audit import record_audit
from routers.auth import require_auth

router = APIRouter(prefix="/projects", tags=["project-tree"])
logger = logging.getLogger(__name__)

VALID_PHASES = ("descripcion", "requirements", "specification", "bpmn", "code")


class ManualSnapshotRequest(BaseModel):
    phase: Literal["descripcion", "requirements", "specification", "bpmn", "code"]
    resource_id: Optional[str] = None  # spec_id for spec/reqs/descripcion, diagram_id for bpmn, code_gen_id for code
    label: Optional[str] = None  # human-readable note


class CreateProjectVersionRequest(BaseModel):
    label: Optional[str] = None  # optional human-readable name for this coordinated version


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Snapshot helpers (used by AI endpoints + manual button)
# ---------------------------------------------------------------------------

async def create_snapshot(
    *,
    project_id: str,
    phase: str,
    resource_id: str,
    payload: dict,
    trigger: str,
    actor_email: str,
    label: Optional[str] = None,
) -> dict:
    """Insert a snapshot doc with monotonically increasing `version` per phase+resource."""
    if phase not in VALID_PHASES:
        raise ValueError(f"Invalid phase {phase}")
    # Compute next version
    last = await db.phase_snapshots.find_one(
        {"project_id": project_id, "phase": phase, "resource_id": resource_id},
        sort=[("version", -1)],
        projection={"_id": 0, "version": 1},
    )
    next_version = (last["version"] if last else 0) + 1

    doc = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "phase": phase,
        "resource_id": resource_id,
        "version": next_version,
        "trigger": trigger,
        "payload": payload,
        "label": (label or "")[:200],
        "created_by": actor_email,
        "created_at": _now_iso(),
    }
    await db.phase_snapshots.insert_one(doc.copy())
    return doc


async def snapshot_spec_full(
    *,
    project_id: str,
    spec_id: str,
    trigger: str,
    actor_email: str,
    label: Optional[str] = None,
) -> dict:
    """Capture spec + requirements + (if any) speckit_doc into one snapshot.

    We store ALL three under phase=`specification` so a single restore brings
    back the entire spec state. The descripcion & requirements phases are derived
    views over this same snapshot in the tree endpoint.
    """
    spec = await db.specifications.find_one({"id": spec_id}, {"_id": 0})
    if not spec:
        return {}
    reqs = await db.requirements.find({"spec_id": spec_id}, {"_id": 0}).to_list(500)
    payload = {"spec": spec, "requirements": reqs}
    return await create_snapshot(
        project_id=project_id,
        phase="specification",
        resource_id=spec_id,
        payload=payload,
        trigger=trigger,
        actor_email=actor_email,
        label=label,
    )


# ---------------------------------------------------------------------------
# GET project tree
# ---------------------------------------------------------------------------

@router.get("/{project_id}/tree")
async def get_project_tree(project_id: str, request: Request):
    """Return a hierarchical tree of all phases + versions.

    Shape:
      {
        project: {...},
        phases: {
          descripcion:          [ {id, version, label, trigger, created_at, created_by, summary} ],
          requirements:   [ {id, version, label, trigger, count, created_at, created_by, spec_title} ],
          specification:  [ {id, version, label, trigger, has_speckit, created_at, created_by, spec_title} ],
          bpmn: [ {diagram_id, name, current_version, versions: [{id, version_number, commit_message, created_at, created_by}]} ]
        }
      }
    """
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # All snapshots for this project (sorted desc by version per phase)
    snapshots = await db.phase_snapshots.find(
        {"project_id": project_id}, {"_id": 0},
    ).sort([("phase", 1), ("resource_id", 1), ("version", -1)]).to_list(2000)

    descripcion_view = []
    reqs_view = []
    spec_view = []
    code_view = []
    for s in snapshots:
        if s["phase"] == "code":
            payload = s.get("payload") or {}
            code_view.append({
                "snapshot_id": s["id"],
                "version": s["version"],
                "label": s.get("label", ""),
                "trigger": s["trigger"],
                "created_at": s["created_at"],
                "created_by": s["created_by"],
                "code_gen_id": s["resource_id"],
                "summary": (payload.get("summary") or "")[:280],
                "files_count": payload.get("files_count") or 0,
                "total_size": payload.get("total_size") or 0,
                "stack": payload.get("stack") or {},
                "target": payload.get("target"),
                "model": payload.get("model"),
                "spec_id": payload.get("spec_id"),
            })
            continue
        if s["phase"] != "specification":
            continue
        payload = s.get("payload") or {}
        spec = payload.get("spec") or {}
        reqs = payload.get("requirements") or []
        common = {
            "snapshot_id": s["id"],
            "version": s["version"],
            "label": s.get("label", ""),
            "trigger": s["trigger"],
            "created_at": s["created_at"],
            "created_by": s["created_by"],
            "spec_id": s["resource_id"],
            "spec_title": spec.get("title", ""),
        }
        # Brief sub-view (only if the spec was AI-generated and stored ai_descripcion)
        if spec.get("ai_descripcion"):
            descripcion_view.append({
                **common,
                "summary": (spec.get("ai_descripcion") or "")[:280],
                "model": spec.get("ai_model"),
            })
        reqs_view.append({
            **common,
            "count": len(reqs),
            "must": sum(1 for r in reqs if str(r.get("moscow", "")).lower() == "must"),
            "should": sum(1 for r in reqs if str(r.get("moscow", "")).lower() == "should"),
        })
        spec_view.append({
            **common,
            "has_speckit": bool(spec.get("speckit_doc")),
            "speckit_chars": len(spec.get("speckit_doc") or ""),
            "mode": spec.get("mode"),
        })

    # BPMN: read live state of each diagram of the project + its versions
    diagram_ids = project.get("diagram_ids") or []
    bpmn_view = []
    if diagram_ids:
        diagrams = await db.diagrams.find(
            {"id": {"$in": diagram_ids}},
            {"_id": 0, "id": 1, "name": 1, "current_version": 1, "created_by_ai": 1, "ai_model": 1},
        ).to_list(200)
        for d in diagrams:
            versions = await db.versions.find(
                {"diagram_id": d["id"]}, {"_id": 0},
            ).sort("version_number", -1).to_list(200)
            bpmn_view.append({
                "diagram_id": d["id"],
                "name": d.get("name", ""),
                "current_version": d.get("current_version", 1),
                "created_by_ai": bool(d.get("created_by_ai")),
                "ai_model": d.get("ai_model"),
                "versions": [
                    {
                        "version_id": v["id"],
                        "version_number": v["version_number"],
                        "commit_message": v.get("commit_message", ""),
                        "tags": v.get("tags", []),
                        "created_at": v["created_at"],
                        "created_by": v.get("created_by", ""),
                    }
                    for v in versions
                ],
            })

    return {
        "project": project,
        "phases": {
            "descripcion": descripcion_view,
            "requirements": reqs_view,
            "specification": spec_view,
            "bpmn": bpmn_view,
            "code": code_view,
        },
        "viewer_email": user.email,
    }


# ---------------------------------------------------------------------------
# Manual snapshot (user clicks "Save snapshot" button)
# ---------------------------------------------------------------------------

@router.post("/{project_id}/snapshots")
async def manual_snapshot(
    project_id: str,
    body: ManualSnapshotRequest,
    request: Request,
):
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if body.phase in ("descripcion", "requirements", "specification"):
        if not body.resource_id:
            raise HTTPException(
                status_code=400,
                detail="resource_id (spec_id) is required for this phase",
            )
        snap = await snapshot_spec_full(
            project_id=project_id,
            spec_id=body.resource_id,
            trigger="manual",
            actor_email=user.email,
            label=body.label,
        )
        if not snap:
            raise HTTPException(status_code=404, detail="Specification not found")
        # we ignore phase distinction here - the spec snapshot covers descripcion & reqs too
        await record_audit(
            f"project.snapshot.{body.phase}", actor_email=user.email,
            actor_user_id=user.user_id, actor_role=user.role,
            resource_type="snapshot", resource_id=snap["id"],
            details={"project_id": project_id, "version": snap["version"]},
            request=request,
        )
        return {"status": "ok", "snapshot": snap}

    # bpmn manual snapshot = create a new entry in versions collection
    if not body.resource_id:
        raise HTTPException(status_code=400, detail="resource_id (diagram_id) required")
    diag = await db.diagrams.find_one({"id": body.resource_id}, {"_id": 0})
    if not diag:
        raise HTTPException(status_code=404, detail="Diagram not found")
    next_v = (diag.get("current_version") or 0) + 1
    v_doc = {
        "id": str(uuid.uuid4()),
        "diagram_id": body.resource_id,
        "version_number": next_v,
        "xml_content": diag.get("current_xml") or "",
        "commit_message": body.label or f"Manual snapshot v{next_v}",
        "parent_version": diag.get("current_version"),
        "tags": ["manual"],
        "created_by": user.email,
        "created_at": _now_iso(),
    }
    await db.versions.insert_one(v_doc.copy())
    await db.diagrams.update_one(
        {"id": body.resource_id},
        {"$set": {"current_version": next_v, "updated_at": _now_iso()}},
    )
    await record_audit(
        "project.snapshot.bpmn", actor_email=user.email,
        actor_user_id=user.user_id, actor_role=user.role,
        resource_type="diagram", resource_id=body.resource_id,
        details={"project_id": project_id, "version": next_v},
        request=request,
    )
    return {"status": "ok", "version": v_doc}


# ---------------------------------------------------------------------------
# Create a coordinated project-wide version (snapshots ALL phases at once)
# ---------------------------------------------------------------------------

@router.post("/{project_id}/version")
async def create_project_version(
    project_id: str,
    body: CreateProjectVersionRequest,
    request: Request,
):
    """Create a coordinated project-wide version by snapshotting ALL phases at once.

    All snapshots share the same label and approximate timestamp so the UI
    can group them as belonging to the same project version.
    """
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    label = (body.label or "").strip()
    if not label:
        label = f"Project version · {_now_iso()[:19].replace('T', ' ')}"

    results: dict = {"specs": [], "bpmn": [], "code": [], "label": label}

    # 1) Snapshot all specifications (covers description, requirements, specification phases)
    specs = await db.specifications.find(
        {"project_id": project_id}, {"_id": 0, "id": 1}
    ).to_list(50)
    for spec in specs:
        try:
            snap = await snapshot_spec_full(
                project_id=project_id,
                spec_id=spec["id"],
                trigger="manual",
                actor_email=user.email,
                label=label,
            )
            if snap:
                results["specs"].append({
                    "snapshot_id": snap["id"],
                    "spec_id": spec["id"],
                    "version": snap["version"],
                })
                await record_audit(
                    "project.version.spec", actor_email=user.email,
                    actor_user_id=user.user_id, actor_role=user.role,
                    resource_type="snapshot", resource_id=snap["id"],
                    details={"project_id": project_id, "phase": "specification", "version": snap["version"]},
                    request=request,
                )
        except Exception:
            logger.exception("Failed to snapshot spec %s in project %s", spec["id"], project_id)

    # 2) Snapshot each BPMN diagram
    diagram_ids = project.get("diagram_ids") or []
    for diag_id in diagram_ids:
        try:
            diag = await db.diagrams.find_one({"id": diag_id}, {"_id": 0})
            if not diag:
                continue
            next_v = (diag.get("current_version") or 0) + 1
            v_doc = {
                "id": str(uuid.uuid4()),
                "diagram_id": diag_id,
                "version_number": next_v,
                "xml_content": diag.get("current_xml") or "",
                "commit_message": label[:200],
                "parent_version": diag.get("current_version"),
                "tags": ["manual", "project-version"],
                "created_by": user.email,
                "created_at": _now_iso(),
            }
            await db.versions.insert_one(v_doc.copy())
            await db.diagrams.update_one(
                {"id": diag_id},
                {"$set": {"current_version": next_v, "updated_at": _now_iso()}},
            )
            results["bpmn"].append({
                "diagram_id": diag_id,
                "version_id": v_doc["id"],
                "version_number": next_v,
            })
            await record_audit(
                "project.version.bpmn", actor_email=user.email,
                actor_user_id=user.user_id, actor_role=user.role,
                resource_type="diagram", resource_id=diag_id,
                details={"project_id": project_id, "version": next_v},
                request=request,
            )
        except Exception:
            logger.exception("Failed to snapshot diagram %s in project %s", diag_id, project_id)

    # 3) Snapshot all ready code generations
    code_gens = await db.code_generations.find(
        {"project_id": project_id, "status": "ready"}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    for cg in code_gens:
        try:
            snap = await create_snapshot(
                project_id=project_id,
                phase="code",
                resource_id=cg["id"],
                payload={
                    "summary": cg.get("summary"),
                    "stack": cg.get("stack"),
                    "files_count": cg.get("files_count"),
                    "total_size": cg.get("total_size"),
                    "next_steps": cg.get("next_steps"),
                    "spec_id": cg.get("spec_id"),
                    "target": cg.get("target"),
                    "model": cg.get("model"),
                },
                trigger="manual",
                actor_email=user.email,
                label=label,
            )
            results["code"].append({
                "snapshot_id": snap["id"],
                "code_gen_id": cg["id"],
                "version": snap["version"],
            })
            await record_audit(
                "project.version.code", actor_email=user.email,
                actor_user_id=user.user_id, actor_role=user.role,
                resource_type="snapshot", resource_id=snap["id"],
                details={"project_id": project_id, "phase": "code", "version": snap["version"]},
                request=request,
            )
        except Exception:
            logger.exception("Failed to snapshot codegen %s in project %s", cg["id"], project_id)

    total = len(results["specs"]) + len(results["bpmn"]) + len(results["code"])

    # ---- link snapshot to active branch ----
    project_version_id = None
    try:
        from database import get_active_project_version_id
        project_version_id = await get_active_project_version_id(project_id)
        if project_version_id:
            logger.info("Phase snapshot linked to active branch %s for project %s",
                        project_version_id, project_id)
    except Exception:
        logger.exception("Failed to link snapshot to branch for %s", project_id)

    return {
        "status": "ok",
        "label": label,
        "total_snapshots": total,
        "details": results,
        "project_version_id": project_version_id,
    }


# ---------------------------------------------------------------------------
# Read a specific snapshot (full payload for the detail panel)
# ---------------------------------------------------------------------------
# NOTE: The static `/snapshots/compare` route is declared further below BEFORE
# any reordering would catch it; FastAPI matches routes in the order they are
# declared on the router, so we register the dynamic catch-all
# `/snapshots/{snapshot_id}` LAST (see end of file).


# ---------------------------------------------------------------------------
# Restore a snapshot — overwrites the live resource with snapshot payload
# ---------------------------------------------------------------------------

class RestoreSnapshotRequest(BaseModel):
    confirm: bool = True
    label: Optional[str] = None  # optional message for the new pre-restore snapshot


@router.post("/snapshots/{snapshot_id}/restore")
async def restore_snapshot(
    snapshot_id: str,
    body: RestoreSnapshotRequest,
    request: Request,
):
    """Restore the live resource (spec+requirements OR diagram XML) from a snapshot.

    Before overwriting we ALWAYS take a fresh "pre-restore" snapshot of the
    current state so the user can roll back the rollback. This is the same
    safety net Git provides with `git revert`.
    """
    user = await require_auth(request)
    if not body.confirm:
        raise HTTPException(status_code=400, detail="confirm must be true")

    # Try phase snapshot first
    snap = await db.phase_snapshots.find_one({"id": snapshot_id}, {"_id": 0})
    if snap:
        spec_id = snap["resource_id"]
        project_id = snap["project_id"]
        payload = snap.get("payload") or {}
        snap_spec = payload.get("spec") or {}
        snap_reqs = payload.get("requirements") or []

        # 1) Pre-restore safety snapshot of current state
        await snapshot_spec_full(
            project_id=project_id,
            spec_id=spec_id,
            trigger="pre-restore",
            actor_email=user.email,
            label=f"Auto-snapshot antes de restaurar v{snap['version']}",
        )

        # 2) Overwrite live spec (preserve id/created_at; refresh updated_at)
        now = _now_iso()
        spec_update = {
            k: v for k, v in snap_spec.items()
            if k not in ("id", "created_at", "_id")
        }
        spec_update["updated_at"] = now
        spec_update["restored_from_snapshot_id"] = snap["id"]
        spec_update["restored_at"] = now
        await db.specifications.update_one({"id": spec_id}, {"$set": spec_update})

        # 3) Replace requirements wholesale
        await db.requirements.delete_many({"spec_id": spec_id})
        if snap_reqs:
            # Make sure every req has the right spec_id; sanitize _id
            cleaned = []
            for r in snap_reqs:
                r = {k: v for k, v in r.items() if k != "_id"}
                r["spec_id"] = spec_id
                r["updated_at"] = now
                cleaned.append(r)
            await db.requirements.insert_many([dict(r) for r in cleaned])

        await record_audit(
            "project.snapshot.restored", actor_email=user.email,
            actor_user_id=user.user_id, actor_role=user.role,
            resource_type="specification", resource_id=spec_id,
            details={
                "project_id": project_id,
                "snapshot_id": snap["id"],
                "snapshot_version": snap["version"],
                "requirements_restored": len(snap_reqs),
            },
            request=request,
        )
        return {
            "status": "ok",
            "kind": "specification",
            "spec_id": spec_id,
            "requirements_restored": len(snap_reqs),
            "restored_version": snap["version"],
        }

    # Otherwise: BPMN version
    v = await db.versions.find_one({"id": snapshot_id}, {"_id": 0})
    if not v:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    diagram_id = v["diagram_id"]
    diag = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diag:
        raise HTTPException(status_code=404, detail="Diagram not found")

    now = _now_iso()
    next_v = (diag.get("current_version") or 0) + 1

    # Pre-restore snapshot capturing the CURRENT xml as a new version
    pre_doc = {
        "id": str(uuid.uuid4()),
        "diagram_id": diagram_id,
        "version_number": next_v,
        "xml_content": diag.get("current_xml") or "",
        "commit_message": body.label or f"Auto-snapshot antes de restaurar v{v['version_number']}",
        "parent_version": diag.get("current_version"),
        "tags": ["pre-restore"],
        "created_by": user.email,
        "created_at": now,
    }
    await db.versions.insert_one(pre_doc.copy())

    # Now apply the restored XML as v+2 (new HEAD)
    head_v = next_v + 1
    head_doc = {
        "id": str(uuid.uuid4()),
        "diagram_id": diagram_id,
        "version_number": head_v,
        "xml_content": v.get("xml_content") or "",
        "commit_message": f"Restaurado desde v{v['version_number']}",
        "parent_version": next_v,
        "tags": ["restore"],
        "restored_from_version_id": v["id"],
        "created_by": user.email,
        "created_at": now,
    }
    await db.versions.insert_one(head_doc.copy())

    await db.diagrams.update_one(
        {"id": diagram_id},
        {"$set": {
            "current_xml": v.get("xml_content") or "",
            "current_version": head_v,
            "updated_at": now,
        }},
    )

    await record_audit(
        "project.snapshot.restored", actor_email=user.email,
        actor_user_id=user.user_id, actor_role=user.role,
        resource_type="diagram", resource_id=diagram_id,
        details={"from_version": v["version_number"], "new_version": head_v},
        request=request,
    )
    return {
        "status": "ok",
        "kind": "bpmn",
        "diagram_id": diagram_id,
        "new_version": head_v,
        "restored_from_version": v["version_number"],
    }


# ---------------------------------------------------------------------------
# Compare two snapshots — returns a structured diff for the UI
# ---------------------------------------------------------------------------

def _diff_requirements(a_list: list, b_list: list) -> dict:
    """Lightweight semantic diff keyed by `code`."""
    a_by = {r.get("code", ""): r for r in (a_list or []) if r.get("code")}
    b_by = {r.get("code", ""): r for r in (b_list or []) if r.get("code")}
    added = [b_by[c] for c in b_by if c not in a_by]
    removed = [a_by[c] for c in a_by if c not in b_by]
    modified = []
    fields_to_check = ("title", "description", "moscow", "type", "category", "raci")
    for code in a_by.keys() & b_by.keys():
        a, b = a_by[code], b_by[code]
        changed = {}
        for f in fields_to_check:
            if a.get(f) != b.get(f):
                changed[f] = {"from": a.get(f), "to": b.get(f)}
        if changed:
            modified.append({"code": code, "title": b.get("title", a.get("title", "")), "changes": changed})
    return {
        "added": [{"code": r.get("code"), "title": r.get("title"), "moscow": r.get("moscow")} for r in added],
        "removed": [{"code": r.get("code"), "title": r.get("title"), "moscow": r.get("moscow")} for r in removed],
        "modified": modified,
        "summary": {
            "added": len(added),
            "removed": len(removed),
            "modified": len(modified),
            "unchanged": len(a_by.keys() & b_by.keys()) - len(modified),
        },
    }


@router.get("/snapshots/compare")
async def compare_snapshots(a: str, b: str, request: Request):
    """Compare two snapshots (a=older, b=newer by convention)."""
    await require_auth(request)
    if a == b:
        raise HTTPException(status_code=400, detail="a and b must be different snapshots")

    snap_a = await db.phase_snapshots.find_one({"id": a}, {"_id": 0})
    snap_b = await db.phase_snapshots.find_one({"id": b}, {"_id": 0})
    if snap_a and snap_b:
        if snap_a.get("phase") != snap_b.get("phase"):
            raise HTTPException(status_code=400, detail="Cannot compare snapshots of different phases")
        pa = (snap_a.get("payload") or {})
        pb = (snap_b.get("payload") or {})
        spec_a = pa.get("spec") or {}
        spec_b = pb.get("spec") or {}
        speckit_diff = {
            "from_chars": len(spec_a.get("speckit_doc") or ""),
            "to_chars": len(spec_b.get("speckit_doc") or ""),
            "from_text": (spec_a.get("speckit_doc") or "")[:600],
            "to_text": (spec_b.get("speckit_doc") or "")[:600],
            "changed": (spec_a.get("speckit_doc") or "") != (spec_b.get("speckit_doc") or ""),
        }
        return {
            "kind": "phase",
            "phase": snap_a["phase"],
            "a": {"id": snap_a["id"], "version": snap_a["version"], "created_at": snap_a["created_at"]},
            "b": {"id": snap_b["id"], "version": snap_b["version"], "created_at": snap_b["created_at"]},
            "spec_diff": {
                "title": {"from": spec_a.get("title"), "to": spec_b.get("title")},
                "description": {"from": spec_a.get("description"), "to": spec_b.get("description")},
                "mode": {"from": spec_a.get("mode"), "to": spec_b.get("mode")},
                "status": {"from": spec_a.get("status"), "to": spec_b.get("status")},
            },
            "requirements_diff": _diff_requirements(pa.get("requirements") or [], pb.get("requirements") or []),
            "speckit_diff": speckit_diff,
        }

    # BPMN compare
    va = await db.versions.find_one({"id": a}, {"_id": 0})
    vb = await db.versions.find_one({"id": b}, {"_id": 0})
    if va and vb:
        if va.get("diagram_id") != vb.get("diagram_id"):
            raise HTTPException(status_code=400, detail="Cannot compare versions of different diagrams")
        xa = va.get("xml_content") or ""
        xb = vb.get("xml_content") or ""
        return {
            "kind": "bpmn",
            "diagram_id": va["diagram_id"],
            "a": {"id": va["id"], "version_number": va["version_number"], "created_at": va["created_at"], "xml": xa},
            "b": {"id": vb["id"], "version_number": vb["version_number"], "created_at": vb["created_at"], "xml": xb},
            "summary": {
                "from_chars": len(xa),
                "to_chars": len(xb),
                "delta_chars": len(xb) - len(xa),
                "changed": xa != xb,
            },
        }

    raise HTTPException(status_code=404, detail="One or both snapshots not found")


def _iso(v) -> str:
    if v is None:
        return ""
    if isinstance(v, datetime):
        return v.isoformat()
    return str(v)


# ---------------------------------------------------------------------------
# Cross-project overview — all readable projects with snapshot stats
# ---------------------------------------------------------------------------

@router.get("/_versions/overview")
async def versions_overview(request: Request):
    """Aggregate snapshot stats across every project the user can read.

    Used by the global "Versiones" page (`/versions`) and a Dashboard widget
    so users have a single place to see the version history of all their
    projects.
    """
    user = await require_auth(request)
    # RLS-friendly project lookup: owner OR shared-as-owner OR system-seeded.
    # We trust the existing /api/projects endpoint behaviour but reuse the
    # raw collection here for efficiency. Filter shape mirrors rls_filter +
    # share resolution at the projects level.
    from routers.auth import rls_filter_with_shares
    base = await rls_filter_with_shares(user, "project")
    projects = await db.projects.find(base, {"_id": 0, "id": 1, "name": 1, "icon": 1, "color": 1}).to_list(500)
    if not projects:
        return {"items": [], "totals": {"projects": 0, "snapshots": 0}, "recent_activity": []}
    project_ids = [p["id"] for p in projects]

    # Per-project per-phase counts
    pipeline = [
        {"$match": {"project_id": {"$in": project_ids}}},
        {"$group": {
            "_id": {"project_id": "$project_id", "phase": "$phase"},
            "count": {"$sum": 1},
            "last_at": {"$max": "$created_at"},
        }},
    ]
    rows = await db.phase_snapshots.aggregate(pipeline).to_list(5000)

    # BPMN versions live in `versions` (count = number of versions across all
    # diagrams of the project). We resolve diagram_ids from each project doc.
    full_projects = await db.projects.find(
        {"id": {"$in": project_ids}},
        {"_id": 0, "id": 1, "diagram_ids": 1},
    ).to_list(500)
    diag_to_project = {}
    for p in full_projects:
        for d in (p.get("diagram_ids") or []):
            diag_to_project[d] = p["id"]
    bpmn_counts: dict[str, int] = {}
    bpmn_last: dict[str, str] = {}
    if diag_to_project:
        bpmn_rows = await db.versions.aggregate([
            {"$match": {"diagram_id": {"$in": list(diag_to_project.keys())}}},
            {"$group": {
                "_id": "$diagram_id",
                "count": {"$sum": 1},
                "last_at": {"$max": "$created_at"},
            }},
        ]).to_list(5000)
        for r in bpmn_rows:
            pid = diag_to_project.get(r["_id"])
            if not pid:
                continue
            bpmn_counts[pid] = bpmn_counts.get(pid, 0) + r.get("count", 0)
            cur = bpmn_last.get(pid)
            la = _iso(r.get("last_at"))
            if la and (not cur or la > cur):
                bpmn_last[pid] = la

    # Build per-project bag
    by_project: dict[str, dict] = {p["id"]: {
        "id": p["id"],
        "name": p.get("name", ""),
        "icon": p.get("icon", "folder"),
        "color": p.get("color", "#3B82F6"),
        "phases": {ph: 0 for ph in ("descripcion", "requirements", "specification", "bpmn", "code")},
        "last_at": None,
    } for p in projects}

    for row in rows:
        pid = row["_id"]["project_id"]
        ph = row["_id"]["phase"]
        if pid not in by_project or ph not in by_project[pid]["phases"]:
            continue
        by_project[pid]["phases"][ph] = row.get("count", 0)
        la = _iso(row.get("last_at"))
        cur = by_project[pid]["last_at"]
        if la and (not cur or la > cur):
            by_project[pid]["last_at"] = la

    for pid, cnt in bpmn_counts.items():
        if pid in by_project:
            by_project[pid]["phases"]["bpmn"] = cnt
    for pid, la in bpmn_last.items():
        if pid in by_project:
            cur = by_project[pid]["last_at"]
            if not cur or la > cur:
                by_project[pid]["last_at"] = la

    # Compute totals per project
    items = []
    total_snapshots = 0
    for it in by_project.values():
        it["total"] = sum(it["phases"].values())
        total_snapshots += it["total"]
        items.append(it)
    items.sort(key=lambda x: (x["last_at"] or "", x["total"]), reverse=True)

    # Last 10 activity events across all projects
    recent_phase = await db.phase_snapshots.find(
        {"project_id": {"$in": project_ids}},
        {"_id": 0, "id": 1, "project_id": 1, "phase": 1, "version": 1, "trigger": 1,
         "label": 1, "created_at": 1, "created_by": 1},
    ).sort("created_at", -1).to_list(10)
    recent_bpmn = await db.versions.find(
        {"diagram_id": {"$in": list(diag_to_project.keys())}} if diag_to_project else {"id": "_none"},
        {"_id": 0, "id": 1, "diagram_id": 1, "version_number": 1,
         "commit_message": 1, "created_at": 1, "created_by": 1, "tags": 1},
    ).sort("created_at", -1).to_list(10)
    activity = []
    for r in recent_phase:
        activity.append({
            "kind": "phase",
            "phase": r["phase"],
            "project_id": r["project_id"],
            "project_name": by_project.get(r["project_id"], {}).get("name", ""),
            "version": r["version"],
            "trigger": r.get("trigger", ""),
            "label": r.get("label", ""),
            "created_at": _iso(r["created_at"]),
            "created_by": r.get("created_by", ""),
            "snapshot_id": r.get("id"),
        })
    for r in recent_bpmn:
        pid = diag_to_project.get(r["diagram_id"])
        if not pid:
            continue
        activity.append({
            "kind": "bpmn",
            "phase": "bpmn",
            "project_id": pid,
            "project_name": by_project.get(pid, {}).get("name", ""),
            "diagram_id": r["diagram_id"],
            "version_number": r.get("version_number"),
            "commit_message": r.get("commit_message", ""),
            "tags": r.get("tags", []),
            "created_at": _iso(r["created_at"]),
            "created_by": r.get("created_by", ""),
            "snapshot_id": r.get("id"),
        })
    activity.sort(key=lambda x: x["created_at"] or "", reverse=True)
    activity = activity[:15]

    return {
        "items": items,
        "totals": {"projects": len(items), "snapshots": total_snapshots},
        "recent_activity": activity,
    }


# ---------------------------------------------------------------------------
# Component overview — all project artefacts grouped by category, filtered by
# active branch
# ---------------------------------------------------------------------------

@router.get("/{project_id}/components-overview")
async def get_components_overview(project_id: str, request: Request):
    """Return every project component grouped by category, scoped to the active branch.

    Categories: descripcion, requirements, specification, bpmn, code, files,
    oop_classes, bpmn_components, element_links.
    """
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    from routers.auth import can_read_resource_async
    if not await can_read_resource_async(user, project, "project"):
        raise HTTPException(status_code=403, detail="Access denied")

    # Resolve active branch
    from database import get_active_project_version_id
    branch_id = await get_active_project_version_id(project_id)
    branch = None
    if branch_id:
        branch = await db.project_versions.find_one(
            {"id": branch_id, "project_id": project_id},
            {"_id": 0},
        )

    branch_spec_ids = branch.get("spec_ids") or [] if branch else []
    branch_diagram_ids = project.get("diagram_ids") or []
    branch_code_ids = branch.get("code_snapshot_ids") or [] if branch else []
    active_branch_id = branch_id

    categories = {}

    # ── descripcion ──────────────────────────────────────────────────
    desc_cursor = db.phase_snapshots.find(
        {"project_id": project_id, "phase": "specification"},
        {"_id": 0, "id": 1, "version": 1, "payload": 1, "resource_id": 1, "created_at": 1},
    ).sort("version", -1).limit(1)
    desc_list = await desc_cursor.to_list(1)
    desc_snapshot = desc_list[0] if desc_list else None
    desc_info = {"count": 0, "summary": "", "spec_id": None}
    if desc_snapshot:
        payload = desc_snapshot.get("payload") or {}
        spec = payload.get("spec") or {}
        ai_desc = spec.get("ai_descripcion") or spec.get("ai_brief") or ""
        if ai_desc.strip():
            desc_info = {
                "count": 1,
                "summary": ai_desc[:280],
                "spec_id": desc_snapshot.get("resource_id"),
                "snapshot_id": desc_snapshot.get("id"),
                "version": desc_snapshot.get("version"),
                "created_at": desc_snapshot.get("created_at"),
            }
    categories["descripcion"] = desc_info

    # ── requirements ─────────────────────────────────────────────────
    reqs_total = 0
    reqs_specs = []
    if branch_spec_ids:
        specs = await db.specifications.find(
            {"id": {"$in": branch_spec_ids}},
            {"_id": 0, "id": 1, "title": 1, "requirements_count": 1},
        ).to_list(200)
        spec_ids = [s["id"] for s in specs]
        if spec_ids:
            pipeline = [
                {"$match": {"spec_id": {"$in": spec_ids}}},
                {"$group": {
                    "_id": "$spec_id",
                    "count": {"$sum": 1},
                    "must": {"$sum": {"$cond": [{"$eq": ["$moscow", "must"]}, 1, 0]}},
                    "should": {"$sum": {"$cond": [{"$eq": ["$moscow", "should"]}, 1, 0]}},
                    "could": {"$sum": {"$cond": [{"$eq": ["$moscow", "could"]}, 1, 0]}},
                    "wont": {"$sum": {"$cond": [{"$eq": ["$moscow", "wont"]}, 1, 0]}},
                }},
            ]
            agg_rows = await db.requirements.aggregate(pipeline).to_list(200)
            by_spec = {r["_id"]: r for r in agg_rows}
            for s in specs:
                r = by_spec.get(s["id"], {"count": 0, "must": 0, "should": 0, "could": 0, "wont": 0})
                reqs_total += r["count"]
                reqs_specs.append({
                    "spec_id": s["id"],
                    "title": s.get("title", ""),
                    "count": r["count"],
                    "must": r["must"],
                    "should": r["should"],
                    "could": r["could"],
                    "wont": r["wont"],
                })
    categories["requirements"] = {"count": reqs_total, "specs": reqs_specs}

    # ── specification ────────────────────────────────────────────────
    spec_items = []
    if branch_spec_ids:
        spec_docs = await db.specifications.find(
            {"id": {"$in": branch_spec_ids}},
            {"_id": 0, "id": 1, "title": 1, "mode": 1, "speckit_doc": 1,
             "version": 1, "created_at": 1},
        ).to_list(200)
        spec_items = [
            {
                "spec_id": s["id"],
                "title": s.get("title", ""),
                "mode": s.get("mode", ""),
                "version": s.get("version", ""),
                "has_speckit": bool(s.get("speckit_doc")),
                "created_at": s.get("created_at"),
            }
            for s in spec_docs
        ]
    categories["specification"] = {"count": len(spec_items), "items": spec_items}

    # ── bpmn ─────────────────────────────────────────────────────────
    bpmn_items = []
    if branch_diagram_ids:
        diagrams = await db.diagrams.find(
            {"id": {"$in": branch_diagram_ids}},
            {"_id": 0, "id": 1, "name": 1, "current_version": 1,
             "description": 1, "tags": 1, "created_at": 1},
        ).to_list(200)
        bpmn_items = [
            {
                "diagram_id": d["id"],
                "name": d.get("name", ""),
                "current_version": d.get("current_version", 1),
                "description": (d.get("description") or "")[:120],
                "tags": d.get("tags") or [],
                "created_at": d.get("created_at"),
            }
            for d in diagrams
        ]
    categories["bpmn"] = {"count": len(bpmn_items), "items": bpmn_items}

    # ── code ─────────────────────────────────────────────────────────
    code_items = []
    code_query = {"project_id": project_id}
    if branch_code_ids:
        code_query["id"] = {"$in": branch_code_ids}
    code_docs = await db.code_generations.find(
        code_query,
        {"_id": 0, "id": 1, "summary": 1, "status": 1, "target": 1,
         "files_count": 1, "created_at": 1},
    ).sort("created_at", -1).to_list(50)
    code_items = [
        {
            "code_gen_id": c["id"],
            "summary": (c.get("summary") or "")[:120],
            "status": c.get("status", ""),
            "target": c.get("target", ""),
            "files_count": c.get("files_count", 0),
            "created_at": c.get("created_at"),
        }
        for c in code_docs
    ]
    categories["code"] = {"count": len(code_items), "items": code_items}

    # ── files ────────────────────────────────────────────────────────
    files_query: dict = {"project_id": project_id}
    if active_branch_id:
        files_query["branch_id"] = active_branch_id
    all_files = await db.project_files.find(
        files_query, {"_id": 0, "type": 1},
    ).to_list(5000)
    file_count = sum(1 for f in all_files if f.get("type") == "file")
    dir_count = sum(1 for f in all_files if f.get("type") == "directory")
    categories["files"] = {
        "count": file_count + dir_count,
        "file_count": file_count,
        "dir_count": dir_count,
    }

    # ── oop_classes (global) ─────────────────────────────────────────
    oop_count = await db.oop_classes.count_documents({})
    categories["oop_classes"] = {"count": oop_count}

    # ── bpmn_components (global) ─────────────────────────────────────
    comp_count = await db.components.count_documents({})
    categories["bpmn_components"] = {"count": comp_count}

    # ── element_links ────────────────────────────────────────────────
    el_count = 0
    if branch_diagram_ids:
        el_count = await db.element_requirement_links.count_documents(
            {"diagram_id": {"$in": branch_diagram_ids}}
        )
    categories["element_links"] = {"count": el_count}

    return {
        "project_id": project_id,
        "active_branch": {
            "id": branch_id,
            "name": branch.get("name") if branch else None,
        },
        "categories": categories,
    }


# ---------------------------------------------------------------------------
# Read a specific snapshot (DECLARED LAST so the static `/compare` route wins)
# ---------------------------------------------------------------------------

@router.get("/snapshots/{snapshot_id}")
async def read_snapshot(snapshot_id: str, request: Request):
    """Return the full snapshot payload (for view / compare in the UI)."""
    await require_auth(request)
    snap = await db.phase_snapshots.find_one({"id": snapshot_id}, {"_id": 0})
    if snap:
        return {"kind": "phase", **snap}
    v = await db.versions.find_one({"id": snapshot_id}, {"_id": 0})
    if v:
        return {"kind": "bpmn", **v}
    raise HTTPException(status_code=404, detail="Snapshot not found")

# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""OpenSpec + Speckit module.

Specifications can be linked to a BPMN project OR standalone (project_id = null).
Each specification contains a collection of requirements with:
- Type: functional / non_functional
- MoSCoW priority: must / should / could / wont
- RACI assignment: responsible[], accountable, consulted[], informed[]
  (each actor is a free string — can be an email, username, or role/group label)

Speckit auto-generated Markdown documentation is produced via LLM and is marked
`speckit_outdated=True` whenever a requirement's MoSCoW or description changes,
requiring manual regeneration.
"""
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Response
from pydantic import BaseModel, Field
from typing import Optional, Literal, List, Dict, Any
from datetime import datetime, timezone
import uuid
import io
import csv as csv_module

from database import db, get_active_project_version_id
from routers.auth import (
    get_current_user, require_auth, can_read_resource, can_write_resource,
    rls_filter, rls_filter_with_shares, can_read_resource_async, can_write_resource_async,
)
from routers.ai import _call_deepseek, DEEPSEEK_MODEL  # noqa: F401

router = APIRouter(prefix="/specs", tags=["specifications"])


# ==================== MODELS ====================

RequirementType = Literal["functional", "non_functional"]
MoscowPriority = Literal["must", "should", "could", "wont"]
RequirementStatus = Literal["draft", "approved", "implemented", "deprecated"]
SpecMode = Literal["openspec", "speckit", "full"]


class RaciAssignment(BaseModel):
    responsible: List[str] = Field(default_factory=list)
    accountable: str = ""
    consulted: List[str] = Field(default_factory=list)
    informed: List[str] = Field(default_factory=list)


class RequirementCreate(BaseModel):
    code: Optional[str] = None
    title: str
    description: str = ""
    type: RequirementType = "functional"
    category: Optional[str] = None
    moscow: MoscowPriority = "should"
    raci: RaciAssignment = Field(default_factory=RaciAssignment)
    acceptance_criteria: List[str] = Field(default_factory=list)
    status: RequirementStatus = "draft"
    tags: List[str] = Field(default_factory=list)
    linked_diagrams: List[str] = Field(default_factory=list)
    linked_classes: List[str] = Field(default_factory=list)


class RequirementUpdate(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[RequirementType] = None
    category: Optional[str] = None
    moscow: Optional[MoscowPriority] = None
    raci: Optional[RaciAssignment] = None
    acceptance_criteria: Optional[List[str]] = None
    status: Optional[RequirementStatus] = None
    tags: Optional[List[str]] = None
    linked_diagrams: Optional[List[str]] = None
    linked_classes: Optional[List[str]] = None


class SpecificationCreate(BaseModel):
    name: str
    description: str = ""
    project_id: Optional[str] = None
    mode: SpecMode = "full"
    version: str = "1.0.0"
    tags: List[str] = Field(default_factory=list)


class SpecificationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mode: Optional[SpecMode] = None
    version: Optional[str] = None
    tags: Optional[List[str]] = None


# ==================== HELPERS ====================

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _get_spec(spec_id: str) -> dict:
    spec = await db.specifications.find_one({"id": spec_id}, {"_id": 0})
    if not spec:
        raise HTTPException(status_code=404, detail="Specification not found")
    return spec


async def _assert_spec_read(user, spec: dict):
    # Spec inherits permissions from its project (if any) or its own `created_by`
    if spec.get("project_id"):
        project = await db.projects.find_one({"id": spec["project_id"]}, {"_id": 0})
        if project and await can_read_resource_async(user, project, "project"):
            return
    # Standalone: only owner/admin/public
    if not can_read_resource(user, spec):
        raise HTTPException(status_code=403, detail="Forbidden")


async def _assert_spec_write(user, spec: dict):
    if spec.get("project_id"):
        project = await db.projects.find_one({"id": spec["project_id"]}, {"_id": 0})
        if project and await can_write_resource_async(user, project, "project"):
            return
    if not can_write_resource(user, spec):
        raise HTTPException(status_code=403, detail="Forbidden")


async def _next_req_code(spec_id: str, req_type: str) -> str:
    """Auto-generate a code like FR-001 / NFR-012 scoped to this spec."""
    prefix = "FR" if req_type == "functional" else "NFR"
    count = await db.requirements.count_documents({
        "spec_id": spec_id,
        "type": req_type,
    })
    return f"{prefix}-{(count + 1):03d}"


async def _recount_requirements(spec_id: str) -> None:
    cnt = await db.requirements.count_documents({"spec_id": spec_id})
    await db.specifications.update_one(
        {"id": spec_id},
        {"$set": {"requirements_count": cnt, "updated_at": _now_iso()}},
    )


async def _mark_speckit_outdated(spec_id: str) -> None:
    await db.specifications.update_one(
        {"id": spec_id},
        {"$set": {"speckit_outdated": True, "updated_at": _now_iso()}},
    )


# ==================== SPECIFICATIONS CRUD ====================

@router.get("/specifications")
async def list_specifications(
    request: Request,
    project_id: Optional[str] = None,
    standalone: bool = False,
):
    """List all specifications the user can read.
    - project_id: filter by project
    - standalone: only specs without project
    """
    user = await get_current_user(request)
    base = rls_filter(user)
    extra: Dict[str, Any] = {}
    if project_id:
        extra["project_id"] = project_id
    elif standalone:
        extra["project_id"] = None
    query = {"$and": [base, extra]} if extra else base
    specs = await db.specifications.find(query, {"_id": 0}).sort("updated_at", -1).to_list(200)

    # Enrich with project version labels (batch lookup)
    version_ids = {s.get("project_version_id") for s in specs if s.get("project_version_id")}
    version_map: Dict[str, dict] = {}
    if version_ids:
        versions = await db.project_versions.find(
            {"id": {"$in": list(version_ids)}},
            {"_id": 0, "id": 1, "label": 1, "version_number": 1},
        ).to_list(200)
        version_map = {v["id"]: v for v in versions}

    for s in specs:
        vid = s.get("project_version_id")
        if vid and vid in version_map:
            s["project_version_label"] = version_map[vid].get("label", "")
            s["project_version_number"] = version_map[vid].get("version_number")

    return specs


@router.post("/specifications")
async def create_specification(data: SpecificationCreate, request: Request):
    user = await require_auth(request)
    if data.project_id:
        project = await db.projects.find_one({"id": data.project_id}, {"_id": 0})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if not await can_write_resource_async(user, project, "project"):
            raise HTTPException(status_code=403, detail="Cannot attach spec to this project")

    # Auto-link to the highest-numbered active project version
    project_version_id = None
    if data.project_id:
        project_version_id = await get_active_project_version_id(data.project_id)

    now = _now_iso()
    spec = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "description": data.description,
        "project_id": data.project_id,
        "mode": data.mode,
        "version": data.version,
        "tags": data.tags,
        "project_version_id": project_version_id,
        "speckit_doc": None,
        "speckit_outdated": False,
        "speckit_generated_at": None,
        "requirements_count": 0,
        "created_by": user.email,
        "created_at": now,
        "updated_at": now,
    }
    await db.specifications.insert_one(spec.copy())
    return spec


@router.get("/specifications/{spec_id}")
async def get_specification(spec_id: str, request: Request):
    user = await get_current_user(request)
    spec = await _get_spec(spec_id)
    await _assert_spec_read(user, spec)
    requirements = await db.requirements.find(
        {"spec_id": spec_id}, {"_id": 0}
    ).sort("code", 1).to_list(500)

    # Enrich with project version info
    vid = spec.get("project_version_id")
    if vid:
        version = await db.project_versions.find_one(
            {"id": vid}, {"_id": 0, "label": 1, "version_number": 1}
        )
        if version:
            spec["project_version_label"] = version.get("label", "")
            spec["project_version_number"] = version.get("version_number")

    return {**spec, "requirements": requirements}


@router.put("/specifications/{spec_id}")
async def update_specification(spec_id: str, data: SpecificationUpdate, request: Request):
    user = await require_auth(request)
    spec = await _get_spec(spec_id)
    await _assert_spec_write(user, spec)
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = _now_iso()
    await db.specifications.update_one({"id": spec_id}, {"$set": update})
    return await db.specifications.find_one({"id": spec_id}, {"_id": 0})


@router.delete("/specifications/{spec_id}")
async def delete_specification(spec_id: str, request: Request):
    user = await require_auth(request)
    spec = await _get_spec(spec_id)
    # Deleting a spec is stricter: owner/admin only (no editor share)
    if not can_write_resource(user, spec):
        # Fall back to project owner check
        if spec.get("project_id"):
            project = await db.projects.find_one({"id": spec["project_id"]}, {"_id": 0})
            if not project or not can_write_resource(user, project):
                raise HTTPException(status_code=403, detail="Forbidden")
        else:
            raise HTTPException(status_code=403, detail="Forbidden")
    await db.specifications.delete_one({"id": spec_id})
    await db.requirements.delete_many({"spec_id": spec_id})
    return {"message": "Specification deleted"}


# ==================== SUGGESTED ACTIONS ====================

@router.get("/specifications/{spec_id}/suggested-actions")
async def speckit_suggested_actions(spec_id: str, request: Request):
    """Analyze the spec and return a list of suggested actions.

    Heuristics:
      - MUST requirement without any linked diagram → suggest 'link_diagram'
      - FR (functional requirement) with no acceptance_criteria → suggest 'generate_criteria'
      - Requirement with no Accountable in RACI → suggest 'assign_accountable'
      - SHOULD requirement promoted to MUST candidate (description length > 200) → 'review_priority'
    """
    user = await require_auth(request)
    spec = await _get_spec(spec_id)
    if not await can_read_resource_async(user, spec, "specifications"):
        raise HTTPException(status_code=403, detail="No access")

    requirements = await db.requirements.find(
        {"spec_id": spec_id}, {"_id": 0}
    ).sort("code", 1).to_list(500)

    actions = []
    for r in requirements:
        code = r.get("code") or "?"
        title = r.get("title") or ""
        moscow = (r.get("moscow") or "should").lower()
        rtype = (r.get("type") or "").lower()
        linked = r.get("linked_diagrams") or []
        criteria = r.get("acceptance_criteria") or []
        raci = r.get("raci") or {}
        accountable_raw = raci.get("accountable") or ""
        if isinstance(accountable_raw, list):
            accountable = ",".join(str(x) for x in accountable_raw if str(x).strip()).strip()
        else:
            accountable = str(accountable_raw).strip()

        # 1. MUST without linked diagram
        if moscow == "must" and not linked:
            actions.append({
                "kind": "link_diagram",
                "severity": "high",
                "requirement_id": r.get("id"),
                "requirement_code": code,
                "title": f"{code} sin diagrama BPMN enlazado",
                "description": f"El requirement MUST '{title}' no tiene diagrama BPMN enlazado. Vincula uno para garantizar trazabilidad.",
                "cta": "Enlazar diagrama",
            })

        # 2. Functional requirement without acceptance criteria
        # Detect FRs both by `type` field and by code prefix (more robust)
        is_fr = (rtype.startswith("fr") or rtype == "functional"
                 or code.upper().startswith("FR-") or code.upper().startswith("FR_"))
        if is_fr:
            if not criteria or (isinstance(criteria, list) and len([c for c in criteria if str(c).strip()]) == 0):
                actions.append({
                    "kind": "generate_criteria",
                    "severity": "medium",
                    "requirement_id": r.get("id"),
                    "requirement_code": code,
                    "title": f"{code} sin criterios de aceptacion",
                    "description": f"El FR '{title}' no tiene criterios de aceptacion. Generar 3 con DeepSeek V4-Pro.",
                    "cta": "Generar criterios con IA",
                })

        # 3. Missing Accountable
        if not accountable:
            actions.append({
                "kind": "assign_accountable",
                "severity": "medium",
                "requirement_id": r.get("id"),
                "requirement_code": code,
                "title": f"{code} sin Accountable",
                "description": f"'{title}' no tiene un Accountable en la matriz RACI. Cada requirement debe tener uno y solo uno.",
                "cta": "Asignar Accountable",
            })

        # 4. SHOULD/COULD with very long description hints at MUST candidate
        if moscow in ("should", "could") and len((r.get("description") or "")) > 250:
            actions.append({
                "kind": "review_priority",
                "severity": "low",
                "requirement_id": r.get("id"),
                "requirement_code": code,
                "title": f"{code} podria ser MUST",
                "description": f"La descripcion de '{title}' es extensa (>250 chars), revisa si deberia escalar a MUST.",
                "cta": "Revisar prioridad MoSCoW",
            })

    # Sort by severity (high → medium → low)
    rank = {"high": 0, "medium": 1, "low": 2}
    actions.sort(key=lambda a: (rank.get(a["severity"], 9), a.get("requirement_code") or ""))

    summary = {
        "total": len(actions),
        "high": sum(1 for a in actions if a["severity"] == "high"),
        "medium": sum(1 for a in actions if a["severity"] == "medium"),
        "low": sum(1 for a in actions if a["severity"] == "low"),
    }
    return {"spec_id": spec_id, "summary": summary, "actions": actions}


@router.post("/requirements/{req_id}/generate-criteria")
async def generate_acceptance_criteria(req_id: str, request: Request):
    """Use DeepSeek to generate 3 acceptance criteria for a requirement that lacks them."""
    user = await require_auth(request)
    req_doc = await db.requirements.find_one({"id": req_id}, {"_id": 0})
    if not req_doc:
        raise HTTPException(status_code=404, detail="Requirement not found")
    spec_doc = await _get_spec(req_doc.get("spec_id"))
    if not await can_write_resource_async(user, spec_doc, "specifications"):
        raise HTTPException(status_code=403, detail="No write access")

    sys_msg = (
        "Eres un Senior QA Lead. Genera EXACTAMENTE 3 criterios de aceptacion claros, "
        "verificables y testeables para el requirement proporcionado. Devuelve SOLO una "
        "lista JSON de 3 strings, sin explicaciones, sin envoltorios. Formato Gherkin "
        "compacto recomendado: 'Dado <contexto>, cuando <accion>, entonces <resultado>'. "
        "Escribelos en espanol."
    )
    user_prompt = (
        f"Requirement: {req_doc.get('code')} — {req_doc.get('title')}\n"
        f"Tipo: {req_doc.get('type')}\n"
        f"Prioridad MoSCoW: {req_doc.get('moscow')}\n"
        f"Descripcion: {req_doc.get('description')}\n\n"
        f"Genera 3 criterios de aceptacion en formato JSON: [\"criterio 1\", \"criterio 2\", \"criterio 3\"]"
    )

    try:
        raw = await _call_deepseek(sys_msg, user_prompt, max_tokens=1024, model="deepseek-v4-flash")
        # `deepseek-v4-pro` is a reasoning model and can consume the entire
        # token budget in its internal chain-of-thought, returning empty
        # content. v4-flash is the non-reasoning variant, ideal for short
        # structured outputs. If flash still returns empty, retry with pro
        # at a larger budget as a fallback.
        if not raw or not raw.strip():
            raw = await _call_deepseek(sys_msg, user_prompt, max_tokens=4096, model="deepseek-v4-pro")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error DeepSeek: {str(e)}")

    # Parse JSON list
    import json as _json
    import re as _re
    raw_clean = raw.strip()
    if raw_clean.startswith("```"):
        raw_clean = _re.sub(r"^```(?:json)?\s*", "", raw_clean)
        raw_clean = _re.sub(r"\s*```$", "", raw_clean)
    try:
        criteria = _json.loads(raw_clean)
        if not isinstance(criteria, list):
            raise ValueError("not a list")
        criteria = [str(c).strip() for c in criteria if str(c).strip()][:3]
    except Exception:
        # Fallback: split by lines
        lines = [
            _re.sub(r'^[\d\.\-\*\s"]+', "", ln).rstrip('",').strip()
            for ln in raw_clean.split("\n") if ln.strip()
        ]
        criteria = [ln for ln in lines if ln][:3]

    if not criteria:
        raise HTTPException(status_code=503, detail="DeepSeek no devolvio criterios validos")

    # Persist
    await db.requirements.update_one(
        {"id": req_id},
        {"$set": {
            "acceptance_criteria": criteria,
            "updated_at": _now_iso(),
        }},
    )
    # Mark spec speckit as outdated
    await db.specifications.update_one(
        {"id": req_doc.get("spec_id")},
        {"$set": {"speckit_outdated": True, "updated_at": _now_iso()}},
    )
    return {"criteria": criteria, "requirement_id": req_id}


# ==================== REQUIREMENTS CRUD ====================

@router.post("/specifications/{spec_id}/requirements")
async def add_requirement(spec_id: str, data: RequirementCreate, request: Request):
    user = await require_auth(request)
    spec = await _get_spec(spec_id)
    await _assert_spec_write(user, spec)

    code = data.code or await _next_req_code(spec_id, data.type)
    now = _now_iso()
    req = {
        "id": str(uuid.uuid4()),
        "spec_id": spec_id,
        "code": code,
        "title": data.title,
        "description": data.description,
        "type": data.type,
        "category": data.category,
        "moscow": data.moscow,
        "raci": data.raci.model_dump(),
        "acceptance_criteria": data.acceptance_criteria,
        "status": data.status,
        "tags": data.tags,
        "linked_diagrams": data.linked_diagrams,
        "linked_classes": data.linked_classes,
        "created_by": user.email,
        "created_at": now,
        "updated_at": now,
    }
    await db.requirements.insert_one(req.copy())
    await _recount_requirements(spec_id)
    await _mark_speckit_outdated(spec_id)
    return req


@router.put("/requirements/{req_id}")
async def update_requirement(req_id: str, data: RequirementUpdate, request: Request):
    user = await require_auth(request)
    req = await db.requirements.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    spec = await _get_spec(req["spec_id"])
    await _assert_spec_write(user, spec)

    update = {k: (v.model_dump() if hasattr(v, "model_dump") else v)
              for k, v in data.model_dump().items() if v is not None}
    # Detect changes that should invalidate the Speckit doc
    invalidating = {"moscow", "title", "description", "type",
                    "acceptance_criteria", "status", "raci"}
    needs_outdated = bool(invalidating & set(update.keys()))
    update["updated_at"] = _now_iso()

    old_moscow = req.get("moscow", "should")
    new_moscow = update.get("moscow", old_moscow)
    moscow_changed = "moscow" in update and old_moscow != new_moscow

    await db.requirements.update_one({"id": req_id}, {"$set": update})
    if needs_outdated:
        await _mark_speckit_outdated(req["spec_id"])

    # Record impact-of-change event when MoSCoW escalates/de-escalates
    if moscow_changed:
        await _record_moscow_change(req, old_moscow, new_moscow, user.email)

    return await db.requirements.find_one({"id": req_id}, {"_id": 0})


@router.delete("/requirements/{req_id}")
async def delete_requirement(req_id: str, request: Request):
    user = await require_auth(request)
    req = await db.requirements.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    spec = await _get_spec(req["spec_id"])
    await _assert_spec_write(user, spec)
    await db.requirements.delete_one({"id": req_id})
    await _recount_requirements(req["spec_id"])
    await _mark_speckit_outdated(req["spec_id"])
    return {"message": "Requirement deleted"}


# ==================== IMPORT / EXPORT ====================

def _req_to_md(req: dict) -> str:
    raci = req.get("raci", {}) or {}
    moscow_label = {"must": "MUST", "should": "SHOULD", "could": "COULD", "wont": "WON'T"}.get(req.get("moscow", ""), req.get("moscow", ""))
    ac_block = "\n".join(f"- {c}" for c in req.get("acceptance_criteria", []) or []) or "_(ninguno)_"
    return (
        f"### {req.get('code', '')} — {req.get('title', '')}\n\n"
        f"- **Tipo:** {req.get('type', '')}\n"
        f"- **MoSCoW:** `{moscow_label}`\n"
        f"- **Estado:** {req.get('status', '')}\n"
        f"- **Categoría:** {req.get('category') or '-'}\n\n"
        f"**RACI:**\n"
        f"- R: {', '.join(raci.get('responsible', [])) or '-'}\n"
        f"- A: {raci.get('accountable') or '-'}\n"
        f"- C: {', '.join(raci.get('consulted', [])) or '-'}\n"
        f"- I: {', '.join(raci.get('informed', [])) or '-'}\n\n"
        f"**Descripción:**\n{req.get('description', '') or '_(vacía)_'}\n\n"
        f"**Criterios de aceptación:**\n{ac_block}\n"
    )


@router.get("/specifications/{spec_id}/export")
async def export_specification(
    spec_id: str,
    request: Request,
    format: Literal["json", "markdown", "csv"] = "json",
    mode: Literal["openspec", "speckit", "full"] = "full",
):
    user = await get_current_user(request)
    spec = await _get_spec(spec_id)
    await _assert_spec_read(user, spec)
    requirements = await db.requirements.find(
        {"spec_id": spec_id}, {"_id": 0}
    ).sort("code", 1).to_list(500)

    if format == "json":
        payload = {
            "specification": spec,
            "requirements": requirements,
            "mode": mode,
            "exported_at": _now_iso(),
        }
        return payload

    if format == "csv":
        buf = io.StringIO()
        writer = csv_module.writer(buf)
        writer.writerow([
            "code", "title", "type", "moscow", "status", "category",
            "responsible", "accountable", "consulted", "informed",
            "description", "acceptance_criteria", "tags",
        ])
        for r in requirements:
            raci = r.get("raci", {}) or {}
            writer.writerow([
                r.get("code", ""), r.get("title", ""), r.get("type", ""),
                r.get("moscow", ""), r.get("status", ""), r.get("category", "") or "",
                "; ".join(raci.get("responsible", [])),
                raci.get("accountable", "") or "",
                "; ".join(raci.get("consulted", [])),
                "; ".join(raci.get("informed", [])),
                r.get("description", ""),
                " | ".join(r.get("acceptance_criteria", []) or []),
                "; ".join(r.get("tags", []) or []),
            ])
        return Response(
            content=buf.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{spec.get("name", "spec")}.csv"'},
        )

    # markdown
    parts = [
        f"# {spec.get('name', '')}\n",
        f"_{spec.get('description', '')}_\n",
        f"- **Versión:** {spec.get('version', '1.0.0')}",
        f"- **Modo:** {spec.get('mode', 'full')}",
        f"- **Requirements:** {len(requirements)}",
        f"- **Exportado:** {_now_iso()}\n",
    ]
    if mode in ("speckit", "full") and spec.get("speckit_doc"):
        parts.append("\n## Documentación Speckit\n")
        parts.append(spec["speckit_doc"])
        parts.append("\n---\n")
    if mode in ("openspec", "full"):
        parts.append("\n## Requirements (OpenSpec)\n")
        # Group by MoSCoW
        buckets = {"must": [], "should": [], "could": [], "wont": []}
        for r in requirements:
            buckets.setdefault(r.get("moscow", "should"), []).append(r)
        labels = {"must": "Must-Have", "should": "Should-Have", "could": "Could-Have", "wont": "Won't-Have"}
        for k in ["must", "should", "could", "wont"]:
            if buckets[k]:
                parts.append(f"\n### {labels[k]}\n")
                for r in buckets[k]:
                    parts.append(_req_to_md(r))
    md = "\n".join(parts)
    return Response(
        content=md,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{spec.get("name", "spec")}.md"'},
    )


class ImportPayload(BaseModel):
    specification: Optional[dict] = None
    requirements: List[dict] = Field(default_factory=list)


@router.post("/specifications/{spec_id}/import")
async def import_requirements(spec_id: str, data: ImportPayload, request: Request):
    """Import requirements into an existing spec (JSON format)."""
    user = await require_auth(request)
    spec = await _get_spec(spec_id)
    await _assert_spec_write(user, spec)

    inserted = 0
    now = _now_iso()
    for r in data.requirements:
        code = r.get("code") or await _next_req_code(spec_id, r.get("type", "functional"))
        req = {
            "id": str(uuid.uuid4()),
            "spec_id": spec_id,
            "code": code,
            "title": r.get("title", "(sin titulo)"),
            "description": r.get("description", ""),
            "type": r.get("type", "functional"),
            "category": r.get("category"),
            "moscow": r.get("moscow", "should"),
            "raci": r.get("raci") or {"responsible": [], "accountable": "", "consulted": [], "informed": []},
            "acceptance_criteria": r.get("acceptance_criteria", []) or [],
            "status": r.get("status", "draft"),
            "tags": r.get("tags", []) or [],
            "linked_diagrams": r.get("linked_diagrams", []) or [],
            "linked_classes": r.get("linked_classes", []) or [],
            "created_by": user.email,
            "created_at": now,
            "updated_at": now,
        }
        await db.requirements.insert_one(req.copy())
        inserted += 1

    await _recount_requirements(spec_id)
    await _mark_speckit_outdated(spec_id)
    return {"imported": inserted, "spec_id": spec_id}


# ==================== IMPACT-OF-CHANGE TRACKING ====================

async def _record_moscow_change(req: dict, old_moscow: str, new_moscow: str, changed_by: str) -> None:
    """Snapshot the impact of a MoSCoW change: affected elements + RACI actors."""
    # Affected BPMN elements across all linked diagrams
    element_links = await db.element_requirement_links.find(
        {"requirement_id": req["id"]}, {"_id": 0, "diagram_id": 1, "element_id": 1},
    ).to_list(500)

    diagram_ids = list({lnk["diagram_id"] for lnk in element_links}
                       | set(req.get("linked_diagrams") or []))
    diagrams_meta: Dict[str, str] = {}
    if diagram_ids:
        docs = await db.diagrams.find(
            {"id": {"$in": diagram_ids}}, {"_id": 0, "id": 1, "name": 1},
        ).to_list(200)
        diagrams_meta = {d["id"]: d.get("name", d["id"]) for d in docs}

    affected_elements = [
        {"diagram_id": lnk["diagram_id"],
         "diagram_name": diagrams_meta.get(lnk["diagram_id"], lnk["diagram_id"]),
         "element_id": lnk["element_id"]}
        for lnk in element_links
    ]

    raci = req.get("raci", {}) or {}
    # Union of everyone who needs to know about the change
    raci_notify = sorted({
        *(raci.get("responsible") or []),
        *([raci.get("accountable")] if raci.get("accountable") else []),
        *(raci.get("consulted") or []),
        *(raci.get("informed") or []),
    })

    escalation = _MOSCOW_RANK.get(new_moscow, 0) - _MOSCOW_RANK.get(old_moscow, 0)

    change = {
        "id": str(uuid.uuid4()),
        "requirement_id": req["id"],
        "requirement_code": req.get("code", ""),
        "requirement_title": req.get("title", ""),
        "spec_id": req["spec_id"],
        "from_moscow": old_moscow,
        "to_moscow": new_moscow,
        "escalation": escalation,  # positive = promoted, negative = demoted
        "changed_by": changed_by,
        "changed_at": _now_iso(),
        "affected_elements": affected_elements,
        "affected_diagrams": [{"id": did, "name": diagrams_meta.get(did, did)} for did in diagram_ids],
        "raci_notify": raci_notify,
        "acknowledged": False,
        "acknowledged_by": [],
    }
    await db.requirement_changes.insert_one(change.copy())


@router.get("/changes/recent")
async def list_recent_changes(request: Request, limit: int = 30, only_unacknowledged: bool = False):
    """List recent MoSCoW changes visible to the user (spec-level RLS)."""
    user = await require_auth(request)

    query: Dict[str, Any] = {}
    if only_unacknowledged:
        query["acknowledged"] = False

    changes = await db.requirement_changes.find(
        query, {"_id": 0},
    ).sort("changed_at", -1).to_list(max(1, min(limit, 200)))

    # Filter by spec visibility
    visible: list = []
    spec_cache: Dict[str, bool] = {}
    for ch in changes:
        sid = ch.get("spec_id")
        if sid not in spec_cache:
            spec = await db.specifications.find_one({"id": sid}, {"_id": 0})
            if not spec:
                spec_cache[sid] = False
            else:
                try:
                    await _assert_spec_read(user, spec)
                    spec_cache[sid] = True
                except HTTPException:
                    spec_cache[sid] = False
        if spec_cache[sid]:
            # Flag if this user is in the RACI notification list
            ch["user_is_raci"] = user.email in (ch.get("raci_notify") or [])
            visible.append(ch)
    return {"changes": visible, "total": len(visible)}


@router.post("/changes/{change_id}/acknowledge")
async def acknowledge_change(change_id: str, request: Request):
    user = await require_auth(request)
    change = await db.requirement_changes.find_one({"id": change_id}, {"_id": 0})
    if not change:
        raise HTTPException(status_code=404, detail="Change not found")
    # Any user with spec read permission may acknowledge their own notification
    spec = await db.specifications.find_one({"id": change.get("spec_id")}, {"_id": 0})
    if spec:
        await _assert_spec_read(user, spec)
    await db.requirement_changes.update_one(
        {"id": change_id},
        {"$addToSet": {"acknowledged_by": user.email}},
    )
    updated = await db.requirement_changes.find_one({"id": change_id}, {"_id": 0})
    raci = set(updated.get("raci_notify") or [])
    acks = set(updated.get("acknowledged_by") or [])
    if raci and raci.issubset(acks):
        await db.requirement_changes.update_one(
            {"id": change_id},
            {"$set": {"acknowledged": True}},
        )
    return {"message": "Acknowledged", "by": user.email}


# ==================== TRACEABILITY: by diagram ====================

@router.get("/requirements/by-diagram/{diagram_id}")
async def requirements_by_diagram(diagram_id: str, request: Request):
    """Return all requirements linked to a given BPMN diagram, grouped by spec."""
    user = await get_current_user(request)
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    if not await can_read_resource_async(user, diagram, "diagram"):
        raise HTTPException(status_code=403, detail="Forbidden")

    reqs = await db.requirements.find(
        {"linked_diagrams": diagram_id}, {"_id": 0},
    ).sort("code", 1).to_list(500)
    if not reqs:
        return {"diagram_id": diagram_id, "specs": [], "total": 0}

    spec_ids = list({r["spec_id"] for r in reqs})
    specs = await db.specifications.find(
        {"id": {"$in": spec_ids}},
        {"_id": 0, "id": 1, "name": 1, "version": 1, "mode": 1},
    ).to_list(200)
    specs_by_id = {s["id"]: s for s in specs}

    # Filter by read permission on each spec
    visible_specs: Dict[str, dict] = {}
    for sid, s in specs_by_id.items():
        full_spec = await db.specifications.find_one({"id": sid}, {"_id": 0})
        try:
            await _assert_spec_read(user, full_spec)
            visible_specs[sid] = s
        except HTTPException:
            continue

    grouped: Dict[str, dict] = {}
    for r in reqs:
        sid = r["spec_id"]
        if sid not in visible_specs:
            continue
        bucket = grouped.setdefault(sid, {"spec": visible_specs[sid], "requirements": []})
        bucket["requirements"].append(r)

    return {
        "diagram_id": diagram_id,
        "specs": list(grouped.values()),
        "total": sum(len(g["requirements"]) for g in grouped.values()),
    }


# ==================== ELEMENT-LEVEL LINKS ====================

class ElementLinkCreate(BaseModel):
    diagram_id: str
    element_id: str
    requirement_id: str


_MOSCOW_RANK = {"must": 4, "should": 3, "could": 2, "wont": 1}


@router.post("/element-links")
async def create_element_link(data: ElementLinkCreate, request: Request):
    user = await require_auth(request)
    # Validate diagram + requirement + spec permissions
    diagram = await db.diagrams.find_one({"id": data.diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    if not await can_read_resource_async(user, diagram, "diagram"):
        raise HTTPException(status_code=403, detail="Forbidden (diagram)")

    req = await db.requirements.find_one({"id": data.requirement_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    spec = await _get_spec(req["spec_id"])
    await _assert_spec_write(user, spec)

    # Upsert (one link per element + requirement)
    existing = await db.element_requirement_links.find_one({
        "diagram_id": data.diagram_id,
        "element_id": data.element_id,
        "requirement_id": data.requirement_id,
    }, {"_id": 0})
    if existing:
        return existing

    now = _now_iso()
    link = {
        "id": str(uuid.uuid4()),
        "diagram_id": data.diagram_id,
        "element_id": data.element_id,
        "requirement_id": data.requirement_id,
        "spec_id": req["spec_id"],
        "created_by": user.email,
        "created_at": now,
    }
    await db.element_requirement_links.insert_one(link.copy())
    # Ensure the requirement also references the diagram at diagram level
    if data.diagram_id not in (req.get("linked_diagrams") or []):
        await db.requirements.update_one(
            {"id": data.requirement_id},
            {"$addToSet": {"linked_diagrams": data.diagram_id},
             "$set": {"updated_at": now}},
        )
        await _mark_speckit_outdated(req["spec_id"])
    return link


@router.delete("/element-links/{link_id}")
async def delete_element_link(link_id: str, request: Request):
    user = await require_auth(request)
    link = await db.element_requirement_links.find_one({"id": link_id}, {"_id": 0})
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    spec = await _get_spec(link["spec_id"])
    await _assert_spec_write(user, spec)
    await db.element_requirement_links.delete_one({"id": link_id})
    return {"message": "Link removed"}


@router.patch("/element-links/{link_id}")
async def remap_element_link(link_id: str, payload: dict, request: Request):
    """Re-assign an element_link to a different element_id, in place.

    Used by the orphaned-links "Re-asignar" UX so the user can fix a broken
    link by picking a new BPMN shape on the canvas without recreating the
    record (keeps `id`, `created_at`, and audit history).

    Body: {"element_id": "<new_shape_id>"}
    """
    user = await require_auth(request)
    new_element_id = (payload or {}).get("element_id")
    if not isinstance(new_element_id, str) or not new_element_id.strip():
        raise HTTPException(status_code=400, detail="element_id is required")
    new_element_id = new_element_id.strip()
    link = await db.element_requirement_links.find_one({"id": link_id}, {"_id": 0})
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    spec = await _get_spec(link["spec_id"])
    await _assert_spec_write(user, spec)
    # Idempotent if the user clicks the same target twice
    if link.get("element_id") == new_element_id:
        return {"message": "No change", "link_id": link_id, "element_id": new_element_id}
    # Reject duplicates that would create the SAME (diagram, element, requirement) tuple
    dup = await db.element_requirement_links.find_one(
        {
            "diagram_id": link["diagram_id"],
            "element_id": new_element_id,
            "requirement_id": link["requirement_id"],
            "id": {"$ne": link_id},
        },
        {"_id": 0, "id": 1},
    )
    if dup:
        raise HTTPException(status_code=409, detail="Another link already targets that element with this requirement")
    await db.element_requirement_links.update_one(
        {"id": link_id},
        {"$set": {"element_id": new_element_id, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"message": "Link remapped", "link_id": link_id, "element_id": new_element_id}


@router.post("/element-links/bulk-delete")
async def bulk_delete_element_links(payload: dict, request: Request):
    """Delete multiple element-requirement links at once.

    Body: {"ids": ["link_id_1", "link_id_2", ...]}.
    Used by the orphaned-links cleanup dialog. Authorization: caller must have
    write access to EVERY spec referenced by the links. If any link is missing
    or unauthorized, the whole batch is rejected (no partial deletes).
    """
    user = await require_auth(request)
    ids = payload.get("ids") or []
    if not isinstance(ids, list) or not ids:
        raise HTTPException(status_code=400, detail="ids must be a non-empty list")
    if len(ids) > 500:
        raise HTTPException(status_code=400, detail="Too many ids (max 500)")
    links = await db.element_requirement_links.find({"id": {"$in": ids}}, {"_id": 0}).to_list(None)
    if len(links) != len(set(ids)):
        raise HTTPException(status_code=404, detail="Some links not found")
    # Authorize against every distinct spec
    distinct_specs = {link["spec_id"] for link in links if link.get("spec_id")}
    for spec_id in distinct_specs:
        spec = await _get_spec(spec_id)
        await _assert_spec_write(user, spec)
    result = await db.element_requirement_links.delete_many({"id": {"$in": ids}})
    return {"message": "Links removed", "deleted": result.deleted_count}


@router.get("/element-links")
async def list_element_links(
    request: Request,
    diagram_id: str,
    element_id: Optional[str] = None,
):
    """Return element-level links for a diagram. Includes a per-element aggregate
    with highest MoSCoW for quick canvas coloring."""
    user = await get_current_user(request)
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    if not await can_read_resource_async(user, diagram, "diagram"):
        raise HTTPException(status_code=403, detail="Forbidden")

    query = {"diagram_id": diagram_id}
    if element_id:
        query["element_id"] = element_id
    links = await db.element_requirement_links.find(query, {"_id": 0}).to_list(2000)
    if not links:
        return {"diagram_id": diagram_id, "links": [], "elements": {}}

    req_ids = list({lnk["requirement_id"] for lnk in links})
    reqs = await db.requirements.find(
        {"id": {"$in": req_ids}},
        {"_id": 0, "id": 1, "code": 1, "title": 1, "moscow": 1, "type": 1, "status": 1, "spec_id": 1},
    ).to_list(len(req_ids))
    reqs_by_id = {r["id"]: r for r in reqs}

    # Filter out links whose spec is not readable
    visible_spec_ids: Dict[str, bool] = {}
    for r in reqs:
        sid = r["spec_id"]
        if sid in visible_spec_ids:
            continue
        full_spec = await db.specifications.find_one({"id": sid}, {"_id": 0})
        try:
            await _assert_spec_read(user, full_spec)
            visible_spec_ids[sid] = True
        except HTTPException:
            visible_spec_ids[sid] = False

    visible_links = []
    elements_agg: Dict[str, dict] = {}
    for lnk in links:
        req = reqs_by_id.get(lnk["requirement_id"])
        if not req or not visible_spec_ids.get(req["spec_id"]):
            continue
        enriched = {**lnk, "requirement": req}
        visible_links.append(enriched)

        eid = lnk["element_id"]
        bucket = elements_agg.setdefault(eid, {
            "element_id": eid,
            "count": 0,
            "highest_moscow": "wont",
            "requirement_codes": [],
        })
        bucket["count"] += 1
        bucket["requirement_codes"].append(req.get("code", ""))
        if _MOSCOW_RANK.get(req.get("moscow", "should"), 0) > _MOSCOW_RANK.get(bucket["highest_moscow"], 0):
            bucket["highest_moscow"] = req.get("moscow", "should")

    return {
        "diagram_id": diagram_id,
        "links": visible_links,
        "elements": elements_agg,
    }


# ==================== SPECKIT AI GENERATION ====================

@router.post("/specifications/{spec_id}/generate-speckit", status_code=202)
async def generate_speckit_doc(
    spec_id: str,
    request: Request,
    background_tasks: BackgroundTasks,
):
    """Trigger Speckit generation in background (202 Accepted).

    Frontend should poll `GET /api/specs/specifications/{spec_id}` every 2-3s
    and watch `speckit_status`: `processing` → `ready` (use `speckit_doc`)
    or `failed` (read `speckit_error`). This pattern is required because
    DeepSeek V4-Pro on large specs can run beyond the 60s K8s ingress timeout.

    Query params:
      - variant: "pro" (default, calidad) | "flash" (mas rapido y barato)
    """
    user = await require_auth(request)
    spec = await _get_spec(spec_id)
    await _assert_spec_write(user, spec)

    if spec.get("speckit_status") == "processing":
        return {
            "status": "processing",
            "spec_id": spec_id,
            "message": "Ya hay una generacion en curso",
            "started_at": spec.get("speckit_started_at"),
        }

    variant = (request.query_params.get("variant") or "pro").lower()
    model_name = "deepseek-v4-flash" if variant == "flash" else "deepseek-v4-pro"

    requirements = await db.requirements.find(
        {"spec_id": spec_id}, {"_id": 0}
    ).sort("code", 1).to_list(500)
    if not requirements:
        raise HTTPException(status_code=400, detail="La especificación no tiene requirements")

    # Preload linked diagrams once to include their info in the prompt
    all_diagram_ids = set()
    for r in requirements:
        for did in r.get("linked_diagrams") or []:
            all_diagram_ids.add(did)
    diagrams_by_id: Dict[str, dict] = {}
    if all_diagram_ids:
        diagram_docs = await db.diagrams.find(
            {"id": {"$in": list(all_diagram_ids)}},
            {"_id": 0, "id": 1, "name": 1, "description": 1},
        ).to_list(200)
        for d in diagram_docs:
            diagrams_by_id[d["id"]] = d

    # Group by MoSCoW for the prompt
    buckets: Dict[str, list] = {"must": [], "should": [], "could": [], "wont": []}
    for r in requirements:
        buckets.setdefault(r.get("moscow", "should"), []).append(r)

    context_parts = [f"# Especificación: {spec.get('name', '')}\n",
                     f"Descripción: {spec.get('description', '')}\n",
                     f"Versión: {spec.get('version', '')}\n\n"]
    moscow_labels = {"must": "MUST-HAVE", "should": "SHOULD-HAVE", "could": "COULD-HAVE", "wont": "WON'T-HAVE"}
    for k in ["must", "should", "could", "wont"]:
        if not buckets[k]:
            continue
        context_parts.append(f"\n## {moscow_labels[k]}\n")
        for r in buckets[k]:
            raci = r.get("raci", {}) or {}
            linked = r.get("linked_diagrams") or []
            linked_names = [diagrams_by_id.get(did, {}).get("name", did) for did in linked]
            context_parts.append(
                f"- **{r.get('code')}** — {r.get('title')}\n"
                f"  - Tipo: {r.get('type')}\n"
                f"  - Descripción: {r.get('description')}\n"
                f"  - RACI — R: {raci.get('responsible', [])}, A: {raci.get('accountable', '')}, C: {raci.get('consulted', [])}, I: {raci.get('informed', [])}\n"
                f"  - Criterios: {r.get('acceptance_criteria', [])}\n"
                + (f"  - Diagramas BPMN enlazados: {linked_names}\n" if linked_names else "")
            )

    context_block = "".join(context_parts)
    total_reqs = len(requirements)
    must_count = len(buckets["must"])
    has_diagrams = bool(diagrams_by_id)

    # ─────────────────────────────────────────────────────────────────────────
    # Prompts optimizados para DeepSeek V4-Pro:
    # · Engram memory (1M ctx) → metemos el contexto completo sin chunking
    # · Strong code/syntax reasoning → reglas Mermaid estrictas + few-shot
    # · Multi-step reasoning → pedimos un plan interno antes de generar
    # · Self-validation gate → exige checklist al final del razonamiento
    # ─────────────────────────────────────────────────────────────────────────
    system_msg = (
        "Eres un Principal Systems Architect con 15+ años escribiendo Speckits para "
        "productos de software de gran escala. Trabajas con DeepSeek V4-Pro (1M tokens "
        "de contexto, razonamiento Engram) — explota tu capacidad para mantener "
        "trazabilidad bidireccional perfecta entre requirements, RACI y diagramas BPMN.\n\n"

        "═══ FASE 1 · PLAN INTERNO (no lo emitas en la respuesta) ═══\n"
        "Antes de escribir, razona internamente:\n"
        "  1) Mapea cada requirement → entidad de dominio inferida\n"
        "  2) Identifica dependencias técnicas implícitas (ej: NFR-002 depende de FR-001)\n"
        "  3) Detecta conflictos MoSCoW (un MUST que necesita un WON'T → riesgo)\n"
        "  4) Construye el grafo de RACI (un Accountable por requirement, sin solapes)\n"
        "  5) Estima esfuerzo por bucket MoSCoW para el roadmap\n\n"

        "═══ FASE 2 · ESTRUCTURA OBLIGATORIA DEL DOCUMENTO ═══\n"
        "Genera EXACTAMENTE estas 9 secciones, en este orden, con headers H2:\n"
        "  ## 1. Resumen ejecutivo\n"
        "     · 3 párrafos: contexto · alcance MUST/SHOULD · riesgos top-3\n"
        "  ## 2. Contexto y alcance\n"
        "     · Bullets de qué incluye y qué queda explícitamente fuera (WON'T)\n"
        "  ## 3. Arquitectura de datos inferida\n"
        "     · ```mermaid classDiagram``` con entidades, atributos y relaciones\n"
        "     · Cada clase referencia los códigos de requirement que la justifican\n"
        "  ## 4. Matriz de requirements (MoSCoW)\n"
        "     · 4 sub-tablas markdown (MUST/SHOULD/COULD/WON'T)\n"
        "     · Columnas: Código | Título | Tipo | Estado | R | A | Diagramas\n"
        "  ## 5. Flujo de dependencias\n"
        "     · ```mermaid flowchart TD``` con nodos = códigos de requirement\n"
        "     · Aristas etiquetadas con la naturaleza de la dependencia\n"
        "     · Nodos de diagramas BPMN como rectángulos con doble borde\n"
        "  ## 6. Matriz RACI consolidada\n"
        "     · Tabla markdown: Actor | Responsible | Accountable | Consulted | Informed\n"
        "     · Cada celda lista códigos de requirement\n"
        "  ## 7. Riesgos y mitigaciones\n"
        "     · Tabla: ID | Descripción | Probabilidad | Impacto | Mitigación | Owner\n"
        "  ## 8. Roadmap sugerido\n"
        "     · ```mermaid gantt``` con secciones MUST → SHOULD → COULD\n"
        "     · Estimaciones realistas en días/semanas\n"
        "  ## 9. Glosario y referencias\n"
        "     · Tabla término / definición · referencias a estándares (ISO/GDPR/etc.)\n\n"

        "═══ FASE 3 · REGLAS DE SINTAXIS MERMAID (críticas) ═══\n"
        "Estas reglas son INVIOLABLES — si las rompes el render falla:\n"
        "  · Etiquetas con espacios o caracteres especiales SIEMPRE entre comillas\n"
        "    OK:  A[\"Validar CV\"]\n"
        "    KO:  A[Validar CV (con OCR)]\n"
        "  · IDs de nodo en flowchart: solo [a-zA-Z0-9_], nunca con guiones medios\n"
        "    OK:  FR_001  ·  KO:  FR-001  → usa FR_001 como id y \"FR-001\" como label\n"
        "  · En classDiagram, los nombres de clase no pueden contener espacios ni guiones.\n"
        "    Usa CamelCase: class UsuarioAdmin { ... }\n"
        "  · En classDiagram, las relaciones se escriben asi:\n"
        "    ClaseA \"1\" -- \"*\" ClaseB : tiene\n"
        "    ClaseA <|-- ClaseB : hereda\n"
        "  · gantt: secciones con `section`, tareas con formato `task : id, YYYY-MM-DD, Nd`\n"
        "  · NUNCA mezcles dos tipos de diagrama en el mismo bloque\n"
        "  · NUNCA uses `style` con colores hex sin almohadilla\n"
        "  · NUNCA uses sintaxis de flowchart dentro de classDiagram o viceversa\n\n"

        "═══ FASE 4 · CHECKLIST DE AUTO-VALIDACIÓN (verifícalo antes de emitir) ═══\n"
        "  ☐ Las 9 secciones están presentes y en orden\n"
        "  ☐ Cada bloque mermaid tiene apertura ```mermaid y cierre ```\n"
        "  ☐ Todos los códigos de requirement (FR-xxx, NFR-xxx) referenciados existen en la entrada\n"
        "  ☐ Cada requirement MUST aparece en la sección 5 (flujo de dependencias)\n"
        "  ☐ Cada Accountable aparece en la matriz RACI sección 6\n"
        "  ☐ El gantt cubre TODOS los requirements MUST y SHOULD\n"
        "  ☐ No quedan placeholders tipo TODO, TBD o [...]\n\n"

        "═══ FASE 5 · OUTPUT ═══\n"
        "Devuelve SOLO el documento Markdown final, en español, sin explicaciones meta, "
        "sin envoltorio ```markdown, listo para renderizar."
    )

    user_prompt = (
        f"Genera el Speckit completo para esta especificación OpenSpec.\n\n"
        f"Estadísticas de entrada:\n"
        f"  · Total requirements: {total_reqs}\n"
        f"  · Requirements MUST: {must_count}\n"
        f"  · Diagramas BPMN enlazados: {len(diagrams_by_id) if has_diagrams else 0}\n\n"
        f"━━━ ESPECIFICACIÓN ━━━\n\n{context_block}"
    )

    try:
        # Mark spec as processing and schedule background work.
        started_at = _now_iso()
        await db.specifications.update_one(
            {"id": spec_id},
            {"$set": {
                "speckit_status": "processing",
                "speckit_phase": "queued",
                "speckit_phase_at": started_at,
                "speckit_started_at": started_at,
                "speckit_model": model_name,
                "speckit_error": None,
            }},
        )
        background_tasks.add_task(
            _run_speckit_llm, spec_id, model_name, system_msg, user_prompt
        )
        return {
            "status": "processing",
            "spec_id": spec_id,
            "model": model_name,
            "variant": "flash" if model_name == "deepseek-v4-flash" else "pro",
            "started_at": started_at,
            "message": (
                "Generacion iniciada. Polling GET /api/specs/specifications/"
                f"{spec_id} hasta que speckit_status sea 'ready' o 'failed'."
            ),
        }
    except Exception as e:
        await db.specifications.update_one(
            {"id": spec_id},
            {"$set": {
                "speckit_status": "failed",
                "speckit_error": f"Error preparando background task: {str(e)[:300]}",
                "speckit_failed_at": _now_iso(),
            }},
        )
        raise HTTPException(status_code=503, detail=f"No se pudo iniciar la generacion: {str(e)}")


async def _set_speckit_phase(spec_id: str, phase: str):
    """Update the `speckit_phase` field so the frontend timeline can advance.
    Phases: planning → generating → post_processing → complete  (or → failed)."""
    await db.specifications.update_one(
        {"id": spec_id},
        {"$set": {"speckit_phase": phase, "speckit_phase_at": _now_iso()}},
    )


async def _run_speckit_llm(spec_id: str, model_name: str, system_msg: str, user_prompt: str):
    """Background worker — calls DeepSeek and persists the result.

    Detached from the HTTP request lifecycle, so K8s ingress 60s timeout
    is irrelevant. The client polled the spec document and saw 202 already.
    """
    try:
        await _set_speckit_phase(spec_id, "planning")
        max_out = 8192 if model_name == "deepseek-v4-flash" else 12288

        await _set_speckit_phase(spec_id, "generating")
        doc = await _call_deepseek(system_msg, user_prompt, max_tokens=max_out, model=model_name)

        await _set_speckit_phase(spec_id, "post_processing")
        # Strip accidental ```markdown wrapper if model included one
        stripped = doc.strip()
        if stripped.startswith("```markdown"):
            stripped = stripped[len("```markdown"):].lstrip("\n")
            if stripped.endswith("```"):
                stripped = stripped[:-3].rstrip()
            doc = stripped
        elif stripped.startswith("```\n") and stripped.endswith("```"):
            doc = stripped[4:-3].strip()

        now = _now_iso()
        await db.specifications.update_one(
            {"id": spec_id},
            {"$set": {
                "speckit_doc": doc,
                "speckit_outdated": False,
                "speckit_generated_at": now,
                "speckit_status": "ready",
                "speckit_phase": "complete",
                "speckit_phase_at": now,
                "speckit_error": None,
                "updated_at": now,
            }},
        )
        # Auto-snapshot for the project tree once speckit is fully ready
        try:
            spec_now = await db.specifications.find_one({"id": spec_id}, {"_id": 0})
            if spec_now and spec_now.get("project_id"):
                from routers.project_tree import snapshot_spec_full
                await snapshot_spec_full(
                    project_id=spec_now["project_id"],
                    spec_id=spec_id,
                    trigger="ai.speckit",
                    actor_email=spec_now.get("created_by") or "system",
                    label=f"Speckit generado ({model_name})",
                )
        except Exception:
            pass
    except Exception as e:
        await db.specifications.update_one(
            {"id": spec_id},
            {"$set": {
                "speckit_status": "failed",
                "speckit_phase": "failed",
                "speckit_error": str(e)[:500],
                "speckit_failed_at": _now_iso(),
            }},
        )

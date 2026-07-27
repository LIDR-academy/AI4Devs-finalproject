# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Phase D · Code Generation desde Spec + BPMN.

Generates a FastAPI + React scaffold from a finalized specification (with
its requirements + Speckit doc) and the project's BPMN diagrams.

The LLM call is long (>60s for Pro) so we use the same async/polling pattern
as `routers/specs.py:generate_speckit_doc`:
  * `POST /ai-projects/{project_id}/generate-code` returns 202 + `code_gen_id`
  * `GET /ai-projects/code-generations/{id}` returns status + files when ready
  * `GET /ai-projects/code-generations/{id}/download` streams a ZIP

We persist the generation in `code_generations` (collection) so each project
keeps a history of generations + we can register a snapshot in the project
tree (phase=`code`).
"""
from __future__ import annotations

import io
import json
import logging
import re
import uuid
import zipfile
from datetime import datetime, timezone
from typing import Optional, List, Literal

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from database import db
from routers.audit import record_audit
from routers.auth import require_auth, _is_owner_or_admin
from routers.ai import _call_deepseek

router = APIRouter(prefix="/ai-projects", tags=["ai-codegen"])
logger = logging.getLogger(__name__)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class GenerateCodeRequest(BaseModel):
    spec_id: str
    target: Literal["fullstack", "backend", "frontend"] = "fullstack"
    variant: Literal["pro", "flash"] = "pro"
    diagram_ids: Optional[List[str]] = None  # optional subset; default = all in project
    notes: Optional[str] = Field(default=None, max_length=1000)


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT_FULLSTACK = """Eres un arquitecto full-stack senior especializado en FastAPI + React.

A partir de una especificacion (Speckit + requirements MoSCoW + RACI) y un conjunto de diagramas BPMN 2.0, genera un scaffold de codigo COMPLETO y funcional siguiendo estas reglas estrictas:

═══ FASE 1 · ESTRUCTURA DEL PROYECTO ═══
Backend FastAPI:
  - main.py (entry, mount routers, CORS, health)
  - models.py (Pydantic models para cada entidad detectada en los requirements)
  - database.py (motor MongoDB AsyncIOMotorClient con MONGO_URL env)
  - routers/<entity>.py (un router por dominio derivado de los diagramas BPMN — ej. `routers/onboarding.py`)
  - requirements.txt (fastapi, uvicorn, motor, pydantic, python-dotenv)
  - .env.example (placeholders, no secretos reales)
  - README.md (como arrancar)

Frontend React + Vite + Tailwind:
  - package.json (deps minimas: react, react-router-dom, axios, tailwindcss)
  - vite.config.js, tailwind.config.js
  - src/main.jsx, src/App.jsx (router + layout basico)
  - src/pages/<feature>.jsx (una pagina por flujo BPMN principal)
  - src/api/client.js (axios instance con baseURL via VITE_API_URL)
  - .env.example, README.md

═══ FASE 2 · MAPEO BPMN → CODIGO ═══
- Cada `bpmn:userTask` → endpoint POST + form/page React
- Cada `bpmn:serviceTask` → endpoint backend con logica
- Cada `bpmn:exclusiveGateway` → branch logico en el handler
- Lanes/pools → grupos de routers/paginas
- Cada requirement MUST debe estar implementado (con TODO comments si la logica es compleja)

═══ FASE 3 · OUTPUT FORMATO OBLIGATORIO ═══
Devuelve EXCLUSIVAMENTE un objeto JSON valido con esta estructura:
{
  "summary": "resumen tecnico en 2-3 frases",
  "stack": {"backend": "fastapi", "frontend": "react+vite", "database": "mongodb"},
  "files": [
    {"path": "backend/main.py", "language": "python", "content": "..."},
    {"path": "frontend/src/App.jsx", "language": "javascript", "content": "..."},
    ...
  ],
  "next_steps": ["instalar deps backend", "instalar deps frontend", "configurar .env"]
}

Reglas estrictas del JSON:
1. NO uses markdown ```json. Devuelve SOLO el objeto JSON.
2. `content` debe ser texto plano (escapa \\n correctamente). NO uses ` ```python ` dentro de content.
3. Cada path debe ser relativo (ej. `backend/main.py`, NUNCA `/app/backend/main.py`).
4. Numero recomendado de archivos: 12-25 (suficiente para un MVP, sin crear basura).
5. NO incluyas tests, .git, node_modules ni archivos binarios.
6. Codigo en INGLES (variables, funciones), comentarios EN ESPAÑOL ok.
7. Si target=`backend` solo backend/, si target=`frontend` solo frontend/, si target=`fullstack` ambos."""


_SYSTEM_PROMPT_BACKEND = _SYSTEM_PROMPT_FULLSTACK + "\n\nIMPORTANTE: target=backend → genera SOLO archivos backend/ (no incluyas frontend/)."
_SYSTEM_PROMPT_FRONTEND = _SYSTEM_PROMPT_FULLSTACK + "\n\nIMPORTANTE: target=frontend → genera SOLO archivos frontend/ (no incluyas backend/)."


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _strip_xml_di(xml: str) -> str:
    """Strip the BPMNDiagram visualization block to keep prompts compact."""
    if not xml:
        return ""
    # remove <bpmndi:BPMNDiagram ... </bpmndi:BPMNDiagram>
    return re.sub(
        r"<bpmndi:BPMNDiagram[\s\S]*?</bpmndi:BPMNDiagram>",
        "<!-- DI omitted -->",
        xml,
    )


def _build_context(spec: dict, requirements: list, diagrams: list, notes: Optional[str]) -> str:
    speckit = spec.get("speckit_doc") or ""
    if len(speckit) > 6000:
        speckit = speckit[:6000] + "\n[...truncated]"

    req_lines = []
    for r in requirements:
        line = (
            f"- [{r.get('code', '?')}] [{(r.get('moscow') or '?').upper()}] "
            f"({r.get('type', '?')}) {r.get('title', '')}"
        )
        if r.get("description"):
            line += f" — {r['description'][:240]}"
        if r.get("acceptance_criteria"):
            line += "\n  Criterios: " + " | ".join((r["acceptance_criteria"] or [])[:3])
        req_lines.append(line)

    diag_blocks = []
    budget = 18000  # total chars across all diagrams
    for d in diagrams:
        xml = _strip_xml_di(d.get("current_xml") or "")
        if budget <= 0:
            break
        if len(xml) > budget:
            xml = xml[:budget] + "\n<!-- truncated -->"
        diag_blocks.append(f"### Diagrama: {d.get('name', '?')}\n```xml\n{xml}\n```")
        budget -= len(xml)

    parts = [
        f"## Especificacion: {spec.get('title', '')}",
        spec.get("description", ""),
        "",
        f"## Requirements ({len(requirements)})",
        "\n".join(req_lines),
    ]
    if speckit:
        parts.append("\n## Speckit\n" + speckit)
    if diag_blocks:
        parts.append("\n## Diagramas BPMN\n" + "\n\n".join(diag_blocks))
    if notes:
        parts.append("\n## Notas adicionales del usuario\n" + notes[:1000])
    return "\n".join(parts)


def _extract_json(text: str) -> dict:
    """Tolerant JSON extractor with code-fence stripping."""
    if not text:
        raise ValueError("Empty LLM response")
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```\s*$", "", cleaned)
    first = cleaned.find("{")
    last = cleaned.rfind("}")
    if first == -1 or last == -1:
        raise ValueError("No JSON object found in response")
    return json.loads(cleaned[first:last + 1])


def _validate_files(raw: list) -> List[dict]:
    """Sanitize the file list returned by the LLM."""
    out = []
    seen_paths = set()
    for f in raw or []:
        if not isinstance(f, dict):
            continue
        path = (f.get("path") or "").strip().lstrip("/")
        content = f.get("content")
        if not path or not isinstance(content, str):
            continue
        # Hard guard: reject path traversal & absolute paths
        if ".." in path or path.startswith(("/", "~")):
            continue
        if path in seen_paths:
            continue
        seen_paths.add(path)
        out.append({
            "path": path,
            "language": (f.get("language") or "text")[:20],
            "content": content,
            "size": len(content),
        })
    return out


# ---------------------------------------------------------------------------
# Background worker
# ---------------------------------------------------------------------------

async def _run_codegen(code_gen_id: str, system_msg: str, user_prompt: str, model_name: str, max_tokens: int):
    try:
        await db.code_generations.update_one(
            {"id": code_gen_id},
            {"$set": {"phase": "generating", "phase_at": _now_iso()}},
        )
        raw = await _call_deepseek(system_msg, user_prompt, max_tokens=max_tokens, model=model_name)

        await db.code_generations.update_one(
            {"id": code_gen_id},
            {"$set": {"phase": "post_processing", "phase_at": _now_iso()}},
        )
        try:
            parsed = _extract_json(raw)
        except Exception as e:
            raise ValueError(f"Invalid JSON from model: {e}; head={raw[:200]}")

        files = _validate_files(parsed.get("files") or [])
        if not files:
            raise ValueError("Model returned zero usable files")

        now = _now_iso()
        update = {
            "status": "ready",
            "phase": "complete",
            "phase_at": now,
            "completed_at": now,
            "summary": (parsed.get("summary") or "")[:1000],
            "stack": parsed.get("stack") or {},
            "next_steps": [str(s)[:300] for s in (parsed.get("next_steps") or [])[:8]],
            "files": files,
            "files_count": len(files),
            "total_size": sum(f["size"] for f in files),
            "raw_chars": len(raw),
            "error": None,
        }
        await db.code_generations.update_one({"id": code_gen_id}, {"$set": update})

        # Snapshot in project tree
        try:
            cg = await db.code_generations.find_one({"id": code_gen_id}, {"_id": 0})
            if cg and cg.get("project_id"):
                from routers.project_tree import create_snapshot
                await create_snapshot(
                    project_id=cg["project_id"],
                    phase="code",
                    resource_id=code_gen_id,
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
                    trigger="ai.code",
                    actor_email=cg.get("created_by") or "system",
                    label=f"Codegen {cg.get('target')} ({cg.get('model')})",
                )
        except Exception:
            logger.exception("Failed to snapshot codegen %s", code_gen_id)
    except Exception as e:
        logger.exception("codegen failed for %s", code_gen_id)
        await db.code_generations.update_one(
            {"id": code_gen_id},
            {"$set": {
                "status": "failed",
                "phase": "failed",
                "phase_at": _now_iso(),
                "error": str(e)[:600],
                "failed_at": _now_iso(),
            }},
        )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/{project_id}/generate-code", status_code=202)
async def generate_code(
    project_id: str,
    body: GenerateCodeRequest,
    background_tasks: BackgroundTasks,
    request: Request,
):
    user = await require_auth(request)
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    spec = await db.specifications.find_one({"id": body.spec_id}, {"_id": 0})
    if not spec:
        raise HTTPException(status_code=404, detail="Specification not found")
    if spec.get("project_id") != project_id:
        raise HTTPException(status_code=400, detail="Spec does not belong to this project")

    # Pull requirements (must + should + could to give the model coverage)
    requirements = await db.requirements.find(
        {"spec_id": body.spec_id}, {"_id": 0},
    ).sort("code", 1).to_list(300)
    if not requirements:
        raise HTTPException(status_code=400, detail="La specification no tiene requirements.")

    # Pull diagrams (project-level)
    diag_query: dict = {"id": {"$in": project.get("diagram_ids") or []}}
    if body.diagram_ids:
        diag_query["id"]["$in"] = [d for d in body.diagram_ids if d in project.get("diagram_ids", [])]
    diagrams = await db.diagrams.find(diag_query, {"_id": 0}).to_list(50) if diag_query["id"]["$in"] else []

    # Build prompt
    if body.target == "backend":
        system_msg = _SYSTEM_PROMPT_BACKEND
    elif body.target == "frontend":
        system_msg = _SYSTEM_PROMPT_FRONTEND
    else:
        system_msg = _SYSTEM_PROMPT_FULLSTACK
    context = _build_context(spec, requirements, diagrams, body.notes)
    user_prompt = (
        f"Proyecto: {project.get('name', '')}\n"
        f"Target: {body.target}\n\n"
        f"━━━ ENTRADA ━━━\n{context}\n\n"
        f"Genera el scaffold completo siguiendo el formato JSON obligatorio."
    )

    model_name = "deepseek-v4-pro" if body.variant == "pro" else "deepseek-v4-flash"
    max_tokens = 14000 if body.variant == "pro" else 9000

    code_gen_id = str(uuid.uuid4())
    now = _now_iso()
    doc = {
        "id": code_gen_id,
        "project_id": project_id,
        "spec_id": body.spec_id,
        "target": body.target,
        "variant": body.variant,
        "model": model_name,
        "status": "processing",
        "phase": "queued",
        "phase_at": now,
        "started_at": now,
        "created_at": now,
        "created_by": user.email,
        "diagrams_used": [d["id"] for d in diagrams],
        "requirements_used": len(requirements),
        "notes": (body.notes or "")[:1000],
        "files": [],
        "files_count": 0,
        "summary": None,
        "error": None,
    }
    await db.code_generations.insert_one(doc.copy())
    background_tasks.add_task(_run_codegen, code_gen_id, system_msg, user_prompt, model_name, max_tokens)

    await record_audit(
        "project.ai_code_generation_started",
        actor_email=user.email,
        actor_user_id=user.user_id,
        actor_role=user.role,
        resource_type="code_generation",
        resource_id=code_gen_id,
        details={
            "project_id": project_id,
            "spec_id": body.spec_id,
            "target": body.target,
            "variant": body.variant,
            "model": model_name,
            "requirements_count": len(requirements),
            "diagrams_count": len(diagrams),
        },
        request=request,
    )

    return {
        "status": "processing",
        "code_gen_id": code_gen_id,
        "model": model_name,
        "variant": body.variant,
        "started_at": now,
        "message": (
            f"Generacion iniciada. Polling GET /api/ai-projects/code-generations/{code_gen_id} "
            "hasta status='ready' o 'failed'."
        ),
    }


@router.get("/{project_id}/code-generations")
async def list_code_generations(project_id: str, request: Request):
    await require_auth(request)
    items = await db.code_generations.find(
        {"project_id": project_id},
        {"_id": 0, "files": 0},  # exclude bulky payload
    ).sort("created_at", -1).to_list(50)
    return {"items": items, "count": len(items)}


@router.get("/code-generations/{code_gen_id}")
async def get_code_generation(code_gen_id: str, request: Request, include_content: bool = True):
    await require_auth(request)
    proj_filter = {"id": code_gen_id}
    if include_content:
        cg = await db.code_generations.find_one(proj_filter, {"_id": 0})
    else:
        cg = await db.code_generations.find_one(proj_filter, {"_id": 0, "files": 0})
    if not cg:
        raise HTTPException(status_code=404, detail="Code generation not found")
    return cg


@router.delete("/code-generations/{code_gen_id}")
async def delete_code_generation(code_gen_id: str, request: Request):
    user = await require_auth(request)
    cg = await db.code_generations.find_one({"id": code_gen_id}, {"_id": 0})
    if not cg:
        raise HTTPException(status_code=404, detail="Code generation not found")
    # Allow author or admin
    if not _is_owner_or_admin(user, cg.get("created_by")):
        raise HTTPException(status_code=403, detail="Solo el autor o un admin pueden borrar esta generacion")
    await db.code_generations.delete_one({"id": code_gen_id})
    return {"status": "ok"}


@router.get("/code-generations/{code_gen_id}/download")
async def download_code_generation(code_gen_id: str, request: Request):
    await require_auth(request)
    cg = await db.code_generations.find_one({"id": code_gen_id}, {"_id": 0})
    if not cg:
        raise HTTPException(status_code=404, detail="Code generation not found")
    if cg.get("status") != "ready":
        raise HTTPException(status_code=400, detail=f"Code generation not ready (status={cg.get('status')})")
    files = cg.get("files") or []
    if not files:
        raise HTTPException(status_code=400, detail="No files to download")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # Manifest
        manifest = {
            "code_gen_id": cg["id"],
            "project_id": cg["project_id"],
            "spec_id": cg["spec_id"],
            "model": cg["model"],
            "target": cg["target"],
            "summary": cg.get("summary"),
            "stack": cg.get("stack"),
            "next_steps": cg.get("next_steps"),
            "created_at": cg["created_at"],
            "files_count": len(files),
        }
        zf.writestr("MANIFEST.json", json.dumps(manifest, indent=2, ensure_ascii=False))
        for f in files:
            zf.writestr(f["path"], f["content"])
    buf.seek(0)
    fname = f"codegen-{code_gen_id[:8]}.zip"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )

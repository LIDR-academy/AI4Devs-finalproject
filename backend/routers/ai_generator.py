# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""AI-driven project bootstrap.

Single endpoint today (`generate_requirements_from_brief`); the file is named
`ai_generator` so future phases (spec, BPMN, code scaffold) can plug in here
without disturbing the existing `routers/ai.py` (which is already crowded with
diagram-generation utilities).
"""
from __future__ import annotations

import json
import logging
import re
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from database import db, get_active_project_version_id
from routers.audit import record_audit
from routers.auth import require_auth
import routers.ai as _ai  # noqa: F401 — ensures LLM providers are registered
from llm_gateway import call_pinned
from routers.project_tree import snapshot_spec_full

router = APIRouter(prefix="/ai-projects", tags=["ai-projects"])
logger = logging.getLogger(__name__)

VALID_MODELS = {"deepseek", "deepseek-pro", "deepseek-flash", "minimax", "mimo", "opencode", "opencode-go", "auto", "cheap", "fast"}


# ---------------------------------------------------------------------------
# BPMN XML sanitizer & validator
# ---------------------------------------------------------------------------
# Common LLM mistakes we auto-repair before persisting the diagram:
#   1. Markdown fences leaking into the response.
#   2. Self-closing elements written as opening-only ("<dc:Bounds ...>" with
#      no closing tag and no "/>"). bpmn-js, like any XML parser, rejects this.
#   3. UTF-8 BOM at the start of the response.
#   4. Truncation: response cut off mid-tag (max_tokens hit).

# Tags that MUST be self-closing in BPMN/BPMNDI/DC namespaces.
_SELF_CLOSE_TAGS = (
    "dc:Bounds",
    "di:waypoint",
    "bpmndi:BPMNLabel",       # may also have inner content; only auto-close if empty
)


def _close_orphan_self_closing(xml: str) -> str:
    """Convert `<dc:Bounds ...>` into `<dc:Bounds .../>` when the user forgot.

    Only acts on tags that should ALWAYS be empty. Idempotent: a tag already
    self-closed (`/>`) or already has an explicit close tag is left as-is.
    """
    for tag in _SELF_CLOSE_TAGS:
        # Match <tag ...> that does NOT end with `/>` and is NOT followed by
        # a closing `</tag>` on the same line.
        pattern = re.compile(
            rf"<{re.escape(tag)}([^<>/]*?)(?<!/)>",
            re.MULTILINE,
        )
        # Only convert when the immediately-following text is NOT </tag>.
        def _repl(m: re.Match) -> str:
            attrs = m.group(1).rstrip()
            return f"<{tag}{(' ' + attrs) if attrs else ''}/>"
        # We need to be careful: bpmndi:BPMNLabel may legitimately have content.
        # For BPMNLabel only auto-close if the body is empty.
        if tag == "bpmndi:BPMNLabel":
            # Match `<bpmndi:BPMNLabel ...></bpmndi:BPMNLabel>` (empty) → `<.../>`
            xml = re.sub(
                rf"<{re.escape(tag)}([^<>/]*?)>\s*</{re.escape(tag)}>",
                lambda m: f"<{tag}{m.group(1).rstrip()}/>",
                xml,
            )
        else:
            xml = pattern.sub(_repl, xml)
    return xml


def _close_orphan_BPMNShape_BPMNEdge(xml: str) -> str:
    """Add missing `</bpmndi:BPMNShape>` / `</bpmndi:BPMNEdge>` closing tags.

    The LLM sometimes writes:
        <bpmndi:BPMNShape id="X" bpmnElement="Y">
            <dc:Bounds x="10" y="20" width="100" height="80"/>
        <bpmndi:BPMNShape id="X2" ...>   <-- forgot </bpmndi:BPMNShape>

    Walk the string token by token and balance these two specific tags.
    """
    for tag in ("bpmndi:BPMNShape", "bpmndi:BPMNEdge"):
        # Locate every opening (non-self-closing) and its expected close.
        opens = [
            m.start() for m in re.finditer(rf"<{re.escape(tag)}\b[^>]*(?<!/)>", xml)
        ]
        closes = [m.start() for m in re.finditer(rf"</{re.escape(tag)}>", xml)]
        deficit = len(opens) - len(closes)
        if deficit <= 0:
            continue
        # Insert the missing closing tag(s) right before the next sibling tag
        # OR just before </bpmndi:BPMNPlane>. Simpler heuristic: append before
        # </bpmndi:BPMNPlane> end-tag; bpmn-js accepts that ordering.
        insert_at = xml.find("</bpmndi:BPMNPlane>")
        if insert_at == -1:
            insert_at = xml.find("</bpmndi:BPMNDiagram>")
        if insert_at == -1:
            continue
        xml = xml[:insert_at] + (f"</{tag}>" * deficit) + xml[insert_at:]
    return xml


def _ensure_root_close(xml: str) -> str:
    """If the response was truncated mid-document, append the missing root close."""
    if "<bpmn:definitions" in xml and "</bpmn:definitions>" not in xml:
        xml = xml.rstrip() + "\n</bpmn:definitions>"
    elif "<definitions" in xml and "</definitions>" not in xml:
        xml = xml.rstrip() + "\n</definitions>"
    return xml


def _sanitize_bpmn_xml(raw: str) -> tuple[str, list[str]]:
    """Return (cleaned_xml, list_of_repairs_applied).

    The repair list is purely informational (logged + audit-trailed).
    """
    repairs: list[str] = []
    xml = raw.lstrip("\ufeff").strip()

    # Remove markdown fences if any
    if "```xml" in xml:
        xml = xml.split("```xml", 1)[1].split("```", 1)[0].strip()
        repairs.append("stripped ```xml fence")
    elif xml.startswith("```"):
        xml = xml.split("```", 2)[1].split("```", 1)[0].strip()
        repairs.append("stripped ``` fence")

    if "<bpmn:definitions" not in xml and "<definitions" not in xml:
        return xml, ["missing-root"]  # caller will reject

    before = xml
    xml = _close_orphan_self_closing(xml)
    if xml != before:
        repairs.append("auto-closed self-closing tags (dc:Bounds / di:waypoint / BPMNLabel)")

    before = xml
    xml = _close_orphan_BPMNShape_BPMNEdge(xml)
    if xml != before:
        repairs.append("balanced BPMNShape/BPMNEdge closes")

    before = xml
    xml = _ensure_root_close(xml)
    if xml != before:
        repairs.append("appended missing </bpmn:definitions>")

    return xml, repairs


def _validate_bpmn_parses(xml: str) -> Optional[str]:
    """Try to parse the XML. Return error message string or None on success."""
    try:
        ET.fromstring(xml)
        return None
    except ET.ParseError as e:
        return str(e)



# Internal canonical values — match the schema used by the rest of the app
# (lowercase MoSCoW, "functional"/"non_functional" types).
VALID_MOSCOW = {"must", "should", "could", "wont"}
VALID_TYPE = {"functional", "non_functional"}

# Aliases the LLM is likely to emit (we accept any case + common abbreviations
# and normalise them to the canonical forms above).
TYPE_ALIASES = {
    "fr": "functional",
    "functional": "functional",
    "func": "functional",
    "nfr": "non_functional",
    "non_functional": "non_functional",
    "non-functional": "non_functional",
    "nonfunctional": "non_functional",
}


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class GenerateRequirementsRequest(BaseModel):
    brief: str = Field(min_length=30, max_length=200000)
    model: str = "deepseek"
    target_count: int = Field(default=10, ge=3, le=20)
    opencode_model: Optional[str] = None  # specific model ID for OpenCode providers


class GenerateBpmnFromSpecRequest(BaseModel):
    spec_id: str
    model: str = "deepseek"
    diagram_name: Optional[str] = None
    only_must_should: bool = True  # ignore COULD/WONT to keep the diagram focused
    opencode_model: Optional[str] = None  # specific model ID for OpenCode providers


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """Eres un Business Analyst senior especializado en metodologia SDD (Spec-Driven Development).

A partir de la descripcion de un proyecto que te dara el usuario, debes generar una lista de requisitos siguiendo:
  - Modelo MoSCoW (MUST / SHOULD / COULD / WONT)
  - Matriz RACI (Responsible / Accountable / Consulted / Informed)
  - Distincion FR (funcional) vs NFR (no funcional, ej. rendimiento, seguridad, GDPR, accesibilidad)

Reglas estrictas:
  1. Devuelve EXCLUSIVAMENTE JSON valido. Nada de texto antes ni despues. Nada de markdown ```.
  2. La estructura DEBE ser:
     {
       "summary": "una linea resumen del proyecto, max 120 caracteres",
       "requirements": [
         {
           "code": "FR-001",
           "title": "titulo corto, max 80 chars",
           "description": "descripcion clara de 2-3 frases",
           "type": "FR" | "NFR",
           "category": "frontend" | "backend" | "seguridad" | "ux" | "integracion" | "legal" | "rendimiento" | "datos" | "otros",
           "moscow": "MUST" | "SHOULD" | "COULD" | "WONT",
           "raci": {
             "responsible": "rol o equipo concreto",
             "accountable": "rol o persona concreta",
             "consulted": ["rol1", "rol2"],
             "informed": ["rol1"]
           },
           "acceptance_criteria": ["criterio 1 testeable", "criterio 2 testeable"],
           "tags": ["tag1", "tag2"]
         }
       ]
     }
  3. Codigos: FR-001..FR-NNN para funcionales, NFR-001..NFR-NNN para no funcionales (numeracion separada, secuencial sin saltos).
  4. Mezcla MUST (40%), SHOULD (30%), COULD (20%), WONT (10%) — distribucion sana.
  5. SIEMPRE incluye al menos 2 NFR (seguridad/rendimiento/legal/accesibilidad).
  6. Acceptance criteria: 2-4 por requirement, redactados como condiciones VERIFICABLES (no opiniones).
  7. RACI.responsible y accountable son strings simples (un rol, no lista).
  8. RACI.consulted e informed son listas de strings (pueden estar vacias).
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _extract_json(text: str) -> dict:
    """Strip ```json fences if present and parse.

    On truncation (max_tokens cutoff) we still try to recover the
    `requirements` array — partial requirements at the end are skipped, valid
    earlier ones are kept.
    """
    if not text:
        raise ValueError("Empty LLM response")
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```\s*$", "", cleaned)
    cleaned = cleaned.strip()
    first = cleaned.find("{")
    last = cleaned.rfind("}")
    if first == -1:
        raise ValueError("No JSON object found in response")

    # Best case: the response is a complete object.
    if last != -1:
        try:
            return json.loads(cleaned[first:last + 1])
        except json.JSONDecodeError:
            pass

    # Recovery path: extract `summary` (may be missing) + `requirements` array.
    summary_match = re.search(r'"summary"\s*:\s*"([^"]*)"', cleaned)
    summary = summary_match.group(1) if summary_match else ""
    arr_start = cleaned.find('"requirements"')
    if arr_start == -1:
        raise ValueError("No requirements array found in response")
    arr_text = cleaned[arr_start:]
    requirements = _coerce_json_array(arr_text)
    if not requirements:
        raise ValueError("Could not recover any requirement from response")
    return {"summary": summary, "requirements": requirements}


def _normalize_requirement(raw: dict, fallback_idx: int) -> Optional[dict]:
    """Best-effort normalization. Returns None if the row is unsalvageable."""
    title = (raw.get("title") or "").strip()
    description = (raw.get("description") or "").strip()
    if not title or not description:
        return None

    rtype_raw = (raw.get("type") or "FR").strip().lower()
    rtype = TYPE_ALIASES.get(rtype_raw, "functional")
    moscow = (raw.get("moscow") or "should").strip().lower()
    if moscow not in VALID_MOSCOW:
        moscow = "should"

    code_prefix = "FR" if rtype == "functional" else "NFR"
    code = (raw.get("code") or f"{code_prefix}-{fallback_idx:03d}").strip().upper()

    raci_raw = raw.get("raci") or {}
    if not isinstance(raci_raw, dict):
        raci_raw = {}
    consulted = raci_raw.get("consulted") or []
    informed = raci_raw.get("informed") or []
    if isinstance(consulted, str):
        consulted = [consulted]
    if isinstance(informed, str):
        informed = [informed]

    return {
        "code": code,
        "title": title[:180],
        "description": description,
        "type": rtype,
        "category": (raw.get("category") or "").strip().lower() or "otros",
        "moscow": moscow,
        "raci": {
            "responsible": (raci_raw.get("responsible") or "").strip(),
            "accountable": (raci_raw.get("accountable") or "").strip(),
            "consulted": [str(c).strip() for c in consulted if str(c).strip()],
            "informed": [str(i).strip() for i in informed if str(i).strip()],
        },
        "acceptance_criteria": [
            str(c).strip()
            for c in (raw.get("acceptance_criteria") or [])
            if str(c).strip()
        ],
        "tags": [str(t).strip() for t in (raw.get("tags") or []) if str(t).strip()],
    }


async def _call_llm(model: str, system: str, user: str, opencode_model: str | None = None) -> str:
    """Dispatch to the requested provider via the LLM gateway registry.

    DeepSeek variants:
      - deepseek-pro:  V4-Pro  (1M ctx, max quality, slower)
      - deepseek-flash: V4-Flash (1M ctx, faster/cheaper)
      - deepseek:       V4-Flash (default for backwards compat)
    """
    if model in ("deepseek-pro", "deepseek-flash", "deepseek"):
        variant = "deepseek-v4-pro" if model == "deepseek-pro" else "deepseek-v4-flash"
        return await call_pinned("deepseek", system, user, max_tokens=8192, model=variant)
    if model in ("opencode", "opencode-go"):
        return await call_pinned(model, system, user, max_tokens=8192, model=opencode_model)
    if model in ("minimax", "mimo"):
        return await call_pinned(model, system, user)
    if model in ("auto", "cheap", "fast"):
        return await call_pinned(model, system, user, max_tokens=8192)
    # Unknown model: keep legacy default
    return await call_pinned("deepseek", system, user, max_tokens=8192, model="deepseek-v4-flash")


def _coerce_json_array(text: str) -> list:
    """Tolerant best-effort recovery of a partial JSON array.

    DeepSeek-flash sometimes truncates near max_tokens, leaving the trailing
    requirement object unclosed. We progressively trim from the end until a
    valid JSON array parses.
    """
    if not text or "[" not in text:
        return []
    start = text.find("[")
    body = text[start:]
    # Try to find a clean closing ]; fall back to truncation recovery
    for end_idx in range(len(body), 0, -1):
        sub = body[:end_idx]
        if sub.endswith("]"):
            try:
                return json.loads(sub)
            except json.JSONDecodeError:
                continue
        # Try to add a closing bracket on the last comma-terminated element
        if sub.rstrip().endswith(","):
            try:
                return json.loads(sub.rstrip().rstrip(",") + "]")
            except json.JSONDecodeError:
                continue
        if sub.rstrip().endswith("}"):
            try:
                return json.loads(sub + "]")
            except json.JSONDecodeError:
                continue
    return []


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/{project_id}/generate-requirements")
async def generate_requirements_from_brief(
    project_id: str,
    body: GenerateRequirementsRequest,
    request: Request,
):
    """Generate MoSCoW + RACI requirements from a free-text project brief.

    Side effects:
      * Creates a Specification named "Requirements iniciales (IA)" if one
        with the same `created_by_ai=True` flag does not already exist for
        the project.
      * Inserts each parsed requirement under that specification.
      * Records an audit log entry `project.ai_requirements_generated`.

    Returns:
        {
            "spec_id": str,
            "spec_title": str,
            "summary": str,
            "requirements_created": int,
            "requirements": [...],
            "model": str,
        }
    """
    user = await require_auth(request)

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    model = body.model.lower()
    if model not in VALID_MODELS:
        raise HTTPException(status_code=400, detail=f"Invalid model. Use one of: {VALID_MODELS}")

    user_prompt = (
        f"PROYECTO: {project.get('name', '')}\n\n"
        f"DESCRIPCION DEL USUARIO:\n{body.brief}\n\n"
        f"Genera aproximadamente {body.target_count} requirements siguiendo las reglas del sistema. "
        "Recuerda: SOLO JSON, sin markdown, sin texto extra."
    )

    try:
        raw_response = await _call_llm(model, _SYSTEM_PROMPT, user_prompt, opencode_model=body.opencode_model)
    except Exception as e:
        logger.exception("LLM call failed during requirement generation")
        raise HTTPException(status_code=502, detail=f"AI provider error: {e}") from e

    try:
        parsed = _extract_json(raw_response)
    except Exception as e:
        logger.warning("Failed to parse LLM response: %s | response_head=%s", e, raw_response[:200])
        raise HTTPException(
            status_code=502,
            detail="AI returned invalid JSON. Try again or change model.",
        )

    summary = (parsed.get("summary") or "").strip()
    raw_reqs = parsed.get("requirements") or []
    if not isinstance(raw_reqs, list) or not raw_reqs:
        raise HTTPException(status_code=502, detail="AI did not return a requirements list")

    # ---- Persist a Specification container for these requirements ----
    spec_id = str(uuid.uuid4())
    now = _now_iso()

    # Auto-link to the highest-numbered active project version
    project_version_id = await get_active_project_version_id(project_id)

    spec_doc = {
        "id": spec_id,
        "project_id": project_id,
        "title": "Requirements iniciales (IA)",
        "project_version_id": project_version_id,
        "description": summary
        or f"Requirements generados a partir de la descripcion del proyecto ({model}).",
        "mode": "requirements_only",
        "status": "draft",
        "tags": ["ai-generated"],
        "speckit_doc": None,
        "speckit_status": None,
        "speckit_phase": None,
        "speckit_outdated": False,
        "requirements_count": 0,
        "created_by": user.email,
        "created_by_ai": True,
        "ai_model": model,
        "ai_brief": body.brief[:5000],
        "created_at": now,
        "updated_at": now,
    }
    await db.specifications.insert_one(spec_doc.copy())

    # ---- Persist each requirement ----
    created = []
    fr_seq = 1
    nfr_seq = 1
    for raw in raw_reqs:
        if not isinstance(raw, dict):
            continue
        rtype_raw = (raw.get("type") or "fr").strip().lower()
        rtype = TYPE_ALIASES.get(rtype_raw, "functional")
        idx = fr_seq if rtype == "functional" else nfr_seq
        norm = _normalize_requirement(raw, idx)
        if not norm:
            continue
        if norm["type"] == "non_functional":
            norm["code"] = f"NFR-{nfr_seq:03d}"
            nfr_seq += 1
        else:
            norm["code"] = f"FR-{fr_seq:03d}"
            fr_seq += 1

        req_doc = {
            "id": str(uuid.uuid4()),
            "spec_id": spec_id,
            **norm,
            "linked_diagrams": [],
            "linked_classes": [],
            "created_by": user.email,
            "created_by_ai": True,
            "created_at": now,
            "updated_at": now,
        }
        await db.requirements.insert_one(req_doc.copy())
        created.append(req_doc)

    await db.specifications.update_one(
        {"id": spec_id},
        {"$set": {"requirements_count": len(created)}},
    )

    # Auto-snapshot v1 of the brand-new spec for the project tree
    try:
        await snapshot_spec_full(
            project_id=project_id,
            spec_id=spec_id,
            trigger="ai.requirements",
            actor_email=user.email,
            label=f"Generado por IA ({model}) — {len(created)} requirements",
        )
    except Exception:
        logger.exception("snapshot_spec_full failed (non-fatal) for spec %s", spec_id)

    # Auto-save generated requirements as a .md file in descripcion/
    try:
        now = datetime.now(timezone.utc).isoformat()
        # Build markdown content
        md_lines = [
            f"# Requirements Generados por IA",
            f"",
            f"**Modelo:** {model}",
            f"**Fecha:** {now[:10]}",
            f"**Total:** {len(created)} requirements",
            f"**Spec ID:** {spec_id}",
            f"",
            f"---",
            f"",
        ]
        for r in created:
            moscow = r.get("moscow", "").upper()
            moscow_icon = {"MUST": "🔴", "SHOULD": "🟡", "COULD": "🟢", "WONT": "⚪"}.get(moscow, "")
            md_lines.append(f"### {r['code']} — {r['title']} {moscow_icon} {moscow}")
            md_lines.append(f"")
            md_lines.append(f"**Tipo:** {r.get('type', 'functional')} | **Categoría:** {r.get('category', 'general')}")
            md_lines.append(f"")
            md_lines.append(r.get("description", ""))
            if r.get("acceptance_criteria"):
                md_lines.append(f"")
                md_lines.append(f"**Criterios de aceptación:** {r['acceptance_criteria']}")
            if r.get("tags"):
                md_lines.append(f"")
                md_lines.append(f"**Tags:** {', '.join(r['tags']) if isinstance(r['tags'], list) else r['tags']}")
            md_lines.append(f"")
            md_lines.append(f"---")
            md_lines.append(f"")

        content = "\n".join(md_lines)

        # Find or create descripcion/ directory in project_files
        desc_dir = await db.project_files.find_one({
            "project_id": project_id,
            "parent_id": None,
            "type": "directory",
            "name": "descripcion",
        })
        if not desc_dir:
            dir_id = str(uuid.uuid4())
            desc_dir = {
                "id": dir_id, "project_id": project_id,
                "parent_id": None, "type": "directory",
                "name": "descripcion", "content": "",
                "created_by": user.email,
                "created_at": now, "updated_at": now,
            }
            await db.project_files.insert_one(dict(desc_dir))
        desc_dir_id = desc_dir["id"]

        # Upsert the requirements file
        file_name = f"requirements-ia.md"
        existing_file = await db.project_files.find_one({
            "project_id": project_id,
            "parent_id": desc_dir_id,
            "name": file_name,
        })
        if existing_file:
            await db.project_files.update_one(
                {"id": existing_file["id"]},
                {"$set": {"content": content, "updated_at": now}}
            )
        else:
            file_id = str(uuid.uuid4())
            await db.project_files.insert_one({
                "id": file_id, "project_id": project_id,
                "parent_id": desc_dir_id, "type": "file",
                "name": file_name, "content": content,
                "created_by": user.email,
                "created_at": now, "updated_at": now,
            })
        logger.info("Requirements saved as project file: %s/descripcion/%s (%d chars)",
                    project_id, file_name, len(content))
    except Exception:
        logger.exception("Failed to auto-save requirements as project file (non-fatal)")

    await record_audit(
        "project.ai_requirements_generated",
        actor_email=user.email,
        actor_user_id=user.user_id,
        actor_role=user.role,
        resource_type="project",
        resource_id=project_id,
        details={
            "model": model,
            "brief_chars": len(body.brief),
            "requirements_count": len(created),
            "spec_id": spec_id,
        },
        request=request,
    )

    return {
        "spec_id": spec_id,
        "spec_title": spec_doc["title"],
        "summary": summary,
        "requirements_created": len(created),
        "requirements": created,
        "model": model,
    }


def _extract_bpmn_documentation_links(xml: str, requirements: list) -> list:
    """Parse AI-generated BPMN XML and extract element→requirement mappings.

    Looks for <bpmn:documentation> elements inside tasks (userTask, task,
    serviceTask, etc.) that contain requirement codes (e.g. "FR-001" or
    "FR-001,NFR-002"). Maps them to requirement IDs so that the BPMN editor's
    MoSCoW markers and overlays work automatically.
    """
    # Build code→id lookup from the requirements list
    code_to_id = {}
    for r in requirements:
        code = (r.get("code") or "").strip().upper()
        if code:
            code_to_id[code] = r["id"]

    if not code_to_id:
        return []

    try:
        root = ET.fromstring(xml)
    except ET.ParseError:
        return []

    # BPMN namespace
    ns = "http://www.omg.org/spec/BPMN/20100524/MODEL"
    task_tags = {
        f"{{{ns}}}userTask",
        f"{{{ns}}}task",
        f"{{{ns}}}serviceTask",
        f"{{{ns}}}sendTask",
        f"{{{ns}}}receiveTask",
        f"{{{ns}}}manualTask",
        f"{{{ns}}}businessRuleTask",
        f"{{{ns}}}scriptTask",
    }

    links = []
    for task_elem in root.iter():
        tag = task_elem.tag.split("}")[-1] if "}" in task_elem.tag else task_elem.tag
        # Only process task elements
        full_tag = task_elem.tag
        if full_tag not in task_tags:
            # Also match without namespace prefix
            local = full_tag.split("}")[-1] if "}" in full_tag else full_tag
            if local not in {"userTask", "task", "serviceTask", "sendTask",
                              "receiveTask", "manualTask", "businessRuleTask",
                              "scriptTask"}:
                continue

        element_id = task_elem.get("id")
        if not element_id:
            continue

        # Find <bpmn:documentation> child
        doc_elem = task_elem.find(f"{{{ns}}}documentation")
        if doc_elem is None:
            # Try without namespace
            for child in task_elem:
                if child.tag.split("}")[-1] == "documentation":
                    doc_elem = child
                    break
        if doc_elem is None:
            continue

        doc_text = (doc_elem.text or "").strip()
        if not doc_text:
            continue

        # Split by comma to handle multiple requirement codes
        for part in doc_text.split(","):
            code = part.strip().upper()
            req_id = code_to_id.get(code)
            if req_id:
                links.append({
                    "element_id": element_id,
                    "requirement_id": req_id,
                })

    return links


# ---------------------------------------------------------------------------
# BPMN generation from spec
# ---------------------------------------------------------------------------

_BPMN_SYSTEM_PROMPT = """Eres un experto en BPMN 2.0 y modelado de procesos de negocio.

Recibiras una especificacion tecnica (Speckit) + lista de requirements MoSCoW + RACI.
Tu tarea: generar un diagrama BPMN 2.0 XML VALIDO que represente el flujo principal del proceso.

Reglas estrictas:
  1. Devuelve EXCLUSIVAMENTE el XML BPMN 2.0. Nada de markdown, nada de texto antes o despues.
  2. Estructura obligatoria:
     - <bpmn:definitions> con namespaces correctos:
         xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
         xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
         xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
         xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         targetNamespace="http://bpmn.io/schema/bpmn"
     - <bpmn:process id="Process_1" isExecutable="false"> con:
         * 1 <bpmn:startEvent id="StartEvent_1" name="..."/>
         * 1+ <bpmn:endEvent id="EndEvent_X" name="..."/>
         * Tareas como <bpmn:userTask>, <bpmn:serviceTask> o <bpmn:task> segun el contexto
         * <bpmn:exclusiveGateway> para decisiones binarias (solo si los reqs lo requieren)
         * <bpmn:sequenceFlow> conectando todos los nodos
     - <bpmndi:BPMNDiagram> con layout cartesiano:
         * Cada elemento del proceso debe tener su <bpmndi:BPMNShape> con bounds (x, y, width, height)
         * Cada flow debe tener <bpmndi:BPMNEdge> con waypoints
         * Layout horizontal: empieza en x=180, separa cada elemento ~150px, todos a y=200
         * Tareas: width=100 height=80
         * Eventos: width=36 height=36
         * Gateways: width=50 height=50
  3. IDs unicos, sin espacios, formato CamelCase con prefijo (StartEvent_, Task_, Gateway_, EndEvent_, Flow_).
  4. PARA CADA TAREA (userTask/serviceTask/task) que corresponda a un requirement:
     - Incluye SIEMPRE un elemento <bpmn:documentation> DENTRO de la tarea
       con EXACTAMENTE el codigo del requirement que representa (ej: FR-001, NFR-002).
       Ejemplo: <bpmn:userTask id="Task_1" name="Login de usuario">
                  <bpmn:documentation>FR-001</bpmn:documentation>
                </bpmn:userTask>
     - Si una tarea cubre varios requirements, pon todos los codigos separados por comas:
       <bpmn:documentation>FR-001,FR-002</bpmn:documentation>
     - NO incluyas prefijos [MUST]/[SHOULD] en el name; el name debe ser descriptivo y limpio.
  5. NO incluyas <bpmn:lane>, <bpmn:pool> ni <bpmn:participant> a menos que la spec mencione actores diferenciados claros.
  6. El XML debe parsear con bpmn-js sin errores."""


@router.post("/{project_id}/generate-bpmn-from-spec")
async def generate_bpmn_from_spec(
    project_id: str,
    body: GenerateBpmnFromSpecRequest,
    request: Request,
):
    """Generate a BPMN 2.0 diagram from a specification's requirements + speckit doc.

    Side effects:
      * Creates a new diagram in the project.
      * Inserts an initial Version 1 in the `versions` collection.
      * Vincula automaticamente cada requirement con el nuevo diagrama
        (`requirements.linked_diagrams`).
      * Audit log `project.ai_bpmn_generated`.
    """
    user = await require_auth(request)

    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    spec = await db.specifications.find_one({"id": body.spec_id}, {"_id": 0})
    if not spec:
        raise HTTPException(status_code=404, detail="Specification not found")
    if spec.get("project_id") != project_id:
        raise HTTPException(status_code=400, detail="Spec does not belong to this project")

    model = body.model.lower()
    if model not in VALID_MODELS:
        raise HTTPException(status_code=400, detail=f"Invalid model. Use one of: {VALID_MODELS}")

    # Pull requirements (filtered if requested)
    req_query: dict = {"spec_id": body.spec_id}
    if body.only_must_should:
        req_query["moscow"] = {"$in": ["must", "should"]}
    requirements = (
        await db.requirements.find(req_query, {"_id": 0}).sort("code", 1).to_list(200)
    )
    if not requirements:
        raise HTTPException(
            status_code=400,
            detail="La specification no tiene requirements (al menos MUST/SHOULD) para generar BPMN.",
        )

    # Build the prompt context
    req_lines = []
    for r in requirements:
        line = (
            f"- [{r.get('code', '')}] [{r.get('moscow', '?').upper()}] "
            f"({r.get('type', '?')}) {r.get('title', '')}"
        )
        if r.get("description"):
            line += f" — {r['description'][:200]}"
        req_lines.append(line)

    speckit_block = ""
    if spec.get("speckit_doc"):
        # Truncate the speckit doc to keep prompt size manageable (~6k chars max)
        speckit_block = (
            "\n\n## Especificacion tecnica (Speckit)\n"
            + (spec["speckit_doc"][:6000])
            + ("\n[truncated]" if len(spec["speckit_doc"]) > 6000 else "")
        )

    user_prompt = (
        f"PROYECTO: {project.get('name', '')}\n"
        f"ESPECIFICACION: {spec.get('title', '')}\n\n"
        f"## Requirements ({len(requirements)} items)\n"
        + "\n".join(req_lines)
        + speckit_block
        + "\n\nGenera el diagrama BPMN 2.0 XML completo segun las reglas del sistema. "
        "SOLO XML, sin markdown."
    )

    try:
        raw_response = await _call_llm(model, _BPMN_SYSTEM_PROMPT, user_prompt, opencode_model=body.opencode_model)
    except Exception as e:
        logger.exception("LLM call failed during BPMN generation")
        raise HTTPException(status_code=502, detail=f"AI provider error: {e}") from e

    # Sanitize + validate. If the sanitizer can't fix it, retry the LLM once
    # passing back the parser error so the model self-corrects.
    xml, repairs = _sanitize_bpmn_xml(raw_response)
    if "missing-root" in repairs:
        raise HTTPException(
            status_code=502,
            detail="AI did not return valid BPMN XML. Try a different model.",
        )
    parse_err = _validate_bpmn_parses(xml)
    if parse_err:
        logger.warning("BPMN XML did not parse after sanitize: %s", parse_err)
        retry_prompt = (
            user_prompt
            + "\n\nNOTA: tu respuesta anterior produjo este error de parser XML:\n"
            f"  {parse_err}\n"
            "Devuelve EXCLUSIVAMENTE el BPMN 2.0 XML completo y bien formado, "
            "todos los tags cerrados (`<dc:Bounds .../>`, `<di:waypoint .../>` deben ser self-closing). "
            "Sin markdown, sin texto extra, sin truncar."
        )
        try:
            raw_response = await _call_llm(model, _BPMN_SYSTEM_PROMPT, retry_prompt, opencode_model=body.opencode_model)
        except Exception as e:
            logger.exception("LLM retry failed during BPMN generation")
            raise HTTPException(status_code=502, detail=f"AI retry error: {e}") from e
        xml, repairs2 = _sanitize_bpmn_xml(raw_response)
        repairs = repairs + ["retry-attempted"] + repairs2
        parse_err2 = _validate_bpmn_parses(xml)
        if parse_err2:
            logger.error("BPMN XML still invalid after retry: %s", parse_err2)
            raise HTTPException(
                status_code=502,
                detail=(
                    f"AI returned malformed BPMN XML after retry: {parse_err2}. "
                    "Pulsa 'Generar de nuevo' o cambia de modelo."
                ),
            )

    if repairs:
        logger.info("BPMN sanitizer repairs applied for project=%s: %s", project_id, repairs)

    # ---- Extract element → requirement links from <bpmn:documentation> ----
    element_req_links = _extract_bpmn_documentation_links(xml, requirements)
    if element_req_links:
        logger.info(
            "Extracted %d element→requirement links from AI-generated BPMN for spec=%s",
            len(element_req_links), body.spec_id,
        )

    # Persist the diagram
    diagram_id = str(uuid.uuid4())
    diagram_name = body.diagram_name or f"{spec.get('title', 'Spec')} — Flujo Principal"
    now_dt = datetime.now(timezone.utc)
    now = now_dt.isoformat()
    diagram_doc = {
        "id": diagram_id,
        "name": diagram_name[:120],
        "description": f"Generado por IA ({model}) desde la especificacion '{spec.get('title')}'",
        "current_xml": xml,
        "current_version": 1,
        "tags": ["ai-generated", "from-spec"],
        "created_by": user.email,
        "created_by_ai": True,
        "ai_model": model,
        "ai_source_spec_id": body.spec_id,
        "created_at": now,
        "updated_at": now,
    }
    await db.diagrams.insert_one(diagram_doc.copy())

    # Initial version
    await db.versions.insert_one({
        "id": str(uuid.uuid4()),
        "diagram_id": diagram_id,
        "version_number": 1,
        "xml_content": xml,
        "commit_message": f"Generado automaticamente con {model} desde {spec.get('title')}",
        "parent_version": None,
        "tags": ["ai-generated"],
        "created_by": user.email,
        "created_at": now,
    })

    # Attach to project
    await db.projects.update_one(
        {"id": project_id},
        {
            "$addToSet": {"diagram_ids": diagram_id},
            "$set": {"updated_at": now},
        },
    )

    # Auto-link requirements to this diagram for live traceability
    req_ids = [r["id"] for r in requirements]
    if req_ids:
        await db.requirements.update_many(
            {"id": {"$in": req_ids}},
            {"$addToSet": {"linked_diagrams": diagram_id}, "$set": {"updated_at": now}},
        )

    # Create element-level requirement links so MoSCoW markers work in the editor
    if element_req_links:
        link_docs = []
        for link in element_req_links:
            link_docs.append({
                "id": str(uuid.uuid4()),
                "diagram_id": diagram_id,
                "element_id": link["element_id"],
                "requirement_id": link["requirement_id"],
                "spec_id": body.spec_id,
                "created_by": user.email,
                "created_at": now,
            })
        if link_docs:
            await db.element_requirement_links.insert_many(link_docs)
            logger.info(
                "Created %d element_requirement_links for diagram=%s",
                len(link_docs), diagram_id,
            )

    await record_audit(
        "project.ai_bpmn_generated",
        actor_email=user.email,
        actor_user_id=user.user_id,
        actor_role=user.role,
        resource_type="diagram",
        resource_id=diagram_id,
        details={
            "model": model,
            "spec_id": body.spec_id,
            "requirements_used": len(requirements),
            "xml_length": len(xml),
        },
        request=request,
    )

    return {
        "diagram_id": diagram_id,
        "diagram_name": diagram_doc["name"],
        "xml_length": len(xml),
        "requirements_used": len(requirements),
        "model": model,
    }


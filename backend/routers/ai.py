# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import logging
import uuid
import re
import os

from database import db
from models import AIGenerateRequest, CodeAnalyzeRequest, GenerateSummaryRequest, ProcessPromptRequest, RewriteContentRequest
from routers.audit import record_audit
from routers.auth import get_current_user
from llm_gateway import (
    call_pinned,
    call_with_fallback,
    extract_anthropic_response,
    extract_openai_response,
    get_provider,
    register_provider,
    run_metered,
    run_metered_cached,
)
from llm_gateway.config_store import resolve_runtime
from llm_gateway.router import get_default_chain

router = APIRouter(prefix="/ai", tags=["ai"])
logger = logging.getLogger(__name__)

MINIMAX_API_KEY = os.environ.get("MINIMAX_API_KEY", "")
MIMO_API_KEY = os.environ.get("MIMO_API_KEY", "")
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-pro")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")
OPENCODE_API_KEY = os.environ.get("OPENCODE_API_KEY", "")
OPENCODE_MODEL = os.environ.get("OPENCODE_MODEL", "deepseek-v4-pro")
OPENCODE_GO_MODEL = os.environ.get("OPENCODE_GO_MODEL", "deepseek-v4-pro")
# Default provider when the caller does not specify one. Valid values:
# "deepseek" (recommended), "minimax", "mimo", "opencode", "opencode-go".
DEFAULT_LLM_PROVIDER = os.environ.get("DEFAULT_LLM_PROVIDER", "deepseek").lower()


async def _call_default_llm(system_msg: str, user_prompt: str, session_prefix: str = "task") -> str:
    """Call the configured default LLM. When DEFAULT_LLM_PROVIDER pins a specific
    provider it is called directly; otherwise the fallback chain applies —
    ordered by admin-editable priority when Mongo configs exist, else the
    static default (deepseek -> minimax -> mimo) — skipping unconfigured,
    disabled or circuit-broken providers and falling through on retryable
    errors (429/5xx/timeout)."""
    provider = DEFAULT_LLM_PROVIDER

    if provider != "deepseek" and get_provider(provider) is not None:
        return await call_pinned(provider, system_msg, user_prompt)

    return await call_with_fallback(await get_default_chain(), system_msg, user_prompt)


class AIProjectRequest(BaseModel):
    prompt: str
    llm_provider: str = "deepseek"
    project_name: Optional[str] = None


@router.post("/generate-project")
async def generate_project_with_ai(data: AIProjectRequest, request: Request):
    """Step 1: Analyze prompt and plan which BPMN diagrams to generate."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    plan_prompt = f"""Analiza esta descripcion de proyecto/negocio y determina EXACTAMENTE que diagramas BPMN 2.0 se necesitan para modelar todos los procesos.

DESCRIPCION:
{data.prompt}

Responde SOLO en formato JSON valido (sin markdown, sin ```), con esta estructura exacta:
{{
  "project_name": "Nombre sugerido del proyecto",
  "project_description": "Descripcion breve del proyecto",
  "diagrams": [
    {{
      "name": "Nombre del diagrama BPMN",
      "description": "Que modela este diagrama",
      "prompt": "Instrucciones detalladas para generar el BPMN XML de este diagrama especifico. Incluye tareas, gateways, eventos, roles y flujos."
    }}
  ]
}}

Genera entre 2 y 8 diagramas segun la complejidad. Cada prompt debe ser MUY detallado para generar un BPMN completo."""

    provider = data.llm_provider
    try:
        sys_msg = "Eres un experto en procesos BPMN 2.0. Responde SOLO en JSON valido."
        response = await call_pinned(provider, sys_msg, plan_prompt)

        import json
        clean = response.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
            clean = clean.strip()
        plan = json.loads(clean)
        return plan
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="La IA no devolvio un JSON valido. Intenta de nuevo.")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error IA: {str(e)}")


@router.post("/generate-project-diagrams")
async def generate_project_diagrams(request: Request):
    """Step 2: Generate BPMN XML for each diagram in the plan, create project + diagrams in DB."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    body = await request.json()
    project_name = body.get("project_name", "Proyecto IA")
    project_description = body.get("project_description", "")
    diagrams_plan = body.get("diagrams", [])
    llm_provider = body.get("llm_provider", "deepseek")

    if not diagrams_plan:
        raise HTTPException(status_code=400, detail="No diagrams to generate")

    from datetime import datetime, timezone

    # Create project
    project_id = str(uuid.uuid4())
    project_doc = {
        "id": project_id, "name": project_name, "description": project_description,
        "color": "#2563EB", "icon": "rocket", "tags": ["IA-generado"],
        "diagram_ids": [], "created_by": user.email,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.insert_one(project_doc)

    generated = []
    for diag in diagrams_plan:
        diag_name = diag.get("name", "Diagrama")
        diag_prompt = diag.get("prompt", diag_name)
        try:
            bpmn_prompt = f"Generate a complete BPMN 2.0 XML diagram for: {diag_prompt}. Include proper bpmn:definitions, bpmn:process, startEvent, endEvent, tasks, gateways, sequenceFlows and bpmndi:BPMNDiagram layout. Return ONLY the XML."

            bpmn_sys = "You are a BPMN 2.0 expert. Generate valid BPMN 2.0 XML. Return ONLY the XML."
            xml_resp = await call_pinned(llm_provider, bpmn_sys, bpmn_prompt)

            xml_content = xml_resp
            if "```xml" in xml_resp:
                xml_content = xml_resp.split("```xml")[1].split("```")[0].strip()
            elif "```" in xml_resp:
                xml_content = xml_resp.split("```")[1].split("```")[0].strip()

            diagram_id = str(uuid.uuid4())
            diagram_doc = {
                "id": diagram_id, "name": diag_name, "description": diag.get("description", ""),
                "current_xml": xml_content, "created_by": user.email,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "versions": [{"version_number": 1, "xml": xml_content,
                              "commit_message": "Generado con IA", "tags": ["auto-generated"],
                              "created_at": datetime.now(timezone.utc).isoformat()}],
            }
            await db.diagrams.insert_one(diagram_doc)
            await db.projects.update_one({"id": project_id}, {"$push": {"diagram_ids": diagram_id}})
            generated.append({"id": diagram_id, "name": diag_name, "status": "ok"})
        except Exception as e:
            generated.append({"id": None, "name": diag_name, "status": "error", "error": str(e)})

    await _record_ai_for_user(request)
    return {"project_id": project_id, "project_name": project_name, "diagrams": generated}


async def _check_ai_limit_for_request(request: Request):
    user = await get_current_user(request)
    if user:
        from limits import check_ai_limit, record_ai_usage
        limit_check = await check_ai_limit(user.user_id)
        if not limit_check["allowed"]:
            raise HTTPException(status_code=403, detail=f"Free plan limit: {limit_check['limit']} AI generations/month")
        return user
    return None


async def _record_ai_for_user(request: Request):
    user = await get_current_user(request)
    if user:
        from limits import record_ai_usage
        await record_ai_usage(user.user_id)


def _build_code_system_prompt(lang_name: str) -> str:
    if lang_name.lower() == "sudolang":
        return """Eres un experto en SudoLang — un lenguaje de pseudocodigo para colaborar con IAs en especificaciones complejas.
Genera una especificacion SudoLang `.sudo` limpia e idiomatica a partir del proceso BPMN descrito por el usuario.
Reglas:
- Sintaxis: titulo `# Titulo`, bloques `{ }`, restricciones `require`, `forbid`, `should`
- Define interfaces con `interface Nombre { state, methods }`, tipos union con `|`
- Usa `/comandos` para operaciones de chat que la IA debe exponer
- Comentarios en espanol con `//` explicando la logica de negocio
- Devuelve SOLO el codigo dentro de un bloque ```sudolang"""
    return f"""Eres un ingeniero de software experto. Genera codigo {lang_name} limpio, completo y listo para produccion basado en la descripcion de procesos BPMN proporcionada.
Reglas:
- Escribe codigo completo y ejecutable
- Usa patrones de diseno apropiados para {lang_name}
- Agrega comentarios en espanol explicando la logica de negocio
- Incluye imports/dependencias al inicio
- Manejo de errores robusto
- Devuelve SOLO el codigo dentro de un bloque markdown"""


_DOCS_SYSTEM_PROMPT = """Eres un experto en documentacion tecnica y procesos de negocio. Genera documentacion tecnica detallada y profesional en espanol basada en la descripcion de procesos BPMN proporcionada.
La documentacion debe incluir: Resumen ejecutivo, Descripcion detallada de cada proceso, Roles y responsabilidades, Requisitos, Modelo de datos, Plan de implementacion.
Usa formato Markdown profesional."""


def _extract_code_from_response(response: str, language: str) -> str:
    """Extract code block from LLM response, handling various markdown formats."""
    lang_hint = language if language != "nodejs" else "typescript"
    if f"```{lang_hint}" in response:
        return response.split(f"```{lang_hint}")[1].split("```")[0].strip()
    if "```python" in response:
        return response.split("```python")[1].split("```")[0].strip()
    if "```" in response:
        parts = response.split("```")
        if len(parts) >= 3:
            content = parts[1].strip()
            lines = content.split("\n")
            if lines and lines[0].strip() in ["python", "typescript", "javascript", "java", "csharp", "go"]:
                return "\n".join(lines[1:])
            return content
    return response


def _build_user_msg_for_code(prompt: str, lang_name: str, output_type: str) -> str:
    if output_type == "code":
        return prompt + f"\n\nGenera codigo {lang_name} completo basado en el proceso descrito."
    return prompt


def _extract_bpmn_elements(xml_content: str) -> dict:
    """Parse BPMN XML and extract structured element information."""
    info = {"tasks": [], "gateways": [], "events": [], "flows": [], "process_name": ""}
    if not xml_content or len(xml_content) < 50:
        return info
    tasks = re.findall(
        r'<bpmn:(?:task|userTask|serviceTask|scriptTask|sendTask|receiveTask|manualTask|businessRuleTask)\s+id="([^"]+)"\s*(?:name="([^"]*)")?',
        xml_content,
    )
    gateways = re.findall(
        r'<bpmn:(?:exclusiveGateway|parallelGateway|inclusiveGateway)\s+id="([^"]+)"\s*(?:name="([^"]*)")?',
        xml_content,
    )
    start_events = re.findall(r'<bpmn:startEvent\s+id="([^"]+)"\s*(?:name="([^"]*)")?', xml_content)
    end_events = re.findall(r'<bpmn:endEvent\s+id="([^"]+)"\s*(?:name="([^"]*)")?', xml_content)
    flows = re.findall(
        r'<bpmn:sequenceFlow\s+id="([^"]+)"\s+sourceRef="([^"]+)"\s+targetRef="([^"]+)"',
        xml_content,
    )
    proc_match = re.search(r'<bpmn:process\s+id="([^"]+)"', xml_content)
    info["process_name"] = proc_match.group(1) if proc_match else ""
    info["tasks"] = [{"id": t[0], "name": t[1] or t[0]} for t in tasks]
    info["gateways"] = [{"id": g[0], "name": g[1] or g[0]} for g in gateways]
    info["events"] = (
        [{"id": e[0], "name": e[1] or "Inicio", "type": "start"} for e in start_events]
        + [{"id": e[0], "name": e[1] or "Fin", "type": "end"} for e in end_events]
    )
    elements_map = {}
    for t in tasks:
        elements_map[t[0]] = t[1] or t[0]
    for g in gateways:
        elements_map[g[0]] = g[1] or g[0]
    for e in start_events:
        elements_map[e[0]] = e[1] or "Inicio"
    for e in end_events:
        elements_map[e[0]] = e[1] or "Fin"
    info["flows"] = [
        {"from": elements_map.get(f[1], f[1]), "to": elements_map.get(f[2], f[2])}
        for f in flows
    ]
    return info


@router.post("/generate-bpmn")
async def generate_bpmn(data: AIGenerateRequest, request: Request):
    await _check_ai_limit_for_request(request)

    system_msg = """You are a BPMN 2.0 expert. Generate valid BPMN 2.0 XML diagrams based on user descriptions.
Always include:
- bpmn:definitions with proper namespaces
- bpmn:process with unique id
- bpmn:startEvent, bpmn:endEvent
- bpmn:task, bpmn:userTask, bpmn:serviceTask as appropriate
- bpmn:sequenceFlow connections
- bpmndi:BPMNDiagram with proper layout
Return ONLY the XML, no explanations."""

    prompt = f"Generate a BPMN 2.0 XML diagram for: {data.prompt}"
    if data.context:
        prompt += f"\n\nAdditional context: {data.context}"

    response = await _call_default_llm(system_msg, prompt, session_prefix="bpmn-gen")

    xml_content = response
    if "```xml" in response:
        xml_content = response.split("```xml")[1].split("```")[0].strip()
    elif "```" in response:
        xml_content = response.split("```")[1].split("```")[0].strip()

    await _record_ai_for_user(request)
    return {"xml": xml_content}


@router.post("/analyze-code")
async def analyze_code(data: CodeAnalyzeRequest, request: Request):
    await _check_ai_limit_for_request(request)

    system_msg = """You are a code analysis expert. Analyze the given code and generate a BPMN 2.0 XML diagram that represents the business logic flow.
Identify:
- Entry points (start events)
- Decision points (gateways)
- Processing steps (tasks)
- Exit points (end events)
Generate valid BPMN 2.0 XML with proper layout information.
Return ONLY the XML, no explanations."""

    prompt = f"Analyze this {data.language} code and generate a BPMN diagram representing its flow:\n\n```{data.language}\n{data.code}\n```"

    response = await _call_default_llm(system_msg, prompt, session_prefix="code-analyze")

    xml_content = response
    if "```xml" in response:
        xml_content = response.split("```xml")[1].split("```")[0].strip()
    elif "```" in response:
        xml_content = response.split("```")[1].split("```")[0].strip()
    
    return {"xml": xml_content}



# ==================== SUMMARY / PROMPT GENERATION ====================

def _build_summary_context(diagrams: list, oop_classes: list, include_xml: bool) -> str:
    """Build the context block sent to the LLM for summary generation."""
    parts = []
    for diag in diagrams:
        xml = diag.get("current_xml", "")
        elements = _extract_bpmn_elements(xml)
        parts.append(f"## Diagrama: {diag.get('name', 'Sin nombre')}")
        if diag.get("description"):
            parts.append(f"Descripcion: {diag['description']}")
        parts.append(f"Proceso: {elements['process_name']}")
        if elements["events"]:
            parts.append("Eventos:")
            for ev in elements["events"]:
                parts.append(f"  - [{ev['type']}] {ev['name']}")
        if elements["tasks"]:
            parts.append(f"Tareas ({len(elements['tasks'])}):")
            for t in elements["tasks"]:
                parts.append(f"  - {t['name']} (id: {t['id']})")
        if elements["gateways"]:
            parts.append(f"Decisiones ({len(elements['gateways'])}):")
            for g in elements["gateways"]:
                parts.append(f"  - {g['name']}")
        if elements["flows"]:
            parts.append("Flujo de secuencia:")
            for f in elements["flows"]:
                parts.append(f"  {f['from']} -> {f['to']}")
        if include_xml:
            parts.append(f"\n### XML completo del diagrama:\n```xml\n{xml}\n```")
        parts.append("")

    if oop_classes:
        parts.append("## Clases OOP asociadas")
        for cls in oop_classes:
            props = cls.get("properties", [])
            parts.append(f"### Clase: {cls.get('name', '')}")
            if cls.get("description"):
                parts.append(f"  Descripcion: {cls['description']}")
            if cls.get("parent_class"):
                parts.append(f"  Hereda de: {cls['parent_class']}")
            if props:
                parts.append("  Propiedades:")
                for p in props:
                    req = " (requerido)" if p.get("required") else ""
                    parts.append(f"    - {p.get('name', '')}: {p.get('type', '')}{req}")
        parts.append("")

    return "\n".join(parts)


@router.post("/diagrams/{diagram_id}/generate-summary")
async def generate_diagram_summary(diagram_id: str, data: GenerateSummaryRequest):
    """Generate an AI-powered summary/prompt for a single diagram."""
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    oop_classes = []
    if data.include_oop:
        oop_classes = await db.oop_classes.find({}, {"_id": 0}).to_list(200)

    context_block = _build_summary_context([diagram], oop_classes, data.include_xml)

    system_msg = """Eres un experto en procesos de negocio y BPMN 2.0. Tu tarea es generar un resumen/prompt completo y detallado en espanol de un diagrama BPMN.

El resumen debe incluir:
1. **Titulo y proposito** del proceso
2. **Descripcion general** del flujo de negocio en lenguaje natural
3. **Actores y participantes** involucrados (inferidos de los nombres de tareas)
4. **Pasos del proceso** descritos secuencialmente
5. **Puntos de decision** y sus posibles caminos
6. **Entradas y salidas** de datos (si hay clases OOP asociadas)
7. **Observaciones y mejoras sugeridas**

Si se incluye XML, incorporalo como referencia tecnica al final.
Usa formato Markdown limpio y profesional. Escribe TODO en espanol."""

    user_prompt = f"Genera un resumen/prompt completo del siguiente diagrama BPMN:\n\n{context_block}"
    if data.custom_context:
        user_prompt += f"\n\nContexto adicional del usuario: {data.custom_context}"

    # Summaries don't need V4-Pro depth — use Flash (3-4x faster, well under 60s ingress timeout)
    # with a generous but capped max_tokens to avoid runaway generation.
    import asyncio
    for attempt in range(3):
        try:
            response = await _call_deepseek(
                system_msg, user_prompt, max_tokens=4096, model="deepseek-v4-flash"
            )
            return {
                "summary": response,
                "diagram_name": diagram.get("name", ""),
                "diagram_id": diagram_id,
                "model": "deepseek-v4-flash",
            }
        except Exception as e:
            if attempt < 2 and "RateLimit" in str(e):
                await asyncio.sleep(5)
                continue
            raise HTTPException(status_code=503, detail=f"Error del servicio de IA: {str(e)}")


@router.post("/projects/{project_id}/generate-summary")
async def generate_project_summary(project_id: str, data: GenerateSummaryRequest):
    """Generate an AI-powered summary/prompt for an entire project."""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    diagram_ids = project.get("diagram_ids", [])
    diagrams = []
    if diagram_ids:
        diagrams = await db.diagrams.find({"id": {"$in": diagram_ids}}, {"_id": 0}).to_list(50)

    if not diagrams:
        raise HTTPException(status_code=400, detail="El proyecto no tiene diagramas")

    oop_classes = []
    if data.include_oop:
        oop_classes = await db.oop_classes.find({}, {"_id": 0}).to_list(200)

    context_block = _build_summary_context(diagrams, oop_classes, data.include_xml)

    system_msg = f"""Eres un experto en procesos de negocio y BPMN 2.0. Tu tarea es generar un resumen/prompt completo y detallado en espanol del proyecto "{project.get('name', '')}".

El resumen debe incluir:
1. **Titulo del proyecto** y su proposito general
2. **Descripcion ejecutiva** del conjunto de procesos
3. **Lista de procesos** con descripcion de cada uno
4. **Flujo general** - como se relacionan los procesos entre si
5. **Actores y participantes** involucrados
6. **Modelo de datos** (clases OOP asociadas con sus propiedades)
7. **Observaciones, riesgos y mejoras sugeridas**

Si se incluye XML de los diagramas, incorporalo como referencia tecnica al final.
Usa formato Markdown limpio y profesional. Escribe TODO en espanol."""

    user_prompt = f"Genera un resumen/prompt completo del proyecto con los siguientes {len(diagrams)} diagramas BPMN:\n\n{context_block}"
    if data.custom_context:
        user_prompt += f"\n\nContexto adicional del usuario: {data.custom_context}"

    # Same rationale as diagram summary: use Flash to stay under 60s ingress timeout
    import asyncio
    for attempt in range(3):
        try:
            response = await _call_deepseek(
                system_msg, user_prompt, max_tokens=6144, model="deepseek-v4-flash"
            )
            return {
                "summary": response,
                "project_name": project.get("name", ""),
                "project_id": project_id,
                "diagrams_count": len(diagrams),
                "model": "deepseek-v4-flash",
            }
        except Exception as e:
            if attempt < 2 and "RateLimit" in str(e):
                await asyncio.sleep(5)
                continue
            raise HTTPException(status_code=503, detail=f"Error del servicio de IA: {str(e)}")



# ==================== PROCESS PROMPT (Send to LLM) ====================

LANGUAGE_LABELS = {
    "python": "Python",
    "nodejs": "Node.js (TypeScript)",
    "java": "Java",
    "csharp": "C#",
    "go": "Go",
    "sudolang": "SudoLang",
}

MODEL_CONFIG = {
    "deepseek": ("deepseek", DEEPSEEK_MODEL),
    "deepseek-pro": ("deepseek", "deepseek-v4-pro"),
    "deepseek-flash": ("deepseek", "deepseek-v4-flash"),
    "minimax": ("minimax", "MiniMax-M3"),
    "mimo": ("mimo", "MiMo-V2-Pro"),
    "opencode": ("opencode", OPENCODE_MODEL),
    "opencode-go": ("opencode-go", OPENCODE_GO_MODEL),
}


@router.post("/process-prompt")
async def process_prompt(data: ProcessPromptRequest):
    """Send a generated prompt to an LLM (DeepSeek / MiniMax / MiMo) to get code or documentation."""
    if not data.prompt.strip():
        raise HTTPException(status_code=400, detail="El prompt no puede estar vacio")

    provider_key = data.llm_provider if data.llm_provider in MODEL_CONFIG else "deepseek"
    _, model_name = MODEL_CONFIG[provider_key]
    lang_name = LANGUAGE_LABELS.get(data.language, data.language)

    if provider_key == "minimax":
        return await _process_with_minimax(data, system_msg=None, lang_name=lang_name)
    if provider_key == "mimo":
        return await _process_with_mimo(data, lang_name=lang_name)
    if provider_key == "opencode":
        return await _process_with_opencode(data, lang_name=lang_name, model=data.model)
    if provider_key == "opencode-go":
        return await _process_with_opencode_go(data, lang_name=lang_name, model=data.model)
    # default: deepseek (V4-Pro or V4-Flash)
    return await _process_with_deepseek(data, lang_name=lang_name, model=model_name)


@router.post("/rewrite-content")
async def rewrite_content(data: RewriteContentRequest, request: Request):
    """Rewrite editor content using a custom system prompt via the default LLM."""
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="El contenido no puede estar vacio")
    if not data.system_prompt.strip():
        raise HTTPException(status_code=400, detail="El system prompt no puede estar vacio")
    try:
        result = await _call_default_llm(data.system_prompt, data.content, session_prefix="rewrite")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("LLM rewrite-content failed: %s", e, exc_info=True)
        raise HTTPException(status_code=503, detail=f"Error del modelo por defecto: {str(e)}")

    # Try to get user for audit (best-effort, endpoint may be called unauthenticated)
    try:
        user = await get_current_user(request)
    except Exception:
        user = None
    await record_audit(
        "ai.rewrite_content",
        actor_email=user.email if user else "",
        actor_user_id=user.user_id if user else None,
        actor_role=user.role if user else "",
        resource_type="ai",
        details={"input_length": len(data.content), "output_length": len(result), "provider": DEFAULT_LLM_PROVIDER},
        request=request,
    )
    return {"content": result, "provider": DEFAULT_LLM_PROVIDER}



async def _call_minimax(system_msg: str, user_msg: str, max_tokens: int = 4096) -> str:
    """Call MiniMax M3 via the Anthropic-compatible endpoint (Pay-as-you-go plan).
    Uses x-api-key header with the sk-api- key."""
    runtime = await resolve_runtime(
        "minimax", env_api_key=MINIMAX_API_KEY,
        default_base_url="https://api.minimax.io/anthropic/v1/messages",
        default_model="MiniMax-M3",
    )
    if not runtime["enabled"]:
        raise HTTPException(status_code=503, detail="MiniMax disabled by admin")
    if not runtime["api_key"]:
        raise HTTPException(status_code=500, detail="MiniMax API key not configured")
    import httpx

    payload = {
        "model": runtime["model"],
        "max_tokens": max_tokens,
        "system": system_msg,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_msg},
                ],
            },
        ],
    }
    headers = {
        "x-api-key": runtime["api_key"],
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
    }

    def _sync_call():
        with httpx.Client(timeout=540.0) as client:
            resp = client.post(
                runtime["base_url"],
                json=payload,
                headers=headers,
            )
            if resp.status_code != 200:
                raise RuntimeError(f"MiniMax returned {resp.status_code}: {resp.text[:300]}")
            return resp.json()

    def _extract(data):
        # Anthropic format: content is an array of text blocks
        content_blocks = data.get("content", [])
        parts = []
        for block in content_blocks:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        usage = data.get("usage") or {}
        return (
            "\n".join(parts) if parts else str(data),
            usage.get("input_tokens", 0) or 0,
            usage.get("output_tokens", 0) or 0,
        )

    return await run_metered("minimax", runtime["model"], _sync_call, _extract)


async def _process_with_minimax(data: ProcessPromptRequest, system_msg: str = None, lang_name: str = "Python") -> dict:
    """Process prompt using MiniMax M3."""
    sys_msg = _build_code_system_prompt(lang_name) if data.output_type == "code" else _DOCS_SYSTEM_PROMPT
    user_msg = _build_user_msg_for_code(data.prompt, lang_name, data.output_type)
    try:
        response = await _call_minimax(sys_msg, user_msg)
        content = _extract_code_from_response(response, data.language) if data.output_type == "code" else response
        return {"content": content, "output_type": data.output_type, "llm_provider": "minimax", "model": "MiniMax-M3", "language": data.language if data.output_type == "code" else None}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error MiniMax M3: {str(e)}")


class MiniMaxChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    mode: str = "general"  # general, optimize, analyze, security, test
    model: Optional[str] = None  # specific model override (e.g. for OpenCode providers)


MINIMAX_MODES = {
    "general": "Eres un asistente IA experto en procesos de negocio BPMN 2.0 y desarrollo de software. Responde de forma clara y profesional en espanol.",
    "optimize": "Eres un consultor experto en optimizacion de procesos de negocio. Analiza procesos BPMN e identifica cuellos de botella, redundancias y oportunidades de mejora. Responde en espanol con recomendaciones concretas y accionables.",
    "analyze": "Eres un analista de procesos BPMN experto. Analiza diagramas y proporciona: resumen ejecutivo, flujo paso a paso, puntos de decision, excepciones, KPIs sugeridos. Responde en espanol con formato Markdown.",
    "security": "Eres un experto en seguridad y compliance de procesos de negocio. Analiza procesos BPMN identificando: vulnerabilidades, riesgos de compliance, puntos de fallo, recomendaciones GDPR/SOX/ISO. Responde en espanol.",
    "test": "Eres un QA engineer experto. A partir de procesos BPMN genera: casos de prueba completos, escenarios edge-case, datos de prueba, criterios de aceptacion. Responde en espanol con formato estructurado.",
}


@router.post("/minimax/chat")
async def minimax_chat(data: MiniMaxChatRequest, request: Request):
    """Chat with MiniMax M3 - multi-mode AI assistant for BPMN processes."""
    await _check_ai_limit_for_request(request)
    system_msg = MINIMAX_MODES.get(data.mode, MINIMAX_MODES["general"])
    user_msg = data.message
    if data.context:
        user_msg = f"CONTEXTO DEL DIAGRAMA BPMN:\n{data.context}\n\nPREGUNTA/SOLICITUD:\n{data.message}"
    try:
        response = await _call_minimax(system_msg, user_msg)
        await _record_ai_for_user(request)
        return {"response": response, "mode": data.mode, "model": "MiniMax-M3"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error MiniMax M3: {str(e)}")


@router.get("/minimax/status")
async def minimax_status():
    """Check if MiniMax M3 is available."""
    return {"available": bool(MINIMAX_API_KEY), "model": "MiniMax-M3", "modes": list(MINIMAX_MODES.keys())}


async def _call_mimo(system_msg: str, user_msg: str, max_tokens: int = 4096) -> str:
    """Call Xiaomi MiMo-V2-Pro via OpenAI-compatible API. Runs the sync SDK in
    a thread-pool to keep the async event loop responsive."""
    runtime = await resolve_runtime(
        "mimo", env_api_key=MIMO_API_KEY,
        default_base_url="https://token-plan-ams.xiaomimimo.com/v1",
        default_model="mimo-v2.5-pro",
    )
    if not runtime["enabled"]:
        raise HTTPException(status_code=503, detail="MiMo disabled by admin")
    if not runtime["api_key"]:
        raise HTTPException(status_code=500, detail="MiMo API key not configured")
    import openai

    def _sync_call():
        client = openai.OpenAI(
            api_key=runtime["api_key"],
            base_url=runtime["base_url"],
            timeout=540.0,
        )
        return client.chat.completions.create(
            model=runtime["model"],
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
        )

    return await run_metered("mimo", runtime["model"], _sync_call, extract_openai_response)


async def _process_with_mimo(data: ProcessPromptRequest, lang_name: str = "Python") -> dict:
    """Process prompt using Xiaomi MiMo-V2-Pro."""
    sys_msg = _build_code_system_prompt(lang_name) if data.output_type == "code" else _DOCS_SYSTEM_PROMPT
    user_msg = _build_user_msg_for_code(data.prompt, lang_name, data.output_type)
    try:
        response = await _call_mimo(sys_msg, user_msg)
        content = _extract_code_from_response(response, data.language) if data.output_type == "code" else response
        return {"content": content, "output_type": data.output_type, "llm_provider": "mimo", "model": "MiMo-V2-Pro", "language": data.language if data.output_type == "code" else None}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error MiMo-V2-Pro: {str(e)}")


MIMO_MODES = {
    "general": "Eres un asistente IA experto en procesos de negocio BPMN 2.0 y desarrollo de software. Responde de forma clara y profesional en espanol.",
    "agent": "Eres un agente IA autonomo especializado en procesos BPMN. Analiza el problema, descomponlo en pasos, razona paso a paso, y proporciona soluciones concretas y accionables. Usa tags <think> para tu razonamiento interno. Responde en espanol.",
    "optimize": "Eres un consultor experto en optimizacion de procesos. Analiza procesos BPMN e identifica cuellos de botella, redundancias y oportunidades de mejora. Responde en espanol con recomendaciones concretas.",
    "security": "Eres un experto en seguridad y compliance. Analiza procesos BPMN identificando vulnerabilidades, riesgos de compliance, puntos de fallo, recomendaciones GDPR/SOX/ISO. Responde en espanol.",
}


@router.post("/mimo/chat")
async def mimo_chat(data: MiniMaxChatRequest, request: Request):
    """Chat with Xiaomi MiMo-V2-Pro."""
    await _check_ai_limit_for_request(request)
    system_msg = MIMO_MODES.get(data.mode, MIMO_MODES["general"])
    user_msg = data.message
    if data.context:
        user_msg = f"CONTEXTO DEL DIAGRAMA BPMN:\n{data.context}\n\nPREGUNTA/SOLICITUD:\n{data.message}"
    try:
        response = await _call_mimo(system_msg, user_msg)
        await _record_ai_for_user(request)
        return {"response": response, "mode": data.mode, "model": "MiMo-V2-Pro"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error MiMo-V2-Pro: {str(e)}")


@router.get("/mimo/status")
async def mimo_status():
    """Check if MiMo-V2-Pro is available."""
    return {"available": bool(MIMO_API_KEY), "model": "MiMo-V2-Pro"}


# ─────────────────────────────────────────────────────────────────────────────
# OpenCode Zen / OpenCode Go — OpenAI-compatible gateway (opencode.ai)
# ─────────────────────────────────────────────────────────────────────────────

OPENCODE_ZEN_BASE_URL = "https://opencode.ai/zen/v1"
OPENCODE_GO_BASE_URL = "https://opencode.ai/zen/go/v1"


async def _fetch_opencode_models(base_url: str) -> list[dict]:
    """Fetch available models from an OpenCode gateway (OpenAI-compatible /v1/models)."""
    if not OPENCODE_API_KEY:
        return []
    import openai
    import asyncio

    def _sync_list():
        client = openai.OpenAI(api_key=OPENCODE_API_KEY, base_url=base_url, timeout=30.0)
        resp = client.models.list()
        return [{"id": m.id, "owned_by": getattr(m, "owned_by", "")} for m in resp.data]

    try:
        return await asyncio.to_thread(_sync_list)
    except Exception:
        logger.warning("Failed to fetch models from %s", base_url)
        return []


async def _call_opencode(
    system_msg: str,
    user_msg: str,
    max_tokens: int = 4096,
    model: str | None = None,
    base_url: str | None = None,
    _provider_label: str = "opencode",
) -> str:
    """Call OpenCode Zen via OpenAI-compatible API. Runs the sync SDK in
    a thread-pool to keep the async event loop responsive."""
    default_base = OPENCODE_ZEN_BASE_URL if _provider_label == "opencode" else OPENCODE_GO_BASE_URL
    default_model = OPENCODE_MODEL if _provider_label == "opencode" else OPENCODE_GO_MODEL
    runtime = await resolve_runtime(
        _provider_label, env_api_key=OPENCODE_API_KEY,
        default_base_url=default_base, default_model=default_model,
    )
    if not runtime["enabled"]:
        raise HTTPException(status_code=503, detail=f"{_provider_label} disabled by admin")
    if not runtime["api_key"]:
        raise HTTPException(status_code=500, detail="OpenCode API key not configured")
    import openai

    target_base_url = base_url or runtime["base_url"]
    target_model = model or runtime["model"]

    def _sync_call():
        client = openai.OpenAI(
            api_key=runtime["api_key"],
            base_url=target_base_url,
            timeout=540.0,
        )
        return client.chat.completions.create(
            model=target_model,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
        )

    return await run_metered(_provider_label, target_model, _sync_call, extract_openai_response)


async def _call_opencode_go(
    system_msg: str,
    user_msg: str,
    max_tokens: int = 4096,
    model: str | None = None,
) -> str:
    """Call OpenCode Go (subscription) via OpenAI-compatible API."""
    return await _call_opencode(
        system_msg,
        user_msg,
        max_tokens=max_tokens,
        model=model,
        _provider_label="opencode-go",
    )


async def _process_with_opencode(data: ProcessPromptRequest, lang_name: str = "Python", model: str | None = None) -> dict:
    """Process prompt using OpenCode Zen."""
    sys_msg = _build_code_system_prompt(lang_name) if data.output_type == "code" else _DOCS_SYSTEM_PROMPT
    user_msg = _build_user_msg_for_code(data.prompt, lang_name, data.output_type)
    try:
        response = await _call_opencode(sys_msg, user_msg, model=model)
        used_model = model or OPENCODE_MODEL
        content = _extract_code_from_response(response, data.language) if data.output_type == "code" else response
        return {"content": content, "output_type": data.output_type, "llm_provider": "opencode", "model": used_model, "language": data.language if data.output_type == "code" else None}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error OpenCode Zen: {str(e)}")


async def _process_with_opencode_go(data: ProcessPromptRequest, lang_name: str = "Python", model: str | None = None) -> dict:
    """Process prompt using OpenCode Go."""
    sys_msg = _build_code_system_prompt(lang_name) if data.output_type == "code" else _DOCS_SYSTEM_PROMPT
    user_msg = _build_user_msg_for_code(data.prompt, lang_name, data.output_type)
    try:
        response = await _call_opencode_go(sys_msg, user_msg, model=model)
        used_model = model or OPENCODE_GO_MODEL
        content = _extract_code_from_response(response, data.language) if data.output_type == "code" else response
        return {"content": content, "output_type": data.output_type, "llm_provider": "opencode-go", "model": used_model, "language": data.language if data.output_type == "code" else None}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error OpenCode Go: {str(e)}")


# Union of MiniMax and MiMo modes (covers general/optimize/analyze/security/test/agent)
OPENCODE_MODES = {**MINIMAX_MODES, **MIMO_MODES}


@router.post("/opencode/chat")
async def opencode_chat(data: MiniMaxChatRequest, request: Request):
    """Chat via OpenCode Zen gateway."""
    await _check_ai_limit_for_request(request)
    system_msg = OPENCODE_MODES.get(data.mode, OPENCODE_MODES["general"])
    user_msg = data.message
    if data.context:
        user_msg = f"CONTEXTO DEL DIAGRAMA BPMN:\n{data.context}\n\nPREGUNTA/SOLICITUD:\n{data.message}"
    try:
        response = await _call_opencode(system_msg, user_msg, model=data.model)
        used_model = data.model or OPENCODE_MODEL
        await _record_ai_for_user(request)
        return {"response": response, "mode": data.mode, "model": used_model}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error OpenCode Zen: {str(e)}")


@router.get("/opencode/status")
async def opencode_status():
    """Check if OpenCode Zen is available."""
    return {"available": bool(OPENCODE_API_KEY), "model": OPENCODE_MODEL, "modes": list(OPENCODE_MODES.keys())}


@router.get("/opencode/models")
async def opencode_models():
    """List available models from OpenCode Zen."""
    models = await _fetch_opencode_models(OPENCODE_ZEN_BASE_URL)
    return {"models": models, "default": OPENCODE_MODEL}


@router.post("/opencode-go/chat")
async def opencode_go_chat(data: MiniMaxChatRequest, request: Request):
    """Chat via OpenCode Go subscription gateway."""
    await _check_ai_limit_for_request(request)
    system_msg = OPENCODE_MODES.get(data.mode, OPENCODE_MODES["general"])
    user_msg = data.message
    if data.context:
        user_msg = f"CONTEXTO DEL DIAGRAMA BPMN:\n{data.context}\n\nPREGUNTA/SOLICITUD:\n{data.message}"
    try:
        response = await _call_opencode_go(system_msg, user_msg, model=data.model)
        used_model = data.model or OPENCODE_GO_MODEL
        await _record_ai_for_user(request)
        return {"response": response, "mode": data.mode, "model": used_model}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error OpenCode Go: {str(e)}")


@router.get("/opencode-go/status")
async def opencode_go_status():
    """Check if OpenCode Go is available."""
    return {"available": bool(OPENCODE_API_KEY), "model": OPENCODE_GO_MODEL, "modes": list(OPENCODE_MODES.keys())}


@router.get("/opencode-go/models")
async def opencode_go_models():
    """List available models from OpenCode Go."""
    models = await _fetch_opencode_models(OPENCODE_GO_BASE_URL)
    return {"models": models, "default": OPENCODE_GO_MODEL}


# ─────────────────────────────────────────────────────────────────────────────
# DeepSeek V4 (V4-Pro / V4-Flash) — OpenAI-compatible API
# ─────────────────────────────────────────────────────────────────────────────


async def _call_deepseek(
    system_msg: str,
    user_msg: str,
    max_tokens: int = 4096,
    model: str | None = None,
    cache_ttl: int = 0,
) -> str:
    """Call DeepSeek V4 via OpenAI-compatible API. Runs the sync SDK in
    a thread-pool to keep the async event loop responsive. When cache_ttl > 0,
    identical requests reuse the cached response for that many seconds."""
    runtime = await resolve_runtime(
        "deepseek", env_api_key=DEEPSEEK_API_KEY,
        default_base_url="https://api.deepseek.com",
        default_model=DEEPSEEK_MODEL,
    )
    if not runtime["enabled"]:
        raise HTTPException(status_code=503, detail="DeepSeek disabled by admin")
    if not runtime["api_key"]:
        raise HTTPException(status_code=500, detail="DeepSeek API key not configured")
    import openai

    target_model = model or runtime["model"]

    def _sync_call():
        client = openai.OpenAI(
            api_key=runtime["api_key"],
            base_url=runtime["base_url"],
            timeout=540.0,
        )
        return client.chat.completions.create(
            model=target_model,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
        )

    if cache_ttl > 0:
        payload = f"{system_msg}\x00{user_msg}\x00{max_tokens}"
        return await run_metered_cached(
            "deepseek", target_model, _sync_call, extract_openai_response,
            cache_payload=payload, cache_ttl=cache_ttl,
        )
    return await run_metered("deepseek", target_model, _sync_call, extract_openai_response)


async def _process_with_deepseek(data: ProcessPromptRequest, lang_name: str = "Python", model: str | None = None) -> dict:
    """Process prompt using DeepSeek V4."""
    sys_msg = _build_code_system_prompt(lang_name) if data.output_type == "code" else _DOCS_SYSTEM_PROMPT
    user_msg = _build_user_msg_for_code(data.prompt, lang_name, data.output_type)
    target_model = model or DEEPSEEK_MODEL
    try:
        response = await _call_deepseek(sys_msg, user_msg, model=target_model)
        content = _extract_code_from_response(response, data.language) if data.output_type == "code" else response
        return {
            "content": content,
            "output_type": data.output_type,
            "llm_provider": "deepseek",
            "model": target_model,
            "language": data.language if data.output_type == "code" else None,
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error DeepSeek V4: {str(e)}")


DEEPSEEK_MODES = {
    "general": "Eres un asistente IA experto en procesos de negocio BPMN 2.0 y desarrollo de software. Razona paso a paso y responde de forma clara y profesional en espanol.",
    "code": "Eres un ingeniero de software experto en codigo de calidad de produccion. Generas codigo limpio, testeable, idiomatico, con comentarios en espanol explicando la logica de negocio. Responde en espanol.",
    "optimize": "Eres un consultor experto en optimizacion de procesos. Analiza procesos BPMN e identifica cuellos de botella, redundancias y oportunidades de mejora. Responde en espanol con recomendaciones concretas.",
    "analyze": "Eres un analista de procesos. Realiza un analisis profundo paso a paso del proceso BPMN proporcionado: KPIs, decisiones criticas, dependencias, riesgos. Responde en espanol con formato estructurado.",
    "security": "Eres un experto en seguridad y compliance. Analiza procesos BPMN identificando vulnerabilidades, riesgos de compliance, puntos de fallo, recomendaciones GDPR/SOX/ISO. Responde en espanol.",
    "test": "Eres un QA engineer experto. A partir de procesos BPMN genera: casos de prueba completos, escenarios edge-case, datos de prueba, criterios de aceptacion. Responde en espanol con formato estructurado.",
}


@router.post("/deepseek/chat")
async def deepseek_chat(data: MiniMaxChatRequest, request: Request):
    """Chat with DeepSeek V4 (defaults to V4-Pro). Pass mode=`flash` in the
    body's `mode` to use V4-Flash instead — but since modes are also used
    for the system prompt we expose model variants via the optional `model`
    field is not yet on the request schema, so we use header `X-DeepSeek-Model`
    or the env-configured default."""
    await _check_ai_limit_for_request(request)
    system_msg = DEEPSEEK_MODES.get(data.mode, DEEPSEEK_MODES["general"])
    user_msg = data.message
    if data.context:
        user_msg = f"CONTEXTO DEL DIAGRAMA BPMN:\n{data.context}\n\nPREGUNTA/SOLICITUD:\n{data.message}"

    # Allow per-request override via header (frontend can pass deepseek-v4-flash for cheaper/faster)
    requested_model = (request.headers.get("X-DeepSeek-Model") or DEEPSEEK_MODEL).strip()
    if requested_model not in ("deepseek-v4-pro", "deepseek-v4-flash"):
        requested_model = DEEPSEEK_MODEL

    try:
        response = await _call_deepseek(system_msg, user_msg, model=requested_model)
        await _record_ai_for_user(request)
        return {"response": response, "mode": data.mode, "model": requested_model}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error DeepSeek V4: {str(e)}")


@router.get("/deepseek/status")
async def deepseek_status():
    """Check if DeepSeek V4 is available."""
    return {
        "available": bool(DEEPSEEK_API_KEY),
        "model": DEEPSEEK_MODEL,
        "variants": ["deepseek-v4-pro", "deepseek-v4-flash"],
        "modes": list(DEEPSEEK_MODES.keys()),
    }


# ==================== INLINE AI SUGGESTIONS ====================

class AISuggestRequest(BaseModel):
    diagram_xml: str
    selected_element_id: Optional[str] = None
    selected_element_type: Optional[str] = None


class AIApplySuggestionRequest(BaseModel):
    diagram_xml: str
    selected_element_id: str
    action: str
    label: Optional[str] = None


@router.post("/suggest")
async def suggest_next_steps(data: AISuggestRequest, request: Request):
    """Sugerencias contextuales rapidas para el editor inline (estilo Copilot).
    Usa DeepSeek V4-Flash para rapidez. No cuenta contra el limite de IA."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    elements_info = _extract_bpmn_elements(data.diagram_xml)
    selected_ctx = ""
    if data.selected_element_id:
        selected_ctx = f"\nElemento seleccionado: id={data.selected_element_id}, tipo={data.selected_element_type or 'desconocido'}"
        # Find connections
        outgoing = [f for f in elements_info["flows"] if f["from"] == data.selected_element_id]
        incoming = [f for f in elements_info["flows"] if f["to"] == data.selected_element_id]
        if outgoing:
            selected_ctx += f"\nConexiones salientes: {len(outgoing)}"
        if incoming:
            selected_ctx += f"\nConexiones entrantes: {len(incoming)}"
        if not outgoing:
            selected_ctx += "\nNOTA: Este elemento NO tiene conexiones salientes."

    system_msg = """Eres un asistente BPMN 2.0 inline. Dado el contexto de un diagrama y un elemento seleccionado, sugiere 2-3 siguientes pasos logicos.

Responde SOLO en formato JSON valido (sin markdown, sin ```), array de objetos:
[{"label": "Texto corto del boton (max 30 chars)", "action": "accion_id", "description": "Que hara esta accion"}]

Acciones validas: add_user_task, add_service_task, add_gateway, add_end, connect_existing, add_intermediate_event, add_subprocess, optimize_flow, generate_full

Reglas:
- Si el elemento no tiene conexiones salientes, prioriza "Conectar siguiente paso"
- Si es startEvent, sugiere tareas y gateways
- Si es task, sugiere siguiente tarea, gateway, o fin
- Si es gateway, sugiere ramas
- Si el diagrama esta casi vacio (solo start/end), sugiere "generate_full"
- Maximo 3 sugerencias
- Labels en el idioma del usuario (detectar por el XML o usar espanol por defecto)"""

    user_msg = f"""Diagrama BPMN actual:
- Tareas: {len(elements_info['tasks'])} ({', '.join(t['name'][:30] for t in elements_info['tasks'][:5])})
- Gateways: {len(elements_info['gateways'])}
- Eventos: {len(elements_info['events'])}
- Flujos: {len(elements_info['flows'])}
{selected_ctx}"""

    try:
        # Cached 5 min: identical diagram state + selection reuses the response
        response = await _call_deepseek(system_msg, user_msg, max_tokens=500, model="deepseek-v4-flash", cache_ttl=300)
        clean = response.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
            clean = clean.strip()
        suggestions = json.loads(clean)
        return {"suggestions": suggestions[:3]}
    except json.JSONDecodeError:
        # Fallback: sugerencias genericas basadas en el tipo de elemento
        fallback = _fallback_suggestions(data.selected_element_type, elements_info)
        return {"suggestions": fallback}
    except Exception as e:
        logger.warning("AI suggest failed, using fallback: %s", e)
        fallback = _fallback_suggestions(data.selected_element_type, elements_info)
        return {"suggestions": fallback}


def _fallback_suggestions(element_type: Optional[str], elements_info: dict) -> list:
    """Sugerencias de respaldo cuando la IA no responde."""
    if not element_type:
        return [{"label": "Generar proceso", "action": "generate_full", "description": "Generar un proceso completo desde descripcion"}]

    if "StartEvent" in element_type:
        return [
            {"label": "Añadir tarea", "action": "add_user_task", "description": "Anadir una tarea de usuario despues del evento de inicio"},
            {"label": "Añadir decision", "action": "add_gateway", "description": "Anadir un gateway exclusivo para bifurcar el flujo"},
        ]
    if "EndEvent" in element_type:
        return [{"label": "Tarea anterior", "action": "add_user_task", "description": "Anadir una tarea antes del evento fin"}]
    if "Gateway" in element_type:
        return [
            {"label": "Rama Si", "action": "add_user_task", "description": "Anadir tarea en la rama afirmativa"},
            {"label": "Rama No", "action": "add_user_task", "description": "Anadir tarea en la rama negativa"},
        ]
    # Task or other
    return [
        {"label": "Siguiente tarea", "action": "add_user_task", "description": "Anadir una tarea siguiente conectada"},
        {"label": "Añadir decision", "action": "add_gateway", "description": "Anadir un gateway de decision"},
        {"label": "Fin de proceso", "action": "add_end", "description": "Conectar al evento fin del proceso"},
    ]


@router.post("/apply-suggestion")
async def apply_suggestion(data: AIApplySuggestionRequest, request: Request):
    """Aplica una sugerencia IA: genera el BPMN modificado con el nuevo elemento."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    system_msg = """Eres un experto en BPMN 2.0. Dado un XML de diagrama existente, una accion y un elemento seleccionado, modifica el XML para anadir el nuevo elemento solicitado.

Reglas IMPORTANTES:
- Manten TODOS los elementos existentes intactos
- Solo anade el nuevo elemento y su conexion
- Usa IDs unicos para los nuevos elementos (formato: Activity_XXXX, Gateway_XXXX, Event_XXXX)
- Manten el layout existente, coloca el nuevo elemento a la derecha/delante del seleccionado
- Asegura que el XML sea valido BPMN 2.0 con bpmndi
- Devuelve SOLO el XML, sin explicaciones"""

    action_desc = {
        "add_user_task": "Anadir un bpmn:userTask despues del elemento seleccionado, conectado con sequenceFlow",
        "add_service_task": "Anadir un bpmn:serviceTask despues del elemento seleccionado, conectado con sequenceFlow",
        "add_gateway": "Anadir un bpmn:exclusiveGateway despues del elemento seleccionado con dos ramas (si/no)",
        "add_end": "Anadir un bpmn:endEvent conectado desde el elemento seleccionado",
        "connect_existing": "Conectar el elemento seleccionado al siguiente elemento logico existente",
        "add_intermediate_event": "Anadir un bpmn:intermediateCatchEvent despues del elemento seleccionado",
        "add_subprocess": "Anadir un bpmn:subProcess despues del elemento seleccionado",
        "optimize_flow": "Analizar y optimizar el flujo del diagrama, eliminando redundancias",
        "generate_full": "Generar un proceso BPMN completo basado en los elementos existentes como guia",
    }

    desc = action_desc.get(data.action, f"Aplicar la accion: {data.action}")
    label_ctx = f" (etiqueta: {data.label})" if data.label else ""

    user_msg = f"""XML actual del diagrama:
```xml
{data.diagram_xml}
```

Elemento seleccionado: {data.selected_element_id}{label_ctx}
Accion a realizar: {desc}

Modifica el XML para aplicar esta accion. Devuelve SOLO el XML completo modificado."""

    try:
        response = await _call_deepseek(system_msg, user_msg, max_tokens=4096, model="deepseek-v4-flash")
        xml_content = response
        if "```xml" in response:
            xml_content = response.split("```xml")[1].split("```")[0].strip()
        elif "```" in response:
            xml_content = response.split("```")[1].split("```")[0].strip()
        return {"xml": xml_content}
    except Exception as e:
        logger.error("AI apply-suggestion failed: %s", e)
        raise HTTPException(status_code=503, detail=f"Error IA: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# Claude (Anthropic) — native SDK
# ─────────────────────────────────────────────────────────────────────────────


async def _call_claude(
    system_msg: str,
    user_msg: str,
    max_tokens: int = 4096,
    model: str | None = None,
    cache_ttl: int = 0,
) -> str:
    """Call Claude via Anthropic SDK. Runs the sync SDK in a thread-pool."""
    runtime = await resolve_runtime(
        "claude", env_api_key=ANTHROPIC_API_KEY,
        default_base_url="https://api.anthropic.com",
        default_model=ANTHROPIC_MODEL,
    )
    if not runtime["enabled"]:
        raise HTTPException(status_code=503, detail="Claude disabled by admin")
    if not runtime["api_key"]:
        raise HTTPException(status_code=500, detail="Claude API key not configured")
    import anthropic

    target_model = model or runtime["model"]

    def _sync_call():
        client = anthropic.Anthropic(
            api_key=runtime["api_key"],
            timeout=540.0,
        )
        return client.messages.create(
            model=target_model,
            max_tokens=max_tokens,
            system=system_msg,
            messages=[{"role": "user", "content": user_msg}],
        )

    if cache_ttl > 0:
        payload = f"{system_msg}\x00{user_msg}\x00{max_tokens}"
        return await run_metered_cached(
            "claude", target_model, _sync_call, extract_anthropic_response,
            cache_payload=payload, cache_ttl=cache_ttl,
        )
    return await run_metered("claude", target_model, _sync_call, extract_anthropic_response)


# ─────────────────────────────────────────────────────────────────────────────
# LLM gateway provider registration (Phase 2)
# Uniform signature: (system_msg, user_msg, *, max_tokens=4096, model=None)
# Providers without a `model` parameter are wrapped in adapters.
# ─────────────────────────────────────────────────────────────────────────────

async def _minimax_adapter(system_msg: str, user_msg: str, *, max_tokens: int = 4096, model: str | None = None) -> str:
    return await _call_minimax(system_msg, user_msg, max_tokens)


async def _mimo_adapter(system_msg: str, user_msg: str, *, max_tokens: int = 4096, model: str | None = None) -> str:
    return await _call_mimo(system_msg, user_msg, max_tokens)


register_provider("deepseek", _call_deepseek, is_configured=lambda: bool(DEEPSEEK_API_KEY), accepts_model=True)
register_provider("minimax", _minimax_adapter, is_configured=lambda: bool(MINIMAX_API_KEY))
register_provider("mimo", _mimo_adapter, is_configured=lambda: bool(MIMO_API_KEY))
register_provider("opencode", _call_opencode, is_configured=lambda: bool(OPENCODE_API_KEY), accepts_model=True)
register_provider("opencode-go", _call_opencode_go, is_configured=lambda: bool(OPENCODE_API_KEY), accepts_model=True)
register_provider("claude", _call_claude, is_configured=lambda: bool(ANTHROPIC_API_KEY), accepts_model=True)


# Seed definitions for the llm_providers Mongo collection (Phase 3). Inserted
# on first startup by server.py when the collection is empty; afterwards the
# admin panel edits the docs, which override these env-derived values.
LLM_PROVIDER_SEEDS = [
    {
        "key": "deepseek",
        "label": "DeepSeek V4",
        "base_url": "https://api.deepseek.com",
        "env_api_key": DEEPSEEK_API_KEY,
        "models": ["deepseek-v4-pro", "deepseek-v4-flash"],
        "default_model": DEEPSEEK_MODEL,
        "priority": 10,
        "cost_in_per_1m": 0.27,
        "cost_out_per_1m": 1.10,
    },
    {
        "key": "minimax",
        "label": "MiniMax M3",
        "base_url": "https://api.minimax.io/anthropic/v1/messages",
        "env_api_key": MINIMAX_API_KEY,
        "models": ["MiniMax-M3"],
        "default_model": "MiniMax-M3",
        "priority": 20,
        "cost_in_per_1m": 0.30,
        "cost_out_per_1m": 1.20,
    },
    {
        "key": "mimo",
        "label": "MiMo V2 Pro",
        "base_url": "https://token-plan-ams.xiaomimimo.com/v1",
        "env_api_key": MIMO_API_KEY,
        "models": ["mimo-v2.5-pro"],
        "default_model": "mimo-v2.5-pro",
        "priority": 30,
        "cost_in_per_1m": 1.00,
        "cost_out_per_1m": 3.00,
    },
    {
        "key": "opencode",
        "label": "OpenCode Zen",
        "base_url": OPENCODE_ZEN_BASE_URL,
        "env_api_key": OPENCODE_API_KEY,
        "models": [OPENCODE_MODEL],
        "default_model": OPENCODE_MODEL,
        "priority": 40,
        "cost_in_per_1m": 0.27,
        "cost_out_per_1m": 1.10,
    },
    {
        "key": "opencode-go",
        "label": "OpenCode Go (suscripción)",
        "base_url": OPENCODE_GO_BASE_URL,
        "env_api_key": OPENCODE_API_KEY,
        "models": [OPENCODE_GO_MODEL],
        "default_model": OPENCODE_GO_MODEL,
        "priority": 50,
        "cost_in_per_1m": 0.0,
        "cost_out_per_1m": 0.0,
    },
    {
        "key": "claude",
        "label": "Claude (Anthropic)",
        "base_url": "https://api.anthropic.com",
        "env_api_key": ANTHROPIC_API_KEY,
        "models": ["claude-sonnet-4-20250514", "claude-haiku-4-20250514"],
        "default_model": ANTHROPIC_MODEL,
        "priority": 15,
        "cost_in_per_1m": 3.00,
        "cost_out_per_1m": 15.00,
    },
]

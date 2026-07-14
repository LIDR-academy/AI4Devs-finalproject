# PROMPT_REGISTRY — Especificación del registro de prompts

> Define cómo se registran los prompts de IA usados en el proyecto, de forma independiente del IDE y del proveedor.
> La automatización vive en la skill `ai-specs/skills/prompt-registry/SKILL.md`. Última actualización: 2026-07-14.

## Archivos del registro

| Archivo | Rol |
|---|---|
| `prompts/00-all-prompts.md` | **Registro completo**: todos los prompts, cronológicos, con metadatos |
| `prompts.md` | **Registro curado para la entrega**: máx. 3 prompts por sección de la plantilla (los más relevantes) |

## Formato de metadatos (obligatorio en `00-all-prompts.md`)

Cada prompt registrado lleva una línea de metadatos:

```
> 📋 {fecha UTC ISO 8601} · {source} · {modelo} · {thinking} · {contexto} · {usuario}
```

| Campo | Valores de ejemplo |
|---|---|
| Fecha UTC | `2026-07-14T15:30:00Z` (usar `n/d` solo si es irrecuperable) |
| Source | `VS Code`, `Claude Code CLI`, `Cursor`, `Codex`, `Gemini CLI`, … |
| Modelo | `Claude Fable 5`, `Claude Opus 4.6`, `GPT-5`, … |
| Thinking | `low` / `medium` / `high` / `n/d` |
| Contexto | tamaño aproximado, ej. `~120K tokens`, o `n/d` |
| Usuario | quien ejecutó el prompt |

## Estructura de `00-all-prompts.md`

- Organizado en **sesiones** (`# Sesión N — título`), con fecha y herramienta.
- Cada prompt numerado dentro de la sesión (`## NN — título corto`).
- El texto del prompt va en bloque de código; debajo, en cursiva, el resultado resumido.
- Cada sesión cierra con tabla "Resumen de archivos modificados" cuando aplica.
- El pie del archivo mantiene el contador: `N sesiones · M prompts documentados`.

## Reglas

1. **Revisar el historial antes de registrar**: no duplicar prompts ya registrados.
2. Registrar **prompts significativos**: los que crean/modifican artefactos, toman decisiones o corrigen rumbo. Las confirmaciones triviales («sí», «procede») se registran solo si desbloquean una decisión.
3. `prompts.md` se actualiza solo cuando el prompt es de los **más relevantes de su sección** (límite: 3 por sección) e incluye referencia al registro completo.
4. El registro se actualiza **al cierre de cada sesión de trabajo** o al completar una US (paso 9 del flujo de `CONTRIBUTING.md`).
5. El registro es agnóstico de proveedor: cualquier IA/IDE que trabaje en el repo debe registrar sus prompts con este mismo formato.

## Uso con agentes

- **Claude Code / Cursor**: invocar la skill `prompt-registry` (enlazada en `.claude/skills/` y `.cursor/skills/`).
- **Otros agentes**: seguir manualmente esta especificación (la skill es un archivo markdown legible por cualquier modelo: `ai-specs/skills/prompt-registry/SKILL.md`).

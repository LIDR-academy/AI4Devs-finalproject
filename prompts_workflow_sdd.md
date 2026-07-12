# Prompt — Bootstrap workflow SDD

Cómo se construyó el sistema AI-assisted de implementación de user stories de RunMarket: carpeta `.claude/` (agents, skills, commands), reglas TDD/OWASP y backlog técnico en `docs/backlog/`.

---

## Cómo usar

1. Abre un chat nuevo en **Claude Code**.
2. Adjunta contexto del repo: `@docs/USER-STORIES.md`, `@docs/ARCHITECTURE.md`, `@docs/DATA-MODEL.md`.
3. Pega primero el **metaprompt** para acordar el diseño; a partir de su respuesta, pega el **prompt real** para que lo construya.
4. El agente debe generar ficheros; **no implementar código de la aplicación RunMarket**.

---

## Metaprompt

```markdown
Actúa como arquitecto de agentes AI. Quiero automatizar en Claude Code la
implementación de user stories del proyecto RunMarket con dos garantías
no negociables: TDD obligatorio en toda implementación, y ninguna user
story se cierra sin pasar una revisión de seguridad OWASP con bucle de
remediación hasta cero hallazgos HIGH/CRITICAL.

Antes de escribir el prompt de bootstrap definitivo, propón:
- Qué agents necesito (roles) y qué skill invoca cada uno.
- Qué skills necesito para cubrir: refinar una US en backlog técnico,
  implementar backend/frontend tarea a tarea, la disciplina TDD en sí
  misma, la revisión OWASP, y el code review de arquitectura.
- Qué commands expongo al desarrollador y qué agent/skill dispara cada uno.
- Dónde vive el backlog técnico generado por US y cómo se archiva al cerrar.

No implementes nada todavía — solo la propuesta de estructura.
```

---

## Prompt real

```markdown
Actúa como arquitecto de agentes AI y haz el **bootstrap completo** del
workflow SDD (Specification-Driven Development) para implementar user
stories de **RunMarket** en Claude Code.

**Premisa:** no existe `.claude/` ni `CLAUDE.md`. Créalo todo desde cero,
junto con `docs/backlog/`. Toda la configuración AI vive en `.claude/`
(agents, skills, commands) — ninguna otra carpeta.

## Principios no negociables

- **TDD obligatorio** en toda implementación (backend, frontend, fixes de
  seguridad): test que falla → código mínimo → refactor en verde.
- **Revisión OWASP Top 10 obligatoria** antes de cerrar cualquier US;
  hallazgos HIGH/CRITICAL se corrigen y se re-revisa hasta quedar limpios.
- Backlog técnico en español; `.claude/` en inglés.

## Qué crear bajo `.claude/`

**Agents** (rol completo, referencian skills bajo `.claude/`):
`product-owner` (refina una US, sin código) · `backend-developer` ·
`frontend-developer` (implementan tarea a tarea con TDD) · `security`
(ejecuta la revisión OWASP y el bucle de remediación).

**Skills** (comportamiento de cada paso, con frontmatter YAML):
`breakdown-user-story` (US → tabla de tareas con test de verificación) ·
`tdd-implementation` (red-green-refactor, unit vs integration vs E2E) ·
`backend-feature` / `frontend-feature` (arquitectura en capas, reglas de
seguridad propias de cada capa) · `owasp-security-review` (Top 10 +
registro de hallazgos en el backlog) · `code-review` (arquitectura en
capas no se rompe) · `implement-user-story` / `implement-task` /
`archive-user-story` (orquestan el flujo, una tarea suelta, o el archivado).

**Commands** (lo que invoca el desarrollador, cada uno referencia su
agent/skill): `/refine-user-story` · `/implement-user-story` ·
`/implement-task` · `/archive-user-story`.

## Backlog técnico

`/refine-user-story US-XXX` lee la US solicitada de `docs/USER-STORIES.md`
(fuente de producto, no se modifica nunca) y genera `docs/backlog/US-XXX.md`:
estado del workflow, US refinada, tabla de tareas (`ID | Capa | Tarea |
Depende de | Verificacion`), detalle por tarea con tests TDD, y sección de
seguridad OWASP. Al cerrar, `/archive-user-story` lo mueve a
`docs/backlog/archive/`.

## Reglas generales

- No expandir scope fuera de la US solicitada.
- Cada tarea mapea al menos un criterio de aceptación de la US.
- No implementar la aplicación RunMarket en esta tarea — solo el sistema AI.
```

---

## Artefactos generados y para qué sirven

| Artefacto | Para qué sirve |
|---|---|
| `CLAUDE.md` (raíz) | Índice de entrada: qué leer según el tipo de tarea, y las reglas de seguridad no negociables del código |
| `.claude/agents/` (4) | `product-owner` refina · `backend-developer`/`frontend-developer` implementan con TDD · `security` audita OWASP |
| `.claude/skills/` (12) | Comportamiento de cada paso del workflow — refinar, TDD, feature backend/frontend, OWASP, code review, orquestación de fases, archivado, más `conventional-commit`, `e2e-playwright` y `generate-user-stories`, añadidas después del bootstrap inicial |
| `.claude/commands/` (4) | `/refine-user-story`, `/implement-user-story`, `/implement-task`, `/archive-user-story` — lo que el desarrollador invoca |
| `docs/backlog/<US-ID>.md` | Backlog técnico activo de una US en curso |
| `docs/backlog/archive/<US-ID>.md` | El mismo backlog, tras cerrarse la US |

---

## Explicación del workflow

```text
/refine-user-story US-XXX      → product-owner genera docs/backlog/US-XXX.md y para
/implement-user-story US-XXX   → recorre fases 2-6, pausando entre cada una y antes de cada tarea
/archive-user-story US-XXX     → mueve el backlog cerrado a docs/backlog/archive/
```

Las 6 fases de `/implement-user-story`: **Backend** (TDD obligatorio) → **Frontend** (TDD obligatorio) → **Verificación** (suites completas) → **Seguridad** (revisión OWASP + bucle de remediación hasta cero HIGH/CRITICAL) → **Cierre** (checklist + Pull Request). Nunca avanza de fase con tests en rojo o hallazgos HIGH/CRITICAL abiertos.

Detalle completo del workflow ya en funcionamiento (con ejemplos reales de checkpoints y salidas): [`docs/SDD-WORKFLOW.md`](docs/SDD-WORKFLOW.md).

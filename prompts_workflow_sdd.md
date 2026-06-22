# Prompt — Bootstrap workflow SDD (desde cero)

Documento para **generar desde cero** el sistema AI-assisted de implementación de user stories en RunMarket: carpeta `.claude/`, skills, agents, reglas TDD/OWASP, comandos y backlog técnico.

**Premisa:** no existe la carpeta `.claude/` ni `CLAUDE.md`. El agente debe crearlo todo.

Fecha de referencia: 2026-06-06.

---

## Cómo usar

1. Abre un chat nuevo en **Claude Code**.
2. Adjunta contexto del repo: `@docs/USER-STORIES.md`, `@docs/ARCHITECTURE.md`, `@docs/DATA-MODEL.md`.
3. Copia y pega la sección **Prompt completo** (bloque markdown inferior).
4. El agente debe generar ficheros; **no implementar código de la aplicación RunMarket**.

---

## Prompt completo

```markdown
Actúa como arquitecto de agentes AI y **bootstrap completo** del sistema de workflow SDD (Specification-Driven Development) para implementar user stories del proyecto **RunMarket**.

## Premisa importante

**No existe la carpeta `.claude/`** ni configuración previa de agentes/skills. Debes **crearla desde cero**, junto con `CLAUDE.md` en la raíz y la carpeta `docs/backlog/`.

No asumas ficheros preexistentes salvo la documentación del producto en `docs/`.

No crees carpetas `.ai/` ni `.cursor/`. Toda la configuración AI vive en `.claude/`.

## Contexto del proyecto (ya existente)

- Monorepo académico eCommerce especializado en running.
- Stack: Next.js 14, Express 4, Node.js 20, TypeScript, PostgreSQL 16, Prisma 5.
- Testing: Vitest + RTL (frontend), Jest + Supertest (backend), Playwright (E2E).
- User stories: `docs/USER-STORIES.md` (US-001 … US-013).
- Arquitectura: `docs/ARCHITECTURE.md`, `docs/DATA-MODEL.md`, `docs/PRD.md`.
- MVP **sin autenticación** (compra anónima, carrito/pedidos en sesión).
- Separación frontend SSR + backend REST + PostgreSQL.

## Objetivo del sistema AI

Diseñar un workflow reproducible con **TDD obligatorio en implementación** y **revisión OWASP con bucle de remediación**:

1. **Refinar US** (sin código) → backlog técnico en `docs/backlog/<US-ID>.md`.
2. **Implementar** backend/frontend tarea a tarea con confirmación del usuario.
3. **Verificar** con tests (TDD).
4. **Revisar seguridad OWASP** → corregir HIGH/CRITICAL → re-revisar.
5. **Cerrar** con checklist.

---

## Principios no negociables

### TDD (Test-Driven Development)

- Toda implementación (fases 2, 3 y remediaciones de seguridad) debe seguir TDD cuando sea posible:
  1. Test que falle.
  2. Código mínimo que pase.
  3. Refactor con tests verdes.
- Cada tarea del backlog debe incluir **tests explícitos** en su definición de done.
- La skill `tdd-implementation` debe ser referenciada por los agents backend-developer y frontend-developer y por la skill implement-task.
- Si TDD no es viable en un caso concreto, documentar el motivo en el backlog.

### Seguridad OWASP

- Toda US implementada pasa por revisión OWASP antes de cerrarse.
- Usar OWASP Top 10 como referencia (access control, injection, XSS, misconfiguration, secrets exposure, etc.).
- Hallazgos **HIGH** y **CRITICAL** deben corregirse antes del cierre; re-revisar hasta quedar limpios.
- Validación de entrada en backend; nunca secretos en cliente; queries parametrizadas; mensajes de error seguros.
- Registrar hallazgos en `docs/backlog/<US-ID>.md` sección Seguridad.

---

## Estructura `.claude/` a crear (fuente de verdad)

Crea **solo** las primitivas que Claude Code reconoce de forma nativa: `agents/`, `skills/`, `commands/` y `CLAUDE.md` en la raíz. **No** crees `context/`, `rules/`, `workflows/` ni `checklists/`.

Motivo: Claude Code no tiene primitiva `rules` (es convención de otras herramientas); `context/` duplicaría `CLAUDE.md` + `docs/`; y los workflows/checklists usados por una sola skill no justifican un fichero aparte. Ese contenido vive **inline** en la skill/agent que lo usa o en `CLAUDE.md`.

Contenido en **inglés**, real en cada fichero (no wrappers que apunten a otra carpeta). Skills con frontmatter YAML (`name`, `description`).

```text
.claude/
├── agents/
│   ├── product-owner.md
│   ├── backend-developer.md
│   ├── frontend-developer.md
│   └── security.md
├── skills/
│   ├── breakdown-user-story/
│   │   ├── SKILL.md         ← Part A refinar US · Part B tareas · Part C checkpoint
│   │   └── task-template.md
│   ├── implement-user-story/SKILL.md   ← 6 fases · modos · checklist de cierre (fase 6) inline
│   ├── implement-task/SKILL.md         ← una tarea · TDD · rol según columna Capa
│   ├── archive-user-story/SKILL.md     ← mover US a docs/backlog/archive/
│   ├── tdd-implementation/SKILL.md     ← red-green-refactor · unit/integration/E2E · test-quality
│   ├── backend-feature/SKILL.md        ← clean-architecture + backend rules + TDD + OWASP backend
│   ├── frontend-feature/SKILL.md       ← UX states + frontend rules + TDD RTL + sin secretos cliente
│   ├── owasp-security-review/SKILL.md  ← Top 10 + checklist seguridad + registro backlog + bucle
│   └── code-review/SKILL.md            ← clean-architecture review + checklists backend/frontend
└── commands/
    ├── refine-user-story.md
    ├── implement-user-story.md
    ├── implement-task.md
    └── archive-user-story.md
```

### Dónde vive el contenido de las carpetas eliminadas

| Antes (carpeta) | Ahora vive en |
|---|---|
| `context/*` | `CLAUDE.md` (índice) + `docs/` (PRD, ARCHITECTURE, DATA-MODEL) |
| `rules/universal.md` | `CLAUDE.md` |
| `rules/tdd.md` · checklist `test-quality` | `skills/tdd-implementation/SKILL.md` |
| `rules/owasp.md` · checklist `security-review` | `skills/owasp-security-review/SKILL.md` |
| `rules/backend.md` · `rules/clean-architecture.md` | `skills/backend-feature/SKILL.md` |
| `rules/frontend.md` | `skills/frontend-feature/SKILL.md` |
| checklists `backend-review` · `frontend-review` · review clean-architecture | `skills/code-review/SKILL.md` |
| checklist `user-story-implementation` | `skills/implement-user-story/SKILL.md` (cierre, fase 6) |
| `workflows/*` | la `SKILL.md` correspondiente (los pasos del workflow son el cuerpo de la skill) |

> **Fuera de scope:** `product-discovery` y `generate-user-stories`. Las US ya existen en `docs/USER-STORIES.md`; este sistema solo las **refina** y las **baja a tareas** (`breakdown-user-story`).

### Raíz del repo

- `CLAUDE.md` — índice del proyecto + **reglas universales**: qué leer según tipo de tarea (product, implement, frontend, backend, security). Las rutas apuntan a `.claude/` y `docs/`.

### Contenido mínimo exigido por skill clave

**`tdd-implementation/SKILL.md`:** ciclo TDD, cuándo unit vs integration vs E2E, criterios de calidad de test, output con tests añadidos y verificación ejecutada.

**`owasp-security-review/SKILL.md`:** trust boundaries, auth (N/A MVP), injection, XSS, CSRF, secrets, logs, dependencies; severidad; remediación; checklist de seguridad inline; integración con backlog; bucle hasta sin HIGH/CRITICAL.

**`backend-feature/SKILL.md`:** use case → capas (clean architecture) → TDD → validación input → owasp backend → tests Supertest/Jest.

**`frontend-feature/SKILL.md`:** journey → componentes → estados UX → TDD RTL → sin secretos en cliente.

**`code-review/SKILL.md`:** revisión de clean architecture + checklists de backend y frontend inline.

**`breakdown-user-story/SKILL.md`:** Part A refinar US, Part B generar tareas, Part C checkpoint. Output: `docs/backlog/<US-ID>.md`.

**`implement-user-story/SKILL.md`:** 6 fases; siempre pausa entre fases y checkpoint por tarea en fases 2–3; lee el estado del backlog para retomar donde se dejó; checklist de cierre (fase 6) inline.

**`implement-task/SKILL.md`:** una tarea; TDD; rol según columna Capa.

**`archive-user-story/SKILL.md`:** mover `docs/backlog/<US-ID>.md` a `docs/backlog/archive/`; cabecera de fecha; aviso si incompleto.

### Comandos (`.claude/commands/`)

Cada comando debe incluir instrucciones completas y referencias a rutas bajo `.claude/` (agents, skills). Ejemplo de referencias en `/refine-user-story`:

- `.claude/agents/product-owner.md`
- `.claude/skills/breakdown-user-story/SKILL.md`
- `.claude/skills/breakdown-user-story/task-template.md`

Los agents (`backend-developer`, `frontend-developer`, `security`) deben contener el rol completo y referenciar skills bajo `.claude/`, no otra carpeta.

---

## Backlog técnico (`docs/backlog/`)

Crear `docs/backlog/README.md` y `docs/backlog/archive/README.md`.

Cada `/refine-user-story US-XXX` genera **`docs/backlog/US-XXX.md`** con:

1. Estado del workflow (checkboxes).
2. US refinada (español).
3. **Tabla de tareas** (obligatoria):

| ID | Capa | Tarea | Depende de | Verificacion |

4. Detalle por tarea: `- [ ] Implementado`, criterios de done, **tests TDD**.
5. Verificación integrada.
6. Seguridad OWASP (hallazgos + remediación).

### IDs de tarea

Formato: `<US-ID>-TASK-<NN>` — ej. `US-001-TASK-01`, `US-001-TASK-02`.

- NN secuencial 2 dígitos, global por US.
- `Capa`: `Backend` | `Frontend`.
- Backend antes de frontend si hay dependencia.
- Columna **Verificacion** debe nombrar test concreto (Supertest, Jest, RTL, Playwright).

Plantilla: `.claude/skills/breakdown-user-story/task-template.md`

### Archivar US implementada

Comando: `/archive-user-story US-XXX`

- Mueve `docs/backlog/US-XXX.md` → `docs/backlog/archive/US-XXX.md`.
- Añade cabecera `Archivado: YYYY-MM-DD`.
- Advierte si el workflow no está cerrado; pide confirmación para archivar igualmente.
- No modifica `docs/USER-STORIES.md`.

Usar tras cerrar fase 6 de `/implement-user-story`.

Skill: `.claude/skills/archive-user-story/SKILL.md`

---

## Workflow SDD — fases

| Fase | Comando / rol | TDD | OWASP |
|---|---|---|---|
| 1 Refinar | `/refine-user-story` · product-owner | — | considerar en diseño de API |
| 2 Backend | backend-developer | **obligatorio** | validación input, queries seguras |
| 3 Frontend | frontend-developer | **obligatorio** | XSS, no secretos en cliente |
| 4 Verificación | backend-developer + frontend-developer | ejecutar tests | — |
| 5 Seguridad | security · owasp-security-review | tests de regresión post-fix | **obligatorio** |
| 6 Cierre | checklist de cierre en implement-user-story | — | — |
| — Archivar | `/archive-user-story` · product-owner | — | — |

Tras fase 6, opcionalmente `/archive-user-story US-001` mueve el fichero a `docs/backlog/archive/`.

### Flujo recomendado (2 pasos)

```text
/refine-user-story US-001     → docs/backlog/US-001.md (parar, preguntar)
/implement-user-story US-001  → implementa fase a fase, siempre pausa entre fases y antes de cada tarea
```

### Checkpoint por tarea (fases 2–3, siempre)

Antes de cada tarea:

```markdown
## Checkpoint — Tarea US-001-TASK-01
Capa: Backend
Tarea: GET /api/products
Tests previstos: Supertest GET /api/products → 200
¿Implementar? sí | no | saltar | revisar
```

Tras `sí`: TDD → marcar `- [x] Implementado` → siguiente tarea.

### Seguridad — bucle de remediación

1. Revisar cambios de la US con `owasp-security-review`.
2. Registrar en backlog (severidad, componente, exploit, fix, estado).
3. Corregir HIGH/CRITICAL (con TDD para el fix).
4. Re-revisar hasta cero HIGH/CRITICAL abiertos.
5. Marcar `Revisión de seguridad aprobada`.

---

## Scope modifiers

- `backend-only` · `frontend-only` · `security-only`

---

## Reglas generales

- `.claude/` = única fuente de verdad para agents, skills y commands.
- `CLAUDE.md` = índice de entrada + reglas universales; apunta a rutas bajo `.claude/` y `docs/`.
- Backlog en **español**; `.claude/` en **inglés**.
- No expandir scope fuera de la US solicitada.
- Si no hay scaffold de código, documentar bloqueos en backlog (no inventar estructura arbitraria).
- Cada tarea debe mapear al menos un criterio de aceptación de la US.
- **No implementar la aplicación RunMarket** en esta tarea; solo el sistema AI/workflow.

---

## Entregables

Genera **todos** los ficheros listados. Orden sugerido:

1. `CLAUDE.md` (índice + reglas universales).
2. `.claude/agents/`.
3. `.claude/skills/` (TDD, OWASP, backend/frontend-feature, code-review — con reglas y checklists inline).
4. `.claude/commands/`.
5. `docs/backlog/README.md` y `docs/backlog/archive/README.md`.

Al terminar, escribe en la respuesta (no en un fichero extra) una sección **"Cómo usar"** con:

1. Flujo 2 pasos (refine → implement).
2. Flujo 1 paso.
3. Flujo manual por tarea.
4. Tabla de comandos.
5. Ejemplo US-001 con tabla de tareas incluyendo columna Verificacion (tests TDD).
6. Recordatorio del bucle OWASP.
```

---

## Referencia rápida (post-bootstrap)

### Comandos

| Comando | Acción |
|---|---|
| `/refine-user-story US-XXX` | Refinar US → `docs/backlog/US-XXX.md` |
| `/implement-user-story US-XXX` | Implementar desde backlog (pausa entre fases y por tarea) |
| `/implement-user-story US-XXX <scope>` | Solo una fase: `backend-only`, `frontend-only`, `security-only` |
| `/implement-task US-XXX US-XXX-TASK-NN` | Una tarea concreta (TDD) |
| `/archive-user-story US-XXX` | Mover backlog → `docs/backlog/archive/` |



### Ejemplo backlog US-001

| ID | Capa | Tarea | Depende de | Verificacion |
|---|---|---|---|---|
| US-001-TASK-01 | Backend | GET /api/products | — | Supertest: 200 + schema |
| US-001-TASK-02 | Backend | ProductRepository Prisma | US-001-TASK-01 | Jest unit |
| US-001-TASK-03 | Frontend | Página `/` catálogo | US-001-TASK-01 | RTL: render + cards |
| US-001-TASK-04 | Frontend | Estados loading/empty/error | US-001-TASK-03 | RTL: 3 estados |

### Mapa resultante

```text
.claude/                ← crear desde cero (TDD + OWASP en skills)
docs/backlog/           ← US activa (implementación en curso)
docs/backlog/archive/   ← US archivadas (/archive-user-story)
CLAUDE.md               ← índice del proyecto
```

### Documentos de producto (entrada, ya existentes)

| Fichero | Uso |
|---|---|
| `docs/USER-STORIES.md` | US originales (producto) |
| `docs/backlog/US-XXX.md` | Backlog técnico activo |
| `docs/backlog/archive/US-XXX.md` | Backlog archivado |
| `docs/ARCHITECTURE.md` | Contratos y capas |
| `docs/DATA-MODEL.md` | Entidades Prisma |
| `docs/PRD.md` | Alcance MVP |

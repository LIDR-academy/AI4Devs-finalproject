# Prompt — Bootstrap workflow SDD (desde cero)

Documento para **generar desde cero** el sistema AI-assisted de implementación de user stories en RunMarket: carpeta `.claude/`, skills, agents, reglas TDD/OWASP, workflows, comandos y backlog técnico.

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
- Skills y rules de TDD deben ser referenciados por backend-developer, frontend-developer e implement-task.
- Si TDD no es viable en un caso concreto, documentar el motivo en el backlog.

### Seguridad OWASP

- Toda US implementada pasa por revisión OWASP antes de cerrarse.
- Usar OWASP Top 10 como referencia (access control, injection, XSS, misconfiguration, secrets exposure, etc.).
- Hallazgos **HIGH** y **CRITICAL** deben corregirse antes del cierre; re-revisar hasta quedar limpios.
- Validación de entrada en backend; nunca secretos en cliente; queries parametrizadas; mensajes de error seguros.
- Registrar hallazgos en `docs/backlog/<US-ID>.md` sección Seguridad.

---

## Estructura `.claude/` a crear (fuente de verdad)

Crea esta estructura completa con **contenido real** en cada fichero (no wrappers que apunten a otra carpeta). Contenido en **inglés**. Skills con frontmatter YAML (`name`, `description`) cuando aplique.

```text
.claude/
├── context/
│   ├── project.md          ← RunMarket, MVP, entidades, rutas
│   ├── architecture.md     ← resumen de docs/ARCHITECTURE.md
│   ├── tech-stack.md       ← stack + frameworks de test
│   └── product.md          ← resumen de docs/PRD.md / visión
├── agents/
│   ├── product-owner.md
│   ├── backend-developer.md
│   ├── frontend-developer.md
│   └── security.md
├── rules/
│   ├── universal.md
│   ├── tdd.md              ← ciclo red-green-refactor, tipos de test
│   ├── owasp.md            ← Top 10 + prácticas obligatorias
│   ├── clean-architecture.md
│   ├── backend.md
│   └── frontend.md
├── skills/
│   ├── product-discovery/SKILL.md
│   ├── generate-user-stories/SKILL.md
│   ├── generate-user-stories/us-template.md
│   ├── breakdown-user-story/SKILL.md
│   ├── breakdown-user-story/task-template.md
│   ├── implement-user-story/SKILL.md
│   ├── implement-task/SKILL.md
│   ├── archive-user-story/SKILL.md        ← mover US a backlog/archive/
│   ├── tdd-implementation/SKILL.md      ← TDD en features y fixes
│   ├── backend-feature/SKILL.md           ← referencia tdd + owasp + backend rules
│   ├── frontend-feature/SKILL.md
│   ├── owasp-security-review/SKILL.md     ← revisión + registro en backlog
│   ├── clean-architecture-review/SKILL.md
│   └── code-review/SKILL.md
├── workflows/
│   ├── refine-user-story.md
│   ├── implement-user-story.md
│   ├── security-review.md
│   ├── archive-user-story.md
│   └── feature-development.md
├── checklists/
│   ├── backend-review.md
│   ├── frontend-review.md
│   ├── security-review.md
│   ├── test-quality.md
│   └── user-story-implementation.md
└── commands/
    ├── refine-user-story.md
    ├── breakdown-user-story.md    ← alias de refine-user-story
    ├── implement-user-story.md
    ├── implement-task.md
    ├── archive-user-story.md
    ├── implement-tdd.md
    ├── security-review.md
    ├── product-discovery.md
    └── generate-user-stories.md
```

### Raíz del repo

- `CLAUDE.md` — índice del proyecto: qué leer según tipo de tarea (product, implement, frontend, backend, security). Todas las rutas apuntan a `.claude/`.

### Contenido mínimo exigido por skill clave

**`tdd-implementation/SKILL.md`:** ciclo TDD, cuándo unit vs integration vs E2E, output con tests añadidos y verificación ejecutada.

**`owasp-security-review/SKILL.md`:** trust boundaries, auth (N/A MVP), injection, XSS, CSRF, secrets, logs, dependencies; severidad; remediación; integración con backlog; bucle hasta sin HIGH/CRITICAL.

**`backend-feature/SKILL.md`:** use case → capas → TDD → validación input → owasp rules → tests Supertest/Jest.

**`frontend-feature/SKILL.md`:** journey → componentes → estados UX → TDD RTL → sin secretos en cliente.

**`breakdown-user-story/SKILL.md`:** Part A refinar US, Part B generar tareas, Part C checkpoint. Output: `docs/backlog/<US-ID>.md`.

**`implement-user-story/SKILL.md`:** 6 fases, modos interactive/auto/continue, checkpoint por fase y **por tarea en fases 2–3**.

**`implement-task/SKILL.md`:** una tarea; TDD; rol según columna Capa.

**`archive-user-story/SKILL.md`:** mover `docs/backlog/<US-ID>.md` a `docs/backlog/archive/`; cabecera de fecha; aviso si incompleto.

### Comandos (`.claude/commands/`)

Cada comando debe incluir instrucciones completas y referencias a rutas bajo `.claude/` (agents, skills, workflows). Ejemplo de referencias en `/refine-user-story`:

- `.claude/agents/product-owner.md`
- `.claude/skills/breakdown-user-story/SKILL.md`
- `.claude/skills/breakdown-user-story/task-template.md`
- `.claude/workflows/refine-user-story.md`

Los agents (`backend-developer`, `frontend-developer`, `security`) deben contener el rol completo y referenciar skills/rules bajo `.claude/`, no otra carpeta.

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
| 6 Cierre | checklist user-story-implementation | — | — |
| — Archivar | `/archive-user-story` · product-owner | — | — |

Tras fase 6, opcionalmente `/archive-user-story US-001` mueve el fichero a `docs/backlog/archive/`.

### Flujo recomendado (2 pasos)

```text
/refine-user-story US-001     → docs/backlog/US-001.md (parar, preguntar)
/implement-user-story US-001 continue
```

### Modos

| Modo | Comportamiento |
|---|---|
| `interactive` (default) | Pausa entre fases 1, 4, 5, 6 |
| `auto` | Sin pausas de fase; **fases 2–3 siguen pidiendo confirmación por tarea** |
| `continue` | Retoma siguiente fase/tarea pendiente en backlog |
| `/implement-task` | Una sola tarea con TDD |

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

- `breakdown-only` · `backend-only` · `frontend-only` · `security-only`

---

## Reglas generales

- `.claude/` = única fuente de verdad para agentes, skills, rules y workflows.
- `CLAUDE.md` = índice de entrada; apunta solo a rutas bajo `.claude/`.
- Backlog en **español**; `.claude/` en **inglés**.
- No expandir scope fuera de la US solicitada.
- Si no hay scaffold de código, documentar bloqueos en backlog (no inventar estructura arbitraria).
- Cada tarea debe mapear al menos un criterio de aceptación de la US.
- **No implementar la aplicación RunMarket** en esta tarea; solo el sistema AI/workflow.

---

## Entregables

Genera **todos** los ficheros listados. Orden sugerido:

1. `.claude/context/` y `.claude/rules/` (incl. **tdd.md** y **owasp.md**).
2. `.claude/agents/` y `.claude/skills/` (incl. TDD y OWASP skills).
3. `.claude/workflows/` y `.claude/checklists/`.
4. `.claude/commands/`.
5. `CLAUDE.md`.
6. `docs/backlog/README.md` y `docs/backlog/archive/README.md`.

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
| `/implement-user-story US-XXX continue` | Implementar desde backlog |
| `/implement-user-story US-XXX` | Refine + implement (interactive) |
| `/implement-user-story US-XXX auto` | Sin pausas de fase; confirma por tarea |
| `/implement-task US-XXX US-XXX-TASK-NN` | Una tarea (TDD) |
| `/archive-user-story US-XXX` | Mover backlog → `docs/backlog/archive/` |
| `/implement-tdd` | Implementación guiada por TDD |
| `/security-review` | Revisión OWASP + backlog |

### Ejemplo backlog US-001

| ID | Capa | Tarea | Depende de | Verificacion |
|---|---|---|---|---|
| US-001-TASK-01 | Backend | GET /api/products | — | Supertest: 200 + schema |
| US-001-TASK-02 | Backend | ProductRepository Prisma | US-001-TASK-01 | Jest unit |
| US-001-TASK-03 | Frontend | Página `/` catálogo | US-001-TASK-01 | RTL: render + cards |
| US-001-TASK-04 | Frontend | Estados loading/empty/error | US-001-TASK-03 | RTL: 3 estados |

### Mapa resultante

```text
.claude/                ← crear desde cero (TDD + OWASP en rules/skills)
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

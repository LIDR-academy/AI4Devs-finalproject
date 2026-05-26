> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

**Asistente principal**: Claude Code (Claude Opus 4.x) operando bajo la metodología **Spec-Driven Development** con el toolkit `Spec Kit` (carpeta `.specify/`).

**Patrón general**: cada sección sigue el ciclo `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze`. Cinco rondas iterativas de `/speckit-analyze` produjeron la versión final del spec, plan, contracts y data-model. Los prompts a continuación son los más representativos / con mayor impacto en el output.

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1** — Refinamiento de idea (skill `idea-refine` + `market-analysis`):

> "Quiero construir una app para planificar viajes en grupo. La idea es básica: combinar Wanderlog (itinerarios) + Splitwise (gastos) + una capa de IA que no alucine. Antes de empezar a especificar, ayúdame a refinar la idea con divergent → convergent thinking: ¿cuál es el wedge real?, ¿quién es el usuario primario?, ¿qué tres asunciones puedo testear baratamente?, y ¿dónde está la trampa de "feature creep" que voy a sentir tentación de aceptar? Después de eso, ejecuta un market-analysis completo: competidores directos (Wanderlog, Mindtrip, Layla, TripIt, Troupe, Splitwise, WePlanify), competidores tangenciales (Skyscanner, Google Maps), gaps de mercado, oportunidades de reuso vs build, posicionamiento estratégico en un cuadrante feature-breadth × group-focus. Output: un único `market-analysis.md` accionable, no un PowerPoint."

*Cómo lo guié*: pedí explícitamente "divergent → convergent" para evitar que convergiera demasiado rápido. Forcé la pregunta del "feature creep" porque mi instinto sería decir "y también ofline + chat + booking interno"; quería que el asistente me devolviera el contraargumento. El market-analysis quedó como `docs/market-analysis.md` (22 KB).

**Prompt 2** — Spec-driven specification (skill `spec-driven-development` + comando `/speckit-specify`):

> "Genera la feature spec `001-trip-planner-core`. La idea ya refinada está en `docs/market-analysis.md`. Quiero el spec en formato Spec Kit (`specs/001-trip-planner-core/spec.md`) con: 6 User Stories priorizadas (P1 wedge, P2 MVP-extension, P3 Phase-2), cada una con Why this priority + Independent Test + Acceptance Scenarios numerados (Given/When/Then). Cada US debe ser independientemente testeable — implementar solo US1 ya debe producir un producto viable. Quiero al menos 70 Functional Requirements organizados por bloques reservados (FR-001..FR-099). NO especifiques tecnología; el spec es WHAT, no HOW. Incluye una sección de Edge Cases exhaustiva (≥ 25) y Success Criteria numericas. Si encuentras ambigüedades, déjalas marcadas como `[NEEDS CLARIFICATION]` — el siguiente paso es `/speckit-clarify`."

*Cómo lo guié*: la regla "no tech" fue clave para que el spec no se corrompiera con decisiones de implementación. La instrucción explícita de marcar ambigüedades con `[NEEDS CLARIFICATION]` evitó que el modelo "rellenara" con suposiciones — cada `[NEEDS CLARIFICATION]` se convirtió en una clarification question en la siguiente ronda.

**Prompt 3** — Clarification rounds (`/speckit-clarify`, 10 Q&A iterativas):

> "Recorre el spec y haz hasta 10 preguntas de clarificación que tengan **máximo impacto** sobre el alcance. Para cada una: (a) presenta 2–4 opciones concretas + trade-offs, (b) deja claro qué decisión bloqueas si no la resuelvo, (c) sé directa con tu recomendación. Empieza por las que más cambian el alcance del MVP — no me preguntes sobre el favicon antes de preguntarme si Find & Save está dentro o fuera del MVP. Cuando responda, actualiza el spec **en el mismo turno** y referencia la clarification en la sección `Clarifications` con el patrón `[Clarification QN](#clarifications)`."

*Cómo lo guié*: el truco fue pedirle ordenar por *blast radius*. Las primeras 3 clarifications (Q1: ¿Find & Save dentro de MVP? Q2: ¿Paid tier en MVP? Q10: ¿Prompt libre o formulario estructurado?) movieron literalmente el alcance del MVP. Sin ese orden, hubiese gastado tiempo en preguntas cosméticas.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1** — `/speckit-plan` con C4 a tres niveles:

> "Genera el `plan.md` desde el spec finalizado. Quiero la sección 'Architecture' en formato **C4 model** a 3 niveles (System Context → Containers → Components), cada uno con un diagrama Mermaid (`flowchart LR` o `flowchart TB`, no imágenes externas). Pínta los siguientes con tema oscuro azul (`primaryColor:#1e3a5f`, `primaryTextColor:#e2e8f0`). Agrupa los partners externos en subgraphs por categoría (Booking, AI & Places, Auxiliary). Justifica explícitamente: ¿por qué modular monolith y no microservicios? ¿qué sacrificas? Llena la Constitution Check table con cada principio de `.specify/memory/constitution.md` antes y después de la sección de design."

*Cómo lo guié*: la insistencia en "no imágenes externas" forzó Mermaid, que es renderable en GitHub directamente. Pedir la Constitution Check **antes y después** del design fue clave para que el modelo no se autorizara a sí mismo a violar principios.

**Prompt 2** — ADR-0007 (AI Trip Planner architecture, dos rondas):

> "Tras la 4ª ronda de `/speckit-analyze`, surgió un problema: el AI feature actual produce un solo draft que el usuario no puede comparar. Cambia la arquitectura a un **budget-constrained orchestrator** que devuelva **3 alternativas — Budget / Balanced / Splurge** — cada una estrictamente dentro del presupuesto. Diseña el state graph en **LangGraph** con 4 subsystems: (1) partner fan-out, (2) budget allocator **determinista en Python — NO LLM**, (3) Tavily web search snippet-only con cap 6 calls + TTL cache, (4) síntesis Claude Sonnet x3 paralela. Cost ceiling **hard $0.20/generation**, expected $0.05–$0.10. Definir explicitamente el **honest failure mode** (FR-049): si no hay plan en presupuesto, devolver el más barato encontrado + gap + palancas concretas. Escribir como ADR-0007 con secciones: Context, Decision, Consequences, Alternatives considered, Affected documents. Listar qué documentos hay que actualizar en el mismo PR (constitution? plan? data-model? contracts?)."

*Cómo lo guié*: el énfasis en "deterministic, NOT LLM" para el budget allocator fue lo que evitó que el modelo cayera en la solución fácil de "pedirle a Claude que respete el budget" — que no funciona empíricamente. El "Affected documents" al final del ADR es lo que dispara la propagación a plan.md + data-model.md + contracts en la misma PR.

**Prompt 3** — Threat model y mitigaciones por arquitectura:

> "Sección 13 del PRD: Security & Compliance. Genera un threat model en formato tabla (`Threat | Mitigation | Status`) con al menos 10 filas. Para cada amenaza, prefiero mitigación **por arquitectura** (un atacante no puede explotar la clase entera) sobre mitigación **por runtime check**. Ejemplo del nivel de profundidad que quiero: para 'prompt injection vía notas', no me digas 'sanitizamos el input' — di 'arquitectónicamente, el LLM solo recibe campos estructurados validados por Pydantic; el único free-text (`notes`) pasa por `notes_guard.py` (denylist multilingüe EN/ES/FR/IT/DE/PT) y se envuelve en `<user_notes>` como untrusted content. Worst-case injection = bias del plan, no exfiltración, porque el LLM no tiene tools'. Aplica el mismo criterio a snippets de Tavily, receipts maliciosos, JWT replay, RLS bypass."

*Cómo lo guié*: dar el ejemplo concreto de lo que esperaba para una amenaza fue lo que elevó el output. Sin el ejemplo, el modelo hubiera generado "sanitize inputs" para todo.

### **2.2. Descripción de componentes principales:**

**Prompt 1** — Inventory de adapters (`Principle III — All third-party APIs must be wrapped`):

> "Para cumplir Principio III, necesito que cada servicio externo tenga su propio adapter file en `backend/src/infrastructure/adapters/`. Genera una tabla `Adapter | Category | Spec FRs supported | Critical-path | Approval lead time`. Cubre: Supabase (auth + realtime + storage cuentan separados), Anthropic Claude, Tavily, Google Places, Mapbox, Skyscanner, Omio, Booking.com, Hostelworld, Viator, GYG, Civitatis, GuruWalk, Discover Cars, Frankfurter, ClamAV, Resend, OneSignal. Marca lead times críticos (Booking.com 4–8 semanas) con ⚠. Genera **uno** contract file por categoría (no uno por adapter) en `specs/001-trip-planner-core/contracts/adapters/`. Cada contract debe tener: project-owned interface (no exponer tipos del SDK del vendor), request/response shapes, error mapping a los códigos del API surface, qué FRs depende del adapter."

*Cómo lo guié*: la regla "no exponer tipos del vendor" es la que hace los adapters realmente swappables. La consolidación "un contract file por categoría" reduce 21 archivos a 6 y mantiene la cohesión.

**Prompt 2** — Folder structure DDD-lite:

> "Define la project structure final. Regla dura: cada uno de los 9 dominios del spec (`trips`, `polls`, `expenses`, `ai_suggestions`, `find_save`, `discovery`, `budget`, `identity`, `notifications`) mapea **1:1** a una carpeta en `backend/src/` y otra en `frontend/src/`. Ningún dominio puede importar de otro — la única forma de cross-domain communication es a través del router o de tipos compartidos en `shared/`. Los 7 módulos críticos (mutation-tested ≥80%) deben marcarse con `★ CRITICAL — mutation-tested` en el comentario. Pinta el tree completo en code block, con un comentario por archivo crítico explicando qué hace."

*Cómo lo guié*: la regla "ningún dominio puede importar de otro" es lo que evita la degradación a *big ball of mud*. El comentario obligatorio por archivo crítico genera "checkpoint markers" que el modelo respeta en sesiones futuras.

**Prompt 3** — DI wiring (Principio V.3):

> "Principio V.3 dice que el wiring de DI vive solo en `app.py`, no en código de negocio. Tradúcelo a un constraint concreto: muestra cómo un endpoint en `infrastructure/http/routers/expenses.py` recibe `ExpenseService` vía FastAPI `Depends(...)`; cómo `ExpenseService` recibe `CurrencyRateGateway` (interface) vía constructor; cómo `app.py` es el único sitio donde se hace `Depends(lambda: ExpenseService(CurrencyFrankfurterAdapter()))`. No quiero un DI framework (`dependency-injector`, `inject`) — solo FastAPI dependency-overrides + un thin container manual."

*Cómo lo guié*: el "no quiero framework" es lo que mantuvo la solución simple. Sin esa restricción, el modelo hubiera propuesto `dependency-injector` "por completitud".

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1** — Mapping User Stories ↔ módulos ↔ tests:

> "Necesito una matriz de trazabilidad: cada User Story (US1..US5) → qué dominios toca → qué módulos críticos → qué Playwright suite la cubre. Output: tabla en `plan.md` `User Story | Domains | Critical modules | E2E suite`. Esto luego dispara `/speckit-tasks`: cada US se traduce en una secuencia ordenada de tasks dependientes que respeta TDD red-first."

**Prompt 2** — Constitution alignment check después de cada round:

> "Después de cada `/speckit-analyze`, re-ejecuta la Constitution Check del plan. Si una decisión nueva (e.g., añadir LangGraph) viola un principio, márcalo en la Complexity Tracking table con `Why Needed` + `Simpler Alternative Rejected Because`. No me dejes pasar violaciones silenciosamente."

### **2.4. Infraestructura y despliegue**

**Prompt 1** — Stack split deliberado (Vercel + Supabase):

> "Para el MVP necesito hosting barato (free tier idealmente) que escale a 10k MAU sin migrar. Compara: (A) Vercel + Supabase, (B) Fly.io + Supabase, (C) Render + Render Postgres, (D) AWS Lambda + RDS. Para cada opción: coste mensual a 10k MAU, cold start latency p95, vendor lock-in score (0–10), tiempo de migración si pivoteo en mes 12. Recomendación con caveats."

**Prompt 2** — CI gates exhaustivos:

> "Diseña el GitHub Actions workflow `.github/workflows/ci.yml`. Matriz por paquete (backend / frontend / e2e). Gates obligatorios: pytest + coverage 99% line+branch, Vitest + coverage, Playwright E2E (uno por US), ruff, mypy --strict, eslint, prettier, vue-tsc, mutmut sobre los 7 módulos críticos (gated, no full mutation), Stryker (frontend), `axe-core` (WCAG 2.1 AA per ADR-0005). El workflow debe rechazar PRs que añadan código de producción sin un commit previo con tests fallando — search en `git log` por commits con prefix `test:` que precedan al commit actual."

### **2.5. Seguridad**

**Prompt 1** — Eliminación de prompt injection (ADR-0001):

> "Hay una opción de diseño: aceptar prompt libre o forzar formulario estructurado. Escribe ADR-0001 que justifique la decisión. Para 'estructurado': elimina la superficie de prompt injection arquitectónicamente, no por sanitization runtime. Para 'prompt libre': mayor flexibilidad UX. Argumenta los dos lados HONESTLY antes de recomendar. Si recomiendas estructurado, define qué pasa con el único free-text que queda (`notes`) — debe pasar por `notes_guard.py` con denylist en EN/ES/FR/IT/DE/PT, length cap 500, wrapped como `<user_notes>` untrusted content."

**Prompt 2** — GDPR erasure en 7 pasos (FR-080):

> "Implementación de FR-080 GDPR erasure. Necesito un procedimiento documentado de 7 pasos: T+0 soft-delete (qué columnas se tocan, qué pasa con sessions, qué error code en signin attempt), 30 días grace, T+30 hard-delete (qué tablas drop, qué tablas anonimizar), tombstone user `usr_TOMBSTONE` para audit-required rows, receipts cleanup (qué se borra, qué se preserva — los recibos de otros miembros NO se tocan), cache invalidation (push_subscription, etc.), audit event final. Cada paso debe ser implementable como una transacción SQL atómica."

### **2.6. Tests**

**Prompt 1** — Mutation testing como gate de calidad (Principio II.4):

> "Justifica por qué hacemos mutation testing solo en 7 módulos y no en todo el código. Lista los 7: `expenses/balance.py`, `expenses/settlement.py`, `polls/tally.py`, `trips/legs.py`, `ai_suggestions/grounding.py`, `ai_suggestions/budget_allocator.py`, `discovery/food_guide_budget.py`. Para cada uno: qué bug específico de lógica detectaría una mutation que un unit test típico no. Threshold mínimo: 80%. Razón: estos módulos son donde un bug daña al usuario (mal split de dinero, voto perdido, plan fuera de presupuesto)."

**Prompt 2** — Playwright E2E uno por User Story:

> "Diseña la estructura de Playwright. Una suite **por User Story** (`us1-group-trip.spec.ts`..`us5-discovery-food.spec.ts`), no por feature ni por endpoint. Cada suite debe correr el Independent Test que aparece en el spec correspondiente — verbatim, sin abreviar. Ejemplo: la suite de US3 debe abrir el formulario estructurado, rellenar 'LON+MXP origins, Lisbon → Porto destinations, 7 days March 2027, mid-range €1000/pp, Food+Culture', click "Generate AI plan", esperar ≤60s, verificar que aparecen 3 alternativas con costs ≤ €1000/pp cada una, aceptar Balanced, verificar que los line items aparecen en `saved_options`."

---

### 3. Modelo de Datos

**Prompt 1** — Generación inicial del data-model.md:

> "Desde el spec finalizado + las clarifications, genera `specs/001-trip-planner-core/data-model.md`. Reglas duras de design:
>   1. IDs prefijados estilo Stripe: `<3-letter-prefix>_<26-char ULID>`, total 30 chars, stored como `varchar(32)`. Genera la tabla de prefixes (al menos 22 entidades).
>   2. Money columns siempre pair `amount_minor` (bigint) + `currency` (char(3) ISO-4217). Cero columns `float` para dinero.
>   3. Cada tabla tiene `created_at` + `updated_at` UTC default `now()`.
>   4. `ON DELETE CASCADE` desde `trips` a todas las hijas (porque trip es el aggregate root).
>   5. Soft-delete solo en `users.deleted_at` (FR-080); el resto es hard-delete.
>   6. Enums se modelan como `text NOT NULL CHECK (val IN (...))` — backstop a nivel DB; la canonical source es la `StrEnum` de Python.
>   7. RLS policies en cada tabla trip-scoped — verificar `EXISTS (SELECT 1 FROM trip_members WHERE trip_id = X AND user_id = auth.uid())`.
>
> Output: DDL ejecutable SQL + un ER diagram Mermaid + un Enumeration Catalog al final. Sin ORM models — los SQLAlchemy models se generan desde este DDL en TRP-020/021/etc."

*Cómo lo guié*: forzar SQL ejecutable (no pseudocódigo) garantizó que Postgres validara las constraints. La regla "Money siempre pair" eliminó toda una clase de bugs de precision.

**Prompt 2** — Adición de tablas en post-spec deepening:

> "Tras añadir invites first-class (FR-094), audit log (FR-097), AI Trip Planner (ADR-0007), partner response cache, necesito 4 tablas nuevas: `trip_invites`, `audit_events`, `ai_plans`, `partner_response_cache`. Genera el DDL completo + actualiza el ER diagram + actualiza el prefix table + actualiza el Enumeration Catalog (`InviteMode`, `AuditAction`, `PlanAlternative`, `AIPlanStatus`). Para `ai_plans`, garantiza con un partial UNIQUE index que **a lo sumo 1 plan por trip puede estar en status `accepted`**. Para `partner_response_cache`, define PK compuesta `(partner, query_hash)` con TTL 60s para búsquedas live. Para `audit_events`, define que **es inmutable** — no UPDATE ni DELETE policies; solo INSERT."

**Prompt 3** — Reglas de redondeo deterministas (FR-031):

> "Diseña el módulo `expenses/rounding.py` que se usa desde `balance.py` y `settlement.py`. Reglas:
>   - **Banker's rounding** (round half to even) para conversión de divisa.
>   - **Largest-remainder method** para percentage splits (e.g., 33.33% + 33.33% + 33.34% debe sumar 100% exacto en minor units).
>   - **Deterministic remainder allocation** para equal splits cuando el monto no divide exactamente entre miembros — el remainder se asigna al miembro con `joined_at` más temprano (no random, no a quien creó el gasto).
>   - **Test set hand-verifiable**: incluye al menos 5 ejemplos numéricos en el docstring que pueda verificar a mano con una calculadora."

---

### 4. Especificación de la API

**Prompt 1** — Generación de `contracts/api.md`:

> "Genera el API surface en `specs/001-trip-planner-core/contracts/api.md`. Convenciones:
>   - Base path `/api/v1`.
>   - Auth: Bearer JWT validated against Supabase JWKS.
>   - IDs: prefixed strings (`usr_`, `trp_`, etc.) — pattern `^<prefix>_[0-9A-HJKMNP-TV-Z]{26}$`.
>   - Money: `{ amount_minor: int, currency: 'EUR' }`.
>   - Times: ISO-8601 UTC.
>   - Pagination: cursor-based (`?cursor=&limit=20`).
>   - Idempotency: `Idempotency-Key: <uuid>` header opcional en cada POST.
>   - Errors: envelope `{ error: { code: SCREAMING_SNAKE, message, details } }`, códigos estables en v1.
>
> Genera al menos 11 endpoint groups (`identity`, `trips`, `itinerary`, `polls`, `comments`, `expenses`, `budget`, `ai`, `find-save`, `discovery`, `notifications`). Para cada endpoint: method, path, purpose, spec ref (FR-XXX). No incluyas request/response schemas inline — esos se generan de Pydantic schemas en build time y se sirven en `/openapi.json`. **Sí** incluye disclosure semantics: FR-082 (`source` field en todo lo de origen externo) y FR-056 (`disclosure` field con partner + refunds_policy_url en todo /find-save)."

*Cómo lo guié*: el cap de 11 groups vino del spec (9 dominios + comments + ai como subdomain de ai_suggestions). Pedir "no schemas inline" mantuvo el archivo legible — los schemas viven en el código.

**Prompt 2** — Endpoint del AI Trip Planner (3 verbs sobre `/ai/plan`):

> "Diseña los endpoints del AI Trip Planner per ADR-0007:
>   - `POST /trips/{trip_id}/ai/plan` — invocación explícita (FR-041a, jamás auto-fired); devuelve `{ generation_id, plans: [1..3], failure: null | { cheapest_plan, gap, suggested_levers } }`.
>   - `GET /trips/{trip_id}/ai/plan/{generation_id}` — re-fetch (e.g., usuario revisita antes de aceptar; no debe re-generar).
>   - `POST /trips/{trip_id}/ai/plan/{plan_id}/accept` — acepta uno, materializa `saved_options` + `note`-kind `itinerary_items`, transiciona los otros 2 planes a `superseded` **en la misma transacción**, escribe `audit_events.action='ai_plan_accepted'`.
>   - `GET /trips/{trip_id}/ai/quota` — remaining fair-use generations today (FR-045, default 10/user/day; consumido equally by /ai/plan y /ai/draft).
>
> El legacy `POST /ai/draft` permanece para single-item swap flows (`/ai/draft/{id}/swap-item`), pero el primary user-facing path es `/ai/plan`."

**Prompt 3** — Error code catalog:

> "Define el catálogo de error codes que SCREAMING_SNAKE_CASE. Stable durante la vida de v1. Cada code: HTTP status + when fired + what `details` shape. Cubre:
>   - **Generic**: `VALIDATION_ERROR`(422), `NOT_FOUND`(404, anti-enumeration — no leakea si el recurso existe pero no tienes acceso), `FORBIDDEN`(403, has access pero falta capability FR-009), `UNAUTHORIZED`(401), `CONFLICT`(409, e.g. trip cap 20 miembros), `GONE`(410, e.g. invite revoked), `RATE_LIMITED`(429), `PARTNER_UNAVAILABLE`(502), `INTERNAL_ERROR`(500).
>   - **Account / session**: `ACCOUNT_DELETED`(401, signin en cuenta en grace period), `LINKING_REQUIRED`(409, OAuth con email/password ya existe — flow continúa via FR-001a).
>   - **Upload / receipt**: `INVALID_MIME`, `IMAGE_TOO_LARGE`, `PDF_TOO_LARGE`, `VIRUS_DETECTED` (la signature se logea server-side, **nunca** se devuelve al caller — anti-recon).
>
> Adapters NO pueden echo del partner verbatim — translate a uno de estos codes primero. Codes que viven solo en adapter internals (nunca surfacean al API) **no** van en este catálogo."

---

### 5. Historias de Usuario

**Prompt 1** — Generar US con Independent Test cláusula:

> "Para cada User Story (US1..US6) en `spec.md`, necesito esta estructura exacta:
>   - **Title** + Priority (P1/P2/P3) + MVP flag.
>   - **Narrative** (3–5 frases en 'Como X, quiero Y, para Z' implícito — no formato 'As a user' verbatim, prefiero prosa).
>   - **Why this priority**: argumento de mercado / técnico de por qué viene aquí en el orden.
>   - **Independent Test**: una sola frase concreta que pueda dar a un betatester sin contexto del resto del producto. Si la US no es independientemente testeable, está mal priorizada — refactor.
>   - **Acceptance Scenarios**: numerados, formato Given/When/Then. Mínimo 5, máximo 15 por US. Cada uno debe mapearse a un test E2E.
>
> Regla dura: implementar SOLO US1+US2 ya debe producir un producto viable (el wedge). US3 añade IA, US4 añade Find&Save, US5 añade Discovery — pero cada uno es independiente."

**Prompt 2** — Edge cases exhaustivos:

> "Sección Edge Cases del spec — mínimo 25 escenarios. Cubre al menos: member-removed-mid-vote, currency volatility, concurrent-edit (4 sub-rules: scalar field, list field, ranked-choice vote en option withdrawn, drag-and-drop reorder), cheapest-month no data, multi-origin sin vuelos para un miembro, multi-leg sin transport between 2 destinations, mixed-mode booking partial failure, notes injection pattern, notes >500 chars, restaurant verification gap (<3 matches), food data unavailable, AI sin resultados (destination demasiado remota), partner outlink failure, saved option no longer available. Para cada uno: **system behavior** explícito, no 'TBD'. Los edge cases son contratos."

**Prompt 3** — Clarification Q7 (tie en poll de 2 miembros):

> "Clarification Q7: ¿qué pasa si una poll de 2 miembros termina 1–1? Opciones:
>   (a) Coin flip (random).
>   (b) Status `tied` → permitir withdraw option o extender deadline.
>   (c) Organizer-tiebreak (organizer vota 2x).
>   (d) Bloquear creación de polls en groups de 2.
>
> Recomendación con razonamiento. Si elegimos (b), define exactamente: qué UI ve el usuario, qué endpoints expone el backend (`POST /polls/{id}/options/{opt_id}/withdraw`), qué transition del state machine. Actualiza el state diagram del Poll lifecycle en consecuencia."

*Cómo lo guié*: forzar 4 opciones concretas (en lugar de "qué hacemos") evitó que el modelo me devolviera handwaving. La pregunta "qué UI ve el usuario" forzó pensar el flow completo, no solo la decisión.

---

### 6. Tickets de Trabajo

**Prompt 1** — `/speckit-tasks` generation:

> "Translata el spec + plan + data-model + contracts a un backlog ordenado en `tasks.md`. Esquema de ID: `TRP-NNN`. Fases: Setup → Foundational → US1 → US2 → US3 → US4 → US5 → Polish. Cada task debe tener:
>   - ID + título imperativo (`TRP-090 Implementar settlement.py — minimum-transactions debt resolution`).
>   - File paths concretos (`backend/src/expenses/settlement.py`).
>   - **TDD discipline**: cada task de production code debe ir precedido por un task `tests-first` (`TRP-089 Test for settlement.py: ...`).
>   - Marker `[P]` si es paralelizable con tasks adyacentes.
>   - Mention explícito del Spec FR / ADR que motiva el task.
>   - Mutation-test gate para los 7 módulos críticos: el task debe terminar con 'mutation score ≥ 80%'.
>
> Generar ≥ 150 tasks. NO inventes work que el spec no pide. Si encuentras drift entre spec y plan, **stop** y dime — no compenses silenciosamente."

**Prompt 2** — Ticket de DB migration con RLS:

> "Para el ticket `TRP-072` (migration de expenses + shares + settlement_transactions + currency_rates), genera el ticket completo en formato Jira-ready:
>   - Definition of Ready checklist.
>   - Descripción técnica con DDL exacto + indexes + UNIQUE + CHECK constraints.
>   - **RLS policies** explícitas: para cada tabla trip-scoped, la policy `USING (EXISTS (SELECT 1 FROM trip_members tm WHERE tm.trip_id = X AND tm.user_id = auth.uid()))`. Cubre SELECT, INSERT, UPDATE, DELETE.
>   - Test plan: migration up + down clean, integration test que verifica que un non-member recibe 0 filas (no 403 — 0 filas; RLS hace que la query devuelva empty).
>   - Out of scope explícito (qué tablas NO toca este ticket).
>   - Estimación en days."

**Prompt 3** — Ticket de frontend con accessibility gate:

> "Ticket `TRP-051` para `PollVoteCard.vue`. Constraint crítica: **debe pasar `axe-core` sin nuevas violaciones** (ADR-0005 WCAG 2.1 AA). Especifica:
>   - Drag-and-drop operable por teclado: `Space` to pick up, `↑↓` to move, `Space` to drop. No drag exclusivo de mouse.
>   - Tally con `aria-live='polite'` para screen-readers.
>   - i18n: todos los strings via `t(key)` per ADR-0006. ESLint rule `vue/no-bare-strings-in-template` debe pasar.
>   - Realtime SLO: tally update visible en ≤ 5s tras vote de otro miembro (SC-015) — verificable con Playwright + 3 browsers.
>
> Test plan: Vitest unit (mock realtime) + Playwright suite (parte de us1-group-trip) + axe-core integrado."

---

### 7. Pull Requests

**Prompt 1** — Documentation discipline (CLAUDE.md):

> "Genera `CLAUDE.md` que sea la 'runtime guidance' para cualquier agente IA o humano contribuyendo. Reglas binding:
>   1. Antes de empezar un task, re-leer spec + plan + data-model + contracts + constitution.
>   2. Si encuentras drift entre código actual y doc actual, **update the doc first**, then code. Code que diverge de doc es rejected en review.
>   3. Constitution amendments requieren SemVer bump (PATCH para clarifications, MINOR para new principles, MAJOR para breaking changes) + Sync Impact Report en HTML comment al top del file.
>   4. Doc updates van en el **mismo PR** que el code change, jamás en follow-up. Use `docs:` prefix solo para doc-only commits.
>   5. Glossary discipline: nuevo término de dominio → añadir a `docs/glossary.md` en el mismo PR.
>
> Genera una tabla `When this changes... | Update...` con al menos 10 filas (user-facing behavior → spec.md; DB schema → data-model.md; REST API → contracts/api.md; etc.)."

**Prompt 2** — Five-round `/speckit-analyze` PR:

> "Ejecuta `/speckit-analyze` por 5ª vez. Para cada divergencia que encuentres entre spec.md, plan.md, research.md, data-model.md, contracts/, constitution: clasifícala como `Critical | Major | Minor`. Critical: blocks the spec from being implementable (e.g., FR refers to a column that doesn't exist en data-model.md). Major: introduces ambiguity. Minor: cosmetic (terminology drift). Para cada Critical, propone fix concreto **en el mismo turno** y aplícalo. No me dejes con 'recomiendo que hagas X' — hazlo.
>
> Al final de la 5ª ronda, output: PR description summarizando los 5 rounds en bullets, con before/after counts (FRs 84→98, tablas 22→26, adapters 18→21, critical modules 5→7), referenciando los ADRs que disparó (0004, 0005, 0006, 0007, 0008)."

**Prompt 3** — Bumping constitution to v1.0.1:

> "Tras ADR-0005 (WCAG 2.1 AA committed), la constitución necesita PATCH bump v1.0.0 → v1.0.1. Cambios:
>   1. Añade fila 'WCAG 2.1 AA verified via axe-core' a la Technology Stack table del constitution.
>   2. Sync Impact Report en HTML comment al top: qué docs afectados (`plan.md` Constitution Check, `tasks.md` TRP-167a, `docs/PRD.md` §13).
>   3. Commit message: `docs(constitution): bump to v1.0.1 — add WCAG 2.1 AA row per ADR-0005`.
>
> Ejecuta los 3 cambios en el mismo commit. No dejes el bump para 'after first commit' como sugiere la nota TODO en plan.md — hazlo ahora."

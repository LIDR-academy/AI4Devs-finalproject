# 🧾 User Story: Generar plan IA de mi evento

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-017                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | AI-001 Generación de plan IA          |
| Module / Domain    | AI / Events                          |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador con un evento creado
**I want** generar un plan IA estructurado (timeline + categorías sugeridas + recomendaciones iniciales) a partir de los datos del evento
**So that** tenga un punto de partida claro y reduzca tiempo de planificación a < 10 minutos

---

## 🧠 Business Context

### Context Summary

AI-001 es la feature IA inaugural del flujo de planificación. Toma como input los datos del evento (tipo, fecha, invitados, ciudad, presupuesto, idioma) y devuelve un plan estructurado que el organizador puede aceptar/editar/regenerar. La sugerencia es **HITL**: no se materializa como dato oficial hasta que el organizador confirma.

### Related Domain Concepts

* AIRecommendation (status: pending → accepted/edited/rejected/discarded).
* LLMProvider (OpenAI / Mock / Anthropic stub).
* Prompt versionado (AIPromptVersion).

### Assumptions

* `AI-001` corresponde al prompt "EventPlanPrompt v1".
* El organizador puede pedir hasta N regeneraciones (configurable).
* El idioma del evento se incluye en el prompt.

### Dependencies

* EPIC-AI-001 (LLMProvider).
* US-009 (evento creado).
* EPIC-OBS-001 (observabilidad IA).

---

## 🔗 Traceability

| Source                 | Reference                                          |
| ---------------------- | -------------------------------------------------- |
| FRD Requirement(s)     | FR-AI-001, FR-AI-002, FR-AI-009, FR-AI-017          |
| Use Case(s)            | UC-AI-001                                          |
| Business Rule(s)       | BR-AI-001..005, BR-AI-011                          |
| Permission Rule(s)     | Ownership del evento                               |
| Data Entity / Entities | Event, AIRecommendation, AIPromptVersion           |
| API Endpoint(s)        | POST /api/v1/events/:id/ai/plan                    |
| NFR Reference(s)       | NFR-AI-001 (timeout 60s), NFR-AI-002 (fallback)     |
| Related ADR(s)         | ADR-AI-001                                         |
| Related Document(s)    | /docs/7, /docs/17, /docs/8.1 (#9 #15)              |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Chatbot conversacional libre.
* RAG / vector DB.
* Generación IA de imágenes.
* Decisiones autónomas (no aprueba ni reserva).

### Scope Notes

* La sugerencia IA nunca reemplaza tareas/presupuesto oficiales sin confirmación humana.
* No introduce moderación automática.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Generación exitosa

**Given** organizador con evento `draft` o `active`
**When** clic en "Generar plan IA"
**Then** backend invoca `LLMProvider`, persiste `AIRecommendation(type='plan', status='pending')`, devuelve plan estructurado (JSON) con timeline + categorías + notas, y la UI muestra la sugerencia con badge "Sugerido por IA".

### AC-02: Idioma respetado

**Given** evento con `language=pt`
**When** se genera el plan
**Then** el output IA está en portugués.

### AC-03: Trazabilidad

**Given** plan generado
**When** se persiste
**Then** `AIRecommendation` incluye `prompt_version`, `provider`, `language`, `latency_ms`, `fallback_used`.

---

## ⚠️ Edge Cases

### EC-01: Timeout 60s

**Given** la llamada al LLM excede 60 segundos
**When** el sistema detecta el timeout
**Then** retorna error `AI_TIMEOUT`; en modo demo, fallback a `MockAIProvider` y se marca `fallback_used=true`.

#### Handling

* Mensaje UI: "No fue posible generar el plan, intenta de nuevo o usa una sugerencia base."

---

### EC-02: JSON inválido del LLM

**Given** el LLM responde con JSON malformado
**When** Zod falla validación
**Then** un único reintento con prompt corregido; si vuelve a fallar, error `AI_INVALID_OUTPUT`.

#### Handling

* Logging detallado con muestra de salida (sin PII).

---

### EC-03: Provider caído

**Given** OpenAI no disponible
**When** se llama
**Then** en modo demo se usa Mock; en producción, error `AI_PROVIDER_ERROR`.

#### Handling

* Selector por env var.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior                    |
| ----- | ------------------------------------------------- | ------------------------------------- |
| VR-01 | Evento existe y es del usuario                    | 403/404                                |
| VR-02 | Datos completos del evento (tipo, fecha, invitados, presupuesto, ciudad, idioma) | 400 si faltantes |
| VR-03 | Idioma ∈ 4 locales                                | 400                                    |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership del evento.                                                |
| SEC-02 | Rate limit por usuario en endpoints AI.                              |
| SEC-03 | Logs no contienen PII completa; redactar email/teléfono.             |
| SEC-04 | Backend-only: frontend nunca llama directo al LLM.                   |
| SEC-05 | Persistir `AIRecommendation` con traceability completa.              |

### Negative Authorization Scenarios

* Evento ajeno → 403/404.
* Vendor → 403.
* Anónimo → 401.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: AI-001
* Provider Layer: LLMProvider (OpenAIProvider en prod, MockAIProvider en demo/tests)
* Human Validation Required: Yes
* Persist AIRecommendation: Yes
* Fallback Required: Yes

### AI Input

* `event.event_type_code`
* `event.event_date`
* `event.guest_count`
* `event.budget_estimated`
* `event.currency`
* `event.city`
* `event.language`

### AI Output

* JSON estructurado: `{ timeline: [{ phase, milestones[] }], suggested_categories: [...], general_recommendations: [...] }`
* Validado con Zod.

### Human-in-the-loop Rules

* El plan se muestra como sugerencia (status=pending).
* El usuario debe aceptar/editar/descartar para que se aplique.
* El estado refleja accept (`accepted`), edit (`edited`), discard (`rejected`/`discarded`).
* La regeneración produce un nuevo `AIRecommendation`.

### AI Error / Fallback Behavior

* Timeout 60s → error.
* Modo demo: fallback a `MockAIProvider` con respuesta determinista.
* JSON inválido → 1 reintento controlado.
* Provider error → 5xx descriptivo + log con `correlationId`.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | `/[locale]/organizer/events/:id/ai/plan`               |
| Main UI Pattern     | Vista de sugerencia con secciones (Timeline, Categorías, Recomendaciones) + acciones HITL |
| Primary Action      | "Aceptar plan"                                         |
| Secondary Actions   | "Editar", "Regenerar", "Descartar"                     |
| Empty State         | CTA "Generar plan IA"                                  |
| Loading State       | Skeleton + progress message (puede tomar hasta 60s)    |
| Error State         | Banner con razón + retry / fallback                    |
| Success State       | Plan visible con badge "Sugerido por IA"               |
| Accessibility Notes | Sugerencias con role=region y aria-live polite          |
| Responsive Notes    | Mobile-first                                           |
| i18n Notes          | Output IA en idioma del evento                         |
| Currency Notes      | Si se mencionan montos, en moneda del evento           |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/ai/plan`
* Components:

  * `AIPlanGenerator`, `AISuggestionViewer`, `AIBadge`
* State Management:

  * TanStack `useGenerateAIPlan` con manejo de loading prolongado
* Forms:

  * No aplica
* API Client:

  * `aiApi.generatePlan(eventId)`

### Backend

* Use Case / Service:

  * `GenerateEventPlanUseCase` (usa `LLMProvider`)
* Controller / Route:

  * `POST /api/v1/events/:id/ai/plan`
* Authorization Policy:

  * Ownership
* Validation:

  * `eventId` UUID; datos del evento completos
* Transaction Required:

  * Sí (persist AIRecommendation)

### Database

* Main Tables:

  * `ai_recommendations`, `ai_prompt_versions`, `events`
* Constraints:

  * FK event_id; unique por (event_id, type, version) si aplica
* Index Considerations:

  * Índice por (`event_id`, `type`, `status`, `created_at`)

### API

| Method | Endpoint                              | Purpose                |
| ------ | ------------------------------------- | ---------------------- |
| POST   | `/api/v1/events/:id/ai/plan`          | Generar plan IA        |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`ai.plan.generated/failed`)
* AdminAction Required: No
* AIRecommendation Required: Yes

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                              | Type        |
| ----- | ----------------------------------------------------- | ----------- |
| TS-01 | Generación exitosa con MockAIProvider                 | Integration |
| TS-02 | Persistencia de AIRecommendation con metadata         | Integration |
| TS-03 | E2E generar y aceptar plan                            | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Evento ajeno                          | 403/404                  |
| NT-02 | Vendor invoca                         | 403                      |
| NT-03 | Datos incompletos                     | 400                      |

### AI Tests

| ID       | Scenario                                | Expected Result           |
| -------- | --------------------------------------- | ------------------------- |
| AI-TS-01 | MockAIProvider devuelve respuesta válida | Plan estructurado          |
| AI-TS-02 | Timeout 60s                              | 5xx AI_TIMEOUT (o fallback en demo) |
| AI-TS-03 | JSON inválido                            | 1 reintento; si falla, error |
| AI-TS-04 | Provider down (Open AI)                  | Fallback Mock en demo / error en prod |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Sugerencia con region semantic.
* Anuncios de generación completada.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Time to Plan (TTP), Activación de IA                 |
| Expected Impact     | Reduce TTP a < 10 min                                |
| Success Criteria    | ≥ 70% organizadores aceptan o editan el plan         |
| Academic Demo Value | Core demo: muestra IA + HITL + trazabilidad           |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Pantalla generador con HITL.
* Manejo de loading prolongado.
* Acciones aceptar/editar/regenerar.

### Potential Backend Tasks

* Use case + integración LLMProvider.
* Persistencia AIRecommendation.
* Validación JSON Zod.

### Potential Database Tasks

* Tabla `ai_recommendations` + índices.

### Potential AI / PromptOps Tasks

* Registrar prompt "EventPlanPrompt v1" en registry.
* Mock responses deterministas en MockAIProvider.

### Potential QA Tasks

* Tests deterministas con Mock.
* Pruebas de timeout con clock injectable.

### Potential DevOps / Config Tasks

* Configurar `LLM_PROVIDER`, `OPENAI_API_KEY`, `AI_DEMO_MODE`.

---

## ✅ Definition of Ready

* [x] Rol claro.
* [x] Goal/valor claros.
* [x] FRD/UC/BR enlazados.
* [x] Permisos identificados.
* [x] Entidades listadas.
* [x] AC en GWT.
* [x] Edge cases documentados.
* [x] Validación clara.
* [x] Out of Scope explícito.
* [x] Dependencias conocidas.
* [x] UX states identificados.
* [x] API definida.
* [x] Tests definidos.
* [ ] PO/BA validó.

---

## 🏁 Definition of Done

* [ ] Endpoint + UI funcionales.
* [ ] HITL enforced.
* [ ] AIRecommendation persistido con trazabilidad.
* [ ] Fallback Mock operativo en demo.
* [ ] Tests deterministas en CI.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar máximo de regeneraciones por evento.
* Considerar caching de prompts en demo para latencia consistente.

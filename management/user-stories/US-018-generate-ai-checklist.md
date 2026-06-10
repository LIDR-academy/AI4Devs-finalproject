# 🧾 User Story: Generar checklist IA con fechas relativas

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-018                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | AI-002 Checklist IA                  |
| Module / Domain    | AI / Tasks                           |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador con evento creado
**I want** generar un checklist IA con tareas y fechas relativas (T-180, T-90, T-30, T-7, T-1)
**So that** tenga una lista de acciones pre-evento priorizadas en el tiempo

---

## 🧠 Business Context

### Context Summary

AI-002 produce un set de tareas con `due_relative_days` que se convierten a fechas absolutas en función de `event_date`. Las tareas se persisten con `ai_generated=true` y `status=pending` hasta que el organizador confirme.

### Related Domain Concepts

* AIRecommendation (type='checklist').
* EventTask (ai_generated=true).
* Fechas relativas (T-180/T-90/T-30/T-7/T-1).

### Assumptions

* Política T-x cubierta por backend al convertir.
* La regeneración crea nuevo `AIRecommendation` sin borrar tareas previas confirmadas.

### Dependencies

* US-017 (plan generado o evento listo).
* EPIC-TASK-001 (gestión de tareas).
* EPIC-AI-001.

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-AI-003, FR-AI-004, FR-AI-009           |
| Use Case(s)            | UC-AI-002                                |
| Business Rule(s)       | BR-AI-001..005, BR-TASK-005              |
| Permission Rule(s)     | Ownership                                |
| Data Entity / Entities | EventTask, AIRecommendation              |
| API Endpoint(s)        | POST /api/v1/events/:id/ai/checklist     |
| NFR Reference(s)       | NFR-AI-001, NFR-AI-002                   |
| Related ADR(s)         | ADR-AI-001                               |
| Related Document(s)    | /docs/7, /docs/17                        |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Asignación de tareas a múltiples usuarios.
* Subtareas anidadas IA.
* Recordatorios push.

### Scope Notes

* Las tareas sugeridas son pending; el usuario debe confirmar para activarlas.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Generación con fechas relativas

**Given** evento `active` con `event_date` y `event_type`
**When** "Generar checklist IA"
**Then** backend invoca LLM, valida JSON, convierte T-x a fechas absolutas, persiste `EventTask(ai_generated=true, status=pending)` y `AIRecommendation`.

### AC-02: Confirmación en bloque

**Given** checklist generado
**When** el organizador confirma N tareas
**Then** estas pasan a `status=in_progress` (o `pending` activo) y son visibles en el dashboard.

---

## ⚠️ Edge Cases

### EC-01: Fecha del evento muy próxima

**Given** evento en 3 días
**When** se solicita checklist
**Then** se omiten tareas con T > días disponibles; backend trunca.

#### Handling

* Filtrado en backend.

---

### EC-02: Timeout / fallback

**Given** LLM no responde en 60s
**When** se detecta
**Then** fallback en demo, error en prod.

#### Handling

* Misma política que US-017.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior          |
| ----- | ------------------------------------------------- | --------------------------- |
| VR-01 | Evento existe y propio                            | 403/404                     |
| VR-02 | `event_date` definida                              | 400                         |
| VR-03 | Cada tarea generada con `due_relative_days >= 0`   | Filtrar inválidas           |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Rate limit AI.                                                      |
| SEC-03 | Persistir AIRecommendation con trazabilidad.                         |
| SEC-04 | Backend-only LLM.                                                    |

### Negative Authorization Scenarios

* Evento ajeno → 403/404.
* Vendor → 403.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: AI-002
* Provider Layer: LLMProvider
* Human Validation Required: Yes
* Persist AIRecommendation: Yes
* Fallback Required: Yes

### AI Input

* `event.event_type_code`
* `event.event_date`
* `event.guest_count`
* `event.language`

### AI Output

* JSON: `tasks: [{ title, description, category, due_relative_days, priority }]`
* Validado Zod.

### Human-in-the-loop Rules

* Tareas IA persistidas `ai_generated=true`, `status=pending`.
* El usuario confirma individual o en bloque para activarlas.
* Edición o eliminación posibles.

### AI Error / Fallback Behavior

* Timeout 60s → error o fallback.
* JSON inválido → 1 reintento.
* Provider error → fallback Mock en demo.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | `/[locale]/organizer/events/:id/tasks`                 |
| Main UI Pattern     | Lista con grupos por fase + acciones bulk              |
| Primary Action      | "Confirmar tareas seleccionadas"                       |
| Secondary Actions   | "Regenerar", "Descartar"                               |
| Empty State         | CTA "Generar checklist IA"                             |
| Loading State       | Skeleton + progress                                    |
| Error State         | Banner                                                 |
| Success State       | Lista lista para confirmar                             |
| Accessibility Notes | Grupos con headings                                    |
| Responsive Notes    | Mobile-first                                           |
| i18n Notes          | Output IA en idioma del evento                          |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/tasks`
* Components:

  * `AIChecklistGenerator`, `BulkConfirmBar`
* State Management:

  * TanStack `useGenerateAIChecklist`, `useConfirmTasksBulk`
* Forms:

  * Selección multi-check
* API Client:

  * `aiApi.generateChecklist`, `tasksApi.confirmBulk`

### Backend

* Use Case / Service:

  * `GenerateChecklistUseCase`, `ConfirmAITasksBulkUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/ai/checklist`
  * `POST /api/v1/events/:id/tasks/confirm-bulk`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `event_tasks`, `ai_recommendations`
* Constraints:

  * `ai_generated` boolean
* Index Considerations:

  * Índice por (`event_id`, `status`, `due_date`)

### API

| Method | Endpoint                                            | Purpose                  |
| ------ | --------------------------------------------------- | ------------------------ |
| POST   | `/api/v1/events/:id/ai/checklist`                   | Generar checklist IA     |
| POST   | `/api/v1/events/:id/tasks/confirm-bulk`             | Confirmar tareas IA      |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: Yes

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                  | Type        |
| ----- | ----------------------------------------- | ----------- |
| TS-01 | Generación con MockAIProvider             | Integration |
| TS-02 | Conversión T-x a absolutas                | Unit        |
| TS-03 | Confirmación bulk                         | Integration |
| TS-04 | E2E generar y confirmar                   | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Evento ajeno                          | 403/404                  |
| NT-02 | Vendor                                | 403                      |
| NT-03 | Fecha del evento ausente              | 400                      |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Mock devuelve checklist válido          | Tasks persisted           |
| AI-TS-02 | Timeout                                 | Error / fallback          |
| AI-TS-03 | JSON inválido                           | 1 retry                   |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Grupos accesibles con headings.
* Selección por teclado.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Time to Plan, completitud de checklist               |
| Expected Impact     | Reduce esfuerzo manual y omisiones                   |
| Success Criteria    | ≥ 60% tareas IA confirmadas                          |
| Academic Demo Value | Demuestra HITL y persistencia con `ai_generated`     |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Pantalla checklist con bulk confirm.
* Skeleton + estados.

### Potential Backend Tasks

* Use cases generar y confirmar bulk.
* Conversión T-x.

### Potential Database Tasks

* Índices por `event_id`/`status`/`due_date`.

### Potential AI / PromptOps Tasks

* Prompt "ChecklistPrompt v1".
* Mock responses.

### Potential QA Tasks

* Tests positivos/negativos + AI.

### Potential DevOps / Config Tasks

* Not applicable for this story.

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

* [ ] Endpoint + UI operativos.
* [ ] Persistencia ai_generated + AIRecommendation.
* [ ] Tests deterministas.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar límite de tareas por generación (sugerido 20).

# 🧾 User Story: Ver mis 3 tareas más urgentes priorizadas por IA

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-024                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | AI-008 Priorización IA de tareas      |
| Module / Domain    | AI / Tasks                           |
| User Role          | Organizer                            |
| Priority           | Should Have                          |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador con un checklist activo
**I want** ver las 3 tareas más urgentes priorizadas por IA en mi dashboard
**So that** sepa exactamente en qué enfocarme ahora mismo

---

## 🧠 Business Context

### Context Summary

AI-008 ordena tareas pendientes por urgencia considerando `due_date`, `priority`, dependencia y faltantes (e.g., booking sin confirmar). Devuelve top 3 con razón corta.

### Related Domain Concepts

* EventTask urgentes.
* AIRecommendation (type='task_priority').

### Assumptions

* Sólo se priorizan tareas `pending`/`in_progress`.

### Dependencies

* EPIC-TASK-001.
* EPIC-AI-001.

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-AI-011, FR-TASK-007                    |
| Use Case(s)            | UC-AI-008                                |
| Business Rule(s)       | BR-AI-001..005, BR-TASK-007              |
| Permission Rule(s)     | Ownership                                |
| Data Entity / Entities | EventTask, AIRecommendation              |
| API Endpoint(s)        | POST /api/v1/events/:id/ai/task-priority |
| NFR Reference(s)       | NFR-AI-001                               |
| Related ADR(s)         | ADR-AI-001                               |
| Related Document(s)    | /docs/7                                  |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Should Have

### Explicitly Out of Scope

* Reordenamiento automático del checklist.
* Notificaciones push de urgencia.

### Scope Notes

* Sólo informativo; el usuario reordena manualmente si lo desea.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Top 3 priorizadas

**Given** tareas activas
**When** se solicita IA
**Then** se devuelve `[{ task_id, reason, urgency_score }]` de máximo 3.

### AC-02: Estado vacío

**Given** sin tareas pendientes
**When** se solicita
**Then** estado vacío con sugerencia "Generar checklist IA".

---

## ⚠️ Edge Cases

### EC-01: Pocas tareas

**Given** sólo 1 tarea
**When** se solicita
**Then** se devuelve sólo esa.

#### Handling

* Sin requerir 3 exactas.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior          |
| ----- | ------------------------------------------------- | --------------------------- |
| VR-01 | Evento propio                                     | 403/404                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Rate limit AI.                                                      |
| SEC-03 | Backend-only.                                                        |

### Negative Authorization Scenarios

* Ajeno → 403/404. Vendor → 403.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: AI-008
* Provider Layer: LLMProvider
* Human Validation Required: Yes (informativo)
* Persist AIRecommendation: Yes
* Fallback Required: Yes

### AI Input

* Lista de tareas activas con metadata.

### AI Output

* JSON: `top: [{ task_id, reason, urgency_score }]`

### Human-in-the-loop Rules

* No reordena tareas oficiales sin acción del usuario.

### AI Error / Fallback Behavior

* Mismas políticas.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | Dashboard del evento + tarjeta "Prioridades IA"        |
| Main UI Pattern     | Top 3 con razones                                       |
| Primary Action      | "Marcar como hecho"                                     |
| Secondary Actions   | "Regenerar"                                             |
| Empty State         | Sugerencia generar checklist                            |
| Loading State       | Skeleton                                                |
| Error State         | Banner                                                  |
| Success State       | Top 3 visibles                                          |
| Accessibility Notes | Lista accesible                                         |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | Idioma del evento                                       |
| Currency Notes      | No aplica                                               |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Dashboard
* Components:

  * `AITaskPriorityCard`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `aiApi.taskPriority(eventId)`

### Backend

* Use Case / Service:

  * `PrioritizeTasksUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/ai/task-priority`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `ai_recommendations`, `event_tasks`
* Constraints:

  * Tareas propias
* Index Considerations:

  * Por `event_id`, `status`

### API

| Method | Endpoint                                            | Purpose             |
| ------ | --------------------------------------------------- | ------------------- |
| POST   | `/api/v1/events/:id/ai/task-priority`               | Top 3 urgentes IA    |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: Yes

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                              | Type        |
| ----- | ------------------------------------- | ----------- |
| TS-01 | Top 3 desde 10 tareas                 | Integration |
| TS-02 | Estado vacío sin tareas               | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Ajeno                                 | 403/404                  |
| NT-02 | Vendor                                | 403                      |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Mock devuelve top 3                      | Tarjeta visible           |
| AI-TS-02 | Timeout                                  | Error / fallback         |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Tarjeta accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tasa de progreso de tareas                            |
| Expected Impact     | Guía clara para el siguiente paso                     |
| Success Criteria    | ≥ 30% tareas IA top 3 completadas                     |
| Academic Demo Value | IA informativa y focal                                |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Tarjeta Top 3.
* Acción "marcar hecho".

### Potential Backend Tasks

* Use case + prompt.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Prompt "TaskPriorityPrompt v1".

### Potential QA Tasks

* Tests + AI.

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

* [ ] Endpoint + tarjeta funcionales.
* [ ] HITL enforced.
* [ ] Tests deterministas.
* [ ] PO valida.

---

## 📝 Notes

* Considerar caching (5 min) para reducir llamadas redundantes.

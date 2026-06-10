# 🧾 User Story: Crear tarea manual

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-028                               |
| Epic               | EPIC-TASK-001                        |
| Feature            | Creación manual de tarea             |
| Module / Domain    | Tasks                                |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador
**I want** crear una tarea manual con título, descripción, fecha y categoría opcional
**So that** complemente las sugerencias IA con mis propias acciones específicas

---

## 🧠 Business Context

### Context Summary

Permite añadir tareas no cubiertas por la IA. Estado inicial `pending`, `ai_generated=false`. Fecha relativa o absoluta.

### Related Domain Concepts

* EventTask manual.

### Assumptions

* Categoría es opcional y debe existir si se especifica.

### Dependencies

* US-009.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-TASK-002                         |
| Use Case(s)            | UC-TASK-002                        |
| Business Rule(s)       | BR-TASK-002                        |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | EventTask                          |
| API Endpoint(s)        | POST /api/v1/events/:id/tasks       |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Tareas asignables a otros usuarios.
* Recordatorios externos.

### Scope Notes

* Sin recurrencia ni subtareas.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Crear tarea

**Given** organizador
**When** envía form válido
**Then** se crea `EventTask(status=pending, ai_generated=false)` y aparece en el listado.

### AC-02: Categoría opcional

**Given** sin categoría
**When** se crea
**Then** OK; categoría null.

---

## ⚠️ Edge Cases

### EC-01: Fecha en el pasado

**Given** due_date < hoy
**When** se envía
**Then** 400.

#### Handling

* Validación.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Título 2-200 chars              | "Título requerido"          |
| VR-02 | due_date futura o nullable      | "Fecha inválida"            |
| VR-03 | category_id existente si se da  | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership policy.                                                   |

### Negative Authorization Scenarios

* Ajeno → 403/404. Vendor → 403.

---

## 🤖 AI Behavior

This story does not invoke AI directly.

### AI Involvement

* AI Feature: None
* Provider Layer: Not applicable
* Human Validation Required: Not applicable
* Persist AIRecommendation: No
* Fallback Required: Not applicable

### AI Input

* Not applicable for this story.

### AI Output

* Not applicable for this story.

### Human-in-the-loop Rules

* Not applicable for this story.

### AI Error / Fallback Behavior

* Not applicable for this story.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | `/[locale]/organizer/events/:id/tasks/new`             |
| Main UI Pattern     | Form modal o inline                                     |
| Primary Action      | "Crear tarea"                                          |
| Secondary Actions   | Cancelar                                                |
| Empty State         | No aplica                                              |
| Loading State       | Spinner                                                 |
| Error State         | Mensaje inline                                          |
| Success State       | Toast + actualización lista                             |
| Accessibility Notes | Labels                                                  |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/tasks/new`
* Components:

  * `CreateTaskDialog`
* State Management:

  * TanStack mutation
* Forms:

  * RHF + Zod
* API Client:

  * `tasksApi.create(eventId, payload)`

### Backend

* Use Case / Service:

  * `CreateTaskUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/tasks`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `event_tasks`
* Constraints:

  * FK event_id
* Index Considerations:

  * Por (`event_id`, `status`)

### API

| Method | Endpoint                              | Purpose       |
| ------ | ------------------------------------- | ------------- |
| POST   | `/api/v1/events/:id/tasks`            | Crear tarea   |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`task.created`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Crear tarea válida                | Integration |
| TS-02 | E2E desde lista                    | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Fecha pasada                          | 400                      |
| NT-02 | Ajeno                                 | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 201             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Form accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Engagement, completitud                              |
| Expected Impact     | Permite control fino                                 |
| Success Criteria    | Tasa de creación exitosa > 99%                       |
| Academic Demo Value | Complementa IA con manualidad                         |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Form + mutation.

### Potential Backend Tasks

* Use case + endpoint.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests.

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

* [ ] Funcional.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Considerar prefill de categoría desde IA-004.

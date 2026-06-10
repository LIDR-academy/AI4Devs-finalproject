# 🧾 User Story: Editar o eliminar mi tarea

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-029                               |
| Epic               | EPIC-TASK-001                        |
| Feature            | Edición y soft delete de tarea       |
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
**I want** editar o eliminar tareas de mi checklist
**So that** mantenga mi planificación actualizada y limpia

---

## 🧠 Business Context

### Context Summary

Permite ajustar tareas (sean IA o manuales). El delete es soft (`deleted_at`).

### Related Domain Concepts

* EventTask edition.

### Assumptions

* Edit no cambia `ai_generated`.

### Dependencies

* US-027, US-028.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-TASK-003, FR-TASK-004            |
| Use Case(s)            | UC-TASK-003                        |
| Business Rule(s)       | BR-TASK-003                        |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | EventTask                          |
| API Endpoint(s)        | PATCH/DELETE /api/v1/tasks/:id      |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Restauración self-service.

### Scope Notes

* Soft delete.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Editar título/fecha/categoría

**Given** tarea propia
**When** PATCH válido
**Then** se actualiza.

### AC-02: Eliminar tarea

**Given** tarea propia
**When** DELETE
**Then** soft delete (deleted_at).

---

## ⚠️ Edge Cases

### EC-01: Tarea en evento completed

**Given** evento `completed`
**When** intenta editar/eliminar
**Then** 409.

#### Handling

* Read-only.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Estado válido del evento        | 409                         |
| VR-02 | Título 2-200 chars              | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |

### Negative Authorization Scenarios

* Ajeno → 403/404.

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
| Screen / Route      | `/[locale]/organizer/events/:id/tasks`                 |
| Main UI Pattern     | Inline edit + botón eliminar                            |
| Primary Action      | "Guardar"                                              |
| Secondary Actions   | Eliminar, Cancelar                                      |
| Empty State         | No aplica                                              |
| Loading State       | Spinner                                                 |
| Error State         | Toast                                                   |
| Success State       | Toast                                                   |
| Accessibility Notes | Botones accesibles                                      |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Lista tareas
* Components:

  * `TaskItem` con edit/delete
* State Management:

  * TanStack
* Forms:

  * RHF
* API Client:

  * `tasksApi.update/remove`

### Backend

* Use Case / Service:

  * `UpdateTaskUseCase`, `SoftDeleteTaskUseCase`
* Controller / Route:

  * `PATCH /api/v1/tasks/:id`, `DELETE /api/v1/tasks/:id`
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

  * `deleted_at`
* Index Considerations:

  * Parcial por `deleted_at IS NULL`

### API

| Method | Endpoint                | Purpose          |
| ------ | ----------------------- | ---------------- |
| PATCH  | `/api/v1/tasks/:id`     | Editar tarea     |
| DELETE | `/api/v1/tasks/:id`     | Soft delete      |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Editar tarea válida               | Integration |
| TS-02 | Soft delete                        | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Ajeno                                 | 403/404                  |
| NT-02 | Evento completed                      | 409                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200/204         |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Botones accesibles.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Limpieza de checklist                                |
| Expected Impact     | Mantener tareas vigentes                              |
| Success Criteria    | < 1% errores                                         |
| Academic Demo Value | CRUD básico de tareas                                 |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Inline edit + delete.

### Potential Backend Tasks

* Use cases.

### Potential Database Tasks

* `deleted_at`.

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

* Considerar undo en el toast.

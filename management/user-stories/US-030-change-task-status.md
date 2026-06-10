# 🧾 User Story: Cambiar el estado de mi tarea

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-030                               |
| Epic               | EPIC-TASK-001                        |
| Feature            | Cambio de estado de tarea            |
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
**I want** cambiar el estado de mis tareas (pending → in_progress → done | skipped)
**So that** mi progreso se mantenga actualizado y visible

---

## 🧠 Business Context

### Context Summary

Las tareas avanzan en un lifecycle definido. Cambiar estado actualiza el progreso del evento.

### Related Domain Concepts

* EventTask.status enum.

### Assumptions

* Transiciones válidas validadas en backend.

### Dependencies

* US-027.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-TASK-005                         |
| Use Case(s)            | UC-TASK-004                        |
| Business Rule(s)       | BR-TASK-004                        |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | EventTask                          |
| API Endpoint(s)        | PATCH /api/v1/tasks/:id/status      |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Estados personalizados.

### Scope Notes

* Sin workflow configurable.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Transiciones válidas

**Given** tarea `pending`
**When** PATCH `status=in_progress`
**Then** se actualiza y se refleja progreso.

### AC-02: Marcar done

**Given** tarea `in_progress`
**When** PATCH `status=done`
**Then** progreso del evento aumenta.

---

## ⚠️ Edge Cases

### EC-01: Transición inválida

**Given** tarea `done`
**When** intenta volver a `pending`
**Then** 409.

#### Handling

* State machine estricta.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Estado destino válido           | 400                         |
| VR-02 | Transición permitida            | 409                         |

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
| Screen / Route      | Lista tareas                                            |
| Main UI Pattern     | Checkbox / dropdown estado                              |
| Primary Action      | "Marcar como hecho"                                    |
| Secondary Actions   | Skip                                                    |
| Empty State         | No aplica                                              |
| Loading State       | Spinner inline                                          |
| Error State         | Toast                                                   |
| Success State       | Animación de check                                      |
| Accessibility Notes | aria-checked                                            |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Lista tareas
* Components:

  * `TaskStatusToggle`
* State Management:

  * TanStack optimistic update
* Forms:

  * No aplica
* API Client:

  * `tasksApi.changeStatus`

### Backend

* Use Case / Service:

  * `ChangeTaskStatusUseCase`
* Controller / Route:

  * `PATCH /api/v1/tasks/:id/status`
* Authorization Policy:

  * Ownership + state machine
* Validation:

  * Enum
* Transaction Required:

  * No

### Database

* Main Tables:

  * `event_tasks`
* Constraints:

  * Estado válido
* Index Considerations:

  * Por `status`

### API

| Method | Endpoint                            | Purpose       |
| ------ | ----------------------------------- | ------------- |
| PATCH  | `/api/v1/tasks/:id/status`          | Cambiar estado |

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
| TS-01 | Transiciones válidas              | Unit/Integration |
| TS-02 | Optimistic update                  | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Transición inválida                   | 409                      |
| NT-02 | Ajeno                                 | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* aria-checked.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Progreso, satisfacción                               |
| Expected Impact     | Sensación de avance                                  |
| Success Criteria    | < 100ms percibido                                    |
| Academic Demo Value | Demo de progreso en vivo                              |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Toggle + optimistic update.

### Potential Backend Tasks

* State machine.

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

* Optimistic update con rollback en error.

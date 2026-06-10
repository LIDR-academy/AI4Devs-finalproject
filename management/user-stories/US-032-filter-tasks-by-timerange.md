# 🧾 User Story: Filtrar tareas por próximos 7/30 días

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-032                               |
| Epic               | EPIC-TASK-001                        |
| Feature            | Filtros temporales                   |
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
**I want** filtrar mi checklist por próximos 7 o 30 días
**So that** me enfoque en lo urgente sin distraerme con tareas lejanas

---

## 🧠 Business Context

### Context Summary

Filtros temporales habituales: hoy / próximos 7 / próximos 30. Útiles para definir foco.

### Related Domain Concepts

* Filtros server-side por `due_date`.

### Assumptions

* Fecha de referencia es `today` con zona del cliente.

### Dependencies

* US-027.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-TASK-009                         |
| Use Case(s)            | UC-TASK-006                        |
| Business Rule(s)       | BR-TASK-006                        |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | EventTask                          |
| API Endpoint(s)        | GET /api/v1/events/:id/tasks?within=7|30 |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Rangos custom.

### Scope Notes

* Sólo dos rangos predefinidos.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Filtrar próximos 7 días

**Given** tareas mixtas
**When** aplica filtro 7d
**Then** sólo se muestran tareas con `due_date <= today+7`.

### AC-02: Filtrar próximos 30 días

**Given** tareas mixtas
**When** aplica 30d
**Then** muestra tareas con `due_date <= today+30`.

---

## ⚠️ Edge Cases

### EC-01: Tareas vencidas

**Given** filtro 7d
**When** existen tareas vencidas (due_date < today)
**Then** se incluyen con badge "vencido".

#### Handling

* Highlight visual.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | `within ∈ {7, 30}`              | Ignorar inválido            |

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
| Main UI Pattern     | Toggle/segmented control                                |
| Primary Action      | Filtrar                                                 |
| Secondary Actions   | Limpiar                                                 |
| Empty State         | "No hay tareas en el rango"                            |
| Loading State       | Skeleton                                                |
| Error State         | Toast                                                   |
| Success State       | Lista filtrada                                          |
| Accessibility Notes | aria-pressed                                            |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Lista tareas
* Components:

  * `TaskRangeFilter`
* State Management:

  * TanStack
* Forms:

  * Query params
* API Client:

  * `tasksApi.list(eventId, { within: 7|30 })`

### Backend

* Use Case / Service:

  * `ListTasksUseCase`
* Controller / Route:

  * `GET /api/v1/events/:id/tasks`
* Authorization Policy:

  * Ownership
* Validation:

  * Query params
* Transaction Required:

  * No

### Database

* Main Tables:

  * `event_tasks`
* Constraints:

  * Por `event_id`
* Index Considerations:

  * Por `due_date`

### API

| Method | Endpoint                                  | Purpose                  |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/v1/events/:id/tasks?within=7`       | Próximos 7 días          |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: No
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Filtro 7d funciona                 | Integration |
| TS-02 | Filtro 30d funciona                | Integration |
| TS-03 | E2E                                | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | within inválido                       | Ignorar                  |
| NT-02 | Ajeno                                 | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Toggle accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Foco semanal                                         |
| Expected Impact     | Reduce ruido                                         |
| Success Criteria    | Carga < 600ms                                        |
| Academic Demo Value | UX simple efectiva                                    |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Toggle filtro.

### Potential Backend Tasks

* Soporte query param.

### Potential Database Tasks

* Índice due_date.

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

* Considerar agregar "Vencidas" como filtro adicional.

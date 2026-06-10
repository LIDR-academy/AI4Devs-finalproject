# 🧾 User Story: Ver progreso (% done) en el dashboard

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-033                               |
| Epic               | EPIC-TASK-001                        |
| Feature            | Indicador de progreso                |
| Module / Domain    | Tasks / Dashboard                    |
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
**I want** ver un porcentaje de progreso de mi checklist en el dashboard
**So that** tenga un indicador rápido de mi avance global

---

## 🧠 Business Context

### Context Summary

Progreso = % de tareas `done` sobre tareas activas no descartadas. Se recalcula en cada cambio.

### Related Domain Concepts

* Agregación dinámica.

### Assumptions

* Skip cuenta como completada para % o se excluye (definir: excluye).

### Dependencies

* US-030.
* US-014.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-TASK-010                         |
| Use Case(s)            | UC-TASK-005                        |
| Business Rule(s)       | BR-TASK-007                        |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | EventTask                          |
| API Endpoint(s)        | GET /api/v1/events/:id/tasks/progress |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Gráficos avanzados.

### Scope Notes

* Sólo % global.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: % de progreso

**Given** N tareas con M done
**When** se consulta progreso
**Then** se devuelve `progress = M/N * 100` redondeado.

### AC-02: Actualización en vivo

**Given** un cambio de estado
**When** se invalida cache TanStack
**Then** dashboard refleja nuevo %.

---

## ⚠️ Edge Cases

### EC-01: Sin tareas

**Given** N=0
**When** se consulta
**Then** progreso = 0% sin error.

#### Handling

* Default safe.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | eventId propio                  | 403/404                     |

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
| Screen / Route      | Dashboard del evento                                    |
| Main UI Pattern     | Barra de progreso                                       |
| Primary Action      | No aplica                                              |
| Secondary Actions   | "Ir al checklist"                                      |
| Empty State         | 0% con CTA                                              |
| Loading State       | Skeleton                                                |
| Error State         | Banner                                                  |
| Success State       | %                                                       |
| Accessibility Notes | aria-valuenow                                           |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Dashboard
* Components:

  * `ProgressBar`
* State Management:

  * TanStack `useTaskProgress`
* Forms:

  * No aplica
* API Client:

  * `tasksApi.progress`

### Backend

* Use Case / Service:

  * `GetTaskProgressUseCase`
* Controller / Route:

  * `GET /api/v1/events/:id/tasks/progress`
* Authorization Policy:

  * Ownership
* Validation:

  * UUID
* Transaction Required:

  * No

### Database

* Main Tables:

  * `event_tasks`
* Constraints:

  * Por `event_id`
* Index Considerations:

  * Por (`event_id`, `status`)

### API

| Method | Endpoint                                  | Purpose                  |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/v1/events/:id/tasks/progress`       | Calcular progreso        |

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
| TS-01 | Cálculo correcto                  | Unit        |
| TS-02 | Actualización tras cambio status   | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Sin tareas                            | 0%                       |
| NT-02 | Ajeno                                 | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* ARIA progressbar.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Sensación de avance                                  |
| Expected Impact     | Engagement                                           |
| Success Criteria    | Recalculo < 100ms                                    |
| Academic Demo Value | Indicador visible en demo                             |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* ProgressBar.

### Potential Backend Tasks

* Endpoint de cálculo.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests unitarios de cálculo.

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

* Confirmar política con tareas `skipped`.

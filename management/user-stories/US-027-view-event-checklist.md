# 🧾 User Story: Ver mi checklist del evento

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-027                               |
| Epic               | EPIC-TASK-001 — Checklist & Task Management |
| Feature            | Visualización del checklist          |
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

**As an** organizador autenticado
**I want** ver el checklist consolidado de mi evento con estados, fechas y categorías
**So that** sepa qué tareas tengo pendientes y cuáles ya completé

---

## 🧠 Business Context

### Context Summary

El checklist es la lista accionable que combina tareas manuales y generadas por IA. Es el centro de la planificación operativa diaria del organizador.

### Related Domain Concepts

* EventTask con `status` y `due_date`.
* Categorías opcionales.
* Indicador `ai_generated`.

### Assumptions

* Las tareas pertenecen al evento del usuario.

### Dependencies

* EPIC-EVT-001.
* EPIC-AIP-001 (AI-002 opcional).

---

## 🔗 Traceability

| Source                 | Reference                              |
| ---------------------- | -------------------------------------- |
| FRD Requirement(s)     | FR-TASK-001, FR-TASK-008                |
| Use Case(s)            | UC-TASK-001                            |
| Business Rule(s)       | BR-TASK-001, BR-TASK-008                |
| Permission Rule(s)     | Ownership                              |
| Data Entity / Entities | EventTask                              |
| API Endpoint(s)        | GET /api/v1/events/:id/tasks            |
| NFR Reference(s)       | NFR-PERF-API-001                       |
| Related ADR(s)         | —                                      |
| Related Document(s)    | /docs/8                                |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Asignación a múltiples usuarios.
* Subtareas anidadas.

### Scope Notes

* No introduce recordatorios push.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Listado de tareas

**Given** organizador con tareas en su evento
**When** abre el checklist
**Then** ve listado paginable con `title`, `due_date`, `status`, `category`, `ai_generated` badge.

### AC-02: Vista vacía

**Given** sin tareas
**When** abre
**Then** ve CTAs "Crear tarea" y "Generar checklist IA".

---

## ⚠️ Edge Cases

### EC-01: Evento completado

**Given** evento `completed`
**When** abre checklist
**Then** modo read-only.

#### Handling

* UI bloquea acciones de edición.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | `eventId` válido y propio       | 403/404                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership policy.                                                   |
| SEC-02 | Vendor no accede.                                                   |

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
| Screen / Route      | `/[locale]/organizer/events/:id/tasks`                 |
| Main UI Pattern     | Lista con filtros y badges                              |
| Primary Action      | "Crear tarea"                                          |
| Secondary Actions   | "Filtrar", "Confirmar IA en bloque"                     |
| Empty State         | CTAs                                                    |
| Loading State       | Skeleton                                                |
| Error State         | Banner                                                  |
| Success State       | Lista visible                                           |
| Accessibility Notes | Lista accesible                                         |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/tasks`
* Components:

  * `TaskList`, `TaskItem`, `TaskFilters`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `tasksApi.list(eventId, filters)`

### Backend

* Use Case / Service:

  * `ListEventTasksUseCase`
* Controller / Route:

  * `GET /api/v1/events/:id/tasks`
* Authorization Policy:

  * Ownership
* Validation:

  * Query params Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `event_tasks`
* Constraints:

  * Pertenecientes al event
* Index Considerations:

  * (`event_id`, `status`, `due_date`)

### API

| Method | Endpoint                              | Purpose       |
| ------ | ------------------------------------- | ------------- |
| GET    | `/api/v1/events/:id/tasks`            | Listar tareas |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: No
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                              | Type        |
| ----- | ------------------------------------- | ----------- |
| TS-01 | Listado básico                         | API         |
| TS-02 | Vista vacía con CTA                    | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Ajeno                                 | 403/404                  |
| NT-02 | Vendor                                | 403                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Lista accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Engagement                                           |
| Expected Impact     | Vista operativa diaria                                |
| Success Criteria    | < 800ms de carga                                     |
| Academic Demo Value | Vista central del rol Organizer                       |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Lista + filtros.

### Potential Backend Tasks

* Endpoint + queries.

### Potential Database Tasks

* Índice compuesto.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests + E2E.

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

* [ ] Lista operativa.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar paginación (10 default).

# 🧾 User Story: Ver el dashboard de progreso de mi evento

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-014                               |
| Epic               | EPIC-EVT-001 — Organizer Event Management |
| Feature            | Dashboard del evento                 |
| Module / Domain    | Events                               |
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
**I want** ver un dashboard de mi evento con progreso, próximas tareas, presupuesto y cotizaciones activas
**So that** pueda monitorear el avance y decidir qué acción tomar a continuación

---

## 🧠 Business Context

### Context Summary

El dashboard agrega la información del evento (tareas, presupuesto, quotes, booking intents, reseñas) en una vista única. Es el "cockpit" del organizador y la pantalla más usada durante la planificación.

### Related Domain Concepts

* Event aggregator.
* Progreso de checklist (% done).
* Presupuesto comprometido.
* Quotes activas.

### Assumptions

* Las queries se agregan vía un único endpoint o vía múltiples queries TanStack.
* El dashboard se carga en < 1.5s.

### Dependencies

* US-009 (creación).
* EPIC-TASK-001, EPIC-BUD-001, EPIC-QR-001.

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-EVENT-013, FR-DASHBOARD-001            |
| Use Case(s)            | UC-EVENT-006                             |
| Business Rule(s)       | BR-EVENT-014                             |
| Permission Rule(s)     | Ownership                                |
| Data Entity / Entities | Event, EventTask, Budget, BudgetItem, QuoteRequest, Quote, BookingIntent |
| API Endpoint(s)        | GET /api/v1/events/:id                   |
| NFR Reference(s)       | NFR-PERF-API-001, NFR-PERF-UX-001         |
| Related ADR(s)         | ADR-FE-00n                               |
| Related Document(s)    | /docs/8, /docs/15                        |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Widgets configurables por usuario.
* Exportación a PDF.
* Gráficos interactivos avanzados.

### Scope Notes

* Vista simple, métricas esenciales.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Carga del dashboard

**Given** organizador con evento `active`
**When** entra al dashboard del evento
**Then** ve resumen, % progreso tareas, presupuesto planeado/comprometido, lista de Quotes activas y próximas tareas (7 días).

### AC-02: Estados visuales

**Given** evento `draft` sin plan IA generado
**When** carga el dashboard
**Then** ve CTAs para "Generar plan IA" y "Crear primera tarea".

---

## ⚠️ Edge Cases

### EC-01: Evento cancelado

**Given** evento `cancelled`
**When** abre el dashboard
**Then** ve banner informativo y modo read-only.

#### Handling

* Disable de acciones.

---

### EC-02: Datos lentos

**Given** una de las secciones tarda > 800ms
**When** carga
**Then** se muestran skeletons por sección sin bloquear el resto.

#### Handling

* Queries independientes con loading individual.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | `eventId` válido y propio       | 403/404 si no               |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership policy.                                                   |
| SEC-02 | Admin sólo en `view_event` separado (US-016).                       |

### Negative Authorization Scenarios

* Otro organizador → 403/404.
* Vendor → 403.

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
| Screen / Route      | `/[locale]/organizer/events/:id`                       |
| Main UI Pattern     | Dashboard con tarjetas (Resumen, Tareas, Presupuesto, Quotes, Reseñas) |
| Primary Action      | "Generar plan IA"                                      |
| Secondary Actions   | "Ver tareas", "Ver presupuesto", "Solicitar cotización" |
| Empty State         | CTAs específicos para evento sin plan/tareas/presupuesto |
| Loading State       | Skeletons por sección                                  |
| Error State         | Banner con retry                                       |
| Success State       | Dashboard completo                                     |
| Accessibility Notes | Estructura semántica (headings)                        |
| Responsive Notes    | Mobile-first; tarjetas en stack                        |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | Moneda del evento                                      |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id`
* Components:

  * `EventDashboard`, `ProgressCard`, `BudgetCard`, `UpcomingTasksCard`, `ActiveQuotesCard`
* State Management:

  * TanStack queries paralelas
* Forms:

  * No aplica
* API Client:

  * `eventsApi.detail(id)`, `tasksApi.upcoming(eventId)`, `budgetApi.summary(eventId)`, `quotesApi.activeForEvent(eventId)`

### Backend

* Use Case / Service:

  * `GetEventDashboardUseCase` (puede agregar o dejar al frontend componer)
* Controller / Route:

  * `GET /api/v1/events/:id`
* Authorization Policy:

  * Ownership
* Validation:

  * `eventId` UUID
* Transaction Required:

  * No

### Database

* Main Tables:

  * `events`, `event_tasks`, `budget`, `budget_items`, `quote_requests`, `quotes`, `booking_intents`
* Constraints:

  * Ownership
* Index Considerations:

  * Índices por event_id en cada tabla

### API

| Method | Endpoint                          | Purpose                  |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/v1/events/:id`              | Detalle agregado evento  |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: No (sólo errores)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                              | Type        |
| ----- | ------------------------------------- | ----------- |
| TS-01 | Dashboard carga datos agregados        | Integration |
| TS-02 | Estado vacío con CTAs                  | E2E         |
| TS-03 | Skeletons mientras cargan secciones    | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Evento ajeno                          | 403/404                  |
| NT-02 | Vendor                                | 403                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result |
| ---------- | --------------------------------- | --------------- |
| AUTH-TS-01 | Dueño                             | 200             |
| AUTH-TS-02 | Otro                              | 403/404         |

### Accessibility Tests

* Estructura semántica.
* Navegación por teclado entre tarjetas.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Engagement, tiempo en producto, conversiones internas |
| Expected Impact     | Cockpit central del organizador                       |
| Success Criteria    | Tiempo de carga < 1.5s                                |
| Academic Demo Value | Vista principal usada durante la demo                |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Layout con tarjetas.
* Queries TanStack.
* Skeletons.

### Potential Backend Tasks

* Endpoint detalle o sub-endpoints.
* Optimizar queries.

### Potential Database Tasks

* Índices.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests positivos/negativos + E2E.

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

* [ ] Dashboard operativo.
* [ ] Datos agregados correctos.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Considerar separar en sub-endpoints para optimizar carga.

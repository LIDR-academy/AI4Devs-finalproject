# 🧾 User Story: Listar y filtrar mis eventos

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-013                               |
| Epic               | EPIC-EVT-001 — Organizer Event Management |
| Feature            | Listado y filtrado de eventos propios |
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
**I want** listar y filtrar mis eventos por estado y tipo
**So that** ubicar rápidamente el evento sobre el que necesito trabajar

---

## 🧠 Business Context

### Context Summary

El listado es la página de entrada del rol Organizer. Debe mostrar eventos propios no eliminados, paginados, con filtros por `status` y `event_type`. Ordenados por fecha próxima descendente.

### Related Domain Concepts

* Event listing y paginación.
* Filtros server-side.

### Assumptions

* Se ocultan eventos `deleted_at`.
* Paginación cursor o page-based según ADR-API.

### Dependencies

* US-009, US-010, US-011, US-012.

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-EVENT-012                             |
| Use Case(s)            | UC-EVENT-005                             |
| Business Rule(s)       | BR-EVENT-013                             |
| Permission Rule(s)     | Ownership: sólo propios                  |
| Data Entity / Entities | Event, EventType                         |
| API Endpoint(s)        | GET /api/v1/events                       |
| NFR Reference(s)       | NFR-PERF-API-001                         |
| Related ADR(s)         | ADR-API-001                              |
| Related Document(s)    | /docs/16                                 |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Búsqueda full-text avanzada.
* Filtros por rango de presupuesto.
* Vista calendario.

### Scope Notes

* No introduce export CSV/PDF.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Listado por defecto

**Given** organizador con varios eventos
**When** entra a `/organizer/events`
**Then** ve listado paginado con ordenamiento por fecha próxima.

### AC-02: Filtro por estado y tipo

**Given** listado cargado
**When** aplica filtro `status=active` y `type=wedding`
**Then** la lista se actualiza coherentemente.

### AC-03: Estado vacío

**Given** organizador sin eventos
**When** abre el listado
**Then** ve estado vacío con CTA "Crear mi primer evento".

---

## ⚠️ Edge Cases

### EC-01: Paginación con filtros inválidos

**Given** filtros inválidos en query string
**When** se procesa el request
**Then** backend ignora inválidos y responde 200.

#### Handling

* Loguear filtros descartados.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | `status` ∈ enum válido          | Ignorar si inválido         |
| VR-02 | `type` ∈ EventTypes activos     | Ignorar si inválido         |
| VR-03 | `page`/`pageSize` numéricos     | Defaults aplicados          |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sólo eventos del usuario autenticado.                               |
| SEC-02 | Filtra `deleted_at IS NULL`.                                        |

### Negative Authorization Scenarios

* Vendor → 403.
* Admin: usa endpoint admin separado.

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

| Area                | Notes                                              |
| ------------------- | -------------------------------------------------- |
| Screen / Route      | `/[locale]/organizer/events`                       |
| Main UI Pattern     | Lista de cards con filtros laterales o top         |
| Primary Action      | "Crear nuevo evento"                               |
| Secondary Actions   | Filtros, paginación                                |
| Empty State         | "Aún no tienes eventos. Crea el primero."           |
| Loading State       | Skeleton                                           |
| Error State         | Banner con retry                                   |
| Success State       | Listado completo                                   |
| Accessibility Notes | Filtros accesibles, paginación con aria-label       |
| Responsive Notes    | Cards verticales en mobile                          |
| i18n Notes          | 4 locales                                          |
| Currency Notes      | Mostrar moneda por evento                          |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events`
* Components:

  * `EventList`, `EventFilters`, `EventCard`
* State Management:

  * TanStack `useEvents` con filtros
* Forms:

  * Filtros como query params
* API Client:

  * `eventsApi.list(filters)`

### Backend

* Use Case / Service:

  * `ListMyEventsUseCase`
* Controller / Route:

  * `GET /api/v1/events`
* Authorization Policy:

  * Owner-scoped
* Validation:

  * Query params Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `events`
* Constraints:

  * `deleted_at IS NULL`
* Index Considerations:

  * Índice por (`owner_user_id`, `status`, `event_date`)

### API

| Method | Endpoint                          | Purpose                          |
| ------ | --------------------------------- | -------------------------------- |
| GET    | `/api/v1/events`                  | Listar eventos del usuario       |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: No (sólo errores)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                  | Type        |
| ----- | ----------------------------------------- | ----------- |
| TS-01 | Listado paginado básico                   | API         |
| TS-02 | Filtros combinados                        | API         |
| TS-03 | Vista vacía                                | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Vendor llama endpoint                 | 403                      |
| NT-02 | Filtros inválidos                     | 200 ignorados            |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result |
| ---------- | --------------------------------- | --------------- |
| AUTH-TS-01 | Organizer                         | 200             |
| AUTH-TS-02 | Vendor                            | 403             |
| AUTH-TS-03 | Anónimo                           | 401             |

### Accessibility Tests

* Filtros accesibles con teclado.
* Paginación con aria-current.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Time-to-Find Event                                   |
| Expected Impact     | Mejora navegación del organizador                    |
| Success Criteria    | Tiempo de carga < 800ms                              |
| Academic Demo Value | Vista principal del rol Organizer                    |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Lista con cards y filtros.
* Paginación.

### Potential Backend Tasks

* Endpoint con filtros.
* Índices para performance.

### Potential Database Tasks

* Índice compuesto.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests API + E2E.

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

* [ ] Listado y filtros funcionales.
* [ ] Paginación operativa.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar tamaño de página por defecto (sugerido 20).

# 🧾 User Story: Comparar Quotes lado a lado

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-057                               |
| Epic               | EPIC-CMP-001 — Quote Comparison & Booking |
| Feature            | Comparador de Quotes                  |
| Module / Domain    | Booking                              |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador con Quotes recibidas
**I want** comparar Quotes por categoría lado a lado
**So that** decida cuál marcar como preferida

---

## 🧠 Business Context

### Context Summary

Tabla comparativa con total, desglose, validez, vendor. Sin conversión FX.

### Related Domain Concepts

* Quote comparator.

### Assumptions

* Quotes activas para el evento.

### Dependencies

* US-052.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BOOKING-001, FR-QUOTE-021        |
| Use Case(s)            | UC-QUOTE-006                       |
| Business Rule(s)       | BR-QUOTE-021                       |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | Quote                              |
| API Endpoint(s)        | GET /api/v1/events/:id/quotes/compare |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Conversión FX automática.

### Scope Notes

* Sólo moneda del evento.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Vista comparativa

**Given** ≥2 Quotes vigentes
**When** abre comparador
**Then** ve tabla con Quotes lado a lado.

### AC-02: Resumen IA disponible

**Given** comparador abierto
**When** clic "Resumir IA"
**Then** US-022 genera resumen.

---

## ⚠️ Edge Cases

### EC-01: Sólo 1 Quote

**Given** 1 Quote
**When** abre comparador
**Then** vista de detalle única con CTA "Marcar preferred".

#### Handling

* Soporte gradual.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Evento propio                   | 403/404                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |

### Negative Authorization Scenarios

* Ajeno → 403/404.

---

## 🤖 AI Behavior

This story does not invoke AI directly (consume US-022).

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

| Area                | Notes                                  |
| ------------------- | -------------------------------------- |
| Screen / Route      | `/[locale]/organizer/events/:id/quotes/compare` |
| Main UI Pattern     | Tabla con columnas por Quote             |
| Primary Action      | "Marcar preferred"                     |
| Secondary Actions   | "Resumir IA"                            |
| Empty State         | "Aún sin Quotes vigentes"               |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Tabla                                   |
| Accessibility Notes | Tabla con headers                        |
| Responsive Notes    | Mobile colapsa columnas                  |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda del evento                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Compare
* Components:

  * `QuoteComparator`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `quotesApi.compare`

### Backend

* Use Case / Service:

  * `CompareQuotesUseCase`
* Controller / Route:

  * `GET /api/v1/events/:id/quotes/compare`
* Authorization Policy:

  * Ownership
* Validation:

  * UUID
* Transaction Required:

  * No

### Database

* Main Tables:

  * `quotes`
* Constraints:

  * Filtro por evento
* Index Considerations:

  * Por event

### API

| Method | Endpoint                                            | Purpose                       |
| ------ | --------------------------------------------------- | ----------------------------- |
| GET    | `/api/v1/events/:id/quotes/compare`                 | Datos de comparador            |

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
| TS-01 | Compara 2+ Quotes                  | Integration |
| TS-02 | E2E                                | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Ajeno                                 | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |

### Accessibility Tests

* Tabla accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tiempo a decisión                                    |
| Expected Impact     | Decisión informada                                    |
| Success Criteria    | < 1s carga                                            |
| Academic Demo Value | Demo central                                          |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Tabla comparativa.

### Potential Backend Tasks

* Endpoint compare.

### Potential Database Tasks

* Índices.

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

* Confirmar vista mobile (collapsable rows).

# 🧾 User Story: Ver y editar mi presupuesto

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-035                               |
| Epic               | EPIC-BUD-001 — Budget Management & Currency |
| Feature            | Vista y edición del presupuesto       |
| Module / Domain    | Budget                               |
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
**I want** ver y editar mi presupuesto del evento
**So that** controle mis costos por categoría y vea planned vs committed

---

## 🧠 Business Context

### Context Summary

Cada evento tiene un `Budget` 1:1 con `BudgetItem` por categoría. Moneda inmutable.

### Related Domain Concepts

* Budget, BudgetItem.

### Assumptions

* `committed` se actualiza vía BookingIntent.

### Dependencies

* US-009.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BUDGET-001, FR-BUDGET-002        |
| Use Case(s)            | UC-BUDGET-001                      |
| Business Rule(s)       | BR-BUDGET-001, BR-BUDGET-002        |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | Budget, BudgetItem                  |
| API Endpoint(s)        | GET/PATCH /api/v1/events/:id/budget |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Multi-moneda.
* Conversión FX.

### Scope Notes

* Moneda inmutable.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Ver presupuesto

**Given** evento con budget
**When** abre la vista
**Then** ve total, planned, committed por categoría.

### AC-02: Editar total

**Given** budget existente
**When** PATCH `total`
**Then** se actualiza; warning si committed > nuevo total.

---

## ⚠️ Edge Cases

### EC-01: Sin budget

**Given** evento sin BudgetItems
**When** abre la vista
**Then** estado vacío con CTA "Crear primera categoría" o "Sugerir IA".

#### Handling

* Empty state.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Total ≥ 0                       | 400                         |
| VR-02 | Moneda no editable              | Ignorada                    |

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
| Screen / Route      | `/[locale]/organizer/events/:id/budget`                |
| Main UI Pattern     | Tabla de items + tarjetas resumen                       |
| Primary Action      | "Editar total"                                         |
| Secondary Actions   | "Crear item", "Sugerir IA"                             |
| Empty State         | CTAs                                                    |
| Loading State       | Skeleton                                                |
| Error State         | Banner                                                  |
| Success State       | Vista actualizada                                       |
| Accessibility Notes | Tabla accesible                                         |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | Moneda del evento                                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/budget`
* Components:

  * `BudgetView`, `BudgetSummary`
* State Management:

  * TanStack
* Forms:

  * RHF inline
* API Client:

  * `budgetApi.get`, `budgetApi.update`

### Backend

* Use Case / Service:

  * `GetBudgetUseCase`, `UpdateBudgetUseCase`
* Controller / Route:

  * `GET /api/v1/events/:id/budget`
  * `PATCH /api/v1/events/:id/budget`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `budget`, `budget_items`
* Constraints:

  * 1:1 con event
* Index Considerations:

  * Por `event_id`

### API

| Method | Endpoint                                  | Purpose            |
| ------ | ----------------------------------------- | ------------------ |
| GET    | `/api/v1/events/:id/budget`               | Ver presupuesto    |
| PATCH  | `/api/v1/events/:id/budget`               | Editar presupuesto |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`budget.updated`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Ver budget completo               | API         |
| TS-02 | Editar total                       | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Intentar cambiar moneda               | Ignorado                 |
| NT-02 | Ajeno                                 | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Tabla accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Control de costos                                    |
| Expected Impact     | Visibilidad financiera                                |
| Success Criteria    | Carga < 800ms                                        |
| Academic Demo Value | Demo de control financiero                            |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Vista + edición inline.

### Potential Backend Tasks

* Endpoints + reglas.

### Potential Database Tasks

* Schema budget/items.

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

* Confirmar formato de moneda con Intl.NumberFormat.

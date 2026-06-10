# 🧾 User Story: Ver committed actualizado en presupuesto post booking

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-064                               |
| Epic               | EPIC-CMP-001                          |
| Feature            | Surface committed update              |
| Module / Domain    | Booking / Budget                     |
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
**I want** ver mi `committed` actualizado en presupuesto inmediatamente al confirmar booking
**So that** mi vista financiera refleje el compromiso en vivo

---

## 🧠 Business Context

### Context Summary

Surface UI sobre US-039 (handler atómico). Refresh del budget tras confirm.

### Related Domain Concepts

* TanStack invalidations.

### Assumptions

* US-039 atómico ya implementado.

### Dependencies

* US-039, US-061.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BUDGET-008                       |
| Use Case(s)            | UC-BUDGET-004                      |
| Business Rule(s)       | BR-BUDGET-005                      |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | BudgetItem                         |
| API Endpoint(s)        | GET /api/v1/events/:id/budget       |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Real-time push.

### Scope Notes

* Refresh post-acción.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Visual update

**Given** vendor confirma booking
**When** organizer regresa al presupuesto
**Then** committed refleja monto.

---

## ⚠️ Edge Cases

### EC-01: Cancel revierte

**Given** se cancela booking
**When** vuelve a budget
**Then** committed disminuye.

#### Handling

* Refresh.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Ownership                       | 403/404                     |

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

| Area                | Notes                                  |
| ------------------- | -------------------------------------- |
| Screen / Route      | Pantalla budget                          |
| Main UI Pattern     | Refresh visible                          |
| Primary Action      | No aplica                              |
| Secondary Actions   | No aplica                              |
| Empty State         | No aplica                              |
| Loading State       | Skeleton parcial                         |
| Error State         | Banner                                  |
| Success State       | Cifras actualizadas                      |
| Accessibility Notes | aria-live                                |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda del evento                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Budget
* Components:

  * `BudgetSummary`
* State Management:

  * Invalidate cache
* Forms:

  * No aplica
* API Client:

  * GET budget

### Backend

* Use Case / Service:

  * `GetBudgetUseCase`
* Controller / Route:

  * `GET /api/v1/events/:id/budget`
* Authorization Policy:

  * Ownership
* Validation:

  * UUID
* Transaction Required:

  * No

### Database

* Main Tables:

  * `budget_items`
* Constraints:

  * Por event
* Index Considerations:

  * Por event_id

### API

| Method | Endpoint                          | Purpose                  |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/v1/events/:id/budget`       | Vista actualizada        |

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
| TS-01 | Refresh muestra nuevo committed   | E2E         |

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

* aria-live polite.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Confianza financiera                                 |
| Expected Impact     | Datos en vivo                                         |
| Success Criteria    | Refresh < 1s                                          |
| Academic Demo Value | Integración bounded contexts                          |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Invalidate cache.

### Potential Backend Tasks

* Endpoint summary.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests E2E.

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

* [ ] Refresh visible.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Considerar broadcast websocket en futuro.

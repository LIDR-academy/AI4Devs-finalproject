# 🧾 User Story: Marcar una Quote como preferred

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-058                               |
| Epic               | EPIC-CMP-001                          |
| Feature            | Preferred flag                       |
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

**As an** organizador
**I want** marcar una Quote como `preferred`
**So that** señale mi preferencia previa al BookingIntent

---

## 🧠 Business Context

### Context Summary

Una sola preferred por categoría/evento. Vendor recibe notificación.

### Related Domain Concepts

* Preferred flag.

### Assumptions

* Vendor notificado.

### Dependencies

* US-057.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-QUOTE-022                        |
| Use Case(s)            | UC-QUOTE-007                       |
| Business Rule(s)       | BR-QUOTE-022                       |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | Quote                              |
| API Endpoint(s)        | PATCH /api/v1/quotes/:id/preferred  |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Multi-preferred.

### Scope Notes

* Sólo 1.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Marca preferred

**Given** ≥1 Quote vigente
**When** marca preferred
**Then** otras quotes en misma categoría/evento pierden preferred; vendor notificado.

---

## ⚠️ Edge Cases

### EC-01: Quote expirada

**Given** Quote `expired`
**When** intenta preferred
**Then** 409.

#### Handling

* Sólo vigentes.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Quote vigente                    | 409                         |

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
| Screen / Route      | Comparador / detalle Quote               |
| Main UI Pattern     | Botón "Marcar preferred"                |
| Primary Action      | Marcar                                  |
| Secondary Actions   | Quitar                                  |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Banner                                  |
| Success State       | Star/badge                              |
| Accessibility Notes | aria-pressed                             |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Comparador
* Components:

  * `PreferredButton`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `quotesApi.preferred`

### Backend

* Use Case / Service:

  * `MarkQuotePreferredUseCase`
* Controller / Route:

  * `PATCH /api/v1/quotes/:id/preferred`
* Authorization Policy:

  * Ownership
* Validation:

  * Estado vigente
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `quotes`
* Constraints:

  * Sólo 1 preferred por (event, category)
* Index Considerations:

  * Por preferred

### API

| Method | Endpoint                                  | Purpose                  |
| ------ | ----------------------------------------- | ------------------------ |
| PATCH  | `/api/v1/quotes/:id/preferred`            | Marcar preferred         |

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
| TS-01 | Cambia preferred                  | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Quote expirada                        | 409                      |
| NT-02 | Ajeno                                 | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |

### Accessibility Tests

* Botón accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Conversión a Booking                                  |
| Expected Impact     | Señal a vendor                                        |
| Success Criteria    | Funcional                                            |
| Academic Demo Value | Decisión visible                                      |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Botón star.

### Potential Backend Tasks

* Use case + notif.

### Potential Database Tasks

* Constraint único condicional.

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

* Confirmar copy de notificación al vendor.

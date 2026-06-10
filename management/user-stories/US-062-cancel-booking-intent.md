# 🧾 User Story: Cancelar BookingIntent sin penalización

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-062                               |
| Epic               | EPIC-CMP-001                          |
| Feature            | Cancelación BookingIntent             |
| Module / Domain    | Booking                              |
| User Role          | Organizer / Vendor                   |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador o proveedor
**I want** cancelar un BookingIntent (incluso confirmed_intent) sin penalización
**So that** mantenga flexibilidad operativa (Decisión PO 8.1 #5)

---

## 🧠 Business Context

### Context Summary

Cancelación sin penalty. Revierte committed.

### Related Domain Concepts

* BookingIntent cancel.

### Assumptions

* Notificación a contraparte.

### Dependencies

* US-060, US-061.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BOOKING-004                      |
| Use Case(s)            | UC-BOOKING-003                     |
| Business Rule(s)       | BR-BOOKING-004                     |
| Permission Rule(s)     | Ownership / Assignment             |
| Data Entity / Entities | BookingIntent                      |
| API Endpoint(s)        | POST /api/v1/booking-intents/:id/cancel |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8.1 (#5)                     |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Penalty automático.

### Scope Notes

* Soft cancel.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Cancelación

**Given** BookingIntent vigente
**When** cualquiera de las partes cancela
**Then** status `cancelled`, committed revertido, contraparte notificada.

---

## ⚠️ Edge Cases

### EC-01: Ya cancelado

**Given** cancelled
**When** intenta de nuevo
**Then** 409.

#### Handling

* Idempotente.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Estado cancelable               | 409                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership o Assignment.                                              |

### Negative Authorization Scenarios

* Tercero → 403.

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
| Screen / Route      | Detalle booking                          |
| Main UI Pattern     | Modal con confirmación                   |
| Primary Action      | Cancelar                                |
| Secondary Actions   | Volver                                  |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Banner                                  |
| Success State       | Toast                                   |
| Accessibility Notes | Modal accesible                          |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Detalle
* Components:

  * `CancelBookingDialog`
* State Management:

  * TanStack
* Forms:

  * Confirmación
* API Client:

  * `bookingsApi.cancel`

### Backend

* Use Case / Service:

  * `CancelBookingIntentUseCase` (revertir committed)
* Controller / Route:

  * `POST /api/v1/booking-intents/:id/cancel`
* Authorization Policy:

  * Ownership/Assignment
* Validation:

  * Estado
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `booking_intents`, `budget_items`, `notifications`
* Constraints:

  * Estado válido
* Index Considerations:

  * Por id

### API

| Method | Endpoint                                          | Purpose             |
| ------ | ------------------------------------------------- | ------------------- |
| POST   | `/api/v1/booking-intents/:id/cancel`              | Cancelar booking    |

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
| TS-01 | Cancel revierte committed         | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Ya cancelled                          | 409                      |
| NT-02 | Tercero                               | 403                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                  | Expected Result |
| ---------- | ------------------------- | --------------- |
| AUTH-TS-01 | Organizer dueño           | 200             |
| AUTH-TS-02 | Vendor assigned            | 200             |

### Accessibility Tests

* Modal accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Confianza                                            |
| Expected Impact     | Flexibilidad                                         |
| Success Criteria    | Funcional                                            |
| Academic Demo Value | Decisión PO #5                                        |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Modal.

### Potential Backend Tasks

* Use case + revert.

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

* Considerar campo motivo opcional.

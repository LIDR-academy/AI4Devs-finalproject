# 🧾 User Story: Vendor confirma BookingIntent

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-061                               |
| Epic               | EPIC-CMP-001                          |
| Feature            | Confirmación de BookingIntent         |
| Module / Domain    | Booking                              |
| User Role          | Vendor                               |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** proveedor
**I want** confirmar un BookingIntent recibido
**So that** se materialice como `confirmed_intent` y mi calendario de compromisos se actualice

---

## 🧠 Business Context

### Context Summary

`pending → confirmed_intent`. Disparador del update committed (US-039) atómico.

### Related Domain Concepts

* State machine BookingIntent.

### Assumptions

* Notif al organizer.

### Dependencies

* US-060.
* US-039.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BOOKING-003                      |
| Use Case(s)            | UC-BOOKING-002                     |
| Business Rule(s)       | BR-BOOKING-003                     |
| Permission Rule(s)     | Assignment (vendor target)         |
| Data Entity / Entities | BookingIntent                      |
| API Endpoint(s)        | POST /api/v1/booking-intents/:id/confirm |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Pagos reales.

### Scope Notes

* Sin penalty.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Confirmación

**Given** BookingIntent `pending`
**When** vendor confirma
**Then** status `confirmed_intent`, committed actualizado, organizer notificado.

---

## ⚠️ Edge Cases

### EC-01: Cancelado previamente

**Given** status `cancelled`
**When** intenta confirmar
**Then** 409.

#### Handling

* Validación.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Estado pending                  | 409                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Assignment.                                                          |
| SEC-02 | Atomic con update committed.                                         |

### Negative Authorization Scenarios

* Otro vendor → 403/404.

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
| Screen / Route      | Detalle BookingIntent                    |
| Main UI Pattern     | Botón "Confirmar"                       |
| Primary Action      | Confirmar                                |
| Secondary Actions   | Cancelar                                |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Banner                                  |
| Success State       | Toast                                   |
| Accessibility Notes | Botón accesible                          |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda del evento                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Detalle vendor
* Components:

  * `ConfirmBookingButton`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `bookingsApi.confirm`

### Backend

* Use Case / Service:

  * `ConfirmBookingIntentUseCase` (orquesta committed update)
* Controller / Route:

  * `POST /api/v1/booking-intents/:id/confirm`
* Authorization Policy:

  * Assignment
* Validation:

  * Estado pending
* Transaction Required:

  * Sí (confirm + committed + notif)

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
| POST   | `/api/v1/booking-intents/:id/confirm`             | Confirmar booking   |

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
| TS-01 | Confirmar pending                  | Integration |
| TS-02 | Committed atómico                  | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Cancelled                             | 409                      |
| NT-02 | Otro vendor                           | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Vendor target      | 200             |

### Accessibility Tests

* Botón accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Conversión final                                     |
| Expected Impact     | Materialización                                       |
| Success Criteria    | Funcional + atómico                                   |
| Academic Demo Value | Demo cierre flujo                                     |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Botón confirm.

### Potential Backend Tasks

* Use case atómico.

### Potential Database Tasks

* Transacción.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests + concurrencia.

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

* Asegurar idempotencia para reintentos.

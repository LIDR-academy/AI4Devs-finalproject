# 🧾 User Story: Cancelar QuoteRequest activa

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-056                               |
| Epic               | EPIC-QR-001                          |
| Feature            | Cancelación de QR                    |
| Module / Domain    | Quotes                               |
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
**I want** cancelar una QuoteRequest activa
**So that** retire la solicitud cuando ya no la necesite

---

## 🧠 Business Context

### Context Summary

Cancela QR (status → `cancelled`); si tiene Quote enviada, ésta se rechaza o cancela.

### Related Domain Concepts

* QR state machine.

### Assumptions

* Notifica al vendor.

### Dependencies

* US-049.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-QUOTE-010                        |
| Use Case(s)            | UC-QUOTE-007                       |
| Business Rule(s)       | BR-QUOTE-012                       |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | QuoteRequest, Quote                 |
| API Endpoint(s)        | POST /api/v1/quote-requests/:id/cancel |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Penalizaciones.

### Scope Notes

* Sin penalty.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Cancelación

**Given** QR activa
**When** organizer cancel
**Then** status `cancelled`, vendor notificado.

---

## ⚠️ Edge Cases

### EC-01: QR ya respondida

**Given** QR `responded`
**When** intenta cancel
**Then** se permite si Quote no `accepted`/`booking_intent`.

#### Handling

* Política consistente.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Estado cancelable               | 409                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |

### Negative Authorization Scenarios

* Otro organizador → 403/404. Vendor → 403.

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
| Screen / Route      | Detalle QR                              |
| Main UI Pattern     | Botón "Cancelar" con confirmación        |
| Primary Action      | Confirmar cancelación                   |
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

  * Detalle QR organizer
* Components:

  * `CancelQRDialog`
* State Management:

  * TanStack
* Forms:

  * Confirmación
* API Client:

  * `quotesApi.cancelRequest`

### Backend

* Use Case / Service:

  * `CancelQuoteRequestUseCase`
* Controller / Route:

  * `POST /api/v1/quote-requests/:id/cancel`
* Authorization Policy:

  * Ownership
* Validation:

  * Estado válido
* Transaction Required:

  * Sí (cancel + notification)

### Database

* Main Tables:

  * `quote_requests`, `quotes`, `notifications`
* Constraints:

  * Estados
* Index Considerations:

  * Por id

### API

| Method | Endpoint                                  | Purpose          |
| ------ | ----------------------------------------- | ---------------- |
| POST   | `/api/v1/quote-requests/:id/cancel`       | Cancelar QR      |

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
| TS-01 | Cancelación con notif             | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Quote accepted                        | 409                      |
| NT-02 | Otro                                  | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |

### Accessibility Tests

* Modal accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Control del organizador                              |
| Expected Impact     | Flexibilidad                                          |
| Success Criteria    | Funcional                                            |
| Academic Demo Value | Demuestra cancelación bilateral                       |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Botón + modal.

### Potential Backend Tasks

* Use case + notif.

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

* Confirmar reglas si BookingIntent existe.

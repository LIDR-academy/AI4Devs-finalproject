# 🧾 User Story: Crear BookingIntent desde Quote vigente

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-060                               |
| Epic               | EPIC-CMP-001                          |
| Feature            | Creación de BookingIntent             |
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
**I want** crear un BookingIntent desde una Quote vigente y aceptada
**So that** envíe una señal formal de intención al vendor

---

## 🧠 Business Context

### Context Summary

`BookingIntent.status='pending'`. Sin pagos reales (Decisión PO 8.1 #5). Disclaimer visible.

### Related Domain Concepts

* BookingIntent.
* Quote.status → accepted.

### Assumptions

* Sólo 1 BookingIntent activo por Quote.

### Dependencies

* US-058.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BOOKING-002                      |
| Use Case(s)            | UC-BOOKING-001                     |
| Business Rule(s)       | BR-BOOKING-001                     |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | BookingIntent, Quote                |
| API Endpoint(s)        | POST /api/v1/booking-intents       |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8.1 (#5)                     |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Pagos reales, contratos.

### Scope Notes

* Disclaimer obligatorio.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: BookingIntent creado

**Given** Quote vigente accepted
**When** crea BookingIntent
**Then** se crea `pending`, Quote → `accepted`, vendor notificado.

### AC-02: Disclaimer

**Given** confirmación
**When** se muestra modal
**Then** disclaimer "Acuerdo final fuera de la plataforma".

---

## ⚠️ Edge Cases

### EC-01: Quote expirada

**Given** Quote `expired`
**When** intenta
**Then** 409.

#### Handling

* Validación.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Quote vigente                    | 409                         |
| VR-02 | Disclaimer aceptado             | 400                         |

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
| Screen / Route      | Detalle Quote                            |
| Main UI Pattern     | Modal con disclaimer                     |
| Primary Action      | "Crear intención"                       |
| Secondary Actions   | Cancelar                                |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Banner                                  |
| Success State       | Toast + redirect                        |
| Accessibility Notes | Modal accesible                          |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda del evento                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Detalle Quote
* Components:

  * `CreateBookingDialog`
* State Management:

  * TanStack
* Forms:

  * Confirmación + disclaimer
* API Client:

  * `bookingsApi.create`

### Backend

* Use Case / Service:

  * `CreateBookingIntentUseCase`
* Controller / Route:

  * `POST /api/v1/booking-intents`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `booking_intents`, `quotes`
* Constraints:

  * UNIQUE quote_id activo
* Index Considerations:

  * Por quote_id

### API

| Method | Endpoint                                  | Purpose                  |
| ------ | ----------------------------------------- | ------------------------ |
| POST   | `/api/v1/booking-intents`                 | Crear BookingIntent       |

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
| TS-01 | Crear desde Quote vigente         | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Quote expirada                        | 409                      |
| NT-02 | Sin disclaimer                        | 400                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 201             |

### Accessibility Tests

* Modal accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Conversión a booking                                  |
| Expected Impact     | Señal formal                                          |
| Success Criteria    | Funcional                                            |
| Academic Demo Value | Decisión PO #5                                        |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Modal disclaimer.

### Potential Backend Tasks

* Use case.

### Potential Database Tasks

* UNIQUE.

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

* [ ] Funcional con disclaimer.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Copy del disclaimer revisado por legal.

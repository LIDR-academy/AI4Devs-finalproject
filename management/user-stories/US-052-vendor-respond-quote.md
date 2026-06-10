# 🧾 User Story: Vendor responde Quote con desglose

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-052                               |
| Epic               | EPIC-QR-001                          |
| Feature            | Respuesta del vendor                 |
| Module / Domain    | Quotes                               |
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
**I want** responder una QuoteRequest con `total`, desglose y condiciones
**So that** el organizador pueda evaluar mi propuesta

---

## 🧠 Business Context

### Context Summary

Vendor responde con `Quote` enlazada a QR. QR pasa a `responded`. Quote inicial `draft → sent`.

### Related Domain Concepts

* Quote lifecycle.

### Assumptions

* `valid_until` default 15 días (Decisión PO 8.1 #4).

### Dependencies

* US-051.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-QUOTE-006, FR-QUOTE-007          |
| Use Case(s)            | UC-QUOTE-004                       |
| Business Rule(s)       | BR-QUOTE-008                       |
| Permission Rule(s)     | Assignment                         |
| Data Entity / Entities | Quote, QuoteRequest                 |
| API Endpoint(s)        | POST /api/v1/vendor/quote-requests/:id/respond |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8.1 (#4)                     |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Multi-quote por QR.

### Scope Notes

* Una Quote por QR.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Quote enviada

**Given** QR `sent` o `viewed`
**When** vendor envía Quote
**Then** QR pasa a `responded`, Quote `sent`, organizer notificado.

### AC-02: Validez default

**Given** Quote sin `valid_until`
**When** se crea
**Then** se asigna 15 días por defecto.

---

## ⚠️ Edge Cases

### EC-01: QR expirada

**Given** QR `expired`
**When** vendor responde
**Then** 409 `QR_EXPIRED`.

#### Handling

* Mensaje claro.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Total > 0                       | 400                         |
| VR-02 | Desglose suma = total           | 400                         |
| VR-03 | valid_until > hoy               | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Assignment.                                                          |
| SEC-02 | Una sola respuesta por QR.                                           |

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
| Screen / Route      | `/[locale]/vendor/quote-requests/:id/respond` |
| Main UI Pattern     | Form total + desglose + condiciones      |
| Primary Action      | "Enviar cotización"                    |
| Secondary Actions   | "Guardar borrador"                      |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Banner                                  |
| Success State       | Toast                                   |
| Accessibility Notes | Labels                                  |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda del evento                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Form respuesta
* Components:

  * `QuoteResponseForm`, `BreakdownEditor`
* State Management:

  * TanStack
* Forms:

  * RHF + Zod
* API Client:

  * `vendorApi.qr.respond`

### Backend

* Use Case / Service:

  * `RespondQuoteRequestUseCase`
* Controller / Route:

  * `POST /api/v1/vendor/quote-requests/:id/respond`
* Authorization Policy:

  * Assignment
* Validation:

  * Zod
* Transaction Required:

  * Sí (Quote + QR status + notification)

### Database

* Main Tables:

  * `quotes`, `quote_requests`
* Constraints:

  * UNIQUE (quote_request_id)
* Index Considerations:

  * Por QR

### API

| Method | Endpoint                                                | Purpose             |
| ------ | ------------------------------------------------------- | ------------------- |
| POST   | `/api/v1/vendor/quote-requests/:id/respond`             | Enviar Quote        |

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
| TS-01 | Respuesta válida con default 15d   | Integration |
| TS-02 | Notificación organizer             | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | QR expirada                           | 409                      |
| NT-02 | Otro vendor                           | 403/404                  |
| NT-03 | Desglose ≠ total                      | 400                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Vendor target      | 201             |
| AUTH-TS-02 | Otro vendor        | 403             |

### Accessibility Tests

* Form accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tasa de respuesta                                    |
| Expected Impact     | Habilita comparador                                   |
| Success Criteria    | ≥ 60% respuestas                                     |
| Academic Demo Value | Bilateral completo                                    |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Form respuesta + breakdown.

### Potential Backend Tasks

* Use case atómico.

### Potential Database Tasks

* Schema quotes.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests + atomicidad.

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

* Considerar autosave de borrador.

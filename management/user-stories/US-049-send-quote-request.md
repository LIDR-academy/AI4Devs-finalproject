# 🧾 User Story: Enviar QuoteRequest con brief autocompletado

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-049                               |
| Epic               | EPIC-QR-001 — Quote Request & Response Flow |
| Feature            | Envío de QuoteRequest                |
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
**I want** enviar una QuoteRequest a un vendor aprobado con un brief estructurado
**So that** obtenga una cotización para mi categoría requerida

---

## 🧠 Business Context

### Context Summary

Flujo bilateral: el organizador inicia con QuoteRequest (sent). Vendor recibe notificación in-app + email simulado.

### Related Domain Concepts

* QuoteRequest lifecycle: sent → viewed → responded | expired | cancelled.

### Assumptions

* Brief puede venir de US-021 (AI-005).

### Dependencies

* US-040, US-047 (vendor aprobado).
* US-021 opcional.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-QUOTE-001, FR-QUOTE-002          |
| Use Case(s)            | UC-QUOTE-001                       |
| Business Rule(s)       | BR-QUOTE-001, BR-QUOTE-003          |
| Permission Rule(s)     | Organizer + ownership evento; vendor target activo |
| Data Entity / Entities | QuoteRequest, Event, VendorProfile  |
| API Endpoint(s)        | POST /api/v1/quote-requests         |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Chat real-time.
* Cotizaciones múltiples concurrentes por (event, vendor).

### Scope Notes

* Una QR activa por (evento, vendor).

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Envío exitoso

**Given** evento + vendor approved
**When** se envía QR con brief
**Then** se crea `QuoteRequest(status='sent')` y se notifica al vendor.

### AC-02: Una activa por (event, vendor)

**Given** ya existe una QR activa para (event, vendor)
**When** se intenta otra
**Then** 409 `QR_ALREADY_ACTIVE`.

---

## ⚠️ Edge Cases

### EC-01: Vendor no aprobado

**Given** vendor `pending`/`rejected`
**When** se envía
**Then** 400 `VENDOR_NOT_AVAILABLE`.

#### Handling

* Validación.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Evento propio                   | 403/404                     |
| VR-02 | Vendor approved                 | 400                         |
| VR-03 | Brief ≤ 5000 chars              | 400                         |
| VR-04 | Categoría existente             | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership del evento.                                                |
| SEC-02 | Assignment-based: sólo el vendor target verá la QR.                  |
| SEC-03 | Rate limit por usuario.                                              |

### Negative Authorization Scenarios

* Otro organizador → 403/404. Vendor → 403.

---

## 🤖 AI Behavior

This story does not invoke AI directly (el brief puede venir de US-021).

### AI Involvement

* AI Feature: None (consume output de US-021 si aplica)
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
| Screen / Route      | `/[locale]/organizer/events/:id/quotes/new` |
| Main UI Pattern     | Form con brief + selector vendor        |
| Primary Action      | "Enviar solicitud"                     |
| Secondary Actions   | "Autocompletar con IA"                  |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Banner                                  |
| Success State       | Toast + redirect                        |
| Accessibility Notes | Labels                                  |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda del evento                      |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/quotes/new`
* Components:

  * `QuoteRequestForm`
* State Management:

  * TanStack
* Forms:

  * RHF + Zod
* API Client:

  * `quotesApi.createRequest`

### Backend

* Use Case / Service:

  * `CreateQuoteRequestUseCase`
* Controller / Route:

  * `POST /api/v1/quote-requests`
* Authorization Policy:

  * Organizer + ownership
* Validation:

  * Zod
* Transaction Required:

  * Sí (insert + notification)

### Database

* Main Tables:

  * `quote_requests`
* Constraints:

  * UNIQUE activa por (event_id, vendor_id)
* Index Considerations:

  * Por `event_id`, `vendor_id`, `status`

### API

| Method | Endpoint                          | Purpose                |
| ------ | --------------------------------- | ---------------------- |
| POST   | `/api/v1/quote-requests`          | Crear QR               |

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
| TS-01 | Envío exitoso                     | Integration |
| TS-02 | Notificación generada              | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Duplicada activa                      | 409                      |
| NT-02 | Vendor no aprobado                    | 400                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Organizer          | 201             |
| AUTH-TS-02 | Vendor             | 403             |

### Accessibility Tests

* Form accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Quote Request Volume                                 |
| Expected Impact     | Habilita cotización bilateral                         |
| Success Criteria    | < 1s en p95                                          |
| Academic Demo Value | Core flow marketplace                                 |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Form + brief.

### Potential Backend Tasks

* Use case + notification.

### Potential Database Tasks

* Schema + unique.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests + límite (US-050).

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

* Coordinar con US-050 para enforcement de límite.

# 🧾 User Story: Vendor ve la solicitud y la marca como viewed

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-051                               |
| Epic               | EPIC-QR-001                          |
| Feature            | Estado viewed automático              |
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
**I want** que mis QRs pasen automáticamente a `viewed` la primera vez que las abro
**So that** el organizador sepa que vi su solicitud

---

## 🧠 Business Context

### Context Summary

Transición automática `sent → viewed` al abrir detalle por primera vez. Permite trackear engagement.

### Related Domain Concepts

* QR state machine.

### Assumptions

* Idempotente: viewed una vez.

### Dependencies

* US-049.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-QUOTE-005                        |
| Use Case(s)            | UC-QUOTE-003                       |
| Business Rule(s)       | BR-QUOTE-006                       |
| Permission Rule(s)     | Assignment-based: sólo vendor target |
| Data Entity / Entities | QuoteRequest                       |
| API Endpoint(s)        | GET /api/v1/vendor/quote-requests/:id |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Read receipts complejos.

### Scope Notes

* Sólo transición simple.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Marca viewed al abrir

**Given** QR `sent`
**When** vendor target abre detalle
**Then** transiciona a `viewed`, queda `viewed_at`.

### AC-02: Segunda vista no afecta

**Given** QR `viewed`
**When** vuelve a abrir
**Then** no se modifica.

---

## ⚠️ Edge Cases

### EC-01: QR expirada

**Given** QR `expired`
**When** vendor abre
**Then** muestra read-only sin transición.

#### Handling

* Sin cambios.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Vendor target enforced          | 403                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Assignment-based.                                                    |

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
| Screen / Route      | `/[locale]/vendor/quote-requests/:id`   |
| Main UI Pattern     | Detalle de QR                            |
| Primary Action      | "Responder"                             |
| Secondary Actions   | "Marcar visto"                          |
| Empty State         | No aplica                              |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Vista cargada                            |
| Accessibility Notes | aria-live tras transición                |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda del evento                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Detalle QR vendor
* Components:

  * `QuoteRequestDetail`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `vendorApi.qr.detail`

### Backend

* Use Case / Service:

  * `GetQuoteRequestForVendorUseCase` (marca viewed)
* Controller / Route:

  * `GET /api/v1/vendor/quote-requests/:id`
* Authorization Policy:

  * Assignment
* Validation:

  * UUID
* Transaction Required:

  * Sí (read + update)

### Database

* Main Tables:

  * `quote_requests`
* Constraints:

  * Sólo transición desde sent
* Index Considerations:

  * Por `id`

### API

| Method | Endpoint                                          | Purpose             |
| ------ | ------------------------------------------------- | ------------------- |
| GET    | `/api/v1/vendor/quote-requests/:id`               | Detalle vendor      |

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
| TS-01 | Primer abrir marca viewed         | Integration |
| TS-02 | Segundo abrir idempotente          | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Otro vendor                           | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Vendor target      | 200             |
| AUTH-TS-02 | Otro vendor        | 403             |

### Accessibility Tests

* Cambio anunciado.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Engagement vendor                                    |
| Expected Impact     | Confianza del organizador                            |
| Success Criteria    | 100% transición correcta                              |
| Academic Demo Value | Bilateralidad clara                                   |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Detalle vendor.

### Potential Backend Tasks

* Use case con transición.

### Potential Database Tasks

* Estado.

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

* Confirmar si organizer recibe notif "tu solicitud fue vista".

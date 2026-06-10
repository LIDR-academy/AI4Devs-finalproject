# 🧾 User Story: El sistema expira automáticamente QRs y Quotes vencidas

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-055                               |
| Epic               | EPIC-QR-001                          |
| Feature            | Job de expiración                    |
| Module / Domain    | Quotes                               |
| User Role          | System                               |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As the** sistema EventFlow
**I want** marcar como `expired` las QuoteRequests y Quotes vencidas
**So that** el estado refleje correctamente el ciclo

---

## 🧠 Business Context

### Context Summary

Dos jobs: `QuoteRequestExpirationJob` y `QuoteExpirationJob`. Idempotentes con clock injectable.

### Related Domain Concepts

* Job programado.

### Assumptions

* Diario.

### Dependencies

* US-049, US-052.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-QUOTE-009                        |
| Use Case(s)            | UC-QUOTE-006                       |
| Business Rule(s)       | BR-QUOTE-011                       |
| Permission Rule(s)     | System                             |
| Data Entity / Entities | QuoteRequest, Quote                 |
| API Endpoint(s)        | Sistema                            |
| NFR Reference(s)       | NFR-OBS-001                        |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Recordatorios pre-vencimiento.

### Scope Notes

* Sólo expirar.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Expiración Quote

**Given** Quote `valid_until <= today`
**When** corre job
**Then** status pasa a `expired`, notif US-054.

### AC-02: Expiración QR

**Given** QR `sent`/`viewed` sin respuesta tras N días (configurable)
**When** corre job
**Then** status `expired`.

---

## ⚠️ Edge Cases

### EC-01: Ya expirada

**Given** ya `expired`
**When** corre
**Then** sin cambios.

#### Handling

* Idempotente.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Sólo elegibles                  | Filtro SQL                  |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | System.                                                              |

### Negative Authorization Scenarios

* N/A.

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
| Screen / Route      | Listados                                |
| Main UI Pattern     | Badge "Expired"                         |
| Primary Action      | No aplica                              |
| Secondary Actions   | No aplica                              |
| Empty State         | No aplica                              |
| Loading State       | No aplica                              |
| Error State         | No aplica                              |
| Success State       | Badge visible                            |
| Accessibility Notes | Texto accesible                          |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Listados
* Components:

  * `QuoteStatusBadge`
* State Management:

  * Polling/refresh
* Forms:

  * No aplica
* API Client:

  * No aplica

### Backend

* Use Case / Service:

  * `ExpireQuotesJob`, `ExpireQuoteRequestsJob`
* Controller / Route:

  * Scheduler
* Authorization Policy:

  * System
* Validation:

  * Filtros
* Transaction Required:

  * Por batch

### Database

* Main Tables:

  * `quotes`, `quote_requests`
* Constraints:

  * Status válido
* Index Considerations:

  * Por `valid_until`, `status`

### API

| Method | Endpoint                          | Purpose             |
| ------ | --------------------------------- | ------------------- |
| —      | Job                                | Expiración          |

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
| TS-01 | Expira con clock controlado       | Integration |
| TS-02 | Idempotencia                       | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Ya expirado                           | Ignorado                 |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Sistema             | Success         |

### Accessibility Tests

* No aplica.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Higiene de datos                                     |
| Expected Impact     | Estado correcto                                       |
| Success Criteria    | 100% expiración en < 24h                              |
| Academic Demo Value | Demo automatización                                   |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Badges.

### Potential Backend Tasks

* Jobs + scheduler.

### Potential Database Tasks

* Índice por valid_until.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests con clock injectable.

### Potential DevOps / Config Tasks

* Scheduler.

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

* [ ] Jobs operativos.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar N días para QR sin respuesta (sugerido 30).

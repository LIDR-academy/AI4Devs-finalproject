# 🧾 User Story: Validar límite de 5 QR activas por categoría

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-050                               |
| Epic               | EPIC-QR-001                          |
| Feature            | Límite de QR activas por categoría    |
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
**I want** que el sistema impida enviar más de 5 QuoteRequests activas por categoría por evento (Decisión PO 8.1 #12)
**So that** mantenga control y no satures a la categoría

---

## 🧠 Business Context

### Context Summary

Estados que cuentan: `sent`, `viewed`, `responded`, `preferred`. Excluye `expired`/`cancelled`.

### Related Domain Concepts

* QR active count by category.

### Assumptions

* Validación al crear (US-049).

### Dependencies

* US-049.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-QUOTE-003                        |
| Use Case(s)            | UC-QUOTE-002                       |
| Business Rule(s)       | BR-QUOTE-005                       |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | QuoteRequest                       |
| API Endpoint(s)        | POST /api/v1/quote-requests        |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8.1 (#12)                    |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Configurable por usuario.

### Scope Notes

* Estricto 5.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: 5to envío exitoso

**Given** 4 QR activas en categoría
**When** se envía la 5ta
**Then** 201 OK.

### AC-02: 6to bloqueado

**Given** 5 activas
**When** se envía 6ta
**Then** 409 `QR_CATEGORY_LIMIT`.

---

## ⚠️ Edge Cases

### EC-01: Una se expira

**Given** 5 activas, una expira
**When** se intenta otra
**Then** 201 (cuenta libera slot).

#### Handling

* Conteo dinámico.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Active count ≤ 4 antes de crear | 409                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |

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
| Screen / Route      | Form de QR                              |
| Main UI Pattern     | Contador visible                        |
| Primary Action      | Enviar                                  |
| Secondary Actions   | Cancelar                                |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Banner con mensaje claro                |
| Success State       | Toast                                   |
| Accessibility Notes | Texto explícito                         |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Form QR
* Components:

  * `QRLimitBadge`
* State Management:

  * TanStack
* Forms:

  * Pre-check en frontend
* API Client:

  * `quotesApi.countActive`

### Backend

* Use Case / Service:

  * Embedded en `CreateQuoteRequestUseCase`
* Controller / Route:

  * `POST /api/v1/quote-requests`
* Authorization Policy:

  * Ownership
* Validation:

  * Conteo + check
* Transaction Required:

  * Sí (lock)

### Database

* Main Tables:

  * `quote_requests`
* Constraints:

  * Conteo lógico (no FK)
* Index Considerations:

  * Por (`event_id`, `category_id`, `status`)

### API

| Method | Endpoint                              | Purpose             |
| ------ | ------------------------------------- | ------------------- |
| POST   | `/api/v1/quote-requests`              | Crear con check     |

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
| TS-01 | Envía 5 sin error                  | Integration |
| TS-02 | 6ta bloqueada                      | Integration |
| TS-03 | Expiración libera slot             | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | 6ta con todas activas                 | 409                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 201/409         |

### Accessibility Tests

* Mensaje claro.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad del flujo                                    |
| Expected Impact     | Evita spam a vendors                                  |
| Success Criteria    | Límite enforced                                       |
| Academic Demo Value | Regla de negocio (#12)                                |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Contador.

### Potential Backend Tasks

* Conteo atómico.

### Potential Database Tasks

* Índice composite.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests concurrencia.

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

* Conteo con bloqueo optimista para concurrencia.

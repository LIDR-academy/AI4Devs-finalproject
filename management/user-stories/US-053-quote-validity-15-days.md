# 🧾 User Story: Vendor define valid_until (default 15 días)

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-053                               |
| Epic               | EPIC-QR-001                          |
| Feature            | Validez de Quote                     |
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
**I want** definir o aceptar `valid_until` (default 15 días) en mi Quote
**So that** establezca un plazo claro de respuesta para el organizador

---

## 🧠 Business Context

### Context Summary

Decisión PO 8.1 #4: validez default 15 días. El vendor puede acortar o extender según política.

### Related Domain Concepts

* Quote.valid_until.

### Assumptions

* Vendor decide en form.

### Dependencies

* US-052.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-QUOTE-008                        |
| Use Case(s)            | UC-QUOTE-005                       |
| Business Rule(s)       | BR-QUOTE-010                       |
| Permission Rule(s)     | Assignment                         |
| Data Entity / Entities | Quote                              |
| API Endpoint(s)        | Embedded en US-052                  |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8.1 (#4)                     |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Extensión post-envío sin contraparte.

### Scope Notes

* Sin auto-renovación.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Default 15 días

**Given** vendor no especifica `valid_until`
**When** envía
**Then** `valid_until = today + 15 días`.

### AC-02: Personalizado

**Given** vendor especifica `valid_until` futura
**When** envía
**Then** se acepta.

---

## ⚠️ Edge Cases

### EC-01: Fecha pasada

**Given** envía `valid_until < hoy`
**When** se valida
**Then** 400.

#### Handling

* Validación.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | valid_until > hoy               | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Assignment.                                                          |

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
| Screen / Route      | Form Quote                              |
| Main UI Pattern     | Date picker con default                  |
| Primary Action      | Enviar                                  |
| Secondary Actions   | "Usar default 15 días"                  |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Inline                                  |
| Success State       | Toast                                   |
| Accessibility Notes | Date picker accesible                    |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Form Quote
* Components:

  * `ValidUntilPicker`
* State Management:

  * RHF
* Forms:

  * Default 15d
* API Client:

  * Embedded

### Backend

* Use Case / Service:

  * Embebido en respond
* Controller / Route:

  * `POST /api/v1/vendor/quote-requests/:id/respond`
* Authorization Policy:

  * Assignment
* Validation:

  * Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `quotes`
* Constraints:

  * `valid_until > created_at`
* Index Considerations:

  * Por `valid_until`

### API

| Method | Endpoint                                            | Purpose             |
| ------ | --------------------------------------------------- | ------------------- |
| POST   | `/api/v1/vendor/quote-requests/:id/respond`         | Define valid_until  |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: No
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Default 15d aplicado              | Unit        |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Fecha pasada                          | 400                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Vendor target      | 201             |

### Accessibility Tests

* Date picker accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tiempo a decisión                                    |
| Expected Impact     | Plazos claros                                        |
| Success Criteria    | Default aplicado                                      |
| Academic Demo Value | Decisión PO #4 visible                                |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Date picker.

### Potential Backend Tasks

* Default lógica.

### Potential Database Tasks

* Constraint.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests unit.

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

* Confirmar máximo de validez (sugerido 90d).

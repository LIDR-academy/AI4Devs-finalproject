# 🧾 User Story: Disclaimer visible al confirmar BookingIntent

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-063                               |
| Epic               | EPIC-CMP-001                          |
| Feature            | Disclaimer legal/operativo            |
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

**As a** usuario que crea o confirma BookingIntent
**I want** ver un disclaimer claro de que el acuerdo final ocurre fuera de la plataforma
**So that** evitemos malentendidos sobre el rol de EventFlow

---

## 🧠 Business Context

### Context Summary

EventFlow es workspace, no marketplace transaccional. El disclaimer aclara responsabilidades.

### Related Domain Concepts

* Disclaimer UX.

### Assumptions

* Aprobación explícita exigida.

### Dependencies

* US-060, US-061.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BOOKING-005                      |
| Use Case(s)            | UC-BOOKING-001                     |
| Business Rule(s)       | BR-BOOKING-006                     |
| Permission Rule(s)     | Cross-role                         |
| Data Entity / Entities | BookingIntent                      |
| API Endpoint(s)        | Embedded                           |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/3                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Contratos digitales.

### Scope Notes

* Sólo texto.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Disclaimer en confirmación

**Given** flujo de create/confirm
**When** se muestra modal
**Then** el texto y el checkbox son obligatorios.

---

## ⚠️ Edge Cases

### EC-01: Sin checkbox

**Given** no aceptado
**When** intenta proceder
**Then** botón inhabilitado.

#### Handling

* UI lock.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Checkbox aceptado               | 400 si no                   |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Cross-role; no requiere auth especial.                               |

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
| Screen / Route      | Modales de create/confirm                |
| Main UI Pattern     | Disclaimer + checkbox                     |
| Primary Action      | Aceptar                                 |
| Secondary Actions   | Cancelar                                |
| Empty State         | No aplica                              |
| Loading State       | No aplica                              |
| Error State         | Texto rojo                              |
| Success State       | Continuar                                |
| Accessibility Notes | Texto + checkbox accesibles              |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Modales
* Components:

  * `BookingDisclaimer`
* State Management:

  * Local
* Forms:

  * Checkbox required
* API Client:

  * Embedded

### Backend

* Use Case / Service:

  * Validar `agreement_accepted` en DTO
* Controller / Route:

  * Embedded en US-060/US-061
* Authorization Policy:

  * N/A
* Validation:

  * Zod boolean true
* Transaction Required:

  * No

### Database

* Main Tables:

  * `booking_intents` (campo `agreement_accepted_at`)
* Constraints:

  * Not null en confirm
* Index Considerations:

  * No

### API

| Method | Endpoint                                          | Purpose             |
| ------ | ------------------------------------------------- | ------------------- |
| —      | Embedded                                          | Disclaimer payload  |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`disclaimer.accepted`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Modal con texto correcto          | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Sin checkbox                          | Botón disabled / 400     |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Cross-role          | Visible          |

### Accessibility Tests

* Modal accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Riesgo legal                                         |
| Expected Impact     | Mitigación                                           |
| Success Criteria    | Visible 100%                                          |
| Academic Demo Value | Cumplimiento de scope                                 |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Componente disclaimer.

### Potential Backend Tasks

* Validar agreement.

### Potential Database Tasks

* Campo `agreement_accepted_at`.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests UI.

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

* [ ] Visible y enforced.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Copy validado por legal.

# 🧾 User Story: Recibir aviso in-app de nueva QuoteRequest

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-068                               |
| Epic               | EPIC-NOT-001 — Notifications         |
| Feature            | Notif nueva QR                       |
| Module / Domain    | Notifications                        |
| User Role          | Vendor                               |
| Priority           | Should Have                          |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** proveedor
**I want** recibir notif in-app cuando un organizador envíe una nueva QuoteRequest
**So that** pueda responder oportunamente

---

## 🧠 Business Context

### Context Summary
Handler de evento `QuoteRequest.created` crea `Notification` para el vendor target + log email.

### Related Domain Concepts
* Notification, MockEmailService.

### Assumptions
* Vendor activo.

### Dependencies
* US-049.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-NOTIF-001                        |
| Use Case(s)            | UC-NOTIF-001                       |
| Business Rule(s)       | BR-NOTIF-001                       |
| Permission Rule(s)     | Recipient                          |
| Data Entity / Entities | Notification                       |
| API Endpoint(s)        | Sistema                            |
| NFR Reference(s)       | NFR-OBS-001                        |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope
* Scope Classification: In Scope
* MVP Relevance: Should Have

### Explicitly Out of Scope
* Push, SMS.

### Scope Notes
* In-app + email simulado.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Notif emitida
**Given** organizer envía QR
**When** handler ejecuta
**Then** notif creada + log email.

---

## ⚠️ Edge Cases

### EC-01: Vendor sin sesión
**Given** vendor offline
**When** se crea notif
**Then** se persiste; visible al login.

#### Handling
* Sin filtros.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Vendor user_id válido           | Skip si no                  |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sistema.                                                            |

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
| Screen / Route      | Vendor inbox                            |
| Main UI Pattern     | Campanita + lista                        |
| Primary Action      | Abrir QR                                |
| Secondary Actions   | Marcar leída                             |
| Empty State         | "Sin avisos"                            |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Lista                                   |
| Accessibility Notes | aria-live                                |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend
* Route / Page: Inbox
* Components: `NotificationsBell`
* State Management: TanStack
* Forms: No aplica
* API Client: `notificationsApi.list`

### Backend
* Use Case / Service: `OnQuoteRequestCreatedHandler`
* Controller / Route: Sistema
* Authorization Policy: System
* Validation: N/A
* Transaction Required: Sí

### Database
* Main Tables: `notifications`
* Constraints: FK user_id
* Index Considerations: Por user_id, read_at

### API

| Method | Endpoint                              | Purpose             |
| ------ | ------------------------------------- | ------------------- |
| —      | Sistema                                | Crear notification  |

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
| TS-01 | QR creada genera notif            | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Vendor user_id null                   | Skip                     |

### AI Tests
Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Vendor               | Lee sus notifs   |

### Accessibility Tests
* Inbox accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tasa de respuesta vendor                             |
| Expected Impact     | Reacción rápida                                       |
| Success Criteria    | 100% emisión                                          |
| Academic Demo Value | Notifs visibles                                       |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks
* Inbox UI.

### Potential Backend Tasks
* Handler eventos.

### Potential Database Tasks
* Notifications schema.

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

* [ ] Notif emitidas.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Copy alineado con i18n.

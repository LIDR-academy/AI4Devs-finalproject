# 🧾 User Story: Recibir aviso in-app de nueva Quote

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-069                               |
| Epic               | EPIC-NOT-001                          |
| Feature            | Notif nueva Quote                     |
| Module / Domain    | Notifications                        |
| User Role          | Organizer                            |
| Priority           | Should Have                          |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador
**I want** recibir notif in-app cuando un vendor envíe una nueva Quote
**So that** la revise y compare a tiempo

---

## 🧠 Business Context

### Context Summary
Handler `Quote.sent` → notif al organizer.

### Related Domain Concepts
* Notification.

### Assumptions
* Organizer activo.

### Dependencies
* US-052.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-NOTIF-002                        |
| Use Case(s)            | UC-NOTIF-001                       |
| Business Rule(s)       | BR-NOTIF-002                       |
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
**Given** vendor envía Quote
**When** handler ejecuta
**Then** notif creada + log email.

---

## ⚠️ Edge Cases

### EC-01: Multiples Quotes
**Given** múltiples vendors responden
**When** se crean
**Then** una notif por cada.

#### Handling
* No agrupar.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Organizer user_id válido         | Skip si no                  |

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
| Screen / Route      | Organizer inbox                          |
| Main UI Pattern     | Campanita + lista                        |
| Primary Action      | Abrir Quote                              |
| Secondary Actions   | Marcar leída                             |
| Empty State         | Sin avisos                               |
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
* Use Case / Service: `OnQuoteSentHandler`
* Controller / Route: Sistema
* Authorization Policy: System
* Validation: N/A
* Transaction Required: Sí

### Database
* Main Tables: `notifications`
* Constraints: FK
* Index Considerations: user_id

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
| TS-01 | Quote.sent dispara notif          | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Organizer null                        | Skip                     |

### AI Tests
Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Organizer            | Lee sus notifs   |

### Accessibility Tests
* Accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tiempo a decisión                                    |
| Expected Impact     | Reacción rápida                                       |
| Success Criteria    | 100% emisión                                          |
| Academic Demo Value | Notifs visibles                                       |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks
* Inbox.

### Potential Backend Tasks
* Handler.

### Potential Database Tasks
* Notifications.

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

* [ ] Notifs.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes
* Copy con i18n.

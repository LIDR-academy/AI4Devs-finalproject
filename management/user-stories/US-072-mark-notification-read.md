# 🧾 User Story: Marcar notificación como leída

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-072                               |
| Epic               | EPIC-NOT-001                          |
| Feature            | Mark as read                         |
| Module / Domain    | Notifications                        |
| User Role          | Organizer / Vendor                   |
| Priority           | Should Have                          |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** usuario con notifs
**I want** marcar una notif como leída individual o en bloque
**So that** mi inbox quede limpio

---

## 🧠 Business Context

### Context Summary
Actualiza `read_at`. Soporta bulk.

### Related Domain Concepts
* read_at.

### Assumptions
* Idempotente.

### Dependencies
* US-068..US-071.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-NOTIF-006                        |
| Use Case(s)            | UC-NOTIF-002                       |
| Business Rule(s)       | BR-NOTIF-006                       |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | Notification                       |
| API Endpoint(s)        | POST /api/v1/notifications/:id/read |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope
* Scope Classification: In Scope
* MVP Relevance: Should Have

### Explicitly Out of Scope
* Categorías.

### Scope Notes
* Simple.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Mark single
**Given** notif no leída
**When** mark
**Then** `read_at` poblado.

### AC-02: Mark all
**Given** varias
**When** mark all
**Then** todas read.

---

## ⚠️ Edge Cases

### EC-01: Ya leída
**Given** read_at no null
**When** mark
**Then** idempotente.

#### Handling
* Sin error.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Sesión                          | 401                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |

### Negative Authorization Scenarios
* Otro user → 403.

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
| Screen / Route      | Dropdown notifs                          |
| Main UI Pattern     | Botón / chip                             |
| Primary Action      | Mark read                                |
| Secondary Actions   | Mark all                                 |
| Empty State         | No aplica                              |
| Loading State       | Spinner inline                           |
| Error State         | Toast                                   |
| Success State       | Cambio visual                            |
| Accessibility Notes | Botón con label                          |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend
* Route / Page: Dropdown
* Components: `NotificationItem`
* State Management: TanStack optimistic
* Forms: No aplica
* API Client: `notificationsApi.markRead`

### Backend
* Use Case / Service: `MarkNotificationsReadUseCase`
* Controller / Route: `POST /api/v1/notifications/:id/read` y `/read-all`
* Authorization Policy: Ownership
* Validation: UUID
* Transaction Required: No

### Database
* Main Tables: `notifications`
* Constraints: Owner
* Index Considerations: read_at

### API

| Method | Endpoint                                    | Purpose          |
| ------ | ------------------------------------------- | ---------------- |
| POST   | `/api/v1/notifications/:id/read`             | Mark single      |
| POST   | `/api/v1/notifications/read-all`             | Mark all         |

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
| TS-01 | Mark single                        | Integration |
| TS-02 | Mark all                            | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Otro user                             | 403                      |

### AI Tests
Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño               | 200             |

### Accessibility Tests
* Botón accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | UX                                                    |
| Expected Impact     | Higiene                                              |
| Success Criteria    | Optimistic                                            |
| Academic Demo Value | UI                                                    |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks
* Optimistic UI.

### Potential Backend Tasks
* Endpoint.

### Potential Database Tasks
* Not applicable for this story.

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
* Optimistic update.

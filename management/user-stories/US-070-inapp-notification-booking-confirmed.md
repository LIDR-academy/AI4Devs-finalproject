# 🧾 User Story: Recibir aviso in-app de Booking confirmado

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-070                               |
| Epic               | EPIC-NOT-001                          |
| Feature            | Notif Booking confirmado              |
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

**As an** organizador o proveedor
**I want** recibir notif cuando un BookingIntent sea confirmed
**So that** sepa que se cerró la intención

---

## 🧠 Business Context

### Context Summary
Handler `BookingIntent.confirmed` → notif a ambas partes.

### Related Domain Concepts
* Notification.

### Assumptions
* Notif a ambas partes.

### Dependencies
* US-061.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-NOTIF-004                        |
| Use Case(s)            | UC-NOTIF-001                       |
| Business Rule(s)       | BR-NOTIF-004                       |
| Permission Rule(s)     | Recipients                         |
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

### AC-01: Notif a ambas partes
**Given** booking confirmed
**When** handler ejecuta
**Then** notif a organizer y vendor.

---

## ⚠️ Edge Cases

### EC-01: Self-notification
**Given** organizer = vendor (imposible MVP single-role)
**When** N/A
**Then** N/A.

#### Handling
* N/A.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Recipients válidos              | Skip si no                  |

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
| Screen / Route      | Inbox                                   |
| Main UI Pattern     | Campanita + lista                        |
| Primary Action      | Abrir BookingIntent                      |
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
* Use Case / Service: `OnBookingConfirmedHandler`
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
| TS-01 | Confirm dispara notifs            | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Recipients null                       | Skip                     |

### AI Tests
Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Recipient            | 200             |

### Accessibility Tests
* Accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Confianza                                            |
| Expected Impact     | Información oportuna                                  |
| Success Criteria    | 100% emisión                                          |
| Academic Demo Value | Cierre demo                                           |

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
* Copy i18n.

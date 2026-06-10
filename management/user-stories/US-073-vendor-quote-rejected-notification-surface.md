# 🧾 User Story: Vendor recibe aviso UI de Quote rechazada/expirada

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-073                               |
| Epic               | EPIC-NOT-001                          |
| Feature            | Surface UI de US-054                  |
| Module / Domain    | Notifications                        |
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
**I want** ver claramente las notifs de rechazos/expiraciones de mis Quotes en mi inbox
**So that** sepa el resultado de mi propuesta

---

## 🧠 Business Context

### Context Summary
Surface UI consume notifs emitidas por US-054.

### Related Domain Concepts
* Notification UI.

### Assumptions
* Notifs ya emitidas.

### Dependencies
* US-054.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-NOTIF-003                        |
| Use Case(s)            | UC-NOTIF-002                       |
| Business Rule(s)       | BR-NOTIF-003                       |
| Permission Rule(s)     | Owner                              |
| Data Entity / Entities | Notification                       |
| API Endpoint(s)        | GET /api/v1/notifications          |
| NFR Reference(s)       | —                                  |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope
* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope
* Push, SMS.

### Scope Notes
* In-app + email simulado.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Visible en inbox
**Given** notif emitida
**When** vendor abre inbox
**Then** ve item.

---

## ⚠️ Edge Cases

### EC-01: Bulk de rechazos
**Given** muchos rechazos en batch
**When** llegan
**Then** ve N items con paginación.

#### Handling
* Sin agrupar.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Sesión vendor                    | 401                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Owner.                                                              |

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
| Screen / Route      | Vendor inbox                            |
| Main UI Pattern     | Item rojo/amarillo según rejected/expired |
| Primary Action      | Abrir QR/Quote                           |
| Secondary Actions   | Marcar leída                             |
| Empty State         | "Sin avisos"                            |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Lista                                   |
| Accessibility Notes | Color + texto                            |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend
* Route / Page: Vendor inbox
* Components: `NotificationItem` con variant
* State Management: TanStack
* Forms: No aplica
* API Client: `notificationsApi.list`

### Backend
* Use Case / Service: Compartido con US-071
* Controller / Route: `GET /api/v1/notifications`
* Authorization Policy: Owner
* Validation: Query
* Transaction Required: No

### Database
* Main Tables: `notifications`
* Constraints: Por user
* Index Considerations: user_id, type

### API

| Method | Endpoint                          | Purpose             |
| ------ | --------------------------------- | ------------------- |
| GET    | `/api/v1/notifications`           | Listar              |

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
| TS-01 | Lista con variant correcto         | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Otro user                             | 403                      |

### AI Tests
Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Vendor               | 200             |

### Accessibility Tests
* Texto + color.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Confianza                                            |
| Expected Impact     | Resultados claros                                     |
| Success Criteria    | UI clara                                              |
| Academic Demo Value | Cierre flujo vendor                                   |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks
* Variant item.

### Potential Backend Tasks
* Reuso endpoint.

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
* Copy en i18n.

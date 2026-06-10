# 🧾 User Story: Recibir aviso in-app de T-7 (vista organizer)

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-071                               |
| Epic               | EPIC-NOT-001                          |
| Feature            | Recepción T-7 organizer               |
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
**I want** ver y abrir notifs T-7 generadas por US-034
**So that** acceda fácil al checklist desde la campanita

---

## 🧠 Business Context

### Context Summary
Surface UI de notifs T-7. Job en US-034.

### Related Domain Concepts
* Notification surface.

### Assumptions
* Notifs ya emitidas.

### Dependencies
* US-034.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-NOTIF-005                        |
| Use Case(s)            | UC-NOTIF-001                       |
| Business Rule(s)       | BR-NOTIF-005                       |
| Permission Rule(s)     | Recipient                          |
| Data Entity / Entities | Notification                       |
| API Endpoint(s)        | GET /api/v1/notifications          |
| NFR Reference(s)       | NFR-OBS-001                        |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope
* Scope Classification: In Scope
* MVP Relevance: Should Have

### Explicitly Out of Scope
* Push.

### Scope Notes
* Sólo surface UI.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Lista de notifs
**Given** organizer con notifs
**When** abre campanita
**Then** ve lista paginada con T-7 en top.

### AC-02: Click abre checklist
**Given** notif T-7
**When** click
**Then** redirige a checklist filtrado 7d.

---

## ⚠️ Edge Cases

### EC-01: Sin notifs
**Given** sin notifs
**When** abre
**Then** "Sin avisos".

#### Handling
* Empty state.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Sesión activa                   | 401                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sólo notifs del usuario.                                             |

### Negative Authorization Scenarios
* Otro user → 403 al detalle.

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
| Screen / Route      | Header                                  |
| Main UI Pattern     | Campanita + dropdown                      |
| Primary Action      | Abrir checklist                          |
| Secondary Actions   | Marcar leída                             |
| Empty State         | Vacío                                    |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Lista                                   |
| Accessibility Notes | Dropdown accesible                       |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend
* Route / Page: Header
* Components: `NotificationsBell`
* State Management: TanStack
* Forms: No aplica
* API Client: `notificationsApi.list`

### Backend
* Use Case / Service: `ListNotificationsUseCase`
* Controller / Route: `GET /api/v1/notifications`
* Authorization Policy: Owner
* Validation: Query
* Transaction Required: No

### Database
* Main Tables: `notifications`
* Constraints: Owner
* Index Considerations: user_id

### API

| Method | Endpoint                          | Purpose             |
| ------ | --------------------------------- | ------------------- |
| GET    | `/api/v1/notifications`           | Listar mis notifs    |

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
| TS-01 | Lista notifs                       | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Otro user                             | 403 al detalle           |

### AI Tests
Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Usuario propio      | 200             |

### Accessibility Tests
* Dropdown.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Engagement                                           |
| Expected Impact     | Recordatorio útil                                    |
| Success Criteria    | Carga < 500ms                                        |
| Academic Demo Value | UI                                                    |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks
* Dropdown.

### Potential Backend Tasks
* Endpoint list.

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

* [ ] Surface funcional.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes
* Cache TanStack.

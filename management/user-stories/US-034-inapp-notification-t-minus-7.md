# 🧾 User Story: Recibir notificación in-app de T-7

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-034                               |
| Epic               | EPIC-TASK-001                        |
| Feature            | Notificación T-7                     |
| Module / Domain    | Tasks / Notifications                |
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
**I want** recibir notificaciones in-app de tareas con vencimiento en 7 días
**So that** no pierda de vista lo que está por vencer

---

## 🧠 Business Context

### Context Summary

Un job diario evalúa tareas con `due_date == today + 7` y emite `Notification` in-app + log de email simulado.

### Related Domain Concepts

* Notification.
* Job programado.

### Assumptions

* MockEmailService simula envío.

### Dependencies

* EPIC-NOT-001.
* EPIC-OBS-001 (logs).

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-TASK-011, FR-NOTIF-004           |
| Use Case(s)            | UC-TASK-007, UC-NOTIF-001           |
| Business Rule(s)       | BR-TASK-008, BR-NOTIF-004           |
| Permission Rule(s)     | Sistema → usuario dueño            |
| Data Entity / Entities | EventTask, Notification            |
| API Endpoint(s)        | No aplica (job)                    |
| NFR Reference(s)       | NFR-OBS-001                        |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Should Have

### Explicitly Out of Scope

* Push, SMS, WhatsApp.

### Scope Notes

* Sólo in-app + email simulado.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Notificación emitida

**Given** tareas con `due_date == today + 7`
**When** corre el job
**Then** se crean `Notification` y log de email simulado.

### AC-02: Visualización in-app

**Given** notificación creada
**When** el usuario abre la campanita
**Then** ve la notificación.

---

## ⚠️ Edge Cases

### EC-01: Tarea ya done

**Given** tarea `done` o `skipped`
**When** el job evalúa
**Then** se omite.

#### Handling

* Filtro de estado.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Tarea activa con `due_date+7`   | Selección                   |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sistema; notificación al dueño.                                      |
| SEC-02 | Log no expone PII.                                                   |

### Negative Authorization Scenarios

* No aplica.

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

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | Header con badge                                        |
| Main UI Pattern     | Campanita + lista                                       |
| Primary Action      | "Marcar leída"                                         |
| Secondary Actions   | "Abrir tarea"                                          |
| Empty State         | "Sin notificaciones"                                   |
| Loading State       | Skeleton                                                |
| Error State         | Toast                                                   |
| Success State       | Notificaciones visibles                                 |
| Accessibility Notes | aria-live polite                                        |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Header / drawer
* Components:

  * `NotificationsBell`, `NotificationList`
* State Management:

  * TanStack `useNotifications`
* Forms:

  * No aplica
* API Client:

  * `notificationsApi.list/markRead`

### Backend

* Use Case / Service:

  * `EmitT7NotificationsJob`
* Controller / Route:

  * Scheduler
* Authorization Policy:

  * System
* Validation:

  * Filtro SQL
* Transaction Required:

  * Por batch

### Database

* Main Tables:

  * `notifications`, `event_tasks`
* Constraints:

  * FK user_id, task_id
* Index Considerations:

  * Por `user_id`, `read_at`

### API

| Method | Endpoint                              | Purpose                       |
| ------ | ------------------------------------- | ----------------------------- |
| —      | Job programado                        | Emitir notifications T-7      |
| GET    | `/api/v1/notifications`               | Listar para usuario           |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`job.t7Notifications.affected=N`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Emisión correcta T-7              | Integration |
| TS-02 | Visualización en UI                | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Tarea done                            | Ignorada                 |
| NT-02 | Tarea fuera de rango                  | Ignorada                 |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario              | Expected Result |
| ---------- | --------------------- | --------------- |
| AUTH-TS-01 | Sistema crea notif    | Success         |
| AUTH-TS-02 | Usuario lee propias    | 200             |

### Accessibility Tests

* aria-live polite.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Engagement, retención semanal                        |
| Expected Impact     | Recordatorio oportuno                                |
| Success Criteria    | 100% notif T-7 emitidas en < 1h del job              |
| Academic Demo Value | Demuestra automatización útil                         |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Campanita y lista.

### Potential Backend Tasks

* Job + emisión.

### Potential Database Tasks

* Migración `notifications`.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests con clock injectable.

### Potential DevOps / Config Tasks

* Configurar scheduler.

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

* [ ] Job funcional.
* [ ] Notif visibles.
* [ ] Tests con clock injectable.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar horario del job (sugerido 08:00 hora local del evento o UTC).

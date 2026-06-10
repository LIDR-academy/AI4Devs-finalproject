# 🧾 User Story: Notificar al vendor cuando su Quote es rechazada/expirada

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-054                               |
| Epic               | EPIC-QR-001                          |
| Feature            | Notificaciones de rechazo / expiración |
| Module / Domain    | Quotes / Notifications               |
| User Role          | Vendor / System                      |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** proveedor
**I want** recibir notificación in-app cuando mi Quote sea rechazada o expirada
**So that** sepa el resultado del proceso (Decisión PO 8.1 #13)

---

## 🧠 Business Context

### Context Summary

Eventos del sistema disparan `Notification` al vendor cuando `Quote.status` cambia a `rejected` o `expired`.

### Related Domain Concepts

* Notification.
* Domain events.

### Assumptions

* Email simulado paralelo.

### Dependencies

* EPIC-NOT-001.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-NOTIF-003                        |
| Use Case(s)            | UC-NOTIF-002                       |
| Business Rule(s)       | BR-NOTIF-003                       |
| Permission Rule(s)     | Vendor recibe sus propias notifs   |
| Data Entity / Entities | Notification                       |
| API Endpoint(s)        | Sistema                            |
| NFR Reference(s)       | NFR-OBS-001                        |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8.1 (#13)                    |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* SMS, WhatsApp.

### Scope Notes

* In-app + email simulado.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Rechazo

**Given** organizer rechaza Quote
**When** se persiste
**Then** se crea Notification al vendor + log email.

### AC-02: Expiración

**Given** Quote expira por job
**When** ejecuta
**Then** notification + log.

---

## ⚠️ Edge Cases

### EC-01: Vendor inactivo

**Given** vendor suspendido
**When** notification se crea
**Then** se persiste igual; visible cuando reactive.

#### Handling

* Sin filtros.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Vendor user_id válido           | Si no, omitir               |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sistema; recipient es el vendor.                                     |

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

| Area                | Notes                                  |
| ------------------- | -------------------------------------- |
| Screen / Route      | Vendor inbox                            |
| Main UI Pattern     | Lista de notifs                          |
| Primary Action      | Abrir notif                              |
| Secondary Actions   | Marcar leída                             |
| Empty State         | No aplica                              |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Notif visible                            |
| Accessibility Notes | aria-live                                |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | Locale vendor                            |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Inbox
* Components:

  * `NotificationItem`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `notificationsApi.list`

### Backend

* Use Case / Service:

  * Handler eventos Quote.rejected/expired
* Controller / Route:

  * Sistema
* Authorization Policy:

  * System
* Validation:

  * Datos del evento
* Transaction Required:

  * Sí (atomic con cambio de status)

### Database

* Main Tables:

  * `notifications`
* Constraints:

  * FK user_id
* Index Considerations:

  * Por user_id, read_at

### API

| Method | Endpoint                          | Purpose             |
| ------ | --------------------------------- | ------------------- |
| —      | Sistema (handler)                  | Crear notification  |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (email simulado)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Reject genera notif               | Integration |
| TS-02 | Expire genera notif                | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Vendor sin user_id                    | Omitir                   |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                  | Expected Result |
| ---------- | ------------------------- | --------------- |
| AUTH-TS-01 | Vendor accede a sus notif | 200             |
| AUTH-TS-02 | Otro vendor               | No ve           |

### Accessibility Tests

* Inbox accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Engagement vendor                                    |
| Expected Impact     | Confianza en resultados                              |
| Success Criteria    | 100% emisión                                          |
| Academic Demo Value | Decisión PO #13 visible                               |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Inbox.

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

* [ ] Notifs emitidas.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar copy de mensajes.

# 🧾 User Story: Admin ve mi evento en solo lectura (auditado)

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-016                               |
| Epic               | EPIC-EVT-001 — Organizer Event Management |
| Feature            | Vista admin solo lectura del evento  |
| Module / Domain    | Events / Admin                       |
| User Role          | Admin                                |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** administrador autenticado
**I want** consultar un evento de un organizador en modo solo lectura, dejando rastro auditable
**So that** pueda apoyar moderación y soporte sin alterar los datos

---

## 🧠 Business Context

### Context Summary

El admin tiene acceso de sólo lectura a eventos para soporte/moderación. Cada acceso queda registrado en `AdminAction` como `view_event` (Decisión PO 8.1 #16). Esto evita que el admin opere el evento por cuenta propia y mantiene auditabilidad.

### Related Domain Concepts

* AdminAction (`view_event`).
* Read-only access para Admin.

### Assumptions

* El listado admin se cubre en EPIC-ADM-001 (US-078).
* Esta historia sólo cubre la vista detallada de UN evento por admin.

### Dependencies

* EPIC-AUTH-001 (rol admin).
* EPIC-ADM-001 (AdminAction).

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-ADMIN-005, FR-EVENT-014                |
| Use Case(s)            | UC-EVENT-008, UC-ADMIN-002               |
| Business Rule(s)       | BR-ADMIN-005, BR-EVENT-014               |
| Permission Rule(s)     | Admin only; read-only                    |
| Data Entity / Entities | Event, AdminAction                       |
| API Endpoint(s)        | GET /api/v1/admin/events/:id             |
| NFR Reference(s)       | NFR-OBS-001                              |
| Related ADR(s)         | ADR-SEC-002                              |
| Related Document(s)    | /docs/8.1 (#16)                          |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Edición por admin.
* Suplantación de identidad.

### Scope Notes

* No introduce escritura admin.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Lectura admin con auditoría

**Given** admin autenticado
**When** abre el detalle de un evento por ID
**Then** se devuelve la vista read-only y se registra `AdminAction(action='view_event', target_event_id, actor_user_id, timestamp)`.

### AC-02: Acciones de escritura bloqueadas

**Given** admin viendo el evento
**When** intenta PATCH/DELETE/cancel
**Then** 403 `FORBIDDEN`.

---

## ⚠️ Edge Cases

### EC-01: Evento eliminado (soft delete)

**Given** evento con `deleted_at`
**When** admin abre por ID
**Then** ve banner "Eliminado" y datos básicos (no se permite restaurar en MVP).

#### Handling

* UI bloquea acciones.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | `eventId` UUID válido           | 400 si no                   |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sólo rol Admin.                                                     |
| SEC-02 | Operaciones de escritura bloqueadas.                                |
| SEC-03 | Registrar `AdminAction(view_event)` por cada lectura.                |

### Negative Authorization Scenarios

* Organizer/Vendor → 403.
* Anónimo → 401.
* Intento de PATCH admin → 403.

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
| Screen / Route      | `/[locale]/admin/events/:id`                           |
| Main UI Pattern     | Vista read-only con badge "Modo lectura"               |
| Primary Action      | No aplica                                              |
| Secondary Actions   | "Volver al listado"                                    |
| Empty State         | No aplica                                              |
| Loading State       | Skeleton                                               |
| Error State         | Banner                                                 |
| Success State       | Vista cargada                                          |
| Accessibility Notes | Marcar inputs como readonly + aria                     |
| Responsive Notes    | Mobile-first                                           |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | Moneda del evento (read-only)                          |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/admin/events/:id`
* Components:

  * `AdminEventViewer`
* State Management:

  * TanStack `useAdminEvent`
* Forms:

  * No aplica
* API Client:

  * `adminApi.getEvent(id)`

### Backend

* Use Case / Service:

  * `AdminViewEventUseCase` (registra AdminAction)
* Controller / Route:

  * `GET /api/v1/admin/events/:id`
* Authorization Policy:

  * Admin
* Validation:

  * UUID
* Transaction Required:

  * Sí (lectura + insert AdminAction)

### Database

* Main Tables:

  * `events`, `admin_actions`
* Constraints:

  * AdminAction append-only
* Index Considerations:

  * Índice por `actor_user_id` y `target_event_id`

### API

| Method | Endpoint                              | Purpose                  |
| ------ | ------------------------------------- | ------------------------ |
| GET    | `/api/v1/admin/events/:id`            | Ver evento (read-only)   |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: Yes (`view_event`)
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                              | Type        |
| ----- | ----------------------------------------------------- | ----------- |
| TS-01 | Admin lee evento y se registra `view_event`           | Integration |
| TS-02 | Intentos de escritura admin son rechazados            | API         |
| TS-03 | E2E con seed                                          | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Organizer abre /admin/events          | 403                      |
| NT-02 | Vendor abre /admin/events             | 403                      |
| NT-03 | Admin intenta PATCH                   | 403                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Admin              | 200 + AdminAction |
| AUTH-TS-02 | Organizer          | 403             |
| AUTH-TS-03 | Anónimo            | 401             |

### Accessibility Tests

* Etiquetas readonly accesibles.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Auditabilidad, trazabilidad de soporte               |
| Expected Impact     | Permite soporte sin compromiso de privacidad         |
| Success Criteria    | 100% de lecturas admin registradas en AdminAction    |
| Academic Demo Value | Demuestra gobierno y trazabilidad                    |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Vista admin read-only.
* Banner "Modo lectura".

### Potential Backend Tasks

* Use case con AdminAction.
* Validación de rol.

### Potential Database Tasks

* Índices AdminAction.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests positivos/negativos.

### Potential DevOps / Config Tasks

* Not applicable for this story.

---

## ✅ Definition of Ready

* [x] Rol claro (Admin).
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

* [ ] Endpoint operativo con AdminAction.
* [ ] Vista read-only enforced.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar si la lectura genera notificación al organizador (no recomendado para MVP).

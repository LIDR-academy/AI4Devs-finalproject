# 🧾 User Story: El sistema cierra automáticamente mi evento 2 días después de la fecha

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-015                               |
| Epic               | EPIC-EVT-001 — Organizer Event Management |
| Feature            | Auto-completion job                  |
| Module / Domain    | Events                               |
| User Role          | System                               |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As the** sistema EventFlow
**I want** cerrar automáticamente eventos `active` 2 días después de su `event_date`
**So that** los eventos pasen a estado `completed` (con `auto_completed=true`) y se habiliten las reseñas verificadas

---

## 🧠 Business Context

### Context Summary

El cierre automático (Decisión PO 8.1 #6) garantiza que los eventos pasados se marquen como completados, habilitando reseñas verificadas y métricas precisas. Es un job programado (e.g., diario a las 00:30 UTC) con clock injectable para pruebas.

### Related Domain Concepts

* Job programado.
* Clock injectable.
* `auto_completed=true`.

### Assumptions

* `event_date` está en formato `date` (no timestamp).
* La regla son 2 días calendario completos.

### Dependencies

* EPIC-BE-001 (jobs framework).
* US-009 (eventos creados).

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-EVENT-005, FR-EVENT-014                |
| Use Case(s)            | UC-EVENT-007                             |
| Business Rule(s)       | BR-EVENT-007                             |
| Permission Rule(s)     | Sistema (job)                            |
| Data Entity / Entities | Event                                    |
| API Endpoint(s)        | No aplica (job interno)                  |
| NFR Reference(s)       | NFR-OBS-001                              |
| Related ADR(s)         | ADR-BE-00n                               |
| Related Document(s)    | /docs/8.1 (#6)                           |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Notificación al organizador.
* Reactivación tras auto-complete.

### Scope Notes

* No introduce notifications adicionales (cubierto por EPIC-NOT-001 si aplica).
* No introduce conversión de evento a otro tipo.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Cierre automático

**Given** eventos `active` con `event_date <= now() - 2 días`
**When** corre el job `AutoCompleteEventsJob`
**Then** cada evento pasa a `completed` con `auto_completed=true` y log estructurado.

### AC-02: Idempotencia

**Given** el job corre dos veces el mismo día
**When** se procesan eventos ya completados
**Then** no se cambian de estado ni se duplican logs.

---

## ⚠️ Edge Cases

### EC-01: Evento cancelled

**Given** evento `cancelled`
**When** el job corre
**Then** se ignora.

#### Handling

* Filtro WHERE `status='active'`.

---

### EC-02: Clock injectable en tests

**Given** test con clock controlado
**When** el job corre con fecha simulada
**Then** completa correctamente sin depender del reloj real.

#### Handling

* Inyectar Clock.

---

## 🚫 Validation Rules

| ID    | Rule                                | Message / Behavior          |
| ----- | ----------------------------------- | --------------------------- |
| VR-01 | `event_date <= now() - INTERVAL 2 DAY` | Selecciona evento     |
| VR-02 | `status='active'`                   | Sólo activos                |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Job ejecutado por sistema; sin sesión.                              |
| SEC-02 | Log estructurado con `correlationId` por ejecución.                  |

### Negative Authorization Scenarios

* No aplica (sin usuario).

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
| Screen / Route      | No aplica (job)                                        |
| Main UI Pattern     | El badge "Completed" aparece en dashboard               |
| Primary Action      | No aplica                                              |
| Secondary Actions   | No aplica                                              |
| Empty State         | No aplica                                              |
| Loading State       | No aplica                                              |
| Error State         | No aplica                                              |
| Success State       | Badge "Completed" visible                              |
| Accessibility Notes | No aplica                                              |
| Responsive Notes    | No aplica                                              |
| i18n Notes          | Badge se traduce                                       |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * No aplica
* Components:

  * `EventStatusBadge`
* State Management:

  * Refresh tras polling
* Forms:

  * No aplica
* API Client:

  * No aplica

### Backend

* Use Case / Service:

  * `AutoCompleteEventsJob`
* Controller / Route:

  * Scheduler (node-cron o similar)
* Authorization Policy:

  * System
* Validation:

  * Filtros SQL
* Transaction Required:

  * Sí por batch o por evento

### Database

* Main Tables:

  * `events`
* Constraints:

  * Estado válido `completed`
* Index Considerations:

  * Índice por (`status`, `event_date`)

### API

| Method | Endpoint                          | Purpose          |
| ------ | --------------------------------- | ---------------- |
| —      | Job programado                    | Auto completion  |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`job.autoComplete.start/end/affected=N`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                              | Type        |
| ----- | ----------------------------------------------------- | ----------- |
| TS-01 | Job completa eventos atrasados                        | Integration |
| TS-02 | Idempotencia                                          | Integration |
| TS-03 | Clock injectable                                      | Unit        |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Evento cancelled                      | Ignorado                 |
| NT-02 | Evento futuro                         | Ignorado                 |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Sistema ejecuta job | Success         |

### Accessibility Tests

* No aplica.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Reseñas verificadas, métricas operativas             |
| Expected Impact     | Cierre limpio sin intervención manual                |
| Success Criteria    | 100% de eventos elegibles se cierran en < 24h        |
| Academic Demo Value | Demuestra automatización con clock injectable        |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Badge "Auto completed" en dashboard.

### Potential Backend Tasks

* Job + scheduler.
* Clock injectable.

### Potential Database Tasks

* Índice por status/event_date.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests con clock injectable.

### Potential DevOps / Config Tasks

* Configurar scheduler / cron.

---

## ✅ Definition of Ready

* [x] Rol claro (System).
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
* [x] API definida (job).
* [x] Tests definidos.
* [ ] PO/BA validó.

---

## 🏁 Definition of Done

* [ ] Job operativo.
* [ ] Logs estructurados.
* [ ] Tests con clock injectable.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar horario UTC del job (sugerido 00:30 UTC).

# 🧾 User Story: Eliminar mi evento en estado draft (soft delete)

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-012                               |
| Epic               | EPIC-EVT-001 — Organizer Event Management |
| Feature            | Soft delete de evento draft           |
| Module / Domain    | Events                               |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador autenticado dueño de un evento en `draft`
**I want** eliminar (soft delete) ese evento que no llegué a publicar/activar
**So that** no aparezca en mi listado ni interfiera con métricas y mi workspace quede limpio

---

## 🧠 Business Context

### Context Summary

Permitir eliminar eventos en `draft` reduce ruido. Es soft delete (no físico) para preservar trazabilidad y métricas administrativas. Para `active` y posteriores, se usa cancel (US-011).

### Related Domain Concepts

* Event lifecycle.
* Soft delete (campo `deleted_at`).

### Assumptions

* La eliminación es reversible sólo por admin (no requerida en MVP).
* No requiere confirmación adicional más allá de un modal.

### Dependencies

* US-009 (creación).
* EPIC-DB-001 (soft delete).

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-EVENT-011                             |
| Use Case(s)            | UC-EVENT-004                             |
| Business Rule(s)       | BR-EVENT-012                             |
| Permission Rule(s)     | Ownership; sólo eventos `draft`           |
| Data Entity / Entities | Event                                    |
| API Endpoint(s)        | DELETE /api/v1/events/:id                |
| NFR Reference(s)       | NFR-PERF-API-001                         |
| Related ADR(s)         | ADR-BE-00n                               |
| Related Document(s)    | /docs/6                                  |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Hard delete físico.
* Eliminación de eventos no `draft`.

### Scope Notes

* No introduce papelera de reciclaje.
* No introduce restauración self-service.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Soft delete exitoso

**Given** un evento `draft` propio
**When** confirma eliminación
**Then** el backend marca `deleted_at`, lo excluye de listados y responde 204.

### AC-02: Listado excluye eliminados

**Given** eventos del organizador con algunos eliminados
**When** lista sus eventos
**Then** no aparecen los `deleted_at != null`.

---

## ⚠️ Edge Cases

### EC-01: Evento no en `draft`

**Given** un evento `active`
**When** intenta DELETE
**Then** 409 `INVALID_STATE`.

#### Handling

* Sugerir usar Cancel (US-011).

---

### EC-02: Eliminación de evento ajeno

**Given** otro organizador
**When** intenta DELETE
**Then** 403/404.

#### Handling

* Ownership policy.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior            |
| ----- | ------------------------------- | ----------------------------- |
| VR-01 | Sólo eventos `draft`            | "Sólo se pueden eliminar borradores" |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership policy.                                                   |
| SEC-02 | Soft delete (no físico).                                            |
| SEC-03 | Log estructurado `event.deleted`.                                    |

### Negative Authorization Scenarios

* Otro usuario → 403/404.
* Admin → 403 (no es su responsabilidad).

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

| Area                | Notes                                              |
| ------------------- | -------------------------------------------------- |
| Screen / Route      | `/[locale]/organizer/events`                       |
| Main UI Pattern     | Botón "Eliminar" + modal de confirmación           |
| Primary Action      | "Eliminar borrador"                                |
| Secondary Actions   | Cancelar                                           |
| Empty State         | No aplica                                          |
| Loading State       | Spinner                                            |
| Error State         | Toast                                              |
| Success State       | Toast + actualización de lista                     |
| Accessibility Notes | Modal accesible                                    |
| Responsive Notes    | Mobile-first                                       |
| i18n Notes          | 4 locales                                          |
| Currency Notes      | No aplica                                          |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events`
* Components:

  * `DeleteDraftDialog`
* State Management:

  * TanStack mutation `useDeleteEvent`
* Forms:

  * Confirmación
* API Client:

  * `eventsApi.remove(id)`

### Backend

* Use Case / Service:

  * `SoftDeleteEventUseCase`
* Controller / Route:

  * `DELETE /api/v1/events/:id`
* Authorization Policy:

  * Ownership; status draft
* Validation:

  * Estado
* Transaction Required:

  * No

### Database

* Main Tables:

  * `events`
* Constraints:

  * `deleted_at` nullable
* Index Considerations:

  * Índice parcial `WHERE deleted_at IS NULL`

### API

| Method | Endpoint                          | Purpose                |
| ------ | --------------------------------- | ---------------------- |
| DELETE | `/api/v1/events/:id`              | Soft delete del evento |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`event.deleted`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                  | Type        |
| ----- | ----------------------------------------- | ----------- |
| TS-01 | Soft delete en draft                      | Integration |
| TS-02 | Lista no incluye eliminados                | API         |
| TS-03 | E2E con modal                              | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Evento en active                      | 409                      |
| NT-02 | Otro organizador                      | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result |
| ---------- | --------------------------------- | --------------- |
| AUTH-TS-01 | Dueño                             | 204             |
| AUTH-TS-02 | Otro                              | 403/404         |

### Accessibility Tests

* Modal accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad de datos, limpieza de workspace               |
| Expected Impact     | UX más clara para organizadores                       |
| Success Criteria    | Lista sólo muestra activos no eliminados              |
| Academic Demo Value | Demuestra soft delete y reglas de estado             |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Botón + modal.
* Mutation.

### Potential Backend Tasks

* Use case y endpoint.
* Validación de estado.

### Potential Database Tasks

* Migración `deleted_at`.
* Índice parcial.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests positivos/negativos.

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

* [ ] Endpoint operativo.
* [ ] Soft delete verificable.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar política de retención (¿purgar tras N días?).

# 🧾 User Story: Cancelar mi evento

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-011                               |
| Epic               | EPIC-EVT-001 — Organizer Event Management |
| Feature            | Cancelación de evento propio         |
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

**As an** organizador autenticado dueño de un evento `active`
**I want** cancelar mi evento explícitamente
**So that** detenga el flujo de planificación y notifique a los proveedores asociados

---

## 🧠 Business Context

### Context Summary

La cancelación permite cerrar un evento que ya no se realizará. Pasa el estado a `cancelled` y bloquea todas las ediciones posteriores. Notifica a proveedores con QuoteRequest/Quote/BookingIntent activos.

### Related Domain Concepts

* Event lifecycle: `active → cancelled`.
* Notifications a vendors afectados.
* QuoteRequests/Quotes deben marcarse como `cancelled`/`expired` según política.

### Assumptions

* No hay penalización ni reembolso (sin pagos reales).
* No se eliminan datos (soft cancel).

### Dependencies

* US-009 (creación).
* EPIC-NOT-001 (notificaciones).
* EPIC-QR-001 (lifecycle de quotes).

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-EVENT-009, FR-EVENT-010                |
| Use Case(s)            | UC-EVENT-003                             |
| Business Rule(s)       | BR-EVENT-011                             |
| Permission Rule(s)     | Ownership                                |
| Data Entity / Entities | Event, QuoteRequest, Quote, BookingIntent, Notification |
| API Endpoint(s)        | POST /api/v1/events/:id/cancel           |
| NFR Reference(s)       | NFR-PERF-API-001                         |
| Related ADR(s)         | ADR-BE-00n                               |
| Related Document(s)    | /docs/6                                  |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Reembolsos automáticos.
* Penalizaciones.
* Reactivación de eventos cancelados (Future).

### Scope Notes

* No introduce flujo de soporte.
* No introduce contratos.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Cancelación exitosa

**Given** un evento `active` propio
**When** el organizador confirma la cancelación
**Then** el estado pasa a `cancelled`, las QuoteRequests/Quotes activas se marcan `cancelled` y se notifica a los vendors asociados.

### AC-02: Bloqueo de ediciones posteriores

**Given** evento `cancelled`
**When** se intenta editar o crear tareas
**Then** 409 `EVENT_LOCKED`.

---

## ⚠️ Edge Cases

### EC-01: Evento `draft`

**Given** evento `draft`
**When** intenta cancelar
**Then** se permite (paso a `cancelled`) o se sugiere `delete` (US-012); por simplicidad MVP, permitir cancel.

#### Handling

* Decisión consistente.

---

### EC-02: BookingIntent confirmed_intent

**Given** existe `BookingIntent.confirmed_intent`
**When** el evento se cancela
**Then** el `BookingIntent` también pasa a `cancelled` y se notifica al vendor.

#### Handling

* Recalcular committed en presupuesto.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior        |
| ----- | ------------------------------- | ------------------------- |
| VR-01 | Estado actual debe ser `active` o `draft` | "Estado inválido" |
| VR-02 | Confirmación obligatoria (frontend) | Modal de confirmación |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership policy.                                                   |
| SEC-02 | Admin no puede cancelar.                                            |
| SEC-03 | Operación transaccional con efectos cascada.                        |

### Negative Authorization Scenarios

* Otro organizador → 403/404.
* Admin → 403.

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

| Area                | Notes                                                       |
| ------------------- | ----------------------------------------------------------- |
| Screen / Route      | `/[locale]/organizer/events/:id`                            |
| Main UI Pattern     | Botón "Cancelar evento" + modal de confirmación              |
| Primary Action      | "Confirmar cancelación"                                     |
| Secondary Actions   | "Volver"                                                    |
| Empty State         | No aplica                                                   |
| Loading State       | Spinner                                                     |
| Error State         | Banner                                                      |
| Success State       | Toast + estado visible en dashboard                          |
| Accessibility Notes | Modal accesible, foco atrapado                              |
| Responsive Notes    | Mobile-first                                                |
| i18n Notes          | 4 locales                                                   |
| Currency Notes      | No aplica                                                   |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id`
* Components:

  * `CancelEventDialog`
* State Management:

  * TanStack mutation `useCancelEvent`
* Forms:

  * Confirmación con texto repetido opcional
* API Client:

  * `eventsApi.cancel(id)`

### Backend

* Use Case / Service:

  * `CancelEventUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/cancel`
* Authorization Policy:

  * Ownership
* Validation:

  * Estado válido
* Transaction Required:

  * Sí (event + quotes + booking intents + notifications)

### Database

* Main Tables:

  * `events`, `quote_requests`, `quotes`, `booking_intents`, `notifications`
* Constraints:

  * Transiciones de estado válidas
* Index Considerations:

  * Índices por `event_id`

### API

| Method | Endpoint                          | Purpose          |
| ------ | --------------------------------- | ---------------- |
| POST   | `/api/v1/events/:id/cancel`       | Cancelar evento  |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`event.cancelled`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                              | Type        |
| ----- | ----------------------------------------------------- | ----------- |
| TS-01 | Cancel desde active con efectos cascada               | Integration |
| TS-02 | Cancel desde draft                                    | Integration |
| TS-03 | E2E con confirmación modal                            | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Otro organizador                      | 403/404                  |
| NT-02 | Cancel en completed                   | 409                      |
| NT-03 | Admin                                 | 403                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result |
| ---------- | --------------------------------- | --------------- |
| AUTH-TS-01 | Dueño cancela                     | 200             |
| AUTH-TS-02 | Otro                              | 403/404         |

### Accessibility Tests

* Modal accesible y trampa de foco.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tasa de cancelación, NPS del proveedor                |
| Expected Impact     | Comunicación oportuna a proveedores                  |
| Success Criteria    | 100% de quotes asociadas pasan a cancelled            |
| Academic Demo Value | Demuestra reglas de lifecycle y cascada              |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Botón + modal de confirmación.
* Mutation y refresh de estado.

### Potential Backend Tasks

* Use case con transacción.
* Notificaciones a vendors.
* Recalcular committed presupuesto.

### Potential Database Tasks

* Triggers o validación de transición.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests positivos/negativos + E2E.

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

* [ ] Endpoint operativo con cascada.
* [ ] Notificaciones enviadas.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar mensajes de notificación a vendors.
* Considerar incluir motivo de cancelación (campo opcional).

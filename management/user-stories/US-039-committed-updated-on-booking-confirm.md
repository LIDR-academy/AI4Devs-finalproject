# 🧾 User Story: Ver mi committed actualizarse al confirmar booking

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-039                               |
| Epic               | EPIC-BUD-001                          |
| Feature            | Update automático committed por BookingIntent |
| Module / Domain    | Budget                               |
| User Role          | Organizer / System                   |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador
**I want** que el `committed` de mi presupuesto se actualice automáticamente al confirmarse un BookingIntent
**So that** mi presupuesto refleje los compromisos sin entradas manuales

---

## 🧠 Business Context

### Context Summary

Cuando un BookingIntent pasa a `confirmed_intent`, el sistema suma el `total` al `BudgetItem.committed` de la categoría correspondiente. Atómico junto con la confirmación.

### Related Domain Concepts

* BookingIntent → BudgetItem.committed.

### Assumptions

* Una sola categoría por BookingIntent.

### Dependencies

* US-035, US-036.
* EPIC-CMP-001.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BUDGET-007, FR-BOOKING-003       |
| Use Case(s)            | UC-BUDGET-004                      |
| Business Rule(s)       | BR-BUDGET-005, BR-BOOKING-005       |
| Permission Rule(s)     | System (handler)                   |
| Data Entity / Entities | BookingIntent, BudgetItem           |
| API Endpoint(s)        | Sistema (event handler)            |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Conversión FX.
* Multi-categoría por intent.

### Scope Notes

* Atómico con confirmación.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Confirmación actualiza committed

**Given** BookingIntent con monto N en categoría C
**When** se confirma
**Then** `BudgetItem.committed` en C incrementa en N.

### AC-02: Cancelación revierte

**Given** BookingIntent confirmed
**When** se cancela
**Then** committed decrementa en N.

---

## ⚠️ Edge Cases

### EC-01: Sin BudgetItem para la categoría

**Given** no existe item
**When** se confirma
**Then** se crea automáticamente con planned=0, committed=N.

#### Handling

* Sin fricción para el usuario.

---

### EC-02: Race conditions

**Given** confirmaciones concurrentes
**When** se procesan
**Then** locks o atomic updates evitan double-counting.

#### Handling

* SELECT FOR UPDATE.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Monto > 0                       | Skip                        |
| VR-02 | Categoría definida              | Auto-create                 |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sistema; sólo dispara desde uso autorizado.                          |
| SEC-02 | Operación atómica con confirmación.                                  |

### Negative Authorization Scenarios

* No aplica directamente al user.

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
| Screen / Route      | Pantalla budget                                         |
| Main UI Pattern     | Refresh automático tras evento                          |
| Primary Action      | No aplica                                              |
| Secondary Actions   | No aplica                                              |
| Empty State         | No aplica                                              |
| Loading State       | Skeleton parcial                                        |
| Error State         | Banner                                                  |
| Success State       | committed actualizado                                   |
| Accessibility Notes | aria-live polite                                        |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | Moneda del evento                                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Pantalla budget
* Components:

  * Re-query post-evento
* State Management:

  * Invalidate cache TanStack
* Forms:

  * No aplica
* API Client:

  * `budgetApi.get`

### Backend

* Use Case / Service:

  * `UpdateCommittedFromBookingIntent` invocado por `ConfirmBookingIntent`
* Controller / Route:

  * Disparado por use case interno
* Authorization Policy:

  * System
* Validation:

  * Internal
* Transaction Required:

  * Sí (atomic con confirm)

### Database

* Main Tables:

  * `budget_items`, `booking_intents`
* Constraints:

  * Atomicidad
* Index Considerations:

  * Por `budget_id`, `category_id`

### API

| Method | Endpoint                                            | Purpose                       |
| ------ | --------------------------------------------------- | ----------------------------- |
| —      | Sistema (event)                                     | Update committed              |

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
| TS-01 | Confirm incrementa committed      | Integration |
| TS-02 | Cancel decrementa                  | Integration |
| TS-03 | Auto-create budget item            | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Race condition                        | Sin double-count         |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario              | Expected Result |
| ---------- | --------------------- | --------------- |
| AUTH-TS-01 | System dispara handler | Success         |

### Accessibility Tests

* aria-live para actualización.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Precisión financiera                                 |
| Expected Impact     | Datos en vivo confiables                              |
| Success Criteria    | 100% atomicidad                                      |
| Academic Demo Value | Demuestra integración de bounded contexts             |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Invalidate cache.

### Potential Backend Tasks

* Use case + transacción atómica.

### Potential Database Tasks

* Asegurar locks / atomic updates.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests de concurrencia.

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

* [ ] Funcional + atómico.
* [ ] Tests concurrencia.
* [ ] PO valida.

---

## 📝 Notes

* Considerar idempotencia con `intent_id` para reintento seguro.

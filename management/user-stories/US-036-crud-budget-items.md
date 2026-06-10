# 🧾 User Story: Crear y editar BudgetItem por categoría

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-036                               |
| Epic               | EPIC-BUD-001                          |
| Feature            | CRUD de BudgetItems                  |
| Module / Domain    | Budget                               |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador
**I want** crear, editar y eliminar items de mi presupuesto por categoría
**So that** mantenga el detalle de mi presupuesto vivo

---

## 🧠 Business Context

### Context Summary

CRUD básico de BudgetItem. Cada item tiene `category`, `planned`, `committed`, `paid` (opcional).

### Related Domain Concepts

* BudgetItem.

### Assumptions

* Categoría debe existir.

### Dependencies

* US-035.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BUDGET-003, FR-BUDGET-004        |
| Use Case(s)            | UC-BUDGET-002                      |
| Business Rule(s)       | BR-BUDGET-003, BR-BUDGET-004        |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | BudgetItem, ServiceCategory         |
| API Endpoint(s)        | POST/PATCH/DELETE /api/v1/events/:id/budget/items |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Captura de tarjeta.
* Workflow de aprobación interna.

### Scope Notes

* Sin pagos reales.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Crear item

**Given** budget existente
**When** POST item válido
**Then** se crea con `committed=0`.

### AC-02: Editar planned/paid

**Given** item existente
**When** PATCH válido
**Then** se actualiza.

### AC-03: Eliminar item

**Given** item sin BookingIntent confirmed
**When** DELETE
**Then** soft delete.

---

## ⚠️ Edge Cases

### EC-01: Item con committed > 0

**Given** item con `committed > 0`
**When** intenta DELETE
**Then** 409 `ITEM_HAS_COMMITMENT`.

#### Handling

* Sugerir cancelar BookingIntent primero.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | `planned ≥ 0`                   | 400                         |
| VR-02 | `paid ≥ 0` y ≤ `committed`      | 400                         |
| VR-03 | Categoría existente             | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |

### Negative Authorization Scenarios

* Ajeno → 403/404.

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
| Main UI Pattern     | Tabla con inline edit                                   |
| Primary Action      | "Agregar item"                                         |
| Secondary Actions   | Editar, Eliminar                                        |
| Empty State         | "Sin items"                                            |
| Loading State       | Skeleton                                                |
| Error State         | Toast                                                   |
| Success State       | Tabla actualizada                                       |
| Accessibility Notes | Tabla accesible                                         |
| Responsive Notes    | Mobile colapsa columnas                                 |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | Moneda del evento                                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Pantalla budget
* Components:

  * `BudgetItemTable`
* State Management:

  * TanStack
* Forms:

  * RHF inline
* API Client:

  * `budgetApi.items.*`

### Backend

* Use Case / Service:

  * `CreateBudgetItemUseCase`, `UpdateBudgetItemUseCase`, `DeleteBudgetItemUseCase`
* Controller / Route:

  * `POST/PATCH/DELETE /api/v1/events/:id/budget/items`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `budget_items`
* Constraints:

  * `deleted_at`
* Index Considerations:

  * Por `budget_id`, `category_id`

### API

| Method | Endpoint                                            | Purpose      |
| ------ | --------------------------------------------------- | ------------ |
| POST   | `/api/v1/events/:id/budget/items`                   | Crear item   |
| PATCH  | `/api/v1/events/:id/budget/items/:itemId`           | Editar item  |
| DELETE | `/api/v1/events/:id/budget/items/:itemId`           | Soft delete  |

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
| TS-01 | CRUD básico                       | Integration |
| TS-02 | DELETE bloqueado con committed > 0 | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | planned negativo                      | 400                      |
| NT-02 | Categoría inexistente                 | 400                      |
| NT-03 | Ajeno                                 | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200/204         |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Tabla con headers correctos.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Control fino                                         |
| Expected Impact     | Mejor gestión                                        |
| Success Criteria    | < 1% errores                                         |
| Academic Demo Value | Demuestra CRUD financiero                             |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Tabla inline.

### Potential Backend Tasks

* Use cases.

### Potential Database Tasks

* Soft delete.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests + atomicidad.

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

* [ ] CRUD funcional.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Considerar bulk update para varios items.

# 🧾 User Story: Ver warning cuando committed > total

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-038                               |
| Epic               | EPIC-BUD-001                          |
| Feature            | Warning de sobrecompromiso            |
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
**I want** ver un aviso visual cuando mi `committed` exceda el `total`
**So that** decida ajustar el presupuesto o reducir compromisos

---

## 🧠 Business Context

### Context Summary

Warning informativo no bloqueante. Permite al organizador decidir; la plataforma no impone.

### Related Domain Concepts

* Budget warning.

### Assumptions

* Banner amarillo y badge a nivel item.

### Dependencies

* US-035, US-036.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BUDGET-006                       |
| Use Case(s)            | UC-BUDGET-003                      |
| Business Rule(s)       | BR-BUDGET-006                      |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | Budget, BudgetItem                  |
| API Endpoint(s)        | GET /api/v1/events/:id/budget       |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Bloqueo de gastos.

### Scope Notes

* Sólo informativo.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Warning visible

**Given** `sum(committed) > total`
**When** abre la vista
**Then** banner amarillo "Tu presupuesto comprometido excede el total".

### AC-02: Persistencia consistente

**Given** corrige y ajusta total
**When** vuelve a cargar
**Then** warning desaparece si ya cuadra.

---

## ⚠️ Edge Cases

### EC-01: Egde cases redondeo

**Given** diferencia centavos por redondeo
**When** se evalúa
**Then** no muestra warning si diferencia < tolerancia.

#### Handling

* Tolerancia 0.01 unidad de la moneda.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Comparación con moneda del evento | Calc            |

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
| Screen / Route      | Pantalla budget + dashboard                             |
| Main UI Pattern     | Banner + badge                                          |
| Primary Action      | "Ajustar total"                                        |
| Secondary Actions   | "Revisar items"                                        |
| Empty State         | No aplica                                              |
| Loading State       | No aplica                                              |
| Error State         | No aplica                                              |
| Success State       | Warning vivo                                            |
| Accessibility Notes | Color + ícono + texto                                   |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | Moneda del evento                                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Pantalla budget
* Components:

  * `OvercommitWarning`
* State Management:

  * Derivado del state budget
* Forms:

  * No aplica
* API Client:

  * Reuso de GET budget

### Backend

* Use Case / Service:

  * Cálculo embebido en `GetBudgetUseCase`
* Controller / Route:

  * `GET /api/v1/events/:id/budget`
* Authorization Policy:

  * Ownership
* Validation:

  * No aplica
* Transaction Required:

  * No

### Database

* Main Tables:

  * `budget`, `budget_items`
* Constraints:

  * Por `event_id`
* Index Considerations:

  * No aplica

### API

| Method | Endpoint                          | Purpose                  |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/v1/events/:id/budget`       | Include `over_committed` |

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
| TS-01 | committed > total muestra warning | Unit/E2E    |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Diferencia centavos                   | Sin warning              |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Contraste y texto explícito.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Control financiero                                   |
| Expected Impact     | Alerta temprana                                      |
| Success Criteria    | Visible inmediatamente al exceder                    |
| Academic Demo Value | Visualización de regla de negocio                     |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Banner.

### Potential Backend Tasks

* Incluir flag en response.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests unitarios.

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

* [ ] Warning visible.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar diseño visual del banner.

# 🧾 User Story: Aceptar distribución IA como items editables

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-037                               |
| Epic               | EPIC-BUD-001                          |
| Feature            | Aceptación de distribución IA         |
| Module / Domain    | Budget / AI                          |
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
**I want** aceptar la distribución IA como items editables de mi presupuesto
**So that** comience con un baseline sin partir de cero

---

## 🧠 Business Context

### Context Summary

Tras AI-003, los items se materializan con `ai_generated=true`, editables. AIRecommendation queda `accepted`.

### Related Domain Concepts

* BudgetItem.ai_generated.
* AIRecommendation.

### Assumptions

* Se invoca tras US-019.

### Dependencies

* US-019, US-025.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-BUDGET-005, FR-AI-005             |
| Use Case(s)            | UC-BUDGET-003                      |
| Business Rule(s)       | BR-BUDGET-005, BR-AI-013            |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | BudgetItem, AIRecommendation        |
| API Endpoint(s)        | POST /api/v1/events/:id/budget/apply-ai |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | ADR-AI-001                         |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Auto-aplicación sin acción del usuario.

### Scope Notes

* HITL obligatorio.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Aplicar IA

**Given** AIRecommendation pending de budget
**When** POST apply-ai
**Then** se crean BudgetItems editables y AIRecommendation=accepted.

### AC-02: Aplicar parcial

**Given** se eligen sólo algunas categorías
**When** POST con subset
**Then** se crean sólo esas.

---

## ⚠️ Edge Cases

### EC-01: AIRecommendation final

**Given** ya finalizada
**When** se intenta apply
**Then** 409.

#### Handling

* No reprocesar.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | AIRecommendation propia y pending | 403/409                   |
| VR-02 | Items con `planned > 0`         | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Atómica.                                                             |

### Negative Authorization Scenarios

* Ajeno → 403/404.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: HITL para AI-003
* Provider Layer: Not applicable
* Human Validation Required: Yes
* Persist AIRecommendation: Yes (update)
* Fallback Required: No

### AI Input

* recommendation_id

### AI Output

* BudgetItems creados.

### Human-in-the-loop Rules

* Esta historia ES el HITL aplicado a budget.

### AI Error / Fallback Behavior

* No aplica.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | Vista budget / sugerencia IA                            |
| Main UI Pattern     | Botón "Aplicar"                                         |
| Primary Action      | "Aplicar al presupuesto"                                |
| Secondary Actions   | "Editar antes de aplicar", "Descartar"                  |
| Empty State         | No aplica                                              |
| Loading State       | Spinner                                                 |
| Error State         | Banner                                                  |
| Success State       | Items visibles                                          |
| Accessibility Notes | Botones accesibles                                      |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | Idioma del evento                                       |
| Currency Notes      | Moneda del evento                                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Vista budget
* Components:

  * `ApplyAIBudgetDialog`
* State Management:

  * TanStack
* Forms:

  * RHF para subset
* API Client:

  * `budgetApi.applyAIBudget`

### Backend

* Use Case / Service:

  * `ApplyAIBudgetUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/budget/apply-ai`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `budget_items`, `ai_recommendations`
* Constraints:

  * ai_generated=true en items
* Index Considerations:

  * Por `event_id`

### API

| Method | Endpoint                                            | Purpose             |
| ------ | --------------------------------------------------- | ------------------- |
| POST   | `/api/v1/events/:id/budget/apply-ai`                | Aplicar sugerencia IA |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: Yes (update)

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Apply total                       | Integration |
| TS-02 | Apply parcial                     | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Recommendation final                  | 409                      |
| NT-02 | Ajeno                                 | 403/404                  |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Items creados con ai_generated=true     | OK                        |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Dialog accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Adopción IA en budget                                |
| Expected Impact     | Acelera setup financiero                              |
| Success Criteria    | ≥ 50% acepta total o parcial                          |
| Academic Demo Value | HITL aplicado a finanzas                              |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Dialog apply IA.

### Potential Backend Tasks

* Use case atómico.

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

* [ ] Funcional.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar si requiere texto de confirmación.

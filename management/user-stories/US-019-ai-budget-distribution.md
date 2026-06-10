# 🧾 User Story: Pedir sugerencia IA de distribución de presupuesto

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-019                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | AI-003 Distribución de presupuesto IA |
| Module / Domain    | AI / Budget                          |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador con evento creado y presupuesto estimado
**I want** recibir una sugerencia IA de distribución por categorías de gasto
**So that** tenga un baseline editable para mi presupuesto sin partir de cero

---

## 🧠 Business Context

### Context Summary

AI-003 sugiere distribución porcentual del presupuesto entre categorías típicas (catering, venue, fotografía, decoración, música, etc.). El organizador puede aceptar la propuesta como `BudgetItem` editables con `ai_generated=true`.

### Related Domain Concepts

* Budget 1:1 por evento.
* BudgetItem con `ai_generated=true`.
* AIRecommendation (type='budget_distribution').

### Assumptions

* Distribución total = 100%.
* La moneda del presupuesto es la del evento.

### Dependencies

* US-009 (evento + budget estimado).
* EPIC-BUD-001 (BudgetItem).
* EPIC-AI-001.

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-AI-005, FR-BUDGET-003                  |
| Use Case(s)            | UC-AI-003                                |
| Business Rule(s)       | BR-AI-001..005, BR-BUDGET-003            |
| Permission Rule(s)     | Ownership                                |
| Data Entity / Entities | Budget, BudgetItem, AIRecommendation     |
| API Endpoint(s)        | POST /api/v1/events/:id/ai/budget        |
| NFR Reference(s)       | NFR-AI-001, NFR-AI-002                   |
| Related ADR(s)         | ADR-AI-001                               |
| Related Document(s)    | /docs/7, /docs/17                        |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Recomendación de proveedores específicos en este endpoint.
* Conversión automática de moneda.

### Scope Notes

* La sugerencia es editable; nunca reemplaza items confirmados.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Sugerencia generada

**Given** evento con `budget_estimated` y `currency`
**When** se solicita sugerencia IA
**Then** backend devuelve categorías con porcentajes y montos calculados; persiste AIRecommendation.

### AC-02: Aceptación crea BudgetItems

**Given** sugerencia mostrada
**When** el organizador acepta
**Then** se crean `BudgetItem(ai_generated=true)` por categoría, editables.

---

## ⚠️ Edge Cases

### EC-01: Presupuesto = 0

**Given** `budget_estimated = 0`
**When** se solicita IA
**Then** 400 `INVALID_BUDGET`.

#### Handling

* Validar input.

---

### EC-02: Suma <> 100%

**Given** salida IA con porcentajes que no suman 100
**When** Zod valida
**Then** reintento; si persiste, error.

#### Handling

* Política estricta de validación.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior          |
| ----- | ------------------------------------------------- | --------------------------- |
| VR-01 | Evento propio                                     | 403/404                     |
| VR-02 | `budget_estimated > 0`                            | 400                         |
| VR-03 | Porcentajes suman 100%                            | Reintento; error si falla   |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Rate limit AI.                                                      |
| SEC-03 | Backend-only LLM.                                                    |
| SEC-04 | Logs sin PII.                                                        |

### Negative Authorization Scenarios

* Ajeno → 403/404. Vendor → 403.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: AI-003
* Provider Layer: LLMProvider
* Human Validation Required: Yes
* Persist AIRecommendation: Yes
* Fallback Required: Yes

### AI Input

* `event.event_type_code`, `event.guest_count`, `event.budget_estimated`, `event.currency`, `event.city`, `event.language`

### AI Output

* JSON: `categories: [{ name, percentage, amount, notes }]` con suma 100%.

### Human-in-the-loop Rules

* Sugerencia editable.
* El organizador acepta total o parcialmente.
* BudgetItems generados son editables (`ai_generated=true`).

### AI Error / Fallback Behavior

* Timeout / JSON / provider: políticas iguales a US-017.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | `/[locale]/organizer/events/:id/budget`                |
| Main UI Pattern     | Vista con barras/porcentaje + acciones HITL            |
| Primary Action      | "Aplicar distribución"                                 |
| Secondary Actions   | "Editar antes de aplicar", "Regenerar"                 |
| Empty State         | CTA "Sugerir distribución IA"                          |
| Loading State       | Skeleton + progress                                    |
| Error State         | Banner                                                 |
| Success State       | BudgetItems visibles                                   |
| Accessibility Notes | Tablas accesibles con headers                          |
| Responsive Notes    | Mobile-first                                           |
| i18n Notes          | Idioma del evento                                      |
| Currency Notes      | Montos en moneda del evento                            |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/budget`
* Components:

  * `AIBudgetSuggestion`, `BudgetItemEditor`
* State Management:

  * TanStack mutations
* Forms:

  * RHF + Zod para editar antes de aplicar
* API Client:

  * `aiApi.generateBudget`, `budgetApi.applyAIBudget`

### Backend

* Use Case / Service:

  * `GenerateBudgetDistributionUseCase`, `ApplyAIBudgetUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/ai/budget`
  * `POST /api/v1/events/:id/budget/apply-ai`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod estricta
* Transaction Required:

  * Sí (crear items + AIRecommendation)

### Database

* Main Tables:

  * `budget`, `budget_items`, `ai_recommendations`
* Constraints:

  * Suma de items planned <= budget_estimated*1.2 (warning, no bloqueo)
* Index Considerations:

  * Índice por `event_id`

### API

| Method | Endpoint                                            | Purpose                  |
| ------ | --------------------------------------------------- | ------------------------ |
| POST   | `/api/v1/events/:id/ai/budget`                      | Sugerencia IA            |
| POST   | `/api/v1/events/:id/budget/apply-ai`                | Aplicar como BudgetItems |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: Yes

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                              | Type        |
| ----- | ----------------------------------------------------- | ----------- |
| TS-01 | Generación + aceptación crea BudgetItems              | Integration |
| TS-02 | E2E desde dashboard                                   | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Presupuesto 0                         | 400                      |
| NT-02 | Evento ajeno                          | 403/404                  |
| NT-03 | Vendor                                | 403                      |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Mock responde válido                    | Distribución mostrada     |
| AI-TS-02 | Suma <> 100                              | Reintento                 |
| AI-TS-03 | Timeout                                  | Error / fallback         |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Lectura por screen reader de porcentajes y montos.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Adopción de presupuesto, tiempo a primer item        |
| Expected Impact     | Acelera definición de presupuesto                    |
| Success Criteria    | ≥ 50% aplican la sugerencia (total o parcial)         |
| Academic Demo Value | Demuestra HITL en datos financieros                   |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Componente sugerencia + edición.
* Aplicar items.

### Potential Backend Tasks

* Use cases + integración LLM.
* Validación 100%.

### Potential Database Tasks

* Sin tablas nuevas.

### Potential AI / PromptOps Tasks

* Prompt "BudgetDistributionPrompt v1".
* Mock determinista.

### Potential QA Tasks

* Tests + AI.

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

* [ ] Endpoints + UI funcionales.
* [ ] HITL enforced.
* [ ] Tests deterministas.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar lista canónica de categorías base.

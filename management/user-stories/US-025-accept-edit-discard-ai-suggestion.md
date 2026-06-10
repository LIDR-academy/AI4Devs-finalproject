# 🧾 User Story: Aceptar, editar o descartar una sugerencia IA

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-025                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | HITL transversal sobre sugerencias IA |
| Module / Domain    | AI / Cross                           |
| User Role          | Organizer / Vendor                   |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** usuario al que la IA le presentó una sugerencia (plan, checklist, presupuesto, brief, comparador, bio, paquetes, priorización)
**I want** aceptar, editar o descartar la sugerencia
**So that** mantenga el control completo de mis datos y la IA nunca decida por mí

---

## 🧠 Business Context

### Context Summary

HITL es transversal: toda sugerencia se almacena como `AIRecommendation` con `status=pending`. El usuario debe aceptar (`accepted`), editar (`edited`), o descartar (`rejected`/`discarded`). Esta historia formaliza la API y UX común de HITL.

### Related Domain Concepts

* AIRecommendation lifecycle.

### Assumptions

* Cada sugerencia tiene un `recommendation_id`.

### Dependencies

* Cualquier feature AI (US-017..US-024, US-018, etc.).

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-AI-015, FR-AI-016                      |
| Use Case(s)            | UC-AI-009                                |
| Business Rule(s)       | BR-AI-010, BR-AI-013                     |
| Permission Rule(s)     | Ownership de la recomendación             |
| Data Entity / Entities | AIRecommendation                         |
| API Endpoint(s)        | PATCH /api/v1/ai-recommendations/:id     |
| NFR Reference(s)       | NFR-OBS-001                              |
| Related ADR(s)         | ADR-AI-001                               |
| Related Document(s)    | /docs/7, /docs/17                        |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Decisiones autónomas IA.
* Auto-aplicación tras N segundos sin acción.

### Scope Notes

* Toda sugerencia requiere acción humana.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Aceptar sugerencia

**Given** AIRecommendation pending propia
**When** PATCH `status='accepted'`
**Then** el backend marca aceptación, aplica efectos colaterales (e.g., crear BudgetItems) y log estructurado.

### AC-02: Editar sugerencia

**Given** sugerencia pending
**When** PATCH `status='edited', edited_payload=<json>`
**Then** se persiste la versión editada y la entidad resultante (task/budget item/etc.) refleja la edición.

### AC-03: Descartar sugerencia

**Given** sugerencia pending
**When** PATCH `status='discarded'`
**Then** se persiste el descarte sin efectos.

---

## ⚠️ Edge Cases

### EC-01: Recomendación ya procesada

**Given** AIRecommendation con status final
**When** se intenta cambiar
**Then** 409 `RECOMMENDATION_ALREADY_FINALIZED`.

#### Handling

* Estado final no editable.

---

### EC-02: Sugerencia ajena

**Given** recommendation_id de otro usuario
**When** PATCH
**Then** 403/404.

#### Handling

* Ownership policy.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior          |
| ----- | ------------------------------------------------- | --------------------------- |
| VR-01 | Estado válido (accepted/edited/discarded)         | 400                         |
| VR-02 | Estado actual = pending                            | 409                         |
| VR-03 | `edited_payload` schema válido                     | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership (mismo dueño del evento/perfil).                          |
| SEC-02 | Cambios atómicos junto con efectos colaterales.                      |
| SEC-03 | Logs estructurados.                                                  |

### Negative Authorization Scenarios

* Otro user → 403/404.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: HITL transversal
* Provider Layer: Not applicable (sólo persistencia post-IA)
* Human Validation Required: Yes
* Persist AIRecommendation: Yes (update)
* Fallback Required: No

### AI Input

* `recommendation_id`, decisión humana, payload editado (opcional)

### AI Output

* Estado actualizado de AIRecommendation.

### Human-in-the-loop Rules

* Esta historia ES el HITL.

### AI Error / Fallback Behavior

* No aplica.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | Vistas IA (varios)                                     |
| Main UI Pattern     | Botonera "Aceptar / Editar / Descartar / Regenerar"     |
| Primary Action      | "Aceptar"                                              |
| Secondary Actions   | "Editar", "Descartar"                                  |
| Empty State         | No aplica                                              |
| Loading State       | Spinner en submit                                      |
| Error State         | Toast                                                  |
| Success State       | Toast + actualización de vista                          |
| Accessibility Notes | Botones accesibles                                      |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Reusable en vistas IA
* Components:

  * `HITLActions`
* State Management:

  * TanStack mutation `useUpdateAIRecommendation`
* Forms:

  * Edit en modal o inline
* API Client:

  * `aiApi.updateRecommendation(id, payload)`

### Backend

* Use Case / Service:

  * `UpdateAIRecommendationUseCase` (orquesta efectos según `type`)
* Controller / Route:

  * `PATCH /api/v1/ai-recommendations/:id`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * Sí (update + side effects)

### Database

* Main Tables:

  * `ai_recommendations` + entidades destino
* Constraints:

  * Estados válidos
* Index Considerations:

  * Por `event_id`, `type`, `status`

### API

| Method | Endpoint                              | Purpose                  |
| ------ | ------------------------------------- | ------------------------ |
| PATCH  | `/api/v1/ai-recommendations/:id`      | Aceptar/editar/descartar |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: Yes (update)

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                  | Type        |
| ----- | ----------------------------------------- | ----------- |
| TS-01 | Accept aplica efectos colaterales         | Integration |
| TS-02 | Edit persiste payload editado             | Integration |
| TS-03 | Discard no genera efectos                 | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Estado final ya                       | 409                      |
| NT-02 | Recommendation ajena                  | 403/404                  |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Aceptación crea entidades correctas      | Tasks/BudgetItems creados |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Botones HITL accesibles por teclado.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Adopción IA, satisfacción del usuario                |
| Expected Impact     | Garantiza control del usuario                        |
| Success Criteria    | 100% HITL enforced                                   |
| Academic Demo Value | Demuestra HITL como principio rector                  |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Componente `HITLActions`.
* Hooks reutilizables.

### Potential Backend Tasks

* Use case con strategy por type.
* Efectos colaterales atómicos.

### Potential Database Tasks

* Estados válidos en AIRecommendation.

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

* [ ] Endpoint operativo con strategy por tipo.
* [ ] UI reutilizable.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Definir strategy pattern para los efectos por `type` (plan, checklist, budget, brief, ...).

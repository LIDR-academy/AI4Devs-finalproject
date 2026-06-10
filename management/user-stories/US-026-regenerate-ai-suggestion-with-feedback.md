# 🧾 User Story: Regenerar una sugerencia IA con feedback

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-026                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | Regeneración con feedback             |
| Module / Domain    | AI / Cross                           |
| User Role          | Organizer / Vendor                   |
| Priority           | Should Have                          |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** usuario que recibió una sugerencia IA y quiere mejorarla
**I want** solicitar regeneración añadiendo feedback breve
**So that** la IA produzca una versión más alineada a mi intención

---

## 🧠 Business Context

### Context Summary

La regeneración crea un nuevo `AIRecommendation` enlazado al anterior (`parent_recommendation_id`) con el feedback como input adicional al prompt. Está limitado por rate-limit por usuario y `max_regenerations_per_event`.

### Related Domain Concepts

* AIRecommendation con parent.
* Feedback textual corto.

### Assumptions

* La regeneración cuenta para rate-limit de IA.
* Límite N regeneraciones por evento (configurable, sugerido 5).

### Dependencies

* US-017..US-024.
* EPIC-AI-001.

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-AI-014                                 |
| Use Case(s)            | UC-AI-010                                |
| Business Rule(s)       | BR-AI-014                                |
| Permission Rule(s)     | Ownership                                |
| Data Entity / Entities | AIRecommendation                         |
| API Endpoint(s)        | POST /api/v1/ai-recommendations/:id/regenerate |
| NFR Reference(s)       | NFR-AI-001                               |
| Related ADR(s)         | ADR-AI-001                               |
| Related Document(s)    | /docs/7                                  |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Should Have

### Explicitly Out of Scope

* Regeneración ilimitada sin rate-limit.
* Feedback estructurado complejo (sólo texto corto).

### Scope Notes

* Cap a 5 regeneraciones por sugerencia.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Regeneración con feedback

**Given** sugerencia pending
**When** POST regenerate con `feedback`
**Then** se invoca LLM con prompt + feedback, se crea nueva AIRecommendation con `parent_id`, se muestra al usuario.

### AC-02: Límite alcanzado

**Given** se alcanzaron 5 regeneraciones
**When** se intenta otra
**Then** 429 `REGENERATION_LIMIT`.

---

## ⚠️ Edge Cases

### EC-01: Feedback vacío

**Given** sin feedback
**When** POST
**Then** OK; se usa prompt base sólo.

#### Handling

* Permitido.

---

### EC-02: Padre ya finalizado

**Given** padre con status final
**When** se intenta regenerate
**Then** 409.

#### Handling

* Sólo regenerar desde pending.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior          |
| ----- | ------------------------------------------------- | --------------------------- |
| VR-01 | Feedback ≤ 500 caracteres                          | "Feedback demasiado largo"  |
| VR-02 | Límite de regeneraciones                          | 429                         |
| VR-03 | Padre pending                                     | 409                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Rate limit AI.                                                      |
| SEC-03 | Backend-only.                                                        |

### Negative Authorization Scenarios

* Ajeno → 403/404.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: Regeneración (transversal)
* Provider Layer: LLMProvider
* Human Validation Required: Yes
* Persist AIRecommendation: Yes (nueva)
* Fallback Required: Yes

### AI Input

* Prompt base + feedback del usuario.

### AI Output

* JSON estructurado equivalente al tipo original.

### Human-in-the-loop Rules

* La regeneración es opcional; el usuario decide cuándo y por qué.

### AI Error / Fallback Behavior

* Mismas políticas.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | Vistas IA                                              |
| Main UI Pattern     | Botón "Regenerar" + textarea feedback                   |
| Primary Action      | "Regenerar"                                            |
| Secondary Actions   | Cancelar                                                |
| Empty State         | No aplica                                              |
| Loading State       | Spinner / progress                                      |
| Error State         | Banner                                                  |
| Success State       | Nueva sugerencia                                        |
| Accessibility Notes | Textarea con label                                      |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | Locale                                                  |
| Currency Notes      | No aplica                                               |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Vistas IA
* Components:

  * `AIRegenerateDialog`
* State Management:

  * TanStack
* Forms:

  * Feedback textarea
* API Client:

  * `aiApi.regenerate(recommendationId, feedback)`

### Backend

* Use Case / Service:

  * `RegenerateAIRecommendationUseCase`
* Controller / Route:

  * `POST /api/v1/ai-recommendations/:id/regenerate`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `ai_recommendations`
* Constraints:

  * `parent_recommendation_id` nullable; FK al padre
* Index Considerations:

  * Por `parent_recommendation_id`

### API

| Method | Endpoint                                              | Purpose          |
| ------ | ----------------------------------------------------- | ---------------- |
| POST   | `/api/v1/ai-recommendations/:id/regenerate`           | Regenerar IA     |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: Yes

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                  | Type        |
| ----- | ----------------------------------------- | ----------- |
| TS-01 | Regeneración con feedback                  | Integration |
| TS-02 | Límite alcanzado                           | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Padre final                           | 409                      |
| NT-02 | Ajeno                                 | 403/404                  |
| NT-03 | Feedback excede 500 chars             | 400                      |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Mock genera variante                     | Nueva recomendación       |
| AI-TS-02 | Timeout                                  | Error / fallback         |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 201             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Dialog accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad percibida de IA                              |
| Expected Impact     | Aumenta probabilidad de aceptación final             |
| Success Criteria    | ≥ 40% sugerencias regeneradas se aceptan finalmente  |
| Academic Demo Value | Demuestra ciclo iterativo con IA                      |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Dialog regenerar.
* Mutations.

### Potential Backend Tasks

* Use case + manejo de límites.
* Linking parent.

### Potential Database Tasks

* Columna `parent_recommendation_id`.

### Potential AI / PromptOps Tasks

* Política de inyección de feedback en prompts.

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

* [ ] Endpoint funcional.
* [ ] Linking parent operativo.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar límite N (sugerido 5) y rate-limit por usuario.

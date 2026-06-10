# 🧾 User Story: Obtener categorías IA priorizadas para mi evento

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-020                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | AI-004 Categorías priorizadas        |
| Module / Domain    | AI / Vendors                         |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador planeando un evento
**I want** obtener una lista priorizada de categorías de proveedor a contratar
**So that** sepa por dónde comenzar a buscar y solicitar cotizaciones

---

## 🧠 Business Context

### Context Summary

AI-004 recomienda categorías priorizadas (e.g., para una boda: venue → catering → fotografía → música → decoración). Es la antesala al directorio de proveedores y al envío de QuoteRequest.

### Related Domain Concepts

* ServiceCategory (catálogo admin).
* AIRecommendation (type='priority_categories').

### Assumptions

* Categorías sugeridas existen en el catálogo activo.
* Si no existe, se omite o marca como "no disponible".

### Dependencies

* US-009.
* EPIC-AI-001.
* EPIC-VND-001 (catálogo de categorías activo).

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-AI-006, FR-AI-009                      |
| Use Case(s)            | UC-AI-004                                |
| Business Rule(s)       | BR-AI-001..005, BR-SERVICE-001           |
| Permission Rule(s)     | Ownership                                |
| Data Entity / Entities | ServiceCategory, AIRecommendation        |
| API Endpoint(s)        | POST /api/v1/events/:id/ai/categories    |
| NFR Reference(s)       | NFR-AI-001                               |
| Related ADR(s)         | ADR-AI-001                               |
| Related Document(s)    | /docs/7                                  |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Recomendación de proveedores específicos (sólo categorías aquí).
* Decisiones automáticas.

### Scope Notes

* La sugerencia se debe filtrar contra categorías existentes en BD.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Categorías sugeridas

**Given** evento con datos completos
**When** se solicita IA
**Then** se devuelve lista ordenada `[{ category_id, name, priority_score, reason }]` filtrada a categorías activas.

### AC-02: Click-through al directorio

**Given** lista mostrada
**When** el organizador hace click en una categoría
**Then** se redirige a `/vendors?category=X&city=...`.

---

## ⚠️ Edge Cases

### EC-01: Categoría sugerida no existe

**Given** IA propone una categoría no presente
**When** backend filtra
**Then** se omite y se loguea para enriquecer catálogo.

#### Handling

* Filtro estricto.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior          |
| ----- | ------------------------------------------------- | --------------------------- |
| VR-01 | Evento propio                                     | 403/404                     |
| VR-02 | Categorías existentes y activas                   | Filtrar                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Rate limit AI.                                                      |
| SEC-03 | Backend-only LLM.                                                    |

### Negative Authorization Scenarios

* Ajeno → 403/404.
* Vendor → 403.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: AI-004
* Provider Layer: LLMProvider
* Human Validation Required: Yes (no se actúa por el usuario sin acción)
* Persist AIRecommendation: Yes
* Fallback Required: Yes

### AI Input

* `event.event_type_code`, `event.guest_count`, `event.budget_estimated`, `event.language`

### AI Output

* JSON: `[{ category_slug, priority_score, reason }]` ordenado desc.

### Human-in-the-loop Rules

* La sugerencia muestra categorías; el usuario decide qué explorar.

### AI Error / Fallback Behavior

* Mismas políticas.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | Dashboard del evento + sección "Recomendado para ti"    |
| Main UI Pattern     | Lista priorizada con razones cortas                     |
| Primary Action      | Click categoría → directorio                            |
| Secondary Actions   | "Regenerar", "Ocultar"                                  |
| Empty State         | CTA generar                                            |
| Loading State       | Skeleton                                                |
| Error State         | Banner                                                  |
| Success State       | Lista visible                                           |
| Accessibility Notes | Botones accesibles                                      |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | Idioma del evento                                       |
| Currency Notes      | No aplica                                               |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Dashboard evento
* Components:

  * `AIRecommendedCategories`
* State Management:

  * TanStack `useGenerateAICategories`
* Forms:

  * No aplica
* API Client:

  * `aiApi.generateCategories(eventId)`

### Backend

* Use Case / Service:

  * `GenerateRecommendedCategoriesUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/ai/categories`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * No (sólo persistir AIRecommendation)

### Database

* Main Tables:

  * `ai_recommendations`, `service_categories`
* Constraints:

  * Sólo categorías activas
* Index Considerations:

  * Índice por `event_id` en ai_recommendations

### API

| Method | Endpoint                                            | Purpose                       |
| ------ | --------------------------------------------------- | ----------------------------- |
| POST   | `/api/v1/events/:id/ai/categories`                  | Categorías recomendadas       |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: Yes

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                              | Type        |
| ----- | ------------------------------------- | ----------- |
| TS-01 | Generación filtrada por catálogo      | Integration |
| TS-02 | Click → directorio                    | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Categoría no existe                   | Filtrada                 |
| NT-02 | Evento ajeno                          | 403/404                  |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Mock devuelve top categorías            | Lista mostrada            |
| AI-TS-02 | Timeout                                  | Error / fallback         |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Botones y enlaces accesibles.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | CTR a directorio, conversión a QuoteRequest          |
| Expected Impact     | Acelera descubrimiento de proveedores                |
| Success Criteria    | ≥ 40% CTR a directorio desde recomendaciones         |
| Academic Demo Value | Conecta IA con marketplace                            |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Componente recomendaciones.
* Tracking de CTR.

### Potential Backend Tasks

* Use case + filtro de categorías.
* AIRecommendation.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Prompt "PriorityCategoriesPrompt v1".

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

* [ ] Recomendaciones funcionales.
* [ ] CTR medido.
* [ ] Tests deterministas.
* [ ] PO valida.

---

## 📝 Notes

* Considerar persistir feedback "no relevante" para mejoras futuras.

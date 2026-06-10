# 🧾 User Story: Ver resumen IA del comparador

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-059                               |
| Epic               | EPIC-CMP-001                          |
| Feature            | Surface UI del AI-006                 |
| Module / Domain    | Booking / AI                         |
| User Role          | Organizer                            |
| Priority           | Should Have                          |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador en el comparador
**I want** ver el panel del resumen IA del comparador
**So that** evalúe pros/contras antes de marcar preferred

---

## 🧠 Business Context

### Context Summary

Surface UI consumiendo US-022. Panel lateral o modal con análisis.

### Related Domain Concepts

* AIRecommendation type='quote_compare_summary'.

### Assumptions

* US-022 ya ejecutado.

### Dependencies

* US-022.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-AI-008                           |
| Use Case(s)            | UC-AI-006                          |
| Business Rule(s)       | BR-AI-010                          |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | AIRecommendation                   |
| API Endpoint(s)        | GET /api/v1/ai-recommendations/:id  |
| NFR Reference(s)       | NFR-AI-001                         |
| Related ADR(s)         | ADR-AI-001                         |
| Related Document(s)    | /docs/7                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Should Have

### Explicitly Out of Scope

* Decisión automática.

### Scope Notes

* Informativo.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Panel visible

**Given** resumen IA existe
**When** abre panel
**Then** ve análisis por Quote.

---

## ⚠️ Edge Cases

### EC-01: Sin resumen

**Given** no se generó
**When** abre
**Then** CTA "Resumir con IA".

#### Handling

* CTA.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Ownership                       | 403/404                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |

### Negative Authorization Scenarios

* Ajeno → 403/404.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: AI-006 (surface)
* Provider Layer: Not applicable (consume persistencia)
* Human Validation Required: Yes (informativo)
* Persist AIRecommendation: No
* Fallback Required: No

### AI Input

* recommendation_id

### AI Output

* JSON con summaries por Quote.

### Human-in-the-loop Rules

* No actúa por el usuario.

### AI Error / Fallback Behavior

* Si no existe, sugerir generar.

---

## 🎨 UX / UI Notes

| Area                | Notes                                  |
| ------------------- | -------------------------------------- |
| Screen / Route      | Comparador                              |
| Main UI Pattern     | Panel lateral / modal                    |
| Primary Action      | Cerrar                                  |
| Secondary Actions   | Regenerar                                |
| Empty State         | CTA generar                              |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Análisis visible                         |
| Accessibility Notes | Modal accesible                          |
| Responsive Notes    | Mobile sheet                             |
| i18n Notes          | Idioma evento                            |
| Currency Notes      | Moneda evento                            |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Comparador
* Components:

  * `AIComparisonPanel`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `aiApi.getRecommendation`

### Backend

* Use Case / Service:

  * `GetAIRecommendationUseCase`
* Controller / Route:

  * `GET /api/v1/ai-recommendations/:id`
* Authorization Policy:

  * Ownership
* Validation:

  * UUID
* Transaction Required:

  * No

### Database

* Main Tables:

  * `ai_recommendations`
* Constraints:

  * Sólo propias
* Index Considerations:

  * Por id

### API

| Method | Endpoint                                  | Purpose                       |
| ------ | ----------------------------------------- | ----------------------------- |
| GET    | `/api/v1/ai-recommendations/:id`          | Detalle de recomendación      |

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
| TS-01 | Panel renderiza                   | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Ajeno                                 | 403/404                  |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Sin resumen, CTA mostrado                | OK                        |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |

### Accessibility Tests

* Modal accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad de decisión                                  |
| Expected Impact     | Decisión informada                                    |
| Success Criteria    | Visible                                              |
| Academic Demo Value | IA informativa                                        |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Panel UI.

### Potential Backend Tasks

* Endpoint get recommendation.

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

* Coordinar con US-022.

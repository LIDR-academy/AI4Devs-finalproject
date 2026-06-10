# 🧾 User Story: Pedir resumen IA del comparador de Quotes

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-022                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | AI-006 Resumen IA comparador          |
| Module / Domain    | AI / Booking                         |
| User Role          | Organizer                            |
| Priority           | Should Have                          |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador comparando varias Quotes
**I want** un resumen IA que destaque pros/contras de cada Quote
**So that** pueda decidir cuál marcar como `preferred` con mayor claridad

---

## 🧠 Business Context

### Context Summary

AI-006 resume el comparador con highlights por Quote: rango de precio, condiciones, faltantes, riesgos percibidos. La IA NO decide ni marca; solo informa.

### Related Domain Concepts

* Quote comparator (US-058).
* AIRecommendation (type='quote_compare_summary').

### Assumptions

* Mínimo 2 Quotes para comparar.
* La IA no recomienda explícitamente cuál es la mejor.

### Dependencies

* EPIC-CMP-001.
* EPIC-AI-001.

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-AI-008, FR-BOOKING-001                 |
| Use Case(s)            | UC-AI-006                                |
| Business Rule(s)       | BR-AI-001..005, BR-QUOTE-021             |
| Permission Rule(s)     | Ownership                                |
| Data Entity / Entities | Quote, AIRecommendation                  |
| API Endpoint(s)        | POST /api/v1/events/:id/ai/quote-summary |
| NFR Reference(s)       | NFR-AI-001                               |
| Related ADR(s)         | ADR-AI-001                               |
| Related Document(s)    | /docs/7                                  |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Should Have

### Explicitly Out of Scope

* Selección automática de Quote ganadora.
* Negociación automática.

### Scope Notes

* La IA informa, no decide.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Resumen generado

**Given** comparador con ≥2 Quotes vigentes
**When** clic "Resumir con IA"
**Then** se devuelve análisis estructurado por Quote (pros, contras, faltantes, observaciones).

### AC-02: Persistencia

**Given** resumen generado
**When** se persiste
**Then** AIRecommendation queda enlazada al event_id con referencias a las quote_ids consideradas.

---

## ⚠️ Edge Cases

### EC-01: Solo 1 Quote

**Given** solo 1 Quote disponible
**When** se solicita
**Then** 400 `INSUFFICIENT_QUOTES`.

#### Handling

* Mensaje claro.

---

### EC-02: Quotes en distintas monedas

**Given** quotes con la misma moneda del evento
**When** se compara
**Then** OK; no se convierten monedas en MVP.

#### Handling

* Sin conversión.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior          |
| ----- | ------------------------------------------------- | --------------------------- |
| VR-01 | ≥2 Quotes elegibles                                | 400                         |
| VR-02 | Quotes propias                                    | 403/404                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Rate limit AI.                                                      |
| SEC-03 | Backend-only.                                                        |

### Negative Authorization Scenarios

* Ajeno → 403/404. Vendor → 403.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: AI-006
* Provider Layer: LLMProvider
* Human Validation Required: Yes (informativo)
* Persist AIRecommendation: Yes
* Fallback Required: Yes

### AI Input

* Lista de Quotes con `total`, `valid_until`, `breakdown`, `conditions`, `vendor_summary`.

### AI Output

* JSON: `summaries: [{ quote_id, pros[], cons[], missing_info[], notes }]`

### Human-in-the-loop Rules

* La IA no marca preferred automáticamente.
* El usuario decide qué Quote elegir.

### AI Error / Fallback Behavior

* Mismas políticas.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | `/[locale]/organizer/events/:id/quotes/compare`        |
| Main UI Pattern     | Tabla comparativa + panel lateral con resumen IA       |
| Primary Action      | "Marcar preferred"                                     |
| Secondary Actions   | "Resumir con IA", "Cerrar"                             |
| Empty State         | "Resumen IA disponible al tener ≥2 quotes"             |
| Loading State       | Skeleton                                                |
| Error State         | Banner                                                  |
| Success State       | Panel con highlights                                    |
| Accessibility Notes | Tabla accesible                                         |
| Responsive Notes    | Mobile colapsa columnas                                 |
| i18n Notes          | Idioma del evento                                       |
| Currency Notes      | Moneda del evento                                       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/quotes/compare`
* Components:

  * `QuoteComparator`, `AIComparisonSummary`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `aiApi.generateQuoteSummary`

### Backend

* Use Case / Service:

  * `GenerateQuoteSummaryUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/ai/quote-summary`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `ai_recommendations`, `quotes`
* Constraints:

  * Quotes del mismo event
* Index Considerations:

  * Por `event_id`

### API

| Method | Endpoint                                            | Purpose                       |
| ------ | --------------------------------------------------- | ----------------------------- |
| POST   | `/api/v1/events/:id/ai/quote-summary`               | Resumen IA del comparador     |

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
| TS-01 | Resumen con 2 Quotes                       | Integration |
| TS-02 | Resumen con 5 Quotes                       | Integration |
| TS-03 | E2E desde comparador                       | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | 1 Quote                               | 400                      |
| NT-02 | Quotes ajenas                         | 403/404                  |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Mock devuelve resumen                    | Panel mostrado            |
| AI-TS-02 | Timeout                                  | Error / fallback         |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Panel accesible y navegable.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tiempo a decisión, satisfacción del organizador      |
| Expected Impact     | Mejora decisiones                                    |
| Success Criteria    | ≥ 40% usuarios pide resumen al comparar              |
| Academic Demo Value | IA informativa con HITL claro                         |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Panel resumen IA + integración con comparador.

### Potential Backend Tasks

* Use case + prompt.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Prompt "QuoteCompareSummaryPrompt v1".

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

* [ ] Funcional.
* [ ] HITL enforced.
* [ ] Tests deterministas.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar UI del resumen vs comparador (panel lateral vs modal).

# 🧾 User Story: Autocompletar brief de cotización con IA

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-021                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | AI-005 Brief autocompletado          |
| Module / Domain    | AI / Quotes                          |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador a punto de enviar una QuoteRequest a un proveedor
**I want** que la IA autocomplete un brief estructurado a partir del evento y la categoría
**So that** envíe solicitudes claras al proveedor sin escribir todo desde cero

---

## 🧠 Business Context

### Context Summary

AI-005 genera un brief estructurado (objetivo, alcance, requisitos, preguntas clave) que precarga el formulario de envío de QuoteRequest. El organizador puede editar antes de enviar.

### Related Domain Concepts

* QuoteRequest.brief (texto/JSON estructurado).
* AIRecommendation (type='quote_brief').

### Assumptions

* La categoría del vendor target se conoce.
* El brief es editable en el formulario.

### Dependencies

* US-009.
* EPIC-QR-001.
* EPIC-AI-001.

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-AI-007, FR-QUOTE-002                   |
| Use Case(s)            | UC-AI-005                                |
| Business Rule(s)       | BR-AI-001..005, BR-QUOTE-002             |
| Permission Rule(s)     | Ownership                                |
| Data Entity / Entities | Event, ServiceCategory, AIRecommendation, QuoteRequest |
| API Endpoint(s)        | POST /api/v1/events/:id/ai/quote-brief   |
| NFR Reference(s)       | NFR-AI-001                               |
| Related ADR(s)         | ADR-AI-001                               |
| Related Document(s)    | /docs/7, /docs/8                         |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Envío automático del brief al vendor.
* Negociación IA con el vendor.

### Scope Notes

* La IA precarga; el usuario revisa y envía.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Brief precargado

**Given** organizador en formulario nueva QuoteRequest
**When** clic "Autocompletar con IA"
**Then** se invoca LLM, se devuelve brief estructurado, se precarga el form (editable).

### AC-02: Persistencia tras envío

**Given** brief editado y enviado
**When** se crea QuoteRequest
**Then** `brief` queda con texto final + `AIRecommendation` enlazada.

---

## ⚠️ Edge Cases

### EC-01: Cancelar pre-envío

**Given** brief precargado
**When** el organizador descarta
**Then** se borra el contenido del form y se marca AIRecommendation `discarded`.

#### Handling

* Sin enviar QuoteRequest.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior          |
| ----- | ------------------------------------------------- | --------------------------- |
| VR-01 | Evento propio                                     | 403/404                     |
| VR-02 | Categoría existente                               | 400                         |
| VR-03 | Brief < N caracteres                              | "Brief demasiado largo"     |

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

* AI Feature: AI-005
* Provider Layer: LLMProvider
* Human Validation Required: Yes
* Persist AIRecommendation: Yes
* Fallback Required: Yes

### AI Input

* `event.event_type_code`, `event.guest_count`, `event.budget_estimated`, `event.currency`, `event.language`, `category.slug`

### AI Output

* JSON: `brief: { objective, scope, requirements[], questions[] }`

### Human-in-the-loop Rules

* Editable antes de enviar.
* Si se envía: brief final = post-edición.

### AI Error / Fallback Behavior

* Mismas políticas.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | `/[locale]/organizer/events/:id/quotes/new`            |
| Main UI Pattern     | Form con sección "IA precargada" + editor              |
| Primary Action      | "Enviar a proveedor"                                   |
| Secondary Actions   | "Autocompletar con IA", "Regenerar", "Descartar"        |
| Empty State         | Form vacío con botón "Autocompletar IA"                 |
| Loading State       | Skeleton                                                |
| Error State         | Banner                                                  |
| Success State       | Form precargado                                         |
| Accessibility Notes | Labels claros                                           |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | Idioma del evento                                       |
| Currency Notes      | Brief puede mencionar montos en moneda del evento       |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/quotes/new`
* Components:

  * `QuoteRequestForm`, `AIBriefAutocomplete`
* State Management:

  * TanStack
* Forms:

  * RHF + Zod
* API Client:

  * `aiApi.generateBrief`, `quotesApi.createRequest`

### Backend

* Use Case / Service:

  * `GenerateQuoteBriefUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/ai/quote-brief`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * No (solo persistir AIRecommendation)

### Database

* Main Tables:

  * `ai_recommendations`, `quote_requests`
* Constraints:

  * AIRecommendation enlazada por `event_id` y referencia a QuoteRequest cuando se cree
* Index Considerations:

  * Por `event_id`

### API

| Method | Endpoint                                            | Purpose             |
| ------ | --------------------------------------------------- | ------------------- |
| POST   | `/api/v1/events/:id/ai/quote-brief`                 | Generar brief IA    |

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
| TS-01 | Generación brief y precarga                | Integration |
| TS-02 | Edición y envío de QuoteRequest            | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Ajeno                                 | 403/404                  |
| NT-02 | Vendor                                | 403                      |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Mock genera brief válido                 | Form precargado           |
| AI-TS-02 | Timeout                                  | Error / fallback         |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Editor accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tasa de envío de QuoteRequest                         |
| Expected Impact     | Reduce fricción de escritura                          |
| Success Criteria    | ≥ 50% briefs IA enviados sin re-escritura completa    |
| Academic Demo Value | Conecta IA con marketplace                            |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Form con autocompletado IA.
* Edición previa al envío.

### Potential Backend Tasks

* Use case + integración.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Prompt "QuoteBriefPrompt v1".

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

* [ ] Endpoint + UI operativos.
* [ ] HITL enforced.
* [ ] Tests deterministas.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar longitud máxima del brief.

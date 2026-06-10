# 🧾 User Story: Prompts IA respetan el idioma del evento

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-084                                  |
| Epic               | EPIC-I18N-001                                |
| Feature            | Soporte i18n IA                             |
| Module / Domain    | I18N / AI                              |
| User Role          | System                                |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As the** sistema IA  \n**I want** incluir el idioma del evento en cada prompt  \n**So that** las salidas IA estén en el idioma esperado

---

## 🧠 Business Context

### Context Summary
Backend inyecta language_code en cada prompt.

### Related Domain Concepts
* AIRecommendation, Event.language

### Assumptions
* Política definida en docs MVP.

### Dependencies
* Dependencias de su epic.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-AI-017                                |
| Use Case(s)            | UC-AI-001..009                                 |
| Business Rule(s)       | BR-AI-011                                 |
| Permission Rule(s)     | Según rol System                     |
| Data Entity / Entities | AIRecommendation, Event.language                          |
| API Endpoint(s)        | POST /api/v1/events/:id/ai/*                          |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/3, /docs/8, /docs/15         |

---

## 🧭 Scope Guardrails

### MVP Scope
* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope
* Funciones avanzadas no listadas en MVP.

### Scope Notes
* Respetar guardrails MVP.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Flujo principal
**Given** contexto válido del actor System
**When** ejecuta la acción descrita
**Then** se produce el resultado esperado conforme a FR-AI-017.

### AC-02: Persistencia
**Given** acción exitosa
**When** se persiste
**Then** se registran logs.

---

## ⚠️ Edge Cases

### EC-01: Estado inválido
**Given** entidad en estado no permitido
**When** se intenta acción
**Then** 409.

#### Handling
* Validación state machine.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | DTOs Zod                         | 400                         |
| VR-02 | Ownership / Assignment          | 403/404                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sólo rol autorizado (System).                                         |
| SEC-02 | Backend enforced.                                                    |

### Negative Authorization Scenarios
* Roles incorrectos → 403.

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

| Area                | Notes                                  |
| ------------------- | -------------------------------------- |
| Screen / Route      | Layout correspondiente                   |
| Main UI Pattern     | Form / Lista / Modal                      |
| Primary Action      | Acción principal                          |
| Secondary Actions   | Cancelar                                |
| Empty State         | Estado vacío                              |
| Loading State       | Skeleton / Spinner                       |
| Error State         | Banner inline                             |
| Success State       | Toast                                   |
| Accessibility Notes | Componentes accesibles                   |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Si aplica, moneda del evento              |

---

## 🛠 Technical Notes

### Frontend
* Route / Page: Rutas correspondientes
* Components: Reusables
* State Management: TanStack
* Forms: RHF + Zod
* API Client: API client del módulo

### Backend
* Use Case / Service: UseCase específico
* Controller / Route: POST /api/v1/events/:id/ai/*
* Authorization Policy: Según rol
* Validation: Zod
* Transaction Required: Sí

### Database
* Main Tables: AIRecommendation, Event.language
* Constraints: Según dominio
* Index Considerations: Por id

### API

| Method | Endpoint                          | Purpose             |
| ------ | --------------------------------- | ------------------- |
| —      | POST /api/v1/events/:id/ai/*                         | Operación           |

### Observability / Audit
* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: Si rol admin
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Happy path                         | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Sin permisos                          | 403                      |

### AI Tests
Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | System autorizado    | 200             |
| AUTH-TS-02 | Otro rol           | 403             |

### Accessibility Tests
* Navegación por teclado.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Salud del producto                                   |
| Expected Impact     | Capacidad relevante                                   |
| Success Criteria    | Funcional                                            |
| Academic Demo Value | Demuestra capacidad                                   |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks
* UI específica.

### Potential Backend Tasks
* Use case + endpoint.

### Potential Database Tasks
* Migración si necesaria.

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

* [ ] Funcional.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes
* Confirmar detalles con PO.

# 🧾 User Story: Implementar prompt registry versionado

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-121                                  |
| Epic               | EPIC-AI-001                                |
| Feature            | Prompt registry + AIPromptVersion                             |
| Module / Domain    | AI/Platform                              |
| User Role          | System                                |
| Priority           | Must Have (P0)                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As the** sistema  \n**I want** un registry estático versionado en código y tabla AIPromptVersion  \n**So that** PromptOps sea trazable

---

## 🧠 Business Context

### Context Summary
Una versión por prompt; persistir uso.

### Related Domain Concepts
* AIPromptVersion

### Assumptions
* Política definida en docs MVP.

### Dependencies
* Dependencias del epic.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-AI-016                                |
| Use Case(s)            | —                                 |
| Business Rule(s)       | BR-AI-009                                 |
| Permission Rule(s)     | Según rol System                     |
| Data Entity / Entities | AIPromptVersion                          |
| API Endpoint(s)        | —                          |
| NFR Reference(s)       | NFR-SEC-*, NFR-OBS-*, NFR-PERF-*    |
| Related ADR(s)         | ADR-SEC-001, ADR-DEVOPS-001         |
| Related Document(s)    | /docs/12, /docs/13, /docs/17, /docs/19, /docs/20, /docs/21, /docs/22 |

---

## 🧭 Scope Guardrails

### MVP Scope
* Scope Classification: In Scope
* MVP Relevance: Must Have (P0)

### Explicitly Out of Scope
* Funciones futuras no listadas en Epic Map.

### Scope Notes
* Respetar guardrails MVP.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Capacidad operativa
**Given** entorno preparado
**When** se aplica la capacidad
**Then** cumple FR/NFR y pasa pruebas.

### AC-02: Validación end-to-end
**Given** suite ejecutándose
**When** se valida
**Then** smoke tests pasan en Local/CI/QA/Demo.

---

## ⚠️ Edge Cases

### EC-01: Configuración inconsistente
**Given** env mal configurado
**When** se inicia
**Then** fail-fast con mensaje claro.

#### Handling
* Validación al boot.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Configuración + secrets correctos | Fail-fast                 |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Aplicar seguridad por defecto.                                       |
| SEC-02 | Secrets en Secrets Manager.                                          |
| SEC-03 | Sin secretos en logs.                                                |

### Negative Authorization Scenarios
* Configuración insegura → no deploy.

---

## 🤖 AI Behavior

This story does not invoke AI directly (a menos que sea EPIC-AI-001).

### AI Involvement
* AI Feature: None
* Provider Layer: LLMProvider (si aplica EPIC-AI-001)
* Human Validation Required: Si aplica
* Persist AIRecommendation: Si aplica
* Fallback Required: Si aplica

### AI Input
* Not applicable for this story (a menos que se indique).

### AI Output
* Not applicable for this story (a menos que se indique).

### Human-in-the-loop Rules
* HITL aplica cuando hay IA invocada.

### AI Error / Fallback Behavior
* Si aplica IA, timeout 60s + fallback Mock.

---

## 🎨 UX / UI Notes

| Area                | Notes                                  |
| ------------------- | -------------------------------------- |
| Screen / Route      | N/A (técnica)                            |
| Main UI Pattern     | N/A                                      |
| Primary Action      | N/A                                      |
| Secondary Actions   | N/A                                      |
| Empty State         | N/A                                      |
| Loading State       | N/A                                      |
| Error State         | N/A                                      |
| Success State       | N/A                                      |
| Accessibility Notes | Aplica si tiene UI                       |
| Responsive Notes    | Aplica si tiene UI                       |
| i18n Notes          | Aplica si tiene UI                       |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend
* Route / Page: N/A
* Components: Setup
* State Management: N/A
* Forms: N/A
* API Client: Si aplica

### Backend
* Use Case / Service: Capacidad técnica
* Controller / Route: —
* Authorization Policy: Aplica según endpoint
* Validation: Zod en boundary
* Transaction Required: Según operación

### Database
* Main Tables: AIPromptVersion
* Constraints: Según schema
* Index Considerations: Según queries

### API

| Method | Endpoint                          | Purpose             |
| ------ | --------------------------------- | ------------------- |
| —      | —                         | Capacidad           |

### Observability / Audit
* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: Si aplica
* AIRecommendation Required: Si aplica

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Capacidad operativa                | Unit/Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Configuración inválida                | Fail-fast                |

### AI Tests
| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Si aplica IA: Mock determinista          | OK                        |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Setup completado    | Success         |

### Accessibility Tests
* Aplica si tiene UI.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Salud técnica, time-to-deploy, calidad                |
| Expected Impact     | Habilita features producto                            |
| Success Criteria    | Smoke verde en CI                                     |
| Academic Demo Value | Foundation técnica                                    |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks
* Si aplica.

### Potential Backend Tasks
* Configuración + endpoints.

### Potential Database Tasks
* Migraciones si aplica.

### Potential AI / PromptOps Tasks
* Si aplica EPIC-AI-001.

### Potential QA Tasks
* Smoke + unit + integration.

### Potential DevOps / Config Tasks
* Variables de entorno, secrets, pipeline.

---

## ✅ Definition of Ready

* [x] Rol claro (System).
* [x] Goal técnico claro.
* [x] Referencias a Docs.
* [x] Permisos / Seguridad.
* [x] Entidades listadas.
* [x] AC en GWT.
* [x] Edge cases documentados.
* [x] Validación clara.
* [x] Out of Scope explícito.
* [x] Dependencias conocidas.
* [x] UX states identificados.
* [x] API definida.
* [x] Tests definidos.
* [ ] Tech Lead validó.

---

## 🏁 Definition of Done

* [ ] Capacidad operativa.
* [ ] Tests verdes.
* [ ] Tech Lead valida.

---

## 📝 Notes
* Confirmar configuración con Tech Lead.

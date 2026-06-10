# 🧾 User Story: Confirmar tareas IA en bloque

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-031                               |
| Epic               | EPIC-TASK-001                        |
| Feature            | Confirmación bulk de tareas IA       |
| Module / Domain    | Tasks / AI                           |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador con un set de tareas IA pendientes de confirmar
**I want** confirmar varias en bloque
**So that** acelere la activación del checklist sin un clic por tarea

---

## 🧠 Business Context

### Context Summary

Cubre HITL en masa para AI-002. Tareas marcadas `ai_generated=true` se confirman juntas. Transacciónal.

### Related Domain Concepts

* EventTask bulk confirm.
* AIRecommendation linked.

### Assumptions

* La selección sucede en UI.

### Dependencies

* US-018 (AI-002).
* US-025 (HITL).

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-TASK-006, FR-AI-016              |
| Use Case(s)            | UC-TASK-005                        |
| Business Rule(s)       | BR-TASK-005, BR-AI-013              |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | EventTask, AIRecommendation         |
| API Endpoint(s)        | POST /api/v1/events/:id/tasks/confirm-bulk |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | ADR-AI-001                         |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Confirmación automática IA.

### Scope Notes

* Sólo tareas IA pueden confirmarse así.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Confirmación bulk

**Given** N tareas IA seleccionadas
**When** se envían IDs
**Then** se actualizan a estado activo y se marca AIRecommendation accepted.

### AC-02: Fallo parcial atómico

**Given** una de las tareas falla validación
**When** se ejecuta el bulk
**Then** rollback transaccional; ninguna queda confirmada.

---

## ⚠️ Edge Cases

### EC-01: IDs duplicados

**Given** lista con duplicados
**When** se procesa
**Then** se deduplican.

#### Handling

* Set en backend.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | IDs pertenecen al evento        | 400                         |
| VR-02 | Tareas con `ai_generated=true`  | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Operación atómica.                                                   |

### Negative Authorization Scenarios

* Ajeno → 403/404.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: HITL bulk para AI-002
* Provider Layer: Not applicable
* Human Validation Required: Yes
* Persist AIRecommendation: Yes (update)
* Fallback Required: No

### AI Input

* Lista de task_ids.

### AI Output

* Tareas confirmadas.

### Human-in-the-loop Rules

* Esta historia ES la HITL.

### AI Error / Fallback Behavior

* No aplica.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | Lista tareas con sección IA pending                     |
| Main UI Pattern     | Multi-select + barra de acciones                        |
| Primary Action      | "Confirmar seleccionadas"                              |
| Secondary Actions   | "Seleccionar todas", "Descartar seleccionadas"          |
| Empty State         | "No hay tareas IA por confirmar"                       |
| Loading State       | Spinner                                                 |
| Error State         | Toast                                                   |
| Success State       | Toast + actualización                                   |
| Accessibility Notes | Checkboxes accesibles                                   |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Lista tareas
* Components:

  * `BulkConfirmBar`
* State Management:

  * TanStack
* Forms:

  * Selección checkboxes
* API Client:

  * `tasksApi.confirmBulk(eventId, ids)`

### Backend

* Use Case / Service:

  * `ConfirmAITasksBulkUseCase`
* Controller / Route:

  * `POST /api/v1/events/:id/tasks/confirm-bulk`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * Sí (atómico)

### Database

* Main Tables:

  * `event_tasks`, `ai_recommendations`
* Constraints:

  * `ai_generated=true`
* Index Considerations:

  * Por `event_id`

### API

| Method | Endpoint                                            | Purpose                  |
| ------ | --------------------------------------------------- | ------------------------ |
| POST   | `/api/v1/events/:id/tasks/confirm-bulk`             | Confirmar tareas IA bulk |

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
| TS-01 | Confirmar 5 tareas IA                     | Integration |
| TS-02 | Rollback en error parcial                  | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | IDs no IA                             | 400                      |
| NT-02 | Ajeno                                 | 403/404                  |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | AIRecommendations actualizadas          | accepted                  |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Checkboxes accesibles.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tasa de adopción IA                                  |
| Expected Impact     | Reduce fricción del HITL                              |
| Success Criteria    | ≥ 70% tareas IA confirmadas                          |
| Academic Demo Value | Demuestra eficiencia HITL                             |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Multi-select + barra.

### Potential Backend Tasks

* Use case atómico.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests + atomicidad.

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

* [ ] Endpoint atómico.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar límite N (sugerido 50 por request).

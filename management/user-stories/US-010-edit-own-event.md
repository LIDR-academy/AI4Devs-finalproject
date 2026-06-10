# 🧾 User Story: Editar mi evento (excepto moneda)

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-010                               |
| Epic               | EPIC-EVT-001 — Organizer Event Management |
| Feature            | Edición de evento propio             |
| Module / Domain    | Events                               |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador autenticado
**I want** editar los datos de mi evento (excepto moneda) mientras esté en estado válido para edición
**So that** mantenga la información alineada con los cambios de la planificación

---

## 🧠 Business Context

### Context Summary

La edición es necesaria para ajustar fecha, invitados, ciudad o presupuesto estimado. La moneda es inmutable post-creación (Decisión PO 8.1 #7). En estados `draft` y `active` es editable; en `completed`/`cancelled` es solo lectura. El admin nunca puede editar el evento del organizador (Decisión PO 8.1 #16).

### Related Domain Concepts

* Event lifecycle (draft, active, completed, cancelled).
* Inmutabilidad de moneda.
* Ownership.

### Assumptions

* La edición no aplica a campos derivados (status, owner, created_at).
* Algunos cambios podrían disparar reglas (e.g., cambio de fecha afecta tareas T-x).

### Dependencies

* US-009 (creación).
* EPIC-API-001 (DTOs).

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-EVENT-004, FR-EVENT-006, FR-EVENT-008  |
| Use Case(s)            | UC-EVENT-002                             |
| Business Rule(s)       | BR-EVENT-006..010                        |
| Permission Rule(s)     | Ownership: sólo el dueño edita           |
| Data Entity / Entities | Event                                    |
| API Endpoint(s)        | PATCH /api/v1/events/:id                 |
| NFR Reference(s)       | NFR-PERF-API-001                         |
| Related ADR(s)         | ADR-BE-00n                               |
| Related Document(s)    | /docs/8.1 (#7 #16)                       |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Cambio de moneda.
* Cambio de `owner_user_id`.
* Edición por admin (read-only para admin).

### Scope Notes

* No introduce historial completo de cambios (audit log básico suficiente).
* No introduce re-aprobaciones por cambios.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Edición exitosa de campos permitidos

**Given** un evento `draft` o `active` propio
**When** el organizador edita fecha/invitados/ciudad/presupuesto y guarda
**Then** el backend actualiza los campos permitidos, mantiene `currency`, responde 200.

### AC-02: Recálculo derivado

**Given** se cambia la fecha del evento
**When** se guarda
**Then** las tareas T-x se recalculan a sus fechas absolutas (handler interno).

### AC-03: Edición bloqueada en estados finales

**Given** un evento `completed` o `cancelled`
**When** intenta editar
**Then** 409 / 403 `EVENT_LOCKED`.

---

## ⚠️ Edge Cases

### EC-01: Intento de cambiar moneda

**Given** el DTO incluye `currency`
**When** se procesa
**Then** backend ignora el campo (whitelist) o rechaza con 400 si se valida estrictamente.

#### Handling

* Whitelist; nunca permite mutar `currency`.

---

### EC-02: Fecha posterior cambia tareas T-x

**Given** el evento tiene tareas IA con fechas relativas
**When** se cambia la fecha del evento
**Then** las fechas absolutas se recalculan; las modificaciones manuales del usuario se preservan.

#### Handling

* Política: respetar overrides manuales.

---

## 🚫 Validation Rules

| ID    | Rule                                          | Message / Behavior                |
| ----- | --------------------------------------------- | --------------------------------- |
| VR-01 | Fecha futura                                  | "Fecha inválida"                  |
| VR-02 | Invitados 1..10000                            | "Invitados inválidos"             |
| VR-03 | Presupuesto ≥ 0                               | "Presupuesto inválido"            |
| VR-04 | Currency no editable                          | Ignorado / 400                    |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership policy enforced en backend.                               |
| SEC-02 | Admin no puede editar.                                              |
| SEC-03 | Whitelist de campos editables.                                      |
| SEC-04 | Audit log básico (`event.updated`).                                  |

### Negative Authorization Scenarios

* Otro organizador → 403/404.
* Admin → 403.
* Vendor → 403.

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

| Area                | Notes                                                       |
| ------------------- | ----------------------------------------------------------- |
| Screen / Route      | `/[locale]/organizer/events/:id/edit`                       |
| Main UI Pattern     | Form con campos editables y campo readonly de moneda         |
| Primary Action      | "Guardar cambios"                                           |
| Secondary Actions   | Cancelar                                                    |
| Empty State         | No aplica                                                   |
| Loading State       | Spinner                                                     |
| Error State         | Mensajes inline y banner                                    |
| Success State       | Toast + retorno al dashboard                                |
| Accessibility Notes | Labels claros, foco al primer error                         |
| Responsive Notes    | Mobile-first                                                |
| i18n Notes          | 4 locales                                                   |
| Currency Notes      | Mostrar moneda como readonly con tooltip explicativo        |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/:id/edit`
* Components:

  * `EventEditForm`
* State Management:

  * RHF + Zod; TanStack `useUpdateEvent`
* Forms:

  * Currency readonly
* API Client:

  * `eventsApi.update(id, payload)`

### Backend

* Use Case / Service:

  * `UpdateEventUseCase`
* Controller / Route:

  * `PATCH /api/v1/events/:id`
* Authorization Policy:

  * Ownership + status válido
* Validation:

  * `UpdateEventDTO` con whitelist
* Transaction Required:

  * Sí (update + recálculo de tareas T-x si aplica)

### Database

* Main Tables:

  * `events`, `event_tasks`
* Constraints:

  * `currency` inmutable
* Index Considerations:

  * Índice por (`event_id`, `due_date`) para recálculo

### API

| Method | Endpoint                          | Purpose          |
| ------ | --------------------------------- | ---------------- |
| PATCH  | `/api/v1/events/:id`              | Actualizar evento |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`event.updated`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                              | Type        |
| ----- | ----------------------------------------------------- | ----------- |
| TS-01 | Update válido en draft                                | Integration |
| TS-02 | Update válido en active                               | Integration |
| TS-03 | Recálculo de tareas T-x al cambiar fecha              | Integration |
| TS-04 | E2E desde dashboard                                   | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Intentar cambiar currency             | Ignorado / 400           |
| NT-02 | Otro organizador edita ajeno          | 403/404                  |
| NT-03 | Edición en completed                  | 409 EVENT_LOCKED         |
| NT-04 | Admin intenta editar                  | 403                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result |
| ---------- | --------------------------------- | --------------- |
| AUTH-TS-01 | Dueño edita                       | 200             |
| AUTH-TS-02 | Otro organizador                  | 403/404         |
| AUTH-TS-03 | Admin                             | 403             |

### Accessibility Tests

* Form accesible por teclado.
* Mensajes de error con aria-live.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad de datos del evento                          |
| Expected Impact     | Permite mantener evento actualizado                  |
| Success Criteria    | Tasa de update exitosa > 99%                         |
| Academic Demo Value | Muestra control del dueño y reglas de inmutabilidad   |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Form de edición con currency readonly.
* Mutation y manejo de errores.

### Potential Backend Tasks

* Use case con whitelist.
* Recálculo de tareas T-x.
* Ownership policy.

### Potential Database Tasks

* Asegurar constraint de currency inmutable (DB trigger o validación a nivel app).

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

* [ ] Endpoint y form operativos.
* [ ] Currency inmutable verificado.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar política de recálculo vs override manual de tareas.
* Considerar audit trail de cambios para futuras consultas.

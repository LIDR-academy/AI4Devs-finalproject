# 🧾 User Story: Crear un evento mediante wizard

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-009                               |
| Epic               | EPIC-EVT-001 — Organizer Event Management |
| Feature            | Wizard de creación de eventos        |
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

**As an** organizador autenticado en EventFlow
**I want** crear un nuevo evento mediante un wizard guiado (tipo, fecha, invitados, ciudad, presupuesto estimado, moneda, idioma)
**So that** pueda empezar a planificar mi celebración y desbloquear las features IA y de cotización

---

## 🧠 Business Context

### Context Summary

El wizard de creación es el punto de partida de toda la planificación. Soporta 6 tipos canónicos (wedding, xv, baptism, baby_shower, birthday, corporate) y establece la moneda inmutable y el idioma del evento. Sin un evento creado, no es posible solicitar plan IA, checklist, presupuesto, ni cotizaciones.

### Related Domain Concepts

* Event (estado inicial `draft`).
* EventType (lookup canónico).
* Moneda inmutable post-creación (Decisión PO 8.1 #7).
* Idioma del evento.

### Assumptions

* La lista de `EventType` está sembrada por el admin.
* El organizador es dueño del evento creado (`owner_user_id`).
* La moneda local del país se infiere del input.

### Dependencies

* US-001 (registro organizador) y US-003 (sesión).
* EPIC-DB-001 (entidad Event y constraints).

---

## 🔗 Traceability

| Source                 | Reference                                                |
| ---------------------- | -------------------------------------------------------- |
| FRD Requirement(s)     | FR-EVENT-001, FR-EVENT-002, FR-EVENT-003, FR-EVENT-008    |
| Use Case(s)            | UC-EVENT-001                                             |
| Business Rule(s)       | BR-EVENT-001..005, BR-EVENTTYPE-001..003                 |
| Permission Rule(s)     | Sólo Organizer puede crear; ownership desde la creación  |
| Data Entity / Entities | Event, EventType, Location, User                         |
| API Endpoint(s)        | POST /api/v1/events                                      |
| NFR Reference(s)       | NFR-PERF-API-001                                         |
| Related ADR(s)         | ADR-BE-00n                                               |
| Related Document(s)    | /docs/6, /docs/8.1 (#6 #7)                               |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* RSVP, lista de invitados, plano de mesas.
* Multi-colaboradores por evento.
* Cambio de moneda post-creación.
* Integración a calendario externo (Google/Outlook).

### Scope Notes

* No introduce pagos reales.
* No introduce real-time chat.
* No introduce conversión automática de moneda.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Wizard completa creación

**Given** un organizador autenticado
**When** completa los 4 pasos del wizard con datos válidos y confirma
**Then** se crea un `Event` con `status=draft`, `owner_user_id`, `currency` inmutable e `idioma`; redirige al dashboard del evento.

### AC-02: Todos los tipos soportados

**Given** los 6 EventType activos
**When** el organizador selecciona cualquiera
**Then** el evento se crea con el `event_type` correspondiente.

### AC-03: Idioma del evento por defecto

**Given** el organizador con `preferred_language=es-LATAM`
**When** no modifica el idioma en el wizard
**Then** el evento hereda `es-LATAM`.

---

## ⚠️ Edge Cases

### EC-01: Fecha en el pasado

**Given** la fecha del evento es anterior a hoy
**When** intenta guardar
**Then** 400 `VALIDATION_ERROR`.

#### Handling

* Validación frontend y backend.

---

### EC-02: Moneda no soportada

**Given** intenta enviar moneda fuera de {GTQ, EUR, MXN, COP, USD, locales soportadas}
**When** envía
**Then** 400 `INVALID_CURRENCY`.

#### Handling

* Enum en backend.

---

### EC-03: EventType inactivo

**Given** un EventType deshabilitado por admin
**When** lo selecciona
**Then** backend rechaza con 400.

#### Handling

* Lista pública sólo muestra activos.

---

## 🚫 Validation Rules

| ID    | Rule                                                  | Message / Behavior                |
| ----- | ----------------------------------------------------- | --------------------------------- |
| VR-01 | EventType obligatorio y activo                        | "Tipo de evento requerido"        |
| VR-02 | Fecha futura, formato ISO 8601                        | "Fecha inválida o pasada"         |
| VR-03 | Invitados entero 1..10000                             | "Número de invitados inválido"    |
| VR-04 | Ciudad/País obligatorios                              | "Ubicación requerida"             |
| VR-05 | Presupuesto numérico ≥ 0                              | "Presupuesto inválido"            |
| VR-06 | Moneda ∈ {GTQ, EUR, MXN, COP, USD, ...}               | "Moneda no soportada"             |
| VR-07 | Idioma del evento ∈ 4 locales                         | "Idioma no soportado"             |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Endpoint requiere rol Organizer.                                    |
| SEC-02 | `owner_user_id` se setea desde la sesión (no del payload).          |
| SEC-03 | Ownership policy desde la creación.                                 |
| SEC-04 | DTO validado con Zod; campos inmutables rechazados (currency post). |

### Negative Authorization Scenarios

* Vendor intenta crear → 403.
* Admin intenta crear → 403.
* Anónimo → 401.

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

| Area                | Notes                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| Screen / Route      | `/[locale]/organizer/events/new`                                      |
| Main UI Pattern     | Wizard de 4 pasos (Tipo → Fecha y lugar → Invitados y presupuesto → Confirmación) |
| Primary Action      | "Crear evento"                                                        |
| Secondary Actions   | "Atrás", "Guardar borrador y salir"                                   |
| Empty State         | No aplica                                                             |
| Loading State       | Spinner en submit                                                     |
| Error State         | Mensaje inline y banner                                               |
| Success State       | Redirect al dashboard + toast                                         |
| Accessibility Notes | Stepper con aria-current, focus al cambiar paso                       |
| Responsive Notes    | Mobile-first                                                          |
| i18n Notes          | 4 locales                                                             |
| Currency Notes      | Selector muestra códigos y nombres locales; moneda inmutable post-creación |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/events/new`
* Components:

  * `EventCreationWizard`, `StepIndicator`, `EventSummary`
* State Management:

  * Form state en RHF; persistencia draft en localStorage opcional
* Forms:

  * Zod schema por paso, validación al avanzar
* API Client:

  * `eventsApi.create(payload)`

### Backend

* Use Case / Service:

  * `CreateEventUseCase`
* Controller / Route:

  * `POST /api/v1/events`
* Authorization Policy:

  * RBAC: Organizer
* Validation:

  * `CreateEventDTO`
* Transaction Required:

  * No (insertar evento + posibles relaciones lookup)

### Database

* Main Tables:

  * `events`, `event_types`, `locations`
* Constraints:

  * `events.currency` inmutable
  * FK `event_type_id`
* Index Considerations:

  * Índices por `owner_user_id`, `status`

### API

| Method | Endpoint                          | Purpose                              |
| ------ | --------------------------------- | ------------------------------------ |
| POST   | `/api/v1/events`                  | Crear evento                         |
| GET    | `/api/v1/event-types`             | Listar tipos activos                 |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`event.created`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                              | Type        |
| ----- | ----------------------------------------------------- | ----------- |
| TS-01 | Creación con los 6 EventType                          | Integration |
| TS-02 | Moneda inmutable: PATCH posterior rechaza             | API         |
| TS-03 | Wizard E2E del organizador                            | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Fecha en el pasado                    | 400                      |
| NT-02 | Moneda no soportada                   | 400                      |
| NT-03 | Vendor intenta crear                  | 403                      |
| NT-04 | EventType inactivo                    | 400                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result |
| ---------- | --------------------------------- | --------------- |
| AUTH-TS-01 | Organizer crea                    | 201             |
| AUTH-TS-02 | Vendor                            | 403             |
| AUTH-TS-03 | Anónimo                           | 401             |

### Accessibility Tests

* Wizard navegable por teclado.
* Stepper accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Activation Rate, Tiempo hasta primer evento creado   |
| Expected Impact     | Punto de inicio de toda la planificación             |
| Success Criteria    | ≥ 80% completan wizard sin abandono                  |
| Academic Demo Value | Demo arranca aquí para el flujo de organizador        |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Wizard de 4 pasos.
* Validaciones por paso.
* Selector de moneda e idioma.

### Potential Backend Tasks

* `CreateEventUseCase` y endpoint.
* Validar EventType activo.
* Setear owner desde sesión.

### Potential Database Tasks

* Constraint inmutable de moneda.
* Índices por owner y status.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests positivos/negativos.
* E2E.

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

* [ ] Wizard implementado y publicado.
* [ ] Backend valida moneda inmutable.
* [ ] Tests E2E pasan.
* [ ] PO valida.

---

## 📝 Notes

* Considerar guardado de borrador parcial en localStorage para continuar.
* Confirmar lista mínima de monedas inicial.

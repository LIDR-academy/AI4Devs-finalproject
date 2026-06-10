# 🧾 User Story: Crear reseña verificada con escala 1-5

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-065                               |
| Epic               | EPIC-REV-001 — Reviews & Moderation  |
| Feature            | Creación de reseña                   |
| Module / Domain    | Reviews                              |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador con BookingIntent.confirmed_intent con un vendor
**I want** crear una reseña verificada (1-5, 5=mejor) y comentario
**So that** mi experiencia sea visible en el perfil del vendor

---

## 🧠 Business Context

### Context Summary

Decisión PO 8.1 #1: escala 1-5 (5 mejor). Una reseña por (event, vendor). Verificación: existe BookingIntent.confirmed_intent.

### Related Domain Concepts

* Review.

### Assumptions

* No anónima.

### Dependencies

* US-061.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-REVIEW-001                       |
| Use Case(s)            | UC-REVIEW-001                      |
| Business Rule(s)       | BR-REVIEW-001, BR-REVIEW-002        |
| Permission Rule(s)     | Ownership + elegibilidad           |
| Data Entity / Entities | Review                             |
| API Endpoint(s)        | POST /api/v1/reviews                |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8.1 (#1)                     |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Reseñas anónimas.
* Moderación automática IA.

### Scope Notes

* Estricta verificación.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Reseña creada

**Given** organizer con confirmed_intent con vendor
**When** crea reseña con rating 4 y comentario
**Then** se persiste y visible en perfil vendor.

### AC-02: Una por (event, vendor)

**Given** ya existe reseña
**When** intenta otra
**Then** 409.

---

## ⚠️ Edge Cases

### EC-01: Sin elegibilidad

**Given** sin confirmed_intent
**When** intenta
**Then** 403 `NOT_ELIGIBLE`.

#### Handling

* Validación.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Rating 1-5                       | 400                         |
| VR-02 | Comentario ≤ 2000 chars         | 400                         |
| VR-03 | Elegibilidad por BookingIntent  | 403                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership del evento.                                                |
| SEC-02 | Validar BookingIntent.confirmed_intent.                              |

### Negative Authorization Scenarios

* Sin elegibilidad → 403.
* Otro organizer → 403/404.

---

## 🤖 AI Behavior

This story does not invoke AI directly. No hay moderación automática IA.

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
| Screen / Route      | `/[locale]/organizer/events/:id/reviews/new` |
| Main UI Pattern     | Star rating + textarea                   |
| Primary Action      | "Publicar reseña"                      |
| Secondary Actions   | Cancelar                                |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Banner                                  |
| Success State       | Toast + redirect                        |
| Accessibility Notes | Stars con aria-valuenow                  |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Form review
* Components:

  * `StarRating`, `ReviewForm`
* State Management:

  * TanStack
* Forms:

  * RHF + Zod
* API Client:

  * `reviewsApi.create`

### Backend

* Use Case / Service:

  * `CreateReviewUseCase`
* Controller / Route:

  * `POST /api/v1/reviews`
* Authorization Policy:

  * Ownership + elegibilidad
* Validation:

  * Zod
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `reviews`
* Constraints:

  * UNIQUE (event_id, vendor_id)
* Index Considerations:

  * Por vendor_id, rating

### API

| Method | Endpoint                          | Purpose             |
| ------ | --------------------------------- | ------------------- |
| POST   | `/api/v1/reviews`                 | Crear reseña        |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Crear válida                       | Integration |
| TS-02 | Duplicada                          | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Sin elegibilidad                      | 403                      |
| NT-02 | Rating fuera de rango                  | 400                      |
| NT-03 | Otro organizer                        | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                  | Expected Result |
| ---------- | ------------------------- | --------------- |
| AUTH-TS-01 | Organizer elegible        | 201             |
| AUTH-TS-02 | Organizer no elegible      | 403             |

### Accessibility Tests

* Stars accesibles.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Confianza, calidad del directorio                    |
| Expected Impact     | Reseñas verificadas                                  |
| Success Criteria    | ≥ 30% bookings con reseña                            |
| Academic Demo Value | Cierre del ciclo demo                                 |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Form + stars.

### Potential Backend Tasks

* Use case + verificación.

### Potential Database Tasks

* UNIQUE constraint.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests + elegibilidad.

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

* Confirmar ventana temporal (¿reseña hasta N días post-evento?).

# 🧾 User Story: Ver reseñas en perfil del vendor

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-066                               |
| Epic               | EPIC-REV-001                          |
| Feature            | Listado de reseñas                   |
| Module / Domain    | Reviews                              |
| User Role          | Anonymous / Organizer / Vendor       |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** visitante del perfil del vendor
**I want** ver las reseñas publicadas y un promedio
**So that** evalúe la confianza del vendor

---

## 🧠 Business Context

### Context Summary

Reseñas no `removed` ni `hidden` se muestran en el perfil público y privado.

### Related Domain Concepts

* Reviews aggregations.

### Assumptions

* Promedio recalculado.

### Dependencies

* US-065.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-REVIEW-002                       |
| Use Case(s)            | UC-REVIEW-002                      |
| Business Rule(s)       | BR-REVIEW-003                      |
| Permission Rule(s)     | Público                            |
| Data Entity / Entities | Review                             |
| API Endpoint(s)        | GET /api/v1/vendors/:id/reviews     |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Filtros avanzados.

### Scope Notes

* Sólo aprobadas / visibles.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Listado público

**Given** vendor con reseñas
**When** abre perfil
**Then** ve lista + promedio.

### AC-02: Excluir removidas

**Given** reseñas removed
**When** consulta
**Then** no aparecen.

---

## ⚠️ Edge Cases

### EC-01: Sin reseñas

**Given** vendor nuevo
**When** consulta
**Then** estado vacío "Sin reseñas aún".

#### Handling

* Empty state.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Vendor approved                 | 404                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Público.                                                            |

### Negative Authorization Scenarios

* N/A.

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
| Screen / Route      | Perfil vendor                            |
| Main UI Pattern     | Promedio + lista                          |
| Primary Action      | No aplica                              |
| Secondary Actions   | Paginar                                 |
| Empty State         | "Sin reseñas"                           |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Lista                                   |
| Accessibility Notes | Stars accesibles                          |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Perfil vendor (público y privado)
* Components:

  * `ReviewList`, `AverageRating`
* State Management:

  * TanStack
* Forms:

  * No aplica
* API Client:

  * `vendorsApi.reviews(id)`

### Backend

* Use Case / Service:

  * `GetVendorReviewsUseCase`
* Controller / Route:

  * `GET /api/v1/vendors/:id/reviews`
* Authorization Policy:

  * Público
* Validation:

  * UUID
* Transaction Required:

  * No

### Database

* Main Tables:

  * `reviews`
* Constraints:

  * Status visible
* Index Considerations:

  * Por vendor_id, status

### API

| Method | Endpoint                                  | Purpose             |
| ------ | ----------------------------------------- | ------------------- |
| GET    | `/api/v1/vendors/:id/reviews`             | Listar reseñas      |

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
| TS-01 | Lista con promedio                 | Integration |
| TS-02 | Excluye removidas                  | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Vendor no aprobado                    | 404                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Anonymous          | 200             |

### Accessibility Tests

* Stars con aria.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Confianza directorio                                 |
| Expected Impact     | Conversión a QR                                       |
| Success Criteria    | Visible                                              |
| Academic Demo Value | Reseñas verificadas en demo                           |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* ReviewList.

### Potential Backend Tasks

* Endpoint con promedio.

### Potential Database Tasks

* Índice por vendor_id.

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

* Considerar paginación cursor.

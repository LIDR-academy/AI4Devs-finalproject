# 🧾 User Story: Admin oculta/elimina (soft) reseña con auditoría

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-067                               |
| Epic               | EPIC-REV-001                          |
| Feature            | Moderación de reseñas                |
| Module / Domain    | Reviews / Admin                      |
| User Role          | Admin                                |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** administrador
**I want** ocultar o eliminar (soft) una reseña con motivo
**So that** modere contenido inadecuado con auditoría completa (Decisión PO 8.1 #11)

---

## 🧠 Business Context

### Context Summary

Soft delete con `status='removed' | 'hidden'`. AdminAction obligatorio.

### Related Domain Concepts

* Review moderation.
* AdminAction.

### Assumptions

* Sin notif al organizador en MVP.

### Dependencies

* US-065.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-REVIEW-003                       |
| Use Case(s)            | UC-REVIEW-003                      |
| Business Rule(s)       | BR-REVIEW-005, BR-ADMIN-011         |
| Permission Rule(s)     | Admin                              |
| Data Entity / Entities | Review, AdminAction                 |
| API Endpoint(s)        | POST /api/v1/admin/reviews/:id/moderate |
| NFR Reference(s)       | NFR-OBS-001                        |
| Related ADR(s)         | ADR-SEC-002                        |
| Related Document(s)    | /docs/8.1 (#11)                    |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Moderación IA.

### Scope Notes

* Manual.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Ocultar

**Given** review visible
**When** admin oculta con motivo
**Then** `status='hidden'`, AdminAction registrada.

### AC-02: Eliminar (soft)

**Given** review visible
**When** admin elimina con motivo
**Then** `status='removed'`, AdminAction.

---

## ⚠️ Edge Cases

### EC-01: Ya removed

**Given** removed
**When** intenta
**Then** 409.

#### Handling

* State machine.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Motivo obligatorio              | 400                         |
| VR-02 | Status válido                   | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Admin only.                                                         |
| SEC-02 | AdminAction obligatoria.                                             |

### Negative Authorization Scenarios

* No admin → 403.

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
| Screen / Route      | `/[locale]/admin/reviews`               |
| Main UI Pattern     | Lista + diálogo motivo                   |
| Primary Action      | Moderar                                 |
| Secondary Actions   | Cancelar                                |
| Empty State         | "Sin reseñas por moderar"               |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Toast                                   |
| Accessibility Notes | Modal accesible                          |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/admin/reviews`
* Components:

  * `ReviewModerationTable`, `ModerationDialog`
* State Management:

  * TanStack
* Forms:

  * RHF
* API Client:

  * `adminApi.review.moderate`

### Backend

* Use Case / Service:

  * `ModerateReviewUseCase`
* Controller / Route:

  * `POST /api/v1/admin/reviews/:id/moderate`
* Authorization Policy:

  * Admin
* Validation:

  * Zod
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `reviews`, `admin_actions`
* Constraints:

  * Soft delete
* Index Considerations:

  * Por status

### API

| Method | Endpoint                                            | Purpose             |
| ------ | --------------------------------------------------- | ------------------- |
| POST   | `/api/v1/admin/reviews/:id/moderate`                | Moderar reseña      |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: Yes
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Hide registra AdminAction         | Integration |
| TS-02 | Remove registra AdminAction        | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Sin motivo                            | 400                      |
| NT-02 | No admin                              | 403                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Admin              | 200             |

### Accessibility Tests

* Modal accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad del catálogo                                 |
| Expected Impact     | Confianza                                            |
| Success Criteria    | 100% acciones auditadas                              |
| Academic Demo Value | Gobernanza admin                                      |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Tabla + diálogo.

### Potential Backend Tasks

* Use case con AdminAction.

### Potential Database Tasks

* Soft delete.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests + auditoría.

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

* [ ] Funcional con auditoría.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar mensaje a vendor/organizador.

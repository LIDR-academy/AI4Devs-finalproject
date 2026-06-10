# 🧾 User Story: Soft-deletear una imagen de mi portafolio

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-048                               |
| Epic               | EPIC-VND-001                          |
| Feature            | Soft delete de attachment             |
| Module / Domain    | Vendors                              |
| User Role          | Vendor                               |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** proveedor
**I want** eliminar (soft) una imagen de mi portafolio
**So that** retire contenido sin perder trazabilidad

---

## 🧠 Business Context

### Context Summary

Decisión PO 8.1 #19: soft delete obligatorio de attachments. Hard delete prohibido.

### Related Domain Concepts

* Attachment.deleted_at.

### Assumptions

* La imagen se oculta inmediatamente del público.

### Dependencies

* US-043.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-VENDOR-009                       |
| Use Case(s)            | UC-VENDOR-009                      |
| Business Rule(s)       | BR-PRIVACY-011                     |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | Attachment                         |
| API Endpoint(s)        | DELETE /api/v1/vendors/me/works/:id/images/:imageId |
| NFR Reference(s)       | NFR-SEC-008                        |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8.1 (#19)                    |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Hard delete físico.

### Scope Notes

* Almacenamiento físico permanece.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Soft delete

**Given** imagen propia
**When** DELETE
**Then** `deleted_at` actualizado y oculta del público.

---

## ⚠️ Edge Cases

### EC-01: Imagen ajena

**Given** imagen de otro vendor
**When** DELETE
**Then** 403/404.

#### Handling

* Ownership.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Imagen pertenece al vendor      | 403/404                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Soft delete obligatorio.                                             |

### Negative Authorization Scenarios

* Otro vendor → 403/404.

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
| Screen / Route      | `/[locale]/vendor/portfolio`            |
| Main UI Pattern     | Botón eliminar en thumbnail              |
| Primary Action      | "Eliminar"                              |
| Secondary Actions   | Cancelar                                |
| Empty State         | No aplica                              |
| Loading State       | Spinner                                 |
| Error State         | Toast                                   |
| Success State       | Thumbnail oculto                        |
| Accessibility Notes | Botón con label                         |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Portfolio
* Components:

  * `ImageThumb` con delete
* State Management:

  * TanStack
* Forms:

  * Confirmación opcional
* API Client:

  * `vendorsApi.deleteWorkImage`

### Backend

* Use Case / Service:

  * `SoftDeleteAttachmentUseCase`
* Controller / Route:

  * `DELETE /api/v1/vendors/me/works/:id/images/:imageId`
* Authorization Policy:

  * Ownership
* Validation:

  * UUID
* Transaction Required:

  * No

### Database

* Main Tables:

  * `attachment`
* Constraints:

  * `deleted_at` nullable
* Index Considerations:

  * Parcial `deleted_at IS NULL`

### API

| Method | Endpoint                                                  | Purpose          |
| ------ | --------------------------------------------------------- | ---------------- |
| DELETE | `/api/v1/vendors/me/works/:id/images/:imageId`            | Soft delete       |

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
| TS-01 | Soft delete oculta del público     | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Imagen ajena                          | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 204             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Botón accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad de portafolio                                |
| Expected Impact     | Control fino                                         |
| Success Criteria    | Soft delete enforced                                  |
| Academic Demo Value | Demuestra soft delete + auditoría                     |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Botón eliminar.

### Potential Backend Tasks

* Use case.

### Potential Database Tasks

* `deleted_at`.

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

* [ ] Funcional.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar retención (¿purge físico tras N días?).

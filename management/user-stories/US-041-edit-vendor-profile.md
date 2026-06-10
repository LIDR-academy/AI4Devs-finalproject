# 🧾 User Story: Editar mi perfil mientras no esté rechazado

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-041                               |
| Epic               | EPIC-VND-001                          |
| Feature            | Edición de VendorProfile             |
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

**As a** proveedor con perfil
**I want** editar mi perfil (descripción, bio, paquetes, etc.)
**So that** mantenga mi presencia actualizada

---

## 🧠 Business Context

### Context Summary

El vendor puede editar mientras el estado no sea `rejected`. Cambios mayores podrían requerir nueva aprobación (Future v1.1).

### Related Domain Concepts

* VendorProfile edit.

### Assumptions

* Edits menores no re-disparan aprobación.

### Dependencies

* US-040.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-VENDOR-002                       |
| Use Case(s)            | UC-VENDOR-002                      |
| Business Rule(s)       | BR-VENDOR-003                      |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | VendorProfile                      |
| API Endpoint(s)        | PATCH /api/v1/vendors/me            |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Workflow de re-aprobación automática.

### Scope Notes

* Edit bloqueado si `status=rejected`.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Edit válido

**Given** vendor con perfil `pending` o `approved`
**When** PATCH válido
**Then** se actualiza.

### AC-02: Edit bloqueado en rejected

**Given** perfil `rejected`
**When** intenta PATCH
**Then** 409.

---

## ⚠️ Edge Cases

### EC-01: Cambio de categorías

**Given** intenta cambiar categorías
**When** PATCH
**Then** redirige a US-042 con regla de máximo 5 cambios.

#### Handling

* Endpoint separado.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Bio ≤ 1000 chars                | 400                         |
| VR-02 | Estado no rejected              | 409                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |

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

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | `/[locale]/vendor/profile/edit`                         |
| Main UI Pattern     | Form con secciones                                      |
| Primary Action      | "Guardar"                                              |
| Secondary Actions   | Cancelar                                                |
| Empty State         | No aplica                                              |
| Loading State       | Spinner                                                 |
| Error State         | Mensajes inline                                         |
| Success State       | Toast                                                   |
| Accessibility Notes | Labels                                                  |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | Moneda base                                            |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/vendor/profile/edit`
* Components:

  * `VendorProfileEditor`
* State Management:

  * RHF + Zod
* Forms:

  * Form simple
* API Client:

  * `vendorsApi.update`

### Backend

* Use Case / Service:

  * `UpdateVendorProfileUseCase`
* Controller / Route:

  * `PATCH /api/v1/vendors/me`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `vendor_profile`
* Constraints:

  * Estado no rejected
* Index Considerations:

  * Por `vendor_user_id`

### API

| Method | Endpoint                | Purpose                |
| ------ | ----------------------- | ---------------------- |
| PATCH  | `/api/v1/vendors/me`    | Editar perfil vendor   |

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
| TS-01 | Edit en pending y approved        | Integration |
| TS-02 | Edit bloqueado en rejected         | API         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Otro vendor                           | 403/404                  |
| NT-02 | Rejected                              | 409                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Form accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad de perfiles                                  |
| Expected Impact     | Vendors mantienen perfil al día                      |
| Success Criteria    | < 1% errores                                         |
| Academic Demo Value | Edición vendor                                       |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Form editor.

### Potential Backend Tasks

* Use case.

### Potential Database Tasks

* Not applicable for this story.

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

* Considerar re-aprobación para cambios mayores (Future).

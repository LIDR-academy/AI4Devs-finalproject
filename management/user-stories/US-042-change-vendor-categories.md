# 🧾 User Story: Cambiar mis categorías (máx 5 acumulado)

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-042                               |
| Epic               | EPIC-VND-001                          |
| Feature            | Cambio de categorías con límite       |
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
**I want** poder cambiar mis categorías con un límite acumulado de 5 cambios
**So that** ajuste mi oferta sin abusar de re-categorización (Decisión PO 8.1 #3)

---

## 🧠 Business Context

### Context Summary

Cambios de categoría requieren revisión admin y están limitados a 5 acumulados (`category_change_count <= 5`). Esto evita rotaciones masivas.

### Related Domain Concepts

* VendorProfile.category_change_count.

### Assumptions

* Cada cambio cuenta.

### Dependencies

* US-040.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-VENDOR-003                       |
| Use Case(s)            | UC-VENDOR-003                      |
| Business Rule(s)       | BR-VENDOR-004                      |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | VendorProfile, ServiceCategory      |
| API Endpoint(s)        | POST /api/v1/vendors/me/categories  |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8.1 (#3)                     |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Subcategorías ilimitadas.

### Scope Notes

* Límite estricto.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Cambio válido

**Given** `category_change_count = 2`
**When** cambia categorías
**Then** incrementa a 3 y queda `pending_review`.

### AC-02: Límite alcanzado

**Given** count=5
**When** intenta cambio
**Then** 409 `CATEGORY_CHANGE_LIMIT`.

---

## ⚠️ Edge Cases

### EC-01: Cambio "no cambio"

**Given** envía mismas categorías
**When** POST
**Then** 200 sin incrementar count.

#### Handling

* Diff antes.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | 1-3 categorías                  | 400                         |
| VR-02 | count ≤ 5                       | 409                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | Log `vendor.category.changed`.                                       |

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
| Screen / Route      | `/[locale]/vendor/profile/edit/categories`             |
| Main UI Pattern     | Multi-select + contador visible                         |
| Primary Action      | "Solicitar cambio"                                     |
| Secondary Actions   | Cancelar                                                |
| Empty State         | No aplica                                              |
| Loading State       | Spinner                                                 |
| Error State         | Banner                                                  |
| Success State       | Toast                                                   |
| Accessibility Notes | Contador con aria-live                                  |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Editor categorías
* Components:

  * `CategoryChangeForm`
* State Management:

  * TanStack
* Forms:

  * Zod
* API Client:

  * `vendorsApi.changeCategories`

### Backend

* Use Case / Service:

  * `ChangeVendorCategoriesUseCase`
* Controller / Route:

  * `POST /api/v1/vendors/me/categories`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod + límite
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `vendor_profile`, `vendor_profile_categories`
* Constraints:

  * Count check
* Index Considerations:

  * Por `vendor_user_id`

### API

| Method | Endpoint                                          | Purpose             |
| ------ | ------------------------------------------------- | ------------------- |
| POST   | `/api/v1/vendors/me/categories`                   | Cambiar categorías  |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No (la aprobación del cambio sí podría)
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Cambio incrementa count           | Integration |
| TS-02 | Bloqueo al 5to                     | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Otro vendor                           | 403/404                  |
| NT-02 | Categoría inexistente                 | 400                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Vendor             | 200             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Contador accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad del catálogo                                 |
| Expected Impact     | Evita rotación abusiva                                |
| Success Criteria    | Límite enforced                                       |
| Academic Demo Value | Demuestra regla de negocio (#3)                       |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Multi-select + contador.

### Potential Backend Tasks

* Use case con límite.

### Potential Database Tasks

* Constraint check.

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

* [ ] Funcional con límite.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar si los cambios requieren re-aprobación admin (sugerido sí).

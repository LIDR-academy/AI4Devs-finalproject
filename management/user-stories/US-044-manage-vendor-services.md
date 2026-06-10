# 🧾 User Story: Gestionar mis paquetes / servicios

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-044                               |
| Epic               | EPIC-VND-001                          |
| Feature            | CRUD VendorService                   |
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
**I want** crear, editar y eliminar paquetes (nombre, categoría, precio base, descripción)
**So that** mis ofertas estén actualizadas y visibles en mi perfil público

---

## 🧠 Business Context

### Context Summary

CRUD de `VendorService`. Visible en el perfil aprobado.

### Related Domain Concepts

* VendorService.

### Assumptions

* Precio base en moneda del vendor.

### Dependencies

* US-040.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-VENDOR-005                       |
| Use Case(s)            | UC-VENDOR-005                      |
| Business Rule(s)       | BR-VENDOR-006                      |
| Permission Rule(s)     | Ownership                          |
| Data Entity / Entities | VendorService                      |
| API Endpoint(s)        | POST/PATCH/DELETE /api/v1/vendors/me/services |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Variantes complejas por categoría.

### Scope Notes

* Lista básica.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: CRUD básico

**Given** vendor
**When** crea/edita/elimina paquete
**Then** se persiste y refleja en perfil público.

---

## ⚠️ Edge Cases

### EC-01: Precio negativo

**Given** envía precio < 0
**When** se valida
**Then** 400.

#### Handling

* Validación.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Nombre 2-150 chars              | 400                         |
| VR-02 | Precio ≥ 0                       | 400                         |
| VR-03 | Categoría existente             | 400                         |

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

| Area                | Notes                                  |
| ------------------- | -------------------------------------- |
| Screen / Route      | `/[locale]/vendor/services`            |
| Main UI Pattern     | Tabla con inline edit                   |
| Primary Action      | "Agregar paquete"                      |
| Secondary Actions   | Editar, Eliminar                        |
| Empty State         | CTA                                     |
| Loading State       | Skeleton                                |
| Error State         | Toast                                   |
| Success State       | Toast                                   |
| Accessibility Notes | Tabla accesible                         |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda base                            |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/vendor/services`
* Components:

  * `VendorServiceTable`
* State Management:

  * TanStack
* Forms:

  * RHF
* API Client:

  * `vendorsApi.services.*`

### Backend

* Use Case / Service:

  * `CreateService/UpdateService/DeleteService` UseCases
* Controller / Route:

  * `/api/v1/vendors/me/services`
* Authorization Policy:

  * Ownership
* Validation:

  * Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `vendor_service`
* Constraints:

  * Soft delete opcional
* Index Considerations:

  * Por `vendor_id`

### API

| Method | Endpoint                                          | Purpose            |
| ------ | ------------------------------------------------- | ------------------ |
| POST   | `/api/v1/vendors/me/services`                     | Crear              |
| PATCH  | `/api/v1/vendors/me/services/:id`                 | Editar             |
| DELETE | `/api/v1/vendors/me/services/:id`                 | Eliminar           |

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
| TS-01 | CRUD básico                       | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Precio negativo                       | 400                      |
| NT-02 | Otro vendor                           | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 201             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Tabla accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Conversión a QuoteRequest                            |
| Expected Impact     | Catálogo completo                                    |
| Success Criteria    | < 1% errores                                         |
| Academic Demo Value | Catálogo vendor                                       |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Tabla CRUD.

### Potential Backend Tasks

* Use cases.

### Potential Database Tasks

* Schema vendor_service.

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

* [ ] CRUD funcional.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Definir si paquetes inactivos se ocultan en perfil público.

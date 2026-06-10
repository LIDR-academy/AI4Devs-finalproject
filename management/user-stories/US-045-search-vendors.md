# 🧾 User Story: Buscar proveedores por categoría/ciudad/precio

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-045                               |
| Epic               | EPIC-VND-001                          |
| Feature            | Búsqueda en directorio               |
| Module / Domain    | Vendors                              |
| User Role          | Organizer                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** organizador
**I want** buscar proveedores aprobados filtrando por categoría, ciudad y rango de precio
**So that** encuentre rápidamente candidatos para mis QuoteRequests

---

## 🧠 Business Context

### Context Summary

Búsqueda server-side con índices. Sólo `VendorProfile.status='approved'` y `deleted_at IS NULL`.

### Related Domain Concepts

* Directorio.

### Assumptions

* Paginación cursor.

### Dependencies

* US-040, US-047.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-VENDOR-006                       |
| Use Case(s)            | UC-VENDOR-006                      |
| Business Rule(s)       | BR-VENDOR-007                      |
| Permission Rule(s)     | Organizer (privada) / Anonymous (US-046 pública) |
| Data Entity / Entities | VendorProfile, VendorService, ServiceCategory, Location |
| API Endpoint(s)        | GET /api/v1/vendors                |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Búsqueda geoespacial.
* Full-text avanzada.

### Scope Notes

* Filtros básicos.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Búsqueda combinada

**Given** vendors aprobados
**When** organizador filtra `category=catering&city=GT&priceMin=100&priceMax=500`
**Then** se devuelven resultados paginados.

### AC-02: Vacío sin resultados

**Given** filtros sin matches
**When** consulta
**Then** estado vacío con sugerencias.

---

## ⚠️ Edge Cases

### EC-01: Filtros inválidos

**Given** category inexistente
**When** consulta
**Then** ignorada o 400.

#### Handling

* Lenient.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | `priceMin <= priceMax`          | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Organizer; (Anonymous en versión pública US-046).                    |
| SEC-02 | Sólo `approved`.                                                     |

### Negative Authorization Scenarios

* Vendor → 403 (puede ver pero no enviar QR a sí mismo).

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
| Screen / Route      | `/[locale]/organizer/vendors`          |
| Main UI Pattern     | Filtros + lista cards                   |
| Primary Action      | "Solicitar cotización"                 |
| Secondary Actions   | Ver detalle                             |
| Empty State         | "Sin resultados"                       |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Lista                                   |
| Accessibility Notes | Filtros con labels                      |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda del vendor                      |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/organizer/vendors`
* Components:

  * `VendorSearch`, `VendorCard`, `VendorFilters`
* State Management:

  * TanStack
* Forms:

  * Filtros en URL
* API Client:

  * `vendorsApi.search`

### Backend

* Use Case / Service:

  * `SearchVendorsUseCase`
* Controller / Route:

  * `GET /api/v1/vendors`
* Authorization Policy:

  * Organizer / Anonymous (US-046)
* Validation:

  * Query Zod
* Transaction Required:

  * No

### Database

* Main Tables:

  * `vendor_profile`, `vendor_profile_categories`, `vendor_service`
* Constraints:

  * Status approved
* Index Considerations:

  * Por categoría, ciudad, precio

### API

| Method | Endpoint                | Purpose                  |
| ------ | ----------------------- | ------------------------ |
| GET    | `/api/v1/vendors`       | Buscar vendors approved   |

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
| TS-01 | Filtros combinados                | API         |
| TS-02 | Paginación                         | API         |
| TS-03 | E2E                                | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | priceMin > priceMax                   | 400                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Organizer          | 200             |
| AUTH-TS-02 | Vendor             | 200 (sólo ve, no actúa) |

### Accessibility Tests

* Filtros accesibles.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Descubrimiento, conversión a QR                      |
| Expected Impact     | Encuentro eficiente                                  |
| Success Criteria    | < 1s en p95                                          |
| Academic Demo Value | Demuestra marketplace                                 |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Lista + filtros + URL state.

### Potential Backend Tasks

* Query optimizada.

### Potential Database Tasks

* Índices.

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

* Considerar cache de búsqueda popular.

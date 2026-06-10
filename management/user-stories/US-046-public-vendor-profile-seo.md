# 🧾 User Story: Ver perfil público SEO de un vendor

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-046                               |
| Epic               | EPIC-VND-001                          |
| Feature            | Vista pública SEO de vendor           |
| Module / Domain    | Vendors                              |
| User Role          | Anonymous                            |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** anonymous (sin sesión)
**I want** ver el perfil público de un vendor aprobado con SEO
**So that** pueda descubrir proveedores aún sin estar registrado y compartir el enlace

---

## 🧠 Business Context

### Context Summary

Página SEO con Server Components, metadata + Open Graph. Sólo vendors `approved`.

### Related Domain Concepts

* Server Components.
* SEO metadata.

### Assumptions

* La URL es estable e indexable.

### Dependencies

* US-045 (search).

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-VENDOR-007                       |
| Use Case(s)            | UC-VENDOR-007                      |
| Business Rule(s)       | BR-VENDOR-008                      |
| Permission Rule(s)     | Anonymous                          |
| Data Entity / Entities | VendorProfile, VendorService, Review, VendorWork |
| API Endpoint(s)        | GET /api/v1/public/vendors/:slug    |
| NFR Reference(s)       | NFR-PERF-WEB-001                   |
| Related ADR(s)         | ADR-FE-001                         |
| Related Document(s)    | /docs/15                           |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Comentarios / chat público.

### Scope Notes

* Sólo lectura.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Página pública

**Given** vendor approved con slug
**When** anonymous abre `/vendors/:slug`
**Then** se renderiza con SEO metadata, OG tags, datos públicos.

### AC-02: Vendor no aprobado

**Given** vendor `pending`/`rejected`
**When** abre URL
**Then** 404.

---

## ⚠️ Edge Cases

### EC-01: Vendor oculto por admin

**Given** vendor con `is_hidden=true`
**When** abre URL
**Then** 404.

#### Handling

* Mismo comportamiento que no aprobado.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Slug existente y approved       | 404                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Anonymous; sin información privada.                                  |
| SEC-02 | No exponer email/teléfono del vendor.                                |

### Negative Authorization Scenarios

* No aplica (todo público sólo lectura).

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
| Screen / Route      | `/[locale]/vendors/:slug`               |
| Main UI Pattern     | Página de perfil con galería            |
| Primary Action      | "Crear cuenta y solicitar cotización"   |
| Secondary Actions   | "Iniciar sesión"                        |
| Empty State         | No aplica                              |
| Loading State       | SSR                                     |
| Error State         | 404 page                                |
| Success State       | Página renderizada                      |
| Accessibility Notes | Encabezados semánticos                  |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Moneda del vendor                      |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/vendors/:slug` (Server Component)
* Components:

  * `PublicVendorProfile`, `Gallery`, `PackageList`, `ReviewList`
* State Management:

  * SSR (no client state)
* Forms:

  * No aplica
* API Client:

  * `vendorsApi.publicGet(slug)`

### Backend

* Use Case / Service:

  * `GetPublicVendorUseCase`
* Controller / Route:

  * `GET /api/v1/public/vendors/:slug`
* Authorization Policy:

  * Public
* Validation:

  * Slug
* Transaction Required:

  * No

### Database

* Main Tables:

  * `vendor_profile`, `vendor_service`, `review`, `vendor_work`, `attachment`
* Constraints:

  * Status approved
* Index Considerations:

  * Por `slug`

### API

| Method | Endpoint                            | Purpose                  |
| ------ | ----------------------------------- | ------------------------ |
| GET    | `/api/v1/public/vendors/:slug`      | Perfil público            |

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
| TS-01 | Renderiza con metadata OG          | E2E         |
| TS-02 | 404 si no aprobado                 | API         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Slug inexistente                      | 404                      |
| NT-02 | Vendor oculto                         | 404                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Anonymous          | 200             |

### Accessibility Tests

* Headings + alt en imágenes.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | SEO traffic, conversión anonymous                    |
| Expected Impact     | Atracción de organizadores nuevos                    |
| Success Criteria    | TTFB < 500ms                                         |
| Academic Demo Value | Demuestra SEO + SSR                                   |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Server Components SEO.

### Potential Backend Tasks

* Endpoint público.

### Potential Database Tasks

* Slug índice.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests SSR.

### Potential DevOps / Config Tasks

* Sitemap.xml en futuro.

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

* [ ] Página SSR operativa.
* [ ] OG tags válidos.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Considerar JSON-LD schema.org en futuro.

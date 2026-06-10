# 🧾 User Story: Crear mi VendorProfile

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-040                               |
| Epic               | EPIC-VND-001 — Vendor Directory & Profile |
| Feature            | Creación de perfil de proveedor       |
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

**As a** proveedor registrado
**I want** crear mi VendorProfile con datos comerciales, categorías y ciudad
**So that** quede disponible para revisión del admin y, una vez aprobado, visible en el directorio

---

## 🧠 Business Context

### Context Summary

Al registrarse (US-002), el vendor no tiene perfil. Esta historia cubre la creación inicial (`status=pending`), que luego el admin aprueba/rechaza.

### Related Domain Concepts

* VendorProfile, ServiceCategory, Location.

### Assumptions

* Hasta 3 categorías iniciales.
* Estado inicial `pending`.

### Dependencies

* US-002.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-VENDOR-001                       |
| Use Case(s)            | UC-VENDOR-001                      |
| Business Rule(s)       | BR-VENDOR-001, BR-VENDOR-002        |
| Permission Rule(s)     | Vendor crea su propio perfil       |
| Data Entity / Entities | VendorProfile, ServiceCategory      |
| API Endpoint(s)        | POST /api/v1/vendors/me             |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8, /docs/8.1 (#3)            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* KYC, validación documental.
* Verificación bancaria.

### Scope Notes

* Sin suscripción comercial.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Crear perfil

**Given** vendor sin perfil
**When** POST con nombre, descripción, categorías, ciudad
**Then** se crea `VendorProfile(status='pending')` y se notifica al admin.

### AC-02: Estado inicial pending

**Given** perfil creado
**When** vendor consulta
**Then** ve banner "Tu perfil está en revisión".

---

## ⚠️ Edge Cases

### EC-01: Vendor ya tiene perfil

**Given** existe perfil
**When** intenta crear otro
**Then** 409 `PROFILE_EXISTS`.

#### Handling

* Redirigir a edición.

---

### EC-02: Categoría inexistente

**Given** envía category_id inválido
**When** se valida
**Then** 400.

#### Handling

* Lista pública desde admin.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Nombre comercial 2-150 chars    | 400                         |
| VR-02 | Bio ≤ 1000 chars                | 400                         |
| VR-03 | 1-3 categorías                  | 400                         |
| VR-04 | Ciudad existente                | 400                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Vendor sólo crea su propio perfil.                                   |
| SEC-02 | `vendor_user_id` desde sesión.                                       |

### Negative Authorization Scenarios

* Organizer → 403. Admin → 403 (no crea por vendor).

---

## 🤖 AI Behavior

This story does not invoke AI directly.

### AI Involvement

* AI Feature: None (US-023 cubre AI opcional)
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
| Screen / Route      | `/[locale]/vendor/profile/new`                          |
| Main UI Pattern     | Form en pasos (Datos / Categorías / Confirmación)        |
| Primary Action      | "Enviar a revisión"                                    |
| Secondary Actions   | "Guardar borrador"                                     |
| Empty State         | No aplica                                              |
| Loading State       | Spinner                                                 |
| Error State         | Mensajes inline                                         |
| Success State       | Banner "En revisión"                                    |
| Accessibility Notes | Labels                                                  |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | Moneda base del vendor                                  |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/vendor/profile/new`
* Components:

  * `VendorProfileWizard`
* State Management:

  * RHF + Zod
* Forms:

  * Multi-step
* API Client:

  * `vendorsApi.create`

### Backend

* Use Case / Service:

  * `CreateVendorProfileUseCase`
* Controller / Route:

  * `POST /api/v1/vendors/me`
* Authorization Policy:

  * Vendor only
* Validation:

  * Zod
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `vendor_profile`, `vendor_profile_categories`
* Constraints:

  * UNIQUE `vendor_user_id`
* Index Considerations:

  * Por `status`, `vendor_user_id`

### API

| Method | Endpoint                | Purpose                  |
| ------ | ----------------------- | ------------------------ |
| POST   | `/api/v1/vendors/me`    | Crear perfil de vendor   |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`vendor.created`)
* AdminAction Required: No (la aprobación sí)
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Crear con datos válidos           | Integration |
| TS-02 | E2E desde onboarding              | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Vendor ya con perfil                  | 409                      |
| NT-02 | Categoría inexistente                 | 400                      |
| NT-03 | Organizer invoca                      | 403                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Vendor             | 201             |
| AUTH-TS-02 | Organizer          | 403             |
| AUTH-TS-03 | Admin              | 403             |

### Accessibility Tests

* Wizard accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Supply readiness                                     |
| Expected Impact     | Llenado del catálogo                                  |
| Success Criteria    | ≥ 80% vendors completan perfil tras registro          |
| Academic Demo Value | Demuestra ciclo proveedor                             |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Wizard de creación.

### Potential Backend Tasks

* Use case + endpoint.

### Potential Database Tasks

* Tablas vendor_profile + categories link.

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

* [ ] Endpoint + UI operativos.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Considerar autosave del wizard.

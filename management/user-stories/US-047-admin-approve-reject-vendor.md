# 🧾 User Story: Admin aprueba/rechaza/oculta un vendor

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-047                               |
| Epic               | EPIC-VND-001                          |
| Feature            | Moderación de vendors por admin       |
| Module / Domain    | Vendors / Admin                      |
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
**I want** aprobar, rechazar u ocultar un VendorProfile
**So that** mantenga la calidad del catálogo

---

## 🧠 Business Context

### Context Summary

Toda acción admin se registra en `AdminAction`. Pending → approved | rejected; approved con `is_hidden=true` esconde del directorio.

### Related Domain Concepts

* VendorProfile lifecycle.
* AdminAction.

### Assumptions

* Notificación al vendor por cada cambio.

### Dependencies

* US-040.
* EPIC-ADM-001.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-VENDOR-008, FR-ADMIN-004         |
| Use Case(s)            | UC-VENDOR-008, UC-ADMIN-004         |
| Business Rule(s)       | BR-VENDOR-008, BR-ADMIN-001         |
| Permission Rule(s)     | Admin only                         |
| Data Entity / Entities | VendorProfile, AdminAction          |
| API Endpoint(s)        | POST /api/v1/admin/vendors/:id/approve|reject|hide |
| NFR Reference(s)       | NFR-OBS-001                        |
| Related ADR(s)         | ADR-SEC-002                        |
| Related Document(s)    | /docs/8.1 (#16)                    |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Moderación automática IA.

### Scope Notes

* Sólo admin moderador.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Aprobar

**Given** vendor `pending`
**When** admin POST approve
**Then** status pasa a `approved`, AdminAction registrada, vendor notificado.

### AC-02: Rechazar

**Given** vendor `pending`
**When** admin POST reject con motivo
**Then** status `rejected`, AdminAction con motivo.

### AC-03: Ocultar

**Given** vendor `approved`
**When** admin POST hide con motivo
**Then** `is_hidden=true`, AdminAction registrada.

---

## ⚠️ Edge Cases

### EC-01: Doble aprobación

**Given** ya approved
**When** intenta approve
**Then** 409.

#### Handling

* State machine.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | Motivo obligatorio en reject/hide | 400                       |
| VR-02 | Transiciones válidas            | 409                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Admin only.                                                         |
| SEC-02 | AdminAction obligatoria por cada acción.                              |

### Negative Authorization Scenarios

* Organizer → 403. Vendor → 403.

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
| Screen / Route      | `/[locale]/admin/vendors`               |
| Main UI Pattern     | Lista + acciones + diálogo motivo       |
| Primary Action      | "Aprobar"                              |
| Secondary Actions   | "Rechazar", "Ocultar"                  |
| Empty State         | "Sin vendors pendientes"                |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Toast                                   |
| Accessibility Notes | Botones con confirmación accesible      |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | No aplica                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/admin/vendors`
* Components:

  * `VendorModerationTable`, `ModerationDialog`
* State Management:

  * TanStack
* Forms:

  * Motivo
* API Client:

  * `adminApi.vendor.approve/reject/hide`

### Backend

* Use Case / Service:

  * `ApproveVendor`, `RejectVendor`, `HideVendor` UseCases
* Controller / Route:

  * `POST /api/v1/admin/vendors/:id/...`
* Authorization Policy:

  * Admin
* Validation:

  * Zod
* Transaction Required:

  * Sí (status + AdminAction)

### Database

* Main Tables:

  * `vendor_profile`, `admin_actions`
* Constraints:

  * Estados válidos
* Index Considerations:

  * Por status

### API

| Method | Endpoint                                              | Purpose             |
| ------ | ----------------------------------------------------- | ------------------- |
| POST   | `/api/v1/admin/vendors/:id/approve`                   | Aprobar             |
| POST   | `/api/v1/admin/vendors/:id/reject`                    | Rechazar            |
| POST   | `/api/v1/admin/vendors/:id/hide`                      | Ocultar             |

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
| TS-01 | Approve registra AdminAction      | Integration |
| TS-02 | Reject con motivo                  | Integration |
| TS-03 | Hide en approved                   | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Reject sin motivo                     | 400                      |
| NT-02 | Doble approve                         | 409                      |
| NT-03 | Organizer                             | 403                      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Admin              | 200             |
| AUTH-TS-02 | Otro               | 403             |

### Accessibility Tests

* Diálogo accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Tiempo a aprobación                                  |
| Expected Impact     | Catálogo curado                                       |
| Success Criteria    | < 48h para aprobar                                   |
| Academic Demo Value | Gobernanza admin                                      |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Tabla + diálogo motivo.

### Potential Backend Tasks

* Use cases con AdminAction.

### Potential Database Tasks

* Constraint estados.

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

* [ ] Funcional con AdminAction.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar mensajes de notificación a vendor.

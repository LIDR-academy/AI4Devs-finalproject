# 🧾 User Story: Subir hasta 10 imágenes por trabajo

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-043                               |
| Epic               | EPIC-VND-001                          |
| Feature            | Portafolio con vendor_work + imágenes |
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
**I want** subir hasta 10 imágenes por trabajo del portafolio
**So that** muestre evidencia visual y atraiga más solicitudes de cotización

---

## 🧠 Business Context

### Context Summary

Decisión PO 8.1 #2: hasta 10 imágenes por `vendor_work`. Soft delete obligatorio para attachments (Decisión PO 8.1 #19).

### Related Domain Concepts

* VendorWork (label).
* Attachment + storage.

### Assumptions

* MVP usa `LocalFileStorageAdapter`.
* MIME allowlist (jpg/png/webp).

### Dependencies

* US-040.
* EPIC-SEC-001 (uploads).

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-VENDOR-004                       |
| Use Case(s)            | UC-VENDOR-004                      |
| Business Rule(s)       | BR-VENDOR-005, BR-PRIVACY-011       |
| Permission Rule(s)     | Vendor sobre su perfil             |
| Data Entity / Entities | VendorWork, Attachment              |
| API Endpoint(s)        | POST /api/v1/vendors/me/works/:id/images |
| NFR Reference(s)       | NFR-SEC-008                        |
| Related ADR(s)         | ADR-SEC-002                        |
| Related Document(s)    | /docs/8.1 (#2 #19)                 |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Antimalware.
* Watermarking automático.

### Scope Notes

* Soft delete obligatorio.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Crear trabajo con imágenes

**Given** vendor con perfil aprobado
**When** crea `vendor_work` con label y sube imágenes
**Then** se persisten hasta 10 attachments por work.

### AC-02: Límite 10

**Given** work con 10 imágenes
**When** intenta una 11ma
**Then** 409 `IMAGE_LIMIT`.

---

## ⚠️ Edge Cases

### EC-01: MIME no permitido

**Given** sube PDF
**When** se valida
**Then** 400 `INVALID_MIME`.

#### Handling

* Allowlist server-side.

---

### EC-02: Tamaño excedido

**Given** imagen > 5MB
**When** se valida
**Then** 400 `FILE_TOO_LARGE`.

#### Handling

* Mensaje claro.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | MIME ∈ {image/jpeg, image/png, image/webp} | 400              |
| VR-02 | Tamaño ≤ 5MB                    | 400                         |
| VR-03 | ≤ 10 por work                   | 409                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership.                                                          |
| SEC-02 | MIME allowlist server-side.                                          |
| SEC-03 | Sin ejecución de archivos.                                           |
| SEC-04 | Soft delete obligatorio.                                             |

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
| Screen / Route      | `/[locale]/vendor/portfolio`                            |
| Main UI Pattern     | Dropzone + grid                                         |
| Primary Action      | "Subir imágenes"                                       |
| Secondary Actions   | "Eliminar"                                              |
| Empty State         | "Sin imágenes"                                          |
| Loading State       | Spinner                                                 |
| Error State         | Banner + thumb error                                    |
| Success State       | Grid actualizada                                        |
| Accessibility Notes | Dropzone con keyboard support                           |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | 4 locales                                              |
| Currency Notes      | No aplica                                              |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/vendor/portfolio`
* Components:

  * `PortfolioUploader`, `WorkGrid`
* State Management:

  * TanStack
* Forms:

  * Multipart
* API Client:

  * `vendorsApi.uploadWorkImage`

### Backend

* Use Case / Service:

  * `UploadWorkImageUseCase`
* Controller / Route:

  * `POST /api/v1/vendors/me/works/:id/images`
* Authorization Policy:

  * Ownership
* Validation:

  * Multer + MIME allowlist
* Transaction Required:

  * Sí

### Database

* Main Tables:

  * `vendor_work`, `attachment`
* Constraints:

  * Soft delete
* Index Considerations:

  * Por `work_id`

### API

| Method | Endpoint                                              | Purpose             |
| ------ | ----------------------------------------------------- | ------------------- |
| POST   | `/api/v1/vendors/me/works/:id/images`                 | Subir imagen        |

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
| TS-01 | Subir 10 imágenes                  | Integration |
| TS-02 | Bloqueo en 11                      | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | PDF                                   | 400                      |
| NT-02 | > 5MB                                 | 400                      |
| NT-03 | Otro vendor                           | 403/404                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Dueño              | 201             |
| AUTH-TS-02 | Otro               | 403/404         |

### Accessibility Tests

* Dropzone keyboard.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Atractivo del perfil                                 |
| Expected Impact     | Mejora conversión                                    |
| Success Criteria    | Vendors completan portafolio                          |
| Academic Demo Value | Uploads seguros con allowlist                         |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Dropzone + grid.

### Potential Backend Tasks

* Use case + storage adapter.

### Potential Database Tasks

* Schema attachments + soft delete.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests + MIME.

### Potential DevOps / Config Tasks

* Configurar storage.

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

* [ ] Uploads funcional.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar políticas de retención y CDN futuro.

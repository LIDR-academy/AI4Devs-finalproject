# 🧾 User Story: (Vendor) Generar bio y paquetes con IA

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-023                               |
| Epic               | EPIC-AIP-001 — AI-Assisted Event Planning |
| Feature            | AI-007 Bio/paquetes IA del proveedor  |
| Module / Domain    | AI / Vendors                         |
| User Role          | Vendor                               |
| Priority           | Could Have                           |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP (Could) / Future si se difiere   |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** proveedor configurando o actualizando mi perfil
**I want** que la IA me proponga una bio profesional y descripciones de paquetes a partir de mis datos básicos
**So that** mi perfil luzca más completo y atractivo sin escribir desde cero

---

## 🧠 Business Context

### Context Summary

AI-007 (Could Have) ayuda al vendor a redactar bio y descripciones de servicios. La IA propone; el vendor revisa y publica. Las descripciones no son moderadas automáticamente.

### Related Domain Concepts

* VendorProfile.bio.
* VendorService.description.
* AIRecommendation (type='vendor_bio'/'vendor_packages').

### Assumptions

* El vendor proporciona inputs mínimos: categoría, ciudad, años de experiencia, especialidad.

### Dependencies

* EPIC-VND-001.
* EPIC-AI-001.

---

## 🔗 Traceability

| Source                 | Reference                                |
| ---------------------- | ---------------------------------------- |
| FRD Requirement(s)     | FR-AI-010, FR-VENDOR-002                  |
| Use Case(s)            | UC-AI-007                                |
| Business Rule(s)       | BR-AI-001..005, BR-VENDOR-002            |
| Permission Rule(s)     | Vendor sobre su propio perfil            |
| Data Entity / Entities | VendorProfile, VendorService, AIRecommendation |
| API Endpoint(s)        | POST /api/v1/vendors/me/ai/bio, POST /api/v1/vendors/me/ai/packages |
| NFR Reference(s)       | NFR-AI-001                               |
| Related ADR(s)         | ADR-AI-001                               |
| Related Document(s)    | /docs/7                                  |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope (Could)
* MVP Relevance: Could Have

### Explicitly Out of Scope

* Moderación automática IA de texto.
* Generación de imágenes.
* Auto-publicación sin revisión.

### Scope Notes

* La IA propone; el vendor revisa.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Bio generada

**Given** vendor con perfil base
**When** clic "Generar bio IA"
**Then** se devuelve texto sugerido (no se publica automáticamente).

### AC-02: Paquetes generados

**Given** vendor con servicios base
**When** clic "Generar descripciones de paquetes"
**Then** se devuelven descripciones por paquete; vendor revisa y guarda.

---

## ⚠️ Edge Cases

### EC-01: Texto sensible

**Given** la IA genera texto con afirmaciones potencialmente legales/sensibles
**When** vendor revisa
**Then** banner "Revisa cumplimiento antes de publicar".

#### Handling

* HITL refuerza responsabilidad.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior          |
| ----- | ------------------------------------------------- | --------------------------- |
| VR-01 | Sólo vendor sobre su propio perfil                | 403                         |
| VR-02 | Bio ≤ 1000 caracteres                              | Truncar                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Ownership (vendor sobre su perfil).                                  |
| SEC-02 | Rate limit AI.                                                      |
| SEC-03 | Backend-only.                                                        |

### Negative Authorization Scenarios

* Organizer → 403. Admin → 403.

---

## 🤖 AI Behavior

### AI Involvement

* AI Feature: AI-007
* Provider Layer: LLMProvider
* Human Validation Required: Yes
* Persist AIRecommendation: Yes
* Fallback Required: Yes

### AI Input

* Datos del perfil: categoría, ciudad, años, especialidades, paquetes base.

### AI Output

* JSON: `bio: string` y/o `packages: [{ id, description }]`

### Human-in-the-loop Rules

* La IA no publica.
* El vendor revisa y guarda.

### AI Error / Fallback Behavior

* Mismas políticas.

---

## 🎨 UX / UI Notes

| Area                | Notes                                                  |
| ------------------- | ------------------------------------------------------ |
| Screen / Route      | `/[locale]/vendor/profile/edit`                        |
| Main UI Pattern     | Editor de texto con botón "Generar IA"                  |
| Primary Action      | "Guardar"                                              |
| Secondary Actions   | "Generar bio IA", "Regenerar", "Descartar"              |
| Empty State         | Mostrar IA como opcional                                |
| Loading State       | Skeleton                                                |
| Error State         | Banner                                                  |
| Success State       | Texto editable                                          |
| Accessibility Notes | Editor accesible                                        |
| Responsive Notes    | Mobile-first                                            |
| i18n Notes          | Locale del vendor                                       |
| Currency Notes      | Si menciona montos, locale del vendor                   |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/vendor/profile/edit`
* Components:

  * `AIVendorBio`, `AIVendorPackages`
* State Management:

  * TanStack
* Forms:

  * RHF + Zod
* API Client:

  * `aiApi.vendorBio`, `aiApi.vendorPackages`

### Backend

* Use Case / Service:

  * `GenerateVendorBioUseCase`, `GenerateVendorPackagesUseCase`
* Controller / Route:

  * `POST /api/v1/vendors/me/ai/bio`
  * `POST /api/v1/vendors/me/ai/packages`
* Authorization Policy:

  * Vendor + ownership
* Validation:

  * Zod
* Transaction Required:

  * No (sólo AIRecommendation hasta guardar)

### Database

* Main Tables:

  * `vendor_profile`, `vendor_service`, `ai_recommendations`
* Constraints:

  * Owner == vendor_user_id
* Index Considerations:

  * Por `vendor_id`

### API

| Method | Endpoint                                            | Purpose             |
| ------ | --------------------------------------------------- | ------------------- |
| POST   | `/api/v1/vendors/me/ai/bio`                         | Generar bio IA      |
| POST   | `/api/v1/vendors/me/ai/packages`                    | Generar paquetes IA |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: Yes

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                  | Type        |
| ----- | ----------------------------------------- | ----------- |
| TS-01 | Bio generada y editable                   | Integration |
| TS-02 | Paquetes generados                        | Integration |
| TS-03 | E2E perfil vendor                          | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Organizer invoca                      | 403                      |
| NT-02 | Admin invoca                          | 403                      |

### AI Tests

| ID       | Scenario                                | Expected Result          |
| -------- | --------------------------------------- | ------------------------ |
| AI-TS-01 | Mock genera bio                          | Texto mostrado            |
| AI-TS-02 | Timeout                                  | Error / fallback         |

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Vendor             | 200             |
| AUTH-TS-02 | Organizer          | 403             |

### Accessibility Tests

* Editor accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Calidad de perfiles                                  |
| Expected Impact     | Mejora atractivo de vendors                          |
| Success Criteria    | ≥ 30% vendors usan IA al menos una vez               |
| Academic Demo Value | Demuestra IA para vendor side                         |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Editor con IA opcional.
* Guardar revisión.

### Potential Backend Tasks

* Use cases bio/paquetes.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Prompts "VendorBioPrompt v1", "VendorPackagesPrompt v1".

### Potential QA Tasks

* Tests + AI.

### Potential DevOps / Config Tasks

* Not applicable for this story.

---

## ✅ Definition of Ready

* [x] Rol claro (Vendor).
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
* [ ] PO/BA validó (Could → confirmar inclusión MVP).

---

## 🏁 Definition of Done

* [ ] Funcional.
* [ ] HITL enforced.
* [ ] Tests deterministas.
* [ ] PO valida.

---

## 📝 Notes

* Considerar diferir a Future si el plan no alcanza.

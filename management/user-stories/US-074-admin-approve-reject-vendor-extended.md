# 🧾 User Story: Admin aprueba/rechaza vendor (panel admin)

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-074                                  |
| Epic               | EPIC-ADM-001 — Admin Governance                                |
| Feature            | Panel de aprobación de vendors                             |
| Module / Domain    | Admin / Vendors                              |
| User Role          | Admin                                |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As an** administrador  \n**I want** revisar la cola de VendorProfiles pendientes y aprobar/rechazar uno a uno desde un panel  \n**So that** mantenga la calidad del catálogo de forma eficiente

---

## 🧠 Business Context

### Context Summary
Surface UI del panel admin; complementa US-047.

### Related Domain Concepts
* VendorProfile, AdminAction

### Assumptions
* Política definida en /docs/8.1.

### Dependencies
* Epic EPIC-ADM-001 — Admin Governance dependencies.

---

## 🔗 Traceability

| Source                 | Reference                          |
| ---------------------- | ---------------------------------- |
| FRD Requirement(s)     | FR-ADMIN-001                                |
| Use Case(s)            | UC-ADMIN-001                                 |
| Business Rule(s)       | BR-ADMIN-001                                 |
| Permission Rule(s)     | Según rol Admin                     |
| Data Entity / Entities | VendorProfile, AdminAction                          |
| API Endpoint(s)        | GET /api/v1/admin/vendors, POST /api/v1/admin/vendors/:id/approve                          |
| NFR Reference(s)       | NFR-PERF-API-001                   |
| Related ADR(s)         | —                                  |
| Related Document(s)    | /docs/8, /docs/8.1                 |

---

## 🧭 Scope Guardrails

### MVP Scope
* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope
* Funciones avanzadas no listadas en MVP.

### Scope Notes
* Respetar guardrails MVP (sin pagos reales, sin chat, sin push, sin moderación IA).

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Flujo principal
**Given** contexto válido del actor Admin
**When** ejecuta la acción descrita
**Then** se produce el resultado esperado conforme a FR-ADMIN-001.

### AC-02: Persistencia y auditoría
**Given** acción exitosa
**When** se persiste
**Then** se registran logs y audit donde aplique.

---

## ⚠️ Edge Cases

### EC-01: Estado inválido
**Given** entidad en estado no permitido
**When** se intenta acción
**Then** 409.

#### Handling
* Validación state machine.

---

## 🚫 Validation Rules

| ID    | Rule                            | Message / Behavior          |
| ----- | ------------------------------- | --------------------------- |
| VR-01 | DTOs Zod                         | 400                         |
| VR-02 | Ownership / Assignment          | 403/404                     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sólo rol autorizado (Admin).                                         |
| SEC-02 | Backend enforced.                                                    |
| SEC-03 | AdminAction donde aplique.                                           |

### Negative Authorization Scenarios
* Roles incorrectos → 403.

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
| Screen / Route      | Layout admin                            |
| Main UI Pattern     | Tabla / form                             |
| Primary Action      | Acción principal                          |
| Secondary Actions   | Cancelar                                |
| Empty State         | Estado vacío con mensaje                 |
| Loading State       | Skeleton                                |
| Error State         | Banner                                  |
| Success State       | Toast                                   |
| Accessibility Notes | Componentes accesibles                   |
| Responsive Notes    | Mobile-first                            |
| i18n Notes          | 4 locales                              |
| Currency Notes      | Si aplica                              |

---

## 🛠 Technical Notes

### Frontend
* Route / Page: Layout admin
* Components: Reusables admin
* State Management: TanStack
* Forms: RHF + Zod
* API Client: adminApi.*

### Backend
* Use Case / Service: UseCase específico
* Controller / Route: GET /api/v1/admin/vendors, POST /api/v1/admin/vendors/:id/approve
* Authorization Policy: Admin
* Validation: Zod
* Transaction Required: Sí

### Database
* Main Tables: VendorProfile, AdminAction
* Constraints: Según dominio
* Index Considerations: Por id

### API

| Method | Endpoint                          | Purpose             |
| ------ | --------------------------------- | ------------------- |
| —      | GET /api/v1/admin/vendors, POST /api/v1/admin/vendors/:id/approve                         | Operación           |

### Observability / Audit
* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: Sí (si rol admin)
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                          | Type        |
| ----- | --------------------------------- | ----------- |
| TS-01 | Happy path                         | Integration |

### Negative Tests

| ID    | Scenario                              | Expected Result          |
| ----- | ------------------------------------- | ------------------------ |
| NT-01 | Sin permisos                          | 403                      |

### AI Tests
Not applicable for this story.

### Authorization Tests

| ID         | Scenario           | Expected Result |
| ---------- | ------------------ | --------------- |
| AUTH-TS-01 | Admin autorizado    | 200             |
| AUTH-TS-02 | Otro rol           | 403             |

### Accessibility Tests
* Navegación por teclado.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Eficiencia operativa                                  |
| Expected Impact     | Capacidad admin / negocio                             |
| Success Criteria    | Funcional con auditoría                               |
| Academic Demo Value | Gobernanza                                            |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks
* UI específica.

### Potential Backend Tasks
* Use case + endpoint.

### Potential Database Tasks
* Migración si necesaria.

### Potential AI / PromptOps Tasks
* Not applicable for this story.

### Potential QA Tasks
* Tests positivos/negativos.

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
* Confirmar detalles con PO.

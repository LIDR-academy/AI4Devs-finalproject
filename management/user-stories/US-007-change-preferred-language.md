# 🧾 User Story: Cambiar mi idioma preferido entre los 4 soportados

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-007                               |
| Epic               | EPIC-AUTH-001 — Authentication & User Access |
| Feature            | Selección de idioma preferido        |
| Module / Domain    | Auth / I18N                          |
| User Role          | Authenticated (Organizer / Vendor / Admin) |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** usuario autenticado de EventFlow
**I want** seleccionar mi idioma preferido entre `es-LATAM`, `es-ES`, `pt` y `en`
**So that** la interfaz, los emails simulados y los outputs IA aplicables se muestren en mi idioma

---

## 🧠 Business Context

### Context Summary

El idioma preferido se persiste en `User.preferred_language` y es usado por: la UI vía `next-intl`, los emails simulados, y los prompts IA del usuario (cuando aplica al ámbito del User, no del Event). El idioma del evento es independiente y configurado en US-082.

### Related Domain Concepts

* User.preferred_language.
* next-intl como motor i18n.

### Assumptions

* La UI tiene diccionarios completos en los 4 locales para rutas principales.
* Backend valida `language_code` por enum.

### Dependencies

* EPIC-FE-001 (i18n).
* EPIC-AUTH-001 (perfil propio).

---

## 🔗 Traceability

| Source                 | Reference                              |
| ---------------------- | -------------------------------------- |
| FRD Requirement(s)     | FR-USER-003, FR-I18N-001               |
| Use Case(s)            | UC-AUTH-007, UC-I18N-001               |
| Business Rule(s)       | BR-USER-006, BR-I18N-001               |
| Permission Rule(s)     | Ownership /users/me                    |
| Data Entity / Entities | User                                   |
| API Endpoint(s)        | PATCH /api/v1/users/me                 |
| NFR Reference(s)       | NFR-I18N-001                           |
| Related ADR(s)         | ADR-FE-001                             |
| Related Document(s)    | /docs/3 §7.15, /docs/15                |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Traducción dinámica con IA.
* Soporte RTL.
* Locales adicionales (FR, IT, etc.).

### Scope Notes

* No introduce variantes regionales adicionales.
* No introduce detección automática agresiva (sólo sugerencia inicial).

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Cambio de idioma desde perfil

**Given** un usuario autenticado en `/profile`
**When** selecciona `pt` y guarda
**Then** `User.preferred_language = "pt"` y la UI se renderiza en portugués.

### AC-02: Cambio de idioma desde selector global

**Given** un usuario autenticado en cualquier página
**When** usa el selector de idioma en el header
**Then** la UI cambia inmediatamente y el preferred_language se actualiza en backend.

### AC-03: Persistencia entre sesiones

**Given** el usuario cierra sesión y vuelve a entrar
**When** la sesión se restaura
**Then** la UI se carga en el último idioma guardado.

---

## ⚠️ Edge Cases

### EC-01: Locale no soportado

**Given** un manipulador envía `fr-FR`
**When** intenta guardar
**Then** 400 `VALIDATION_ERROR`.

#### Handling

* Backend valida con enum.

---

### EC-02: Falta de diccionarios

**Given** un locale soportado pero con strings faltantes
**When** la UI renderiza
**Then** usa fallback en `en` y loguea key faltante.

#### Handling

* next-intl con fallback.
* QA cubre cobertura por locale.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior            |
| ----- | ------------------------------------------------- | ----------------------------- |
| VR-01 | Locale ∈ {es-LATAM, es-ES, pt, en}                | "Idioma no soportado"         |
| VR-02 | Campo obligatorio                                 | "Idioma obligatorio"          |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Sesión activa requerida.                                            |
| SEC-02 | Ownership policy: sólo /users/me.                                   |
| SEC-03 | Selector global usa el mismo endpoint.                              |

### Negative Authorization Scenarios

* Anónimo: solo cambio en URL (locale prefix) sin persistir.

---

## 🤖 AI Behavior

This story does not invoke AI directly.

### AI Involvement

* AI Feature: None (afecta entradas a prompts IA del usuario, pero no invoca IA aquí)
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

| Area                | Notes                                                       |
| ------------------- | ----------------------------------------------------------- |
| Screen / Route      | `/[locale]/profile` y header global                          |
| Main UI Pattern     | Dropdown con banderas/labels                                |
| Primary Action      | "Aplicar idioma"                                            |
| Secondary Actions   | Cancelar                                                    |
| Empty State         | No aplica                                                   |
| Loading State       | Spinner breve                                               |
| Error State         | Toast de error                                              |
| Success State       | Toast + UI re-renderiza                                     |
| Accessibility Notes | `aria-label`, etiqueta del idioma en su propio idioma        |
| Responsive Notes    | Mobile-first                                                |
| i18n Notes          | Self-referenciado: cada idioma se muestra en su nombre nativo |
| Currency Notes      | No aplica                                                   |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Header global + perfil
* Components:

  * `LocaleSwitcher`
* State Management:

  * `useUpdateProfile` (TanStack Query) + next-intl router
* Forms:

  * Select simple
* API Client:

  * `usersApi.update({ preferred_language })`

### Backend

* Use Case / Service:

  * `UpdateOwnProfileUseCase`
* Controller / Route:

  * `PATCH /api/v1/users/me`
* Authorization Policy:

  * Ownership
* Validation:

  * Enum locale
* Transaction Required:

  * No

### Database

* Main Tables:

  * `users`
* Constraints:

  * `preferred_language` CHECK enum
* Index Considerations:

  * No aplica

### API

| Method | Endpoint                          | Purpose                       |
| ------ | --------------------------------- | ----------------------------- |
| PATCH  | `/api/v1/users/me`                | Actualizar idioma preferido   |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`user.locale.changed`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                            | Type        |
| ----- | --------------------------------------------------- | ----------- |
| TS-01 | Cambio en perfil persiste en BD                     | Integration |
| TS-02 | Selector global cambia UI inmediatamente            | E2E         |
| TS-03 | Locale persiste tras logout/login                   | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result      |
| ----- | ------------------------------------- | -------------------- |
| NT-01 | Locale no soportado                   | 400                  |
| NT-02 | Anónimo intenta PATCH                 | 401                  |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                            | Expected Result |
| ---------- | ----------------------------------- | --------------- |
| AUTH-TS-01 | Sesión activa cambia su idioma      | 200             |
| AUTH-TS-02 | Anónimo                             | 401             |

### Accessibility Tests

* Dropdown navegable por teclado.
* Etiquetas y anuncios accesibles.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Adopción multi-idioma                                |
| Expected Impact     | Mejora UX para usuarios LATAM/ES/PT/EN               |
| Success Criteria    | 100% rutas principales tienen 4 locales              |
| Academic Demo Value | Demuestra i18n end-to-end                            |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Componente `LocaleSwitcher`.
* Integración con next-intl router.
* Persistencia vía API.

### Potential Backend Tasks

* Validación enum en DTO.

### Potential Database Tasks

* Constraint check enum.

### Potential AI / PromptOps Tasks

* Not applicable for this story (sin invocar IA).

### Potential QA Tasks

* Smoke por locale.

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

* [ ] Selector funcional.
* [ ] Persistencia operativa.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Verificar cobertura de diccionarios al 100% en rutas principales.
* Confirmar nombres nativos en el selector (Español LATAM, Español, Português, English).

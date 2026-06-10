# 🧾 User Story: Iniciar sesión con Google (OAuth)

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-008                               |
| Epic               | EPIC-AUTH-001 — Authentication & User Access |
| Feature            | OAuth Google (Could Have)            |
| Module / Domain    | Auth                                 |
| User Role          | Anonymous                            |
| Priority           | Could Have                           |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP (Could) / Future si se difiere   |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** persona que prefiere usar sus credenciales de Google
**I want** iniciar sesión con Google OAuth
**So that** pueda acceder rápidamente sin gestionar otra contraseña

---

## 🧠 Business Context

### Context Summary

OAuth Google es una capacidad **Could Have** para el MVP, listada en EPIC-AUTH-001. Reduce fricción de signup/login pero implica trabajo adicional de integración. La asignación de rol sigue siendo single-role; al primer login se solicita seleccionar `organizer` o `vendor` si el usuario no existía previamente.

### Related Domain Concepts

* OAuth2 / OIDC.
* User vinculado a `google_sub`.

### Assumptions

* El proyecto cuenta con credenciales OAuth Google Cloud.
* La sesión se establece igualmente con cookie HTTP-only.

### Dependencies

* US-001 / US-002 (registro tradicional).
* EPIC-SEC-001 (cookies).

---

## 🔗 Traceability

| Source                 | Reference                              |
| ---------------------- | -------------------------------------- |
| FRD Requirement(s)     | FR-AUTH-010 (Could)                    |
| Use Case(s)            | UC-AUTH-008                            |
| Business Rule(s)       | BR-AUTH-010                            |
| Permission Rule(s)     | Anonymous puede iniciar OAuth          |
| Data Entity / Entities | User (campo `google_sub`)              |
| API Endpoint(s)        | GET /api/v1/auth/google, GET /api/v1/auth/google/callback |
| NFR Reference(s)       | NFR-SEC-003                            |
| Related ADR(s)         | ADR-SEC-001                            |
| Related Document(s)    | /docs/19                               |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: Requires PO Decision (incluido como Could)
* MVP Relevance: Could Have

### Explicitly Out of Scope

* OAuth Facebook / Apple / GitHub.
* MFA combinado con OAuth.

### Scope Notes

* No reemplaza login con email/password.
* No habilita multi-rol por el hecho de tener Google.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Login OAuth para usuario existente

**Given** existe un User con email `x@gmail.com` y vinculación Google
**When** clic en "Iniciar con Google" y consiente
**Then** el callback valida el id_token, identifica al User, emite cookie y redirige por rol.

### AC-02: Primer login OAuth (signup)

**Given** no existe User con ese email
**When** completa OAuth y selecciona rol (organizer/vendor)
**Then** se crea el User con `google_sub` y se inicia sesión.

### AC-03: Vinculación con cuenta existente

**Given** existe User con ese email registrado por email/password sin Google
**When** completa OAuth
**Then** el sistema vincula `google_sub` al User existente tras confirmación del usuario.

---

## ⚠️ Edge Cases

### EC-01: Email no verificado por Google

**Given** Google reporta `email_verified=false`
**When** intenta callback
**Then** rechazo con mensaje neutro.

#### Handling

* Log de evento.
* Mensaje "No fue posible completar".

---

### EC-02: Cancelación del consentimiento

**Given** el usuario cierra la ventana OAuth
**When** vuelve a la app
**Then** se muestra mensaje neutro y la sesión queda como anónima.

#### Handling

* Redirección a login.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior        |
| ----- | ------------------------------------------------- | ------------------------- |
| VR-01 | id_token válido y firma verificada                | "No fue posible iniciar sesión" |
| VR-02 | `email_verified=true`                             | "No fue posible iniciar sesión" |
| VR-03 | Rol requerido en primer signup                    | "Selecciona un rol"       |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| SEC-01 | Validar id_token con JWK del proveedor.                                                       |
| SEC-02 | Verificar `aud`, `iss`, `exp`, `email_verified`.                                              |
| SEC-03 | State + nonce anti-CSRF en flujo OAuth.                                                       |
| SEC-04 | Cookies HTTP-only firmadas tras éxito.                                                        |
| SEC-05 | No exponer información del id_token al frontend.                                              |

### Negative Authorization Scenarios

* State inválido → 400.
* id_token expirado → 400.
* Cuenta admin vía Google: prohibido (admin sólo por seed/admin).

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

| Area                | Notes                                                            |
| ------------------- | ---------------------------------------------------------------- |
| Screen / Route      | `/[locale]/auth/login` + `/auth/google/callback`                  |
| Main UI Pattern     | Botón "Continuar con Google" + pantalla intermedia de selección de rol |
| Primary Action      | "Continuar con Google"                                           |
| Secondary Actions   | Volver al login tradicional                                      |
| Empty State         | No aplica                                                        |
| Loading State       | Spinner en redirección                                           |
| Error State         | Mensaje neutro                                                   |
| Success State       | Redirect al layout por rol                                       |
| Accessibility Notes | Botón con ícono accesible                                        |
| Responsive Notes    | Mobile-first                                                     |
| i18n Notes          | 4 locales                                                        |
| Currency Notes      | No aplica                                                        |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/auth/login`
  * `/auth/google/callback`
* Components:

  * `GoogleSignInButton`, `RoleSelectorOnSignup`
* State Management:

  * Redirección + manejo de state local
* Forms:

  * No requiere form
* API Client:

  * Redirección directa al endpoint backend

### Backend

* Use Case / Service:

  * `OAuthLoginUseCase`, `OAuthSignupUseCase`
* Controller / Route:

  * `GET /api/v1/auth/google` (redirige)
  * `GET /api/v1/auth/google/callback`
* Authorization Policy:

  * Anonymous
* Validation:

  * id_token y state
* Transaction Required:

  * Sí en signup

### Database

* Main Tables:

  * `users` (campo `google_sub` nullable UNIQUE)
* Constraints:

  * UNIQUE `google_sub`
* Index Considerations:

  * Índice por `google_sub`

### API

| Method | Endpoint                                      | Purpose                  |
| ------ | --------------------------------------------- | ------------------------ |
| GET    | `/api/v1/auth/google`                         | Iniciar flujo OAuth      |
| GET    | `/api/v1/auth/google/callback`                | Procesar callback        |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`auth.oauth.google.success/failure`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                                    | Type        |
| ----- | ----------------------------------------------------------- | ----------- |
| TS-01 | Login OAuth existente exitoso                               | Integration |
| TS-02 | Signup primer OAuth con selección de rol                    | Integration |
| TS-03 | Vinculación de cuenta existente por email                   | Integration |
| TS-04 | Flujo E2E con mock OAuth provider                           | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result            |
| ----- | ------------------------------------- | -------------------------- |
| NT-01 | id_token expirado                     | 400                        |
| NT-02 | state inválido                        | 400                        |
| NT-03 | email_verified=false                  | 400                        |
| NT-04 | Intento de role=admin                 | Forzado a organizer/vendor |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result |
| ---------- | --------------------------------- | --------------- |
| AUTH-TS-01 | Anónimo inicia OAuth              | 302 a Google    |
| AUTH-TS-02 | Sesión activa                     | 409 / redirect  |

### Accessibility Tests

* Botón Google con label accesible.
* Foco visible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Conversión de signup, fricción reducida              |
| Expected Impact     | +X% signup si se incluye en MVP                      |
| Success Criteria    | OAuth completa en < 5s                               |
| Academic Demo Value | Demuestra integración OAuth estándar                 |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Botón Google y manejo de callback.
* Pantalla de selección de rol en primer signup.

### Potential Backend Tasks

* Endpoints OAuth con state/nonce.
* Verificación id_token.
* Vinculación a User existente.

### Potential Database Tasks

* Migración para `google_sub`.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests con mock OAuth provider.

### Potential DevOps / Config Tasks

* Configurar credenciales Google y redirect URIs.

---

## ✅ Definition of Ready

* [x] Rol claro.
* [x] Goal/valor claros.
* [x] FRD/UC/BR enlazados (Could Have).
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
* [ ] PO confirma incluir en MVP o diferir.

---

## 🏁 Definition of Done

* [ ] OAuth funcional con Google.
* [ ] Vinculación operativa.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar con PO si esta historia entra al MVP o se difiere a Future (EPIC-FUT correspondiente).
* Verificar política de datos (no almacenar id_token, sólo `sub`).

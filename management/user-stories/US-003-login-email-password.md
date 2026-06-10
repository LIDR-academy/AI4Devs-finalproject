# 🧾 User Story: Iniciar sesión con email y contraseña

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-003                               |
| Epic               | EPIC-AUTH-001 — Authentication & User Access |
| Feature            | Login con credenciales               |
| Module / Domain    | Auth                                 |
| User Role          | Anonymous → Authenticated (Organizer / Vendor / Admin) |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** usuario registrado en EventFlow (organizador, proveedor o administrador)
**I want** iniciar sesión con mi email y contraseña, validado por captcha cuando aplique
**So that** pueda acceder a mi workspace y operar según mi rol

---

## 🧠 Business Context

### Context Summary

El login es la entrada operativa diaria al producto. Debe responder con mensajes genéricos para no revelar existencia de cuentas, aplicar captcha tras intentos fallidos (Decisión PO 8.1 #8), y emitir una cookie de sesión persistente HTTP-only firmada. La sesión activa determina el layout por rol (organizer/vendor/admin) que el frontend renderiza.

### Related Domain Concepts

* Autenticación basada en sesión.
* Cookie HTTP-only firmada.
* RBAC y aislamiento por rol.
* Rate limiting + captcha condicional.

### Assumptions

* Existe el usuario registrado en BD.
* El frontend determina layout por rol leyendo `/api/v1/users/me` post-login.
* La cookie de sesión vive un periodo configurable (ej. 30 días).

### Dependencies

* US-001 / US-002 (registro previo).
* EPIC-SEC-001 (captcha, rate limiting).
* EPIC-API-001 (error envelope).

---

## 🔗 Traceability

| Source                 | Reference                                           |
| ---------------------- | --------------------------------------------------- |
| FRD Requirement(s)     | FR-AUTH-004, FR-AUTH-005, FR-AUTH-006               |
| Use Case(s)            | UC-AUTH-003                                         |
| Business Rule(s)       | BR-AUTH-004, BR-AUTH-005, BR-AUTH-006, BR-AUTH-011  |
| Permission Rule(s)     | Anonymous → cualquier rol según `User.role`         |
| Data Entity / Entities | User                                                |
| API Endpoint(s)        | POST /api/v1/auth/login                             |
| NFR Reference(s)       | NFR-SEC-003, NFR-PERF-API-001                       |
| Related ADR(s)         | ADR-SEC-001                                         |
| Related Document(s)    | /docs/19, /docs/8.1 (#8)                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* MFA / 2FA / OTP por SMS.
* SSO empresarial.
* Magic link sin contraseña.
* Biometría.

### Scope Notes

* No revelar si el email existe.
* Captcha es obligatorio tras N intentos fallidos consecutivos (configurable).
* No bloquear cuentas permanentemente; usar cooldown temporal.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Login exitoso

**Given** un usuario registrado con credenciales válidas
**When** envía email + password
**Then** el sistema verifica la contraseña con argon2id, emite cookie de sesión HTTP-only firmada y devuelve 200 con datos públicos del perfil.

### AC-02: Redirección por rol

**Given** login exitoso
**When** el frontend obtiene `/users/me`
**Then** redirige a `/organizer`, `/vendor` o `/admin` según `role`.

### AC-03: Sesión persistente

**Given** login exitoso con cookie emitida
**When** el usuario recarga la página al día siguiente
**Then** la sesión continúa activa sin requerir re-login (mientras la cookie no expire).

---

## ⚠️ Edge Cases

### EC-01: Credenciales inválidas

**Given** email correcto pero password incorrecto (o viceversa)
**When** intenta iniciar sesión
**Then** el sistema responde con mensaje genérico ("Email o contraseña incorrectos") sin distinguir cuál es el campo erróneo.

#### Handling

* Contador de intentos fallidos por IP y por email candidato.
* Si supera umbral → exigir captcha.
* Si supera umbral mayor → cooldown temporal.

---

### EC-02: Captcha requerido por umbral

**Given** se superaron 3 intentos fallidos en la última ventana
**When** el siguiente intento ocurre
**Then** el frontend muestra captcha y el backend exige su validación.

#### Handling

* Si captcha falla → 400 genérico.
* Si captcha válido y credenciales correctas → login exitoso.

---

### EC-03: Cuenta suspendida (Future / opcional MVP)

**Given** una cuenta marcada como suspendida por admin
**When** intenta login
**Then** mensaje neutro indicando que no es posible acceder y se loguea el intento.

#### Handling

* No revelar razón.
* Logear en `AdminAction` el intento si la suspensión fue manual.

---

## 🚫 Validation Rules

| ID    | Rule                                  | Message / Behavior                            |
| ----- | ------------------------------------- | --------------------------------------------- |
| VR-01 | Email obligatorio y bien formado      | "Email o contraseña incorrectos" (genérico)   |
| VR-02 | Contraseña obligatoria                | "Email o contraseña incorrectos"              |
| VR-03 | Captcha obligatorio si umbral superado | "Verificación de seguridad fallida"           |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| SEC-01 | Endpoint accesible solo a anónimos; si ya hay sesión, devolver `/users/me` o redirigir.        |
| SEC-02 | Verificación de contraseña con argon2id en tiempo constante (evita timing attacks).            |
| SEC-03 | Rate limiting por IP y por email candidato.                                                   |
| SEC-04 | Captcha exigido tras N intentos fallidos.                                                      |
| SEC-05 | Cookies HttpOnly, Secure, SameSite=Lax, firmadas.                                              |
| SEC-06 | Logs no exponen contraseña ni hash.                                                            |
| SEC-07 | Mensajes de error son genéricos para evitar enumeración de usuarios.                          |

### Negative Authorization Scenarios

* Usuario ya autenticado intenta login → 409 o redirección.
* IP con exceso de intentos → 429.
* Captcha esperado y no provisto → 400.

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

| Area                | Notes                                                              |
| ------------------- | ------------------------------------------------------------------ |
| Screen / Route      | `/[locale]/auth/login`                                             |
| Main UI Pattern     | Form simple con email + password + captcha condicional             |
| Primary Action      | "Iniciar sesión"                                                   |
| Secondary Actions   | "Olvidé mi contraseña", "Crear cuenta"                             |
| Empty State         | No aplica                                                          |
| Loading State       | Spinner en botón, inputs deshabilitados                            |
| Error State         | Mensaje genérico bajo el formulario                                |
| Success State       | Redirección al layout del rol                                      |
| Accessibility Notes | Labels, focus inicial en email, errores en aria-live               |
| Responsive Notes    | Mobile-first                                                       |
| i18n Notes          | 4 locales                                                          |
| Currency Notes      | No aplica                                                          |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/auth/login`
* Components:

  * `LoginForm`, `CaptchaWidget`
* State Management:

  * React Hook Form + Zod, TanStack Query mutation `useLogin`
* Forms:

  * Zod simple para email/password
* API Client:

  * `authApi.login(payload)` + `userApi.me()`

### Backend

* Use Case / Service:

  * `LoginUseCase`
* Controller / Route:

  * `POST /api/v1/auth/login`
* Authorization Policy:

  * Anonymous only; rechazo si hay sesión.
* Validation:

  * `LoginDTO`
* Transaction Required:

  * No (sólo lectura + emisión de cookie)

### Database

* Main Tables:

  * `users`, `auth_attempts` (opcional para tracking de intentos)
* Constraints:

  * Email UNIQUE
* Index Considerations:

  * Índice por email; índice por IP en attempts si se persiste

### API

| Method | Endpoint                       | Purpose                            |
| ------ | ------------------------------ | ---------------------------------- |
| POST   | `/api/v1/auth/login`           | Iniciar sesión                     |
| GET    | `/api/v1/users/me`             | Obtener datos de la sesión actual  |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`auth.login.success` / `auth.login.failure`)
* AdminAction Required: No (sólo si es cuenta admin: opcional)
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                              | Type        |
| ----- | ----------------------------------------------------- | ----------- |
| TS-01 | Login exitoso con credenciales correctas              | Integration |
| TS-02 | Cookie emitida con flags correctos                    | API         |
| TS-03 | `users/me` devuelve rol correcto post-login           | API         |
| TS-04 | Redirección por rol funciona E2E                      | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result                |
| ----- | ------------------------------------- | ------------------------------ |
| NT-01 | Email inexistente                     | 401 genérico                   |
| NT-02 | Password incorrecto                   | 401 genérico                   |
| NT-03 | Captcha requerido faltante            | 400                            |
| NT-04 | Rate limit excedido                   | 429                            |
| NT-05 | Sesión existente intenta login        | 409 / redirección              |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result      |
| ---------- | --------------------------------- | -------------------- |
| AUTH-TS-01 | Anónimo login válido              | 200 + cookie         |
| AUTH-TS-02 | Autenticado intenta login         | 409 / redirección    |

### Accessibility Tests

* Navegación por teclado.
* Focus visible.
* Mensajes con aria-live polite.

---

## 📊 Business Impact

| Field               | Value                                                            |
| ------------------- | ---------------------------------------------------------------- |
| KPI Affected        | Daily Active Users, Retención, Conversion-to-action              |
| Expected Impact     | Acceso confiable; reducción de fricción al entrar                |
| Success Criteria    | < 5% de logins fallan por error de UX; tiempo medio < 2s         |
| Academic Demo Value | Permite iniciar la demo con cualquier rol del seed               |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Pantalla login y mutation.
* Captcha condicional según response del backend.
* Manejo de redirección por rol.

### Potential Backend Tasks

* `LoginUseCase` + endpoint.
* Rate limiting + captcha condicional.
* Emisión de cookie firmada.

### Potential Database Tasks

* Tabla opcional `auth_attempts` para tracking.
* Índices.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests positivos/negativos.
* E2E con seeds para 3 roles.

### Potential DevOps / Config Tasks

* Variables de session secret.
* Configuración captcha test/prod.

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

* [ ] Endpoint operativo.
* [ ] Cookies emitidas correctamente.
* [ ] Captcha condicional integrado.
* [ ] Frontend con redirección por rol.
* [ ] Tests verdes.
* [ ] Rate limiting verificable.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar valor de N (umbral de intentos) para activar captcha.
* Confirmar duración de cookie de sesión.
* Tracking opcional de IP/User-Agent para auditoría.

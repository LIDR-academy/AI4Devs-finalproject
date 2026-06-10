# 🧾 User Story: Recuperar mi contraseña vía email

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-004                               |
| Epic               | EPIC-AUTH-001 — Authentication & User Access |
| Feature            | Recuperación de contraseña            |
| Module / Domain    | Auth                                 |
| User Role          | Anonymous (usuario registrado que olvidó su contraseña) |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** usuario registrado en EventFlow que olvidó su contraseña
**I want** solicitar un email con un enlace seguro de recuperación y establecer una nueva contraseña
**So that** pueda volver a acceder a mi cuenta sin perder mis datos

---

## 🧠 Business Context

### Context Summary

La recuperación de contraseña es un flujo crítico de continuidad. En MVP, el email puede ser simulado (`MockEmailService` con log estructurado). El token de reseteo es de un solo uso, almacenado como hash en BD, con vencimiento corto (ej. 30 min). La respuesta nunca debe revelar si el email existe (Decisión PO 8.1 #8 y enumeración).

### Related Domain Concepts

* Token de recuperación (uso único, hash en DB).
* `MockEmailService` para envío simulado.
* Rate limiting para evitar abuso.

### Assumptions

* El email real puede no estar habilitado en MVP; el log estructurado sirve como evidencia.
* El usuario podrá completar el reseteo en el mismo navegador o en otro dispositivo.

### Dependencies

* EPIC-DB-001 (tabla `password_reset_tokens`).
* EPIC-SEC-001 (rate limit, captcha).
* EPIC-NOT-001 (`MockEmailService`).

---

## 🔗 Traceability

| Source                 | Reference                                           |
| ---------------------- | --------------------------------------------------- |
| FRD Requirement(s)     | FR-AUTH-007, FR-AUTH-008                            |
| Use Case(s)            | UC-AUTH-004                                         |
| Business Rule(s)       | BR-AUTH-007, BR-AUTH-008, BR-AUTH-011               |
| Permission Rule(s)     | Anonymous puede solicitar; solo el dueño del token puede resetear |
| Data Entity / Entities | User, PasswordResetToken                            |
| API Endpoint(s)        | POST /api/v1/auth/password/forgot, POST /api/v1/auth/password/reset |
| NFR Reference(s)       | NFR-SEC-003, NFR-SEC-005                            |
| Related ADR(s)         | ADR-SEC-001                                         |
| Related Document(s)    | /docs/19, /docs/8.1 (#8)                            |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Recuperación vía SMS / WhatsApp.
* Reset por preguntas de seguridad.
* Reset con biometría / 2FA.
* SMTP real obligatorio (puede usarse mock).

### Scope Notes

* Mensajes neutros: nunca revelar existencia del email.
* Token único de un solo uso con expiración corta.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Solicitud de recuperación

**Given** un usuario anónimo en `/auth/forgot-password`
**When** ingresa su email registrado y resuelve captcha
**Then** el backend genera un token, lo hashea, lo persiste con expiración y envía email (real o simulado vía log estructurado) con enlace `/auth/reset-password?token=...`. La respuesta es siempre 200 con mensaje neutro.

### AC-02: Establecer nueva contraseña

**Given** el usuario abre el enlace con token vigente
**When** ingresa nueva contraseña que cumple política
**Then** el sistema valida el token, actualiza la contraseña con argon2id, invalida el token y solicita iniciar sesión.

### AC-03: Email inexistente devuelve respuesta neutra

**Given** un email que no está registrado
**When** se solicita recuperación
**Then** el sistema responde 200 con el mismo mensaje neutro, sin enviar email.

---

## ⚠️ Edge Cases

### EC-01: Token expirado

**Given** el token superó su ventana de vida (ej. 30 min)
**When** el usuario intenta resetear
**Then** error `TOKEN_EXPIRED` y el usuario debe solicitar uno nuevo.

#### Handling

* Mensaje claro.
* Botón "Solicitar nuevo enlace".

---

### EC-02: Token ya utilizado

**Given** el token fue consumido previamente
**When** el usuario lo reusa
**Then** error `TOKEN_USED`.

#### Handling

* Logear con `correlationId`.
* No revelar si fue forzado.

---

### EC-03: Token alterado o inexistente

**Given** un token inválido
**When** el usuario intenta resetear
**Then** error `TOKEN_INVALID`.

#### Handling

* Logear evento sospechoso.
* Rate limiting agresivo en /reset.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior                         |
| ----- | ------------------------------------------------- | ------------------------------------------ |
| VR-01 | Email obligatorio y bien formado (en /forgot)     | "Si el email existe, recibirás un enlace"  |
| VR-02 | Captcha obligatorio en /forgot                    | "Verificación de seguridad fallida"        |
| VR-03 | Token obligatorio y dentro de la ventana          | "Enlace inválido o expirado"               |
| VR-04 | Nueva contraseña cumple política                  | "La contraseña no cumple los requisitos"   |
| VR-05 | Nueva contraseña no es igual a la anterior        | "Elige una contraseña distinta a la anterior" |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| SEC-01 | Endpoint accesible a anónimos; captcha en /forgot.                                            |
| SEC-02 | Token de 32+ bytes random, hasheado en BD, no se expone tras emisión.                          |
| SEC-03 | Expiración corta (30 min); un solo uso.                                                       |
| SEC-04 | Respuesta neutra invariable en /forgot para evitar enumeración.                                |
| SEC-05 | Rate limiting por IP y email.                                                                 |
| SEC-06 | Logs no incluyen el token plano.                                                              |

### Negative Authorization Scenarios

* Usuario autenticado invoca /forgot → permitido pero con logueo.
* Intentos masivos desde misma IP → 429.
* Reuso de token consumido → 400 + log de alerta.

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
| Screen / Route      | `/[locale]/auth/forgot-password`, `/[locale]/auth/reset-password`  |
| Main UI Pattern     | Form simple en cada paso                                            |
| Primary Action      | "Enviar enlace de recuperación" / "Guardar nueva contraseña"        |
| Secondary Actions   | "Volver a login"                                                    |
| Empty State         | No aplica                                                          |
| Loading State       | Spinner                                                            |
| Error State         | Banner con mensaje neutro o específico (token)                      |
| Success State       | Confirmación + redirect a login                                     |
| Accessibility Notes | Labels, focus en email, errores con aria-live                       |
| Responsive Notes    | Mobile-first                                                       |
| i18n Notes          | 4 locales                                                          |
| Currency Notes      | No aplica                                                          |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/auth/forgot-password`
  * `/[locale]/auth/reset-password`
* Components:

  * `ForgotPasswordForm`, `ResetPasswordForm`
* State Management:

  * React Hook Form + Zod; TanStack mutations
* Forms:

  * Validación local + server
* API Client:

  * `authApi.forgotPassword`, `authApi.resetPassword`

### Backend

* Use Case / Service:

  * `RequestPasswordResetUseCase`, `ResetPasswordUseCase`
* Controller / Route:

  * `POST /api/v1/auth/password/forgot`
  * `POST /api/v1/auth/password/reset`
* Authorization Policy:

  * Anonymous
* Validation:

  * `ForgotPasswordDTO`, `ResetPasswordDTO`
* Transaction Required:

  * Sí en /reset (cambiar password + invalidar token)

### Database

* Main Tables:

  * `users`, `password_reset_tokens`
* Constraints:

  * `password_reset_tokens.token_hash` UNIQUE
  * `expires_at` NOT NULL
* Index Considerations:

  * Índice por `user_id`, `expires_at`

### API

| Method | Endpoint                                  | Purpose                          |
| ------ | ----------------------------------------- | -------------------------------- |
| POST   | `/api/v1/auth/password/forgot`            | Solicitar enlace de recuperación |
| POST   | `/api/v1/auth/password/reset`             | Establecer nueva contraseña      |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`auth.reset.requested`, `auth.reset.completed`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                                      | Type        |
| ----- | ------------------------------------------------------------- | ----------- |
| TS-01 | Solicitud con email existente envía email simulado            | Integration |
| TS-02 | Solicitud con email inexistente devuelve mensaje neutro       | Integration |
| TS-03 | Reset con token válido cambia password y lo invalida          | Integration |
| TS-04 | Flujo E2E completo                                            | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result            |
| ----- | ------------------------------------- | -------------------------- |
| NT-01 | Token expirado                        | 400 TOKEN_EXPIRED          |
| NT-02 | Token ya usado                        | 400 TOKEN_USED             |
| NT-03 | Token inexistente / alterado          | 400 TOKEN_INVALID          |
| NT-04 | Nueva contraseña débil                | 400 VALIDATION_ERROR       |
| NT-05 | Rate limit excedido                   | 429                        |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                              | Expected Result |
| ---------- | ------------------------------------- | --------------- |
| AUTH-TS-01 | Anónimo solicita forgot               | 200 neutro      |
| AUTH-TS-02 | Anónimo resetea con token válido      | 200             |
| AUTH-TS-03 | Token de otro usuario / forjado       | 400             |

### Accessibility Tests

* Navegación por teclado.
* Anuncios accesibles de éxito/error.

---

## 📊 Business Impact

| Field               | Value                                                       |
| ------------------- | ----------------------------------------------------------- |
| KPI Affected        | Retención, Reducción de fricción de acceso                  |
| Expected Impact     | Reduce abandono por contraseña olvidada                     |
| Success Criteria    | ≥ 80% de solicitudes válidas completan reset                |
| Academic Demo Value | Demuestra resiliencia de autenticación                      |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Páginas forgot/reset con forms.
* Mutations TanStack Query.
* Mensajes neutros e i18n.

### Potential Backend Tasks

* Use cases y endpoints.
* Generación + hash de token.
* Integración con `MockEmailService`.

### Potential Database Tasks

* Migración `password_reset_tokens`.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests positivos/negativos.
* E2E con seed.

### Potential DevOps / Config Tasks

* Configurar duración del token vía env var.

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

* [ ] Endpoints implementados.
* [ ] Token único + expiración configurados.
* [ ] Email simulado log estructurado.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar duración del token (30 min sugerido).
* Decidir si se invalidan sesiones activas tras reset (recomendado).

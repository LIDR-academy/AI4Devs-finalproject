# 🧾 User Story: Registrarme como proveedor con captcha

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-002                               |
| Epic               | EPIC-AUTH-001 — Authentication & User Access |
| Feature            | Registro de usuario con rol Proveedor |
| Module / Domain    | Auth                                 |
| User Role          | Anonymous → Vendor                   |
| Priority           | Must Have                            |
| Status             | Draft                                |
| Owner              | Product Owner / Business Analyst     |
| Sprint / Milestone | MVP                                  |
| Created Date       | 2026-06-09                           |
| Last Updated       | 2026-06-09                           |

---

## 🎯 User Story

**As a** profesional de servicios para eventos (catering, fotografía, decoración, música, mobiliario, etc.)
**I want** crear una cuenta en EventFlow con mi correo, contraseña y rol de Proveedor, validando captcha
**So that** pueda configurar mi perfil, ser aprobado por el admin y comenzar a recibir solicitudes de cotización

---

## 🧠 Business Context

### Context Summary

El registro como proveedor inicia el ciclo de vida del lado de la oferta del MVP. Tras el registro, el proveedor debe completar su `VendorProfile` (US-040) para que el administrador lo apruebe (US-074). Sin proveedores registrados y aprobados, el organizador no podrá enviar cotizaciones y el camino crítico del demo se rompe. El registro está protegido por captcha (Decisión PO 8.1 #8) y el rol es inmutable porque el MVP es single-role.

### Related Domain Concepts

* User (rol = vendor).
* VendorProfile en estado `pending` post-registro.
* Captcha / anti-bot.

### Assumptions

* El proveedor completará su perfil en una historia separada (US-040).
* El estado inicial de `VendorProfile` será `pending` hasta aprobación admin.
* No requiere documentación legal en MVP (no KYC).

### Dependencies

* EPIC-BE-001, EPIC-DB-001, EPIC-SEC-001, EPIC-API-001.
* EPIC-VND-001 para la creación posterior del perfil.

---

## 🔗 Traceability

| Source                 | Reference                                           |
| ---------------------- | --------------------------------------------------- |
| FRD Requirement(s)     | FR-AUTH-001, FR-AUTH-002, FR-USER-001               |
| Use Case(s)            | UC-AUTH-002                                         |
| Business Rule(s)       | BR-AUTH-001..003, BR-USER-001, BR-VENDOR-001         |
| Permission Rule(s)     | Anonymous puede registrarse; rol Vendor tras registro |
| Data Entity / Entities | User, Role, VendorProfile (pending)                 |
| API Endpoint(s)        | POST /api/v1/auth/register                          |
| NFR Reference(s)       | NFR-SEC-001, NFR-SEC-002                            |
| Related ADR(s)         | ADR-SEC-001, ADR-ARCH-001                           |
| Related Document(s)    | /docs/5, /docs/19, /docs/8.1 (#8), /docs/6           |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* KYC, verificación documental o validación legal.
* Verificación de identidad por video.
* Suscripción comercial o cobro al proveedor.
* Multi-rol simultáneo por usuario.

### Scope Notes

* No introduce captura de documentos legales.
* No introduce verificación bancaria.
* No introduce cobros ni boost premium.
* El proveedor no puede operar (recibir QuoteRequests) hasta tener `VendorProfile.approved`.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Registro exitoso como proveedor

**Given** un usuario anónimo accede a `/auth/register?role=vendor`
**When** ingresa nombre, email único, contraseña fuerte, acepta términos y resuelve captcha
**Then** se crea un `User` con `role=vendor`, se inicia sesión, se redirige al onboarding del proveedor.

### AC-02: Onboarding hacia creación de perfil

**Given** registro exitoso
**When** entra a su dashboard
**Then** ve un CTA para completar su `VendorProfile` con estado `pending`.

### AC-03: Idioma e identidad coherentes

**Given** el navegador en `pt`
**When** el registro es exitoso
**Then** `preferred_language=pt` y la UI se carga en portugués.

---

## ⚠️ Edge Cases

### EC-01: Email duplicado entre roles

**Given** existe un `User` con ese email (organizador)
**When** intenta registrarse como proveedor con el mismo email
**Then** rechazo con mensaje genérico; no revela rol existente.

#### Handling

* No se permite multi-rol con mismo email.
* Mensaje neutro y registro en logs con `correlationId`.

---

### EC-02: Captcha fallido

**Given** captcha no válido
**When** envía formulario
**Then** rechazo con `CAPTCHA_INVALID`.

#### Handling

* Reinicio del widget captcha en frontend.
* Sin persistencia de datos.

---

## 🚫 Validation Rules

| ID    | Rule                                            | Message / Behavior                                |
| ----- | ----------------------------------------------- | ------------------------------------------------- |
| VR-01 | Email obligatorio, único y válido               | "No fue posible completar el registro"            |
| VR-02 | Contraseña fuerte (≥10, complejidad)            | "La contraseña no cumple los requisitos"          |
| VR-03 | Nombre comercial obligatorio (2-150 caracteres) | "El nombre comercial es obligatorio"              |
| VR-04 | Aceptación de términos y privacidad             | "Debes aceptar los términos"                      |
| VR-05 | Captcha válido                                  | "Verificación de seguridad fallida"               |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| SEC-01 | Endpoint accesible solo a anónimos.                                                 |
| SEC-02 | Captcha verificado server-side antes de persistir.                                  |
| SEC-03 | Rate limiting por IP y por email candidato.                                         |
| SEC-04 | Hashing argon2id; nunca se loguea la contraseña.                                    |
| SEC-05 | Cookies HTTP-only, Secure, SameSite=Lax.                                            |
| SEC-06 | Backend nunca permite `role=admin` aquí.                                            |

### Negative Authorization Scenarios

* Usuario ya autenticado → redirección.
* Intento de `role=admin` → forzado a `vendor`.
* Exceso de intentos → 429.

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

| Area                | Notes                                                                |
| ------------------- | -------------------------------------------------------------------- |
| Screen / Route      | `/[locale]/auth/register?role=vendor`                                |
| Main UI Pattern     | Form con datos comerciales + credenciales + captcha + términos        |
| Primary Action      | "Crear mi cuenta de proveedor"                                       |
| Secondary Actions   | "Soy organizador →", "Ya tengo cuenta"                               |
| Empty State         | No aplica                                                            |
| Loading State       | Spinner en botón                                                     |
| Error State         | Banner + mensajes inline                                             |
| Success State       | Redirección a onboarding vendor                                      |
| Accessibility Notes | Labels, aria-describedby, focus inicial en nombre comercial           |
| Responsive Notes    | Mobile-first                                                         |
| i18n Notes          | es-LATAM, es-ES, pt, en                                              |
| Currency Notes      | No aplica                                                            |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/auth/register`
* Components:

  * `RegisterVendorForm`, `CaptchaWidget`
* State Management:

  * React Hook Form + Zod, TanStack Query mutation `useRegisterVendor`
* Forms:

  * Zod alineado al backend
* API Client:

  * `authApi.registerVendor(payload)`

### Backend

* Use Case / Service:

  * `RegisterVendorUseCase`
* Controller / Route:

  * `POST /api/v1/auth/register`
* Authorization Policy:

  * Anonymous only
* Validation:

  * `RegisterVendorDTO`
* Transaction Required:

  * Sí (crear User + cookie)

### Database

* Main Tables:

  * `users`
* Constraints:

  * `email` UNIQUE
* Index Considerations:

  * Índice por email

### API

| Method | Endpoint                          | Purpose                              |
| ------ | --------------------------------- | ------------------------------------ |
| POST   | `/api/v1/auth/register`           | Crear cuenta proveedor con captcha   |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                              | Type        |
| ----- | ----------------------------------------------------- | ----------- |
| TS-01 | Registro exitoso vendor con captcha                   | Integration |
| TS-02 | Redirección post-registro al onboarding vendor        | E2E         |
| TS-03 | Cookies con flags correctos                           | API         |

### Negative Tests

| ID    | Scenario                  | Expected Result        |
| ----- | ------------------------- | ---------------------- |
| NT-01 | Email duplicado           | 409 genérico           |
| NT-02 | Captcha inválido          | 400                    |
| NT-03 | Contraseña débil          | 400                    |
| NT-04 | Intento de role=admin     | Forzado a vendor       |
| NT-05 | Rate limit excedido       | 429                    |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                            | Expected Result |
| ---------- | ----------------------------------- | --------------- |
| AUTH-TS-01 | Anónimo invoca endpoint             | 201             |
| AUTH-TS-02 | Autenticado invoca endpoint         | 409 / redirect  |

### Accessibility Tests

* Navegación por teclado.
* Focus visible.
* Anuncios de error con aria-live.

---

## 📊 Business Impact

| Field               | Value                                                              |
| ------------------- | ------------------------------------------------------------------ |
| KPI Affected        | Vendor signup rate, Marketplace supply readiness                   |
| Expected Impact     | Habilita la oferta del marketplace, base del flujo de cotización    |
| Success Criteria    | ≥ 95% de registros válidos completan; tasa de aprobación admin > 50% |
| Academic Demo Value | Demuestra el flujo de onboarding de proveedor y curaduría admin    |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Crear página `register/vendor`.
* Implementar mutation y validaciones.
* Integrar captcha y next-intl.

### Potential Backend Tasks

* Implementar `RegisterVendorUseCase`.
* Validar captcha y rate limiting.
* Emitir cookie de sesión.

### Potential Database Tasks

* Usar tabla `users` existente; sin migración adicional.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests positivos/negativos.
* E2E del flujo vendor signup.

### Potential DevOps / Config Tasks

* Variables de entorno compartidas con US-001.

---

## ✅ Definition of Ready

* [x] Rol claro (Anonymous → Vendor).
* [x] Valor de negocio claro.
* [x] FRD/UC/BR enlazados.
* [x] Permisos y ownership identificados.
* [x] Entidades listadas.
* [x] AC en GWT.
* [x] Edge cases documentados.
* [x] Validación clara.
* [x] Out of Scope explícito.
* [x] Dependencias conocidas.
* [x] UX states identificados.
* [x] API definida.
* [x] Test scenarios definidos.
* [ ] PO/BA validó.

---

## 🏁 Definition of Done

* [ ] Endpoint funcional.
* [ ] Captcha y argon2id integrados.
* [ ] Cookies HTTP-only configuradas.
* [ ] Frontend en 4 locales.
* [ ] Tests verdes.
* [ ] Logs con correlationId.
* [ ] Rate limiting activo.
* [ ] PO valida.

---

## 📝 Notes

* Tras esta historia, el proveedor debe ir a US-040 (crear VendorProfile) y luego ser aprobado en US-074.
* Confirmar con PO si conviene exigir nombre comercial vs. nombre de persona en registro.

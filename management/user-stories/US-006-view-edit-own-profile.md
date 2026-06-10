# 🧾 User Story: Ver y editar mi perfil propio

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-006                               |
| Epic               | EPIC-AUTH-001 — Authentication & User Access |
| Feature            | Gestión de perfil propio             |
| Module / Domain    | Auth / Users                         |
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
**I want** consultar y editar los datos de mi propio perfil (nombre, teléfono opcional, idioma preferido, contraseña)
**So that** mi información esté actualizada y mi experiencia esté localizada en mi idioma

---

## 🧠 Business Context

### Context Summary

Los perfiles se mantienen mínimos en MVP. El usuario puede actualizar nombre, teléfono opcional, idioma preferido y contraseña. El email no es editable en MVP por la complejidad de re-verificación. El rol nunca es editable por el usuario.

### Related Domain Concepts

* User propio (ownership policy).
* preferred_language (impacta UI e IA).

### Assumptions

* El usuario sólo puede modificar su propio recurso (`/users/me`).
* Cambio de contraseña requiere contraseña actual.

### Dependencies

* EPIC-AUTH-001 (sesión).
* EPIC-API-001 (DTOs).

---

## 🔗 Traceability

| Source                 | Reference                              |
| ---------------------- | -------------------------------------- |
| FRD Requirement(s)     | FR-USER-001, FR-USER-002, FR-USER-003, FR-USER-004 |
| Use Case(s)            | UC-AUTH-006                            |
| Business Rule(s)       | BR-USER-001..006                       |
| Permission Rule(s)     | Ownership: sólo el dueño edita su perfil |
| Data Entity / Entities | User                                   |
| API Endpoint(s)        | GET /api/v1/users/me, PATCH /api/v1/users/me, POST /api/v1/users/me/password |
| NFR Reference(s)       | NFR-SEC-003                            |
| Related ADR(s)         | ADR-SEC-001                            |
| Related Document(s)    | /docs/5, /docs/6                       |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Cambio de email (Future con re-verificación).
* Cambio de rol por el propio usuario.
* Eliminación de cuenta auto-servicio (Future).
* Avatar / foto de perfil del User (no del VendorProfile).

### Scope Notes

* No introduce multi-rol.
* No introduce verificación legal.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Ver mi perfil

**Given** un usuario autenticado en `/profile`
**When** carga la pantalla
**Then** ve nombre, email (no editable), teléfono opcional, idioma preferido, rol y datos derivados (fecha de creación).

### AC-02: Editar mis datos básicos

**Given** un usuario autenticado
**When** edita nombre, teléfono o idioma preferido y guarda
**Then** el backend actualiza el `User` propio (ownership policy), responde 200 y la UI refleja los cambios.

### AC-03: Cambiar contraseña

**Given** un usuario autenticado
**When** ingresa su contraseña actual y una nueva válida
**Then** el backend verifica la actual, actualiza el hash y opcionalmente cierra otras sesiones.

---

## ⚠️ Edge Cases

### EC-01: Intento de cambiar email

**Given** el usuario manipula el DTO incluyendo `email`
**When** envía el PATCH
**Then** backend ignora el campo (no editable) y responde 200 sin cambios al email.

#### Handling

* Whitelist de campos editables.

---

### EC-02: Contraseña actual incorrecta

**Given** intenta cambio de password
**When** la actual es errónea
**Then** 400 `INVALID_CURRENT_PASSWORD`.

#### Handling

* Mensaje claro.
* Rate limiting.

---

### EC-03: Intento de editar perfil ajeno

**Given** usuario A
**When** intenta PATCH `/api/v1/users/{idDeOtroUsuario}`
**Then** 403 `FORBIDDEN`.

#### Handling

* Ownership policy estricta.
* Log de evento sospechoso.

---

## 🚫 Validation Rules

| ID    | Rule                                              | Message / Behavior                  |
| ----- | ------------------------------------------------- | ----------------------------------- |
| VR-01 | Nombre 2-120 caracteres                           | "El nombre es obligatorio"          |
| VR-02 | Teléfono opcional con formato E.164 si se provee  | "Teléfono inválido"                 |
| VR-03 | Idioma debe ser uno de {es-LATAM, es-ES, pt, en}  | "Idioma no soportado"               |
| VR-04 | Nueva contraseña cumple política                  | "La contraseña no cumple requisitos" |
| VR-05 | Contraseña actual requerida para cambio           | "Contraseña actual incorrecta"      |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| SEC-01 | Endpoint requiere sesión activa.                                                    |
| SEC-02 | Ownership policy: sólo `/users/me`.                                                 |
| SEC-03 | Cambio de password verifica la actual con argon2id en tiempo constante.             |
| SEC-04 | Logs nunca exponen password ni hash.                                                |
| SEC-05 | Whitelist de campos editables; ignorar `email`, `role`.                              |
| SEC-06 | Opcionalmente cerrar otras sesiones al cambiar password.                            |

### Negative Authorization Scenarios

* Usuario anónimo → 401.
* Intento de editar otro perfil → 403.
* Intento de cambiar rol → ignorado por whitelist.

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

| Area                | Notes                                                       |
| ------------------- | ----------------------------------------------------------- |
| Screen / Route      | `/[locale]/profile`                                         |
| Main UI Pattern     | Pestañas (Datos básicos / Seguridad) o secciones acordeón   |
| Primary Action      | "Guardar cambios"                                           |
| Secondary Actions   | Cancelar, "Cambiar contraseña"                              |
| Empty State         | No aplica                                                   |
| Loading State       | Skeleton y spinner en submit                                |
| Error State         | Mensajes inline + banner                                    |
| Success State       | Toast "Perfil actualizado"                                  |
| Accessibility Notes | Labels, focus, anuncios accesibles                          |
| Responsive Notes    | Mobile-first                                                |
| i18n Notes          | 4 locales                                                   |
| Currency Notes      | No aplica                                                   |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * `/[locale]/profile`
* Components:

  * `ProfileForm`, `ChangePasswordForm`
* State Management:

  * TanStack Query: `useMe`, `useUpdateProfile`, `useChangePassword`
* Forms:

  * RHF + Zod
* API Client:

  * `usersApi.me`, `usersApi.update`, `usersApi.changePassword`

### Backend

* Use Case / Service:

  * `UpdateOwnProfileUseCase`, `ChangePasswordUseCase`
* Controller / Route:

  * `GET/PATCH /api/v1/users/me`
  * `POST /api/v1/users/me/password`
* Authorization Policy:

  * RBAC (cualquier rol auth) + Ownership Policy
* Validation:

  * `UpdateProfileDTO`, `ChangePasswordDTO`
* Transaction Required:

  * Sí para change password (invalidar otras sesiones)

### Database

* Main Tables:

  * `users`
* Constraints:

  * Email no editable post-creación
* Index Considerations:

  * Índice por id (PK)

### API

| Method | Endpoint                                  | Purpose                |
| ------ | ----------------------------------------- | ---------------------- |
| GET    | `/api/v1/users/me`                        | Obtener perfil propio  |
| PATCH  | `/api/v1/users/me`                        | Actualizar perfil      |
| POST   | `/api/v1/users/me/password`               | Cambiar contraseña     |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`user.profile.updated`, `user.password.changed`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                          | Type        |
| ----- | ------------------------------------------------- | ----------- |
| TS-01 | Lectura de perfil propio                          | API         |
| TS-02 | Actualización de nombre/teléfono/idioma           | Integration |
| TS-03 | Cambio de password exitoso                        | Integration |
| TS-04 | E2E pantalla perfil                               | E2E         |

### Negative Tests

| ID    | Scenario                              | Expected Result            |
| ----- | ------------------------------------- | -------------------------- |
| NT-01 | Editar perfil ajeno                   | 403                        |
| NT-02 | Intentar cambiar email/role           | Cambio ignorado            |
| NT-03 | Password actual incorrecto            | 400 INVALID_CURRENT_PASSWORD |
| NT-04 | Idioma no soportado                   | 400                        |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result |
| ---------- | --------------------------------- | --------------- |
| AUTH-TS-01 | Sesión activa edita su perfil     | 200             |
| AUTH-TS-02 | Sin sesión                        | 401             |
| AUTH-TS-03 | Otro perfil                       | 403             |

### Accessibility Tests

* Etiquetas claras.
* Anuncios de éxito/error.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Retención, calidad de datos                          |
| Expected Impact     | Datos actualizados permiten mejor experiencia        |
| Success Criteria    | Tasa de errores de update < 1%                       |
| Academic Demo Value | Muestra control del usuario sobre sus datos          |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Pantalla perfil + forms.
* Validaciones Zod.
* Cambio de password con flujo aparte.

### Potential Backend Tasks

* Use cases y endpoints.
* Whitelist de campos editables.
* Verificación de password actual.

### Potential Database Tasks

* Sin migraciones adicionales (campos existen).

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

* [ ] Endpoints implementados.
* [ ] Frontend integrado.
* [ ] Tests verdes.
* [ ] Logs estructurados.
* [ ] PO valida.

---

## 📝 Notes

* Confirmar política de cerrar otras sesiones al cambiar password.
* Definir si teléfono se valida con librería (libphonenumber).

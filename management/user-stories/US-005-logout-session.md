# 🧾 User Story: Cerrar sesión

## 🆔 Metadata

| Field              | Value                                |
| ------------------ | ------------------------------------ |
| ID                 | US-005                               |
| Epic               | EPIC-AUTH-001 — Authentication & User Access |
| Feature            | Logout explícito                     |
| Module / Domain    | Auth                                 |
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
**I want** cerrar sesión de manera explícita desde cualquier pantalla
**So that** pueda finalizar mi acceso de forma segura, especialmente en dispositivos compartidos

---

## 🧠 Business Context

### Context Summary

El logout debe invalidar la cookie HTTP-only, eliminar cualquier estado de sesión en frontend y redirigir al login. Es un requisito mínimo de seguridad y de UX común en cualquier app web.

### Related Domain Concepts

* Sesión / cookie HTTP-only firmada.
* Invalidación de sesión server-side (si existe tabla de sesiones).

### Assumptions

* La cookie es la única fuente de sesión en MVP.
* El frontend limpia caché de TanStack Query tras logout.

### Dependencies

* US-003 (login para que exista sesión).
* EPIC-SEC-001 (manejo de cookies).

---

## 🔗 Traceability

| Source                 | Reference                              |
| ---------------------- | -------------------------------------- |
| FRD Requirement(s)     | FR-AUTH-009                            |
| Use Case(s)            | UC-AUTH-005                            |
| Business Rule(s)       | BR-AUTH-009                            |
| Permission Rule(s)     | Cualquier rol autenticado              |
| Data Entity / Entities | User (sesión)                          |
| API Endpoint(s)        | POST /api/v1/auth/logout               |
| NFR Reference(s)       | NFR-SEC-003                            |
| Related ADR(s)         | ADR-SEC-001                            |
| Related Document(s)    | /docs/19                               |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: In Scope
* MVP Relevance: Must Have

### Explicitly Out of Scope

* Logout selectivo por dispositivo (Future).
* Listado de sesiones activas (Future).
* Logout SSO/federated.

### Scope Notes

* Esta historia no introduce gestión avanzada de sesiones.
* No introduce logout silencioso por inactividad (Future).

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Logout exitoso

**Given** un usuario autenticado
**When** hace clic en "Cerrar sesión"
**Then** el backend invalida la cookie (Set-Cookie con expiración pasada), responde 200 y el frontend redirige a `/auth/login`.

### AC-02: Estado del cliente limpio

**Given** logout exitoso
**When** el frontend procesa la respuesta
**Then** se invalida el caché de TanStack Query y se eliminan cualquier dato sensible del store local.

---

## ⚠️ Edge Cases

### EC-01: Cookie ya inválida

**Given** la cookie venció antes del clic en logout
**When** el usuario invoca el endpoint
**Then** el backend responde 200 idempotente y el frontend redirige igual.

#### Handling

* No falla con 401.
* Logueo informativo.

---

### EC-02: Múltiples pestañas

**Given** el usuario tiene varias pestañas abiertas
**When** hace logout en una
**Then** las demás pestañas detectan la expiración (al próximo request) y redirigen.

#### Handling

* TanStack Query maneja 401 globalmente y redirige.

---

## 🚫 Validation Rules

| ID    | Rule                                  | Message / Behavior            |
| ----- | ------------------------------------- | ----------------------------- |
| VR-01 | No requiere payload                   | 200 OK incluso sin body       |
| VR-02 | Cookie de logout sobreescribe la actual | Set-Cookie con maxAge=0     |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                |
| ------ | ------------------------------------------------------------------- |
| SEC-01 | Endpoint accesible solo con sesión (o idempotente para 401 silenciado). |
| SEC-02 | Invalidar cookie con Path correcto y dominio.                       |
| SEC-03 | Si se persisten sesiones server-side, marcarlas como `revoked`.     |
| SEC-04 | Logear evento `auth.logout`.                                         |

### Negative Authorization Scenarios

* Endpoint llamado sin cookie → 200 idempotente.
* CSRF: el endpoint requiere método POST + cookie SameSite=Lax.

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

| Area                | Notes                                       |
| ------------------- | ------------------------------------------- |
| Screen / Route      | Header / menú lateral en todos los layouts  |
| Main UI Pattern     | Botón / item de menú                        |
| Primary Action      | "Cerrar sesión"                             |
| Secondary Actions   | Cancelar (en modal de confirmación opcional) |
| Empty State         | No aplica                                   |
| Loading State       | Spinner breve en botón                      |
| Error State         | Toast genérico si falla la red              |
| Success State       | Redirect a login                            |
| Accessibility Notes | Foco visible; aria-label si es ícono        |
| Responsive Notes    | Mobile-first                                |
| i18n Notes          | 4 locales                                   |
| Currency Notes      | No aplica                                   |

---

## 🛠 Technical Notes

### Frontend

* Route / Page:

  * Header en todos los layouts autenticados
* Components:

  * `LogoutButton`, `UserMenu`
* State Management:

  * TanStack Query `useLogout` + invalidate all queries
* Forms:

  * No aplica
* API Client:

  * `authApi.logout()`

### Backend

* Use Case / Service:

  * `LogoutUseCase`
* Controller / Route:

  * `POST /api/v1/auth/logout`
* Authorization Policy:

  * Auth opcional (idempotente)
* Validation:

  * No payload
* Transaction Required:

  * No

### Database

* Main Tables:

  * `sessions` (opcional)
* Constraints:

  * No aplica
* Index Considerations:

  * Sólo si se persisten sesiones

### API

| Method | Endpoint                       | Purpose          |
| ------ | ------------------------------ | ---------------- |
| POST   | `/api/v1/auth/logout`          | Cerrar sesión    |

### Observability / Audit

* Correlation ID Required: Yes
* Log Event Required: Yes (`auth.logout`)
* AdminAction Required: No
* AIRecommendation Required: No

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                  | Type        |
| ----- | ----------------------------------------- | ----------- |
| TS-01 | Logout invalida cookie                    | API         |
| TS-02 | Frontend limpia caché y redirige          | E2E         |
| TS-03 | Idempotencia sin cookie                   | API         |

### Negative Tests

| ID    | Scenario                              | Expected Result      |
| ----- | ------------------------------------- | -------------------- |
| NT-01 | GET en vez de POST                    | 405 Method Not Allowed |
| NT-02 | Endpoint sin cookie                   | 200 idempotente      |

### AI Tests

Not applicable for this story.

### Authorization Tests

| ID         | Scenario                          | Expected Result |
| ---------- | --------------------------------- | --------------- |
| AUTH-TS-01 | Logout autenticado                | 200             |
| AUTH-TS-02 | Logout sin cookie                 | 200 idempotente |

### Accessibility Tests

* Botón accesible por teclado y screen reader.
* Confirmación opcional accesible.

---

## 📊 Business Impact

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| KPI Affected        | Seguridad de cuenta, satisfacción de usuario         |
| Expected Impact     | Mitigación de uso compartido no intencional          |
| Success Criteria    | 100% de logouts invalidan la cookie                  |
| Academic Demo Value | Cierre limpio de sesión durante la demo              |

---

## 🧩 Task Breakdown Readiness

### Potential Frontend Tasks

* Botón logout en header/menú.
* Mutation TanStack Query + invalidate cache.
* Redirección post-logout.

### Potential Backend Tasks

* Endpoint `logout` + invalidar cookie.

### Potential Database Tasks

* Not applicable for this story.

### Potential AI / PromptOps Tasks

* Not applicable for this story.

### Potential QA Tasks

* Tests positivos/negativos + E2E.

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

* [ ] Endpoint operativo.
* [ ] Frontend limpia caché.
* [ ] Tests verdes.
* [ ] PO valida.

---

## 📝 Notes

* Considerar modal de confirmación opcional para roles admin.
* Si se persisten sesiones server-side, eliminar registro.

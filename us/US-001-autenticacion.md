# US-001 — Inicio de sesión

## [original] Historia de Usuario

**Como** empleado del taller (administrador o mecánico),
**quiero** iniciar sesión con mis credenciales,
**para** acceder al sistema según mi rol y tener acceso solo a las funciones que me corresponden.

## [enhanced] Historia de Usuario

**Como** empleado del taller (administrador o mecánico),
**quiero** iniciar sesión con mi correo y contraseña y mantener una sesión segura,
**para** acceder a MecaTrack con permisos acordes a mi rol (`ADMIN` o `MECHANIC`) y navegar solo por las rutas y acciones autorizadas.

**Alcance MVP:** autenticación por credenciales, emisión de tokens, redirección por rol, cierre de sesión y rechazo de cuentas inactivas. Fuera de alcance: recuperación de contraseña, OAuth, MFA y cambio obligatorio de contraseña temporal (previsto en US-002 como deseable V2).

---

## [original] Criterios de Aceptación

- [ ] El sistema muestra un formulario de login con campos: correo electrónico y contraseña.
- [ ] Si las credenciales son válidas, el usuario es redirigido al dashboard correspondiente a su rol.
- [ ] Si las credenciales son inválidas, se muestra un mensaje de error genérico (sin indicar cuál campo falló).
- [ ] Un usuario con cuenta desactivada no puede iniciar sesión; se muestra mensaje indicando que la cuenta está inactiva.
- [ ] La sesión se mantiene activa mientras el usuario no cierre sesión manualmente.
- [ ] Existe un botón/opción para cerrar sesión desde cualquier pantalla.

## [enhanced] Criterios de Aceptación

### UI — Pantalla de login

- [ ] Ruta pública: `/login`. Usuarios autenticados que visiten `/login` se redirigen a su dashboard según rol.
- [ ] Formulario con campos:
  - `email` (obligatorio, formato email válido)
  - `password` (obligatorio, mínimo 8 caracteres en validación de cliente; el backend valida presencia)
- [ ] Botón **Iniciar sesión** deshabilitado mientras el formulario sea inválido o haya una petición en curso.
- [ ] Estados de carga visibles durante la petición (spinner o botón en loading).
- [ ] Mensajes de error accesibles (`aria-live`) y sin revelar si falló email o contraseña.

### Login exitoso

- [ ] Con credenciales válidas y cuenta `active = true`:
  - Rol `ADMIN` → redirección a `/admin/dashboard`
  - Rol `MECHANIC` → redirección a `/mechanic/dashboard`
- [ ] La API devuelve `accessToken` (JWT, vida corta, p. ej. 15 min) y establece `refreshToken` en cookie `httpOnly`, `Secure` (prod), `SameSite=Strict`.
- [ ] El frontend persiste el usuario mínimo en contexto (id, email, fullName, role) tras validar sesión con `GET /api/auth/me`.

### Login fallido

- [ ] Credenciales incorrectas → HTTP `401` con mensaje genérico: *"Invalid email or password"* (mismo texto en UI, sin distinguir campo).
- [ ] Cuenta inactiva (`active = false`) → HTTP `403` con mensaje: *"Your account is inactive. Contact the workshop administrator."*
- [ ] Email con formato inválido o campos vacíos → HTTP `400` con detalle de validación por campo (solo en validación de formato, no en credenciales incorrectas).

### Sesión y cierre

- [ ] La sesión permanece activa mediante refresh automático del access token mientras exista refresh token válido.
- [ ] **Cerrar sesión** visible en el layout autenticado (header/nav): invalida refresh en servidor, borra cookie y estado local, redirige a `/login`.
- [ ] Acceso a rutas protegidas sin token válido → redirección a `/login` guardando `returnUrl` opcional.

### Seguridad y autorización (transversal a la US)

- [ ] Endpoints protegidos exigen `Authorization: Bearer <accessToken>` y guard de rol cuando aplique.
- [ ] Un `MECHANIC` que intente `GET /admin/*` recibe `403` en API y redirección o página 403 en UI.

### Casos límite

- [ ] Rate limit en `POST /api/auth/login`: máx. 5 intentos por IP/email en 15 min → `429 Too Many Requests`.
- [ ] Refresh token expirado o revocado → `401` y redirección a login.
- [ ] No registrar contraseñas ni tokens en logs.

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol (enum) | Código | Dashboard post-login | Permisos en esta US |
|------------|--------|----------------------|---------------------|
| Administrador | `ADMIN` | `/admin/dashboard` | Login, logout, sesión, acceso a rutas admin |
| Mecánico | `MECHANIC` | `/mechanic/dashboard` | Login, logout, sesión, acceso a rutas mecánico |

---

## [original] Notas técnicas

- Autenticación basada en JWT o sesión con cookie segura.
- Las contraseñas deben almacenarse hasheadas (bcrypt o equivalente).
- Las cuentas desactivadas conservan sus datos históricos pero no pueden autenticarse.

## [enhanced] Especificación técnica

### Modelo de datos (Prisma)

Entidad `User` (módulo `users`; consumida por `auth`):

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | `UUID` | PK, default `uuid()` |
| `email` | `String` | `unique`, `not null`, index |
| `passwordHash` | `String` | `not null` — nunca exponer en API |
| `fullName` | `String` | `not null` |
| `role` | `Enum UserRole` | `ADMIN` \| `MECHANIC` |
| `active` | `Boolean` | `default true`, `not null` |
| `createdAt` | `DateTime` | `default now()` |
| `updatedAt` | `DateTime` | `@updatedAt` |

Opcional para refresh token stateful (recomendado MVP):

| Campo | Tipo | Notas |
|-------|------|-------|
| `refreshTokenHash` | `String?` | Hash del refresh vigente; `null` tras logout |
| `refreshTokenExpiresAt` | `DateTime?` | p. ej. 7 días |

### API REST

Prefijo global: `/api`. Formato de error estándar:

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

#### `POST /api/auth/login`

**Request body:**

```json
{
  "email": "mechanic@workshop.com",
  "password": "SecurePass123"
}
```

**Response `200`:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "mechanic@workshop.com",
    "fullName": "Juan Mechanic",
    "role": "MECHANIC"
  }
}
```

**Headers:** `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=604800`

**Errores:** `400` validación | `401` credenciales | `403` cuenta inactiva | `429` rate limit

#### `POST /api/auth/refresh`

**Request:** cookie `refreshToken` (sin body).

**Response `200`:** `{ "accessToken": "..." }`

**Errores:** `401` token inválido/expirado

#### `POST /api/auth/logout`

**Request:** cookie `refreshToken` + header `Authorization` (opcional pero recomendado).

**Response `204`:** limpia cookie y `refreshTokenHash` en BD.

#### `GET /api/auth/me`

**Request:** `Authorization: Bearer <accessToken>`

**Response `200`:**

```json
{
  "id": "uuid",
  "email": "mechanic@workshop.com",
  "fullName": "Juan Mechanic",
  "role": "MECHANIC",
  "active": true
}
```

**Errores:** `401` sin token o token expirado

### JWT

| Claim | Valor |
|-------|-------|
| `sub` | `user.id` |
| `email` | `user.email` |
| `role` | `ADMIN` \| `MECHANIC` |
| `exp` | access: 15 min (configurable vía `JWT_ACCESS_TTL`) |

Secretos en variables de entorno: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (o un solo secret con tipos distintos).

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/auth/
├── auth.module.ts
├── auth.controller.ts          # login, refresh, logout, me
├── auth.service.ts             # validateUser, issueTokens, revokeRefresh
├── dto/
│   ├── login.dto.ts
│   └── auth-response.dto.ts
├── strategies/
│   └── jwt.strategy.ts
└── auth.service.spec.ts

src/common/
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   └── roles.decorator.ts
└── filters/
    └── http-exception.filter.ts   # si no existe

prisma/schema.prisma              # model User, enum UserRole
prisma/seed.ts                    # admin + mechanic de prueba
```

**Frontend (`apps/web`)**

```
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── LogoutButton.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useLogin.ts
├── services/
│   └── authApi.ts              # login, logout, refresh, me
└── types/
    └── auth.types.ts

src/app/
├── login/page.tsx
├── admin/dashboard/page.tsx    # placeholder protegido
├── mechanic/dashboard/page.tsx # placeholder protegido
└── layout.tsx                  # AuthProvider + nav con logout

src/shared/
├── lib/apiClient.ts            # interceptors: attach token, refresh on 401
└── components/ProtectedRoute.tsx
```

### Flujo de implementación (orden sugerido)

1. Modelo Prisma `User` + migración + seed (1 admin, 1 mecánico con contraseñas conocidas en `.env.example` / documentación).
2. Tests fallidos de `AuthService` (login válido/inválido/inactivo).
3. `AuthService` + `AuthController` + guards JWT/Roles.
4. Tests de integración e2e API (`supertest`) para los 4 endpoints.
5. UI login + `apiClient` con refresh + `ProtectedRoute`.
6. Layout con logout en todas las pantallas autenticadas.
7. Actualizar `readme.md` sección 4 (OpenAPI ejemplo) y variables en `.env.example`.

### Tests requeridos

| Capa | Archivo / alcance | Escenarios mínimos |
|------|-------------------|-------------------|
| Unit | `auth.service.spec.ts` | login OK; password incorrecta; user inactivo; hash bcrypt verificado |
| Integration | `auth.controller.e2e-spec.ts` | POST login 200/401/403; GET me 200/401; POST logout 204; POST refresh 200/401 |
| E2E (opcional MVP) | Cypress/Playwright | flujo login admin → dashboard → logout → login mecánico |

Cobertura objetivo en módulo `auth`: ≥ 90 % líneas en service y controller.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Seguridad** | bcrypt cost ≥ 10; cookies `httpOnly`; CORS solo origen del frontend; mensajes genéricos en fallo de credenciales; rate limit en login |
| **Rendimiento** | `POST /login` p95 < 500 ms en entorno local con seed |
| **Observabilidad** | Log estructurado de intentos fallidos (email hash o id, sin password) |
| **Accesibilidad** | Labels en inputs, foco en primer error, contraste WCAG AA en formulario |
| **i18n** | Mensajes de UI en español; códigos y enums en inglés |

### Definition of Done

- [ ] Migración Prisma aplicada y seed ejecutable.
- [ ] Endpoints documentados (comentario OpenAPI o fragmento en `readme.md` §4).
- [ ] Tests unitarios e integración en verde en CI/local.
- [ ] Login/logout funcionando en UI con redirección por rol.
- [ ] Cuenta `active=false` no puede autenticarse (verificado en test).
- [ ] `.env.example` incluye `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`.
- [ ] Sin secretos ni contraseñas en el repositorio.

### Dependencias

- **Bloquea:** US-002 (gestión de usuarios) requiere entidad `User` y guards; puede desarrollarse en paralelo si el modelo `User` se define en esta US.
- **Bloqueada por:** ninguna — US-001 es la primera historia del MVP.

---

## [original] Prioridad

Alta — bloqueante para todas las demás historias.

## [enhanced] Prioridad

**Alta (P0)** — bloqueante para US-002 a US-009. Debe completarse antes de cualquier feature que requiera usuario autenticado.

**Estimación orientativa:** 3–5 días (1 dev full-stack) incluyendo tests y wiring frontend/backend.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-001 |
| **Módulo** | `auth` |
| **Estado refinamiento** | Enhanced (local) — pendiente sincronización Jira si aplica |

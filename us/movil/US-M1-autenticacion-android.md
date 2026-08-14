# US-M1 — Inicio de sesión en Android (misma API)

**Fuente:** conversación de producto (app Android sobre la API existente)  
**Prioridad:** V2 / cliente nativo  
**Rama de implementación:** `finalproject-RFM` (salvo petición explícita de otra rama)  
**Estado refinamiento:** Enhanced (local) — `/enrich-us` 2026-08-14; sin Jira MCP; listo para plan BE + Android  
**Refinado:** `/enrich-us` 2026-08-14

> **Spike:** puede existir código en `apps/android` y un delta de auth. **No es DoD.** La implementación oficial sigue planes TDD contra este spec.

---

## [original] Historia de Usuario

**Como** administrador o mecánico del taller,
**quiero** iniciar sesión en una app Android con las mismas credenciales de MecaTrack,
**para** usar el taller desde el teléfono sin otra cuenta ni otro backend.

## [original] Criterios de Aceptación

- [ ] La app muestra un formulario de correo y contraseña.
- [ ] Con credenciales válidas, el usuario entra a la app.
- [ ] Con credenciales inválidas, se muestra un error genérico.
- [ ] Una cuenta inactiva no puede entrar.
- [ ] El usuario puede cerrar sesión.
- [ ] La app consume `POST /api/auth/login` (y el resto de auth) de la API actual.

---

## [enhanced] Historia de Usuario

**Como** empleado del taller (`ADMIN` o `MECHANIC`),
**quiero** autenticarme en un cliente nativo Android contra la API NestJS existente, con access JWT Bearer y un refresh token usable **sin cookie de navegador**,
**para** trabajar en el teléfono con la misma identidad y los mismos roles que en `apps/web`.

**Problema:** `JWT_ACCESS_TTL` por defecto es `15m`. Hoy `POST /api/auth/refresh` solo lee la cookie `httpOnly` `refreshToken` (`Path=/api/auth`). OkHttp/Retrofit no deben depender de esa cookie. Sin delta, a los 15 min la app queda fuera.

**Alcance cerrado**

| Incluye | No incluye |
|---------|------------|
| Delta API: header nativo + refresh en body | Recuperación de contraseña, OAuth, MFA, biometría |
| Login / logout / persistencia de sesión Android | iOS, PWA, Capacitor |
| Refresh automático ante `401` de negocio | Wizard OT (US-M3), lista OT (US-M2 contenido) |
| Shell autenticado mínimo (nombre + logout) | Gestión de usuarios (US-002) |
| Docs OpenAPI auth + README API/Android | Cambiar TTL, secretos, o modelo `User` |

**Dependencia:** US-001, US-012 (rotación/revocación), US-014 (mensajes de login genéricos). **Habilita:** US-M2, US-M3.

---

## [enhanced] Criterios de Aceptación

### 1. Decisiones bloqueadas

| Tema | Decisión |
|------|----------|
| Plataforma | Android nativo, **Kotlin + Jetpack Compose**, módulo `apps/android` |
| minSdk / target | 26 / 35 |
| HTTP | REST JSON a `apps/api` (`/api` prefix). Sin GraphQL. CORS **no aplica** al cliente nativo |
| Identidad | Mismas cuentas seed / producción que la web. No hay usuario “app” |
| Refresh web | **Sin cambio de contrato** si no se envía el header nativo |
| Home post-login | Shell autenticado; el listado de OT es **US-M2** (placeholder o pantalla vacía con logout es suficiente aquí) |

### 2. API — contrato nativo (sin romper la web)

Constante: header `X-MecaTrack-Client: mobile` (comparar en minúsculas; Express normaliza a `x-mecatrack-client`).

#### Campos

**Login request (sin campos nuevos):**

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| `email` | string | Sí | email |
| `password` | string | Sí | no vacío |

**Refresh request body (nuevo, opcional):**

| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| `refreshToken` | string | No | Si viene, string no vacío tras trim. `forbidNonWhitelisted` |

**Login/refresh response extra (solo nativo):**

| Campo | Tipo | Cuándo |
|-------|------|--------|
| `refreshToken` | string (hex opaco, no JWT) | Login con header mobile; refresh si el token vino en body **o** header mobile |

#### `POST /api/auth/login`

- [ ] **Sin** header mobile: `200` = `{ accessToken, user }`. **Prohibido** incluir `refreshToken` en JSON (XSS en web). Cookie `httpOnly` se sigue seteando (US-001).
- [ ] **Con** header mobile: `200` incluye `refreshToken` en JSON **y** sigue seteando cookie (irrelevante en Android).
- [ ] `user`: `{ id, email, fullName, role }` (`ADMIN` \| `MECHANIC`). Nunca `passwordHash` ni `refreshTokenHash`.
- [ ] Credenciales inválidas o cuenta inactiva: `401` genérico `"Invalid email or password"` (código actual / US-014). La UI **no** distingue inactiva vs mala clave. Si el API devolviera `403` (US-001 original), la UI usa el mismo copy genérico.
- [ ] Validación: `400`. Rate limit: `429` (5 / 15 min, US-001). Mensajes API en inglés.

**Response `200` mobile:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3...",
  "user": {
    "id": "uuid",
    "email": "mechanic@taller.com",
    "fullName": "Ana Mecánica",
    "role": "MECHANIC"
  }
}
```

#### `POST /api/auth/refresh`

- [ ] Token = `body.refreshToken` (trim, prioridad) **o** cookie `refreshToken`.
- [ ] Sin ninguno → `401` `"Unauthorized"` (igual que hoy sin cookie).
- [ ] Body presente: rotar y devolver `{ accessToken, refreshToken }`.
- [ ] Header mobile aunque el token venga de cookie: devolver también `refreshToken` rotado.
- [ ] Web (cookie, sin body, sin header): `{ accessToken }` solamente.
- [ ] Cookie se sigue rotando en `Set-Cookie` en todos los casos (no rompe web).
- [ ] Token inválido/revocado/expirado → `401`. Rotación: el anterior no reutiliza (US-012).

#### Sin cambio de contrato

- [ ] `POST /api/auth/logout` — Bearer, `204`, revoca hash + incrementa `sessionVersion`.
- [ ] `GET /api/auth/me` — Bearer, perfil `{ id, email, fullName, role, active }`.

### 3. Android — UI login

Copy ES (alinear con web `mapAuthError`):

| Situación | UI |
|-----------|-----|
| Título | **MecaTrack** |
| Subtítulo | Ingreso de taller |
| Campos | Correo, Contraseña |
| CTA | **Entrar** (loading: deshabilitado / indicador) |
| `401` / `403` | *Correo o contraseña incorrectos* |
| `429` | *Demasiados intentos. Intenta de nuevo más tarde.* |
| `400` | Mensaje de validación API (email inválido) |
| Red / timeout | *Error de conexión. Verifica tu red e intenta de nuevo.* |

- [ ] Email formato + ambos obligatorios en cliente (botón deshabilitado o error local).
- [ ] Login OK: persistir `accessToken`, `refreshToken`, `{ id, email, fullName, role }` y navegar al shell autenticado.
- [ ] Cold start con tokens guardados: no pedir login; opcional `GET /api/auth/me` para validar. Si `401` y refresh falla → login.
- [ ] **Cerrar sesión** en el shell: `POST /logout` (ignorar fallo de red) + borrar almacenamiento + login.

### 4. Sesión HTTP en Android

- [ ] Toda llamada de negocio: `Authorization: Bearer <accessToken>` + `X-MecaTrack-Client: mobile`.
- [ ] Login y refresh **no** mandan Bearer (o el interceptor los excluye).
- [ ] Authenticator: un `401` de negocio → un refresh → reintento **una** vez. Fallo → limpiar sesión → login.
- [ ] No loguear password ni tokens (OkHttp BASIC logs sin Authorization en release; debug puede BASIC sin bodies).

### 5. Base URL

| Entorno | URL |
|---------|-----|
| Emulador local | `http://10.0.2.2:4000/api/` |
| Dispositivo físico (debug) | IP LAN del host, p. ej. `http://192.168.x.x:4000/api/` vía `BuildConfig` / flavor |
| Producción | HTTPS del API desplegado; **sin** cleartext |

- [ ] Cleartext solo debug. Release: HTTPS.

### 6. Archivos a crear / modificar

```
apps/api/src/modules/auth/
  auth.controller.ts                 # MOD: header + body refresh
  dto/refresh-token.dto.ts           # NEW
  dto/auth-response.dto.ts           # MOD: refreshToken? opcional
  utils/mobile-client.util.ts        # NEW
  utils/mobile-client.util.spec.ts   # NEW
apps/api/src/common/constants/auth.constants.ts  # MOD opcional: nombre del header
apps/api/test/auth.e2e-spec.ts       # MOD
docs/api-spec.auth.yml               # MOD
apps/api/README.md                   # MOD: fila login/refresh

apps/android/                        # NEW módulo Gradle
  README.md
  app/src/main/java/com/mecatrack/mobile/
    data/api/          # cliente HTTP, DTOs, interceptor, authenticator
    data/session/      # almacenamiento de tokens (privado; cifrado si es viable)
    ui/login/          # pantalla login
    ui/shell/          # post-login mínimo + logout
  app/src/test/java/...              # parseo errores, header/session fakes
```

No tocar `apps/web` en esta US.

### 7. Pruebas

| Capa | Casos |
|------|--------|
| Unit BE | `isMobileClient` true/false/case; `resolveRefreshToken` body > cookie > empty |
| E2E API | Login sin header **no** trae `refreshToken`; con header sí; refresh body rota y no reutiliza el anterior; refresh vacío `401`; cookie refresh web intacto |
| Unit Android | Mapeo 401/403/429/red; no persistir si login no trae refresh (cliente mobile) |
| Manual | Seed `mechanic@taller.com` / `MechanicPass123`; logout; matar app y reabrir con sesión |

### 8. NFR

- [ ] Código/docs inglés; copy UI español.
- [ ] Tokens en almacenamiento de la app (no logs, no backup de tokens si `allowBackup=false`).
- [ ] Rate limit login sin excepciones por ser móvil.
- [ ] No filtrar refresh al JSON de la web.
- [ ] TDD: tests API del delta **antes** de ensanchar el controller; app login después del contrato verde.
- [ ] Sin nuevas dependencias npm en API.

### 9. Documentación

- [ ] `docs/api-spec.auth.yml` — header y body refresh
- [ ] `apps/api/README.md` — tabla auth
- [ ] `apps/android/README.md` — cómo apuntar al API, usuarios seed
- [ ] `us/movil/README.md` — status Implemented cuando cierre DoD de M1 (no antes)

### 10. Pasos de implementación (orden)

1. Unit helper header/body → implementación.
2. Controller login/refresh + e2e auth.
3. OpenAPI + README API.
4. Android: Gradle + HTTP + session store.
5. Android: login UI + persistencia + logout + refresh interceptor.
6. Shell autenticado mínimo.
7. README Android + smoke manual emulador.

### 11. Definition of Done

- [ ] AC enhanced 2–5
- [ ] Tests de la tabla §7 verdes (API). Android unit al menos parseo de errores
- [ ] Web login/refresh por cookie **sin regresión** (e2e auth existentes)
- [ ] Docs §9
- [ ] Código en `finalproject-RFM`
- [ ] **No** incluye lista in-progress ni wizard de alta (M2/M3)

---

## Roles involucrados

| Role | Responsibility |
|------|----------------|
| Backend | Contrato nativo, tests, OpenAPI |
| Android | Login, sesión, refresh, logout |
| QA / PO | Smoke emulador; confirmar que la web no recibe refresh en JSON |

## Notas de producto

- Original AC “cuenta inactiva”: sigue sin poder entrar; el copy **no** debe delatar inactividad (US-014 / web).
- El prototipo previo, si existe, se trata como spike: el plan puede reutilizar archivos solo si cumplen este spec y tienen tests.

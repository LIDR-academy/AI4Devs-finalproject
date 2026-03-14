# Research — US1: Acceso mediante cuenta de Google
**Branch**: `004-google-oauth-login`  
**Phase**: 0 — Research  
**Date**: 2026-02-25

---

## 1. Flujo de autenticación con Google en una arquitectura SPA + REST API

**Decision:** Flujo "Google One Tap / Authorization Code con PKCE" iniciado desde el frontend. El frontend obtiene un `id_token` de Google y lo envía al backend, que lo valida, crea o recupera el perfil del usuario y devuelve un token de sesión propio.

**Rationale:** La aplicación es una SPA React + backend REST independiente (no un servidor MVC que renderice HTML). El flujo redirect de Spring Security OAuth2 Client produce una redirección a una URL del servidor que no corresponde al SPA. La alternativa más limpia para este tipo de arquitectura es:
1. Frontend muestra el botón oficial de Google (Google Identity Services).
2. Al autorizar, Google devuelve un `id_token` (JWT firmado por Google) al frontend.
3. El frontend envía ese token al backend en una solicitud de autenticación.
4. El backend verifica la firma del `id_token` contra las claves públicas de Google.
5. El backend crea o recupera el perfil de usuario y emite su propio token de sesión (JWT propio).
6. El frontend almacena el token de sesión y lo adjunta a todas las llamadas posteriores.

**Alternatives considered:**
- Spring Security OAuth2 Client (redirect flow): descartado porque rompe el modelo SPA; obliga a redirigir el navegador al backend y de vuelta, lo que complica el mantenimiento del estado del frontend.
- Servicio de identidad gestionado externo (Auth0, Cognito, Clerk): fuera de alcance según el PRD original y añade dependencia externa.

---

## 2. Biblioteca frontend para el botón de Google

**Decision:** `@react-oauth/google` (wrapper oficial React de Google Identity Services, GSI).

**Rationale:** Mantiene el stack actual (React 18 + TypeScript). Proporciona el componente `GoogleLogin` que cumple los requisitos de accesibilidad y marca de Google, y devuelve directamente el `id_token` como `credential` en el callback `onSuccess`. No requiere integraciones OAuth adicionales en el frontend (sin redirect, sin PKCE manual).

**Alternatives considered:**
- Botón HTML puro de GSI (sin librería React): más verboso, dificulta el testing con RTL.
- `react-google-login` (deprecated): descartado.

---

## 3. Validación del id_token de Google en el backend

**Decision:** Spring Security OAuth2 Resource Server con `spring-security-oauth2-jose` para verificar el `id_token` de Google como JWT. La URI del conjunto de claves públicas de Google (`https://www.googleapis.com/oauth2/v3/certs`) se configura como JWKS URI.

**Rationale:** Spring Boot 3.x / Spring Security 6.x incluye soporte nativo para validar JWTs firmados con RS256 usando JWKS. No se requiere ninguna librería adicional. La validación incluye: firma, audiencia (`aud` = client_id de Google Cloud), emisor (`iss` = accounts.google.com) y expiración.

**Alternatives considered:**
- `google-api-client` SDK completo: demasiado pesado para solo validar el token.
- Validación manual con `nimbus-jose-jwt`: viable pero requiere más código de plomería que la integración nativa de Spring Security.

---

## 4. Token de sesión propio del backend

**Decision:** El backend emite un JWT propio (firmado con clave simétrica HS256 o asimétrica RS256) que contiene el `userId` (UUID interno) del usuario. Este token tiene una duración configurable (p.ej. 7 días para MVP).

**Rationale:** Desacopla la sesión de la aplicación del ciclo de vida del token de Google. Los bounded contexts existentes (`meditationbuilder`, `meditation.generation`, `playback`) sólo necesitan saber el `userId` del llamante; el JWT propio lo proporciona de forma segura y uniforme. Reemplaza el `X-User-Id` header hardcodeado actual.

**Alternatives considered:**
- Reutilizar directamente el `id_token` de Google como sesión: la duración es muy corta (1h) y obliga al frontend a refrescar con mayor frecuencia. Además acopla los BCs existentes a Google.
- Spring Session con cookie: no compatible con la arquitectura SPA + CORS actual.

---

## 5. Almacenamiento del perfil de usuario

**Decision:** Nueva tabla `identity.users` en el mismo servidor PostgreSQL ya en uso. Columnas clave: UUID interno, identificador único de Google (subject), email, nombre, URL de foto, fecha de creación.

**Rationale:** PostgreSQL ya está en uso para `meditation.generation` y `playback`. Añadir una nueva tabla en un esquema dedicado (`identity`) respeta el aislamiento de bounded contexts sin añadir infraestructura nueva. El UUID interno es generado por nuestra aplicación (no el sub de Google), lo que preserva el diseño existente de todos los BCs.

**Alternatives considered:**
- Tabla en el esquema `generation` (reutilizar): viola el aislamiento de bounded contexts.
- Base de datos dedicada para identidad: innecesaria para MVP.

---

## 6. Nuevo Bounded Context: `identity`

**Decision:** Se crea el bounded context `identity` bajo `com.hexagonal.identity`, siguiendo exactamente la misma estructura hexagonal de los BCs existentes.

**Rationale:** La gestión de perfiles de usuario es una responsabilidad del dominio claramente separada de `meditationbuilder`, `meditation.generation` y `playback`. Introducirla como BC propio garantiza que la autenticación no "contamina" los BCs de negocio y puede evolucionar independientemente.

**Path del nuevo BC:**
```
backend/src/main/java/com/hexagonal/identity/
backend/src/main/resources/openapi/identity/
backend/src/test/resources/features/identity/
```

---

## 7. Migración del userId hardcodeado en los BCs existentes

**Decision:** Se añade un filtro/interceptor de seguridad en la capa `shared/security` que extrae el `userId` del JWT propio y lo pone a disposición de los controllers mediante el contexto de seguridad de Spring. Los controllers existentes pasan de leer `X-User-Id` de la cabecera a leer el `userId` del `Authentication` principal.

**Rationale:** Cambio mínimo en los BCs existentes (solo en los controllers, sin tocar dominio ni aplicación), centralizado en `shared/security`. Los tests BDD existentes siguen funcionando con un `TestSecurityConfig` que simula el principal autenticado.

**Alternatives considered:**
- Mantener el header `X-User-Id` y añadir validación JWT sólo en los nuevos endpoints: introduce dos mecanismos de identidad incompatibles. Descartado.

---

## 8. Protección de rutas en el frontend

**Decision:** Se añade un `AuthGuard` (componente React de protección de ruta) que verifica la presencia del token de sesión en memoria antes de renderizar rutas protegidas. Si no hay sesión, redirige a `/login`.

**Rationale:** Compatible con React Router 6 (ya en uso). El token se almacena en memoria (estado Zustand) y no en `localStorage`, lo que evita vulnerabilidades XSS para el MVP. Se puede añadir un `httpOnly cookie` en iteraciones posteriores.

**Alternatives considered:**
- `localStorage` para el token: más persistente entre recargas pero vulnerable a XSS. Descartado para MVP.
- `sessionStorage`: se pierde al cerrar la pestaña, degradando la experiencia.

---

## 9. Google Cloud Console — Client ID requerido

**Decision:** Se requiere un `GOOGLE_CLIENT_ID` (Client ID de la consola de Google Cloud) configurado como variable de entorno en backend y frontend. No se incluye en el repositorio.

**Rationale:** Necesario para que Google valide la audiencia del `id_token`. Se configura mediante `VITE_GOOGLE_CLIENT_ID` en frontend y `spring.security.oauth2.client.registration.google.client-id` (o equivalente custom) en backend.

---

## Resolución de NEEDS CLARIFICATION

| Item | Estado | Decisión |
|------|--------|----------|
| Flujo OAuth (redirect vs token) | ✅ Resuelto | Token flow: id_token Google → backend → JWT propio |
| Librería frontend para botón Google | ✅ Resuelto | `@react-oauth/google` |
| Validación id_token en backend | ✅ Resuelto | Spring Security OAuth2 Resource Server + JWKS |
| Almacenamiento de sesión frontend | ✅ Resuelto | JWT en Zustand (memoria) |
| Almacenamiento perfil usuario | ✅ Resuelto | PostgreSQL, esquema `identity`, tabla `users` |
| Nuevo Bounded Context | ✅ Resuelto | `identity` bajo `com.hexagonal.identity` |
| Migración userId hardcodeado | ✅ Resuelto | Filtro en `shared/security`, cambio en controllers |
| Google Client ID | ✅ Resuelto | Variable de entorno, no en repo |

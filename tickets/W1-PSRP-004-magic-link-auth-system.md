## PSRP-004: feat(auth): magic-link-auth-system

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W1
**Dependencies:** PSRP-002, PSRP-003

## Resumen de Funcionalidad
Implementar el sistema completo de autenticación sin contraseña usando magic links y tokens JWT. Esto incluye generación de magic link token (almacenamiento hasheado SHA-256), entrega de email vía Gmail SMTP (IEmailService sincrónico para emails de auth), verificación de token, generación de sesión JWT, setup de perfil en primer login, y gestión de sesiones. Esta es la foundation de autenticación para hosts y accomplices.

## Requisitos
- [ ] Implementar interfaz `IEmailService` en Aura.Core/Interfaces/Services/ con método `SendMagicLinkAsync(string email, string magicLinkUrl)`
- [ ] Implementar `SmtpEmailService` en Aura.Infrastructure/Services/ usando Gmail SMTP (smtp.gmail.com:587, TLS)
- [ ] Implementar interfaz `IMagicLinkService` y `MagicLinkService` en Aura.Core/Services/ para generación de token, hashing (SHA-256), almacenamiento, y verificación
- [ ] Implementar interfaz `IAuthService` y `AuthService` en Aura.Core/Services/ orquestando magic link request, verificación, generación JWT
- [ ] Implementar `AuthController` con endpoints: `POST /api/auth/magic-link` (request magic link), `GET /api/auth/verify` (verify token, set cookies), `POST /api/auth/profile` (first-login profile setup), `POST /api/auth/refresh` (silent JWT refresh), `POST /api/auth/logout` (blacklist JWT, clear cookies), `GET /api/auth/me` (current user info)
- [ ] Configurar autenticación JWT: expiry 24 horas, claims incluyen sub (UserId), email, role ("host"), Issuer, Audience
- [ ] Set JWT en cookie `aura_session` (httpOnly, Secure, SameSite=Strict, Path=/) en verify exitoso
- [ ] Generar CSRF token con `RandomNumberGenerator.GetBytes(32)` y setear en cookie `aura_csrf` (no httpOnly, Secure, SameSite=Strict, Path=/) en verify exitoso
- [ ] Implementar rate limiting para requests de magic link: 3 por email por hora (vía Dragonfly)
- [ ] Implementar anti-enumeración: misma respuesta para usuarios nuevos y existentes (sin campo `isNewUser` en response)
- [ ] Implementar invalidación de token: solicitar nuevo magic link limpia todos los tokens anteriores para ese usuario
- [ ] Implementar uso de un solo uso: token hash limpiado después de verificación exitosa
- [ ] Implementar comparación timing-safe usando `CryptographicOperations.FixedTimeEquals`
- [ ] Implementar creación de UserConsent en profile setup (aceptación de términos + data_processing)
- [ ] Implementar token blacklist en Dragonfly: on logout, hash JWT y almacenar con TTL = remaining expiry (`auth:blacklist:{hash}`)
- [ ] Escribir unit tests para AuthService, MagicLinkService, y generación de tokens

## Notas Técnicas
- **Backend:**
  - `POST /api/auth/magic-link` — acepta email, crea/actualiza User, genera token, almacena hash, envía email. Devuelve `{ message: "Magic link sent. Check your email." }` sin indicar si es usuario nuevo (anti-enumeración)
  - `GET /api/auth/verify?token={token}` — hashea token entrante, compara con hash almacenado, verifica expiry, limpia hash, genera JWT, actualiza LastLoginAt, establece status a 'active' si first login. Setea cookies `aura_session` (JWT) y `aura_csrf` (CSRF token). Devuelve `{ user: { id, email, name, isFirstLogin } }` — JWT está en cookie, NO en body
  - `POST /api/auth/profile` — requiere auth JWT, guarda Name, timezone, locale, crea registros UserConsent. Devuelve 200
  - `POST /api/auth/refresh` — requiere JWT válido, genera nuevo JWT con mismo claims pero fresh 24h expiry, genera nuevo CSRF token, setea ambas cookies. Devuelve `{ refreshed: true }`
  - `POST /api/auth/logout` — requiere JWT válido, hashea JWT, almacena en Dragonfly blacklist con TTL = remaining expiry, borra cookies `aura_session` y `aura_csrf`. Devuelve `{ loggedOut: true }`
  - `GET /api/auth/me` — requiere JWT válido, devuelve user info desde claims: `{ id, email, name, role, status, isFirstLogin }`
- **Cookie Settings:** `aura_session` (httpOnly=true, Secure=!IsDevelopment, SameSite=Strict, Path=/, expires=JWT expiry), `aura_csrf` (httpOnly=false, mismos otros settings)
- **Blacklist Key Format:** `auth:blacklist:{sha256_hash_of_jwt}`, TTL = `jwt.ValidTo - DateTime.UtcNow`
- **Frontend:** N/A (UI en PSRP-005)
- **Database:** Tabla Users (HashedMagicLinkToken, TokenExpiresAt), tabla UserConsents
- **Integrations:** Gmail SMTP (smtp.gmail.com:587, App Password from K8s Secret), Dragonfly (rate limiting + blacklist)
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IEmailService.cs`
  - `backend/src/Aura.Core/Interfaces/Services/IMagicLinkService.cs`
  - `backend/src/Aura.Core/Interfaces/Services/IAuthService.cs`
  - `backend/src/Aura.Core/Services/AuthService.cs`
  - `backend/src/Aura.Core/Services/MagicLinkService.cs`
  - `backend/src/Aura.Infrastructure/Services/SmtpEmailService.cs`
  - `backend/src/Aura.Api/Controllers/AuthController.cs`
  - `backend/src/Aura.Core/DTOs/Auth/MagicLinkRequest.cs`
  - `backend/src/Aura.Core/DTOs/Auth/VerifyResponse.cs`
  - `backend/src/Aura.Core/DTOs/Auth/ProfileSetupRequest.cs`

## Criterios de Aceptación
- [ ] AC1: Dado un nuevo usuario introduce su email, cuando se llama `POST /api/auth/magic-link`, entonces se crea un registro User con status='pending', se envía un email de magic link, y la respuesta es idéntica a la de un usuario existente (anti-enumeración, sin campo isNewUser)
- [ ] AC2: Dado un magic link token válido (no expirado, no usado), cuando se llama `GET /api/auth/verify?token={token}`, entonces el token hash se limpia, User status se actualiza a 'active', se setea cookie `aura_session` con JWT (24h expiry) y cookie `aura_csrf` con CSRF token, y se devuelve `{ user: { id, email, name, isFirstLogin: true } }`
- [ ] AC3: Dado un magic link token expirado (>15 min), cuando se llama `GET /api/auth/verify`, entonces se devuelve 401 con "Link expired"
- [ ] AC4: Dado un usuario solicita un 4to magic link dentro de 1 hora, cuando se llama `POST /api/auth/magic-link`, entonces se devuelve 429 con header Retry-After
- [ ] AC5: Dado un usuario de primer login envía su perfil, cuando se llama `POST /api/auth/profile` con name y aceptación de términos, entonces se crean registros UserConsent y el usuario puede acceder a endpoints protegidos
- [ ] AC6: Dado un JWT es emitido y set en cookie `aura_session`, cuando se incluye en requests API subsecuentes, entonces el usuario está autenticado y autorizado
- [ ] AC7: Dado un usuario autenticado llama `POST /api/auth/refresh`, entonces se genera nuevo JWT con fresh 24h expiry y nuevo CSRF token, ambos seteados en cookies
- [ ] AC8: Dado un usuario autenticado llama `POST /api/auth/logout`, entonces el JWT se blacklista en Dragonfly con TTL=remaining expiry, cookies se borran, y requests subsecuentes con el old JWT retornan 401

## Elementos Relacionados
- **PRD section:** 05-registration-onboarding.md (registro flow, profile setup), 06-mvp-features.md (US-R-01 through US-R-05)
- **Architecture:** 05-security.md (magic link tokens, JWT claims, session management, rate limiting)
- **Data model:** entities.md (Users, UserConsents), README.md (token security, token lifecycle)

## Bloqueadores
Bloqueado por: PSRP-002, PSRP-003

## Branch Name
`feature/PSRP-004-magic-link-auth-system`
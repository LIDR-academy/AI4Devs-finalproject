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
- [ ] Implementar `AuthController` con endpoints: `POST /api/auth/magic-link` (request magic link), `GET /api/auth/verify` (verify token, return JWT), `POST /api/auth/profile` (first-login profile setup)
- [ ] Configurar autenticación JWT: expiry 24 horas, claims incluyen sub (UserId), email, role ("host"), Issuer, Audience
- [ ] Configurar cookie httpOnly, Secure, SameSite=Strict para almacenamiento JWT
- [ ] Implementar rate limiting para requests de magic link: 3 por email por hora (vía Dragonfly)
- [ ] Implementar anti-enumeración: misma respuesta para usuarios nuevos y existentes
- [ ] Implementar invalidación de token: solicitar nuevo magic link limpia todos los tokens anteriores para ese usuario
- [ ] Implementar uso de un solo uso: token hash limpiado después de verificación exitosa
- [ ] Implementar comparación timing-safe usando `CryptographicOperations.FixedTimeEquals`
- [ ] Implementar creación de UserConsent en profile setup (aceptación de términos + data_processing)
- [ ] Escribir unit tests para AuthService, MagicLinkService, y generación de tokens

## Notas Técnicas
- **Backend:**
  - `POST /api/auth/magic-link` — acepta email, crea/actualiza User, genera token, almacena hash, envía email. Devuelve misma respuesta independientemente de la existencia del usuario
  - `GET /api/auth/verify?token={token}` — hashea token entrante, compara con hash almacenado, verifica expiry, limpia hash, genera JWT, actualiza LastLoginAt, establece status a 'active' si first login. Devuelve `{ jwt, isFirstLogin }`
  - `POST /api/auth/profile` — requiere auth JWT, guarda Name, crea registros UserConsent, establece Timezone/Locale. Devuelve 200
- **Frontend:** N/A (UI en PSRP-005)
- **Database:** Tabla Users (HashedMagicLinkToken, TokenExpiresAt), tabla UserConsents
- **Integrations:** Gmail SMTP (smtp.gmail.com:587, App Password from K8s Secret)
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
- [ ] AC1: Dado un nuevo usuario introduce su email, cuando se llama `POST /api/auth/magic-link`, entonces se crea un registro User con status='pending', se envía un email de magic link, y la respuesta es idéntica a la de un usuario existente (anti-enumeración)
- [ ] AC2: Dado un magic link token válido (no expirado, no usado), cuando se llama `GET /api/auth/verify?token={token}`, entonces el token hash se limpia, User status se actualiza a 'active', se devuelve un JWT con expiry 24h, y se incluye `isFirstLogin: true`
- [ ] AC3: Dado un magic link token expirado (>15 min), cuando se llama `GET /api/auth/verify`, entonces se devuelve 401 con "Link expired"
- [ ] AC4: Dado un usuario solicita un 4to magic link dentro de 1 hora, cuando se llama `POST /api/auth/magic-link`, entonces se devuelve 429 con header Retry-After
- [ ] AC5: Dado un usuario de primer login envía su perfil, cuando se llama `POST /api/auth/profile` con name y aceptación de términos, entonces se crean registros UserConsent y el usuario puede acceder a endpoints protegidos
- [ ] AC6: Dado un JWT es emitido, cuando se incluye en requests API subsecuentes como httpOnly cookie, entonces el usuario está autenticado y autorizado

## Elementos Relacionados
- **PRD section:** 05-registration-onboarding.md (registro flow, profile setup), 06-mvp-features.md (US-R-01 through US-R-05)
- **Architecture:** 05-security.md (magic link tokens, JWT claims, session management, rate limiting)
- **Data model:** entities.md (Users, UserConsents), README.md (token security, token lifecycle)

## Bloqueadores
Bloqueado por: PSRP-002, PSRP-003

## Branch Name
`feature/PSRP-004-magic-link-auth-system`
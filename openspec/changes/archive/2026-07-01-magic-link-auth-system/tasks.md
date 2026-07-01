## 1. Domain & Core Setup

- [x] 1.1 Add auth fields to `User` entity (`HashedMagicLinkToken`, `TokenExpiresAt`, `LastLoginAt`, `Status`)
- [x] 1.2 Define `IEmailService` interface in Aura.Core
- [x] 1.3 Define `IMagicLinkService` interface in Aura.Core
- [x] 1.4 Define `IAuthService` interface in Aura.Core
- [x] 1.5 Add Auth DTOs (`MagicLinkRequest`, `VerifyResponse`, `ProfileSetupRequest`)

## 2. Infrastructure & Services

- [x] 2.1 Implement `SmtpEmailService` in Aura.Infrastructure using Gmail SMTP
- [x] 2.2 Implement `MagicLinkService` with SHA-256 hashing and timing-safe comparison
- [x] 2.3 Implement `AuthService` orchestrating magic links, verification, and JWT issuance
- [x] 2.4 Setup Dragonfly (Redis) integration for token blacklisting and rate limiting

## 3. API Controllers & Middleware

- [x] 3.1 Configure JWT Authentication in `Program.cs` (24h expiry, claims setup)
- [x] 3.2 Implement `AuthController` with `/api/auth/magic-link` endpoint (anti-enumeration & rate limiting)
- [x] 3.3 Implement `/api/auth/verify` endpoint (issue HttpOnly `aura_session` & `aura_csrf` cookies)
- [x] 3.4 Implement `/api/auth/profile` endpoint (create `UserConsent`)
- [x] 3.5 Implement `/api/auth/refresh` endpoint (refresh JWT and CSRF cookies)
- [x] 3.6 Implement `/api/auth/logout` endpoint (blacklist JWT via Dragonfly)
- [x] 3.7 Implement `/api/auth/me` endpoint to return current user info

## 4. Testing

- [x] 4.1 Write unit tests for `MagicLinkService` (hashing, generation, verification)
- [x] 4.2 Write unit tests for `AuthService` (orchestration logic)
- [x] 4.3 Write unit tests for `AuthController` (cookie handling and responses)

## PSRP-004: feat(auth): magic-link-auth-system

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W1
**Dependencies:** PSRP-002, PSRP-003

## Feature Summary
Implement the complete passwordless authentication system using magic links and JWT tokens. This includes magic link token generation (SHA-256 hashed storage), email delivery via Gmail SMTP (synchronous IEmailService for auth emails), token verification, JWT session generation, profile setup on first login, and session management. This is the authentication foundation for both hosts and accomplices.

## Requirements
- [ ] Implement `IEmailService` interface in Aura.Core/Interfaces/Services/ with method `SendMagicLinkAsync(string email, string magicLinkUrl)`
- [ ] Implement `SmtpEmailService` in Aura.Infrastructure/Services/ using Gmail SMTP (smtp.gmail.com:587, TLS)
- [ ] Implement `IMagicLinkService` interface and `MagicLinkService` in Aura.Core/Services/ for token generation, hashing (SHA-256), storage, and verification
- [ ] Implement `IAuthService` interface and `AuthService` in Aura.Core/Services/ orchestrating magic link request, verification, JWT generation
- [ ] Implement `AuthController` with endpoints: `POST /api/auth/magic-link` (request magic link), `GET /api/auth/verify` (verify token, return JWT), `POST /api/auth/profile` (first-login profile setup)
- [ ] Configure JWT authentication: 24-hour expiry, claims include sub (UserId), email, role ("host"), Issuer, Audience
- [ ] Configure httpOnly, Secure, SameSite=Strict cookie for JWT storage
- [ ] Implement rate limiting for magic link requests: 3 per email per hour (via Dragonfly)
- [ ] Implement anti-enumeration: same response for new and existing users
- [ ] Implement token invalidation: requesting new magic link clears all previous tokens for that user
- [ ] Implement one-time use: token hash cleared after successful verification
- [ ] Implement timing-safe comparison using `CryptographicOperations.FixedTimeEquals`
- [ ] Implement UserConsent creation on profile setup (terms + data_processing acceptance)
- [ ] Write unit tests for AuthService, MagicLinkService, and token generation

## Technical Notes
- **Backend:** 
  - `POST /api/auth/magic-link` — accepts email, creates/updates User, generates token, stores hash, sends email. Returns same response regardless of user existence
  - `GET /api/auth/verify?token={token}` — hashes incoming token, compares to stored hash, checks expiry, clears hash, generates JWT, updates LastLoginAt, sets status to 'active' if first login. Returns `{ jwt, isFirstLogin }`
  - `POST /api/auth/profile` — requires JWT auth, saves Name, creates UserConsent records, sets Timezone/Locale. Returns 200
- **Frontend:** N/A (UI in PSRP-005)
- **Database:** Users table (HashedMagicLinkToken, TokenExpiresAt), UserConsents table
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

## Acceptance Criteria
- [ ] AC1: Given a new user enters their email, when `POST /api/auth/magic-link` is called, then a User record is created with status='pending', a magic link email is sent, and the response is identical to an existing user request (anti-enumeration)
- [ ] AC2: Given a valid magic link token (not expired, not used), when `GET /api/auth/verify?token={token}` is called, then the token hash is cleared, User status is updated to 'active', a JWT is returned with 24h expiry, and `isFirstLogin: true` is included
- [ ] AC3: Given an expired magic link token (>15 min), when `GET /api/auth/verify` is called, then 401 is returned with "Link expired"
- [ ] AC4: Given a user requests a 4th magic link within 1 hour, when `POST /api/auth/magic-link` is called, then 429 is returned with Retry-After header
- [ ] AC5: Given a first-login user submits their profile, when `POST /api/auth/profile` is called with name and terms acceptance, then UserConsent records are created and the user can access protected endpoints
- [ ] AC6: Given a JWT is issued, when it is included in subsequent API requests as an httpOnly cookie, then the user is authenticated and authorized

## Related Items
- **PRD section:** 05-registration-onboarding.md (registration flow, profile setup), 06-mvp-features.md (US-R-01 through US-R-05)
- **Architecture:** 05-security.md (magic link tokens, JWT claims, session management, rate limiting)
- **Data model:** entities.md (Users, UserConsents), README.md (token security, token lifecycle)

## Blockers
Blocked by: PSRP-002, PSRP-003

## Branch Name
`feature/PSRP-004-magic-link-auth-system`

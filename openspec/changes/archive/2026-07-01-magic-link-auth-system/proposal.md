## Why

We need to implement a complete passwordless authentication system using magic links and JWT tokens. This forms the foundational authentication layer for hosts and accomplices, providing a seamless and secure login experience without the need for users to manage passwords.

## What Changes

- Implement `IEmailService` and `SmtpEmailService` (using Gmail SMTP) to securely send magic links.
- Implement `IMagicLinkService` and `MagicLinkService` for generation, hashing (SHA-256), storage, and verification of single-use magic link tokens.
- Implement `IAuthService` and `AuthService` to orchestrate magic link requests, verification, and JWT generation.
- Implement `AuthController` with endpoints for requesting magic links, verifying tokens, first-login profile setup, silent JWT refresh, logout, and getting user info.
- Set up JWT authentication (24h expiry) storing JWT and CSRF tokens in cookies (`aura_session` and `aura_csrf`).
- Implement rate limiting for magic links (3 per email per hour via Dragonfly) and anti-enumeration measures.
- Implement token invalidation and a Dragonfly-backed token blacklist for logout functionality.
- Implement `UserConsent` creation during profile setup (acceptance of terms and data processing).

## Capabilities

### New Capabilities
- `api-auth-magic-link`: Passwordless authentication flow using email magic links.
- `api-auth-session`: Session management with JWT and HttpOnly cookies, including refresh and logout (blacklist).

### Modified Capabilities
- `domain-entities`: Update with `Users` (HashedMagicLinkToken, TokenExpiresAt) and `UserConsents` entities to support the auth flow.

## Impact

- **Backend APIs:** New endpoints under `/api/auth/` will be added.
- **Dependencies:** Requires integration with Gmail SMTP for email delivery and Dragonfly for rate limiting and token blacklisting.
- **Database:** New tables/schema updates for `Users` and `UserConsents`.
- **Security:** Introduces JWT validation, cookie-based session management, and CSRF protection updates for authenticated endpoints.

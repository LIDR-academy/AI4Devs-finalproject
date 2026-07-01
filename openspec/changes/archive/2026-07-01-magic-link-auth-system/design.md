## Context

The platform requires a secure, user-friendly authentication system for hosts and accomplices. To reduce friction and eliminate password management, we are adopting a passwordless approach using magic links sent via email. 
Currently, the system lacks authentication, and this feature will establish the foundational security layer for all protected endpoints.

## Goals / Non-Goals

**Goals:**
- Implement a secure magic link generation and verification flow.
- Issue JWTs for session management upon successful verification.
- Enforce strict cookie-based storage for JWTs (HttpOnly) and CSRF protection.
- Ensure anti-enumeration to prevent leaking registered emails.
- Protect against brute-force/spam by rate limiting magic link requests.
- Provide a token blacklist mechanism for reliable logout.

**Non-Goals:**
- OAuth/Social Login (e.g., Google, GitHub).
- Role-based access control (RBAC) complexity beyond a basic role assignment ("host").
- UI implementation (will be handled in a separate change).

## Decisions

- **Authentication Method:** Magic Links via Email.
  - *Rationale:* Eliminates the need for password management, reducing security risks (stolen passwords) and improving UX.
- **Session Management:** JWT stored in HttpOnly cookies.
  - *Rationale:* More secure than localStorage against XSS. Requires CSRF protection, which is mitigated using a synchronized `aura_csrf` cookie.
- **Token Invalidation (Logout):** Dragonfly-backed JWT blacklist.
  - *Rationale:* Since JWTs are stateless, logging out requires blacklisting the token until it expires. Using Dragonfly (Redis-compatible) allows fast, TTL-based storage of blacklisted JWT hashes.
- **Timing-Safe Verification:** Use `CryptographicOperations.FixedTimeEquals` for hash comparison.
  - *Rationale:* Prevents timing attacks when verifying the magic link token against the stored hash.

## Risks / Trade-offs

- **[Risk] Email Deliverability:** Magic links might end up in spam or be delayed.
  - *Mitigation:* Use a reliable SMTP service (Gmail initially, can migrate to SendGrid/AWS SES later) and provide clear UI instructions.
- **[Risk] CSRF Vulnerabilities:** Since we use cookies, we are susceptible to CSRF.
  - *Mitigation:* Implementing a strict CSRF token pattern (Double Submit Cookie or similar) with `aura_csrf`.
- **[Risk] Token Hijacking:** If an email is intercepted, the magic link can be used.
  - *Mitigation:* Tokens are single-use, hashed in the database, and expire quickly (e.g., 15 minutes).

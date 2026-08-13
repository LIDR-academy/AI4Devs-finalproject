# Security User Stories

This folder contains the security-focused user stories derived from the findings documented in `reporteDeSeguridad.md`.

## Story List

- `US-010-secure-production-bootstrap.md`
  - Covers findings 1 and part of 4
  - Goal: prevent production startup from reseeding demo users or resetting real credentials

- `US-011-secrets-and-database-hardening.md`
  - Covers findings 2 and 3
  - Goal: remove predictable production secrets and reduce direct database exposure

- `US-012-session-revocation-and-token-rotation.md`
  - Covers findings 5 and 6
  - Goal: enforce immediate access revocation and rotate refresh tokens safely

- `US-013-safe-destructive-operations.md`
  - Covers finding 4
  - Goal: protect destructive maintenance scripts from unsafe execution

- `US-014-http-and-runtime-hardening.md`
  - Covers findings 7, 8, and 9
  - Goal: improve login response hardening, HTTP security headers, and container runtime safety

## Suggested Delivery Order

1. `US-010-secure-production-bootstrap.md`
2. `US-011-secrets-and-database-hardening.md`
3. `US-012-session-revocation-and-token-rotation.md`
4. `US-013-safe-destructive-operations.md`
5. `US-014-http-and-runtime-hardening.md`

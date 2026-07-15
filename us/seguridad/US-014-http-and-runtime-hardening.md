# US-014 — HTTP and Runtime Hardening

## [original] User Story

**As** the system owner,  
**I want** the API runtime and authentication edge behavior to follow stronger hardening defaults,  
**so that** low-effort attacks and avoidable privilege exposure are reduced.

## [enhanced] User Story

**As** the system owner,  
**I want** authentication failure behavior, HTTP response headers, and container runtime permissions to follow hardened defaults,  
**so that** the system reduces information leakage, gains browser-facing defense in depth, and avoids unnecessary container privileges.

**MVP scope:** unify external login failure behavior, add HTTP hardening headers through Nest bootstrap, and run the API container as a non-root runtime user.  
**Out of scope:** MFA, WAF integration, and a highly customized CSP tuned for every future frontend asset.  
**Source findings:** `reporteDeSeguridad.md` findings 7, 8, and 9.

---

## [original] Acceptance Criteria

- [ ] Login failures do not reveal account state.
- [ ] HTTP hardening headers are enabled.
- [ ] The API runtime image does not run as root.
- [ ] The new controls are validated by tests or smoke checks.

## [enhanced] Acceptance Criteria

### Authentication edge behavior

- [ ] `POST /api/auth/login` uses a uniform external failure response for invalid credentials and inactive accounts.
- [ ] The external response for authentication failure remains generic, for example HTTP `401` with a message equivalent to `Invalid email or password`.
- [ ] Internal logs may record whether the failure came from an inactive account or a password mismatch, but they must not log passwords, tokens, or refresh-cookie values.
- [ ] Authorization failures on already protected routes remain distinct from login failures, so `403` is still used where appropriate outside the login endpoint.

### HTTP hardening

- [ ] The NestJS application registers `helmet` or an equivalent explicit hardening configuration during bootstrap.
- [ ] Browser-facing responses include reviewed security headers that cover at least:
  - frame embedding protection
  - MIME sniffing protection
  - basic referrer policy
- [ ] HSTS is enabled only when the production deployment is served over HTTPS or through a trusted TLS-terminating layer.
- [ ] The new header policy does not break the existing Next.js frontend or API proxy behavior.

### Container runtime hardening

- [ ] The API runtime image uses a dedicated non-root user.
- [ ] The container still starts successfully, runs migrations/entrypoint logic, and serves the application under that non-root user.
- [ ] Runtime file ownership and permissions are adjusted so the app does not require root.

### Verification

- [ ] Automated or smoke-level checks validate that expected security headers are present.
- [ ] Automated auth tests validate that wrong email, wrong password, and inactive account produce the same externally observable login failure response.
- [ ] A container smoke check validates successful startup under the non-root runtime user.

---

## [original] Roles Involved

- System owner
- Backend developer

## [enhanced] Roles Involved

| Role | Responsibility in this US |
|------|----------------------------|
| System owner | Approves the hardening baseline |
| Backend developer | Implements auth-response and HTTP hardening |
| Deployment maintainer | Validates runtime container behavior after permission changes |

---

## [original] Technical Notes

- The current login flow exposes some account-state distinctions.
- The backend does not yet define an explicit HTTP hardening baseline.
- The API runtime image should avoid root privileges.

## [enhanced] Technical Specification

### Login behavior

Endpoint affected:

#### `POST /api/auth/login`

Current goal:

- Wrong email
- Wrong password
- Inactive account

All three cases must produce the same external authentication failure response pattern.

Recommended external response:

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

Internal logging may still differentiate failure causes for support and auditing.

### HTTP headers

Add explicit HTTP hardening through Nest bootstrap. At minimum, validate headers equivalent to:

- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Strict-Transport-Security` when HTTPS conditions are met

If CSP is not safely deployable yet, keep it out of the MVP scope rather than introducing a breaking or misleading policy.

### Runtime container

The API Docker runtime image should:

1. create a dedicated non-root user
2. copy runtime files with correct ownership
3. execute the entrypoint and Node process without root

### Files to modify

```text
apps/api/package.json
apps/api/src/main.ts
apps/api/src/modules/auth/auth.service.ts
apps/api/src/common/filters/http-exception.filter.ts
apps/api/test/auth.e2e-spec.ts
C:\Despliegues\AI4Devs-finalproject\apps\api\Dockerfile
```

### Suggested implementation flow

1. Unify external login error behavior in the auth flow.
2. Add `helmet` to the API and review the default or customized header policy.
3. Ensure production-only HSTS behavior does not break local HTTP development.
4. Update the API Dockerfile runtime stage to use a non-root user.
5. Run smoke checks for auth, headers, and container startup.

### Tests required

| Layer | Minimum scenarios |
|------|--------------------|
| Integration | invalid email, invalid password, inactive account -> same external login failure |
| Integration | security headers present on API responses |
| Smoke | API container starts and serves requests as non-root |

### Non-functional requirements

| Area | Requirement |
|------|-------------|
| Security | Reduce information leakage; add browser-facing defense in depth |
| Compatibility | Header hardening must not break frontend proxy behavior |
| Operability | Container must remain startable in current Docker deployment |
| Maintainability | Runtime hardening should be easy to preserve across future image updates |

### Definition of Done

- [ ] External login failures are uniform and do not leak account state.
- [ ] HTTP hardening headers are enabled and verified.
- [ ] API runtime container no longer runs as root.
- [ ] Tests or smoke checks for these controls pass.

### Dependencies

| Relation | Detail |
|----------|--------|
| Depends on | Existing auth flow and Dockerized API runtime |
| Related to | `US-011` for production deployment hardening |
| Blocks | Completion of the minimum hardening baseline |

---

## [original] Priority

Medium.

## [enhanced] Priority

**Medium (P2)** — these changes strengthen defense in depth and reduce information leakage, but they are less urgent than fixing bootstrap and secret-management risks.

**Estimated effort:** 1–2 days including dependency update, auth adjustments, and smoke checks.

---

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-014 |
| **Module** | `security` / `api` / `runtime` |
| **Refinement status** | Enhanced locally |

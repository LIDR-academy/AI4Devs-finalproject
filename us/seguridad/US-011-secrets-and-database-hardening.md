# US-011 — Secrets and Database Hardening

## [original] User Story

**As** the system owner,  
**I want** production secrets and database exposure to be explicitly hardened,  
**so that** the system cannot rely on predictable defaults or unnecessary network exposure.

## [enhanced] User Story

**As** the system owner or deployment maintainer,  
**I want** production configuration to require strong runtime secrets and minimize direct database exposure,  
**so that** the application cannot be deployed with forgeable JWT secrets, trivial database credentials, or overly broad network access.

**MVP scope:** remove insecure production defaults, validate required secrets at startup, and restrict PostgreSQL exposure to the minimum operationally necessary surface.  
**Out of scope:** external vault integration, database TLS between local Docker containers, and multi-host zero-trust networking.  
**Source findings:** `reporteDeSeguridad.md` findings 2 and 3.

---

## [original] Acceptance Criteria

- [ ] Production configuration does not rely on committed fallback secrets.
- [ ] The API fails fast when mandatory secrets are missing.
- [ ] Production database access is not broadly exposed by default.
- [ ] Example environment files remain placeholders only.

## [enhanced] Acceptance Criteria

### Secrets management

- [ ] Production deployment files do not contain committed fallback values for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, or production database credentials.
- [ ] The backend refuses to start in `NODE_ENV=production` if required configuration values are absent.
- [ ] Secret validation includes minimum strength requirements such as non-placeholder values and minimum length.
- [ ] Example environment files may document required variables, but they must not contain values that could be mistaken for real acceptable production secrets.

### Database credential hardening

- [ ] Production database credentials are injected from environment variables, not hardcoded in the committed production compose file.
- [ ] The values `mecatrack` / `mecatrack` or equivalent trivial credentials are not used as the production default.
- [ ] Rotating production database credentials requires environment changes only and no code change.

### Network exposure

- [ ] PostgreSQL is not exposed on all host interfaces by default in production.
- [ ] If host-based administration is required, the database port is published only to `127.0.0.1` unless a documented exception explicitly states otherwise.
- [ ] The API container continues to reach PostgreSQL through the Docker network regardless of host port publication.

### Operational safety

- [ ] Production deployment fails fast when any required secret or database credential variable is missing.
- [ ] Error messages about missing configuration identify the missing variable name without printing secret values.
- [ ] Documentation explains which values are mandatory in production and which remain development-only.

### Verification

- [ ] Automated configuration tests cover missing-secret failures and successful startup with valid injected secrets.
- [ ] A deployment smoke check proves the API starts only when required production secrets are supplied.
- [ ] A configuration check proves that PostgreSQL is not broadly exposed by default.

---

## [original] Roles Involved

- System owner
- Deployment maintainer

## [enhanced] Roles Involved

| Role | Responsibility in this US |
|------|----------------------------|
| System owner | Approves production hardening rules |
| Deployment maintainer | Injects secrets and configures compose safely |
| Backend developer | Adds startup validation for required configuration |

---

## [original] Technical Notes

- Current production compose relies on insecure defaults for some sensitive values.
- Database exposure should be reduced without breaking container-to-container communication.

## [enhanced] Technical Specification

### Required runtime variables

| Variable | Required in production | Purpose |
|----------|------------------------|---------|
| `JWT_ACCESS_SECRET` | Yes | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | Yes | Reserved for refresh-related crypto or future separation |
| `DATABASE_URL` or equivalent DB variables | Yes | Production DB connection |
| `POSTGRES_USER` | Yes if compose-managed | DB username |
| `POSTGRES_PASSWORD` | Yes if compose-managed | DB password |
| `POSTGRES_DB` | Yes if compose-managed | DB name |

### Validation rules

- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` must be required in production.
- Placeholder-like values such as `change-me`, `mecatrack-docker-access-secret-min-32-chars`, or similarly predictable committed examples must be rejected in production validation.
- Database passwords must be environment-injected and must not be sourced from committed fixed defaults in the production deployment file.

### Infrastructure behavior

Preferred production models:

1. Internal Docker network only, with no PostgreSQL host port published.
2. If local host administration is necessary, publish PostgreSQL only to `127.0.0.1:5434:5432`.

The API and web containers continue to communicate with the database using service discovery inside Docker, not through the host-mapped port.

### Files to modify

```text
C:\Despliegues\AI4Devs-finalproject\docker-compose.yml
apps/api/src/app.module.ts
apps/api/src/main.ts
apps/api/.env.example
.env.example
apps/api/README.md
```

### Suggested implementation flow

1. Remove insecure fallback values from the production compose file.
2. Move production-sensitive values to required environment variables.
3. Add backend configuration validation for production mode.
4. Restrict PostgreSQL host exposure to internal-only or localhost-only binding.
5. Update examples and deployment documentation.
6. Add startup validation tests and deployment smoke checks.

### Tests required

| Layer | Minimum scenarios |
|------|--------------------|
| Config / unit | startup fails when required secrets are missing |
| Config / unit | startup fails when placeholder secrets are used in production |
| Config / unit | startup succeeds with valid injected secrets |
| Smoke | production compose starts correctly with explicit secrets |
| Infra check | PostgreSQL is not published to all interfaces by default |

### Non-functional requirements

| Area | Requirement |
|------|-------------|
| Security | No predictable production secrets; least-exposed database networking |
| Reliability | Misconfiguration must fail fast at startup |
| Operability | Secrets must be rotatable without code changes |
| Maintainability | Development examples must remain clearly distinct from production requirements |

### Definition of Done

- [ ] Predictable JWT secret fallbacks are removed from production deployment.
- [ ] Production DB credentials are not committed as fixed insecure defaults.
- [ ] Backend configuration validates required production secrets and credentials.
- [ ] PostgreSQL exposure is reduced to internal-only or localhost-only binding.
- [ ] Example environment files remain safe placeholders only.
- [ ] Smoke checks or config tests for production behavior pass.

### Dependencies

| Relation | Detail |
|----------|--------|
| Depends on | Existing Docker Compose deployment and backend config loading |
| Related to | `US-010` for safe bootstrap separation |
| Blocks | Safe secret handling and reduced production attack surface |

---

## [original] Priority

High.

## [enhanced] Priority

**High (P0)** — these gaps can enable JWT forgery or direct database compromise if production is deployed with committed defaults.

**Estimated effort:** 1–2 days including compose updates, config validation, and smoke checks.

---

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-011 |
| **Module** | `security` / `infrastructure` |
| **Refinement status** | Enhanced locally |

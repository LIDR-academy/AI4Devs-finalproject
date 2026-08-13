# US-010 — Secure Production Bootstrap

## [original] User Story

**As** the system owner,  
**I want** the production startup flow to initialize the application without loading demo data or resetting real credentials,  
**so that** a restart or redeploy cannot silently weaken authentication or overwrite operational accounts.

## [enhanced] User Story

**As** the system owner or deployment maintainer,  
**I want** production startup to run only safe initialization steps, separating migrations, one-time admin bootstrap, and development seed flows,  
**so that** container restarts and redeploys never recreate demo users, overwrite real passwords, or mutate production data unexpectedly.

**MVP scope:** remove automatic demo seeding from production startup, preserve `prisma migrate deploy` if needed, and support an optional one-time admin bootstrap only for empty databases.  
**Out of scope:** multi-tenant provisioning, external secret managers, and advanced infrastructure orchestration.  
**Source findings:** `reporteDeSeguridad.md` findings 1 and 4.

---

## [original] Acceptance Criteria

- [ ] Production startup does not run demo seed automatically.
- [ ] Existing users are not modified during a normal restart.
- [ ] Optional bootstrap requires explicit environment-provided credentials.
- [ ] Development seed remains available outside production startup.

## [enhanced] Acceptance Criteria

### Production startup behavior

- [ ] The production API container may run schema migrations, but it must not execute development or demo seed logic by default.
- [ ] Restarting the production stack does not recreate `admin@taller.com`, `mechanic@taller.com`, or any other demo account unless an explicit non-production seed command is invoked.
- [ ] Restarting the production stack does not overwrite `passwordHash`, `refreshTokenHash`, `refreshTokenExpiresAt`, or `role` for existing users.
- [ ] If the deployment uses a bootstrap step, it is separate from the general startup path and runs only when explicitly enabled.

### Optional admin bootstrap

- [ ] A one-time bootstrap path may create the first administrator only when the `User` table is empty.
- [ ] Bootstrap requires explicit runtime variables such as:
  - `BOOTSTRAP_ADMIN_EMAIL`
  - `BOOTSTRAP_ADMIN_PASSWORD`
  - `BOOTSTRAP_ADMIN_NAME`
- [ ] If bootstrap is enabled and any required variable is missing, startup fails with a clear error message.
- [ ] If bootstrap is enabled but the database already contains users, bootstrap exits without modifying existing user credentials.

### Environment separation

- [ ] Development and test sample data are loaded only through an explicit development-oriented command or flag, not through the production entrypoint.
- [ ] The codebase separates the concerns of:
  - migrations
  - first-admin bootstrap
  - demo/test seed
- [ ] Production deployment files and scripts make the separation clear enough that an operator can identify which step mutates data.

### Security guarantees

- [ ] No production startup path contains hardcoded passwords such as `AdminPass123`, `MechanicPass123`, or `InactivePass123`.
- [ ] No production startup path logs raw passwords, raw tokens, or credential-like environment values.
- [ ] Startup logs identify which flow ran (`migrate`, `bootstrap-admin`, or `seed-dev`) without leaking secrets.

### Documentation and verification

- [ ] Deployment documentation explains which startup steps are safe in production and which are development-only.
- [ ] Automated checks prove that production mode skips demo seed behavior.
- [ ] Automated or integration checks prove that an existing production user remains unchanged after restart.

---

## [original] Roles Involved

- System owner
- Deployment maintainer

## [enhanced] Roles Involved

| Role | Responsibility in this US |
|------|----------------------------|
| System owner | Defines acceptable production bootstrap behavior |
| Deployment maintainer | Configures runtime flags and executes safe startup |
| Backend developer | Implements seed/bootstrap separation and tests |

---

## [original] Technical Notes

- Production startup currently mixes migration and seeding concerns.
- Demo credentials must never be restored during a normal production restart.

## [enhanced] Technical Specification

### Target behavior

Split the current startup flow into explicit paths:

- `db:migrate:deploy`
  - Runs `npx prisma migrate deploy`
  - Safe for production startup
- `db:bootstrap:admin`
  - Optional, explicit, only for empty databases
- `db:seed:dev`
  - Development/test data only

### Environment variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NODE_ENV` | all | Distinguish production from development/test |
| `ENABLE_ADMIN_BOOTSTRAP` | prod optional | Enables one-time first-admin creation |
| `BOOTSTRAP_ADMIN_EMAIL` | prod optional | First admin email |
| `BOOTSTRAP_ADMIN_PASSWORD` | prod optional | First admin password |
| `BOOTSTRAP_ADMIN_NAME` | prod optional | First admin full name |
| `ENABLE_DB_SEED` | dev/test only | Enables sample data loading when explicitly desired |

### Data constraints

- Existing `User.passwordHash` must never be overwritten by default startup logic.
- Existing `User.role`, `active`, `refreshTokenHash`, and `refreshTokenExpiresAt` must remain unchanged during restart unless a dedicated administrative action modifies them.
- Bootstrap logic must check `user.count() === 0` before inserting the first admin.

### Files to modify

```text
apps/api/docker-entrypoint.sh
apps/api/package.json
apps/api/prisma/seed.ts
apps/api/prisma/bootstrap-admin.ts
apps/api/prisma/seed-dev.ts
apps/api/README.md
C:\Despliegues\AI4Devs-finalproject\docker-compose.yml
```

### Suggested implementation flow

1. Extract the current seed logic into a development-only script.
2. Create a production-safe bootstrap script for the first admin on empty databases.
3. Update the entrypoint so production startup runs migrations and then starts the API, without demo seed.
4. Add explicit flags and validation for bootstrap variables.
5. Update deployment documentation and examples.
6. Add regression tests for restart behavior and empty-database bootstrap behavior.

### Tests required

| Layer | Minimum scenarios |
|------|--------------------|
| Script / unit | bootstrap rejects non-empty DB; bootstrap rejects missing env vars |
| Integration | production startup skips demo seed |
| Regression | existing admin password remains unchanged after restart |
| Smoke | development seed still works when explicitly requested |

### Non-functional requirements

| Area | Requirement |
|------|-------------|
| Security | No hardcoded production credentials; no secret values in logs |
| Reliability | Startup must fail fast on unsafe bootstrap configuration |
| Operability | Startup steps must be explicit and understandable for operators |
| Maintainability | Seed, bootstrap, and migration logic must live in separate files/commands |

### Definition of Done

- [ ] Production startup no longer runs demo seed automatically.
- [ ] Demo credentials are removed from every production startup path.
- [ ] Bootstrap logic is explicit, isolated, and safe for empty databases only.
- [ ] Development seed remains available via a separate command.
- [ ] Tests covering startup separation pass.
- [ ] Deployment configuration and docs reflect the new split.

### Dependencies

| Relation | Detail |
|----------|--------|
| Depends on | Existing Dockerized deployment and Prisma setup |
| Related to | `US-011` for secrets and production config validation |
| Blocks | Safe production operation and secure credential handling |

---

## [original] Priority

Critical.

## [enhanced] Priority

**Critical (P0)** — this story mitigates the highest-risk operational issue because the current startup path can restore predictable privileged credentials during a normal restart.

**Estimated effort:** 1–2 days including scripts, deployment changes, and regression coverage.

---

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-010 |
| **Module** | `security` / `deployment` / `auth` |
| **Refinement status** | Enhanced locally |

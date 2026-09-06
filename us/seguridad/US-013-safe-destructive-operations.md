# US-013 — Safe Destructive Operations

## [original] User Story

**As** the system owner,  
**I want** destructive maintenance scripts to be strongly protected against accidental execution in the wrong environment,  
**so that** operational mistakes cannot erase production data or restore insecure credentials.

## [enhanced] User Story

**As** the system owner or operator,  
**I want** destructive database utilities to require explicit intent, environment validation, and safe credential handling,  
**so that** maintenance commands cannot wipe production data or silently reset administrator access by mistake.

**MVP scope:** add strong execution safeguards to destructive Prisma scripts and remove hardcoded password-reset behavior from cleanup flows.  
**Out of scope:** full backup orchestration, rollback automation, and approval workflows outside the repository.  
**Source findings:** `reporteDeSeguridad.md` finding 4.

---

## [original] Acceptance Criteria

- [ ] Destructive scripts reject production execution.
- [ ] Destructive scripts require explicit safety flags.
- [ ] Hardcoded admin password reset behavior is removed.
- [ ] Operators can clearly see which database target the script is about to affect.

## [enhanced] Acceptance Criteria

### Execution safeguards

- [ ] Destructive scripts exit immediately when `NODE_ENV=production`.
- [ ] Destructive scripts also exit unless `ALLOW_DESTRUCTIVE_DB_OPS=true` is explicitly set.
- [ ] Destructive scripts require an explicit confirmation mechanism such as `--confirm` or `--yes`.
- [ ] Before executing, the script prints a concise target summary including at least:
  - database host
  - database name
  - current `NODE_ENV`
  - whether destructive mode is enabled
- [ ] If any required safeguard is missing, the script exits with a clear non-zero error.

### Credential safety

- [ ] No cleanup script resets the administrator password to a hardcoded value.
- [ ] If an admin password reset is still needed as an optional maintenance action, it must use explicit runtime input or environment variables.
- [ ] Script output never prints raw passwords, raw tokens, or full connection strings containing secrets.

### Operational clarity

- [ ] Script names, package scripts, and help text clearly indicate when an operation is destructive.
- [ ] Local development cleanup remains possible after the safety checks are satisfied.
- [ ] The operator can distinguish between:
  - data cleanup only
  - optional admin reset
  - read-only maintenance scripts

### Verification

- [ ] Automated checks cover production-mode rejection.
- [ ] Automated checks cover missing allow flag rejection.
- [ ] Automated checks cover missing confirmation rejection.
- [ ] Automated checks confirm that cleanup flows no longer inject known static passwords.

---

## [original] Roles Involved

- System owner
- Operator

## [enhanced] Roles Involved

| Role | Responsibility in this US |
|------|----------------------------|
| System owner | Defines the minimum safety rules for destructive scripts |
| Operator | Executes cleanup utilities in development or test only |
| Backend developer | Implements safeguards and script ergonomics |

---

## [original] Technical Notes

- Current destructive cleanup behavior is too easy to run against the wrong environment.
- Password reset logic should not be bundled implicitly into cleanup scripts.

## [enhanced] Technical Specification

### Target scripts

Primary script currently in scope:

```text
apps/api/prisma/clean-db-admin-only.ts
```

Any future destructive Prisma script must follow the same safety pattern.

### Required safety checks

At minimum, destructive scripts must validate:

1. `NODE_ENV !== 'production'`
2. `ALLOW_DESTRUCTIVE_DB_OPS=true`
3. explicit operator confirmation such as `--confirm`
4. parseable database target information before mutation begins

### Command behavior

Suggested examples:

```text
npm run db:clean:dev -- --confirm
ALLOW_DESTRUCTIVE_DB_OPS=true npm run db:clean:dev -- --confirm
```

The script must reject execution for commands that omit the explicit confirmation flag, even if the allow environment variable is present.

### Data and credential rules

- Cleanup may remove work orders, tasks, clients, vehicles, and non-admin users only after all safety checks pass.
- Cleanup must not automatically set the remaining admin password to a committed known value.
- If admin reset is required, separate it into a distinct explicit flow such as:
  - `db:clean:dev`
  - `db:reset-admin-password`

### Files to modify

```text
apps/api/prisma/clean-db-admin-only.ts
apps/api/package.json
apps/api/README.md
.env.example
```

### Suggested implementation flow

1. Add environment and confirmation guards at the top of the script.
2. Parse and display sanitized target DB information before mutation.
3. Remove the hardcoded admin password reset from the cleanup flow.
4. Optionally split admin reset into a separate explicit utility.
5. Update package scripts and documentation so operators understand the safety model.
6. Add checks that verify unsafe execution paths fail fast.

### Tests required

| Layer | Minimum scenarios |
|------|--------------------|
| Script / unit | reject when `NODE_ENV=production` |
| Script / unit | reject when `ALLOW_DESTRUCTIVE_DB_OPS` is missing |
| Script / unit | reject when `--confirm` is missing |
| Regression | no static admin password is injected during cleanup |

### Non-functional requirements

| Area | Requirement |
|------|-------------|
| Security | Prevent accidental production execution and hardcoded credential restoration |
| Operability | Error messages must clearly explain how to run the script safely |
| Maintainability | All destructive utilities should share the same guard pattern |
| Observability | Output must show sanitized target info without leaking secrets |

### Definition of Done

- [ ] Destructive scripts reject unsafe execution contexts.
- [ ] Hardcoded admin password reset behavior is removed.
- [ ] Safety checks are documented in the script usage and package scripts.
- [ ] Verification checks for the safety gates pass.
- [ ] Operators can identify the target database before deletion begins.

### Dependencies

| Relation | Detail |
|----------|--------|
| Depends on | Existing Prisma administrative scripts |
| Related to | `US-010` because startup and maintenance flows must both avoid credential resets |
| Blocks | Safe multi-environment operations |

---

## [original] Priority

High.

## [enhanced] Priority

**High (P1)** — this closes a high-impact operational risk because one accidental execution can both erase data and restore insecure admin credentials.

**Estimated effort:** 0.5–1 day including guards, package script updates, and checks.

---

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-013 |
| **Module** | `security` / `operations` / `prisma` |
| **Refinement status** | Enhanced locally |

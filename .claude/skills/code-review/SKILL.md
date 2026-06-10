---
name: code-review
description: Review RunMarket changes for clean-architecture compliance plus inline backend and frontend checklists before a task or US is marked done. Catches layer violations, missing tests, and security-rule breaks.
---

# Code Review

Self-review (or peer-review) of the changes for a task/US before closing. Focus:
clean architecture compliance + backend/frontend checklists + the security rules from
`CLAUDE.md`. This is a quality gate, not a place to add features.

---

## Clean-architecture review

- [ ] No layer skipped: `Controller → Service → Repository → Prisma`.
- [ ] Controllers do **not** import Prisma; no business logic in controllers.
- [ ] Services do **not** import Express or Prisma; depend on repository interfaces.
- [ ] Repositories are the **only** Prisma touchpoint and **map to domain types**;
      no Prisma-generated types leak upward.
- [ ] One file per resource per layer, kebab-case naming.
- [ ] TypeScript strict; **no `any`**.

---

## Backend review checklist

- [ ] Zod `.strict()` on every input boundary; no `.passthrough()`.
- [ ] Price/total read server-side; client `price` ignored.
- [ ] Raw SQL only via Prisma tagged templates.
- [ ] CORS origin from `CORS_ORIGIN`; no wildcard outside dev.
- [ ] `sessionId` via `crypto.randomUUID()`, delivered in a cookie.
- [ ] Errors mapped to generic `{ error }`; Prisma details to logger only.
- [ ] Stock re-validated in checkout transaction.
- [ ] Rate limiting on mutation endpoints; no PII logged.
- [ ] Supertest + Jest tests present, named, and green; service unit-tested with
      mocked repository.

---

## Frontend review checklist

- [ ] loading / empty / error states handled; error is non-blocking.
- [ ] No card data in state/localStorage; only cart and order summary (`sessionId` in cookie, not localStorage).
- [ ] URL filter params validated against domain enums; unknowns dropped.
- [ ] No `dangerouslySetInnerHTML`.
- [ ] `'use client'`/client state only where genuinely needed.
- [ ] RTL tests present, named, and green; UX states tested where applicable.

---

## Cross-cutting

- [ ] Every changed task maps to ≥1 acceptance criterion.
- [ ] Full test suite green; output pasted in the backlog.
- [ ] No scope creep beyond the US.
- [ ] Commits follow `docs/CODING-STANDARDS.md`.

## Output

A short verdict per section (pass / issues) and a list of required fixes. Block the
task/US close until all listed issues are resolved.

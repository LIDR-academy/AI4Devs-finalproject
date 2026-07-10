---
id: task-2
title: AuthService — sign-in/out with input validation
slice: 1
scenarios: [s2, s4, s9]
status: done
paths: [libs/services/src/services/auth.service.ts, libs/services/src/services/auth.service.test.ts, libs/services/src/services/index.ts]
---

## Goal
Create `AuthService` (abstract class, static methods) wrapping `AuthDao` with the business rules:
- `signIn(email, password)` — validate that email is well-formed and password is non-empty, then call `AuthDao.signInWithPassword`; on happy path return the session/user.
- `signOut()` — call `AuthDao.signOut`.
- Reusable **validators**: `isValidEmail(email)` (checks RFC-like format) and `isNonEmptyPassword(password)`. These back @s9; the inline UI display is task-7.

**Note:** Password **strength** validation (≥ 8 chars + letter + number + symbol) is **reserved for the signup story** and is not part of login validation per the approved spec decisions.

Error normalization into the typed `AuthErrorCode` contract is added in **task-2's sibling, task-6** (Slice 2) — keep this task to happy-path + validation so Slice 1 stays a thin vertical.

## Done criteria
- [ ] Scenarios @s2, @s4 covered by service tests mocking `AuthDao` (happy path sign-in/out).
- [ ] Scenario @s9 covered by validator unit tests — email format validation and non-empty password check.
- [ ] Service validates inputs **before** calling the DAO (rejects invalid input without a network call).
- [ ] `AuthService` is `abstract class` with `static` methods; no React; exported via `libs/services/src/services/index.ts`.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [ ] No hardcoded strings/colors/dimensions (validator returns codes/booleans, not user copy).

## Notes
- Layering per `.agents/rules/hooks-service-dao.mdc`: service → DAO only; never `fetch`/`getSupabase()` directly.
- Email validation: check for presence of alphanumeric characters and an @ symbol; a production implementation might use a lightweight RFC-compliant regex. Keep it simple for MVP.
- See "Open decisions" in `spec.md`: password strength is reserved for the signup story; login only validates email format + non-empty password (spec.md, approved).

---
id: task-6
title: Auth error contract — normalization + AuthErrorCode type
slice: 2
scenarios: [s5, s6]
status: done
paths: [libs/types/src/auth-error.ts, libs/types/src/index.ts, libs/services/src/services/auth.service.ts, libs/services/src/services/auth.service.test.ts]
---

## Goal
Give the failure paths a typed, UI-agnostic contract:
- Add `AuthErrorCode = 'invalid_credentials' | 'network_error' | 'validation_error'` (and a small `AuthError` shape carrying `code`) to `@helsoft/types` (`auth-error.ts`, plain TS; export via barrel).
- In `AuthService.signIn`, catch and **normalize** Supabase outcomes: an invalid-login error → `invalid_credentials`; a thrown/aborted fetch or offline → `network_error`; bypassed client validation → `validation_error`. The service surfaces the `code`; the raw Supabase error never leaks upward.

## Done criteria
- [x] Scenario @s5 covered: a wrong-email **and** a wrong-password Supabase error both normalize to `invalid_credentials` (single generic outcome — no user enumeration).
- [x] Scenario @s6 covered: a thrown/network exception normalizes to `network_error`; a subsequent successful call resolves normally (retry works).
- [x] Service tests assert the mapping against representative supabase-js error shapes and a thrown fetch — the UI never sees a raw error.
- [x] `AuthErrorCode`/`AuthError` in `@helsoft/types` (`type-name.ts` convention, plain TS), exported via `libs/types/src/index.ts`.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Keep message **copy** out of types/services — the service returns a `code`; the form maps code → i18n key (`auth.error.invalidCredentials` / `auth.error.network`) in task-7/task-8. This preserves the layering (no user strings below the component).
- This is the Slice-2 counterpart to task-2 (happy path). Update `useAuth`'s `error` to carry the `AuthErrorCode`.

---
id: task-7
title: LoginForm — Error + Empty states, inline validation, retry
slice: 2
scenarios: [s5, s6, s8, s9]
status: in_progress
paths: [libs/components/src/organisms/login-form/login-form.tsx, libs/components/src/organisms/login-form/login-form.test.tsx, libs/components/src/organisms/login-form/login-form.stories.tsx]
---

## Goal
Complete the `LoginForm`'s remaining two of the four UI states and its validation/retry behavior:
- **Empty** (@s8): pristine form → submit **disabled**, no error shown.
- **Error** (@s5/@s6): render `errorMessage` in a banner ("Invalid email or password" / "Network error") using `TextField`/banner error styling; the form stays editable and re-submitting (retry) is allowed.
- **Inline validation** (@s9): render `emailError`/`passwordError` via `TextField`'s `error` + `supportingText` (malformed email or empty password); the parent (SignInForm, using `AuthService` validators) decides validity, but the form must display the messages and gate the submit control accordingly.

The form remains **presentational** — it receives error strings and a validity signal as props; the validation *logic* lives in the service/wiring (task-2/task-6/task-5).

## Done criteria
- [x] Scenario @s8 covered: with empty inputs, submit is disabled and no error text is rendered.
- [x] Scenario @s5/@s6 covered: given an `errorMessage`, an error banner renders; the form stays interactive so the user can retry; a `network_error` banner differs from an `invalid_credentials` banner only by the injected string.
- [x] Scenario @s9 covered: given `emailError`/`passwordError`, the corresponding field shows the inline message (via `TextField error` + `supportingText`) and submit is blocked. Validation is email format + non-empty password only (no strength rule on login).
- [x] Stories added for **Empty** and **Error** (banner + inline) states; the file now covers all four UI states.
- [x] `login-form.test.tsx` extended for the new states.
- [x] Tokens only; reuse `TextField`/`Button`; no ad-hoc colors/spacing.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Error announcement to assistive tech is finalized in task-9 (a11y pass), but wire the error node so it can carry an accessibility live-region/role there.
- Password-strength validation is reserved for the signup story (approved spec decision); login validates only email format + non-empty password.

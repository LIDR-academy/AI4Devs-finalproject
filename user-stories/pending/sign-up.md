# Sign-up (R5)

**As a** new user
**I want** to create an account with email/password and verify my email
**so that** I can log in and keep my study materials private to me

## Context
- PRD's **R5 — Auth & persistence**. Login/logout already shipped (`login-and-logout.md`, done). Lesson persistence / RLS / Home list / delete is a separate story (`signup-and-lesson-persistence.md` — persistence-only scope). This story is **sign-up + email verification only**.
- **Sign-up is currently missing, not just unwired.** `AuthService`/`AuthDao` (`libs/supabase-services/src/services/auth.service.ts`, `.../dao/auth.dao.ts`) only implement `signIn`/`signOut` — `signUp` doesn't exist at any layer. `apps/app-study-buddy/src/app/(auth)/sign-up.tsx` is a stub screen (no form, not wired). `AuthService`'s existing comment reserves password-strength validation for "the signup story" — this is that story.
- Presentational auth organisms live in `@helsoft/logging-in-out` (`SignInForm`, `SignOut`); new `SignUpForm` should follow that pattern. Layering: `Component → Hook → Service → DAO`.
- **Out of scope:** forgot-password / password-reset (per `login-and-logout.md`); lesson persistence / Home list (sibling story); social/OAuth/magic-link/MFA.

## Acceptance criteria
- **Sign-up, happy path** — Given a new user on the sign-up screen, When they enter an email and a password meeting the strength rule (8+ chars, mix of letters/numbers/symbols) and submit, Then a Supabase account is created and a verification email is sent; the account cannot log in yet.
- **Post sign-up UX** — After successful sign-up, the user stays on a clear “check your email” state (does not enter the app session).
- **Email verification required** — Given an unverified account, When the user attempts to log in, Then login is rejected with a clear message (e.g. "Please verify your email before logging in"), not the generic invalid-credentials error.
  - Given the user follows the verification link, When they then log in with the same credentials, Then login succeeds via the existing login flow.
- **Duplicate email** — Given an email already registered, When sign-up is attempted with it, Then a clear error is shown ("An account with this email already exists" or similar) and no duplicate account is created.
- **Weak password** — Given a password that fails the strength rule, When sign-up is attempted, Then it's rejected client-side (or by Supabase) with a clear message before any account is created.
- **Login/logout unchanged** — existing `login-and-logout.md` behavior (valid/invalid credentials, network error, session persistence across restarts) continues to work unchanged.

## Notes
- Reuses `login-and-logout`'s password-strength rule and its "no forgot-password flow" boundary — don't re-litigate either in spec.
- Email verification is a Supabase Auth built-in (confirmation email + link) — no custom email infra needed.
- No analytics events or feature flags required for MVP.
- Carved out of `signup-and-lesson-persistence` during that feature’s spec debate (2026-07-13).
- Ready for `/ticket-orchestrator sign-up` after this file is in `pending/`.

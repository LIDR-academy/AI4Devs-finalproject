---
feature: login-and-logout
story: user-stories/login-and-logout.md
status: spec_ready
---

# Spec — login-and-logout

## Summary
Email/password authentication for the AI Study Buddy universal Expo app, on Supabase Auth. An
unauthenticated user is routed to a login screen; valid credentials establish a Supabase session and
drop them on the home screen with access to protected content. "Log Out" clears the session and
returns to login. The session persists across app close/reopen with no re-auth. Phase 0 foundational
work — prerequisite for every per-user, RLS-protected feature (PRD R5, the `auth.uid()` foundation).

The presentational **`LoginForm` is an organism in `@helsoft/components`**; the wiring (`SignInForm`,
`SignOut`) lives in `@helsoft/study-buddy`; app screens are thin shells — mirroring the existing
`LanguageSelector` → `LanguageSettings` → Settings split. Signup, forgot-password, analytics, and
feature flags are out of scope.

## User stories
- As a **new user**, I want to log in securely with email/password, so my documents and lessons stay private to me.
- As a **returning user**, I want to log out and back in, and my session to persist across restarts, so I control access and don't re-authenticate every launch.

## Context already in place (this feature verifies, does NOT rebuild)
- **Route guarding & redirect** — `_layout.tsx`'s `Stack.Protected` guards driven by `useSession()`; login/logout flip the session, redirects are automatic (no manual `router.replace`).
- **Session persistence** — `src/lib/supabase.ts` `initSupabase` (`persistSession`/`autoRefreshToken`, AsyncStorage/localStorage); `useSession()` reads `getSession()` at startup. Needs only a verifying test.
- **Building blocks reused** — `Button`, `TextField`, `ScreenContainer`, `Dialog`, `useSession()`, `@helsoft/localization`.
- **This feature adds** — `AuthDao`/`AuthService`/`useAuth`, `LoginForm`, `SignInForm`/`SignOut`, login-screen content, logout action, `auth.*` strings.

## Acceptance criteria → see `gherkin-scenarios.md` (each `@s` scenario is an AC)

## UI states (LoginForm organism)
| State | Trigger | Notes |
|---|---|---|
| Empty | Initial render / pristine form | Fields blank, labels visible, submit **disabled**, no error. |
| Content | Both fields typed + pass client validation | Fields filled, submit **enabled**, Sign up link visible. |
| Loading | Submit tapped, `AuthService.signIn` in flight | Submit spinner/disabled, fields disabled, no error yet. Resolves to Content(→redirect) or Error. |
| Error | Auth failure (`invalid_credentials`/`network_error`) or failed inline validation | Banner for auth errors; inline field messages for validation. Form stays editable; retry = re-submit. Announced to assistive tech. |

## Error contract
`AuthService.signIn` normalizes every failure into a typed `AuthErrorCode` (`@helsoft/types`) so the UI never branches on raw Supabase errors:

| Code | Cause | i18n key → message | Retry |
|---|---|---|---|
| `invalid_credentials` | Supabase invalid-login (wrong email **or** password) | `auth.error.invalidCredentials` → "Invalid email or password" | Edit + resubmit |
| `network_error` | fetch throws / offline / timeout | `auth.error.network` → "Network error" | Resubmit when online |
| `validation_error` | Client validation fails (malformed email / empty password) | field-level (`auth.error.email` / `auth.error.password`) | Fix input |

Security: wrong email and wrong password collapse to one generic message (no user enumeration).

## Analytics / Feature flags
None — out of scope for MVP per the story.

## Out of scope / non-goals
Signup (separate story; form links to a stub); forgot-password/reset (separate story); analytics &
feature flags; social/OAuth/magic-link/MFA; RLS policy authoring (PRD R5); rebuilding route
guards / session persistence (already implemented — this story verifies them).

## Open decisions (confirmed)
- `LoginForm` is an organism in `@helsoft/components`; wiring in `@helsoft/study-buddy`; app screens thin — story mandate + layering rule + `LanguageSelector`/`LanguageSettings` precedent.
- Redirect after login/logout relies on existing `Stack.Protected` guards keyed on `useSession()` — no manual navigation (avoids races).
- `useAuth` is a plain-state hook (`useState`), not tanstack-query — one-shot mutations with a session side effect, matching `useSession`.
- Login validates only email format + non-empty password; full strength rule reserved for the signup story.
- Log Out lives on BOTH Settings and Home as a `SignOut` component.
- Log out is a direct action WITH a confirmation dialog (session termination is irreversible).
- "Empty" UI state = the pristine form (submit disabled).
- The empty-password half of @s9 is enforced **only** via `LoginForm`'s `isPristine` gating (identical blank/whitespace rule to `AuthService.isNonEmptyPassword`), so `handleSubmit` can never fire with a blank password — a mirrored `passwordError` branch in `SignInForm` would be unreachable dead code (Three Laws). `AuthService.signIn`'s `validation_error` throw is the backstop; `LoginForm.passwordError` stays specified/tested for future consumers. (Round-1 Slice-2 review, Minor 2.)

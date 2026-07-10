---
feature: login-and-logout
story: user-stories/login-and-logout.md
status: spec_ready
---

# Spec — login-and-logout

## Summary
Email/password authentication for the AI Study Buddy universal Expo app, built on Supabase Auth. A user who is not authenticated is routed to a login screen; entering valid credentials establishes a Supabase session and drops them on the home screen with access to protected content. A "Log Out" action clears the session and returns them to login. The session persists across app close/reopen with no re-authentication. This is Phase 0 foundational work: it is a prerequisite for every per-user, RLS-protected feature (PRD R5, and the `auth.uid()` foundation).

Signup, forgot-password, analytics, and feature flags are explicitly **out of scope** (separate stories / not needed for MVP). The presentational **login form lives in `@helsoft/components`** (per the story), composed from existing `@helsoft/components` primitives; the feature wiring lives in `@helsoft/study-buddy`; the app screens stay thin shells — mirroring the existing `LanguageSelector` (presentational) → `LanguageSettings` (feature wiring) → Settings screen split.

## User stories
- As a **new user**, I want **to log in securely with email/password**, so that **my documents and lessons stay private to me**.
- As a **returning user**, I want **to log out and back in**, and **my session to persist across app restarts**, so that **I control access to my account and don't re-authenticate every launch**.

## Context already in place (this feature does NOT rebuild it)
Grounding the scope precisely — the following scaffolding already exists and satisfies parts of the ACs; this feature verifies it end-to-end rather than reimplementing it:
- **Route guarding & redirect** — `apps/app-study-buddy/src/app/_layout.tsx` renders `Stack.Protected guard={!!session}` (app group) and `guard={!session}` (auth group), driven by `useSession()`. So "routed to login when unauthenticated" and "redirected to home/login on session change" are **automatic** once sign-in/sign-out flip the Supabase session. No manual `router.replace` is needed or wanted.
- **Session persistence** — `apps/app-study-buddy/src/lib/supabase.ts` calls `initSupabase` with `persistSession: true`, `autoRefreshToken: true`, `AsyncStorage` on native / `localStorage` on web; `useSession()` reads `getSession()` at startup. Persistence across restart therefore needs **no new code** — only a verifying test.
- **Building blocks** — `Button` (atom), `TextField` (molecule), `ScreenContainer` (template), `useSession()` hook, `@helsoft/localization` (`t`, `auth.*`/`nav.*` keys).

What this feature **adds**: `AuthDao` + `AuthService` + `useAuth` (the missing auth logic backbone), the `LoginForm` organism, the `SignInForm` / `SignOut` feature-wiring components, the login-screen shell content, the logout action on Settings, and the `auth.*` i18n strings.

## Acceptance criteria (Given/When/Then)
- **AC1** — Given I am not authenticated, When the app starts, Then I see the login screen and cannot reach protected screens. *(→ @s1)*
- **AC2** — Given I am on the login screen and enter a valid email and a valid password for an existing account, When I submit the form, Then a Supabase session is established, I am taken to the home screen, and I can access protected screens. *(→ @s2)*
- **AC3** — Given credentials are being verified, When the request is in flight, Then the form shows a loading state and the submit control is disabled until it resolves. *(→ @s3)*
- **AC4** — Given I am authenticated, When I tap "Log Out", Then my session is cleared, I am returned to the login screen, and I can no longer access protected screens without re-authenticating. *(→ @s4)*
- **AC5** — Given I enter an email/password that match no account, When I submit, Then I see the error "Invalid email or password", I remain on the login screen, and no session is created. *(→ @s5)*
- **AC6** — Given I have valid credentials but the network is unavailable, When I submit, Then I see the error "Network error" and remain on the login screen; When the connection is restored and I submit again, Then the session is established and I reach home. *(→ @s6)*
- **AC7** — Given I logged in previously and have not logged out, When I close and reopen the app, Then I am still authenticated and land on the home screen without re-entering credentials. *(→ @s7)*
- **AC8** — Given I have not entered credentials (pristine form), Then the submit control is disabled and no error is shown. *(→ @s8)*
- **AC9** — Given I enter a malformed email or leave the password empty, When I attempt to submit, Then I see an inline validation message and the form is not submitted. *(→ @s9)*
- **AC10** — Given I am authenticated, When I tap "Log Out", Then a confirmation dialog appears; accepting it clears my session, returns me to the login screen, and I can no longer access protected screens. Dismissing it keeps me authenticated. *(→ @s10)*
- **AC11** — Given I am authenticated, When I tap "Log Out" on the Home screen, Then a confirmation dialog appears with the same behavior as Settings. *(→ @s11)*
- **AC12** — Given I am on the login screen, Then the email and password fields expose accessible labels, the submit control exposes a button role, and an authentication error is announced to assistive technology. *(→ @s12)*
- **AC13** — Given the app locale is a supported language, When I view the login form, Then all labels, placeholders, button text, and error messages render from the active locale bundle (no hardcoded strings). *(→ @s13)*

## UI states (LoginForm organism)
The classic 4-state model mapped to a form. See "Open decisions" for the Empty-state interpretation.

| State | Trigger | Notes |
|---|---|---|
| Empty | Initial render / pristine form | Fields blank, placeholders + labels visible, submit **disabled**, no error shown. |
| Content | User has typed and input passes client validation (non-empty email + non-empty password) | Fields hold values, submit **enabled**, link to Sign up visible. |
| Loading | Submit tapped, `AuthService.signIn` in flight | Submit shows spinner/disabled label, fields disabled, no error yet. Resolves to Content(→redirect) or Error. |
| Error | Auth failure (`invalid_credentials`, `network_error`) or failed inline validation | Error banner for auth errors ("Invalid email or password" / "Network error"); inline field messages for email/password validation (malformed email / empty password). Form stays editable; retry = re-submit. Error is announced to assistive tech. |

## Error contract
`AuthService.signIn` normalizes every failure into a typed `AuthErrorCode` (a discriminated type in `@helsoft/types`) so the UI never branches on raw Supabase errors:

| Code | Cause | User-facing message (i18n key) | Retry |
|---|---|---|---|
| `invalid_credentials` | Supabase returns invalid-login error (wrong email **or** password) | `auth.error.invalidCredentials` → "Invalid email or password" | Edit + resubmit |
| `network_error` | fetch throws / offline / timeout | `auth.error.network` → "Network error" | Resubmit when online |
| `validation_error` | Client validation fails (malformed email or empty password) | field-level (`auth.error.email` / `auth.error.password`) | Fix input |

Security note: wrong email and wrong password collapse to **one** generic message (no user enumeration).

## Analytics events
None — out of scope for MVP per the story.

## Feature flags
None — out of scope for MVP per the story.

## Out of scope / non-goals
- **Signup** — separate story (the `LoginForm` links to it; the screen exists as a stub).
- **Forgot-password / password reset** — separate story.
- **Analytics & feature flags** — not in MVP.
- **Social / OAuth / magic-link / MFA** — email+password only.
- **Row-Level Security policy authoring** — RLS lands with PRD R5 (persistence); this story only establishes `auth.uid()`.
- **Rebuilding route guards or session persistence** — already implemented (see "Context already in place"); this story verifies them.

## Open decisions (confirmed) 
- **Decision:** The presentational `LoginForm` is an **organism in `@helsoft/components`**; the wiring (`SignInForm`, `SignOut`) is in `@helsoft/study-buddy`; app screens are thin shells. — **why:** the story explicitly says the form belongs in `@helsoft/components`; the layering rule keeps business logic out of `apps/*`; this mirrors the established `LanguageSelector`/`LanguageSettings` precedent. ✓ Confirmed.
- **Decision:** Redirect after login/logout relies on the **existing `Stack.Protected` guards** keyed on `useSession()` — no manual navigation. — **why:** the mechanism already exists and is declarative; manual `router.replace` alongside session changes invites races. ✓ Confirmed.
- **Decision:** `useAuth` is a **plain-state hook** (`useState` for `isSubmitting`/`error`), not tanstack-query. — **why:** sign-in/sign-out are one-shot mutations with a session side effect, not cacheable queries; matches the existing `useSession` style; the rule reserves tanstack-query for data-fetching hooks "when first needed." ✓ Confirmed — acceptable to defer.
- **Decision:** On login, the form **validates only email format + non-empty password** (no strength rule). The full strength rule (≥8 chars, ≥1 letter, ≥1 number, ≥1 symbol) is **reserved for the signup story**. — **why:** login screens conventionally only require valid email + non-empty password; strength enforcement happens at signup. Cleaner separation of concerns. ✓ Confirmed.
- **Decision:** **Log Out lives on BOTH Settings and Home screens** as a `SignOut` feature component. — **why:** Home is convenient for quick logout; Settings remains the canonical account-settings location. ✓ Confirmed.
- **Decision:** Log out is a **direct action WITH a confirmation dialog**. — **why:** session termination is irreversible without re-authentication (different from low-risk form discard); the dialog is a safety affordance; the organism exists and is battle-tested. ✓ Confirmed.
- **Decision:** "Empty" UI state = the **pristine form** (no input yet, submit disabled). — **why:** a form has no "no data" state; pristine-with-disabled-submit is the meaningful analogue and is independently testable. ✓ Confirmed.
- **Decision:** The empty-password half of AC9/@s9 is enforced **only via `LoginForm`'s Empty-state gating (`isPristine`)** — `SignInForm` does not mirror `AuthService.isNonEmptyPassword` into a live `passwordError` state of its own. — **why:** `isPristine` trims and blanks-checks the password field with the exact same rule `AuthService.isNonEmptyPassword` uses, so it already keeps the submit control disabled for any blank/whitespace-only password; `handleSubmit` can never be invoked with one, making a mirrored `passwordError` branch in `SignInForm` unreachable dead code that no test can legitimately drive (Three Laws — no production code without a failing test demanding it; confirmed by an earlier build attempt at this exact wiring, removed and logged in `tdd.md`'s Slice-2 "Wiring — SignInForm" section). `AuthService.signIn`'s own `validation_error` throw remains the defensive backstop for any caller that bypasses the form entirely, and `LoginForm`'s `passwordError` prop itself stays fully specified and tested at the component level for any future consumer that needs it. ✓ Confirmed (Round-1 slice-2 review, Minor 2 — was previously only an implicit code-comment; now an explicit, reviewed scope decision).

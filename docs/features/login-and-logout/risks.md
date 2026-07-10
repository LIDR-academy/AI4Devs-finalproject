# Risks — login-and-logout

| # | Risk | Type | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | Login-side enforcement of the password-strength rule can lock users out (typo drops the symbol → validation blocks submit instead of showing "invalid credentials") and leaks the policy. | product | M | M | Flagged as an Open decision for the gate. If confirmed, keep the message purely client-side/non-enumerating; recommended alternative is email-format + non-empty only on login. |
| R2 | Redirect-after-auth depends on the existing `Stack.Protected` guards reacting to `onAuthStateChange`. If sign-in resolves but the session listener lags, the user could briefly see a stale screen. | technical | L | M | Integration test asserts navigation follows the session (not a manual push); `useSession` already subscribes to `onAuthStateChange`; keep the hook the single source of truth — no manual `router.replace`. |
| R3 | Native session persistence relies on the `AsyncStorage` adapter passed in `apps/app-study-buddy/src/lib/supabase.ts`. If that wiring regresses, "session persists across restart" silently breaks on iOS/Android. | technical | L | H | Persistence config already present; add a verifying test around `useSession` + a documented manual native check; do not touch `initSupabase` config in this story. |
| R4 | Distinguishing `invalid_credentials` from `network_error` from the raw Supabase error shape can be brittle across supabase-js versions. | technical | M | M | Normalize in `AuthService` behind a typed `AuthErrorCode`; unit-test the mapping against representative Supabase error/exception shapes; UI only consumes the normalized code. |
| R5 | `TextField` has no first-class `secureTextEntry`/inline-error-role contract yet; the password field and error announcement must be wired through its existing props (`error`, `supportingText`, passthrough `TextInputProps`). | technical | L | M | Reuse `TextField`'s `error` + `supportingText` for inline messages and pass `secureTextEntry` via `TextInputProps`; assert a11y announcement in the component test; extend `TextField` only if a real gap surfaces (kept out of scope otherwise). |
| R6 | Over-scoping: reimplementing route guards / persistence that already exist, or pulling in tanstack-query for a single mutation. | timeline | M | L | Spec pins the "already in place" scope; `useAuth` uses plain state; tasks list exact paths so the implementator adds only the auth backbone + form + wiring. |
| R7 | Error/validation copy must exist in all four locale bundles (en/es/pt/de); a missing key falls back to `en` and fails the i18n coverage test. | product | M | L | Slice 3 adds `auth.*` keys to every bundle; the localization lib already has a key-alignment/coverage test that will catch gaps. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| Supabase Auth (email/password enabled on the hosted project) | available | Client initialized at app startup; email/password provider assumed enabled in the Supabase dashboard — **confirm before Slice 1**. |
| `useSession()` hook (`@helsoft/hooks`) | available | Returns `{ session, isLoading }`; drives route guards. |
| `Stack.Protected` route guards (`apps/app-study-buddy/src/app/_layout.tsx`) | available | Auto-redirect on session change; do not modify. |
| Session persistence config (`apps/app-study-buddy/src/lib/supabase.ts`) | available | AsyncStorage (native) / localStorage (web); `persistSession: true`. |
| `Button`, `TextField`, `ScreenContainer`, `Dialog` (`@helsoft/components`) | available | Reused as-is; `Dialog` only if a logout-confirm is chosen at the gate. |
| `@helsoft/localization` | available | `t()`; add `auth.*` keys to en/es/pt/de. |
| Signup screen (`(auth)/sign-up.tsx`) | available (stub) | `LoginForm` links to it; full signup is a separate story. |

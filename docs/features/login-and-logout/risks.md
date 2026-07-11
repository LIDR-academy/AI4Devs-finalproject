# Risks — login-and-logout

| # | Risk (L/I) | Mitigation |
|---|---|---|
| R1 | Login-side password-strength enforcement can lock users out and leak policy (product, M/M) | Open decision at gate — confirmed: login validates email-format + non-empty only; message stays client-side/non-enumerating. |
| R2 | Redirect-after-auth depends on `Stack.Protected` reacting to `onAuthStateChange`; a lagging listener could briefly show a stale screen (technical, L/M) | Integration test asserts nav follows the session, not a manual push; `useSession` is the single source of truth — no `router.replace`. |
| R3 | Native persistence relies on the `AsyncStorage` adapter in `supabase.ts`; a regression silently breaks "persists across restart" (technical, L/H) | Config already present; added a verifying test around `useSession` + a documented manual native check; don't touch `initSupabase`. |
| R4 | Distinguishing `invalid_credentials` vs `network_error` from raw Supabase shapes is brittle across supabase-js versions (technical, M/M) | Normalize in `AuthService` behind a typed `AuthErrorCode`; unit-test the mapping; UI consumes only the normalized code. |
| R5 | `TextField` has no first-class `secureTextEntry`/inline-error-role contract; password + error must go through existing props (technical, L/M) | Reuse `error`/`supportingText` for inline messages, pass `secureTextEntry` via `TextInputProps`; assert a11y announcement; extend `TextField` only if a real gap surfaces. |
| R6 | Over-scoping: reimplementing existing guards/persistence, or pulling tanstack-query for one mutation (timeline, M/L) | Spec pins "already in place" scope; `useAuth` uses plain state; tasks list exact paths. |
| R7 | Error/validation copy must exist in all 4 bundles (en/es/pt/de); a missing key falls back and fails the i18n coverage test (product, M/L) | Slice 3 adds `auth.*` keys to every bundle; localization lib's key-alignment/coverage test catches gaps. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| Supabase Auth (email/password enabled) | available | Client initialized at startup; **confirm provider enabled before Slice 1**. |
| `useSession()` (`@helsoft/hooks`) | available | `{ session, isLoading }`; drives guards. |
| `Stack.Protected` guards (`_layout.tsx`) | available | Auto-redirect on session change; do not modify. |
| Session persistence (`src/lib/supabase.ts`) | available | AsyncStorage/localStorage; `persistSession: true`. |
| `Button`/`TextField`/`ScreenContainer`/`Dialog` (`@helsoft/components`) | available | Reused as-is. |
| `@helsoft/localization` | available | `t()`; add `auth.*` keys to en/es/pt/de. |
| Signup screen (`(auth)/sign-up.tsx`) | available (stub) | `LoginForm` links to it; full signup separate. |

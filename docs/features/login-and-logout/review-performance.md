# Review — Performance (runtime & delivery cost)

**Feature:** login-and-logout — Slice 1 (happy path + loading)
**Round:** 1
**Verdict:** APPROVED

## Scope reviewed
- `libs/services/src/dao/auth.dao.ts`
- `libs/services/src/services/auth.service.ts`
- `libs/hooks/src/hooks/use-auth.ts`
- `libs/components/src/organisms/login-form/login-form.tsx`
- `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx`
- `libs/study-buddy/src/components/sign-out/sign-out.tsx`
- `libs/study-buddy/package.json` (expo-router dependency addition)

No list-virtualization concerns apply — this feature contains no lists (form + dialog only); none invented.

## Findings
None. Zero blocker/major/minor findings.

## Verification detail

**Network round-trips — single call per action, no N+1/polling.**
- `AuthDao.signInWithPassword` (`libs/services/src/dao/auth.dao.ts:20-27`) makes exactly one `getSupabase().auth.signInWithPassword` call; `AuthDao.signOut` (`auth.dao.ts:29-32`) makes exactly one `getSupabase().auth.signOut` call. No retry loop, no polling.
- `AuthService.signIn` (`libs/services/src/services/auth.service.ts:21-29`) short-circuits with a **rejected promise before any DAO call** when client-side validation fails (`isValidEmail`/`isNonEmptyPassword`, lines 13-19), so an invalid form never reaches the network — correct, avoids a wasted round-trip.
- `useAuth`'s shared `withSubmitting<T>()` helper (`libs/hooks/src/hooks/use-auth.ts:21-28`) wraps each call exactly once (`setIsSubmitting(true)` → `await task()` → `finally setIsSubmitting(false)`); `signIn`/`signOut` (lines 30-38) each invoke their `AuthService` method exactly once, no duplicate dispatch. Confirmed against `auth.integration.test.ts:47,68` which spy on `signInWithPassword`/`signOut` — single call per action.
- Session observation (`useSession`, pre-existing/out of scope, `libs/hooks/src/hooks/use-session.ts:23,27`) uses one `getSession()` call at mount plus an event-driven `onAuthStateChange` subscription — no polling.

**Main-thread synchronous work — trivial.**
- `EMAIL_PATTERN.test(email)` (`auth.service.ts:5,13-15`) and `password.trim().length > 0` (`auth.service.ts:17-19`) are O(length-of-string) regex/string ops on short user input — negligible, not a concern.

**Re-renders — no storm, no action needed.**
- `LoginForm` (`libs/components/src/organisms/login-form/login-form.tsx:34-74`) is a small, two-field controlled form; re-renders are bounded to keystrokes and `isSubmitting` toggles (on the order of single digits per session). Inline closures such as `onPress={() => onSubmit({ email, password })}` (`login-form.tsx:58`) necessarily close over per-render `email`/`password` state, so `useCallback` would not reduce re-creation frequency and is not warranted here.
- `SignInForm` (`libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx:18-30`) and `SignOut` (`libs/study-buddy/src/components/sign-out/sign-out.tsx:16-35`) pass fresh `labels`/callback objects to their children on each render, but neither `LoginForm` nor `Dialog`/`Button` is wrapped in `memo`, and both wiring components only re-render a handful of times across a login/logout session (mount + `isSubmitting`/dialog-open toggles). Given the rubric's guidance to weigh cost against render frequency, memoizing here would add complexity for no measurable runtime benefit — correctly left unmemoized for this low-frequency form.

**Bundle/dependency weight — `expo-router` addition is reasonable.**
- `libs/study-buddy/package.json:20-21,32` adds `expo-router` as a **peerDependency** (`"expo-router": "*"`) plus a **devDependency** (`"expo-router": "~57.0.3"`, type-checking/Jest-mock use only) — not a runtime `dependencies` entry, so the lib does not bundle its own copy.
- `apps/app-study-buddy/package.json:18` already ships `expo-router: ~57.0.3` as a hard dependency (it's the app's routing entry point, `"main": "expo-router/entry"`). The version pinned in `study-buddy`'s devDependency matches exactly, so at runtime the app supplies the single instance via the peer-dependency contract — consistent with how `react`/`react-native`/`react-native-unistyles` are already declared as peers in the same file. No incremental bundle weight added to the shipped app.

**Images / assets** — none introduced by this feature.

## Conclusion
Slice 1 (AuthDao → AuthService → useAuth → LoginForm/SignInForm/SignOut) makes exactly one Supabase call per sign-in/sign-out action, does no synchronous heavy lifting, introduces no list-rendering concerns, and adds no meaningful bundle weight via the `expo-router` peer dependency. No findings — **APPROVED**.

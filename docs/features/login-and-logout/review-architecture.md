# Architecture review — login-and-logout (Round 1, Slice 1)

**Verdict: APPROVED**

Scope reviewed: commit `2456693` (`feat(login-and-logout): implement happy path`) — `AuthDao`, `AuthService`, `useAuth`, `LoginForm` organism, `SignInForm`/`SignOut` wiring, app screens (`login.tsx`, `settings.tsx`, `(app)/index.tsx`), barrels, and `libs/study-buddy/package.json`.

## Layering — Component → Hook → Service → DAO

- `libs/services/src/dao/auth.dao.ts:19-33` — `AuthDao` is an abstract class with static methods (`signInWithPassword`, `signOut`), calls only `getSupabase()`, no business logic, no React import. Compliant with Pattern A (`hooks-service-dao.mdc`).
- `libs/services/src/services/auth.service.ts:12-34` — `AuthService` validates (`isValidEmail`, `isNonEmptyPassword`) before ever calling `AuthDao`; no `fetch`/`getSupabase()` call of its own; no React import (`grep '^import'` on the file shows only the DAO import). Compliant.
- `libs/hooks/src/hooks/use-auth.ts:1-41` — `useAuth` imports only `AuthService` from `@helsoft/services` (never `AuthDao`); wraps it in `useState`/`useCallback`. Compliant — "hook wraps a service, not a DAO".
- `libs/components/src/organisms/login-form/login-form.tsx` — `LoginForm` is pure/presentational: props-only (`onSubmit`, `isSubmitting`, `onNavigateToSignUp`, `labels`), composed from existing atoms/molecules (`Button`, `ProgressIndicator`, `TextField`). No import of `@helsoft/hooks` or `@helsoft/services`. Correct organism placement (atomic-design.mdc) and correct layer boundary (component has zero knowledge of `useAuth`).
- `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx:1-32` and `libs/study-buddy/src/components/sign-out/sign-out.tsx:1-36` — the feature-wiring components call `useAuth()` (hook), never `AuthService`/`AuthDao` directly. Correct.
- `apps/app-study-buddy/src/app/(auth)/login.tsx`, `(app)/settings.tsx`, `(app)/index.tsx` — thin shells; each only imports and composes `SignInForm`/`SignOut`/`LanguageSettings` from `@helsoft/study-buddy` plus `ScreenContainer` from `@helsoft/components`. No business logic, no `@helsoft/hooks`/`@helsoft/services` import in any app screen touched by this feature (`grep -rln "@helsoft/services" apps/app-study-buddy/src` only hits the pre-existing `src/lib/supabase.ts` client-init file, untouched by this feature).
- No manual navigation added around session changes — `_layout.tsx`'s `Stack.Protected` guards (`apps/app-study-buddy/src/app/_layout.tsx:37-42`) are untouched, matching spec.md's "Open decisions" and avoiding the race the spec explicitly calls out.

Test-boundary check (confirms the layers are actually decoupled, not just nominally): `auth.dao.test.ts` mocks `getSupabase`; `auth.service.test.ts` mocks `AuthDao`; `use-auth.test.ts` mocks `@helsoft/services` (`AuthService`); `auth.integration.test.ts` mocks only the Supabase client's `auth.*` methods and exercises `useAuth`→`AuthService`→`AuthDao` and `useSession` for real. Each layer is tested against a mock of the layer directly beneath it — no layer skipping.

## DTO / raw-Supabase-type leakage

- `AuthDao.signInWithPassword` returns `SignInWithPasswordResult` (`libs/services/src/dao/auth.dao.ts:10-13`), which embeds raw `Session`/`User` from `@supabase/supabase-js`. `AuthService.signIn` (`auth.service.ts:21`) is typed to return the same `Promise<SignInWithPasswordResult>` — this mirrors the sanctioned pattern in `hooks-service-dao.mdc` (`ProfileService.getProfile` returning the same `ProfileDto` its DAO returns), so reusing the DAO-defined type at the Service boundary is not itself a violation.
- Checked whether this raw type actually escapes the DAO/Service pair into the Hook/Component layers: it does not. `useAuth.signIn` (`use-auth.ts:30-36`) `await`s `AuthService.signIn(...)` and returns `Promise<void>` — the resolved value is discarded before it reaches any hook consumer or component. `SignInForm` (`sign-in-form.tsx:19-21`) calls `void signIn(email, password)`. No raw Supabase type is exposed to `@helsoft/components` or `apps/app-study-buddy`. **No leak found.**

## Barrels

All new exports are wired through the correct `index.ts`:
- `libs/services/src/services/index.ts` → `export * from './auth.service';`
- `libs/hooks/src/hooks/index.ts` → `export * from './use-auth';`
- `libs/components/src/organisms/index.ts` → `export * from './login-form/login-form';`
- `libs/study-buddy/src/index.ts` → `export * from './components/sign-in-form/sign-in-form';` and `export * from './components/sign-out/sign-out';`
- `AuthDao` is intentionally **not** barreled (no `libs/services/src/dao/index.ts` exists, consistent with the pre-existing `locale-preference.dao.ts`) — this is what physically prevents any hook/component from importing the DAO through the package's public surface.

## Dependencies — `expo-router` in `@helsoft/study-buddy`

`libs/study-buddy/package.json:21,32` adds `expo-router: "*"` as a **peerDependency** and `expo-router: "~57.0.3"` as a **devDependency** (test/type-check only), used by `SignInForm`'s `router.push('/sign-up')` (`sign-in-form.tsx:15,23`). This is correctly scoped:
- It mirrors the existing pattern in the same `package.json` for `react`, `react-native`, `react-native-unistyles` (peer `"*"` + pinned dev version) — not a new pattern, just extended to a new peer.
- It is not a `dependencies` entry, so it won't be bundled a second time; at runtime it resolves to `app-study-buddy`'s own `expo-router` (already the app's routing framework, declared in `apps/app-study-buddy/package.json` as `"main": "expo-router/entry"`).
- `@helsoft/study-buddy` is explicitly the 1:1 feature lib for `app-study-buddy` (never intended to be shared across multiple apps), so a hard peer on the host app's router is consistent with `global.mdc`'s "feature lib pairs with its app" rule rather than a violation of it. `LoginForm` itself (the reusable `@helsoft/components` organism) stays router-agnostic — it takes `onNavigateToSignUp` as a plain callback prop, with no `expo-router` import. The router dependency is correctly pushed down to the app-specific wiring layer, not the shared component.
- `pnpm turbo run check-types --filter=@helsoft/study-buddy --filter=app-study-buddy` — green.

## Business logic placement

Confirmed no auth business logic in `apps/*`: validation lives in `AuthService` (`libs/services`), submission/loading state in `useAuth` (`libs/hooks`), confirmation-dialog/navigation wiring in `SignInForm`/`SignOut` (`libs/study-buddy`). App screens only compose.

## Findings

None. No blocker/major/minor architecture findings this round.

## Verdict

**APPROVED** — layering, barrels, DTO boundaries, and the one new dependency are all compliant with `hooks-service-dao.mdc` and `global.mdc`.

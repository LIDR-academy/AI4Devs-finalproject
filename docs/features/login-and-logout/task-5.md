---
id: task-5
title: Feature wiring — SignInForm, SignOut (with confirm dialog), screens & integration
slice: 1
scenarios: [s1, s2, s4, s7, s10, s11]
status: done
paths: [libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx, libs/study-buddy/src/components/sign-in-form/sign-in-form.test.tsx, libs/study-buddy/src/components/sign-out/sign-out.tsx, libs/study-buddy/src/components/sign-out/sign-out.test.tsx, libs/study-buddy/src/index.ts, "apps/app-study-buddy/src/app/(auth)/login.tsx", "apps/app-study-buddy/src/app/(app)/home.tsx", "apps/app-study-buddy/src/app/(app)/settings.tsx"]
---

## Goal
Wire the pieces into a working flow, keeping the app a thin shell (mirrors `LanguageSettings` → Settings screen):
- `SignInForm` (feature component in `@helsoft/study-buddy`): uses `useAuth()` + `useLocalization()`, feeds localized `labels`/`errorMessage` and `onSubmit`/`onNavigateToSignUp` into the presentational `LoginForm`. No navigation code — the root `Stack.Protected` guard reacts to the new session.
- `SignOut` (feature component in `@helsoft/study-buddy`): a `Button` wrapped in a confirmation `Dialog` (organism exists in `@helsoft/components`), wired to `useAuth().signOut`; dismissing the dialog keeps the session active (@s10), confirming it clears the session → guard returns the user to login.
- `(auth)/login.tsx`: replace the stub `Text` with `<SignInForm/>` inside `ScreenContainer`.
- `(app)/settings.tsx`: add `<SignOut/>` alongside `<LanguageSettings/>`.
- `(app)/home.tsx`: add `<SignOut/>` button so users can logout from home (@s11) with the same confirmation dialog.
- **Integration test**: hook→service→DAO with a mocked Supabase client — a valid sign-in resolves a session (@s2), sign-out clears it (@s4); assert the app routes by session (@s1 unauthenticated → login) and that persistence config is untouched (@s7 verification: `getSession()` restores the session on a fresh mount).

## Done criteria
- [ ] Scenario @s2 covered end-to-end (SignInForm submit → session established) via integration test with mocked Supabase.
- [ ] Scenario @s4 covered (SignOut → session cleared).
- [ ] Scenario @s10 covered: confirm dialog dismiss keeps session active.
- [ ] Scenario @s11 covered: LogOut button on Home screen shows the same confirm dialog and clears session when confirmed.
- [ ] Scenario @s1 covered: with no session, routing lands on the login screen (assert via `useSession`-driven guard behavior).
- [ ] Scenario @s7 covered: a persisted session is restored on startup without re-entering credentials (test around `useSession` + `getSession`; do **not** modify `initSupabase` config).
- [ ] Business logic lives in `libs/study-buddy` (feature components), not in `apps/*`; app screens only compose. Barrel `libs/study-buddy/src/index.ts` updated.
- [ ] `SignInForm`/`SignOut` have unit tests mocking `useAuth`.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [ ] No hardcoded strings — all copy via `useLocalization().t` (keys land fully in task-8; use the keys now).

## Notes
- **Do not** add manual `router.replace`/redirect — `apps/app-study-buddy/src/app/_layout.tsx` already guards routes on `useSession()`. Verify, don't rebuild (see `spec.md` "Context already in place").
- Logout placement confirmed: SignOut appears on **both Settings and Home** screens, with a **confirmation dialog** for safety (spec.md Open Decisions, approved).
- Expo SDK 57: consult https://docs.expo.dev/versions/v57.0.0/ before touching router/screen code (`apps/app-study-buddy/AGENTS.md`).

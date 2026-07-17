---
id: task-5
title: study-buddy AppChrome wiring (session, i18n, SignOut, breakpoint, nav)
slice: 3
scenarios: [s2, s5, s6, s7, s14, s17, s19]
status: done
paths:
  [
    libs/study-buddy/src/components/app-chrome/,
    libs/study-buddy/src/index.ts,
    libs/hooks/src/hooks/use-breakpoint.ts,
    libs/hooks/src/hooks/index.ts,
    libs/logging-in-out/src/organisms/sign-out/sign-out.tsx,
    libs/logging-in-out/src/organisms/sign-out/sign-out.types.ts,
    libs/logging-in-out/src/organisms/sign-out/use-sign-out.ts,
    libs/study-buddy/src/components/sign-out/sign-out.tsx,
    libs/study-buddy/src/components/sign-out/sign-out.types.ts,
  ]
---

## Goal
Feature wiring organism/template that composes DesktopBar / MobileBar / AccountMenu with `useSession`, `useLocalization`, router navigation (`/` , `/upload`, `/settings`), and the existing `SignOut` confirm flow → `useAuth().signOut`. **Owns the desktop/mobile switch** via the shared `useBreakpoint` hook (see below); the app shell (task-6) just mounts `<AppChrome>`. Passes i18n labels: `nav.myLessons`, `nav.newLesson`, `nav.settings`, `auth.logOut` (+ confirm keys via SignOut). Presentational components stay prop-driven.

### SignOut controlled mode (mechanism for the error-styled Sign-out row — spec.md Open decision)
AccountMenu's Sign-out row is a presentational error-styled menu item that fires `onSignOut()` (task-4) — it is **not** SignOut's outlined Button and it owns no dialog. To reuse the existing confirm dialog + `auth.logOut*` keys + `useAuth().signOut()` without duplicating them:
- Extend `SignOutView` (`@helsoft/logging-in-out`) + its `useSignOut` hook with an **optional controlled API**: `open?: boolean` + `onOpenChange?: (next: boolean) => void`. When `open` is provided, render **dialog-only** (suppress the default outlined-Button trigger); `useSignOut` derives `confirmOpen`/`setConfirmOpen` from the controlled props when present, else falls back to its own `useState` (today's uncontrolled behavior — **backward-compatible**, existing callers/story unchanged).
- Forward the same optional props through the study-buddy `SignOut` wrapper (keeps `useAuth().signOut` wiring).
- AppChrome holds a small `signOutOpen` state: AccountMenu `onSignOut` → open it; render `<SignOut open={signOutOpen} onOpenChange={setSignOutOpen} />` (dialog-only) as a sibling of the chrome.

### Breakpoint switch
- Add `useBreakpoint()` in `@helsoft/hooks` (`libs/hooks/src/hooks/use-breakpoint.ts`, exported via barrel): web `useWindowDimensions` width ≥768 → `desktop`, web &lt;768 → `mobile`; native (iOS/Android) → always `mobile`.
- AppChrome consumes it to render DesktopBar vs MobileBar+bottom bar. This is the single owner of the switch (@s19).

## Done criteria
- [ ] Scenarios @s2, @s5, @s6, @s7, @s14, @s17, @s19 covered by wiring tests (mock session + nav spies; mock platform/width for @s19)
- [ ] Layering: Component → Hook (`useSession`/`useAuth`/`useBreakpoint`) — no DAO from UI
- [ ] `useBreakpoint` unit-tested for all four @s19 rows (web ≥768, web &lt;768, ios, android)
- [ ] SignOut controlled mode: `open`/`onOpenChange` render dialog-only; absent = existing uncontrolled behavior still passes (no regression to Settings-header SignOut / existing tests+story)
- [ ] Sign out reuses existing SignOut confirm path; success clears session → login via existing guard
- [ ] No new locale keys; brand wordmark stays literal
- [ ] Related local state (menu open + signOut open + …) → `useReducer` if ≥3 fields (`state.mdc`)
- [ ] `pnpm lint` + `pnpm check-types` + targeted tests green

## Notes
- Pattern mirrors `SignOut` / `ApiKeySettings`: thin study-buddy wrapper around lib components.
- Active route derived from current path; Settings is **not** a primary tab active state.
- Bar content scenarios (@s1/@s9) are owned by the presentational bars (task-2); task-6 mounts + integration-verifies them.

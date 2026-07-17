---
id: task-4
title: AccountMenu organism + open/dismiss a11y
slice: 2
scenarios: [s5, s6, s7, s8, s10, s18]
status: done
paths:
  [
    libs/components/src/organisms/account-menu/,
    libs/components/src/organisms/index.ts,
    libs/components/tests/e2e/,
  ]
---

## Goal
Presentational account menu used by both desktop and mobile avatar triggers: identity header (label + email + initials avatar), **Settings**, **Sign out** (error-styled). **No Help & feedback.** Open/close supports outside dismiss, Escape (web), and close-after-action; keyboard focus + accessible menu semantics. Actions are plain callback props (`onSettings`, `onSignOut`) — no auth/router **and no confirm dialog** inside the organism. The error-styled Sign-out row is just a themed menu item that fires `onSignOut()` on press; the confirm dialog + `useAuth().signOut()` are owned by AppChrome (task-5) via the controlled `SignOut` (see task-5).

## Done criteria
- [ ] Scenarios @s5, @s6, @s7, @s8, @s10, @s18 covered (unit + stories + e2e)
- [ ] Same menu component for desktop + mobile triggers (@s10)
- [ ] Sign-out row visually error-styled via theme and fires the `onSignOut` prop on press; **no dialog here** — parent (task-5 AppChrome) opens the controlled `SignOut` confirm dialog
- [ ] Menu local open state → `useReducer` if ≥3 related fields (`state.mdc`)
- [ ] `pnpm lint` + `pnpm check-types` + targeted tests green
- [ ] No Help row; no new i18n keys inside the organism (labels via props)

## Notes
- Design SoT account menu composition from `Navigation menus.html`.
- Mobile avatar must open this same menu — shared organism, two triggers.

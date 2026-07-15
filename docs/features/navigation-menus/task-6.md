---
id: task-6
title: App shell mount + replace ad-hoc Links / header SignOut
slice: 3
scenarios: [s13, s16]
status: todo
paths:
  [
    apps/app-study-buddy/src/app/(app)/_layout.tsx,
    apps/app-study-buddy/src/app/(app)/index.tsx,
    apps/app-study-buddy/src/app/(app)/settings.tsx,
  ]
---

## Goal
Mount `<AppChrome>` in the signed-in `(app)` layout. **The desktop/mobile switch is owned by AppChrome via `useBreakpoint` (task-5)** — this task does not re-implement the breakpoint; it just mounts the chrome and integration-verifies both patterns render (web + native). Remove Home body `Link`s to Upload/Settings as primary CTAs; remove Settings `headerRight` SignOut so the account menu owns Settings + Sign out. Deep lesson/player/settings routes must not invent a fake primary-tab active item; Settings remains account-menu only.

## Done criteria
- [ ] Scenarios @s13, @s16 covered (layout/integration tests and/or documented web+native checks)
- [ ] Integration-verify the mounted chrome renders the desktop bar (web ≥768) and the mobile top+bottom bars (web &lt;768 / native) — @s1/@s9/@s19 owned by task-2 (bar content) + task-5 (switch); this task only checks they appear once mounted
- [ ] Redundant body Links / header-only SignOut removed or no longer primary path
- [ ] Avoid double headers: custom chrome owns primary chrome; Stack headers adjusted accordingly
- [ ] `pnpm lint` + `pnpm check-types` + targeted tests green

## Notes
- Breakpoint logic lives in `useBreakpoint` (`libs/hooks/src/hooks/use-breakpoint.ts`, task-5) — do **not** duplicate the `768` constant here.
- Keep `ApiKeyProvider` wrapping; do not regress Settings/Upload key status sharing.
- Lesson/player routes stay out of top-level NAV.

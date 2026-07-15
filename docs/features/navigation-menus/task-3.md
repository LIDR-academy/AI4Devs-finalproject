---
id: task-3
title: Initials avatar + session-identity helpers
slice: 2
scenarios: [s14]
status: done
paths:
  [
    libs/components/src/atoms/initials-avatar/,
    libs/components/src/atoms/index.ts,
    libs/study-buddy/src/helpers/session-identity.helpers.ts,
  ]
---

## Goal
Presentational initials-circle avatar (no photo upload) plus a pure helper that derives display label + initials from a Supabase session user (prefer name/metadata when present; else email-derived label + initials). No DAO; helper is unit-tested without React.

## Done criteria
- [ ] Scenario @s14 covered by helper unit tests + avatar component tests/stories
- [ ] Avatar is placeholder initials only — no image picker/upload API
- [ ] Accessible name for the avatar control when used as a menu trigger (prop-driven)
- [ ] Helper pure (no React/hooks); lives in study-buddy or a shared helpers path used by wiring
- [ ] `pnpm lint` + `pnpm check-types` + targeted tests green

## Notes
- Session shape from existing `useSession` / Supabase `Session` — do not invent profile tables.
- Email-only users: label = email (or local-part per helper rule — document in helper tests); initials from that string.

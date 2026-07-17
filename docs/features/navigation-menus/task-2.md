---
id: task-2
title: DesktopBar + MobileBar presentational organisms
slice: 1
scenarios: [s1, s2, s9, s11, s15, s18, s20]
status: done
paths:
  [
    libs/components/src/organisms/desktop-bar/,
    libs/components/src/organisms/mobile-bar/,
    libs/components/src/organisms/index.ts,
    libs/components/tests/e2e/,
  ]
---

## Goal
Presentational `DesktopBar` and `MobileBar` matching design SoT: desktop = brand lockup (“AI Study Buddy”) + Home/New lesson slots + right cluster (alerts placeholder + avatar slot); mobile = top app bar (compact logo, screen-title slot, avatar slot) + bottom bar (Home/New lesson) with safe-area padding. Compose `NavItem` (task-1). All labels/handlers/slots via props — no `useSession`/router.

## Done criteria
- [ ] Scenarios @s1, @s2, @s9, @s11, @s15, @s18, @s20 covered (unit + Storybook + Playwright e2e per skill)
- [ ] Alerts control is visual-only (icon + optional badge); not pressable / no feed
- [ ] Bottom bar preserves safe-area inset
- [ ] Brand wordmark literal “AI Study Buddy” in desktop lockup
- [ ] Stories cover Content chrome + indicator variants; e2e asserts structure + non-functional alerts
- [ ] `pnpm lint` + `pnpm check-types` + targeted tests green
- [ ] Tokens only; no hardcoded English product chrome beyond the brand name

## Notes
- Reuse atoms: `Icon`, `IconButton`, `Badge` as needed for the placeholder alerts look.
- Avatar is a **slot** here — identity UI lands in Slice 2; wiring in Slice 3.
- Primary destinations props map to `/` and `/upload` at wiring time (assert navigation contract in unit via handler spies until app wiring).

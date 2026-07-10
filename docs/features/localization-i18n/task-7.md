---
id: task-7
title: Wire persistence + precedence into the provider/hook
slice: 2
scenarios: [s6, s7, s8, s12]
status: done
paths:
  - libs/localization/src/provider/localization-provider.tsx
  - libs/localization/src/hooks/use-localization.ts
  - libs/localization/package.json
---

## Goal
Connect the provider/hook to `LocalePreferenceService` so language choice is durable and deterministic. On startup the provider resolves the initial locale with the correct precedence: **saved preference → device detection → English**. `setLocale` changes the active language immediately AND persists the choice; a failed save applies in-memory and logs (no throw, no blocking UI). A failed read degrades to detection/English.

## Done criteria
- [ ] Scenario(s) @s6, @s7, @s8, @s12 covered: immediate switch (@s6), persisted then relaunched (@s7), saved preference beats device locale (@s8), read failure degrades gracefully (@s12)
- [ ] Provider precedence on init: `LocalePreferenceService.getStoredLocale()` first; if `null`, use `resolveInitialLocale(deviceLocale)` from task-3
- [ ] `setLocale` calls `i18n.changeLanguage` (immediate UI update) and `LocalePreferenceService.setStoredLocale`; a persistence rejection is caught, logged, and does not throw
- [ ] The caught-save path carries a `TODO(FO1)` comment referencing spec.md → Follow-on FO1 (robust failed-save handling), so the interim behavior is tracked (satisfies the "no TODO without a reference" review rule)
- [ ] Integration test across provider → hook → service → DAO with a mocked storage (relaunch simulated by remounting with a pre-seeded store)
- [ ] `@helsoft/localization` gains a dependency on `@helsoft/services`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Dep direction stays acyclic: `localization → services → types`; `services` never imports `localization` (R3).
- Open decision: failed save applies in-memory for the session; surface the logged failure but do not block the switch. Human-approved at the gate with a required `TODO(FO1)` marker (see spec.md → Follow-on FO1).

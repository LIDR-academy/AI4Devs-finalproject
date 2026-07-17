---
id: task-7
title: Accessibility — roles, states, announce, touch targets
slice: 3
scenarios: [s10]
status: done
paths: [libs/activities/src/organisms/flashcard/flashcard.tsx, libs/activities/src/organisms/flashcard/use-flashcard.ts, libs/activities/src/organisms/flashcard/flashcard.test.tsx]
---

## Goal
Make the reveal → self-mark flow accessible, mirroring the shipped organisms' a11y pattern.

- Reveal + both self-mark controls: `accessibilityRole="button"` + accessible labels (from `t()`).
- Revealed vs hidden and locked self-mark conveyed via `accessibilityState` (e.g. `selected`/`checked`/`disabled`), **not color alone**; the confirmed mark also shown by text + `Icon`.
- On reveal, announce the newly-visible answer to assistive tech via the hook's announce effect (live region / `AccessibilityInfo.announceForAccessibility`, guarded `Platform.OS !== 'android'`).
- Interactive targets meet the minimum touch-target size (`theme.layout.touchTarget`).

## Done criteria
- [x] @s10: reveal + self-mark controls expose button role + accessible label
- [x] @s10: revealed and locked-self-mark states conveyed via accessibility state, not color alone
- [x] @s10: revealed answer announced to assistive technology
- [x] @s10: interactive targets meet the minimum touch-target size (theme token, not a magic number)
- [x] Assertions in `flashcard.test.tsx` (RN Testing Library) + a11y checks reflected in the Playwright e2e (task-9)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [x] No hardcoded colors/dimensions

## Notes
Announce effect lives in `use-flashcard.ts` (effect = hook per `component-split.mdc`); a11y attrs live in `flashcard.tsx`. Mirrors matching/fill-in-the-blank announce + `accessibilityState` usage.

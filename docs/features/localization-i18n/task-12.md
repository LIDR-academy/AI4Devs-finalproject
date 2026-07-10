---
id: task-12
title: LanguageSelector a11y hardening + Storybook stories + web e2e
slice: 3
scenarios: [s5, s13, s15]
status: todo
paths:
  - libs/components/src/molecules/language-selector/language-selector.tsx
  - libs/components/src/molecules/language-selector/language-selector.stories.tsx
  - libs/components/src/molecules/language-selector/language-selector.test.tsx
  - libs/components/tests/e2e/molecules/language-selector.e2e.js
---

## Goal
Finish the language selector to spec: full accessibility (accessible role + label per option, active option announced as selected, active state conveyed by more than color), Storybook stories covering the four languages and the active/interactive states, and a Playwright e2e (via the `storybook-e2e-tests` skill) that renders and selects on the web target — completing the cross-platform proof (@s15 web) alongside task-4's native coverage.

## Done criteria
- [ ] Scenario(s) @s13 (a11y) covered by unit-test assertions on roles/labels/selected state + non-color indicator; @s5 covered by a story per locale + interactive story; @s15 web leg covered by the Playwright e2e
- [ ] Each option exposes `accessibilityRole` + `accessibilityLabel`; active option carries `accessibilityState={{ selected: true }}`; contrast + touch-target sizing honor WCAG (≥4.5:1 text, ≥44pt targets) via tokens
- [ ] `language-selector.stories.tsx` follows the patterns in `libs/lib-with-storybook/src/stories`; states: each locale active, interactive, disabled
- [ ] e2e placed under `libs/components/tests/e2e/…` mirroring `src/` (per the skill), not co-located
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` + `pnpm --filter @helsoft/components test:e2e` green
- [ ] No hardcoded strings/colors/dimensions (story demo labels are endonyms, acceptable in stories)

## Notes
- Builds on task-8's presentational component; this task adds the a11y contract, stories, and e2e that make it design- and mutation-testable.
- @s15 is proven on both environments: native/RN via jest-expo (task-4) and web via this Storybook Playwright e2e.

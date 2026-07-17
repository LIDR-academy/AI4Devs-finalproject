---
id: task-9
title: Accessibility pass + Playwright e2e for the login flow
slice: 3
scenarios: [s12]
status: done
paths: [libs/components/src/organisms/login-form/login-form.tsx, libs/components/src/organisms/login-form/login-form.test.tsx, libs/components/tests/e2e/organisms/login-form/login-form.e2e.js]
---

## Goal
Finish WCAG 2.2 AA compliance on `LoginForm` and add the Storybook-backed Playwright e2e:
- Accessible labels on both fields; the submit control exposes a button role (the `Button` atom already sets `accessibilityRole="button"`).
- The auth error is announced to assistive technology (live region / appropriate role) and is not conveyed by color alone; inline field errors are programmatically associated with their field.
- Touch targets ≥ 44pt; sensible focus/reading order (email → password → submit → sign-up); scaled-font friendly.
- Playwright e2e (`storybook-e2e-tests` skill) driving the rendered stories: story loads, Content renders both fields + submit, Loading disables submit, Error banner renders. Use text locators through the preview iframe (RN-web → no native roles).

## Done criteria
- [x] Scenario @s12 covered by `login-form.test.tsx`: accessible labels present, submit has a button role, error node is announced (role/live-region asserted).
- [x] e2e file at `libs/components/tests/e2e/organisms/login-form/login-form.e2e.js` per the `storybook-e2e-tests` skill (mirrors `src/` path; CommonJS; through `iframe[title="storybook-preview-iframe"]`; text locators). Derive the story URL slug from the `.stories.tsx` `title`/exports.
- [x] No color-only signaling for errors (already structural — `TextField`'s `error` flag is only ever set alongside its `supportingText`/`emailError`/`passwordError` string); touch targets ≥ 44pt verified against tokens (`Button`'s existing `HIT_SLOP`/`minHeight` from Slice-1 Round-1, `TextField`'s existing 56px `minHeight`).
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green; e2e run non-blocking (`--reporter=list`).

## Notes
- Rubric: `.agents/rules/review-standards.md` §5 (accessibility). Model the e2e on `libs/components/tests/e2e/molecules/text-field/text-field.e2e.js` and `.../language-selector/language-selector.e2e.js`.
- The e2e also exercises @s2/@s5/@s6 visually (happy render + error banner) as the cross-component check the TDD rule asks for per slice.

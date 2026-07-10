---
id: task-14
title: Accessibility pass + Playwright e2e for the upload panel
slice: 3
scenarios: [s16]
status: todo
paths: [libs/components/src/organisms/pdf-upload-panel/, libs/components/tests/e2e/]
---

## Goal
Make the upload flow accessible (WCAG 2.2 AA) and lock it in with a Storybook-driven Playwright e2e. Roles/labels on the picker + upload controls, loading progress announced, errors announced to assistive tech.

## Done criteria
- [ ] Accessible label/role on the "choose a PDF" affordance and the upload/continue control (button role).
- [ ] Loading progress announced (e.g. `ProgressIndicator` with an accessible busy/progress semantics) and error state announced to assistive technology.
- [ ] No color-only signaling for the error state; touch targets ≥ 44pt/48dp; constraints hint readable with scaled fonts.
- [ ] `pdf-upload-panel.test.tsx` asserts roles/labels + progress/error announcement (@s16).
- [ ] A Playwright e2e via the `storybook-e2e-tests` skill under `libs/components/tests/e2e/` (mirroring `src/`) exercises the rendered states + retry interaction.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` (+ `test:e2e`) green.

## Notes
- Follow `.agents/skills/storybook-e2e-tests/` for the `.e2e.js` location/convention (mirrors `login-form`'s task-9).
- Reuse existing accessible atoms where possible rather than re-implementing a11y.

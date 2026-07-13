---
id: task-15
title: a11y pass + Playwright e2e
slice: 3
scenarios: [s19]
status: todo
paths:
  - libs/components/src/organisms/lesson-generation-panel/
  - libs/components/src/molecules/generation-progress/
  - libs/components/tests/e2e/
---

## Goal
Accessibility pass + Storybook Playwright e2e for the generation UI (per the `storybook-e2e-tests` skill, mirroring `pdf-upload-panel` / `api-key-form`).

## a11y (@s19)
- Composition picker exposes `radiogroup` + per-option `radio` roles with `accessibilityState.selected` (inherited from `RadioGroup` — verify) and an accessible group label.
- Multi-step progress announces the current step to assistive tech (polite live region); the Generate control has a clear accessible name; disabled state is conveyed.
- The Error state is announced (assertive live region / `role="alert"`).

## e2e
- Composition selection (default `both`, switch to each option).
- Generate gated until a document is available (@s16), progress steps advance (@s14), Content ready state (@s17), and an Error state with recovery (@s15) — driven via the panel's Storybook stories with mocked hook state.

## Done criteria
- [ ] Scenario @s19 covered by RTL role/label/live-region assertions + Playwright e2e green
- [ ] No contrast/role regressions (design + a11y reviewers' rubric)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` + the e2e suite green

## Notes
- The Deno function is not e2e-tested here (outside the harness, risks.md R2) — UI e2e drives the panel via story-configured hook state.

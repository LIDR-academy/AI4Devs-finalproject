---
id: task-8
title: GenerationProgress molecule (labeled multi-step)
slice: 1
scenarios: [s14]
status: todo
paths:
  - libs/components/src/molecules/generation-progress/
  - libs/components/src/molecules/index.ts
---

## Goal
A presentational molecule rendering the multi-step progress the human chose (decision #4): an ordered list of labeled steps (Reading content → Generating slides → Attaching images) with each step marked upcoming / current / done. Stateless — driven by props (`steps: { label: string }[]`, `currentIndex: number`); labels are injected by the wiring layer (no i18n inside the presentational component, mirroring `PdfUploadPanel`).

## Done criteria
- [ ] Scenario @s14 covered by `generation-progress.test.tsx` (renders steps; reflects current/done) + a Storybook story (`generation-progress.stories.tsx`) with states across the three steps
- [ ] Follows atomic-design (molecule composed from atoms — reuse `ProgressIndicator`/`Icon` where sensible) and `component-split.mdc` (split only if it grows real logic; a stepper mapping is a pure helper)
- [ ] a11y: the current step is announced via a polite live region (fuller a11y pass in task-15)
- [ ] No hardcoded strings (labels are props), colors, or dimensions (theme tokens only)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Not a bare spinner and not a percentage bar (explicitly rejected by the human). It is discrete labeled steps.
- "Attaching images" is still shown when a deck has no images — it simply completes immediately.

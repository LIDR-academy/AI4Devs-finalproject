---
id: task-8
title: GenerationProgress molecule (labeled multi-step)
slice: 1
scenarios: [s14]
status: done
paths:
  - libs/components/src/molecules/generation-progress/
  - libs/components/src/molecules/index.ts
---

## Goal
A presentational molecule rendering the multi-step progress the human chose (decision #4): an ordered list of labeled steps (Reading content → Generating slides → Attaching images) with each step marked upcoming / current / done. Stateless — driven by props (`steps: { label: string }[]`, `currentIndex: number`); labels are injected by the wiring layer (no i18n inside the presentational component, mirroring `PdfUploadPanel`).

## Done criteria
- [x] Scenario @s14 covered by `generation-progress.test.tsx` (renders steps; reflects current/done) + a Storybook story (`generation-progress.stories.tsx`) with states across the three steps
- [x] Follows atomic-design (molecule composed from atoms — reuses `Icon` for the done indicator; `ProgressIndicator` (spinner/bar) was deliberately **not** reused since the whole point of this molecule is the opposite of a spinner/bar) and `component-split.mdc` (split out `generation-progress.helpers.ts` for the pure step→status mapping + `generation-progress.types.ts` for Props)
- [x] a11y: the current step is announced via a polite live region (fuller a11y pass in task-15)
- [x] No hardcoded strings (labels are props), colors, or dimensions (theme tokens only)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Not a bare spinner and not a percentage bar (explicitly rejected by the human). It is discrete labeled steps.
- "Attaching images" is still shown when a deck has no images — it simply completes immediately.

---
id: task-9
title: LessonGenerationPanel organism (picker + Generate + Loading + Content)
slice: 1
scenarios: [s1, s2, s14, s16, s17]
status: todo
paths:
  - libs/components/src/organisms/lesson-generation-panel/
  - libs/components/src/organisms/index.ts
---

## Goal
The presentational organism for configuring + triggering generation, Slice-1 states Empty / Loading / Content (Error is task-13). Composes the existing `RadioGroup` molecule for the composition picker and the `GenerationProgress` molecule (task-8). Stateless — driven by props + `useLocalization` for chrome copy (`generation.*`); injected strings (error messages, step labels) come from the wiring layer, mirroring `PdfUploadPanel`.

## Behavior
- **Empty (@s1,@s2,@s16):** composition picker always visible, `both` pre-selected; `onCompositionChange` prop; **Generate disabled** until `canGenerate` (an extracted document is available); no progress, no error.
- **Loading (@s14):** `GenerationProgress` with the current step; picker + Generate disabled.
- **Content (@s17):** deck-ready summary (slide count + composition) + primary CTA `onOpenInPlayer`.

Follow `component-split.mdc`: `lesson-generation-panel.tsx` (layout + handlers), `.types.ts` (Props), a pure `.helpers.ts` for any state→label mapping, `use-*.ts` only if real derived state emerges, `.stories.tsx` for all states.

## Done criteria
- [ ] Scenarios @s1,@s2,@s14,@s16,@s17 covered by `lesson-generation-panel.test.tsx` + Storybook stories for each state
- [ ] Composition picker uses `RadioGroup` (radiogroup/radio roles inherited; fuller a11y in task-15) with `both` default and the three options
- [ ] Generate is disabled unless `canGenerate` (@s16)
- [ ] No hardcoded strings/colors/dimensions (theme tokens + `generation.*` keys / injected props only)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Option labels/composition values map to `LessonComposition`; the picker's `value`/`onChange` are `string` (RadioGroup contract) — the wiring narrows to `LessonComposition`.

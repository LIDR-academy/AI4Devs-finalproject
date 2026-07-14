---
id: task-10
title: LessonGeneration additive onGenerated? prop (fires on generation success)
slice: 3
scenarios: [s9]
status: done
paths: [libs/study-buddy/src/components/lesson-generation/lesson-generation.tsx, libs/study-buddy/src/components/lesson-generation/lesson-generation.types.ts, libs/study-buddy/src/components/lesson-generation/lesson-generation.test.tsx]
---

## Goal
Add an additive, optional `onGenerated?: () => void` prop to `LessonGeneration`, fired once when
generation transitions to success (the Content/ready state — same edge the "open in player" CTA
uses). The upload screen uses it to refetch the PDF list so the just-generated row flips to "lesson
ready" (@s9). Backward-compatible: existing callers that omit it are unaffected (mirrors R2's
additive `onExtracted` prop, decision #9).

## Done criteria
- [x] Scenario(s) {s9} wiring-side covered: `onGenerated` fires exactly once on success, not on error/loading
- [x] Prop is optional; no behavior change when omitted (existing tests still pass)
- [x] Fires on the success transition only (guard against repeat fires on re-render)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
Only edit to `LessonGeneration`. Keep success detection consistent with `handleOpenInPlayer`'s
`result` gate.

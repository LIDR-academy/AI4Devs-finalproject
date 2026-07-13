---
id: task-7
title: useLessonGeneration hook (state + progress stepper)
slice: 1
scenarios: [s14]
status: done
paths:
  - libs/hooks/src/hooks/use-lesson-generation.ts
  - libs/hooks/src/hooks/use-lesson-generation.types.ts
  - libs/hooks/src/hooks/index.ts
---

## Goal
React integration wrapping `LessonGenerationService` (never the DAO). Plain-`useState` one-shot mutation hook (mirrors `useApiKey`/`usePdfExtraction`; tanstack-query still not installed). Exposes `stage` (`idle | generating | content | error`), `currentStep` (`GenerationProgressStep`), `result` (`GeneratedLesson | undefined`), `error` (`GenerationErrorCode | undefined`), and `generate(request)` (+ `retry()` in task-13).

## Progress stepper (@s14)
While the single `generate` call is in flight, advance `currentStep` through the fixed ordered phases `reading → generating → attaching` (spec.md "Progress model"), settling to `content`/`error` on resolve. The step order mirrors the real server pipeline; the contract (ordered steps + current) is stable so a future server-driven upgrade is non-breaking.

## Done criteria
- [x] Scenario @s14 covered by `use-lesson-generation.test.ts` (mock the service; assert the step sequence + terminal states)
- [x] Business logic stays in the service; only React state/effects here (per `hooks-service-dao.mdc`)
- [x] Return shape typed in `use-lesson-generation.types.ts` (exported), not the impl file
- [x] Exported through the hooks barrel
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Keep the stepper cadence deterministic/injectable for tests (no real timers leaking) — e.g. advance on awaited phase boundaries or an injectable clock.

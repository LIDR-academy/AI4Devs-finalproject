---
id: task-10
title: Completion + save-failure i18n keys across en/es/pt/de + coverage; wire labels
slice: 3
scenarios: [s12]
status: todo
paths:
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
  - libs/localization/src/resources/pt.ts
  - libs/localization/src/resources/de.ts
  - libs/study-buddy/src/components/lesson-results/lesson-results.tsx
  - libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx
---

## Goal
Add the remaining results copy to the `results` namespace in all four locale bundles and wire it through `LessonResults` into `ResultsSummary.labels`, then confirm full parity/coverage. New keys (English base — refine wording as needed):
- `results.completeHeadline` = "Lesson complete"
- `results.completeBody` = "You've reached the end of this lesson."
- `results.saveFailed` = "Couldn't save this attempt"
- `results.retrySave` = "Try again"

Already added earlier: `results.score`/`results.scorePercent` (task-7). Already existed: `results.summary`, `results.retake` ("Retake activities"), `results.backHome` ("Back to my lessons").

## Done criteria
- [ ] @s12 — the four new keys exist in `en`, `es`, `pt`, and `de`, key-aligned (the `migration-coverage` parity test stays green); the `TranslationResource` type still compiles.
- [ ] `LessonResults` sources **every** `ResultsSummary` label (score, percent, completion, save-failure, actions) from `useLocalization().t(...)` — no hardcoded results copy remains anywhere in the feature.
- [ ] `lesson-results.test.tsx` verifies the completion + save-failure labels are pulled from translation keys (not literals).
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- `en` is the authoritative base + runtime fallback; a missing non-`en` key falls back rather than crashing.
- Non-`en` copy quality is out of code scope (flag for a native-speaker pass), consistent with the localization feature's precedent.

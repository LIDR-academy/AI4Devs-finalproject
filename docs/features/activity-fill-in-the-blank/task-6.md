---
id: task-6
title: i18n — activity.fillInTheBlank.* keys across en/es/pt/de + wire labels
slice: 3
scenarios: [s13]
status: done
paths: [libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts, libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.tsx]
---

## Goal
Add key-aligned `activity.fillInTheBlank` block to all four locale bundles: `submit`, `correct`, `incorrect`, `explanationHeading`, `unavailable`, `blankInput`. Wire `FillInTheBlankActivity` to resolve `labels` via `t('activity.fillInTheBlank.*')`, replacing task-4 placeholders.

## Done criteria
- [x] `@s13`: all chrome from active bundle; no hardcoded chrome in organism/wrapper
- [x] Four bundles key-aligned (`TranslationResource`)
- [x] Localization coverage test (if present) passes
- [x] `pnpm lint` + `pnpm check-types` + localization/study-buddy tests green
- [x] No hardcoded user-facing strings

## Notes
Follow `activity.mcq.*` / `activity.matching.*`. Prompt/accepted answers/explanation body are content, not translated.

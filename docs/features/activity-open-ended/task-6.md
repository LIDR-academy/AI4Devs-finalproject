---
id: task-6
title: i18n — activity.openEnded.* keys across en/es/pt/de + wire labels
slice: 3
scenarios: [s8]
status: done
paths: [libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts, libs/study-buddy/src/components/open-ended-activity/open-ended-activity.tsx]
---

## Goal
Add key-aligned `activity.openEnded` block to all four locale bundles: `submit`, `yourAnswer`, `modelAnswer`, `explanationHeading`, `unavailable`, `answerInput`. Wire `OpenEndedActivity` to resolve `labels` via `t('activity.openEnded.*')`, replacing task-4 placeholders.

## Done criteria
- [x] `@s8`: all chrome from active bundle; no hardcoded chrome in organism/wrapper
- [x] Four bundles key-aligned (`TranslationResource`)
- [x] Localization coverage test (if present) passes
- [x] `pnpm lint` + `pnpm check-types` + localization/study-buddy tests green
- [x] No hardcoded user-facing strings

## Notes
Follow `activity.mcq.*` / `activity.matching.*` / `activity.fillInTheBlank.*`. Prompt / modelAnswer / explanation body are content, not translated.

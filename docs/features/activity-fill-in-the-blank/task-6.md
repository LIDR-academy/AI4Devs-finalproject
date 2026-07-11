---
id: task-6
title: i18n — activity.fillInTheBlank.* keys across en/es/pt/de + wire labels
slice: 3
scenarios: [s13]
status: todo
paths: [libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts, libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.tsx]
---

## Goal
Add key-aligned `activity.fillInTheBlank` block to all four locale bundles: `submit`, `correct`, `incorrect`, `explanationHeading`, `unavailable`, `blankInput`. Wire `FillInTheBlankActivity` to resolve `labels` via `t('activity.fillInTheBlank.*')`, replacing task-4 placeholders.

## Done criteria
- [ ] `@s13`: all chrome from active bundle; no hardcoded chrome in organism/wrapper
- [ ] Four bundles key-aligned (`TranslationResource`)
- [ ] Localization coverage test (if present) passes
- [ ] `pnpm lint` + `pnpm check-types` + localization/study-buddy tests green
- [ ] No hardcoded user-facing strings

## Notes
Follow `activity.mcq.*` / `activity.matching.*`. Prompt/accepted answers/explanation body are content, not translated.

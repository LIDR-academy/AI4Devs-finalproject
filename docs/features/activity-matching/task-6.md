---
id: task-6
title: i18n — activity.matching.* keys across en/es/pt/de + wire labels
slice: 3
scenarios: [s16]
status: done
paths: [libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts, libs/study-buddy/src/components/matching-activity/matching-activity.tsx]
---

## Goal
Add a key-aligned `activity.matching` block to all four locale bundles (`en` authoritative, then `es`/`pt`/`de`): `submit`, `correct`, `incorrect`, `correctPair`, `incorrectPair`, `explanationHeading`, `summary` (interpolated `{{correct}}`/`{{total}}`), `unavailable`. Wire `MatchingActivity` to resolve `labels` and the `summary` string via `t('activity.matching.*', …)`, replacing any placeholders from task-4.

## Done criteria
- [x] Scenario `@s16` covered: all matching chrome renders from the active bundle; no hardcoded chrome strings in organism or wrapper
- [x] All four bundles stay key-aligned (compiler enforces via `TranslationResource`); `summary` interpolation works
- [x] Localization coverage test (if present) passes for the new keys
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` (localization + study-buddy) green
- [x] No hardcoded user-facing strings

## Notes
Follows the existing `activity.mcq.*` pattern in `libs/localization/src/resources/*`. Item labels + explanation body are AI-generated content, not translated.

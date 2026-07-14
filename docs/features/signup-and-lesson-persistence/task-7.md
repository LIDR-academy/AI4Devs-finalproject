---
id: task-7
title: Persist-fail retry wired through generation + a11y/i18n polish
slice: 3
scenarios: [s2, s15, s16]
status: todo
paths: [libs/study-buddy/src/components/lesson-generation/lesson-generation.helpers.ts, libs/hooks/src/hooks/use-lesson-generation.ts, libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts]
---

## Goal
Wire the new `persist_failed` code (task-2) through the existing generation error contract so a
persist failure surfaces a **retry** affordance and never opens an in-memory-only player (@s2):
extend `GENERATION_ERROR_KEYS` / `GENERATION_ERROR_RECOVERY` / `GENERATION_ERROR_ACTION_LABEL_KEYS`
in `lesson-generation.helpers.ts` (message + `recovery: 'retry'`), extend `useLessonGeneration`'s
known-code guard, and add `generation.error.persistFailed` copy to all four locale bundles. Confirm
the player CTA only fires for a real persisted `lessonId`. Final a11y/i18n sweep across the
persistence UI (list, delete, states).

## Done criteria
- [ ] Scenario(s) {s2, s15, s16} covered by `lesson-generation.helpers.test.ts` + `use-lesson-generation.test.ts` + i18n coverage
- [ ] `persist_failed` → localized message + retry action; retry re-runs generation+persist
- [ ] Player opens only for a persisted `lessonId` (no in-memory path) — asserted in wiring test
- [ ] `generation.error.persistFailed` present in en/es/pt/de; a11y announcements verified
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Reuses the shipped generation Error state + recovery-dispatch (`lesson-generation.tsx`) — this task
  only adds one code + copy, keeping the change minimal (mirrors task-13 of ai-lesson-generation).

---
id: task-5
title: SavedLessons wiring + Home screen integration + reopen nav + i18n
slice: 2
scenarios: [s4, s5, s6, s7, s13, s14, s15]
status: done
paths: [libs/study-buddy/src/components/saved-lessons/, apps/app-study-buddy/src/app/(app)/index.tsx, libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts]
---

## Goal
`SavedLessons` wiring component in `@helsoft/study-buddy`: calls `useLessons`, formats each lesson's
created date + count/empty/error copy via `t(...)`, maps hook states → `LessonList` props, and on tap
navigates to the lesson entry (`/lesson/[id]`) so reopen uses the existing player/slide flow from the
top (@s6 — insert-only attempts, no resume). Replace the Home screen stub
(`(app)/index.tsx`, currently `lessons.count { count: 0 }`) with `<SavedLessons />` (thin shell). Add
`home.*` list/empty/error/retry + date-format strings to all four locale bundles (parity-typed) and
extend the localization coverage test.

## Done criteria
- [ ] Scenario(s) {s4, s5, s6, s7, s13, s14, s15} covered by `saved-lessons.test.tsx` + integration + localization coverage test (en/es/pt/de)
- [ ] Home screen renders real saved lessons via `SavedLessons`; stub `count: 0` removed
- [ ] Reopen navigates to `/lesson/[id]` (existing route), starting from the top
- [ ] All new user-facing strings from `t()`; keys present in en/es/pt/de
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- App screen stays a thin shell (wiring only) — business/formatting lives in `SavedLessons`.
- Date formatting: use the app's locale-aware formatting (mirror how other screens format dates);
  `LessonList` receives the finished label.

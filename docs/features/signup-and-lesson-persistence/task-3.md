---
id: task-3
title: Types + LessonsDao + LessonsService + useLessons (list + get)
slice: 1
scenarios: [s4, s7, s11]
status: todo
paths: [libs/types/src/lesson-summary.ts, libs/supabase-services/src/dao/lessons.dao.ts, libs/supabase-services/src/services/lessons.service.ts, libs/hooks/src/hooks/use-lessons.ts, libs/hooks/src/hooks/use-lessons.types.ts]
---

## Goal
Build the read path bottom-up (`hooks-service-dao.mdc`): `LessonsDao` (Supabase) with
`getLessons()` (own rows, newest first) and `getLessonById(id)`, mapping snake_case rows →
`@helsoft/types` shapes (add `LessonSummary = { id; title; createdAt }` for the list; full `Lesson`
already exists). `LessonsService` adds validation + normalizes errors. `useLessons` (React) wraps the
service exposing `{ lessons, isLoading, error, refetch }`. RLS on the table (task-1) does the
per-user isolation; the DAO never filters by client-supplied user id. Export through each barrel.

## Done criteria
- [ ] Scenario(s) {s4, s7, s11} covered by `lessons.dao.test.ts` + `lessons.service.test.ts` + `use-lessons.test.ts`
- [ ] Newest-first ordering + no pagination (fetch all own rows) enforced in the DAO query
- [ ] Layering respected: hook→service→DAO; DTOs mapped in the DAO; no React in service/DAO
- [ ] `LessonSummary` added to `@helsoft/types` (one type per file) + barrel export
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Hook uses plain `useState`/`useEffect` + `refetch` (NOT tanstack-query — deferred, matching
  `useLessonAttempt`/`useAuth`/`useApiKey` precedent; see spec.md Open decisions + risks.md).
- List needs only `LessonSummary` (id/title/createdAt); `getLessonById` returns full `Lesson` for
  the player entry (reopen, task-5). Loading/error hook states feed task-4's UI.

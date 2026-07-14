---
id: task-1
title: Load full lesson (with slides) by id — DAO → Service → Hook
slice: 1
scenarios: [s17]
status: todo
paths:
  - libs/supabase-services/src/dao/lessons.dao.ts
  - libs/supabase-services/src/services/lessons.service.ts
  - libs/hooks/src/hooks/use-lesson.ts
  - libs/hooks/src/hooks/use-lesson.reducer.ts
  - libs/hooks/src/hooks/use-lesson.types.ts
  - libs/hooks/src/hooks/index.ts
---

## Goal
Add a full-`Lesson` (with `slides`) fetch by id. `LessonsDao.getLessonById` selects `id, title, slides, created_at, user_id` from `lessons` (the `slides` JSON column persisted at generation time) and maps to `Lesson`. `LessonsService.getLesson(id)` validates id + normalizes failures. `useLesson(id)` wraps the service via a reducer exposing Loading / Content / Empty / Error + a `refetch` (mirrors `use-lessons`). This is the in-memory source the player renders and, on the results slide, scores.

## Done criteria
- [ ] Scenario {s17} covered (loading state exposed by the hook); Content/Empty/Error branches + `refetch` present for downstream tasks (s1/s15/s16)
- [ ] `getLessonById` maps snake_case row → `Lesson`; RLS scopes ownership — never filters by a client-supplied user id
- [ ] Service rejects empty/blank id; DAO failure normalized to a thrown `Error`
- [ ] Layering respected (Component→Hook→Service→DAO); ≥3 related fields → `useReducer` per `state.mdc`
- [ ] `*.dao.test.ts` (mock `getSupabase`), `*.service.test.ts` (mock DAO), `use-lesson.test.ts` (mock service)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- `slides` is stored as JSON on the `lessons` row (see `lesson-generation.persist.ts`) — no separate `slides` table to join.
- Empty = a loaded lesson whose `slides` is `[]` (drives s15 in task-8; no deck / no results slide is shown).

---
id: task-6
title: Delete a lesson (DAO+service+hook) + confirm dialog + i18n
slice: 3
scenarios: [s8, s9, s12, s15, s16]
status: todo
paths: [libs/supabase-services/src/dao/lessons.dao.ts, libs/supabase-services/src/services/lessons.service.ts, libs/hooks/src/hooks/use-lessons.ts, libs/components/src/organisms/lesson-list/, libs/study-buddy/src/components/saved-lessons/, libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts]
---

## Goal
Add delete end-to-end: `LessonsDao.deleteLesson(id)` (RLS scopes to own rows — @s12),
`LessonsService.deleteLesson` (validation + error normalize), `useLessons` gains
`deleteLesson` + refetch/optimistic update. Surface a delete affordance on each `LessonListItem` that
opens the shared `Dialog` for confirmation (reuse the logout/remove-key confirm pattern): confirm →
delete + remove from Home (@s8); dismiss → no change (@s9). Add `home.delete.*` confirm/action/cancel
copy to all four locale bundles + coverage test. Rename stays out of scope.

## Done criteria
- [ ] Scenario(s) {s8, s9, s12, s15, s16} covered by `lessons.dao`/`service` delete tests + `use-lessons.test.ts` + `lesson-list`/`saved-lessons` confirm-dialog tests
- [ ] Confirm deletes + removes from list; dismiss keeps the lesson
- [ ] Delete scoped to own rows by RLS (no client-side-only filter)
- [ ] Delete control + dialog a11y (accessible names, announced); strings from `t()` in en/es/pt/de
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Deleting a lesson cascades its `lesson_attempts` (FK `on delete cascade`, task-1).
- Additive to task-4's item API (`onDelete`/delete label prop).

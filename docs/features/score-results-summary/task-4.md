---
id: task-4
title: LessonAttemptService (validation, insert-only)
slice: 1
scenarios: [s6]
status: todo
paths:
  - libs/services/src/services/lesson-attempt.service.ts
  - libs/services/src/services/lesson-attempt.service.test.ts
  - libs/services/src/services/index.ts
---

## Goal
Add `LessonAttemptService` (`abstract class`, static methods) wrapping `LessonAttemptDao` with validation:
- `saveAttempt(input: NewLessonAttempt): Promise<LessonAttempt>` — validate `total > 0`, `0 <= score <= total`, and a non-empty `lessonId`; reject with a clear `Error` otherwise; on success delegate to `LessonAttemptDao.insertAttempt`.
- No React. Insert-only (no update/upsert).

## Done criteria
- [ ] @s6 — a valid attempt is persisted via the DAO (mocked); the service composes no update path.
- [ ] Validation tests: `total <= 0`, `score < 0`, `score > total`, and empty `lessonId` all reject with a descriptive error and do **not** call the DAO.
- [ ] Exported via `services/index.ts`.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Mirrors the `LocalePreferenceService`/`AuthService` static-abstract-class precedent.
- The service does not know the `userId` — it is server-set (`auth.uid()` default + RLS), so it validates only the score payload.

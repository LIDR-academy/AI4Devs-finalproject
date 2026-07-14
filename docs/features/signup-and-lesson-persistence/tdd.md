# TDD log — signup-and-lesson-persistence

## @s → test map (Slice 1)

| @s | Test | File |
|---|---|---|
| @s10 | migration review: FK `lesson_attempts_lesson_id_fkey` on delete cascade + orphan delete | `supabase/migrations/20260714012201_create_lessons_and_lesson_attempts_fk.sql` |
| @s11/@s12 | migration review: RLS select/insert/delete `user_id = auth.uid()` | same migration |
| @s1 | `persistLesson` inserts title+slides, returns DB id; never sends `user_id` | `lesson-generation.persist.test.ts` |
| @s1/@s3 | `persistLesson` known-uuid insert + rewrites slide `lessonId`s before write | `lesson-generation.persist.test.ts` |
| @s2 | `persistLesson` throws `persist_failed`; `mapGenerationError` maps it; service normalizes | `lesson-generation.persist.test.ts`, `lesson-generation.errors.test.ts`, `lesson-generation.service.test.ts` |
| @s3 | response `lessonId` = persisted DB id (Edge wires persist before 200) | persist module + Edge `index.ts` (manual live-verify) |
| @s4/@s7/@s11 | `getLessons` newest-first, no userId filter; service + `useLessons` list | `lessons.dao.test.ts`, `lessons.service.test.ts`, `use-lessons.test.ts` |

## Slice 1 cycles

### Task-1
- KEEP migration (orphan DELETE then FK cascade). Fixed header comment to match delete path.
- RED/GREEN N/A (schema-only; covered by review + later DAO).

### Task-2
- KEEP `persistLesson` + tests; fix TS in user_id assertion.
- RED→GREEN `@s2` mapGenerationError persist_failed → status 500.
- GREEN service already normalizes persist_failed (GENERATION_ERROR_CODES).
- Mirror `_shared/persist` + wire Edge index (caller JWT, replace lessonId).
- Types: persist_failed in GenerationErrorCode (9 codes).

### Task-3
- RED→GREEN LessonSummary type + barrel.
- RED→GREEN LessonsDao getLessons (newest-first, no userId) + getLessonById.
- RED→GREEN LessonsService validation/normalize + barrel export.
- RED→GREEN useLessons `{lessons,isLoading,error,refetch}` + types barrel.
- Integration: hook→service→DAO with mocked `from` (@s4/@s7/@s11).
- Exhaustiveness: persist_failed → helpers recovery=retry + i18n keys (en/es/pt/de).

### Slice-1 reviewer_slice rework
- RED: persist stores slides with stale `slide.lessonId` ≠ returned row id.
- GREEN: known-uuid insert (`lesson.lessonId`) + rewrite slides before insert; Deno mirror synced.
- REFACTOR: Edge comment clarifies persist owns rewrite; response still mirrors id.

### Gate
- Affected tests green; `pnpm lint` + `pnpm check-types` clean. No commit (orchestrator).

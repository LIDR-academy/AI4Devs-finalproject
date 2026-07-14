# TDD log — signup-and-lesson-persistence

## @s → test map

| @s | Test | File |
|---|---|---|
| @s10 | migration review: FK cascade + orphan delete | `supabase/migrations/20260714012201_*.sql` |
| @s11/@s12 | migration RLS select/insert/delete | same migration |
| @s1 | `persistLesson` inserts title+slides, returns id | `lesson-generation.persist.test.ts` |
| @s1/@s3 | known-uuid insert + rewrite slide lessonIds | `lesson-generation.persist.test.ts` |
| @s2 | persist_failed map + service normalize | persist/errors/service tests |
| @s3 | response lessonId = persisted DB id | Edge `index.ts` (manual live-verify) |
| @s4/@s7/@s11 | getLessons newest-first; hook list | dao/service/`use-lessons` tests |
| @s4 | LessonList content titles+dates; SavedLessons renders | `lesson-list.test.tsx`, `saved-lessons.test.tsx` |
| @s5 | LessonList empty; SavedLessons empty | same |
| @s6 | onOpenLesson → `/lesson/[id]` | `saved-lessons.test.tsx` |
| @s7 | integration hook→service→DAO list | `saved-lessons.integration.test.tsx` |
| @s13 | LessonList loading + SavedLessons loading | `lesson-list.test.tsx`, `saved-lessons.test.tsx` |
| @s14 | LessonList error+retry; SavedLessons refetch | same |
| @s15 | home.* locale parity en/es/pt/de | `home-locale-parity.test.ts` |
| @s16 | a11y open names + state announcements; loading live-region Text; e2e | `lesson-list.test.tsx`, `lesson-list.e2e.js` |

## Slice 1 cycles

### Task-1
- KEEP migration (orphan DELETE then FK cascade). Fixed header comment.

### Task-2
- KEEP `persistLesson` + tests; fix TS in user_id assertion.
- RED→GREEN `@s2` mapGenerationError persist_failed → 500.
- Mirror `_shared/persist` + Edge wire; types: persist_failed (9 codes).

### Task-3
- RED→GREEN LessonSummary, LessonsDao/Service, useLessons + integration.
- Exhaustiveness: persist_failed → helpers recovery=retry + i18n.

### Slice-1 reviewer_slice rework
- RED/GREEN: rewrite slides before insert; Deno mirror synced.

### Gate
- Tests green; lint + check-types clean. No commit (orchestrator).

## Slice 2 cycles

### Task-4
- RED→GREEN `@s13` LessonList loading indicator.
- RED→GREEN `@s4` content titles/dates + onOpenLesson(id).
- RED→GREEN `@s5` empty; `@s14` error+retry; `@s16` announce + open a11y.
- LessonListItem molecule + stories; Playwright e2e (4 states).
- Optional `onDelete`/`deleteLabel` left open for task-6.

### Task-5
- RED→GREEN SavedLessons: loading/empty/content/error + nav `/lesson/[id]`.
- Helpers: toLessonListState / formatLessonCreatedDate / toLessonListItems.
- Integration: SavedLessons → useLessons → service → DAO.
- i18n `home.loading|empty|error|retry|openLesson|createdDate` en/es/pt/de + parity test.
- Home thin shell → `<SavedLessons />`.

### Gate
- Unit + e2e green; `pnpm lint` + `pnpm check-types` clean. No commit (orchestrator).

### Slice-2 reviewer_slice rework
- RED→GREEN `@s16` LessonList loading a11y: wrapper = testID only; ProgressIndicator owns progressbar; polite visuallyHidden live-region Text (ApiKeyForm pattern). Keep `useLessonList` announce.

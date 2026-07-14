# TDD log — signup-and-lesson-persistence

## @s → test map

| @s | Test | File |
|---|---|---|
| @s10 | migration review: FK cascade + orphan delete | `supabase/migrations/20260714012201_*.sql` |
| @s11/@s12 | migration RLS select/insert/delete | same migration |
| @s1 | `persistLesson` inserts title+slides, returns id | `lesson-generation.persist.test.ts` |
| @s1/@s3 | known-uuid insert + rewrite slide lessonIds | `lesson-generation.persist.test.ts` |
| @s2 | persist_failed map + service normalize | persist/errors/service tests |
| @s2 | persist_failed → retry; no player CTA; empty lessonId no-nav | `lesson-generation.test.tsx`, `use-lesson-generation.test.ts` |
| @s3 | response lessonId = persisted DB id | Edge `index.ts` (manual live-verify) |
| @s4/@s7/@s11 | getLessons newest-first; hook list | dao/service/`use-lessons` tests |
| @s4 | LessonList content titles+dates; SavedLessons renders | `lesson-list.test.tsx`, `saved-lessons.test.tsx` |
| @s5 | LessonList empty; SavedLessons empty | same |
| @s6 | onOpenLesson → `/lesson/[id]` | `saved-lessons.test.tsx` |
| @s7 | integration hook→service→DAO list | `saved-lessons.integration.test.tsx` |
| @s8 | deleteLesson DAO/service/hook; confirm → delete | dao/service/`use-lessons`/`lesson-list`/`saved-lessons` + integration |
| @s8/@s14 | delete fail keeps Content + banner; no unhandled reject | `saved-lessons.helpers`/`saved-lessons` tests |
| @s9 | dismiss confirm → no delete | `lesson-list.test.tsx`, `saved-lessons.test.tsx` |
| @s12 | delete by id only (no client user_id filter) | `lessons.dao.test.ts` |
| @s13 | LessonList loading + SavedLessons loading | `lesson-list.test.tsx`, `saved-lessons.test.tsx` |
| @s14 | LessonList error+retry; SavedLessons refetch | same |
| @s15 | home.* + home.delete.* + persistFailed locale parity | `home-locale-parity`, `generation-persist-locale-parity` |
| @s16 | a11y open/delete names + state announcements; e2e | `lesson-list.test.tsx`, `lesson-list.e2e.js` |
| review-r1 | delete IconButton = `layout.touchTarget` 48 | `lesson-list-item.test.tsx` |
| review-r1 | Content uses FlatList (`lesson-list` testID) | `lesson-list.test.tsx` |
| review-r1 | delete-fail → `announceForAccessibility` | `saved-lessons.test.tsx` |
| review-r1 | persist `.select('id')` only | `lesson-generation.persist.test.ts` |
| review-r1 | migration orphan wipe guard | `20260714012201_*.sql` |
| review-r1 | remove unused `getLessonById` | dao/service tests trimmed |

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
- i18n `home.*` en/es/pt/de + parity; Home → `<SavedLessons />`.

### Gate
- Unit + e2e green; lint + check-types clean. No commit (orchestrator).

### Slice-2 reviewer_slice rework
- RED→GREEN `@s16` loading a11y: testID wrapper; ProgressIndicator progressbar; polite live-region.

## Slice 3 cycles

### Task-6
- RED→GREEN delete DAO/service/hook + Dialog confirm + SavedLessons wire + i18n + e2e.

### Task-7
- RED→GREEN persist_failed recovery UI + locale parity.

### Gate
- Unit + e2e green; lint + check-types clean. No commit (orchestrator).

### Slice-3 reviewer_slice rework
- RED→GREEN `toLessonListState` content-with-error; delete-fail banner + catch.

## Mutation survivors round 1–2
- Killers in hooks/list/item/helpers/saved-lessons/generation/persist (see `mutation.md`).
- Round 2: `lesson-generation` empty `documentId` guard via captured `onGenerate`.

## CI fix (full-review gate)
- `lesson-generation.test.tsx` mock props typing + Biome format.

## Full-review round 1 rework
- RED→GREEN blocker a11y: delete `IconButton` size=`layout.touchTarget`.
- RED→GREEN major perf: LessonList Content → `FlatList` + flex root.
- RED→GREEN major a11y: SavedLessons delete-fail `announceForAccessibility`.
- MAJOR security: migration orphan DELETE guarded (refuse wipe when lessons empty + attempts exist).
- MINOR YAGNI: remove unused `getLessonById` (dao/service/tests).
- RED→GREEN minor perf: `persistLesson` `.select('id')` (+ Deno mirror).
- MINOR perf: memoize SavedLessons items/labels/handlers; FlatList `renderItem`/`keyExtractor`.
- MINOR code: `LessonListProps` discriminated union — deleteConfirm* required when `onDelete` set.
- Gate: unit + e2e green; lint + check-types clean. No commit (orchestrator).

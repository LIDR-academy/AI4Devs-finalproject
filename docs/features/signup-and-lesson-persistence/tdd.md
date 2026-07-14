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

## Slice 3 cycles

### Task-6
- RED→GREEN `@s8/@s12` LessonsDao.deleteLesson (id only; RLS scopes).
- RED→GREEN LessonsService.deleteLesson (validate + normalize).
- RED→GREEN useLessons.deleteLesson (remove from list on success; error leaves list).
- RED→GREEN LessonList confirm Dialog (ApiKeyForm pattern) `@s8` confirm / `@s9` dismiss; delete a11y `@s16`.
- RED→GREEN SavedLessons wires deleteLesson + `home.delete.*` labels; integration delete chain.
- i18n `home.delete.*` en/es/pt/de + home-locale-parity; ContentWithDelete story + e2e.

### Task-7
- RED→GREEN `@s2` persist_failed known-code in useLessonGeneration mock guard.
- RED→GREEN `@s2` persist_failed → retry message, no open-in-player; empty lessonId blocks nav.
- Player CTA requires trimmed non-empty lessonId.
- generation.error.persistFailed locale parity es/pt/de.

### Gate
- Unit + e2e green; `pnpm lint` + `pnpm check-types` clean. No commit (orchestrator).

### Slice-3 reviewer_slice rework
- RED→GREEN `toLessonListState`: error + lessons remain → Content (not @s14 load-Error).
- RED→GREEN SavedLessons: `void deleteLesson(id).catch(() => {})` (SignOut pattern); delete-fail banner via `home.delete.failed` while list stays; locale parity.
- No commit (orchestrator).

## Mutation survivors round 1

### Killers (behavioral)
- `use-lessons`: first-render `isLoading=true`; stale success/error race after refetch.
- `lesson-list-item`: delete requires both `onDelete` + label.
- `lesson-list`: literal loading testID; empty-id delete gate; content no-announce; label-change re-announce.
- `saved-lessons.helpers`: invalid ISO → raw string.
- `saved-lessons`: no count while loading; loading copy; confirm i18n; delete banner only on content+error.
- `lesson-generation`: no generate without documentId; trim lessonId; optional-chain no-throw; open uses latest result after rerender.
- `persistLesson`: assert persist error message string.

### Equivalents
- See `mutation.md` `## Equivalents` (StyleSheet / React-19 unmount / unused deps / redundant schema+optional-chain / unreachable recovery).

## Mutation kill round 2 (final)
- RED→GREEN `lesson-generation`: invoke captured `onGenerate` with undefined/empty `documentId` — `generate` not called (kills `if (!documentId) return` → `if (false) return`). Guard already correct; panel `canGenerate` alone did not bite callback body.

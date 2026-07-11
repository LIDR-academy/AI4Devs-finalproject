# TDD log — score-results-summary

## Slice 1 — happy path + loading (tasks 1–7)

### @s → test map

| @s | Behavior | Test | File |
|---|---|---|---|
| s1 | Score shown for a fully-correct scorable lesson | `scores correct === total when every system-checked slide is answered correctly` | `libs/study-buddy/src/grading/score-lesson.test.ts` |
| s1 | Organism renders pre-formatted score/percent | `renders the pre-formatted score and percent labels for the score variant` | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |
| s1 | Wiring computes + formats via `t()` | `renders the pre-formatted score and percentage for a scorable lesson` | `libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx` |
| s2 | Only system-checked types count | `isSystemCheckedActivity` true/false cases | `libs/types/src/activity-type.test.ts` |
| s2 | Mixed activity types excluded from total/correct | `excludes flashcard and open-ended slides from the total and correct count` | `libs/study-buddy/src/grading/score-lesson.test.ts` |
| s3 | Matching contributes one whole-slide point | `scores a matching slide as %s → isCorrect=%s → %i out of 1` (each Example row) | `libs/study-buddy/src/grading/score-lesson.test.ts` |
| s4 | Unanswered system-checked slides count toward total, not correct | `counts unanswered system-checked slides toward the total but not the correct count` | `libs/study-buddy/src/grading/score-lesson.test.ts` |
| s5 | Hook exposes `saving` while in flight | `sets status to saving while saveAttempt is in flight` | `libs/hooks/src/hooks/use-lesson-attempt.test.ts` |
| s5 | Organism shows loading + disables actions | `renders the loading indicator and disables both actions while loading` | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |
| s5 | Wiring binds `loading` to hook status | `shows the loading state while useLessonAttempt().status is saving` | `libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx` |
| s6 | Insert is additive, no update path | `inserts only lesson_id, score, and total…` | `libs/services/src/dao/lesson-attempt.dao.test.ts` |
| s6 | Service persists a valid attempt | `saveAttempt delegates a valid attempt to LessonAttemptDao.insertAttempt` | `libs/services/src/services/lesson-attempt.service.test.ts` |
| s6 | Hook: successful save → `saved`, fresh insert per call | `transitions to saved…` / `calls the service again on a second saveAttempt call…` | `libs/hooks/src/hooks/use-lesson-attempt.test.ts` |
| s6 | Wiring: save exactly once, no double-save on re-render | `calls saveAttempt exactly once on mount…` / `does not call saveAttempt again on a re-render…` | `libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx` |
| s6 | Integration: compute-then-persist end to end | `computes the score and persists it via the real hook/service pipeline` | `libs/study-buddy/src/components/lesson-results/lesson-results.integration.test.tsx` |

Type-level checks (task-1 Done criteria, not a numbered `@s`): `MultipleChoiceAnswer` → `GradedAnswer` assignability (`graded-answer.test.ts`), `MultipleChoiceSlide` → `ScorableSlide` projection (`scorable-slide.test.ts`), barrel coverage for `ScoreSummary`/`LessonAttempt`/`NewLessonAttempt` (`index.test.ts`).

### Cycles

- **task-1** (`@s2`): RED `isSystemCheckedActivity` test (no module) → GREEN `activity-type.ts` (union + set + guard). RED `ScorableSlide`/`GradedAnswer`/barrel type-level tests → GREEN added `scorable-slide.ts`, `graded-answer.ts`, `score-summary.ts`, `lesson-attempt.ts` + barrel exports. Stood up Jest for `@helsoft/types` (none existed before this feature).
- **task-2** (`@s1`): RED `scoreLesson` all-correct test → GREEN naive `{correct: answers.length, total: slides.length}`. (`@s2`) RED mixed-types test → GREEN filtered by `isSystemCheckedActivity` into a slide-id set, answers filtered by membership+`isCorrect`. (`@s3`) matching Examples table — passed immediately (algorithm already type-agnostic); kept as a regression pin. (`@s4` + defensive cases) unanswered/zero-total/stray-answer — all passed immediately, confirming the slide-id-set approach already generalizes. Exported via `study-buddy` barrel.
- **task-3** (`@s6`): wrote the `lesson_attempts` migration (RLS select/insert-own policies, insert-only, soft `lesson_id`). RED `LessonAttemptDao.insertAttempt` test (module missing) → GREEN DAO with snake_case→camelCase row mapping.
- **task-4** (`@s6`): RED `saveAttempt` delegates-to-DAO test → GREEN thin delegation. RED 5 validation-rejection cases (`total<=0`, `score<0`, `score>total`, empty `lessonId`) → GREEN `validationError()` guard before delegating.
- **task-5** (`@s5`): RED `saving` status test → GREEN minimal hook (`setStatus('saving')` + `.then`). (`@s6`) RED saved-transition + fresh-insert tests — passed immediately (already covered by the minimal implementation). RED error/retry/no-double-fire/unmount-safety tests → GREEN added `catch` → `error` status, `lastInput` ref + `retry()`, an in-flight `status==='saving'` guard in `saveAttempt`, and an `isMounted` ref checked before every post-await `setState`.
- **task-6** (`@s1`): RED score-labels render test → GREEN `ResultsSummary` (Card + two Text nodes). RED action-wiring test → GREEN added `Button`s calling `onRetake`/`onBackToLessons`. (`@s5`) RED loading-indicator/disabled-actions test → GREEN added `loading` prop, `RESULTS_LOADING_TEST_ID`, `ProgressIndicator`, `disabled={loading}` on both buttons. Scoped `ResultsSummaryVariant` to `'score'` only for this slice (mirrors how `LoginFormProps` grew slice-by-slice in `login-and-logout` rather than pre-declaring the task doc's eventual `'score' | 'completion'` union) — task-8 widens it alongside its own tests.
- **task-7** (`@s1`): RED `LessonResults` score/percent render test (module missing) → GREEN component projecting `lesson.slides` → `ScorableSlide[]`, calling `scoreLesson`, formatting via `t()`. (`@s5`) RED loading-bound test — passed immediately (already wired). (`@s6`) RED exactly-once + no-double-save-on-rerender tests → GREEN `useRef` + `useEffect([])` save-once guard. Added `results.score`/`results.scorePercent` to all four locale bundles (RED via a new `migration-coverage` `KEY_EXISTENCE_DIRS` entry for `lesson-results`, GREEN by adding the keys). Added one integration test (real hook→service→DAO, mocked Supabase `.from()`) proving compute-then-persist. Wired the app route (`results.tsx`) to compose `LessonResults`; extracted the stub lesson/answers fixture into `@helsoft/study-buddy/fixtures/lesson-results-stub.ts` (own RED/GREEN test) after the inline `.tsx` version tripped the `migration-coverage` hardcoded-`title:` literal detector as a false positive.

### Gate

`pnpm lint`, `pnpm check-types`, `pnpm test` all green across `@helsoft/types`, `@helsoft/study-buddy`, `@helsoft/services`, `@helsoft/hooks`, `@helsoft/components`, `@helsoft/localization`, and `app-study-buddy`. No e2e run this slice (no UI states beyond score/loading exist yet; Storybook e2e wiring lands in Slice 3 / task-12 per the plan). Committed as `feat(score-results-summary): implement happy path`.

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

## Slice 2 — empty/completion + error + retry (tasks 8–9)

### @s → test map

| @s | Behavior | Test | File |
|---|---|---|---|
| s8/s9 | Completion variant renders no score, both actions | `renders the completion headline and body for the completion variant, with no score` | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |
| s10 | Completion variant exposes both actions | (same test, asserts both `getByRole('button', ...)`) | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |
| s7 | Score stays visible + non-blocking notice when `saveFailed` | `shows the score alongside a non-blocking save-failure notice when saveFailed is true` | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |
| s7 | Retry action wiring | `calls onRetrySave when the retry action is pressed` | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |
| s8 | `isScorable: false` → completion, no `saveAttempt` | `renders the completion variant and never calls saveAttempt for an instructional-only lesson` | `libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx` |
| s9 | Same `isScorable: false` branch (flashcard/open-ended not yet `Lesson`-constructible — see task-9 Notes); pinned separately at the scorer level | `returns isScorable: false and correct/total of 0 when there are no system-checked slides` | `libs/study-buddy/src/grading/score-lesson.test.ts` (slice 1) |
| s7 | `saveFailed`/`onRetrySave` bound to hook `error`/`retry` | `shows the score alongside the save-failure notice when useLessonAttempt().status is error` / `calls the hook retry() when the retry action is pressed` | `libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx` |
| s10/s11 | Retake/back-to-lessons callbacks thread through in both variants | `calls onRetake when the retake action is pressed for a scorable lesson` / `calls onRetake and onBackToLessons in the completion state` | `libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx` |
| s11 | Retake navigates same lesson, `replace`, no regeneration | pre-existing route wiring (task-7); no route-level test harness in `apps/app-study-buddy` — see task-9 Notes | `apps/app-study-buddy/src/app/(app)/lesson/[id]/results.tsx` |

### Cycles

- **task-8** (`@s8`/`@s9`/`@s10`): RED completion-variant render test (`variant="completion"` not in the type union yet) → GREEN widened `ResultsSummaryVariant` to `'score' | 'completion'`, extended `labels` with `completeHeadline`/`completeBody`/`saveFailed`/`retrySave`, conditional render branch. (`@s7`) RED save-failure notice test + retry-press test → GREEN added `saveFailed`/`onRetrySave` props and the notice `View` (mirrors `LoginForm`'s `errorBanner` pattern: `errorContainer`/`onErrorContainer` tokens, `accessibilityRole="alert"` + `accessibilityLiveRegion`). Added a `does not show the save-failure notice when saveFailed is false` negative pin. Updated `results-summary.stories.tsx` with `Completion` and `SaveFailed` stories (all 4 states now covered).
- **task-9** (`@s8`): RED `LessonResults` completion test (instructional-only lesson fixture) → GREEN branched on `summary.isScorable` for `variant` and guarded the save-once `useEffect` to skip when unscorable; guarded `percent` against a `NaN` (total 0) even though unrendered. Added `results.completeHeadline`/`completeBody`/`saveFailed`/`retrySave` to all four locale bundles (en/es/pt/de) — required now (not deferred to task-10) to satisfy this slice's "no hardcoded copy" gate; task-10 (slice 3) still owns the native-speaker translation-quality pass and its own explicit i18n-sourcing test. (`@s7`) RED `saveFailed`/retry-binding tests → GREEN wired `saveFailed={status === 'error'}` and `onRetrySave={retry}` from the hook. (`@s10`/`@s11`) RED retake/back-to-lessons callback-threading tests (score + completion variants) — written as regression pins; passed immediately since both callbacks were already threaded through unconditionally, consistent with the slice-1 "pin" precedent. Verified `@s11`'s navigation semantics are already satisfied by the existing `results.tsx` route wiring from task-7 (`router.replace` to the same lesson id) — no code change, no app-level test harness exists to pin it further.
- Both organism cycles above were caught re-sequencing a Law-1 slip: `saveFailed` was implemented in the same edit as `completion` before its own test was red. Corrected by temporarily reverting the `saveFailed`-specific lines, re-confirming RED, then reinstating as a clean GREEN step (same fix applied in both `results-summary.tsx` and `lesson-results.tsx`).

### Gate

`pnpm lint` (only `app-study-buddy` defines the script; cache-hit clean), `pnpm check-types`, and `pnpm test`/`pnpm turbo run test` all green across `@helsoft/components`, `@helsoft/study-buddy`, `@helsoft/localization`, `@helsoft/activities`, and the rest of the workspace. No e2e this slice (task-12, slice 3). Slice-2 code+design review pending before commit.

## Slice 2 — round-1 review fix-forward (`review.md` findings 1–6)

Both `reviewer_code` and `reviewer_design` returned `CHANGES_REQUESTED` against commit `5525f74`. Fixed all 6 findings via TDD, one behavior at a time.

### Finding → test map

| Finding | Behavior | Test | File |
|---|---|---|---|
| Major 1 (design) | iOS VoiceOver announcement on save failure | `announces the save-failure notice via AccessibilityInfo when saveFailed is set` | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |
| Major 1 (extension) | Announcement respects the same variant guard as the render | `does not announce a save-failure notice for the completion variant even if saveFailed is true` | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |
| Major 2 (design) | `LessonResults` Completion/SaveFailed stories | new `Completion`/`SaveFailed` stories (Storybook-only, no Jest test per existing convention) | `libs/study-buddy/src/components/lesson-results/lesson-results.stories.tsx` |
| Minor 3 (code) | Untested defensive `percent` guard | pure refactor (removed unneeded ternary; all existing tests stayed green) | `libs/study-buddy/src/components/lesson-results/lesson-results.tsx` |
| Minor 4 (code) | `saveFailed` notice must never render for the completion variant | `does not show the save-failure notice for the completion variant even if saveFailed is true` | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |
| Minor 5 (code) | Style key names shared across variants | pure rename refactor (`score`/`percent` → `headline`/`body`); all existing tests stayed green | `libs/components/src/organisms/results-summary/results-summary.tsx` |
| Minor 6 (code) | Unenforced `onRetrySave` "required" contract | `does not render the retry action when onRetrySave is omitted even though saveFailed is true` | `libs/components/src/organisms/results-summary/results-summary.test.tsx` |

### Cycles

- **Minor 4**: RED `does not show the save-failure notice for the completion variant…` (rendered regardless of variant) → GREEN added `variant === 'score'` to the notice's render condition.
- **Major 1**: RED `announces the save-failure notice via AccessibilityInfo…` → GREEN added a `useEffect` firing `AccessibilityInfo.announceForAccessibility(labels.saveFailed)` on the `saveFailed` transition, mirroring `LoginForm`'s `errorMessage` effect. Then RED `does not announce…for the completion variant…` → GREEN extended the effect's guard to `saveFailed && variant === 'score'` (kept in sync with the render guard).
- **Minor 6**: RED `does not render the retry action when onRetrySave is omitted…` → GREEN wrapped the retry `Button` in `{onRetrySave ? … : null}`; chose graceful degradation (no retry action renders) over a discriminated-union prop-type overhaul — smallest fix that removes the runtime risk without inflating the prop typing for a single required-only-in-one-branch field. Docstring on `onRetrySave` updated to describe the actual (soft) contract.
- **Minor 3**: refactor-only — removed lesson-results.tsx's `summary.isScorable ? … : 0` ternary since `percent` is never rendered in the completion branch (division-by-zero yields an unused `NaN`, confirmed harmless at both the type and runtime level); no new test needed since nothing observable changed, all pre-existing tests stayed green throughout.
- **Minor 5**: refactor-only — renamed the `score`/`percent` style keys to `headline`/`body` since both are reused for the completion variant's text; no test referenced the style keys by name, so this stayed green throughout.
- **Major 2**: added `Completion` (instructional-only lesson fixture, mirroring `lesson-results.test.tsx`'s own fixture) and `SaveFailed` (`configureLessonAttemptMock({ status: 'error' })`) stories to `lesson-results.stories.tsx`, matching `results-summary.stories.tsx`'s existing decorator/story conventions. Storybook stories aren't Jest-tested in this codebase (Playwright e2e for this slice is deferred to slice 3 per the slice-1 gate note) — no test cycle applies here beyond the existing convention.

### Gate

`pnpm lint`, `pnpm turbo run check-types`, and `pnpm turbo run test` all green across the whole workspace (`@helsoft/components` 88 tests, `@helsoft/study-buddy` 49 tests, `@helsoft/types`, `@helsoft/services`, `@helsoft/hooks`, `@helsoft/activities`, `app-study-buddy`). No e2e this slice (unchanged from round 1 — task-12/slice 3 owns Storybook e2e wiring). Returning to `reviews_lead` for slice-2 re-review; not committing here (commit happens once both `reviewer_code`/`reviewer_design` return `APPROVED`, per protocol).

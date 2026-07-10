# TDD log — activity-multiple-choice

Strict Red→Green→Refactor, one `@s` scenario at a time, per `.agents/rules/tdd.md`. This log
covers **Slice 1 only** (happy path: tasks 1–4, `@s1,@s2,@s3,@s4,@s5,@s6,@s7`). `@s8`–`@s11` are
Slice 2/3 and out of scope for this run.

## Build order

Per `tasks.md`: data/domain backbone first (task-1 types → task-2 grader), then UI
(task-3 organism → task-4 wiring + integration).

## `@s` → test map (Slice 1)

| Scenario | Test(s) |
|---|---|
| @s1 | `multiple-choice.test.tsx`: "renders the question and every option as visible and enabled, with no result banner"; "calls onSelectOption with the tapped option id while unanswered" |
| @s2 | `multiple-choice.test.tsx`: "locks every option once answered"; `multiple-choice-activity.test.tsx`: "locks every option once the learner selects one" |
| @s3 | `grade-multiple-choice.test.ts`: "returns isCorrect true and the full answered-state shape when the selection matches the correct option"; `multiple-choice.test.tsx`: "marks the selected tile correct and shows the correct banner when the selection matches" |
| @s4 | `grade-multiple-choice.test.ts`: "returns isCorrect false and reports the correct option when the selection does not match it"; `multiple-choice.test.tsx`: "marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner" |
| @s5 | `multiple-choice.test.tsx`: "shows the explanation heading and text together with the result when provided"; "does not show an explanation heading when none is provided" |
| @s6 | `multiple-choice.test.tsx`: "does not call onSelectOption when a locked option is tapped"; `multiple-choice-activity.test.tsx`: "ignores a second selection and calls onAnswered exactly once" |
| @s7 | `grade-multiple-choice.test.ts` (both tests above pin the full 5-field `MultipleChoiceAnswer` shape via exact `toEqual`); `multiple-choice-activity.test.tsx`: "exposes the graded answered state and renders the matching feedback, end to end" (slice integration test — real grader, real organism, nothing mocked) |

## Cycles

### task-1 + task-2 — types + `gradeMultipleChoice` (`libs/study-buddy/src/grading/grade-multiple-choice.ts`)

**Cycle 1 (@s3, @s7)**
- RED: `grade-multiple-choice.test.ts` — "returns isCorrect true and the full answered-state shape…", importing `MultipleChoiceSlide`/`MultipleChoiceAnswer` from `@helsoft/types` and `gradeMultipleChoice` from the not-yet-existing module. Failed: `Cannot find module './grade-multiple-choice'`.
- GREEN: added task-1's types (`libs/types/src/lesson.ts` extended into the `Slide` discriminated union + `MultipleChoiceOption`/`MultipleChoiceSlide`; new `libs/types/src/activity-answer.ts` with `MultipleChoiceAnswer`/`ActivityAnswer`; both re-exported via `libs/types/src/index.ts`), then `grade-multiple-choice.ts` with the direct/obvious implementation (`isCorrect: selectedOptionId === slide.correctOptionId`). Verified: only consumer of `Slide` pre-change was `Lesson.slides: Slide[]` (`grep -rn "Slide" libs/ apps/`) — additive change confirmed safe.
- REFACTOR: none needed (implementation already minimal/revealing).

**Cycle 2 (@s4, @s7)**
- RED: added "returns isCorrect false and reports the correct option…" — ran green immediately (obvious-implementation generalization from cycle 1 already covers the mismatch branch; same pattern as `AuthService.isValidEmail` in this codebase — direct implementation over literal fake-it for simple pure boolean logic). Flagged, not hidden: the exact-shape `toEqual` in both cycles doubles as @s7's shape guard (no extra/missing fields), so no separate shape-only test was added.
- GREEN/REFACTOR: n/a (no production change required).
- Exported via `libs/study-buddy/src/index.ts`.
- Deferred to Slice 2 (task-5, @s9): the "throws if selectedOptionId is not one of slide.options" guard — out of scope per `gherkin-scenarios.md`'s own mapping (`@s9 → grade-multiple-choice.test.ts (throws on unknown option)`) and the run's explicit instruction not to build @s8/@s9 yet.

### task-3 — `MultipleChoice` organism (`libs/components/src/organisms/multiple-choice/multiple-choice.tsx`)

**Cycle 3 (@s1a — render)**
- RED: `multiple-choice.test.tsx` — "renders the question and every option as visible and enabled, with no result banner". Failed: `Cannot find module './multiple-choice'`.
- GREEN: created `multiple-choice.tsx` with `question`/`options` render only (no answered logic yet), composing `Card` + `AnswerOption` per option, using `theme.spacing`/`theme.typography` tokens.

**Cycle 4 (@s1b — selectable/report up)**
- RED: "calls onSelectOption with the tapped option id while unanswered". Failed: `onSelectOption` not wired (0 calls).
- GREEN: wired `onPress={() => onSelectOption(option.id)}` on each `AnswerOption`.

**Cycle 5 (@s2 — lock)**
- RED: "locks every option once answered" (`selectedOptionId` set). Failed: `accessibilityState.disabled` was `false`.
- GREEN: added `selectedOptionId` destructure, `answered = !!selectedOptionId`, `disabled={answered}` on each `AnswerOption`.

**Cycle 6 (@s3 — correct feedback)**
- RED: "marks the selected tile correct and shows the correct banner…" — queries the `AnswerOption`/`Icon` ligature name directly as rendered text (`check_circle`/`cancel`), a robust black-box probe confirmed against the actual render tree in this same RED run. Failed: no `check_circle` text found.
- GREEN: added `correctOptionId` prop, `optionState()` helper (per-option `default|correct|incorrect` derivation), passed `state` to each `AnswerOption`, and the result banner using `theme.colors.tertiaryContainer`/`onTertiaryContainer`.
- **Correction (post per-slice review, Round 1):** the GREEN step above originally also added `accessibilityRole="alert"` (on the banner `View`) and `accessibilityLiveRegion="polite"` (on the banner `Text`) — neither was demanded by the driving test, a TDD Law 3 violation flagged by `reviewer_code` (`review.md` Round 1, minor finding). Removed both attributes from `multiple-choice.tsx`; no test asserted them, so removal is a pure revert with no red tests. Correctly deferred to **task-7 (Slice 3, @s11)**, where the a11y announcement is hardened test-first per `docs/features/activity-multiple-choice/task-3.md`.

**Cycle 7 (@s4 — incorrect feedback + reveal)**
- RED: "marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner" — passed immediately (cycle 6's `optionState`/banner logic is already fully general over both branches). No production change; documented rather than silently dropped.

**Cycle 8 (@s5 — explanation)**
- RED: "shows the explanation heading and text together with the result when provided". Failed: `labels.explanationHeading` text not found.
- GREEN: added `explanation` destructure + conditional `answered && explanation` block (heading + body), styled with `theme.typography`/`theme.colors.onSurfaceVariant`.
- RED/GREEN (paired): "does not show an explanation heading when none is provided" passed immediately once the `explanation &&` guard existed (same cycle's implementation covers the absence branch — verified, not assumed).

**Cycle 9 (@s6 — locked, no re-selection)**
- RED: "does not call onSelectOption when a locked option is tapped" — passed immediately. This pins real `Pressable`/`AnswerOption` behavior (its own `disabled` prop, already wired in cycle 5, blocks the native press handler) rather than driving new production code in the organism; kept as a regression guard, not dropped as "redundant."

Refactor: reviewed the whole file on green — names (`optionState`, `OPTION_MARKERS`), no duplication, tokens only (no literal colors/dimensions). No changes needed.

Then added `multiple-choice.stories.tsx` (`Unanswered` / `AnsweredCorrect` / `AnsweredIncorrect` — the three Content substates) and exported via `libs/components/src/organisms/index.ts`.

### task-4 — `MultipleChoiceActivity` wiring (`libs/study-buddy/src/components/multiple-choice-activity/multiple-choice-activity.tsx`)

**Cycle 10 (@s2 — select → lock, wrapper)**
- RED: `multiple-choice-activity.test.tsx` — "locks every option once the learner selects one". First failed on `Cannot find module`; after the minimal wrapper (local `useState<string|null>(null)`, no grading/onAnswered yet) it still failed once (`accessibilityState.disabled` stayed `false`) until the `fireEvent.press` was wrapped in `act()` — a test-only fix (state update needs to flush before re-querying), not a production bug.
- GREEN: minimal wrapper rendering `MultipleChoice` with `question=slide.content`, `options`, `correctOptionId`, `selectedOptionId`, `explanation`, and placeholder `LABELS` (literal strings — task-6 replaces with `t('activity.mcq.*')`); `handleSelect` sets `selectedOptionId`.

**Cycle 11 (@s6 — no re-selection, wrapper)**
- RED: "ignores a second selection and calls onAnswered exactly once". Failed: `onAnswered` never called (0 calls) — not wired yet.
- GREEN: added `onAnswered` prop + `gradeMultipleChoice` import; `handleSelect` guards `if (selectedOptionId) return;` before setting state and calling `onAnswered?.(gradeMultipleChoice(slide, optionId))`.

**Cycle 12 (@s7 — slice integration test)**
- RED: "exposes the graded answered state and renders the matching feedback, end to end" — the real `gradeMultipleChoice` + real `MultipleChoice` organism, nothing mocked; asserts the exact `MultipleChoiceAnswer` payload and that the organism's `check_circle` feedback renders in the same pass. Passed immediately (cycle 11's implementation already correct) — kept as the slice's required integration test per `.agents/rules/tdd.md`.

Refactor: reviewed the wrapper file on green — short, one reason to change, no duplication. No changes needed.

Exported via `libs/study-buddy/src/index.ts`.

## Gate checks (Slice 1)

- `pnpm --filter @helsoft/types --filter @helsoft/study-buddy --filter @helsoft/components check-types` — green.
- `pnpm --filter @helsoft/components --filter @helsoft/study-buddy test` — green (`components`: 73 tests / 6 suites; `study-buddy`: 30 tests / 5 suites).
- `pnpm check-types` (full monorepo, 8 packages) — green.
- `pnpm test` (full monorepo) — green.
- `pnpm lint` — green (no `lint` script is currently defined for `@helsoft/types`/`@helsoft/components`/`@helsoft/study-buddy`; only `app-study-buddy` runs via turbo today — pre-existing repo state, unrelated to this feature).
- No hardcoded strings/colors/dimensions: all copy flows through `labels`/`slide` props; all styling uses `theme.spacing`/`theme.colors`/`theme.typography`/`theme.shape` tokens.
- No `console.log`/debug leftovers, no TODOs.

Storybook e2e (Playwright) is **not** part of this slice — deferred to task-7 (Slice 3) per the run's instructions.

## Slice 1 per-slice review — Round 1 (fixed)

`reviewer_code` + `reviewer_design` ran per `.agents/rules/review-standards.md` (see `review.md`).
`reviewer_design`: APPROVED, no findings. `reviewer_code`: CHANGES_REQUESTED, 1 minor finding —
see the Cycle 6 correction note above. Fixed by removing the two untested attributes (no new
test added in this slice; re-verified `pnpm --filter @helsoft/components test` — 73/73 green —
and `pnpm --filter @helsoft/types --filter @helsoft/study-buddy --filter @helsoft/components
check-types` — green). Amended into commit `5f0124e` (message unchanged:
`feat(activity-multiple-choice): implement happy path`).

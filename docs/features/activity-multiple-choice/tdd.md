# TDD log — activity-multiple-choice

Strict Red→Green→Refactor, one `@s` scenario at a time, per `.agents/rules/tdd.md`. This log
covers **Slice 1** (happy path: tasks 1–4, `@s1,@s2,@s3,@s4,@s5,@s6,@s7`), **Slice 2**
(graceful degradation: task-5, `@s8,@s9`), and **Slice 3** (i18n + a11y: tasks 6–7, `@s10,@s11`).

## Build order

Per `tasks.md`: data/domain backbone first (task-1 types → task-2 grader), then UI
(task-3 organism → task-4 wiring + integration), then graceful degradation (task-5).

## `@s` → test map (Slices 1–2)

| Scenario | Test(s) |
|---|---|
| @s1 | `multiple-choice.test.tsx`: "renders the question and every option as visible and enabled, with no result banner"; "calls onSelectOption with the tapped option id while unanswered" |
| @s2 | `multiple-choice.test.tsx`: "locks every option once answered"; `multiple-choice-activity.test.tsx`: "locks every option once the learner selects one" |
| @s3 | `grade-multiple-choice.test.ts`: "returns isCorrect true and the full answered-state shape when the selection matches the correct option"; `multiple-choice.test.tsx`: "marks the selected tile correct and shows the correct banner when the selection matches" |
| @s4 | `grade-multiple-choice.test.ts`: "returns isCorrect false and reports the correct option when the selection does not match it"; `multiple-choice.test.tsx`: "marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner" |
| @s5 | `multiple-choice.test.tsx`: "shows the explanation heading and text together with the result when provided"; "does not show an explanation heading when none is provided" |
| @s6 | `multiple-choice.test.tsx`: "does not call onSelectOption when a locked option is tapped"; `multiple-choice-activity.test.tsx`: "ignores a second selection and calls onAnswered exactly once" |
| @s7 | `grade-multiple-choice.test.ts` (both tests above pin the full 5-field `MultipleChoiceAnswer` shape via exact `toEqual`); `multiple-choice-activity.test.tsx`: "exposes the graded answered state and renders the matching feedback, end to end" (slice integration test — real grader, real organism, nothing mocked) |
| @s8 | `multiple-choice.test.tsx`: "shows the unavailable notice and nothing selectable when there are no options" |
| @s9 | `multiple-choice.test.tsx`: "shows the unavailable notice and nothing selectable when correctOptionId is not among the options"; `grade-multiple-choice.test.ts`: "throws when selectedOptionId is not one of the slide options" |

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

### task-5 — Empty + Error states + grader validation (`libs/components/src/organisms/multiple-choice/multiple-choice.tsx`, `libs/study-buddy/src/grading/grade-multiple-choice.ts`)

**Cycle 13 (@s8 — Empty state)**
- RED: `multiple-choice.test.tsx` — "shows the unavailable notice and nothing selectable when there are no options" (`options={[]}`). Failed: `screen.getByText(labels.unavailable)` not found (component rendered the question and an empty options list instead).
- GREEN: added an early-return guard in `MultipleChoice` — `if (options.length === 0) return <Card style={styles.root}><Text style={styles.question}>{labels.unavailable}</Text></Card>;` — before the normal render, reusing the existing `Card`/`Text` + `styles.question` token style (no new tokens/styles).

**Cycle 14 (@s9 — Error state, malformed `correctOptionId`)**
- RED: "shows the unavailable notice and nothing selectable when correctOptionId is not among the options" (non-empty `options`, `correctOptionId="opt-does-not-exist"`). Failed: cycle 13's guard only checked `options.length === 0`, so this rendered the normal (broken) content instead of the unavailable notice.
- GREEN: widened the guard to `const hasCorrectOption = options.some((o) => o.id === correctOptionId); if (options.length === 0 || !hasCorrectOption) { …unavailable… }`.
- REFACTOR (on green): renamed the combined condition to `isUnavailable` and moved the `answered`/`isCorrect` derivations (only needed by the Content branch) below the guard, so the Empty/Error early return no longer computes values it doesn't use. Re-ran `multiple-choice.test.tsx` — 10/10 green, no behavior change.

**Cycle 15 (@s9 — grader guard)**
- RED: `grade-multiple-choice.test.ts` — "throws when selectedOptionId is not one of the slide options" (`gradeMultipleChoice(slide, 'opt-does-not-exist')`). Failed: `Received function did not throw` (the Slice-1 grader had no such guard — deferred explicitly at the end of Cycle 2).
- GREEN: added the guard per spec's "Invalid input contract" — `const isKnownOption = slide.options.some((o) => o.id === selectedOptionId); if (!isKnownOption) throw new Error(...);` before assembling the `MultipleChoiceAnswer`. Re-ran `grade-multiple-choice.test.ts` — 3/3 green; re-ran `multiple-choice-activity.test.tsx` — unaffected (its calls always pass a rendered, therefore valid, option id).

Added `Empty` and `Error` variants to `multiple-choice.stories.tsx` (naming precedent: `text-field.stories.tsx`, `checkbox.stories.tsx`, `login-form.stories.tsx` all export `Error`), covering the two graceful-degradation states alongside Slice 1's three Content substates.

## Gate checks (Slice 2)

- `pnpm --filter @helsoft/types --filter @helsoft/study-buddy --filter @helsoft/components check-types` — green.
- `pnpm --filter @helsoft/components --filter @helsoft/study-buddy test` — green (`components`: 75 tests / 6 suites; `study-buddy`: 31 tests / 5 suites).
- `pnpm check-types` (full monorepo, 8 packages) — green.
- `pnpm test` (full monorepo) — green.
- `pnpm lint` — green (same pre-existing repo state as Slice 1: no `lint` script yet on `@helsoft/types`/`@helsoft/components`/`@helsoft/study-buddy`).
- No hardcoded strings/colors/dimensions: the unavailable notice reuses `labels.unavailable` (already part of `MultipleChoiceLabels`) and `styles.question`/`Card` tokens; the grader's `Error` message is an internal, non-user-facing string, not UI chrome.
- No `console.log`/debug leftovers, no TODOs.

Storybook e2e (Playwright) is **not** part of this slice — deferred to task-7 (Slice 3) per the run's instructions. No i18n wiring or a11y attributes were added beyond what Slice 1 already had, per this run's scope guard (task-6/task-7, Slice 3).

## Slice 2 per-slice review — Round 1 (fixed)

`reviewer_code` + `reviewer_design` ran per `.agents/rules/review-standards.md` (see `review.md`).
`reviewer_design`: APPROVED, no findings. `reviewer_code`: CHANGES_REQUESTED, 1 minor finding —
Cycle 15's `grade-multiple-choice.test.ts:47` used a bare `.toThrow()`, proving only that
*something* throws, not that it throws for the right reason (the repo's sibling domain-guard
tests, e.g. `auth.service.test.ts:75,85`, all pin the message). Fix: tightened the assertion to
`.toThrow(/"opt-does-not-exist" is not one of the slide's options/)`, matching the exact message
`gradeMultipleChoice` throws (`grade-multiple-choice.ts:11`). Re-ran
`pnpm --filter @helsoft/study-buddy test` — 31/31 green. No production code changed (test-only
fix, no new production behavior demanded). Amended into commit `154ef44` (message unchanged:
`feat(activity-multiple-choice): add error handling and empty state`).

## Slice 2 per-slice review — Round 2 (fixed)

`reviewer_design`: APPROVED, zero findings. `reviewer_code`: CHANGES_REQUESTED, 1 minor finding —
`multiple-choice.tsx:59-60`'s `isUnavailable` guard kept a redundant `options.length === 0 ||`
sub-condition left over from Cycle 13's guard; `Array.prototype.some` on an empty array is always
`false`, so `!hasCorrectOption` alone is logically equivalent for every reachable input and no
test (`@s8`/`@s9`) distinguishes the two — the Cycle 14 REFACTOR step should have collapsed it.
Fix: simplified `isUnavailable` to `!hasCorrectOption` (the `options.length === 0 ||` clause
dropped as pure dead-weight condition; `hasCorrectOption` kept as a named intermediate for
readability). Pure refactor, no behavior change. Re-ran `pnpm --filter @helsoft/components test`
(75/75 green) and `pnpm --filter @helsoft/types --filter @helsoft/study-buddy --filter
@helsoft/components check-types` (green); also re-ran `pnpm --filter @helsoft/study-buddy test`
(31/31 green) to confirm no cross-package regression. Amended into commit `9a060fa` (message
unchanged: `feat(activity-multiple-choice): add error handling and empty state`).

## `@s` → test map (Slice 3)

| Scenario | Test(s) |
|---|---|
| @s10 | `multiple-choice-activity.test.tsx`: "labels the correct-answer banner from useLocalization()"; "labels the incorrect-answer banner and the explanation heading from useLocalization()"; "labels the unavailable notice from useLocalization()" — `migration-coverage.test.ts`: "every dotted key literal in multiple-choice-activity.tsx resolves in the en bundle" (real en/es/pt/de bundles, compiler-enforced key alignment) |
| @s11 | `multiple-choice.test.tsx`: "exposes a button role and an accessible label for every option"; "announces the result via an alert role, a live region, and AccessibilityInfo when answered"; "does not announce anything to assistive technology while unanswered" — `multiple-choice.e2e.js` (Playwright, Storybook `Interactive` story): "selecting the correct option shows the correct feedback"; "selecting an incorrect option shows incorrect feedback and reveals the correct option" |

## Cycles (Slice 3)

### task-6 — i18n `activity.mcq.*` (en/es/pt/de) + wire `t()` in the wrapper

**Cycle 16 (@s10 — wrapper sources labels via `t()`)**
- RED: added `jest.mock('@helsoft/localization', …)` + `localizationValue()` (reused from
  `test-utils/auth-test-factories.ts`, the same factory `sign-in-form.test.tsx` uses) to
  `multiple-choice-activity.test.tsx`, then "labels the correct-answer banner from
  useLocalization()" — selects the correct option and asserts `screen.getByText('activity.mcq.correct')`.
  Failed: the wrapper still built `labels` from the Slice-1 placeholder `LABELS` object
  (`'Correct!'`), so the key string never rendered. Also had to add
  `mockUseLocalization.mockReturnValue(localizationValue())` to the file's `beforeEach` so the
  three pre-existing Slice-1/2 tests (which don't care about localization) keep passing once the
  component unconditionally calls `useLocalization()`.
- GREEN: imported `useLocalization` from `@helsoft/localization` in `multiple-choice-activity.tsx`;
  replaced the placeholder `LABELS` constant with a `labels` object built from
  `t('activity.mcq.correct')` / `t('activity.mcq.incorrect')` / `t('activity.mcq.explanation')` /
  `t('activity.mcq.unavailable')` (the `explanationHeading` field maps to the `activity.mcq.explanation`
  key per task-6's spec'd key list — the object key and the i18n key intentionally differ).
- Two more tests added and **passed immediately** (documented, not driving new code — same
  generalization pattern as Slice-1 Cycle 2/7): "labels the incorrect-answer banner and the
  explanation heading from useLocalization()" (selects the wrong option, with an explanation) and
  "labels the unavailable notice from useLocalization()" (`options: []`) — both already covered by
  the single `labels` object built in the GREEN step above.
- REFACTOR: none needed — the `labels` object is already the minimal, revealing shape.

**Cycle 17 (@s10 — real-bundle key-existence guard)**
- RED: added `MULTIPLE_CHOICE_ACTIVITY_DIR` (pointing at
  `libs/study-buddy/src/components/multiple-choice-activity`) to
  `libs/localization/src/coverage/migration-coverage.test.ts`'s per-component guard array
  (renamed `AUTH_COMPONENT_DIRS` → `KEY_EXISTENCE_DIRS` since it now covers a non-auth component
  too — a plain rename, no behavior change to the existing two entries). Failed: the real `en`
  bundle didn't yet have an `activity` key at all, so all four `activity.mcq.*` literals referenced
  in the wrapper (added in Cycle 16) were reported `missing`.
- GREEN: added the `activity: { mcq: { correct, incorrect, explanation, unavailable } }` block to
  `en.ts`, and the mirrored, key-aligned (`TranslationResource`-typed) translations to `es.ts`
  (`Correcto`/`Incorrecto`/`Explicación`/`Esta pregunta no está disponible`), `pt.ts`
  (`Correto`/`Incorreto`/`Explicação`/`Esta pergunta não está disponível`), and `de.ts`
  (`Richtig`/`Falsch`/`Erklärung`/`Diese Frage ist nicht verfügbar`) — the compiler enforces the
  three non-`en` bundles stay key-aligned with `en` (`check-types` re-confirmed this).
- REFACTOR: none needed.

Gate: `pnpm --filter @helsoft/localization test` — 56/56 green (8 suites);
`pnpm --filter @helsoft/localization check-types` — green (proves `es`/`pt`/`de` are key-aligned
with `en`'s new `activity.mcq` shape).

### task-7 — a11y pass + Playwright e2e for the `MultipleChoice` organism

**Cycle 18 (@s11 — button role + accessible label, confirmed not driven)**
- RED/GREEN: "exposes a button role and an accessible label for every option" — passed
  immediately. `AnswerOption`'s `Pressable` already carries `accessibilityRole="button"`
  (task-3/Slice-1), and React Native's default accessible-name computation concatenates the
  marker `Text` ("A") and the label `Text` ("Paris") into `"A Paris"` with no explicit
  `accessibilityLabel` needed — verified directly (not assumed) via
  `expect(buttons[0]).toHaveAccessibleName('A Paris')` before trusting it. Documented rather than
  silently dropped, per task-7's "confirm and test at this organism's level too".

**Cycle 19 (@s11 — result announced to assistive tech)**
- RED: "announces the result via an alert role, a live region, and AccessibilityInfo when
  answered" (mirrors `login-form.test.tsx`'s `isSubmitting`/`errorMessage` announcement tests).
  Failed: `banner.props.accessibilityLiveRegion` was `undefined` — the Slice-1 Cycle 6 attempt at
  this had been reverted per the per-slice review (see the Cycle 6 correction note above); this
  time a failing test drives it back in.
- GREEN: in `multiple-choice.tsx`, hoisted `answered`/`isCorrect` above the `isUnavailable` early
  return (hooks can't be called conditionally) and added `resultLabel = isCorrect ? labels.correct
  : labels.incorrect`; added a `useEffect` that calls
  `AccessibilityInfo.announceForAccessibility(resultLabel)` once `!isUnavailable && answered`;
  added `accessibilityRole="alert"` to the banner `View` and `accessibilityLiveRegion="polite"` to
  the banner `Text`.
- A paired test, "does not announce anything to assistive technology while unanswered", was added
  alongside and passed immediately (the effect's own `answered` guard already covers it) — kept as
  a regression guard, documented rather than dropped.
- REFACTOR (on green): the `resultLabel` extraction also removed the duplicated
  `isCorrect ? labels.correct : labels.incorrect` ternary that previously existed only inline in
  the JSX. Re-ran `multiple-choice.test.tsx` — 13/13 green.

**Correction (post per-slice review, Round 1):** `reviewer_design` flagged (`review.md` Slice 3
Round 1, major) that pairing `accessibilityRole="alert"` with `accessibilityLiveRegion="polite"`
on the result banner was an undocumented hybrid matching neither of this codebase's two existing
live-region precedents in `login-form.tsx` — `errorBanner` pairs `alert` with `assertive`
(`login-form.tsx:93-94`), while the `isSubmitting` text uses `polite` but carries no `alert` role
at all (`login-form.tsx:134`). Chose **(a): `accessibilityLiveRegion="assertive"`**, matching the
`errorBanner` precedent, rather than (b) dropping `alert` and keeping `polite`. Reasoning: a
graded MCQ result — correct or incorrect — is the direct, singular consequence of the learner's
own just-completed action, structurally the same as a form's auth-error banner: both are the one
thing the screen just changed to tell the user about, and both deserve to interrupt/queue ahead
of other speech rather than wait politely. (`polite` without `alert`, as used for
`isSubmitting`, fits an ambient in-progress status the user isn't specifically waiting to be
interrupted for — not a fitting analogy for a graded result.) Updated the RED test first
(`multiple-choice.test.tsx:248`, `banner.props.accessibilityLiveRegion` expectation `'polite'` →
`'assertive'` — confirmed it failed against the then-current `polite` production code), then
GREEN: changed `multiple-choice.tsx`'s banner `Text` to `accessibilityLiveRegion="assertive"` and
updated the driving comment above the `useEffect` to state the "assertive, matches LoginForm's
error banner" rationale instead of the vague "mirrors LoginForm" claim the reviewer correctly
called out as under-documented. Re-ran `pnpm --filter @helsoft/components test` — 78/78 green,
no other assertions touched.

Gate: `pnpm --filter @helsoft/components test` — 78/78 green (6 suites);
`pnpm --filter @helsoft/components --filter @helsoft/study-buddy check-types` — green.

**Playwright e2e** (`libs/components/tests/e2e/organisms/multiple-choice/multiple-choice.e2e.js`,
per the `storybook-e2e-tests` skill — mirrors `src/organisms/multiple-choice/`, not co-located):
- `story = (name) => '/?path=/story/organisms-multiplechoice--' + name` — title
  `'Organisms/MultipleChoice'` → slug `organisms-multiplechoice` (confirmed against the running
  Storybook's `/index.json`, not guessed).
- "Unanswered story loads" / "Unanswered story renders every option with no result banner" —
  render-only checks against the existing `Unanswered` story.
- "selecting the correct option shows the correct feedback" / "selecting an incorrect option shows
  incorrect feedback and reveals the correct option" — **discovered mid-cycle** that the
  `Unanswered`/`AnsweredCorrect`/`AnsweredIncorrect` stories' `onSelectOption` is a no-op stub (the
  organism is controlled/presentational, so the meta-level args never update `selectedOptionId`);
  clicking an option there is inert. Added an `Interactive` story to
  `multiple-choice.stories.tsx` wiring real `useState` for `selectedOptionId` — the same pattern
  already established by `language-selector.stories.tsx`'s `Interactive` story — and pointed these
  two e2e tests at it instead. This is production-story code the e2e test itself demands (the
  Playwright run is what proved the Unanswered-story click was inert, then proved the Interactive
  story fixes it), consistent with this repo's `component → story → e2e` TDD flow for UI.
- Ran non-interactively per the skill: `pnpm --filter @helsoft/components exec playwright test
  --reporter=list` — 31/31 green (27 pre-existing + 4 new).

## Gate checks (Slice 3)

- `pnpm --filter @helsoft/components --filter @helsoft/study-buddy --filter @helsoft/localization test`
  — green (`components`: 78/78; `study-buddy`: 34/34; `localization`: 56/56).
- `pnpm check-types` (full monorepo, 8 packages) — green.
- `pnpm test` (full monorepo) — green.
- `pnpm lint` (full monorepo via turbo) — green (only `app-study-buddy` defines a `lint` script;
  same pre-existing repo state noted in Slices 1–2).
- `pnpm --filter @helsoft/components exec playwright test --reporter=list` — 31/31 green.
- No hardcoded strings/colors/dimensions: all Slice-3 chrome copy flows through
  `t('activity.mcq.*')` → `labels`; the a11y additions reuse existing `AccessibilityInfo`/RN
  primitives and the organism's existing `theme.colors`/`theme.spacing` tokens (no new tokens).
  Color contrast and touch targets are unchanged from the already-reviewed `AnswerOption`/banner
  styling (Slice 1/2), so no new contrast risk was introduced.
- No `console.log`/debug leftovers, no TODOs. (A scratch debug test file used once to inspect the
  real RN-Testing-Library computed accessible name, and a stale pre-existing Storybook dev server
  that hadn't picked up `multiple-choice.stories.tsx`, were both cleaned up/restarted before the
  final e2e run — neither is part of the committed diff.)

All 7 tasks (Slices 1–3) are now `done`. `@s1`–`@s11` all map to ≥ 1 passing test (see the three
`@s` → test map tables above). Per-slice review (code + design) for Slice 3 is pending —
`reviews_lead` runs it next; the full 6-reviewer + mutation round follows once all slices clear
their per-slice gates.

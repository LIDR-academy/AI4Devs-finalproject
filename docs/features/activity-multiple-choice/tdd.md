# TDD log — activity-multiple-choice

Strict Red→Green→Refactor, one `@s` at a time (`.agents/rules/tdd.md`). Slice 1 (happy path,
tasks 1–4, `@s1`–`@s7`), Slice 2 (graceful degradation, task-5, `@s8`/`@s9`), Slice 3 (i18n + a11y,
tasks 6–7, `@s10`/`@s11`). Build order: types → grader → organism → wiring → degradation → i18n → a11y.
Detail per cycle lives in git; this is a terse log.

## `@s` → test map (Slices 1–2)

| Scenario | Test(s) |
|---|---|
| @s1 | `multiple-choice.test.tsx`: "renders the question and every option as visible and enabled, with no result banner"; "calls onSelectOption with the tapped option id while unanswered" |
| @s2 | `multiple-choice.test.tsx`: "locks every option once answered"; `multiple-choice-activity.test.tsx`: "locks every option once the learner selects one" |
| @s3 | `grade-multiple-choice.test.ts`: "returns isCorrect true and the full answered-state shape when the selection matches the correct option"; `multiple-choice.test.tsx`: "marks the selected tile correct and shows the correct banner when the selection matches" |
| @s4 | `grade-multiple-choice.test.ts`: "returns isCorrect false and reports the correct option when the selection does not match it"; `multiple-choice.test.tsx`: "marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner" |
| @s5 | `multiple-choice.test.tsx`: "shows the explanation heading and text together with the result when provided"; "does not show an explanation heading when none is provided" |
| @s6 | `multiple-choice.test.tsx`: "does not call onSelectOption when a locked option is tapped"; `multiple-choice-activity.test.tsx`: "ignores a second selection and calls onAnswered exactly once" |
| @s7 | `grade-multiple-choice.test.ts` (both tests pin the full 5-field `MultipleChoiceAnswer` shape via exact `toEqual`); `multiple-choice-activity.test.tsx`: "exposes the graded answered state and renders the matching feedback, end to end" (slice integration test — real grader + real organism, nothing mocked) |
| @s8 | `multiple-choice.test.tsx`: "shows the unavailable notice and nothing selectable when there are no options" |
| @s9 | `multiple-choice.test.tsx`: "shows the unavailable notice and nothing selectable when correctOptionId is not among the options"; `grade-multiple-choice.test.ts`: "throws when selectedOptionId is not one of the slide options" |

## Cycles (Slices 1–2)

- **task-1/2 C1 (@s3,@s7):** RED grader import fails → GREEN add types (`libs/types` `Slide` union + `MultipleChoiceOption/Slide`, `activity-answer.ts`) + `grade-multiple-choice.ts` (`isCorrect = selected === correct`).
- **task-1/2 C2 (@s4,@s7):** mismatch test passed on obvious-impl generalization; exact `toEqual` doubles as @s7 shape guard. Grader `throws` guard deferred to Slice 2.
- **task-3 C3 (@s1a):** RED → GREEN `multiple-choice.tsx` render-only (`Card` + `AnswerOption` per option, tokens).
- **task-3 C4 (@s1b):** wired `onPress={() => onSelectOption(option.id)}`.
- **task-3 C5 (@s2):** added `answered`/`disabled` locking.
- **task-3 C6 (@s3):** added `correctOptionId`, `optionState()`, result banner (`tertiaryContainer`). Correction (Slice-1 review R1): removed untested `accessibilityRole="alert"`/`accessibilityLiveRegion` (TDD Law 3) — deferred to task-7.
- **task-3 C7 (@s4):** passed on C6's general logic (documented, no prod change).
- **task-3 C8 (@s5):** added `explanation` conditional block; absence branch covered same cycle.
- **task-3 C9 (@s6):** locked-tap test passed (pins `AnswerOption` `disabled` wiring); kept as regression guard. Added `multiple-choice.stories.tsx` (Unanswered/AnsweredCorrect/AnsweredIncorrect).
- **task-4 C10 (@s2):** GREEN minimal `MultipleChoiceActivity` wrapper (`useState`, placeholder `LABELS`, `handleSelect`); press wrapped in `act()`.
- **task-4 C11 (@s6):** added `onAnswered` + `gradeMultipleChoice`; `handleSelect` guards `if (selectedOptionId) return`.
- **task-4 C12 (@s7):** slice integration test passed (real grader + organism). Exported via barrels.
- **task-5 C13 (@s8):** RED empty options → GREEN early-return unavailable notice (`options.length === 0`).
- **task-5 C14 (@s9):** RED bad `correctOptionId` → GREEN widened guard; REFACTOR named `isUnavailable`, moved derivations below guard.
- **task-5 C15 (@s9):** RED grader no-throw → GREEN added unknown-option guard. Added `Empty`/`Error` stories.

## Slice gates & per-slice reviews

- **Slice 1 gate:** check-types/test/lint green (components 73, study-buddy 30). Review R1: design APPROVED, code 1 minor (C6 correction) → fixed, amended `5f0124e`.
- **Slice 2 gate:** green (components 75, study-buddy 31). Review R1: code minor — bare `.toThrow()` tightened to message regex; amended `154ef44`. Review R2: code minor — redundant `options.length === 0 ||` collapsed to `!hasCorrectOption`; amended `9a060fa`.

## `@s` → test map (Slice 3)

| Scenario | Test(s) |
|---|---|
| @s10 | `multiple-choice-activity.test.tsx`: "labels the correct-answer banner from useLocalization()"; "labels the incorrect-answer banner and the explanation heading from useLocalization()"; "labels the unavailable notice from useLocalization()" — `migration-coverage.test.ts`: "every dotted key literal in multiple-choice-activity.tsx resolves in the en bundle" (real en/es/pt/de bundles, compiler-enforced key alignment) |
| @s11 | `multiple-choice.test.tsx`: "exposes a button role and an accessible label for every option"; "announces the result via an alert role, a live region, and AccessibilityInfo when answered"; "does not announce anything to assistive technology while unanswered" — `multiple-choice.e2e.js` (Playwright, Storybook `Interactive` story): "selecting the correct option shows the correct feedback"; "selecting an incorrect option shows incorrect feedback and reveals the correct option" |

## Cycles (Slice 3)

- **task-6 C16 (@s10):** RED wrapper uses placeholder `LABELS` → GREEN wire `useLocalization()`/`t('activity.mcq.*')`; two more label tests passed same cycle (documented).
- **task-6 C17 (@s10):** RED real-bundle key guard (added `MULTIPLE_CHOICE_ACTIVITY_DIR`, renamed `AUTH_COMPONENT_DIRS`→`KEY_EXISTENCE_DIRS`) → GREEN added `activity.mcq.{correct,incorrect,explanation,unavailable}` to en/es/pt/de (compiler-key-aligned). Gate: localization 56/56 green.
- **task-7 C18 (@s11):** button-role + accessible-name test passed (RN concatenates marker+label → "A Paris"); documented.
- **task-7 C19 (@s11):** RED banner has no live region → GREEN hoisted `answered`/`isCorrect`, added `resultLabel`, `useEffect` announce, `accessibilityRole="alert"` + `accessibilityLiveRegion`. Paired "unanswered → no announce" passed. Correction (Slice-3 review R1, major): `alert`+`polite` was an undocumented hybrid; chose `assertive` (matches LoginForm error banner); RED test updated first, GREEN changed to `assertive`. Gate: components 78/78.
- **task-7 Playwright e2e** (`libs/components/tests/e2e/organisms/multiple-choice/multiple-choice.e2e.js`): render-only + feedback tests. Discovered controlled-organism stories' `onSelectOption` is a no-op stub; added an `Interactive` story (real `useState`, per `language-selector` precedent) and pointed feedback tests at it. Ran 31/31 green.
- **Slice 3 gate:** check-types/test/lint/e2e green (components 78, study-buddy 34, localization 56, e2e 31). Slice-3 per-slice review APPROVED. All 7 tasks done; `@s1`–`@s11` each map to ≥1 passing test.

## Full review — Round 1 fix pass (post all-slices, commit `5dd0161`)

Full 6-reviewer + mutation R1 = CHANGES_REQUESTED (1 blocker + 1 major + 4 minor + 2 mutation survivors). One consolidated TDD pass:

- **B1 (blocker):** feedback-icon ligature leaked into option accessible name. RED new `answer-option.test.tsx` (explicit `accessibilityLabel` override) → GREEN added optional `accessibilityLabel` prop (`?? \`${marker} ${label}\``); organism `optionAccessibilityLabel()` conveys correctness via localized words, not ligature.
- **M1 (major):** uniform assertive/alert on both banners. RED correct-case expects `polite`/no-role, incorrect keeps `assertive`/`alert` → GREEN `accessibilityRole={isCorrect ? undefined : 'alert'}`, `accessibilityLiveRegion={isCorrect ? 'polite' : 'assertive'}`.
- **m1 (minor, mutation survivor):** `useEffect` dep array. RED mount→answered rerender test (killed `[]` mutant, reverted) → no prod change (test gap only).
- **m2 (minor, mutation survivor):** re-selection lock guard. RED mocked-`MultipleChoice` test so second press reaches `onSelectOption` (killed `if(false) return` mutant, reverted) → no prod change.
- **m3 (minor):** dead `ActivityType`/`ActivityAnswer` scaffolding — deleted (YAGNI); check-types green.
- **m (minor):** Playwright locator style — `text=` → `getByText(..., {exact:true})`.
- **m (minor):** i18n key/field mapping — added explaining comment on `explanationHeading: t('activity.mcq.explanation')`.
- **m4 (minor, judgment call):** possible duplicate Android TalkBack — kept dual mechanism; comment rewritten (RN `accessibilityLiveRegion` is Android-only, imperative call is iOS's only channel; matches `LoginForm` precedent). Carried to R2.
- **Gate:** components 84/84 (7 suites), study-buddy 35/35, full check-types/test/lint/e2e green.

## Full review — Round 2 → Round 3 fix pass (commit `38c450b`)

R2 carried m4 (minor) + one mutation blocker (`answer-option.tsx:50`). Round 3 of the cap:

- **m4 (minor, accessibility):** RED new Android-scoped describe block (`Platform.OS='android'` → no `announceForAccessibility`; reproduced pre-fix) → GREEN added `Platform.OS !== 'android'` guard to the announce `useEffect`; added `it.each(['ios','web'])` still-fires tests. `multiple-choice.test.tsx` 19/19.
- **Mutation survivor `answer-option.tsx:50`** (`?? \`${marker} ${label}\`` → `""`): root-caused (RTL's `computeAriaLabel` truthy check falls through to child-text concatenation, reconstructing the same name). Fix: added direct-prop assertion `props.accessibilityLabel` `toBe('A Paris')`; verified kills the mutant (Stryker scoped run: Killed). No prod change.
- **Gate:** components 87/87 (7 suites), study-buddy 35/35, services 38/38, hooks 21/21, localization 56/56; full check-types/test/lint/e2e (31/31) green.

`review.md`/`review-*.md`/`mutation.md` are reviewer-owned. One minor (m4-b) remains open as a documented human-accepted risk (see `review.md`, `spec.md` Human-accepted risks, `dod.md`).

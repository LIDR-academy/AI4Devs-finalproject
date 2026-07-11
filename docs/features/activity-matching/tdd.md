# TDD log — activity-matching

Strict Red→Green→Refactor, one `@s` scenario at a time, per `.agents/rules/tdd.md`. This log
covers **Slice 1** (tasks 1–4: types + grader + `Matching` organism + `MatchingActivity` wiring).

## Build order

Per `tasks.md`: data/domain backbone first (task-1 types → task-2 grader), then UI
(task-3 organism → task-4 wiring + integration).

## `@s` → test map (Slice 1)

| Scenario | Test(s) |
|---|---|
| @s1 | `matching.test.tsx`: "renders both columns unpaired and tappable with Submit disabled" |
| @s2 | `matching.test.tsx`: "marks a tapped unpaired item as the pending selection" |
| @s3 | `matching.test.tsx`: "forms a pair when tapping left then right"; "forms a pair when tapping right then left" |
| @s4 | `matching.test.tsx`: "deselects the pending item when tapped again" |
| @s5 | `matching.test.tsx`: "retargets pending when tapping another item in the same column" |
| @s6 | `matching.test.tsx`: "releases a pair when a paired item is tapped before submit" |
| @s7 | `matching.test.tsx`: "keeps Submit disabled while at least one item is unpaired"; "enables Submit when every item is paired" |
| @s8 | `matching.test.tsx`: "calls onSubmit with formed pairs and locks when result is set"; `matching-activity.test.tsx`: "locks the activity after submit"; "exposes graded answered state and renders feedback end to end" |
| @s9 | `grade-matching.test.ts`: "returns isCorrect true and full answered-state when every pair matches"; `matching.test.tsx`: "marks every pair correct and shows the correct banner when result is all-correct" |
| @s10 | `grade-matching.test.ts`: "returns partial counts and isCorrect false when some pairs are wrong"; `matching.test.tsx`: "marks pairs correct/incorrect and shows the incorrect banner for mixed results" |
| @s11 | `matching.test.tsx`: "shows the explanation with results when provided"; `matching-activity.test.tsx`: "forwards the slide explanation after submit" |
| @s12 | `grade-matching.test.ts`: all-correct / partial / zero-correct shape tests; `matching-activity.test.tsx`: "emits answered state once with correct partial counts and ignores re-submit" |
| @s15 | `grade-matching.test.ts`: `isMatchingSlideValid` false cases + grader throws on invalid; `matching-activity.test.tsx`: "passes unavailable and never grades when the slide is invalid"; `matching.test.tsx`: "shows unavailable notice when unavailable prop is true" (wrapper-driven; Empty/Error self-detect → Slice 2) |

Deferred to later slices: @s16 (task-6), @s17 (task-7), stories/e2e (tasks 8–9).

## Cycles

### task-1 + task-2 — types + `gradeMatching` / `isMatchingSlideValid`

**Cycle 1 (@s9, @s12)**
- RED: `grade-matching.test.ts` — "returns isCorrect true and full answered-state…". Failed: `Cannot find module './grade-matching'`.
- GREEN: added `MatchingItem`/`MatchingPair`/`MatchingSlide` to `lesson.ts`, `GradedPair`/`MatchingAnswer`/`ActivityAnswer` to `activity-answer.ts`; implemented `gradeMatching` + `isMatchingSlideValid` (obvious pure implementation).
- REFACTOR: none.

**Cycle 2 (@s10, @s12 partial/zero)**
- RED→GREEN: mixed + zero-correct tests passed immediately (cycle 1 implementation already general). Kept as shape/partial-credit guards.

**Cycle 3 (order-independence + defensive throws + @s15 validity)**
- RED→GREEN: order-independent grading, unknown-id throw, invalid-slide throw, and `isMatchingSlideValid` empty/unequal/unknown-id/duplicate-left cases — all green on existing implementation.
- Exported via `libs/study-buddy/src/index.ts`.

### task-3 — `Matching` organism

**Cycle 4 (@s1 — render)**
- RED: "renders both columns unpaired…". Failed: `Cannot find module './matching'`.
- GREEN: `matching.tsx` with columns + Submit disabled + theme tokens.

**Cycles 5–11 (@s2–@s8 tap-to-pair + submit gate + lock)**
- RED/GREEN: pending, form-pair (both orders), deselect, retarget, release, submit gate, onSubmit + lock via `result`. Presses wrapped in `act()` (RN Testing Library + React 19).
- Pair formation asserted via `accessibilityState.selected` (not color alone).

**Cycles 12–14 (@s9–@s11 results)**
- RED/GREEN: all-correct / mixed banners + icons (`check_circle`/`cancel`) + explanation. Wrapper-driven `unavailable` prop honored (Slice 2 owns Empty/Error self-detect).
- Exported via `libs/activities/src/organisms/index.ts`.

### task-4 — `MatchingActivity` wiring

**Cycle 15 (@s8 lock)**
- RED: module missing. GREEN: wrapper with `useState`, `isMatchingSlideValid`, `gradeMatching`, labels via `t('activity.matching.*')` placeholders.

**Cycle 16 (@s12 emit-once)**
- GREEN: `handleSubmit` guards `if (answer || !valid) return`; fake Matching isolates wrapper lock.

**Cycle 17 (@s8/@s12 integration + @s11 + @s15)**
- End-to-end real grader + organism; explanation forwarded; invalid slide → `unavailable: true`, no `onAnswered`.
- Exported via `libs/study-buddy/src/index.ts`.

## Gate checks (Slice 1)

- `pnpm --filter @helsoft/types --filter @helsoft/study-buddy --filter @helsoft/activities check-types` — green.
- `pnpm --filter @helsoft/study-buddy test` (grade-matching + matching-activity) — 17 tests green.
- `pnpm --filter @helsoft/activities test` (matching) — 15 tests green.
- `pnpm lint` — green.
- No hardcoded user-facing chrome (labels/`t()`); styling via theme tokens only.
- No commit (orchestrator commits after slice review).

## Slice 1 review re-work (design findings)

### Cycle 18 (major — summary on-* on colored banner)
- RED: `matching.test.tsx` — "colors the all-correct summary with onTertiaryContainer"; "colors the mixed/incorrect summary with onErrorContainer". Failed: summary used `onSurfaceVariant` (`#414950`).
- GREEN: `styles.summary(isCorrect)` mirrors `bannerText` — `onTertiaryContainer` / `onErrorContainer`.
- REFACTOR: none (parallel to existing `bannerText`).

### Cycle 19 (minor — item minHeight → layout.touchTarget)
- RED: `matching.test.tsx` — "uses layout.touchTarget for item minHeight" (source token assert; numeric value identical to `spacing.s12`). Failed: `minHeight: theme.spacing.s12`.
- GREEN: `minHeight: theme.layout.touchTarget`.
- REFACTOR: none.

Gate re-check: `pnpm --filter @helsoft/activities test` — green. No commit.

## Slice 2 — Empty + Error (task-5)

### `@s` → test map (Slice 2)

| Scenario | Test(s) |
|---|---|
| @s13 | `matching.test.tsx`: "shows unavailable notice when a column is empty" |
| @s14 | `matching.test.tsx`: "shows unavailable notice when column lengths differ" |
| @s15 | `matching.test.tsx`: "shows unavailable notice when unavailable prop is true" (Slice 1); wrapper path in `matching-activity.test.tsx` unchanged |

### Cycles

**Cycle 20 (@s13 — Empty)**
- RED: empty `leftItems` still rendered columns/Submit. GREEN: organism self-detects `isEmpty` → early unavailable return.
- REFACTOR: none.

**Cycle 21 (@s14 — unequal Error)**
- RED: unequal lengths still rendered content. GREEN: `isUnequal` folded into `isUnavailable` with empty + wrapper flag.
- REFACTOR: single `isUnavailable` boolean for the three triggers.

## Gate checks (Slice 2)

- `pnpm --filter @helsoft/activities test` — 20 matching + MC green.
- `pnpm --filter @helsoft/study-buddy test` — green (incl. MatchingActivity @s15).
- `pnpm --filter @helsoft/activities --filter @helsoft/study-buddy check-types` — green.
- `pnpm lint` — green.
- No commit (orchestrator commits after slice review). No Slice 3 started.

## Slice 3 — i18n + a11y + Storybook + Playwright e2e (tasks 6–9)

### `@s` → test map (Slice 3)

| Scenario | Test(s) |
|---|---|
| @s16 | `migration-coverage.test.ts`: matching-activity key existence; `matching-activity.test.tsx`: "injects chrome labels…"; "interpolates the summary string…" |
| @s17 | `matching.test.tsx`: button role/label; pending/paired via `accessibilityState`; text+icon+label correctness; polite/assertive announce; Android platform guard; touchTarget (Slice 1) |
| @s1,@s7,@s8,@s9,@s10,@s13,@s14 | `matching.stories.tsx` Unpaired / PartiallyPaired / SubmittedAllCorrect / SubmittedMixed / Empty / Error (+ Interactive) |
| @s2,@s3,@s6,@s7,@s8,@s9,@s10 | `matching.e2e.js` Interactive + static story assertions |

### Cycles

**Cycle 22 (@s16 — i18n keys)**
- RED: `migration-coverage` matching-activity dir — missing `activity.matching.*` keys.
- GREEN: added `activity.matching` block to en/es/pt/de (`submit`, `correct`, `incorrect`, `correctPair`, `incorrectPair`, `explanationHeading`, `summary` with `{{correct}}`/`{{total}}`, `unavailable`). Wrapper already wired via `t()`.
- REFACTOR: none. Summary interpolation covered in `matching-activity.test.tsx`.

**Cycle 23 (@s17 — a11y)**
- RED→GREEN: a11y suite (roles, labels, selected state, text+icon correctness, live-region + `announceForAccessibility`, Android guard, transition announce). Implementation already present from Slice 1; tests encode the contract.
- REFACTOR: none.

**Cycle 24 (stories + `initialPairs` seed)**
- RED: "seeds formed pairs from initialPairs…" — prop missing.
- GREEN: optional `initialPairs` on `Matching`; stories: Unpaired, PartiallyPaired, SubmittedAllCorrect, SubmittedMixed, Empty, Error, Interactive.
- REFACTOR: none.

**Cycle 25 (Playwright e2e)**
- GREEN: `matching.e2e.js` — 12 cases covering static stories + Interactive pair/release/submit/all-correct/mixed flows.

## Gate checks (Slice 3)

- `pnpm lint` — green.
- `pnpm check-types` — green.
- `pnpm --filter @helsoft/{localization,activities,study-buddy} test` — green.
- `pnpm --filter @helsoft/activities exec playwright test --reporter=list` (matching.e2e.js) — 12 passed.
- No commit (orchestrator commits after slice review).

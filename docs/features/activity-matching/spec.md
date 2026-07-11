---
feature: activity-matching
story: user-stories/activity-matching.md
status: spec_ready
---

# Spec — activity-matching

## Summary
Render and grade a **matching** activity slide (PRD R3, in scope for v1). A learner is shown two columns of related items — a left column and a right column — and pairs them by **tapping one item then its match in the other column** (no drag-and-drop, PRD Non-Goal #7). Pairing is cross-column only (left↔right). Feedback is **deferred to an explicit Submit**, unlike multiple-choice's immediate-per-answer feedback: the learner forms pairs first, then Submits to see which pairs were right. Submit is **only enabled once every item is paired**; on Submit each pair is graded against the slide's correct pairing, each pair shows its correct/incorrect result, and the activity is **locked** (no re-pairing, no retry — same product decision as the other system-checked types). The graded result is surfaced as a typed **answered-state** object with **per-pair partial credit** (`correctPairCount` / `totalPairCount`) so R7 (end-of-lesson score) and R9 (resume) can consume/persist it later.

Scope is only the matching type: extending the `Slide` discriminated union with a `MatchingSlide` payload (left items, right items, correct pairing by ids) in `libs/types/src/lesson.ts`; a pure grading function (no I/O — the correct pairing arrives with the slide) in `@helsoft/study-buddy`; a presentational organism `Matching` in `@helsoft/activities`; and a thin feature-wiring component `MatchingActivity` in `@helsoft/study-buddy`. Slide-to-slide navigation (R4) and saving/resuming (R9) are **separate stories** — this story only exposes the answered-state shape those stories will persist. No analytics and no feature flags. The split mirrors the shipped multiple-choice precedent (`MultipleChoice` presentational organism ← `MultipleChoiceActivity` wiring): the organism owns the ephemeral tap-to-pair interaction and Submit gate; the wrapper injects `t()` labels, grades on Submit, and emits the answered state once.

## User stories
- As a **learner**, I want **to pair related items by tapping one then its match on a matching activity slide, and see which pairs I got right on Submit**, so that **I know which relationships I understood without needing drag-and-drop**.

## Building blocks already in place (this feature reuses, does not rebuild)
- **`Card`** atom (surface container), **`Icon`** atom, theme tokens (`colors`, `typography`, `spacing`, `shape`) from `@helsoft/components` — used for the item tiles, columns, result banner, and explanation surfaces. `react-native-unistyles` `StyleSheet.create` for theming (no hardcoded colors/dimensions).
- **`@helsoft/localization`** (`useLocalization()` → `t()`, key-aligned `en/es/pt/de` bundles) and the `labels`-injection pattern (the presentational organism stays locale-agnostic; the study-buddy wrapper injects `t()`).
- **`@helsoft/activities`** library scaffold (Storybook + Jest + Playwright + Stryker) already hosts the migrated `MultipleChoice` organism — `Matching` lands beside it under `src/organisms/matching/`.
- **Layering + split precedent**: `MultipleChoice` (presentational organism, `@helsoft/activities`) ← `MultipleChoiceActivity` (feature wiring + grading, `@helsoft/study-buddy`) ← thin app screen. `gradeMultipleChoice` (pure grader in study-buddy) is the precedent for `gradeMatching`.

## Data contract — `Slide` union + answered state
Extend the existing discriminated union (`libs/types/src/lesson.ts`) with a `matching` payload and grow `ActivitySlide`. No code constructs matching slides yet (R2 generation is a separate story), so the change is additive/safe (see risks R1). `content` holds the activity **prompt/instructions** for the matching task (same `SlideBase.content` convention multiple-choice uses for its question).

```ts
// libs/types/src/lesson.ts
export type MatchingItem = {
  /** Stable id used to reference the item in the correct pairing and the answered state (persist-friendly for R9). */
  id: string;
  label: string;
};

/** One correct correspondence: a left item id ↔ a right item id. Left↔right only (cross-column). */
export type MatchingPair = {
  leftId: string;  // references one leftItems[].id
  rightId: string; // references one rightItems[].id
};

export type MatchingSlide = SlideBase & {
  kind: 'activity';
  activityType: 'matching';
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  /**
   * The correct pairing — exactly one pair per left item (a perfect matching).
   * Invariant: leftItems.length === rightItems.length === correctPairs.length,
   * and every leftId/rightId references a distinct item in its column.
   */
  correctPairs: MatchingPair[];
  /** Optional teaching note shown with the results. */
  explanation?: string;
};

export type ActivitySlide = MultipleChoiceSlide | MatchingSlide; // union grows as sibling stories land
```

```ts
// libs/types/src/activity-answer.ts — answered-state exposed for R7 (score) & R9 (resume)
/** A learner-formed pair with its graded result. */
export type GradedPair = {
  leftId: string;
  rightId: string;
  isCorrect: boolean; // this left↔right pairing is in the slide's correctPairs
};

export type MatchingAnswer = {
  slideId: string;
  activityType: 'matching';
  /** The learner's pairs at Submit (all items paired — Submit gate), each with its result. */
  pairs: GradedPair[];
  /** Per-pair partial credit toward R7 (correct / total). */
  correctPairCount: number;
  totalPairCount: number; // === slide.correctPairs.length
  /** Derived: true iff correctPairCount === totalPairCount (every pair correct). */
  isCorrect: boolean;
};

export type ActivityAnswer = MultipleChoiceAnswer | MatchingAnswer; // union grows with sibling types
```

**Pure grading function** (no DAO/service — no I/O; the correct pairing is on the slide). Signatures only; the `implementator` writes the bodies TDD-first.

```ts
// libs/study-buddy/src/grading/grade-matching.ts

/** True iff the slide is renderable/gradable: both columns non-empty, equal length, and
 *  correctPairs is a perfect matching whose leftId/rightId all reference distinct items. */
isMatchingSlideValid(slide: MatchingSlide): boolean

/** Grades the learner's pairs against slide.correctPairs. Called only with a full pairing
 *  (Submit gate guarantees pairs.length === leftItems.length). Guards defensively for R7/R9
 *  callers: throws if the slide is invalid or a pair references an unknown left/right id.
 *  A learner pair is correct iff an identical {leftId,rightId} exists in slide.correctPairs. */
gradeMatching(slide: MatchingSlide, pairs: MatchingPair[]): MatchingAnswer
// - correctPairCount = pairs matching a correctPair; totalPairCount = slide.correctPairs.length
// - isCorrect = correctPairCount === totalPairCount
```

## Component contract
**`Matching`** — presentational organism, `libs/activities/src/organisms/matching/matching.tsx`. Owns only the **ephemeral tap-to-pair interaction** (pending selection + formed pairs) while unsubmitted; becomes **controlled/locked** once the `result` prop is set. Reports the formed pairs up via `onSubmit`. Owns no domain/grading state (the study-buddy wrapper owns lock + grading), mirroring the `MultipleChoice` split.

```ts
export type MatchingItemView = { id: string; label: string };
/** A learner-formed pair before submit. */
export type MatchingPairSelection = { leftId: string; rightId: string };
/** A graded pair, supplied post-submit to drive the result display. */
export type MatchingResultPair = { leftId: string; rightId: string; isCorrect: boolean };

export type MatchingResult = {
  pairs: MatchingResultPair[]; // learner pairs, each with correctness (source of truth once submitted)
  isCorrect: boolean;          // all pairs correct
  summary: string;             // pre-resolved "{n} of {total} correct" (wrapper interpolates t())
};

export type MatchingLabels = {
  submit: string;              // Submit button
  correct: string;             // result banner when every pair is correct
  incorrect: string;           // result banner when at least one pair is wrong
  correctPair: string;         // a11y suffix on a correctly-paired item post-submit
  incorrectPair: string;       // a11y suffix on an incorrectly-paired item post-submit
  explanationHeading: string;  // heading above the explanation
  unavailable: string;         // Empty/Error fallback notice
};

export type MatchingProps = {
  prompt: string;
  leftItems: MatchingItemView[];
  rightItems: MatchingItemView[];
  /** Forces the unavailable (Error) state — set by the wrapper when the slide's correctPairs are malformed. */
  unavailable?: boolean;
  /** Set once graded → locks the activity and drives the per-pair result display. */
  result?: MatchingResult | null;
  explanation?: string;
  labels: MatchingLabels;
  onSubmit: (pairs: MatchingPairSelection[]) => void;
};
```

**Selection UX (unsubmitted, human-locked Decision 4).** A "pending" item is the first tap awaiting its match; a "paired" item is already in a formed pair.
- **1st tap** (unpaired item, no pending) → that item becomes **pending** (highlighted, `accessibilityState.selected`).
- **2nd tap on an opposite-column unpaired item** → **form the pair** (pending↔tapped) and clear pending. Order-independent (left-first or right-first).
- **Tap the same pending item again** → **deselect** (clear pending; no pair).
- **Tap a different item in the same column as pending** → **retarget** pending to the newly tapped item.
- **Tap any already-paired item** → **release** its pair (both items return to unpaired) and clear any pending. (Only unpaired items can ever be a pairing target, so a pair only ever joins two unpaired items.)

**Submit gate (human-locked Decision 6 — overrides the story's unpaired-submit AC).** Submit is **disabled until `formedPairs.length === leftItems.length`** (every item paired). There is **no unpaired-submit path**. On press → `onSubmit(pairs)`; the wrapper grades and feeds `result` back down.

**Result display (locked).** When `result` is set: all items non-interactive; each pair rendered from `result.pairs` and marked correct/incorrect by **text + icon** (`check_circle` / `cancel`, not color alone); a result banner (`labels.correct` if `result.isCorrect` else `labels.incorrect`) is shown and announced to assistive tech (live region); `result.summary` (partial count) shown; explanation shown under `explanationHeading` when present.

**Unavailable (Empty/Error).** Renders `labels.unavailable`, nothing interactive, no crash, when: `unavailable === true` (malformed `correctPairs`, from the wrapper) **or** either column is empty (Empty) **or** `leftItems.length !== rightItems.length` (invariant/Error) — the last two are self-detected from the organism's own props (defense-in-depth).

**`MatchingActivity`** — feature wiring, `libs/study-buddy/src/components/matching-activity/matching-activity.tsx`.
```ts
export type MatchingActivityProps = {
  slide: MatchingSlide;
  onAnswered?: (answer: MatchingAnswer) => void;
};
```
Computes `const valid = isMatchingSlideValid(slide)`. Owns `useState<MatchingAnswer | null>(null)`. `handleSubmit(pairs)`: if already answered → ignore (lock); else `const answer = gradeMatching(slide, pairs)`, store it, call `onAnswered(answer)` **once**. Builds the organism's `result` from the answer (`pairs`, `isCorrect`, `summary = t('activity.matching.summary', { correct, total })`). Injects `labels` via `t('activity.matching.*')`. Passes `prompt = slide.content`, `unavailable={!valid}`. When invalid it never calls the grader (the organism shows unavailable).

## Acceptance criteria (Given/When/Then)
- **AC1** — Given a matching slide, When it renders, Then both columns of items are visible, all unpaired, all tappable, and no drag interaction exists. *(→ @s1)*
- **AC2** — Given no pending selection, When the learner taps an unpaired item, Then that item becomes the pending selection (highlighted). *(→ @s2)*
- **AC3** — Given a pending item, When the learner taps an unpaired item in the opposite column (in either order), Then a pair is formed between them, both are marked paired (not yet graded), and no item stays pending. *(→ @s3)*
- **AC4** — Given a pending item, When the learner taps that same pending item again, Then it is deselected and no pair is formed. *(→ @s4)*
- **AC5** — Given a pending item, When the learner taps a different item in the same column, Then the pending selection retargets to the newly tapped item and the first is no longer pending. *(→ @s5)*
- **AC6** — Given an already-paired item before Submit, When the learner taps it, Then its pair is released and both items become unpaired again. *(→ @s6)*
- **AC7** — Given at least one item is still unpaired, When the slide is shown, Then Submit is disabled; and once every item is paired Submit becomes enabled. *(→ @s7)*
- **AC8** — Given every item is paired, When the learner taps Submit, Then each formed pair is graded, each pair's correct/incorrect result is shown, and the activity is locked (items non-interactive, no re-pairing). *(→ @s8)*
- **AC9** — Given every formed pair matches the correct pairing, When results are shown, Then every pair is marked correct and a correct (all-correct) result is shown. *(→ @s9)*
- **AC10** — Given some formed pairs do not match the correct pairing, When results are shown, Then the matching pairs are marked correct, the non-matching pairs are marked incorrect, and an incorrect (mixed) result is shown. *(→ @s10)*
- **AC11** — Given the slide has an explanation, When results are shown, Then the explanation is displayed alongside them. *(→ @s11)*
- **AC12** — Given the learner submits, When it is graded, Then the result is exposed as this slide's answered state (`{ slideId, activityType, pairs, correctPairCount, totalPairCount, isCorrect }`) with per-pair partial counts and `isCorrect` true iff all pairs correct, so it can feed the end-of-lesson score (R7) and be persisted for resume (R9). *(→ @s12)*
- **AC13** — Given a slide with an empty left or right item list, When it renders, Then an unavailable notice is shown instead of the columns and nothing is interactive. *(→ @s13)*
- **AC14** — Given a slide whose left and right lists differ in length (invariant violation), When it renders, Then an unavailable notice is shown and the slide does not crash. *(→ @s14)*
- **AC15** — Given a slide whose `correctPairs` are malformed (an id references no item, or it is not a perfect one-per-left matching), When it renders, Then an unavailable notice is shown, the slide does not crash, and no grading is attempted. *(→ @s15)*
- **AC16** — Given a supported app locale, When the slide and its results render, Then the Submit label, result labels, per-pair result wording, summary, explanation heading, and unavailable notice come from the active locale bundle and no user-facing chrome string is hardcoded. *(→ @s16)*
- **AC17** — Given the slide is shown, Then each item exposes a button role and an accessible label, the pending/paired state is conveyed via accessibility state (not color alone), each pair's correctness is conveyed by text and icon, the result is announced to assistive technology on Submit, and interactive targets meet the minimum touch-target size. *(→ @s17)*

## UI states (`Matching` organism)
The 4-state model for a synchronous, presentational activity slide. Loading is scoped out with rationale (see Open decisions); Content carries the story-required substates; Empty/Error are graceful-degradation states.

| State | Trigger | Notes |
|---|---|---|
| Loading | **N/A for this component.** The deck is already generated/loaded before a slide mounts; deck loading is owned by the R4 player. | No Loading UI here — documented Open decision, not an omission. |
| Content | Valid slide (both columns non-empty, equal length, well-formed `correctPairs`). **(a) unpaired** — all items interactive, none paired, Submit disabled. **(b) partially/fully paired (pre-submit)** — some/all pairs formed; Submit enabled only when all paired. **(c) submitted-all-correct** — every pair correct + correct banner + summary (+ explanation). **(d) submitted-mixed** — correct/incorrect per pair + incorrect banner + summary (+ explanation). | The story-required `matching.stories.tsx` states: unpaired / partially-paired / submitted-all-correct / submitted-mixed. |
| Error | Malformed slide: unequal column lengths **or** `correctPairs` reference unknown ids / not a perfect matching. | Renders `labels.unavailable`, non-interactive, **no crash**, no grading. Guards R2 shape drift (risks R1). |
| Empty | Either the left or right item list is empty. | Renders `labels.unavailable`, non-interactive. Nothing to show. |

## Answered-state / output contract
`gradeMatching` returns, and `MatchingActivity.onAnswered` emits **once**, a `MatchingAnswer`:

| Field | Meaning | Consumer |
|---|---|---|
| `slideId` | The slide graded | R9 (key the persisted attempt) |
| `activityType` | `'matching'` (discriminant) | R7/R9 (branch by type) |
| `pairs` | Learner's pairs, each `{ leftId, rightId, isCorrect }` | R9 (re-hydrate the answered view on resume without re-grading) |
| `correctPairCount` | Pairs that match the correct pairing | R7 (partial credit toward correct / total) |
| `totalPairCount` | `slide.correctPairs.length` | R7 (denominator) |
| `isCorrect` | `correctPairCount === totalPairCount` | R7/R9 (whole-slide correct flag) |

Invalid-input contract: `gradeMatching` throws if the slide is invalid or a submitted pair references an unknown id (a caller bug). The UI never reaches this — the wrapper guards with `isMatchingSlideValid` and the organism only submits ids it rendered, fully paired — but the domain layer guards defensively for R7/R9 callers.

## Analytics events
None — deferred per the story ("No analytics events for this story at this time").

## Feature flags
None — not mentioned in the story; the type ships unconditionally as a v1 R3 type.

## Out of scope / non-goals
- **Drag-and-drop** — explicitly excluded (PRD Non-Goal #7); tap-to-select-two only.
- **Unpaired submit** — excluded by human-locked Decision 6 (overrides the story's unpaired-submit AC): Submit is gated on all-items-paired.
- **Slide navigation / lesson player** (R4) — separate story; this component renders one slide and reports its answer.
- **Persistence / resume** (R9) — separate story; this story only *exposes* the answered-state shape R9 will persist.
- **End-of-lesson scoring UI** (R7) — separate story; this story only *feeds* it via `correctPairCount` / `totalPairCount` / `isCorrect`.
- **Retry / re-pairing after submit** — excluded (no retry; learning gain measured via whole-lesson retakes, R7).
- **Same-column pairs / many-to-one matching** — left↔right only, one-per-left perfect matching.
- **Other activity types** (multiple-choice already shipped; fill-in-the-blank, flashcard, open-ended) — their own stories; the union extends but only `matching` is implemented here.
- **AI generation of the slide** (R2) — the slide arrives pre-populated; this story only coordinates the payload shape.
- **Analytics & feature flags** — deferred / not in scope.

## Open decisions (resolved with rationale — override at the gate)
- **Decision (human-locked):** Scoring is **per-pair partial credit** — `correctPairCount` / `totalPairCount`, with `isCorrect` derived true iff all pairs correct. — **why:** R7 sums correct/total across gradable items; per-pair credit lets a mostly-correct matching contribute proportionally rather than all-or-nothing, and the derived whole-slide `isCorrect` still supports a binary view. (Resolves the story's open scoring-granularity note.)
- **Decision (human-locked):** Pairing is **left↔right (cross-column) only**; no same-column pairs. — **why:** matching semantics are a correspondence between two sets; same-column pairs are meaningless for the task and would complicate both UX and grading.
- **Decision (human-locked):** Invariant **`leftItems.length === rightItems.length`** (a perfect one-per-left matching). — **why:** every left item has exactly one correct right match; unequal lengths imply a malformed slide → Error state.
- **Decision (human-locked):** **Submit is enabled only when every item is paired**; no unpaired-submit path. After Submit → per-pair correct/incorrect + lock. — **why:** a partial matching is ambiguous to grade fairly and the tap-to-pair UX makes "pair everything, then submit" the natural loop; **this overrides the story AC that allowed unpaired submit** (which had graded unpaired items as incorrect).
- **Decision (human-locked):** **Empty** (either column empty) and **Error** (mismatched pairing ids / unequal lengths) → unavailable notice, **no in-slide retry**. Empty = nothing to show. — **why:** these are malformed-payload conditions from upstream (R2), not learner-recoverable; degrade gracefully instead of crashing.
- **Decision (human-locked):** **Architecture** — `Matching` organism in `@helsoft/activities` + `MatchingActivity` wiring in `@helsoft/study-buddy` (labels/`t()` injection, grader call, answered-state callback). — **why:** mirrors the shipped `MultipleChoice`/`MultipleChoiceActivity` split; keeps the design-system/presentational layer locale- and domain-agnostic; keeps grading (domain logic for R7/R9) in the feature lib per `global.mdc`.
- **Decision:** The organism owns the **ephemeral tap-to-pair interaction state** (pending + formed pairs) while unsubmitted, unlike the fully-controlled `MultipleChoice`. — **why:** the multi-tap pairing interaction is pure view state with no domain meaning until Submit; hoisting every tap into study-buddy would leak interaction concerns across the layer boundary. The wrapper still owns the only domain state (the graded, locked answer). Each state (pending / paired / submitted / unavailable) stays independently render-testable, which mutation testing rewards.
- **Decision:** A pure **`isMatchingSlideValid`** helper (in study-buddy grading) drives the wrapper's `unavailable` prop, while the organism *also* self-detects empty/unequal-length from its own props. — **why:** the organism can't see `correctPairs` (it never renders them), so id-integrity validation belongs with the grader; duplicating the empty/unequal check in the organism is cheap defense-in-depth and gives both layers real branches to test.
- **Decision:** Grading lives as a **pure function in `@helsoft/study-buddy`** (`grade-matching.ts`), not a `libs/services` service/DAO and not co-located in `@helsoft/activities`. — **why:** no I/O (the correct pairing arrives on the slide), so `hooks-service-dao.mdc`'s I/O layers don't apply; `global.mdc` designates study-buddy as the home of business logic; co-locating in the presentational lib would bury domain logic or invert the dependency direction. Mirrors `gradeMultipleChoice`.
- **Decision:** No custom hook, no tanstack-query. — **why:** the only domain state is a single local submitted-answer with no network/cache concern; `hooks-service-dao.mdc` reserves hooks/tanstack-query for I/O.
- **Decision:** **Loading is N/A.** — **why:** the slide is synchronous and receives fully-loaded data as props; deck loading is upstream (R2/R4). Documented rather than invented.
- **Decision:** `content` holds the matching **prompt/instructions**; `title` is a short heading. — **why:** `SlideBase` already carries both; avoids a redundant field. Flagged for R2 coordination (risks R1).
- **Decision:** i18n localizes only **UI chrome** (`submit` / `correct` / `incorrect` / `correctPair` / `incorrectPair` / `explanationHeading` / `summary` / `unavailable`); item labels and explanation **text** come from AI-generated slide data and are not translated. — **why:** those are content, not chrome.

## Unresolved questions
_None — all product questions were resolved at the human-locked decision set above._

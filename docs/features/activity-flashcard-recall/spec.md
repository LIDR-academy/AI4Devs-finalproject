---
feature: activity-flashcard-recall
story: user-stories/activity-flashcard-recall.md
status: approved
---

# Spec — activity-flashcard-recall
_Keep terse. **Acceptance criteria are NOT duplicated here** — the `@s` scenarios in `gherkin-scenarios.md` are the ACs. Link, don't copy._

## Summary
Render a **flashcard / recall** activity slide (PRD R3, P0 floor type). The learner sees the **front/prompt** only; taps to **reveal** the **back/answer** (plus an optional explanation); then **self-marks** "Recalled" or "Not recalled". Unlike the three shipped, system-checked activity types (multiple-choice, fill-in-the-blank, matching), flashcard is **self-marked, not graded** — there is no grader module. The self-mark is locked once chosen and surfaced as the slide's typed **answered state** (`FlashcardAnswer`) so R9 (resume) can rehydrate it, but it is **excluded from the R7 end-of-lesson score** (self-signal only).

## User stories
- As a **learner**, I want **to reveal a flashcard's answer and mark for myself whether I recalled it**, so that **I can gauge my own understanding as I study, even though it isn't part of my graded score**.

## Building blocks already in place (this feature reuses, does not rebuild)
- **`Card`**, **`Icon`** atoms + theme tokens (`colors`, `typography`, `spacing`, `shape`) from `@helsoft/components`, styled via `react-native-unistyles` `StyleSheet.create` (no hardcoded colors/dimensions) — mirrors `Matching`/`FillInTheBlank`.
- **`@helsoft/localization`** (`useLocalization()` → `t()`, key-aligned `en/es/pt/de` bundles) — called **inside the organism**, same pattern as the shipped `Matching`/`FillInTheBlank`/`MultipleChoice`.
- **`@helsoft/activities`** scaffold (Storybook + Jest + Playwright + Stryker) already hosts `multiple-choice/`, `fill-in-the-blank/`, `matching/` — `flashcard/` lands beside them under `src/organisms/`.
- **R7 scorer is already flashcard-aware** — see Open decisions; this feature does not touch scoring.

## Data contract — `Slide` union + answered state
Additive extension of the existing discriminated union (`libs/types/src/lesson.ts`). No code constructs flashcard slides yet (R2 generation is a separate story), so the change is additive/safe (risks R1). `content` (from `SlideBase`) is the **front/prompt**; a dedicated `back` field carries the answer.

```ts
// libs/types/src/lesson.ts
export type FlashcardSlide = SlideBase & {
  kind: 'activity';
  activityType: 'flashcard';
  /** The answer revealed on the back of the card. Front/prompt = SlideBase.content. */
  back: string;
  /** Optional teaching note shown alongside the answer once revealed. */
  explanation?: string;
};

export type ActivitySlide =
  | MultipleChoiceSlide
  | MatchingSlide
  | FillInTheBlankSlide
  | FlashcardSlide; // union grows
```

```ts
// libs/types/src/activity-answer.ts — answered state exposed for R9 (resume). NOT scored (R7).
export type FlashcardAnswer = {
  slideId: string;
  activityType: 'flashcard';
  /** The learner's self-assessment: did they recall the answer? */
  recalled: boolean;
  /** Mirrors `recalled`; keeps every ActivityAnswer member structurally a GradedAnswer. Never counted by R7 — see Open decisions. */
  isCorrect: boolean;
};

export type ActivityAnswer =
  | MultipleChoiceAnswer
  | MatchingAnswer
  | FillInTheBlankAnswer
  | FlashcardAnswer; // union grows
```

**No grader.** Flashcard is self-marked — no `grade-flashcard.ts`. Two pure helpers live co-located in the organism folder (no I/O, so `hooks-service-dao.mdc`'s data layers don't apply, same as the shipped graders being pure functions):

```ts
// libs/activities/src/organisms/flashcard/flashcard.helpers.ts  (pure; TDD-first)
isFlashcardSlideValid(slide: FlashcardSlide): boolean   // front (content) and back both non-empty (trimmed)
buildFlashcardAnswer(slide: FlashcardSlide, recalled: boolean): FlashcardAnswer  // isCorrect mirrors recalled
```

## Component contract
**`Flashcard`** — presentational organism, `libs/activities/src/organisms/flashcard/flashcard.tsx`. Owns the reveal + self-mark interaction and the locked answered state; calls `useLocalization()` for chrome; emits `onAnswered` **once** on self-mark. File split per `.agents/rules/component-split.mdc` (mirrors `matching/`); field-level hook/component/helper split is in `task-3.md`.

```ts
// flashcard.types.ts
export type FlashcardLabels = {
  reveal: string;              // "Reveal answer" button (hidden state)
  recalled: string;            // "Recalled" self-mark action
  notRecalled: string;         // "Not recalled" self-mark action
  recalledConfirmed: string;   // locked confirmation when recalled chosen
  notRecalledConfirmed: string;// locked confirmation when not-recalled chosen
  answerHeading: string;       // heading above the revealed back
  explanationHeading: string;  // heading above the explanation
  unavailable: string;         // Empty/Error fallback notice
};

export type FlashcardProps = {
  slide: FlashcardSlide;
  onAnswered?: (answer: FlashcardAnswer) => void;
  /** Pre-marked answer (Storybook demos / R9 resume) — implies revealed + locked. */
  initialAnswer?: FlashcardAnswer | null;
  /** Seeds the revealed state before any tap (Storybook demos). */
  initialRevealed?: boolean;
};
```

**`FlashcardActivity`** — feature wiring, `libs/study-buddy/src/components/flashcard-activity/flashcard-activity.tsx`. Thin, mirrors the shipped `MatchingActivity`:
```ts
export type FlashcardActivityProps = { slide: FlashcardSlide; onAnswered?: (answer: FlashcardAnswer) => void };
export const FlashcardActivity = ({ slide, onAnswered }: FlashcardActivityProps) =>
  <Flashcard slide={slide} onAnswered={onAnswered} />;
```
Ships `flashcard-activity.stories.tsx` (`Features/FlashcardActivity`) like the three shipped wrappers (Open decisions).

## Acceptance criteria
→ **`gherkin-scenarios.md`** — each `@s` scenario is an acceptance criterion (Given/When/Then). Story→scenario map: front-only render → `@s1`; reveal → `@s2`; self-mark actions appear → `@s3`; self-mark locks + confirms → `@s4`; no change after lock → `@s5`; answered-state emitted + R7-excluded → `@s6`; explanation on reveal → `@s7`; plus unavailable `@s8`, i18n `@s9`, a11y `@s10`. The component-split AC is a build-time/structural constraint, not runtime — verified by task Done criteria + the architecture reviewer, not a `@s`.

## UI states (4-state model for a synchronous presentational activity slide)
| State | Trigger | Notes |
|---|---|---|
| Loading | N/A — the deck is generated/loaded before a slide mounts; deck loading is the R4 player's concern. | No Loading UI here — documented Open decision, matches shipped activity organisms. |
| Content | Valid slide (non-empty front + back). Substates: **(a) hidden** — front only, Reveal available; **(b) revealed-unmarked** — front + answer (+ explanation) + two self-mark actions; **(c) marked-recalled** — locked, recalled confirmed; **(d) marked-not-recalled** — locked, not-recalled confirmed. | Story-required states: hidden / revealed-recalled / revealed-not-recalled (+ revealed-unmarked, without-explanation, interactive). |
| Error | Missing `back` (answer). | `labels.unavailable`, non-interactive, no crash. Guards R2 shape drift (risks R1). |
| Empty | Missing `content` (front). | `labels.unavailable`, non-interactive. Empty + Error collapse to one "unavailable" path (`isFlashcardSlideValid`). |

## Answered-state / output contract
`buildFlashcardAnswer` returns, and `Flashcard.onAnswered` emits **once** on self-mark, a `FlashcardAnswer`:

| Field | Meaning | Consumer |
|---|---|---|
| `slideId` | The slide self-marked | R9 (key the persisted state) |
| `activityType` | `'flashcard'` (discriminant; the type R7 **excludes**) | R7/R9 (branch by type) |
| `recalled` | The learner's self-assessment | R9 (rehydrate the confirmed mark on resume) |
| `isCorrect` | `=== recalled`; mirrors `GradedAnswer`; **never counted** by R7 | R7 (ignored via its system-checked-slide filter) |

Reveal alone produces **no** answered state; only a self-mark does. An unrevealed/unmarked slide is simply "unanswered" (fine for R9).

## Analytics events
None — explicit in the story ("No analytics events for this story at this time; deferred"). Matches the matching/fill-in-the-blank precedent.

## Feature flags
None — not mentioned in the story; ships unconditionally as a v1 R3 P0-floor type, same as matching + fill-in-the-blank.

## Out of scope / non-goals
- **System grading** — self-marked only; no `grade-flashcard.ts`.
- **R7 score aggregate change** — this story doesn't modify `score-lesson.ts`/`activity-type.ts`.
- **Slide navigation/lesson player** (R4) — separate story; this renders one slide and reports its answer.
- **Persistence/resume** (R9) — separate story; this only exposes the `FlashcardAnswer` shape.
- **AI generation of the slide** (R2) — arrives pre-populated.
- **Un-reveal/re-mark/retry** — reveal is one-way; self-mark is a one-time lock.
- **Other activity types** — union extends but only `flashcard` is implemented here.

## Open decisions (resolved, with rationale)
- **R7 scorer needs no change.** `SYSTEM_CHECKED_ACTIVITY_TYPES` already omits `flashcard`, and `score-lesson.test.ts` already asserts a `flashcard` `GradedAnswer` is excluded from the total — touching the scorer is out of scope.
- **`content` = front/prompt; dedicated `back` = answer; `explanation?` optional.** Every shipped activity type reuses `SlideBase.content` for its prompt; a redundant `front` field would break that convention. Flagged for R2 coordination (risks R1).
- **`FlashcardAnswer` carries both `recalled` (semantic) and `isCorrect` (= recalled).** Preserves the structural `ActivityAnswer ⊆ GradedAnswer` invariant every member satisfies today (see task-1 for the `graded-answer.test.ts` extension); `recalled` keeps the domain-meaningful field for R9, and the mirror is safe since the scorer excludes flashcards by slide-id filter regardless of `isCorrect`. **Confirmed by human at the gate** (2026-07-11).
- **No grader module, no custom data hook, no tanstack-query.** No I/O and nothing computed against a correct answer; `hooks-service-dao.mdc` reserves data layers for I/O — `use-flashcard` is UI co-location only.
- **Architecture: `Flashcard` organism in `@helsoft/activities` + thin `FlashcardActivity` in `@helsoft/study-buddy`.** Mirrors the shipped `Matching`/`MatchingActivity` split; keeps the app screen a thin shell (`global.mdc`).
- **`FlashcardActivity` ships a `flashcard-activity.stories.tsx`** (`Default` + `WithoutExplanation`) — follows the precedent of all three shipped wrapper stories.
- **Reveal is one-way; self-mark is a one-time lock.** Story AC; consistent with the other types; simplifies R9 rehydrate. Both re-tapping the locked mark and switching marks are ignored (@s5).
- **Empty (missing front) and Error (missing back) collapse to one unavailable notice** via `isFlashcardSlideValid` — both are non-learner-recoverable malformed-payload conditions from upstream (R2); mirrors the other types.
- **Loading is N/A.** Synchronous slide receiving fully-loaded props; deck loading is upstream (R2/R4).
- **i18n localizes only UI chrome** under `activity.flashcard.*`; front/back/explanation text comes from AI-generated slide data and is not translated. Organism dir registers in `migration-coverage.test.ts`'s key-existence guard (task-6).

## Unresolved questions
None — the sole open question (`FlashcardAnswer` shape) was confirmed at the gate; see Open decisions.

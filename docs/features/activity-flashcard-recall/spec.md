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
- **`Card`**, **`Icon`** atoms + theme tokens (`colors`, `typography`, `spacing`, `shape`) from `@helsoft/components`, styled via `react-native-unistyles` `StyleSheet.create` (no hardcoded colors/dimensions) — mirrors `Matching` / `FillInTheBlank`.
- **`@helsoft/localization`** (`useLocalization()` → `t()`, key-aligned `en/es/pt/de` bundles). The shipped activity organisms (`Matching`, `FillInTheBlank`, `MultipleChoice`) call `useLocalization()` **inside the organism** and build a `labels` object — `Flashcard` follows that shipped pattern (not the older "wrapper injects labels" note in the matching spec).
- **`@helsoft/activities`** scaffold (Storybook + Jest + Playwright + Stryker) already hosts `multiple-choice/`, `fill-in-the-blank/`, `matching/` organisms — `flashcard/` lands beside them under `src/organisms/`.
- **R7 scorer is already flashcard-aware** — see Open decisions; **this feature does not touch scoring**.

## Data contract — `Slide` union + answered state
Additive extension of the existing discriminated union (`libs/types/src/lesson.ts`). No code constructs flashcard slides yet (R2 generation is a separate story), so the change is additive/safe (risks R1). `content` (from `SlideBase`) is the **front/prompt** — same convention multiple-choice/fill-in-the-blank use for their prompt; a dedicated `back` field carries the answer.

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
  /**
   * Mirrors `recalled` so every ActivityAnswer member stays structurally a `GradedAnswer`
   * (the shipped structural invariant). task-1 extends graded-answer.test.ts — which today
   * asserts the invariant only for MultipleChoiceAnswer — with the flashcard type-level check.
   * Deliberately NEVER counted toward R7: `isSystemCheckedActivity('flashcard') === false`
   * already excludes it.
   */
  isCorrect: boolean;
};

export type ActivityAnswer =
  | MultipleChoiceAnswer
  | MatchingAnswer
  | FillInTheBlankAnswer
  | FlashcardAnswer; // union grows
```

**No grader.** Flashcard is self-marked, so there is **no `grade-flashcard.ts`**. Two pure helpers live co-located in the organism folder (they need no I/O, so `hooks-service-dao.mdc`'s data layers don't apply — same rationale as the shipped graders being pure functions):

```ts
// libs/activities/src/organisms/flashcard/flashcard.helpers.ts  (pure; TDD-first)

/** True iff the slide is renderable: front (content) and back are both non-empty (trimmed). */
isFlashcardSlideValid(slide: FlashcardSlide): boolean

/** Builds the answered state from the self-mark. isCorrect mirrors recalled (never scored). */
buildFlashcardAnswer(slide: FlashcardSlide, recalled: boolean): FlashcardAnswer
```

## Component contract
**`Flashcard`** — presentational organism, `libs/activities/src/organisms/flashcard/flashcard.tsx`. Owns the reveal + self-mark interaction and the locked answered state; calls `useLocalization()` for chrome; emits `onAnswered` **once** on self-mark. File split per `.agents/rules/component-split.mdc` (mirrors `matching/`):

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

- **`use-flashcard.ts`** (state / derived / effects, no handlers): `revealed` state (seeded from `initialRevealed || !!initialAnswer`), `answer` state (`FlashcardAnswer | null`, seeded from `initialAnswer`); derived `locked = !!answer`, `isRevealed = revealed || !!answer`, `isUnavailable = !isFlashcardSlideValid(slide)`; a11y announce effect on reveal (announce the answer became visible), guarded like the shipped organisms (`Platform.OS !== 'android'`).
- **`flashcard.tsx`** (JSX + styles + a11y attrs + **handlers**): `handleReveal()` → guard `isRevealed`/`isUnavailable`, else `setRevealed(true)`; `handleSelfMark(recalled)` → guard `locked`/`!isRevealed`/`isUnavailable`, else `buildFlashcardAnswer(slide, recalled)`, `setAnswer`, `onAnswered?.(…)` once. Renders unavailable notice when `isUnavailable`.
- **`flashcard.helpers.ts`** (pure): `isFlashcardSlideValid`, `buildFlashcardAnswer`, and a11y-label builders as needed.

**Interaction / states.**
- **Hidden** (not revealed): front (`content`) + title shown; back/answer hidden; a single **Reveal** action; no self-mark actions present.
- **Reveal** (one-way): tapping Reveal shows the back (under `answerHeading`) alongside the front, plus the explanation when present, and surfaces the two self-mark actions.
- **Self-mark** (once, locked — story AC "no changing afterward"): tapping Recalled / Not-recalled builds + emits the answer, locks both actions non-interactive, and visually + accessibly confirms the chosen mark (text + icon + `accessibilityState`, not color alone). Repeat taps (the same or the other mark) are ignored.
- **Unavailable** (Empty/Error): `isFlashcardSlideValid` false (missing front or back) → `labels.unavailable`, nothing interactive, no crash.

**`FlashcardActivity`** — feature wiring, `libs/study-buddy/src/components/flashcard-activity/flashcard-activity.tsx`. Thin, mirrors the shipped `MatchingActivity`:
```ts
export type FlashcardActivityProps = { slide: FlashcardSlide; onAnswered?: (answer: FlashcardAnswer) => void };
export const FlashcardActivity = ({ slide, onAnswered }: FlashcardActivityProps) =>
  <Flashcard slide={slide} onAnswered={onAnswered} />;
```
Ships with a `flashcard-activity.stories.tsx` (title `Features/FlashcardActivity`) like the three shipped activity wrappers (see Open decisions).

## Acceptance criteria
→ **`gherkin-scenarios.md`** — each `@s` scenario is an acceptance criterion (Given/When/Then). Story→scenario map: front-only render → `@s1`; reveal → `@s2`; self-mark actions appear → `@s3`; self-mark locks + confirms → `@s4`; no change after lock → `@s5`; answered-state emitted + R7-excluded → `@s6`; explanation on reveal → `@s7`; plus unavailable `@s8`, i18n `@s9`, a11y `@s10`. The story's **component-split** AC is a build-time/structural constraint (not observable at runtime) → verified by the task Done criteria + the architecture reviewer, not a runtime `@s`.

## UI states (4-state model for a synchronous presentational activity slide)
| State | Trigger | Notes |
|---|---|---|
| Loading | **N/A** — the deck is generated/loaded before a slide mounts; deck loading is the R4 player's concern. | No Loading UI here — documented Open decision, not an omission (matches shipped activity organisms). |
| Content | Valid slide (non-empty front + back). Substates: **(a) hidden** — front only, Reveal available; **(b) revealed-unmarked** — front + answer (+ explanation) + two self-mark actions; **(c) marked-recalled** — locked, recalled confirmed; **(d) marked-not-recalled** — locked, not-recalled confirmed. | Story-required `flashcard.stories.tsx` states: hidden / revealed-recalled / revealed-not-recalled (+ revealed-unmarked, without-explanation, interactive here). |
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
None — explicit in the story ("No analytics events for this story at this time; deferred"). Matches the matching / fill-in-the-blank precedent.

## Feature flags
None — not mentioned in the story; ships unconditionally as a v1 R3 P0-floor type. Precedent: the matching + fill-in-the-blank specs both shipped with no flag for the same reason.

## Out of scope / non-goals
- **System grading of the flashcard** — self-marked only; no `grade-flashcard.ts`.
- **R7 score aggregate change** — the scorer already excludes flashcard (Open decisions); this story does **not** modify `libs/activities/src/organisms/lesson-results/score-lesson.ts` or `libs/types/src/activity-type.ts`.
- **Slide navigation / lesson player** (R4) — separate story; this renders one slide and reports its answer.
- **Persistence / resume** (R9) — separate story; this only *exposes* the `FlashcardAnswer` shape R9 will persist.
- **AI generation of the slide** (R2) — the slide arrives pre-populated; this story only coordinates the payload shape.
- **Un-reveal / re-mark / retry** — reveal is one-way; self-mark is a one-time lock (learning gain is measured via whole-lesson retakes, R7).
- **Other activity types** — their own stories; the union extends but only `flashcard` is implemented here.
- **Analytics & feature flags** — deferred / not in scope.

## Open decisions (resolved, with rationale)
- **Decision:** The R7 scorer needs **no change**. — **why:** `SYSTEM_CHECKED_ACTIVITY_TYPES` in `libs/types/src/activity-type.ts` already omits `flashcard`, `ActivityType` already includes it, and `scoreLesson` filters by `isSystemCheckedActivity`. `score-lesson.test.ts` already asserts a `flashcard` `GradedAnswer` with `isCorrect: true` yields `isScorable: false` / is excluded from the total. So no "type-narrowing acknowledgement" is required to keep the scorer exhaustive — touching it would be out of this story's scope (per the ticket). Cited so the reviewer confirms rather than re-discovers.
- **Decision:** `content` (SlideBase) is the **front/prompt**; a dedicated **`back`** field is the answer; `explanation?` optional. — **why:** every shipped activity type reuses `SlideBase.content` for its prompt (multiple-choice question, fill-in-the-blank sentence, matching instructions); adding a redundant `front` field would break that convention. The story's "front/back fields" is satisfied by front=content + new `back`. Flagged for R2 coordination (risks R1).
- **Decision:** `FlashcardAnswer` carries **both `recalled` (semantic) and `isCorrect` (= recalled)**. — **why:** every `ActivityAnswer` member today *structurally* satisfies `GradedAnswer` (same `slideId`/`activityType`/`isCorrect` shape), so the scorer consumes each unmodified; dropping `isCorrect` would break that structural invariant and complicate R7/R9 wiring. Note the invariant is only *asserted* in `graded-answer.test.ts` today for `MultipleChoiceAnswer` (no equivalent check exists yet for `MatchingAnswer`/`FillInTheBlankAnswer`); task-1 adds the flashcard type-level assignment there, mirroring the existing MCQ check. `recalled` keeps the domain-meaningful field for R9 rehydrate. The mirror is safe because the scorer excludes flashcards by slide-id filter regardless of `isCorrect`. **Confirmed by human at the gate** (2026-07-11): ship the invariant-preserving shape as drafted.
- **Decision:** **No grader module, no custom data hook, no tanstack-query.** — **why:** nothing is computed against a correct answer (self-mark) and there is no I/O; `hooks-service-dao.mdc` reserves services/DAOs/data-hooks for I/O. `use-flashcard` is **UI co-location** only (reveal + self-mark local state), explicitly per the story.
- **Decision:** **Architecture** — `Flashcard` organism in `@helsoft/activities` + thin `FlashcardActivity` wiring in `@helsoft/study-buddy`. — **why:** mirrors the shipped `Matching`/`MatchingActivity` and `FillInTheBlank`/`FillInTheBlankActivity` split; keeps the app screen a thin shell (`global.mdc`).
- **Decision:** `FlashcardActivity` **ships a `flashcard-activity.stories.tsx`** (title `Features/FlashcardActivity`, `Default` + `WithoutExplanation`). — **why:** all three shipped `@helsoft/study-buddy` activity wrappers (`MultipleChoiceActivity`, `MatchingActivity`, `FillInTheBlankActivity`) ship a wrapper story despite being equally thin; following the precedent keeps the Features/ Storybook section complete rather than introducing a deliberate gap.
- **Decision:** Reveal is **one-way**; self-mark is a **one-time lock**. — **why:** story AC ("locked in for this view, no changing afterward"); consistent with the other types locking after their commit action; simplifies R9 rehydrate. Both re-tapping the same locked mark and switching to the other mark are ignored (@s5).
- **Decision:** **Empty (missing front) and Error (missing back)** collapse to one unavailable notice via `isFlashcardSlideValid`. — **why:** both are malformed-payload conditions from upstream (R2), not learner-recoverable; degrade gracefully instead of crashing. Mirrors the other types' unavailable path.
- **Decision:** **Loading is N/A.** — **why:** synchronous slide receiving fully-loaded props; deck loading is upstream (R2/R4). Documented, matching the shipped organisms.
- **Decision:** i18n localizes only **UI chrome** (`reveal` / `recalled` / `notRecalled` / confirmations / `answerHeading` / `explanationHeading` / `unavailable`) under `activity.flashcard.*`; front/back/explanation **text** comes from AI-generated slide data and is not translated. — **why:** those are content, not chrome (matches the shipped `activity.*` namespaces). The organism directory registers in the `migration-coverage.test.ts` key-existence guard (task-6), as each shipped activity organism did.

## Unresolved questions
None — the sole open question (`FlashcardAnswer` shape) was confirmed at the gate; see Open decisions.

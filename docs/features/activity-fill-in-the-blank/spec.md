---
feature: activity-fill-in-the-blank
story: user-stories/activity-fill-in-the-blank.md
status: approved
---

# Spec — activity-fill-in-the-blank

## Summary
Render and grade a **fill-in-the-blank** activity slide (PRD R3, P0 floor type). Learner sees a prompt with an **inline blank** (`____` → TextInput), types an answer, and submits via **Submit button or Enter/return**. Grading is **normalized** (trim + lowercase + collapse whitespace + strip diacritics) against any of `acceptedAnswers`. Feedback is immediate: correct/incorrect banner; on incorrect, reveal **`acceptedAnswers[0]` only**; optional explanation with the result. Attempt **locks after first submit** (input read-only, no retry). Empty submit grades **incorrect** and still resolves. Graded result is a typed **answered-state** for R7 (score) and R9 (resume).

Scope is only this type: extend `Slide` / `ActivityAnswer` in `libs/types`; pure graders in `@helsoft/study-buddy`; presentational `FillInTheBlank` organism in `@helsoft/activities`; thin `FillInTheBlankActivity` wiring in `@helsoft/study-buddy`. R4 navigation and R9 persistence are separate — this story only exposes the answered-state shape. No analytics, no feature flags. Split mirrors Matching/MCQ: organism presentational + labels-injected; wrapper owns value, grades once, emits answered state.

## User stories
- As a **learner**, I want **to type an answer into a fill-in-the-blank slide and see immediately whether it's correct**, so that **I know if I understood the material without waiting until the end of the lesson**.

## Building blocks already in place (reuse, do not rebuild)
- **`Card`** / **`Icon`** / theme tokens from `@helsoft/components` via `react-native-unistyles` (banner, explanation, surfaces).
- **`@helsoft/localization`** (`useLocalization()` → `t()`, key-aligned `en/es/pt/de`) + labels-injection pattern.
- **`@helsoft/activities`** scaffold (Storybook + Jest + Playwright + Stryker) — `FillInTheBlank` lands under `src/organisms/fill-in-the-blank/` beside Matching / MultipleChoice.
- **Precedent**: `MultipleChoice`/`Matching` organisms ← `*Activity` wiring ← pure `grade*` in study-buddy.

## Data contract — `Slide` union + answered state
Extend existing unions additively (Matching/MCQ already present).

```ts
// libs/types/src/lesson.ts
export type FillInTheBlankSlide = SlideBase & {
  kind: 'activity';
  activityType: 'fill-in-the-blank';
  /**
   * Prompt with exactly one blank marker `____` (four underscores), replaced by the
   * inline TextInput at render (e.g. "The capital is ____").
   */
  // content inherited from SlideBase
  /** Non-empty when valid; any normalized match counts as correct. */
  acceptedAnswers: string[];
  explanation?: string;
};

export type ActivitySlide =
  | MultipleChoiceSlide
  | MatchingSlide
  | FillInTheBlankSlide;
```

```ts
// libs/types/src/activity-answer.ts
export type FillInTheBlankAnswer = {
  slideId: string;
  activityType: 'fill-in-the-blank';
  /** Raw learner text as typed (pre-normalize). */
  submittedAnswer: string;
  /**
   * Canonical accepted string for R9 rehydrate / incorrect reveal:
   * - incorrect → always `acceptedAnswers[0]`
   * - correct → first accepted answer whose normalized form matched the submission
   */
  acceptedAnswerShown: string;
  isCorrect: boolean;
};

export type ActivityAnswer =
  | MultipleChoiceAnswer
  | MatchingAnswer
  | FillInTheBlankAnswer;
```

**Pure grading** (no DAO/service — no I/O). Signatures only; implementator writes bodies TDD-first.

```ts
// libs/study-buddy/src/grading/grade-fill-in-the-blank.ts

/** True iff acceptedAnswers is non-empty (every entry a non-empty string) AND
 *  content contains exactly one `____` blank marker. */
isFillInTheBlankSlideValid(slide: FillInTheBlankSlide): boolean

/** trim → lowercase → collapse /\s+/ → NFD + strip combining marks. */
normalizeFillInAnswer(raw: string): string

/** Grades raw submission against slide.acceptedAnswers after normalize.
 *  Match any → correct. Throws if slide invalid (R7/R9 defensive).
 *  acceptedAnswerShown: matched accepted (first in list order) when correct;
 *  else acceptedAnswers[0]. Empty raw still grades (incorrect). */
gradeFillInTheBlank(slide: FillInTheBlankSlide, submittedAnswer: string): FillInTheBlankAnswer
```

## Component contract
**`FillInTheBlank`** — presentational organism, `libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.tsx`. **Controlled** (no domain state): value + result from parent; reports change/submit up.

```ts
export type FillInTheBlankResult = {
  isCorrect: boolean;
  /** Shown when incorrect (acceptedAnswers[0]). Omitted/unused when correct. */
  acceptedAnswerShown?: string;
};

export type FillInTheBlankLabels = {
  submit: string;
  correct: string;
  incorrect: string;
  explanationHeading: string;
  unavailable: string;
  /** Accessible name for the blank TextInput. */
  blankInput: string;
};

export type FillInTheBlankProps = {
  /** Prompt containing exactly one `____` (organism splits around it). */
  content: string;
  value: string;
  maxLength: number;
  unavailable?: boolean;
  result?: FillInTheBlankResult | null;
  explanation?: string;
  labels: FillInTheBlankLabels;
  onChangeValue: (value: string) => void;
  onSubmit: () => void;
};
```

**Render rules**
- Split `content` on first `____`; render leading text + TextInput + trailing text (inline blank).
- **Unanswered** (`result` unset): input editable; Submit **always enabled** (empty grades incorrect); Enter/return on the input calls `onSubmit` (same path as button).
- **Answered** (`result` set): input **read-only**; Submit non-interactive; banner `labels.correct` / `labels.incorrect`; if incorrect, show `result.acceptedAnswerShown`; explanation under `explanationHeading` when present; correctness via text + icon (not color alone); result announced (live region).
- **Unavailable**: `unavailable === true` **or** organism cannot render a single blank from `content` → `labels.unavailable`, nothing interactive, no crash.
- **No placeholder** on the TextInput. `maxLength` from wrapper.

**`FillInTheBlankActivity`** — wiring, `libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.tsx`.

```ts
export type FillInTheBlankActivityProps = {
  slide: FillInTheBlankSlide;
  onAnswered?: (answer: FillInTheBlankAnswer) => void;
};
```

- `valid = isFillInTheBlankSlideValid(slide)`; `unavailable={!valid}`.
- Owns `useState` for `value` and `answer: FillInTheBlankAnswer | null`.
- `maxLength = Math.ceil(acceptedAnswers[0].length * 1.25)` when valid (else unused).
- `handleSubmit`: if already answered → ignore; else `gradeFillInTheBlank(slide, value)`, store, `onAnswered` **once**.
- Injects `labels` via `t('activity.fillInTheBlank.*')`. Passes `content = slide.content`. Never calls grader when invalid.

## Acceptance criteria
Contract: [`gherkin-scenarios.md`](./gherkin-scenarios.md). Every story AC maps to ≥ 1 `@s` tag (coverage table there). Do not duplicate GWT here.

## UI states (`FillInTheBlank` organism)

| State | Trigger | Notes |
|---|---|---|
| Loading | **N/A.** Deck already loaded before slide mounts (R4). | Documented decision, not omission. |
| Content | Valid slide. **(a) unanswered** — editable blank, Submit enabled. **(b) correct** — locked + correct banner (+ explanation). **(c) incorrect** — locked + incorrect banner + `acceptedAnswers[0]` (+ explanation). | Stories must cover unanswered / correct / incorrect. |
| Error | Malformed: empty/`acceptedAnswers` invalid **or** missing/invalid `____` / unrenderable. | `labels.unavailable`, non-interactive, no crash, no grading. |
| Empty | Same visual as Error for this type (nothing to fill). Treated via unavailable. | Mirrors MCQ/Matching Empty+Error → unavailable. |

## Answered-state / output contract

| Field | Meaning | Consumer |
|---|---|---|
| `slideId` | Slide graded | R9 |
| `activityType` | `'fill-in-the-blank'` | R7/R9 |
| `submittedAnswer` | Raw learner text | R9 rehydrate input |
| `acceptedAnswerShown` | Matched accepted (correct) or `[0]` (incorrect) | R9 reveal / audit |
| `isCorrect` | Normalized match against any accepted | R7 |

Invalid-input: `gradeFillInTheBlank` throws if slide invalid. UI never reaches this — wrapper guards with `isFillInTheBlankSlideValid`.

## Analytics events
None — deferred per story.

## Feature flags
None — ships unconditionally as v1 R3 P0 type.

## Out of scope / non-goals
- **Retry after submit** — lock forever on this view (retakes via R7 whole-lesson).
- **Multiple blanks** — exactly one `____` per slide.
- **Fuzzy / synonym / AI grading** — normalized exact match only (PRD R3).
- **Placeholder copy** on the input.
- **R4 player / R9 persistence / R7 score UI** — separate; this story only exposes answered-state.
- **AI generation (R2)** — payload shape only; generation is separate.
- **Other activity types** — own stories.
- **Analytics & feature flags**.

## Open decisions (resolved with rationale — override at the gate)
- **Decision (human-locked):** Submit via **explicit Submit button AND Enter/return**. — **why:** keyboard-first on web + explicit affordance on touch; one grade path.
- **Decision (human-locked):** Wrong reveal shows **`acceptedAnswers[0]` only** (not the full list). — **why:** one canonical teaching answer; avoids clutter when synonyms exist.
- **Decision (human-locked):** Layout is **inline blank** — `content` embeds `____`, replaced by TextInput. — **why:** reads as a sentence completion, not a detached prompt+field.
- **Decision (human-locked):** Normalize = **trim + lowercase + collapse `/\s+/` + strip diacritics (NFD + remove combining marks)**; compare to each normalized accepted; any match → correct. — **why:** PRD asks case-insensitive + trimmed; whitespace/diacritics avoid false negatives without fuzzy matching.
- **Decision (human-locked):** Malformed (empty `acceptedAnswers` / missing-invalid blank / unrenderable) → **Error/unavailable** (`labels.unavailable`), non-interactive — like MCQ/Matching. — **why:** upstream R2 shape drift; degrade, don't crash.
- **Decision (human-locked):** `maxLength = Math.ceil(acceptedAnswers[0].length * 1.25)`; **no placeholder**. — **why:** 25% headroom over primary accepted (human wrote `* 0.25`; interpreted as 25% headroom — **confirm at gate**). Empty field is clearer than placeholder chrome.
- **Decision (human-locked):** Submit **always enabled** while unlocked (empty → incorrect). — **why:** story AC requires empty submit to resolve, not stick.
- **Decision (human-locked):** Lock after first submit; explanation with result when present; answered-state for R7/R9; no analytics; no flags. — **why:** same product rules as MCQ/Matching.
- **Decision (human-locked):** Architecture — organism in `@helsoft/activities` + wiring in `@helsoft/study-buddy` + pure grader in study-buddy `grading/`. — **why:** mirrors Matching/MCQ; no I/O ⇒ no DAO/service (`hooks-service-dao.mdc`); feature logic in study-buddy (`global.mdc`).
- **Decision:** `acceptedAnswerShown` = matched accepted when correct, else `[0]`. — **why:** incorrect UI needs `[0]`; correct path stores the synonym that matched for R9 audit without inventing a second field.
- **Decision:** Loading N/A; i18n chrome only (`submit` / `correct` / `incorrect` / `explanationHeading` / `unavailable` / `blankInput`); slide text from data. — **why:** same as sibling activity types.
- **Decision:** Controlled organism (value/result from wrapper). — **why:** single domain lock + grade ownership in study-buddy; organism stays presentational/testable.

## Unresolved questions
None — gate approved `maxLength = ceil(acceptedAnswers[0].length * 1.25)` (25% headroom).

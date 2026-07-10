---
feature: activity-multiple-choice
story: user-stories/activity-multiple-choice.md
status: spec_ready
---

# Spec — activity-multiple-choice

## Summary
Render and grade a **multiple-choice** activity slide (PRD R3, a P0 floor type). A learner sees a question with N options, taps one, and gets **immediate** correct/incorrect feedback — a wrong pick also reveals the correct option, and an optional explanation is shown with the result. The attempt is **locked** the moment an option is chosen: options become non-interactive and no re-selection is allowed (product decision: no retry; learning gain is measured via whole-lesson retakes, R7). The graded result is surfaced as a typed **answered-state** object so R7 (end-of-lesson score) and R9 (resume) can consume/persist it later.

Scope is only the multiple-choice type: extending `Slide` with a per-type payload (a discriminated union in `libs/types/src/lesson.ts`), a pure grading function (no I/O — the correct answer arrives with the slide), a presentational organism in `@helsoft/components`, and a thin feature-wiring component in `@helsoft/study-buddy`. Slide-to-slide navigation (R4) and saving/resuming (R9) are **separate stories** — this story only exposes the answered-state shape those stories will persist. No analytics and no feature flags in this story. The presentational component lives in `@helsoft/components` and reuses the existing `AnswerOption` molecule; the selection state + grading + `t()` injection live in `@helsoft/study-buddy` — mirroring the established `LoginForm`(presentational) → `SignInForm`(wiring) split.

## User stories
- As a **learner**, I want **to select an answer on a multiple-choice slide and see immediately whether I got it right**, so that **I know if I understood the material without waiting until the end of the lesson**.

## Building blocks already in place (this feature reuses, does not rebuild)
- **`AnswerOption`** molecule (`libs/components/src/molecules/answer-option/answer-option.tsx`) — a selectable tile with exactly the states this feature needs: `default | selected | correct | incorrect`, a letter `marker`, feedback icons (`check_circle` / `cancel`, so correctness is **not** color-only), `onPress`, `disabled`, and `accessibilityRole="button"` + `accessibilityState`. The MCQ organism composes one per option.
- **`Card`** atom (surface container), **`Icon`** atom, theme tokens (`colors`, `typography`, `spacing`, `shape`) — used for the question/explanation surfaces.
- **`@helsoft/localization`** (`useLocalization()` → `t()`, key-aligned `en/es/pt/de` bundles) and the `labels`-injection pattern (presentational component stays locale-agnostic; the study-buddy wrapper injects `t()`).
- **Layering precedent**: `LoginForm` (presentational organism, `@helsoft/components`) ← `SignInForm` (feature wiring + logic, `@helsoft/study-buddy`) ← thin app screen.

## Data contract — `Slide` discriminated union + answered state
The current `Slide` (`libs/types/src/lesson.ts`) is flat with no per-type payload. This story turns it into a discriminated union keyed on `kind` (`instructional` | `activity`) and, within activity slides, on `activityType`. Only `multiple-choice` is defined here; sibling activity types land with their own stories. Its only current consumer is `Lesson.slides: Slide[]` and no code constructs activity slides yet, so the change is additive/safe (see risks R1).

```ts
// libs/types/src/lesson.ts
export type SlideKind = 'instructional' | 'activity';

/** Only 'multiple-choice' is defined in this story; siblings extend the union later. */
export type ActivityType =
  | 'multiple-choice'
  | 'fill-in-the-blank'
  | 'flashcard'
  | 'open-ended'
  | 'matching';

type SlideBase = {
  id: string;
  lessonId: string;
  title: string;
  /** For an activity slide, `content` holds the question prompt (coordinate w/ R2 — see risks R1). */
  content: string;
  position: number;
};

export type InstructionalSlide = SlideBase & { kind: 'instructional' };

export type MultipleChoiceOption = {
  /** Stable id used to reference the chosen/correct option (persist-friendly for R9). */
  id: string;
  label: string;
};

export type MultipleChoiceSlide = SlideBase & {
  kind: 'activity';
  activityType: 'multiple-choice';
  options: MultipleChoiceOption[];
  /** id of the single correct option; must match one of `options[].id`. */
  correctOptionId: string;
  /** Optional teaching note shown with the result. */
  explanation?: string;
};

export type ActivitySlide = MultipleChoiceSlide; // union grows as sibling stories land
export type Slide = InstructionalSlide | ActivitySlide;
```

```ts
// libs/types/src/activity-answer.ts — the answered-state exposed for R7 (score) & R9 (resume)
export type MultipleChoiceAnswer = {
  slideId: string;
  activityType: 'multiple-choice';
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
};

export type ActivityAnswer = MultipleChoiceAnswer; // union grows with sibling types
```

**Pure grading function** (no DAO/service — no I/O; the correct answer is on the slide). Signature only; the `implementator` writes the body TDD-first:

```ts
// libs/study-buddy/src/grading/grade-multiple-choice.ts
gradeMultipleChoice(slide: MultipleChoiceSlide, selectedOptionId: string): MultipleChoiceAnswer
// - throws if selectedOptionId is not one of slide.options (guards malformed input)
// - isCorrect = selectedOptionId === slide.correctOptionId
```

## Component contract
**`MultipleChoice`** — presentational organism, `libs/components/src/organisms/multiple-choice/multiple-choice.tsx`. **Controlled** (owns no domain state): it renders the display derived from its props and reports selections up.

```ts
export type MultipleChoiceOptionView = { id: string; label: string };
export type MultipleChoiceLabels = {
  correct: string;            // result banner when the answer is right
  incorrect: string;          // result banner when the answer is wrong
  explanationHeading: string; // heading above the explanation
  unavailable: string;        // Empty/Error fallback notice
};
export type MultipleChoiceProps = {
  question: string;
  options: MultipleChoiceOptionView[];
  correctOptionId: string;
  selectedOptionId?: string | null; // null/undefined = unanswered; set = answered/locked
  explanation?: string;
  labels: MultipleChoiceLabels;
  onSelectOption: (optionId: string) => void;
};
```
Render rules: `status = selectedOptionId ? 'answered' : 'unanswered'`. Markers are `A/B/C…` by index.
- **unanswered** → every option `default` + enabled; tap fires `onSelectOption(id)`; no result banner.
- **answered** (locked) → every option **disabled**; per option: `correctOptionId` → `correct`; else the `selectedOptionId` → `incorrect`; else `default`. Result banner = `labels.correct` if `selectedOptionId === correctOptionId` else `labels.incorrect`, announced to assistive tech (live region). Explanation shown with `explanationHeading` when present.

**`MultipleChoiceActivity`** — feature wiring, `libs/study-buddy/src/components/multiple-choice-activity/multiple-choice-activity.tsx`.
```ts
export type MultipleChoiceActivityProps = {
  slide: MultipleChoiceSlide;
  onAnswered?: (answer: MultipleChoiceAnswer) => void;
};
```
Owns `useState<string|null>(null)` for the selection (plain local UI state — **no hook/service/DAO** because there is no I/O; see Open decisions). `handleSelect(id)`: if already answered → ignore (lock); else set selection and call `onAnswered(gradeMultipleChoice(slide, id))` exactly once. Injects `labels` via `t('activity.mcq.*')`. Passes `question = slide.content`.

## Acceptance criteria (Given/When/Then)
- **AC1** — Given a multiple-choice slide with N options, When it renders, Then all options are visible and selectable and none is pre-selected and no result is shown. *(→ @s1)*
- **AC2** — Given the learner taps an option, When the tap registers, Then that option becomes the learner's answer, the attempt is locked, and all options become non-interactive. *(→ @s2)*
- **AC3** — Given the selected option matches the correct option, When feedback is shown, Then the selected option is marked correct and a correct result is shown. *(→ @s3)*
- **AC4** — Given the selected option does not match the correct option, When feedback is shown, Then the selected option is marked incorrect and the correct option is revealed alongside it and an incorrect result is shown. *(→ @s4)*
- **AC5** — Given the slide has an explanation, When feedback is shown, Then the explanation is displayed together with the result. *(→ @s5)*
- **AC6** — Given the learner has already answered, When they attempt to select a different option, Then the original answer is unchanged and no new answer is recorded (single-select, no multi-select, no re-selection). *(→ @s6)*
- **AC7** — Given the learner selects an option, When it is graded, Then the correct/incorrect result is exposed as this slide's answered state (`{ slideId, activityType, selectedOptionId, correctOptionId, isCorrect }`) so it can feed the end-of-lesson score (R7) and be persisted for resume (R9). *(→ @s7)*
- **AC8** — Given a slide with no options, When it renders, Then an unavailable notice is shown instead of a question and nothing is selectable. *(→ @s8)*
- **AC9** — Given a malformed slide whose `correctOptionId` is not among its options, When it renders, Then an unavailable notice is shown and the slide does not crash. *(→ @s9)*
- **AC10** — Given the app locale is a supported language, When feedback is shown, Then the correct/incorrect result label and the explanation heading render from the active locale bundle and no user-facing chrome string is hardcoded. *(→ @s10)*
- **AC11** — Given the slide is shown, Then each option exposes a button role and an accessible label, correctness is conveyed by text and icon (not color alone), and the result is announced to assistive technology when the learner answers. *(→ @s11)*

## UI states (`MultipleChoice` organism)
The 4-state model applied to a synchronous, presentational activity slide. Loading is scoped out with rationale (see Open decisions); Content carries the three story-required substates; Empty/Error are graceful-degradation states.

| State | Trigger | Notes |
|---|---|---|
| Loading | **N/A for this component.** The deck is already generated/loaded before a slide mounts; deck loading is owned by the R4 player. | No Loading UI here — documented Open decision, not an omission. |
| Content | Slide has ≥1 option and `correctOptionId` ∈ options. **(a) unanswered** — all options interactive, none selected, no banner. **(b) answered-correct** — selected == correct → correct tile + correct banner + explanation. **(c) answered-incorrect** — selected tile incorrect + correct tile revealed + incorrect banner + explanation. | The three states the story requires `multiple-choice.stories.tsx` to cover. |
| Error | Malformed slide: `correctOptionId` not among the option ids (or otherwise unrenderable payload). | Renders `labels.unavailable`, non-interactive, **no crash**. Guards against R2 shape drift (risks R1). |
| Empty | Slide has zero options. | Renders `labels.unavailable`, non-interactive. |

## Answered-state / output contract
`gradeMultipleChoice` returns, and `MultipleChoiceActivity.onAnswered` emits **once**, a `MultipleChoiceAnswer`:

| Field | Meaning | Consumer |
|---|---|---|
| `slideId` | The slide graded | R9 (key the persisted attempt) |
| `activityType` | `'multiple-choice'` (discriminant) | R7/R9 (branch by type) |
| `selectedOptionId` | Learner's pick | R9 (re-hydrate the answered view on resume) |
| `correctOptionId` | The correct option | R7/R9 (re-render feedback without re-grading) |
| `isCorrect` | `selectedOptionId === correctOptionId` | R7 (sum correct / total) |

Invalid input contract: `gradeMultipleChoice` throws if `selectedOptionId` is not one of the slide's options (a caller bug). The UI never reaches this — the component only emits ids it rendered — but the domain layer guards defensively for R7/R9 callers.

## Analytics events
None — deferred per the story ("No analytics events for this story at this time").

## Feature flags
None — not mentioned in the story; the type is a P0 floor type shipped unconditionally.

## Out of scope / non-goals
- **Slide navigation / lesson player** (R4) — separate story; this component renders one slide and reports its answer.
- **Persistence / resume** (R9) — separate story; this story only *exposes* the answered-state shape R9 will persist.
- **End-of-lesson scoring UI** (R7) — separate story; this story only *feeds* it via `isCorrect`.
- **Retry / re-answer** — explicitly excluded (no retry; measured via whole-lesson retakes, R7).
- **Multi-select** — single correct option only, one selection per attempt.
- **Other activity types** (fill-in-the-blank, flashcard, open-ended, matching) — their own stories; the union is designed to extend but only `multiple-choice` is implemented here.
- **AI generation of the slide** (R2) — the slide arrives pre-populated; this story only coordinates the payload shape.
- **Analytics & feature flags** — deferred / not in scope.

## Open decisions (resolved with rationale — override at the gate)
- **Decision:** Grading lives as a **pure function in `@helsoft/study-buddy`** (`grade-multiple-choice.ts`), **not** a co-located component util and **not** a `libs/services` service/DAO. — **why:** the story states grading is pure with no I/O, so `hooks-service-dao.mdc`'s DAO/Service/Hook layers (which exist to orchestrate I/O) don't apply; `global.mdc` designates `libs/study-buddy` as the home of the app's business logic; the answered-state assembly is domain logic consumed by R7/R9, so it must not be buried in the presentational lib. Co-locating it in `@helsoft/components` was rejected because it would either bury domain logic in a UI primitive or (if the component imported it from study-buddy) invert the dependency direction (`components → study-buddy`), which the layering forbids. ✓ Default chosen.
- **Decision:** The `MultipleChoice` component is **controlled/presentational** (state + grading owned by the `MultipleChoiceActivity` wrapper in study-buddy). — **why:** keeps `@helsoft/components` a dumb, reusable UI primitive (any consumer can drive it), mirrors the `LoginForm`/`SignInForm` precedent, keeps grading out of the presentational lib, and makes each of the 4 UI states independently render-testable (which mutation testing rewards). ✓ Default chosen.
- **Decision:** No custom **hook** and no tanstack-query. — **why:** the only state is a single local selection with no network/cache concerns; `hooks-service-dao.mdc` reserves hooks for wrapping services and tanstack-query for data fetching "when first needed." Plain `useState` in the wrapper suffices. ✓ Default chosen.
- **Decision:** **Loading is N/A** for this component. — **why:** the slide is synchronous and receives fully-loaded data as props; the deck is generated/loaded upstream (R2/R4). Inventing a Loading state here would be untestable theatre. Documented in the UI-states table rather than omitted. ✓ Default chosen.
- **Decision:** Added **Empty** (zero options) and **Error** (`correctOptionId` ∉ options) graceful-degradation states even though the story lists only three content substates. — **why:** the gate requires the 4-state model for UI; R2 generation isn't built yet, so a malformed/empty payload is a realistic risk (risks R1); rendering an `unavailable` notice instead of crashing is the safe default and gives mutation testing real branches to bite. If the human prefers to trust R2's shape and drop these, the component simplifies. ✓ Default chosen.
- **Decision:** For a multiple-choice slide, `content` holds the **question prompt** and `title` is a short heading. — **why:** `SlideBase` already carries both; avoids adding a redundant `question` field. Flagged for R2 coordination (risks R1) — if R2 emits the question in a dedicated field, adjust the mapping in the wrapper only. ✓ Default chosen.
- **Decision:** `correctOptionId` is a **single string** referencing one option `id` (no multi-correct, no per-option `isCorrect` flag). — **why:** the story and PRD wording is "selects an option" / one correct answer; a referenced id is the most persist- and render-friendly shape. ✓ Default chosen.
- **Decision:** Selection **immediately grades and locks** — there is no intermediate "selected, awaiting submit" state and thus no submit button. — **why:** the story mandates immediate feedback and a locked attempt on selection; a submit step contradicts "select an answer … and see immediately." The `AnswerOption` `selected` visual is therefore unused in the MCQ flow (feedback jumps straight to correct/incorrect). ✓ Default chosen.
- **Decision:** i18n localizes only the **UI chrome** (`correct` / `incorrect` / `explanationHeading` / `unavailable`); the question, option labels, and explanation **text** come from the (AI-generated) slide data and are not translated. — **why:** those are content, not chrome; translating generated content is out of scope and would need R2 support. ✓ Default chosen.

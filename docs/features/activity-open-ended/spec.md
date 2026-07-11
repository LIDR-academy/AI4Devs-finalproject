---
feature: activity-open-ended
story: user-stories/activity-open-ended.md
status: approved
---

# Spec — activity-open-ended

## Summary
Render an **open-ended / short-answer** activity slide (PRD R3, v1). Learner sees a prompt and a **multiline free-text** field, submits (empty allowed), then the input **locks** and the **model answer** is revealed for self-comparison. **Not auto-graded**, **no self-mark UI** (unlike flashcard), **excluded from R7** (`isSystemCheckedActivity` already false for `'open-ended'`). Answered state is **submitted-only** for R9 resume.

Scope: extend `Slide` / `ActivityAnswer` in `libs/types`; pure **validity** helper (no grader) in `@helsoft/study-buddy`; presentational `OpenEnded` organism in `@helsoft/activities` with **component-split** (`use-open-ended` = UI co-location only); thin `OpenEndedActivity` wiring in `@helsoft/study-buddy`. R4 / R9 / R7 UI are separate. No analytics, no feature flags.

## User stories
- As a **learner**, I want **to write a free-text answer on an open-ended slide and compare it to a model answer**, so that **I can self-assess when the answer can't be auto-graded**.

## Building blocks already in place (reuse, do not rebuild)
- **`Card` / `Icon` / theme tokens** from `@helsoft/components` via `react-native-unistyles`.
- **`@helsoft/localization`** (`useLocalization()` → `t()`, key-aligned `en/es/pt/de`) + labels-injection.
- **`@helsoft/activities`** scaffold (Storybook + Jest + Playwright + Stryker).
- **`ActivityType`** already includes `'open-ended'`; **`isSystemCheckedActivity('open-ended') === false`** (R7 exclusion shipped).
- **Precedent**: Matching/MCQ/FITB organism ← `*Activity` wiring; flashcard/open-ended stories lock **component-split** + no system grader.

## Data contract — `Slide` union + answered state
Extend unions additively. `ActivityType` already has `'open-ended'` — do not redeclare.

```ts
// libs/types/src/lesson.ts
export type OpenEndedSlide = SlideBase & {
  kind: 'activity';
  activityType: 'open-ended';
  // content = prompt (SlideBase)
  /** Non-empty when valid; revealed after submit for learner comparison. */
  modelAnswer: string;
  explanation?: string;
};

export type ActivitySlide =
  | MultipleChoiceSlide
  | MatchingSlide
  | FillInTheBlankSlide
  | OpenEndedSlide;
```

```ts
// libs/types/src/activity-answer.ts
/** Submitted-only — no isCorrect; must NOT satisfy GradedAnswer. */
export type OpenEndedAnswer = {
  slideId: string;
  activityType: 'open-ended';
  /** Raw learner text at submit (may be empty string). */
  submittedAnswer: string;
};

export type ActivityAnswer =
  | MultipleChoiceAnswer
  | MatchingAnswer
  | FillInTheBlankAnswer
  | OpenEndedAnswer;
```

**Pure validity** (no grader / no DAO/service — no I/O). Signatures only; implementator writes bodies TDD-first.

```ts
// libs/study-buddy/src/grading/is-open-ended-slide-valid.ts
// (or open-ended-validity.ts beside other grading helpers)

/** True iff trimmed content (prompt) and trimmed modelAnswer are both non-empty. */
isOpenEndedSlideValid(slide: OpenEndedSlide): boolean
```

No `gradeOpenEnded`. Wrapper builds `OpenEndedAnswer` inline: `{ slideId, activityType: 'open-ended', submittedAnswer }`.

## Component contract
**`OpenEnded`** — organism with **component-split from day one**, `libs/activities/src/organisms/open-ended/`:

| File | Owns |
|---|---|
| `open-ended.tsx` | JSX, styles, a11y attrs, **event handlers** (change / submit wiring) |
| `open-ended.types.ts` | `Props` + view types (no JSX) |
| `use-open-ended.ts` | draft text + submitted/locked state, derived flags, a11y announce effect |
| `open-ended.helpers.ts` | pure helpers (a11y labels, view-model) when needed |
| co-located `*.test.ts(x)` | one suite per file above |
| `open-ended.stories.tsx` | unanswered / submitted-with-model-answer (+ unavailable, Interactive) |

`use-open-ended` is **UI co-location only** — not a `@helsoft/hooks` data-layer hook.

```ts
export type OpenEndedLabels = {
  submit: string;
  yourAnswer: string;       // heading above learner text once submitted
  modelAnswer: string;      // heading above model answer reveal
  explanationHeading: string;
  unavailable: string;
  answerInput: string;      // accessible name for the TextInput
};

export type OpenEndedProps = {
  prompt: string;
  modelAnswer: string;
  explanation?: string;
  unavailable?: boolean;
  /** R9 rehydrate: start locked with this text + model answer visible. */
  initialSubmittedAnswer?: string | null;
  maxLength: number;
  labels: OpenEndedLabels;
  onSubmit: (submittedAnswer: string) => void;
};
```

**Render / interaction rules**
- **Unanswered** (not submitted): multiline editable TextInput (empty); Submit **always enabled**; model answer **hidden**; Enter/return inserts newline (**does not** submit) — `@s10`.
- **Submitted** (hook locked, or rehydrated via `initialSubmittedAnswer`): input **read-only**; Submit non-interactive; show learner text under `yourAnswer` and `modelAnswer` under its heading (stacked comparison); explanation under `explanationHeading` when present; announce reveal to AT (live region). **No** correct/incorrect banner, **no** self-mark controls.
- **Unavailable**: `unavailable === true` → `labels.unavailable`, nothing interactive, no crash.
- Handlers in `.tsx`; state/derived/effects in `use-open-ended`; pure transforms in helpers.

**`OpenEndedActivity`** — wiring, `libs/study-buddy/src/components/open-ended-activity/open-ended-activity.tsx`.

```ts
export type OpenEndedActivityProps = {
  slide: OpenEndedSlide;
  onAnswered?: (answer: OpenEndedAnswer) => void;
};
```

- `valid = isOpenEndedSlideValid(slide)`; `unavailable={!valid}`.
- Owns answered-domain emission only: on organism `onSubmit(text)` → if already answered ignore; else build `OpenEndedAnswer`, store, `onAnswered` **once**.
- Injects `labels` via `t('activity.openEnded.*')`. Passes `prompt = slide.content`, `modelAnswer`, `explanation`, `maxLength = 2000`. Never submits when invalid.

## Acceptance criteria
Contract: [`gherkin-scenarios.md`](./gherkin-scenarios.md). Every story AC maps to ≥ 1 `@s` tag (coverage table there). Do not duplicate GWT here.

## UI states (`OpenEnded` organism)

| State | Trigger | Notes |
|---|---|---|
| Loading | **N/A.** Deck already loaded before slide mounts (R4). | Documented decision, not omission. |
| Content | Valid slide. **(a) unanswered** — editable multiline, Submit enabled, model hidden. **(b) submitted** — locked + learner text + model answer (+ explanation). | Stories: unanswered / submitted-with-model-answer. |
| Error | Malformed: empty/whitespace-only `content` or `modelAnswer`. | `labels.unavailable`, non-interactive, no crash. |
| Empty | Same visual as Error (nothing to answer). Treated via unavailable. | Mirrors MCQ/Matching/FITB Empty+Error → unavailable. |

## Answered-state / output contract

| Field | Meaning | Consumer |
|---|---|---|
| `slideId` | Slide submitted | R9 |
| `activityType` | `'open-ended'` | R9 (branch); R7 **skips** via `isSystemCheckedActivity` |
| `submittedAnswer` | Raw learner text (may be `''`) | R9 rehydrate input |

**No `isCorrect`.** `OpenEndedAnswer` must not be treated as `GradedAnswer`. R7 excludes this type entirely.

## Analytics events
None — deferred per story.

## Feature flags
None — ships unconditionally as v1 R3 type.

## Out of scope / non-goals
- **Auto-grading / AI grading** of open-ended answers (PRD Nice-to-Have / P1).
- **Self-mark UI** (Recalled / Not recalled) — flashcard only; product decision.
- **R7 score contribution** — excluded; already encoded in `isSystemCheckedActivity`.
- **Retry after submit** — lock forever on this view.
- **Enter-to-submit** — multiline; Enter = newline only (`@s10`).
- **R4 player / R9 persistence / R7 score UI** — separate; this story only exposes answered-state.
- **AI generation (R2)** — payload shape only.
- **Other activity types** — own stories.
- **Analytics & feature flags**.

## Open decisions (resolved with rationale — override at the gate)
- **Decision (story-locked):** Not auto-graded; model answer revealed on submit; empty submit allowed. — **why:** PRD + story AC; avoid stuck flow.
- **Decision (story-locked):** No self-mark UI (unlike flashcard). — **why:** product; comparison-only.
- **Decision (story-locked):** Excluded from R7; no analytics. — **why:** story + existing `isSystemCheckedActivity`.
- **Decision (story-locked):** `@helsoft/activities` + component-split; `use-open-ended` = UI co-location only. — **why:** story + `component-split.mdc` / `hooks-service-dao.mdc`.
- **Decision:** Architecture — `OpenEnded` organism (interaction via `use-open-ended`) + `OpenEndedActivity` wiring (labels + `onAnswered`) + `isOpenEndedSlideValid` only (no grader). — **why:** mirrors Matching (organism owns ephemeral interaction; wrapper owns domain emission); no I/O ⇒ no DAO/service; no system grade ⇒ no `grade*`.
- **Decision:** Multiline TextInput; Submit button only (Enter = newline) — `@s10`. — **why:** free-text / open-ended needs paragraphs; Enter-submit would fight multiline.
- **Decision:** Reveal layout = **stacked** labeled blocks (your answer → model answer), not side-by-side columns. — **why:** story “next to” = adjacent in reading order; columns break on narrow RN layouts.
- **Decision:** `maxLength = 2000` from wrapper. — **why:** short-answer ceiling without deriving from `modelAnswer` (lengths vary; not graded).
- **Decision:** Valid = non-empty trimmed `content` + non-empty trimmed `modelAnswer`; else unavailable. — **why:** same degrade pattern as FITB/Matching for R2 drift.
- **Decision:** Loading N/A; i18n chrome only (`submit` / `yourAnswer` / `modelAnswer` / `explanationHeading` / `unavailable` / `answerInput`); slide text from data. — **why:** same as sibling activity types.
- **Decision:** `OpenEndedAnswer` has no `isCorrect`; not a `GradedAnswer`. — **why:** ungraded; R7 must not count it.

## Open decisions (unresolved)
None — all product questions resolved from story + sibling activity specs.

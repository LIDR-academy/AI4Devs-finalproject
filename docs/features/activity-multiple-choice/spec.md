---
feature: activity-multiple-choice
story: user-stories/activity-multiple-choice.md
status: spec_ready
---

# Spec — activity-multiple-choice

## Summary
Render and grade a **multiple-choice** activity slide (PRD R3, a P0 floor type). A learner sees a question with N
options, taps one, and gets **immediate** correct/incorrect feedback; a wrong pick reveals the correct option, and an
optional explanation shows with the result. The attempt **locks** on selection (non-interactive, no re-selection, no
retry — learning gain is measured via whole-lesson retakes, R7). The graded result is surfaced as a typed
**answered-state** object for R7 (score) and R9 (resume) to consume later.

Scope is only this type: extend `Slide` into a discriminated union (`libs/types/src/lesson.ts`), add a pure grader (no
I/O — the correct answer arrives with the slide), a presentational organism in `@helsoft/components`, and a thin
wiring component in `@helsoft/study-buddy`. Navigation (R4) and persistence/resume (R9) are separate stories; this
only exposes the answered-state shape. No analytics, no feature flags. Mirrors the `LoginForm`(presentational) →
`SignInForm`(wiring) split; reuses the existing `AnswerOption` molecule.

## User stories
- As a **learner**, I want to select an answer and see immediately whether I got it right, so I know if I understood
  the material without waiting until the end of the lesson.

## Contracts (source of truth lives in code)
- **`Slide` union** (`libs/types/src/lesson.ts`) keyed on `kind` (`instructional`|`activity`) and, for activities,
  `activityType`. `MultipleChoiceSlide` = `SlideBase` + `{ kind:'activity', activityType:'multiple-choice',
  options:{id,label}[], correctOptionId, explanation? }`; `content` holds the question. Additive/safe — only consumer
  today is `Lesson.slides` (risks R1).
- **`MultipleChoiceAnswer`** (`activity-answer.ts`) = `{ slideId, activityType, selectedOptionId, correctOptionId,
  isCorrect }` — the answered-state emitted **once** via `onAnswered` for R7 (score via `isCorrect`) / R9 (re-hydrate
  via `selectedOptionId`, re-render via `correctOptionId`, branch via `activityType`).
- **`gradeMultipleChoice(slide, selectedOptionId)`** (`grade-multiple-choice.ts`) — pure; `isCorrect = selected ===
  correctOptionId`; throws if `selectedOptionId` ∉ `slide.options` (guards caller bugs; UI never reaches it).
- **`MultipleChoice`** organism — **controlled/presentational**, labels injected. Unanswered → all options
  `default`+enabled, no banner. Answered (locked) → all disabled; correct tile `correct`, selected-if-wrong
  `incorrect`; banner `correct`/`incorrect` announced to AT; explanation shown when present. Markers `A/B/C…` by index.
- **`MultipleChoiceActivity`** wiring — owns `useState<string|null>`; `handleSelect` ignores repeat (lock) else sets +
  calls `onAnswered(gradeMultipleChoice(slide,id))` once; injects labels via `t('activity.mcq.*')`; `question = slide.content`.

## Acceptance criteria → see `gherkin-scenarios.md` (each `@s` scenario is an AC)

## UI states (`MultipleChoice` organism)
| State | Trigger | Notes |
|---|---|---|
| Loading | **N/A** — deck loaded upstream by the R4 player. | No Loading UI — documented decision, not an omission. |
| Content | ≥1 option and `correctOptionId` ∈ options. (a) unanswered; (b) answered-correct; (c) answered-incorrect (correct tile revealed). | The three story-required substates the stories cover. |
| Error | `correctOptionId` ∉ options (or unrenderable payload). | `labels.unavailable`, non-interactive, no crash (guards R2 drift). |
| Empty | Zero options. | `labels.unavailable`, non-interactive. |

## Analytics / Feature flags
None (analytics deferred per story; type is a P0 floor type shipped unconditionally).

## Out of scope / non-goals
Slide navigation/lesson player (R4); persistence/resume (R9); end-of-lesson scoring UI (R7); retry/re-answer;
multi-select; other activity types (union extends later); AI generation of the slide (R2 — arrives pre-populated);
analytics & feature flags.

## Open decisions (resolved with rationale — override at the gate)
- **Grading is a pure function in `@helsoft/study-buddy`** (not a component util nor services/DAO) — pure, no I/O;
  study-buddy is the home of business logic; components would bury domain logic or invert deps.
- **`MultipleChoice` is controlled/presentational** (state+grading in the wrapper) — reusable UI primitive, mirrors
  `LoginForm`/`SignInForm`, each UI state render- and mutation-testable.
- **No custom hook, no tanstack-query** — one local selection, no network/cache; plain `useState`.
- **Loading is N/A** — synchronous slide, data via props; deck loading is R2/R4.
- **Added Empty + Error states** — gate requires the 4-state model; malformed/empty payload is a real risk (R2 unbuilt).
- **`content` = question prompt, `title` = short heading** — reuses `SlideBase`; flagged for R2 coordination.
- **`correctOptionId` is a single string** — no multi-correct, no per-option flag.
- **Selection immediately grades and locks** — no submit step; story mandates immediate feedback.
- **i18n localizes only UI chrome** (`correct`/`incorrect`/`explanationHeading`/`unavailable`); question/options/
  explanation text come from (AI-generated) slide data, not translated.

## Human-accepted risks (post-implementation, full review Round 3 of 3)
- **Risk (m4-b):** On Android, the post-answer announcement relies solely on the banner's `accessibilityLiveRegion`
  (`multiple-choice.tsx:123-131`); the imperative `announceForAccessibility` is intentionally skipped on Android
  (`Platform.OS !== 'android'`, `:89-93`, commit `38c450b`) to eliminate a confirmed duplicate-announcement bug.
  First-mount live-region reliability was never verified on-device — worst case Android gets no announcement instead
  of a duplicate. iOS/web use the imperative call and are fully tested.
- **Disposition:** Human-accepted (2026-07-10) at the 3-round cap per `.agents/rules/review-standards.md` §5 (only a
  minor remained; mutation threshold met). Detail: `review.md` → m4-b. Follow-up: on-device TalkBack pass recommended, not blocking.

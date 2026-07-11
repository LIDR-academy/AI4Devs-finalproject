---
feature: score-results-summary
story: user-stories/score-results-summary.md
status: spec_drafted
---

# Spec — score-results-summary
_Keep terse. **Acceptance criteria are NOT duplicated here** — the `@s` scenarios in `gherkin-scenarios.md` are the ACs. Link, don't copy._

## Summary
End-of-lesson results (PRD R7): compute a `correct/total` score over only the system-checked activity types, show it on the results screen, and persist each completion as its own attempt record (score, total, timestamp) so learning gain can be measured on retake. Lessons with nothing gradable show a completion state instead of a score.

## User stories
- As a **learner**, I want to see my score at the end of a lesson, and have each retake recorded as its own attempt, so that I can gauge how much I learned and track improvement over time.

## Acceptance criteria
→ **`gherkin-scenarios.md`** — each `@s` scenario is an acceptance criterion (Given/When/Then). Coverage map: story AC1 → @s1,@s2 · AC2 → @s2 · AC3 → @s6,@s11 · AC4 → @s8 · AC5 → @s9. Decisions: matching → @s3 · denominator → @s4 · completion CTA → @s10 · persistence → @s6. States: Loading @s5 · Score @s1 · Completion @s8,@s9 · Error @s7. Cross-cutting: i18n @s12 · a11y @s13.

## UI states (UI)
| State | Trigger | Notes |
|---|---|---|
| Loading | scorable lesson completed; attempt insert in flight | `progress-indicator`; actions unavailable until it resolves (@s5) |
| Content — Score | ≥ 1 system-checked slide in the deck | `correct/total` + percentage for the **current attempt only**, no cross-attempt comparison (@s1); actions: Retake + Back-to-lessons |
| Content — Completion (empty / no-score) | instructional-only lesson **or** zero system-checked slides | "Lesson complete" message, no score, **no attempt record created**; both actions (Retake + Back-to-lessons) rendered (@s8, @s9, @s10) |
| Error | attempt insert failed | score still shown; non-blocking "couldn't save this attempt" notice + Retry (@s7); actions: Retake + Back-to-lessons |

## Analytics events
None — deferred this round (consistent with the R3 activity-type stories).

## Feature flags
None.

## Out of scope / non-goals
- In-app comparison across attempts (the screen shows the current attempt only; improvement is measured later from stored history).
- Live player/session wiring: the answered-state (`GradedAnswer[]`) is **injected**; its live source is owned by R4 (player) / R9 (resume), which are not built. Wired against fixtures/stub here.
- New slide-type payloads: fill-in-the-blank, matching, flashcard, open-ended slide/answer types land with their own stories. Only multiple-choice is producible today; the scorer is forward-compatible via the decoupled `ScorableSlide` shape.
- Scoring flashcard self-marks and open-ended submissions (excluded entirely).
- Regeneration or R2.1 composition re-prompt on retake.
- Full lesson persistence / a `lessons` table (R5) — this story only adds the attempt record.

## Open decisions (resolved, with rationale)
- **Matching scores whole-slide, not per-pair** — correct iff every pair right, none unpaired; keeps `correct/total` = "questions right/asked" regardless of pair count; per-pair result still shown in the slide's own feedback. (Human-confirmed.)
- **Ship against an injected `GradedAnswer[]` contract** — R4 (player)/R9 (resume) unbuilt; scorer+persistence+UI ship now against a stable `{slideId;activityType;isCorrect}` shape, live wiring deferred. (Human-confirmed.)
- **Scorer input decoupled from `Slide`** — `scoreLesson` takes `ScorableSlide{id;activityType}[]` (a projection), not `Lesson`/`Slide`, so fixtures cover every activity type without widening `lesson.ts`. (Resolves spec-review blocker.)
- **Denominator = all system-checked slides** — unanswered count toward `total`, not `correct` (standard X/N, no gaming). (Human-confirmed.)
- **Completion offers Retake + Back-to-lessons** — can replay an instructional-only deck with nothing to score. (Human-confirmed, deviation from initial draft.)
- **Persistence: standalone `lesson_attempts` table, insert-only** — `user_id` default `auth.uid()`, `lesson_id` soft reference (no FK until R5), RLS `user_id = auth.uid()`; client never sets `user_id`.
- **Component placement** — mirrors `LoginForm`/`MultipleChoice`: presentational `ResultsSummary` receives pre-resolved labels, never self-formats; `LessonResults` computes + formats via `t(...)`; pure `scoreLesson`; `use-lesson-attempt` hook.
- **No refactor of `MultipleChoiceAnswer`** — already satisfies `GradedAnswer` structurally.
- **Error contract: score + non-blocking notice + Retry** — mirrors `locale-save-failure-notice`.
- **Hook uses local state, not tanstack-query** — not installed; only the insert is async.
- **Human gate pre-authorized (2026-07-11)** — human instructed "auto-approve gherkin for this story"; `spec_reviewer` returned `APPROVED` round 2; auto-approved without interactive sign-off on that basis.

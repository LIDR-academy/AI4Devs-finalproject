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
- **Matching scores whole-slide, not per-pair** — **why:** the only answered-state contract in the repo (`MultipleChoiceAnswer.isCorrect: boolean`) is one boolean per slide, and matching's own AC exposes the result "aggregated across pairs" (singular). One point per gradable slide keeps `correct/total` meaning "questions right / asked" and keeps the retake learning-gain metric stable regardless of a matching slide's pair count. A matching slide is correct iff every pair is right and no item is left unpaired; per-pair correctness still shows in the matching slide's own feedback, not in the score. (Human-confirmed.)
- **Ship against an injected `GradedAnswer[]` contract** — **why:** R4 (player) and R9 (resume/session) are unbuilt and nothing in the app flow collects answered-state yet. R7 delivers the scorer + persistence + results UI now, consuming a minimal shared `GradedAnswer { slideId; activityType; isCorrect }`; live wiring is deferred to R4/R9. Keeps R7 shippable and TDD-able against a stable contract. (Human-confirmed.)
- **Scorer input is decoupled from the `Slide` union** — **why:** fill-in-the-blank/matching slide types don't exist yet, so `scoreLesson` consumes a minimal `ScorableSlide { id; activityType }[]` (a projection of the deck's activity slides) rather than `Lesson`/`Slide`. This lets the scorer's `@s2`/`@s3` fixtures cover every activity type today without widening `lesson.ts`; the wiring bridges `lesson.slides` → `ScorableSlide[]`. (Resolves spec-review blocker.)
- **Denominator = all system-checked slides in the deck** — **why:** stable denominator for the learning-gain metric and no gaming by skipping hard questions. An unanswered system-checked slide counts toward `total` but not `correct` (standard X/N quiz semantics; matching "submit with unpaired" already grades incorrect). (Human-confirmed.)
- **Completion state offers Retake + Back-to-lessons** (not Back-only) — **why:** a learner can still replay an instructional-only deck even with nothing to score. (Human-confirmed, deviation from initial draft.)
- **Persistence: new standalone `lesson_attempts` table, insert-only** — **why:** the story mandates per-retake, non-overwriting records; auth (`auth.uid()`) is the only backend primitive built. Columns: `id`, `user_id uuid not null default auth.uid()`, `lesson_id uuid` (soft reference — no FK until R5's `lessons` table exists), `score int`, `total int`, `created_at timestamptz`. RLS `user_id = auth.uid()` on select + insert `with check`; the client never sets `user_id` (least-privilege, no spoofing). Insert-only — completions never update.
- **Component placement + pre-formatting** — **why:** mirrors the LoginForm/SignInForm and MultipleChoice/MultipleChoiceActivity precedent. Presentational `ResultsSummary` organism in `@helsoft/components` receives **pre-resolved label strings** (never self-formats business values); wiring `LessonResults` in `@helsoft/study-buddy` computes the score and formats labels via `t(...)`; pure `scoreLesson` in `@helsoft/study-buddy/grading` (next to `grade-multiple-choice`); persistence hook `use-lesson-attempt` in `@helsoft/hooks`. Layering: Component → Hook → Service → DAO → Supabase; the pure scorer is called by the wiring component (same lib), keeping any hooks→study-buddy dependency out.
- **No refactor of `MultipleChoiceAnswer`** — **why:** it already structurally satisfies `GradedAnswer` (same `slideId`/`activityType`/`isCorrect`), so the scorer consumes it without changing existing code/tests.
- **Error contract: show score + non-blocking save-failure notice + Retry** — **why:** the score computes locally so it always renders; only the insert can fail. Mirrors the existing `locale-save-failure-notice` pattern.
- **Hook uses local React state (not tanstack-query)** — **why:** tanstack-query is not installed; scoring is pure/synchronous and only the insert is async, so a small `useState`/`useCallback` hook with an explicit status (`idle`/`saving`/`saved`/`error`) suffices. tanstack-query remains the future home if a fetch/list path is added.
- **Human gate pre-authorized (2026-07-11)** — **why:** the human explicitly instructed "auto-approve gherkin for this story" before `spec_reviewer` ran. `spec_reviewer` returned `APPROVED` (round 2, zero findings) on `review-spec.md`; per that pre-authorization, `orchestrator_lead` auto-approved `spec.md` + `gherkin-scenarios.md` without pausing for an interactive sign-off. Building proceeds on that basis.

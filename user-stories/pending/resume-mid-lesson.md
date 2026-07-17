# Resume mid-lesson (R9)

**As a** student
**I want** my current slide position and already-answered activity state saved to my account as I move through a lesson
**so that** I can leave and come back later — even after logging out or on another device — and pick up exactly where I left off, with my progress and score intact

## Context
- PRD's **R9 — Resume mid-lesson**. Phase 2 (persistence & platform), depends on **R5** (lesson persistence, done) and integrates with **R7** (score/results, done).
- **R5** (`signup-and-lesson-persistence`, done) persists generated lessons under `auth.uid()` with RLS, listed on Home, reopenable and deletable. That spec explicitly carved resume out: "resuming mid-lesson (R9) — reopen starts from the top." Today, reopening a lesson **always** restarts at slide 1 — this story replaces that behavior.
- **R7** (`score-results-summary`, done) computes `correct/total` via `scoreLesson` over a `GradedAnswer[]` and persists one insert-only row per completion to `lesson_attempts` (`lesson_id` soft-ref → FK'd to `lessons.id` `on delete cascade` by R5). That spec shipped against an **injected/stubbed** `GradedAnswer[]`, explicitly deferring the live source: "its live source is owned by R4 (player) / R9 (resume), which are not built." This story is one of the two that must supply that live wiring.
- **R4 (player) is not built yet** — `apps/app-study-buddy/src/app/(app)/lesson/[id]/{index,player,results}.tsx` are placeholder screens today: `player.tsx` renders static text with a "finish" link (no real slide rendering, no activity components wired in), and `results.tsx` calls `buildStubLessonResultsFixture` instead of reading real answers. There is currently no "current slide index" or per-slide answered state anywhere to persist. **This story cannot be implemented standalone against the current player** — flag to `spec_partner`/orchestrator to sequence R4 first or build the two together.
- Layering: `Component → Hook → Service → DAO` (`.agents/rules/hooks-service-dao.mdc`); Supabase-backed via `@helsoft/supabase-services`, following the `lessons`/`lesson_attempts` RLS pattern (`user_id`/owner default `auth.uid()`, policies scoped to it).

## Acceptance criteria
- **Position persisted as-you-go** — Given a student is in the player, When they advance to or back to a different slide, Then their current slide position is saved to their account (server-side, not just local/in-memory state) as part of that navigation — not only on exit — so a crash or forced-close doesn't lose the position.
- **Resume on reopen** — Given a lesson with a saved in-progress position, When the student reopens it — including after logout/login, or from a different device or browser — Then the player opens directly at that exact slide, not slide 1.
- **Answered-slide state retained** — Given activity slides already answered before leaving, When the student resumes, Then those slides show their prior answered/graded state (selected option, submitted text, flashcard reveal state, matched pairs, etc., per activity type), and completing the lesson from there yields a score/results summary (R7) consistent with what was actually answered across both sessions.
- **Restart from the beginning** — Given a completed lesson, or an in-progress lesson the student chooses to restart, When they start over, Then the lesson begins at slide 1 with a clean answered-state (prior saved position/answers cleared or superseded), and completing it records a new attempt per R7 (retake still works).
- **No cross-user leakage** — Same RLS-isolation guarantee as R5: a student can never see or resume another student's saved position or answers.

## Notes
- **Build-order dependency:** R4 (slide navigation & player) must exist — or be built as part of the same effort — before this story's ACs are verifiable; today's player route is a stub. Surface this to `spec_partner` as a sequencing risk, not something to silently work around.
- **Storage shape** (extend `lessons` with a position/answers column vs. a new `lesson_progress`-style table) is an implementation decision, deferred to spec.
- No analytics events or feature flags requested for MVP.
- Ready for `/ticket-orchestrator resume-mid-lesson` once the R4 sequencing question above is resolved.

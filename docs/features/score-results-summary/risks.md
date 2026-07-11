# Risks — score-results-summary

| # | Risk | Type | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | The injected `GradedAnswer[]` contract could drift from what R9 actually persists, making the future live wiring a mismatch/no-op | product | M | M | Define `GradedAnswer { slideId; activityType; isCorrect }` as the minimal shared contract in `@helsoft/types` now; test the scorer + hook against fixtures shaped exactly like it; flag the contract for the R9 story owner; the app route passes a stub until R9 lands. |
| R2 | No `lessons` table exists (R5 unbuilt), so `lesson_attempts.lesson_id` cannot be a real FK | technical | H | L | Make `lesson_id` a soft `uuid` reference (no FK), scoped by RLS on `user_id`; add the FK in R5 when the `lessons` table exists. Documented as a follow-on. |
| R3 | A client could try to insert an attempt for another user (`user_id` spoofing) | security | M | H | Column `user_id uuid not null default auth.uid()`; RLS `select`/`insert with check (user_id = auth.uid())`; the DAO never sets `user_id`. Test the policy assumption (insert relies on the default + the session). |
| R4 | Hand-rolled async state in `use-lesson-attempt` (tanstack-query not installed) risks races: double-save on remount, stale retry | technical | M | M | Save exactly once per completion via an effect/ref guard; expose an explicit `idle/saving/saved/error` status; unit-test double-invoke and retry-after-error; note tanstack-query as the future home. |
| R5 | The results screen re-mounting (navigation/StrictMode) could insert the attempt twice, corrupting the learning-gain metric | technical | M | H | Save is triggered once per completion (guarded); insert is idempotent per mount; document the dedupe expectation for the R9 integration so re-entry on resume does not double-count. |
| R6 | Fill-in-the-blank/matching answer + slide types don't exist yet, so the scorer would have no type-safe way to build `@s2`/`@s3` fixtures if it consumed the `Lesson`/`Slide` union | technical | M | M | `scoreLesson` takes a **decoupled `ScorableSlide { id; activityType }[]`** (independent of `lesson.ts`) + `GradedAnswer[]`, driven purely off `isSystemCheckedActivity(activityType)` + `isCorrect`; fixtures cover all three system-checked `activityType`s (incl. matching whole-slide) so the logic is proven before those slide/answer types land, and the wiring bridges `lesson.slides` → `ScorableSlide[]`. |
| R7 | New `results.*` i18n keys missing from `es`/`pt`/`de` break the `migration-coverage` test or render raw keys | product | M | L | Add every new key to all four bundles within the slice that introduces it (score/percent in task-7; completion/save-failure in task-10); rely on the coverage parity test + `en` runtime fallback. |
| R8 | Percentage rounding / divide semantics ambiguity in the score display | technical | L | L | `correct`/`total` are integers; percentage = `Math.round((correct/total)*100)` computed in the wiring (`LessonResults`) and passed to `ResultsSummary` as a pre-formatted string (the organism never self-formats); `total > 0` is guaranteed for the score state (else completion state, never `0/0`); unit-test rounding + the `total === 0` branch. |
| R9 | Whole-slide matching may frustrate a learner who got most pairs right but scores 0 for the slide | product | L | M | Per-pair correct/incorrect is still shown in the matching slide's own feedback; results only aggregate. Documented, human-confirmed product decision. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `@helsoft/types` | available | Hosts the new `ActivityType`, `ScorableSlide`, `GradedAnswer`, `ScoreSummary`, `LessonAttempt` types + `SYSTEM_CHECKED_ACTIVITY_TYPES` / `isSystemCheckedActivity`. `MultipleChoiceAnswer` already structurally satisfies `GradedAnswer`; `MultipleChoiceSlide` projects into `ScorableSlide`. |
| `@helsoft/components` (atoms `card`/`button`/`progress-indicator`, `ScreenContainer` template, theme tokens) | available | Building blocks for the `ResultsSummary` organism; no new atoms needed. |
| `@helsoft/localization` (`results.*` namespace stub + `migration-coverage` test) | available | `results.summary`/`retake`/`backHome` already exist; add score/percent (task-7) + completion/save-failure (task-10) keys across en/es/pt/de. |
| `@helsoft/hooks` (`useSession`) | available | `use-lesson-attempt` to be added here, wrapping the service. |
| `@helsoft/services` (Supabase client, DAO/service pattern) | available | `LessonAttemptDao` + `LessonAttemptService` to be added, mirroring `auth`/`locale-preference`. |
| Supabase auth (`auth.uid()`) | available | Foundation for `user_id` default + RLS on `lesson_attempts`. |
| `lesson_attempts` table | to add | New migration (`supabase/migrations/*_create_lesson_attempts.sql`) — first schema migration in the repo. |
| `grade-multiple-choice` / `MultipleChoiceAnswer` | available | Produces `GradedAnswer`-shaped answers the scorer consumes. |
| `lessons` table / lesson persistence (R5) | blocked (not built) | `lesson_id` is a soft reference until R5 lands the table + FK. |
| Answers source: player (R4) / resume-session (R9) | blocked (not built) | Answered-state is injected as `GradedAnswer[]` via fixtures/stub until these land. |
| Matching & fill-in-the-blank graders / answer + slide types | blocked (not built) | Scorer is forward-compatible (decoupled `ScorableSlide`); only multiple-choice is producible today. |
| App results route `apps/app-study-buddy/src/app/(app)/lesson/[id]/results.tsx` | available (stub) | Integration point; currently a placeholder wired for retake→player (`replace`) and back→home. |
| Jest + RNTL + Storybook + Playwright + Stryker | available | Unit + component + e2e + mutation infra is set up. |

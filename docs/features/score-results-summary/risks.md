# Risks — score-results-summary

| # | Risk | Type | L | I | Mitigation |
|---|---|---|---|---|---|
| R1 | Injected `GradedAnswer[]` contract could drift from what R9 actually persists | product | M | M | `GradedAnswer{slideId;activityType;isCorrect}` in `@helsoft/types`; tested against matching fixtures; app route stubs until R9. |
| R2 | No `lessons` table (R5 unbuilt) — `lesson_attempts.lesson_id` can't be a real FK | technical | H | L | Soft `uuid` reference, RLS-scoped by `user_id`; add FK in R5. |
| R3 | Client could spoof `user_id` on insert | security | M | H | `user_id default auth.uid()`; RLS `with check (user_id = auth.uid())`; DAO never sets it. |
| R4 | Hand-rolled async state (no tanstack-query) risks double-save/stale-retry races | technical | M | M | Effect/ref guard, explicit `idle/saving/saved/error` status; unit-tested. |
| R5 | Results screen re-mount could insert the attempt twice | technical | M | H | Save-once guard (`isSaving`/`hasSaved` refs); dedupe documented for R9. |
| R6 | Fill-in-the-blank/matching types don't exist — no type-safe `@s2`/`@s3` fixtures via `Lesson`/`Slide` | technical | M | M | `scoreLesson` takes decoupled `ScorableSlide{id;activityType}[]`, independent of `lesson.ts`; fixtures cover all 3 system-checked types now. |
| R7 | New `results.*` keys missing from es/pt/de break `migration-coverage` | product | M | L | Added per-slice to all 4 bundles; parity test + `en` fallback. |
| R8 | Percentage rounding/divide ambiguity | technical | L | L | Integer `correct`/`total`; `Math.round` in the wiring layer (never self-formatted); `total>0` guaranteed for the score state. |
| R9 | Whole-slide matching may frustrate a near-miss learner | product | L | M | Per-pair result still shown in the slide's own feedback; human-confirmed decision. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `@helsoft/types` | available | New score/attempt types + `isSystemCheckedActivity`; `MultipleChoiceAnswer`/`Slide` already project cleanly. |
| `@helsoft/components` | available | `card`/`button`/`progress-indicator` atoms, no new ones needed. |
| `@helsoft/localization` | available | `results.*` stub existed; score/percent + completion/save-failure keys added across en/es/pt/de. |
| `@helsoft/hooks`, `@helsoft/services` | available | `use-lesson-attempt` + `LessonAttemptDao`/`Service` added, mirroring `auth`/`locale-preference`. |
| Supabase auth (`auth.uid()`) | available | Foundation for `user_id` default + RLS. |
| `lesson_attempts` table | added | First schema migration in the repo. |
| `lessons` table / R5 | blocked | `lesson_id` soft reference until R5 lands the table + FK. |
| Player (R4) / resume-session (R9) | blocked | Answered-state injected via fixture until these land. |
| Fill-in-the-blank/matching types | blocked | Scorer forward-compatible via decoupled `ScorableSlide`. |
| App results route | available (wired) | `apps/app-study-buddy/.../results.tsx` composes `LessonResults`. |
| Jest/RNTL/Storybook/Playwright/Stryker | available | Full test infra in place. |

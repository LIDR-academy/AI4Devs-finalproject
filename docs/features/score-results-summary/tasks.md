---
feature: score-results-summary
phase: pr_ready # pending|spec_drafted|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 2     # incremented by reviews_lead; cap 2
---

# Tasks — score-results-summary
Index only. **Each `task-N.md` owns its `slice`, `scenarios`, `status`, `paths`** — do **not** duplicate them here. `orchestrator_lead` owns `phase`; `implementator` flips each task's `status`.

- **Slice 1** (happy path + loading — score computed, attempt persisted, score shown):
  - [task-1](./task-1.md) — shared types: `ScorableSlide`, `GradedAnswer`, `ScoreSummary`, `LessonAttempt` + system-checked-activity set & guard
  - [task-2](./task-2.md) — pure `scoreLesson` scorer (decoupled `ScorableSlide[]` input)
  - [task-3](./task-3.md) — `lesson_attempts` migration + `LessonAttemptDao` (Supabase, RLS)
  - [task-4](./task-4.md) — `LessonAttemptService` (validation, insert-only)
  - [task-5](./task-5.md) — `use-lesson-attempt` hook
  - [task-6](./task-6.md) — `ResultsSummary` organism: score + loading states (pre-formatted labels)
  - [task-7](./task-7.md) — `LessonResults` wiring + app results route + score/percent i18n keys (score + loading, save on completion)
- **Slice 2** (empty + error + retry):
  - [task-8](./task-8.md) — `ResultsSummary`: completion + error/retry states + completion CTAs
  - [task-9](./task-9.md) — `LessonResults`: completion/error/retry branches + retake navigation
- **Slice 3** (a11y + i18n + stories/e2e — no analytics, no flag):
  - [task-10](./task-10.md) — completion + save-failure i18n keys across en/es/pt/de + coverage; wire all labels
  - [task-11](./task-11.md) — a11y (announce score/state, labels, non-color-only) + Storybook stories (all 4 states)
  - [task-12](./task-12.md) — Playwright e2e over the results flow

---
feature: activity-multiple-choice
phase: pr_ready   # pending|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 3     # incremented by reviews_lead; cap 3
---

# Tasks — activity-multiple-choice

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementer` flips each task's `status`. Build order is strictly Slice 1 → 2 → 3; do not start a slice until the previous slice's gate passes. Within Slice 1, build the data/domain backbone (task-1 → task-2) before the UI (task-3 → task-4).

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) — Slide discriminated union + answered-state types | 1 | @s7 | done | libs/types/src/lesson.ts, libs/types/src/activity-answer.ts, libs/types/src/index.ts |
| [task-2](./task-2.md) — `gradeMultipleChoice` pure grader | 1 | @s3,@s4,@s7 | done | libs/study-buddy/src/grading/grade-multiple-choice.ts, libs/study-buddy/src/index.ts |
| [task-3](./task-3.md) — `MultipleChoice` organism (Content states) + stories | 1 | @s1,@s2,@s3,@s4,@s5,@s6 | done | libs/components/src/organisms/multiple-choice/, libs/components/src/organisms/index.ts |
| [task-4](./task-4.md) — `MultipleChoiceActivity` wiring + integration | 1 | @s2,@s6,@s7 | done | libs/study-buddy/src/components/multiple-choice-activity/, libs/study-buddy/src/index.ts |
| [task-5](./task-5.md) — Empty + Error states + grader validation | 2 | @s8,@s9 | done | libs/components/src/organisms/multiple-choice/, libs/study-buddy/src/grading/grade-multiple-choice.ts |
| [task-6](./task-6.md) — i18n `activity.mcq.*` (en/es/pt/de) + wire `t()` | 3 | @s10 | done | libs/localization/src/resources/, libs/study-buddy/src/components/multiple-choice-activity/ |
| [task-7](./task-7.md) — a11y pass + Playwright e2e | 3 | @s11 | done | libs/components/src/organisms/multiple-choice/, libs/components/tests/e2e/ |

**Slice 1 — Happy path (types → grader → presentational Content states → wiring)** · **Slice 2 — Empty + Error (graceful degradation; no network retry in this feature)** · **Slice 3 — a11y + i18n** *(no analytics, no feature flags in scope)*

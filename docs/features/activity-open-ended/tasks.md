---
feature: activity-open-ended
phase: mutation # pending|spec_drafted|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 1
---

# Tasks — activity-open-ended

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementator` flips each task's `status`.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) | 1 | @s6 | done | libs/types/src/lesson.ts, libs/types/src/activity-answer.ts |
| [task-2](./task-2.md) | 1 | @s7 | done | libs/study-buddy/src/grading/is-open-ended-slide-valid.ts |
| [task-3](./task-3.md) | 1 | @s1,@s2,@s3,@s4,@s10 | done | libs/activities/src/organisms/open-ended/ |
| [task-4](./task-4.md) | 1 | @s2,@s4,@s6 | done | libs/study-buddy/src/components/open-ended-activity/ |
| [task-5](./task-5.md) | 2 | @s5,@s7 | done | libs/activities/src/organisms/open-ended/, libs/study-buddy/src/components/open-ended-activity/ |
| [task-6](./task-6.md) | 3 | @s8 | done | libs/localization/src/resources/{en,es,pt,de}.ts, libs/study-buddy/src/components/open-ended-activity/ |
| [task-7](./task-7.md) | 3 | @s9 | done | libs/activities/src/organisms/open-ended/ |
| [task-8](./task-8.md) | 3 | @s1,@s2,@s7 | done | libs/activities/src/organisms/open-ended/open-ended.stories.tsx |
| [task-9](./task-9.md) | 3 | @s1,@s2,@s4,@s5,@s10 | done | libs/activities/tests/e2e/organisms/open-ended/open-ended.e2e.js |

**Slice 1 — Types + validity + organism happy path (component-split) + wiring**
**Slice 2 — Empty submit + Error/unavailable**
**Slice 3 — i18n + a11y + Storybook + Playwright e2e**

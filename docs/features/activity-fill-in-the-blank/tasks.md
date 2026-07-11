---
feature: activity-fill-in-the-blank
phase: in_progress # pending|spec_drafted|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 0
---

# Tasks — activity-fill-in-the-blank

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementator` flips each task's `status`.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) | 1 | @s10 | done | libs/types/src/lesson.ts, libs/types/src/activity-answer.ts |
| [task-2](./task-2.md) | 1 | @s2,@s3,@s6,@s8,@s9,@s10,@s11,@s12 | done | libs/study-buddy/src/grading/grade-fill-in-the-blank.ts |
| [task-3](./task-3.md) | 1 | @s1,@s2,@s3,@s4,@s5,@s7 | done | libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.tsx |
| [task-4](./task-4.md) | 1 | @s2,@s3,@s5,@s7,@s10 | done | libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.tsx |
| [task-5](./task-5.md) | 2 | @s6,@s11,@s12 | done | libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.tsx, libs/study-buddy/src/components/fill-in-the-blank-activity/ |
| [task-6](./task-6.md) | 3 | @s13 | done | libs/localization/src/resources/{en,es,pt,de}.ts, libs/study-buddy/src/components/fill-in-the-blank-activity/ |
| [task-7](./task-7.md) | 3 | @s14 | done | libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.tsx |
| [task-8](./task-8.md) | 3 | @s1,@s2,@s3,@s11,@s12 | done | libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.stories.tsx |
| [task-9](./task-9.md) | 3 | @s1,@s2,@s3,@s5,@s6,@s7 | done | libs/activities/tests/e2e/organisms/fill-in-the-blank/fill-in-the-blank.e2e.js |

**Slice 1 — Types + grader + organism happy path + wiring**
**Slice 2 — Empty + Error + empty-submit incorrect**
**Slice 3 — i18n + a11y + Storybook + Playwright e2e**

---
feature: activity-matching
phase: in_review # pending|spec_drafted|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 1     # incremented by reviews_lead; cap 3
---

# Tasks — activity-matching

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementator` flips each task's `status`.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) | 1 | @s12 | done | libs/types/src/lesson.ts, libs/types/src/activity-answer.ts |
| [task-2](./task-2.md) | 1 | @s9,@s10,@s12,@s15 | done | libs/study-buddy/src/grading/grade-matching.ts |
| [task-3](./task-3.md) | 1 | @s1,@s2,@s3,@s4,@s5,@s6,@s7,@s8,@s9,@s10,@s11 | done | libs/activities/src/organisms/matching/matching.tsx |
| [task-4](./task-4.md) | 1 | @s8,@s11,@s12,@s15 | done | libs/study-buddy/src/components/matching-activity/matching-activity.tsx |
| [task-5](./task-5.md) | 2 | @s13,@s14,@s15 | done | libs/activities/src/organisms/matching/matching.tsx |
| [task-6](./task-6.md) | 3 | @s16 | done | libs/localization/src/resources/{en,es,pt,de}.ts, libs/study-buddy/src/components/matching-activity/matching-activity.tsx |
| [task-7](./task-7.md) | 3 | @s17 | done | libs/activities/src/organisms/matching/matching.tsx |
| [task-8](./task-8.md) | 3 | @s1,@s7,@s8,@s9,@s10,@s13,@s14 | done | libs/activities/src/organisms/matching/matching.stories.tsx |
| [task-9](./task-9.md) | 3 | @s2,@s3,@s6,@s7,@s8,@s9,@s10 | done | libs/activities/tests/e2e/organisms/matching/matching.e2e.js |

**Slice 1 — Types + grader + `Matching` organism + `MatchingActivity` wiring + Content states**
**Slice 2 — Empty + Error states**
**Slice 3 — i18n + a11y + Storybook + Playwright e2e**

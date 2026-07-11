---
feature: activity-flashcard-recall
phase: in_progress # pending|spec_drafted|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 0     # incremented by reviews_lead; cap 2
---

# Tasks — activity-flashcard-recall
Index only. **Each `task-N.md` owns its `slice`, `scenarios`, `status`, `paths`** — do **not** duplicate them here. `orchestrator_lead` owns `phase`; `implementator` flips each task's `status`.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) | 1 | @s6 | todo | libs/types/src/lesson.ts, libs/types/src/activity-answer.ts |
| [task-2](./task-2.md) | 1 | @s6,@s8 | todo | libs/activities/src/organisms/flashcard/flashcard.helpers.ts |
| [task-3](./task-3.md) | 1 | @s1,@s2,@s3,@s4,@s5,@s7 | todo | libs/activities/src/organisms/flashcard/flashcard.tsx, flashcard.types.ts, use-flashcard.ts |
| [task-4](./task-4.md) | 1 | @s6 | todo | libs/study-buddy/src/components/flashcard-activity/flashcard-activity.tsx |
| [task-5](./task-5.md) | 2 | @s8 | todo | libs/activities/src/organisms/flashcard/flashcard.tsx |
| [task-6](./task-6.md) | 3 | @s9 | todo | libs/localization/src/resources/{en,es,pt,de}.ts, libs/activities/src/organisms/flashcard/flashcard.tsx |
| [task-7](./task-7.md) | 3 | @s10 | todo | libs/activities/src/organisms/flashcard/flashcard.tsx, use-flashcard.ts |
| [task-8](./task-8.md) | 3 | @s1,@s2,@s3,@s4,@s7,@s8 | todo | libs/activities/src/organisms/flashcard/flashcard.stories.tsx |
| [task-9](./task-9.md) | 3 | @s1,@s2,@s3,@s4,@s5 | todo | libs/activities/tests/e2e/organisms/flashcard/flashcard.e2e.js |

**Slice 1 — Types + pure helpers + `Flashcard` organism (reveal/self-mark/lock + Content states) + `FlashcardActivity` wiring**
**Slice 2 — Unavailable state (missing front/back)**
**Slice 3 — i18n + a11y + Storybook + Playwright e2e**

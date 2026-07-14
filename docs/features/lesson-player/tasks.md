---
feature: lesson-player
phase: mutation
review_round: 0     # incremented by reviews_lead; cap 2
---

# Tasks — lesson-player
Index only. **Each `task-N.md` owns its `slice`, `scenarios`, `status`, `paths`** — do **not** duplicate them here. `orchestrator_lead` owns `phase`; `implementator` flips each task's `status`.

Deck model: results is the **final slide** of the player deck (index = last, `N = contentSlides + 1`), reached by Next off the last content slide, with Back enabled and Next hidden on it — not a separate route.

- **Slice 1** (load + display + navigate + reach real results — happy path + Loading):
  [task-1](./task-1.md) · [task-2](./task-2.md) · [task-3](./task-3.md) · [task-4](./task-4.md) · [task-5](./task-5.md)
- **Slice 2** (answer restore + retake, fully in-deck):
  [task-6](./task-6.md) · [task-7](./task-7.md)
- **Slice 3** (empty + error + image-degrade + responsive + i18n/a11y):
  [task-8](./task-8.md) · [task-9](./task-9.md) · [task-10](./task-10.md) · [task-11](./task-11.md) · [task-12](./task-12.md)

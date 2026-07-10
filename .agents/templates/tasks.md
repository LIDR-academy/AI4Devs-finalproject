---
feature: <name>
phase: spec_ready   # pending|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 0     # incremented by reviews_lead; cap 3
---

# Tasks — <name>

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementator` flips each task's `status`.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) | 1 | @s1 | todo | libs/… |
| [task-2](./task-2.md) | 2 | @s2,@s3 | todo | libs/… |
| [task-3](./task-3.md) | 3 | @s4 | todo | libs/… |

**Slice 1 — Happy path + Loading** · **Slice 2 — Empty + Error + Retry** · **Slice 3 — Analytics + Flag + a11y + i18n**

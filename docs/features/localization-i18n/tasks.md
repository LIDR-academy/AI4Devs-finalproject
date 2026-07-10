---
feature: localization-i18n
phase: approved   # pending|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 0     # incremented by reviews_lead; cap 3
---

# Tasks — localization-i18n

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `tdd_craftsman` flips each task's `status`.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) | 1 | @s2 | done | libs/types/src/locale.ts, libs/localization/src/{config,resources} |
| [task-2](./task-2.md) | 1 | @s1 | done | libs/localization/src/{provider,hooks} |
| [task-3](./task-3.md) | 1 | @s3, @s4 | done | libs/localization/src/detector, apps/app-study-buddy (expo-localization) |
| [task-4](./task-4.md) | 1 | @s1, @s3, @s4, @s15 | done | apps/app-study-buddy/src/app/_layout.tsx |
| [task-5](./task-5.md) | 2 | @s7, @s12 | todo | libs/services/src/dao/locale-preference.dao.ts |
| [task-6](./task-6.md) | 2 | @s7, @s12 | todo | libs/services/src/services/locale-preference.service.ts |
| [task-7](./task-7.md) | 2 | @s6, @s7, @s8, @s12 | todo | libs/localization/src/{provider,hooks} |
| [task-8](./task-8.md) | 2 | @s5 | todo | libs/components/src/molecules/language-selector |
| [task-9](./task-9.md) | 2 | @s5, @s6, @s9 | todo | libs/study-buddy/src/components/language-settings, apps/app-study-buddy/src/app/(app)/settings.tsx |
| [task-10](./task-10.md) | 3 | @s9, @s10, @s11, @s14 | todo | apps/app-study-buddy/src/app/**, libs/localization/src/resources |
| [task-11](./task-11.md) | 3 | @s14 | todo | libs/components/src/** |
| [task-12](./task-12.md) | 3 | @s5, @s13, @s15 | todo | libs/components/src/molecules/language-selector, libs/components/tests/e2e |

**Slice 1 — Happy path: lib + provider + auto-detect (+ Loading gate)** · **Slice 2 — Manual override + persistence + fallback/error** · **Slice 3 — Full string migration + a11y + stories**

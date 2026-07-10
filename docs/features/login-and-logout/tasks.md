---
feature: login-and-logout
phase: in_progress   # pending|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 3     # incremented by reviews_lead; cap 3 (final round). Round 1 (full-feature
                     # cycle, reset from a stale Slice-1-only "Round 3") found 5 major + 3 minor +
                     # a mutation FAIL, all fixed (commit feb4204). Round 2 re-verified all 8 as
                     # genuinely fixed and found 1 new major (TextField.accessibilityInvalid not
                     # derived from error), fixed (commit 4f47504). This is Round 3, the final
                     # round under the 3-round cap: re-run all 6 reviewers + mutation once more.
                     # See review.md for the full disposition.
---

# Tasks — login-and-logout

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementator` flips each task's `status`. Build order is strictly Slice 1 → 2 → 3; do not start a slice until the previous slice's gate passes. Within Slice 1, build the logic backbone (task-1 → task-2 → task-3) before the UI (task-4 → task-5).

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) — AuthDao (Supabase auth) | 1 | @s2,@s4 | done | libs/services/src/dao/auth.dao.ts |
| [task-2](./task-2.md) — AuthService (sign-in/out + validators) | 1 | @s2,@s4,@s9 | done | libs/services/src/services/auth.service.ts |
| [task-3](./task-3.md) — useAuth hook | 1 | @s2,@s3,@s4 | done | libs/hooks/src/hooks/use-auth.ts |
| [task-4](./task-4.md) — LoginForm organism (Content + Loading) | 1 | @s2,@s3 | done | libs/components/src/organisms/login-form/ |
| [task-5](./task-5.md) — Wiring + screens + integration + LogOut on Home | 1 | @s1,@s2,@s4,@s7,@s11 | done | libs/study-buddy/src/components/, apps/app-study-buddy/src/app/ |
| [task-6](./task-6.md) — Auth error contract (normalization + type) | 2 | @s5,@s6 | done | libs/services/src/services/auth.service.ts, libs/types/src/auth-error.ts |
| [task-7](./task-7.md) — LoginForm Error + Empty + inline validation | 2 | @s5,@s6,@s8,@s9 | done | libs/components/src/organisms/login-form/ |
| [task-8](./task-8.md) — i18n keys (auth.*) en/es/pt/de | 3 | @s13 | done | libs/localization/src/resources/ |
| [task-9](./task-9.md) — a11y pass + Playwright e2e | 3 | @s12 | done | libs/components/src/organisms/login-form/, libs/components/tests/e2e/ |

**Slice 1 — Happy path + Loading** · **Slice 2 — Empty + Error + Retry** · **Slice 3 — a11y + i18n** *(no analytics / no feature flags in scope)*

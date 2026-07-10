---
feature: localization-i18n
phase: pr_ready   # pending|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 3     # incremented by reviews_lead; cap 3 — CAP REACHED, escalated to human (see review.md)
---

# Tasks — localization-i18n

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `tdd_craftsman` flips each task's `status`.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) | 1 | @s2 | done | libs/types/src/locale.ts, libs/localization/src/{config,resources} |
| [task-2](./task-2.md) | 1 | @s1 | done | libs/localization/src/{provider,hooks} |
| [task-3](./task-3.md) | 1 | @s3, @s4 | done | libs/localization/src/detector, apps/app-study-buddy (expo-localization) |
| [task-4](./task-4.md) | 1 | @s1, @s3, @s4, @s15 | done | apps/app-study-buddy/src/app/_layout.tsx |
| [task-5](./task-5.md) | 2 | @s7, @s12 | done | libs/services/src/dao/locale-preference.dao.ts |
| [task-6](./task-6.md) | 2 | @s7, @s12 | done | libs/services/src/services/locale-preference.service.ts |
| [task-7](./task-7.md) | 2 | @s6, @s7, @s8, @s12 | done | libs/localization/src/{provider,hooks} |
| [task-8](./task-8.md) | 2 | @s5 | done | libs/components/src/molecules/language-selector |
| [task-9](./task-9.md) | 2 | @s5, @s6, @s9 | done | libs/study-buddy/src/components/language-settings, apps/app-study-buddy/src/app/(app)/settings.tsx |
| [task-10](./task-10.md) | 3 | @s9, @s10, @s11, @s14 | done | apps/app-study-buddy/src/app/**, libs/localization/src/resources |
| [task-11](./task-11.md) | 3 | @s14 | done | libs/components/src/** |
| [task-12](./task-12.md) | 3 | @s5, @s13, @s15 | done | libs/components/src/molecules/language-selector, libs/components/tests/e2e |

**Slice 1 — Happy path: lib + provider + auto-detect (+ Loading gate)** · **Slice 2 — Manual override + persistence + fallback/error** · **Slice 3 — Full string migration + a11y + stories**

## Post-approval history
- Round 1 review: APPROVED (all six reviewers), 0 blocker/major, minors carried as follow-ons.
- Mutation (Phase 5): PASS, 100% on changed lines (6 documented + independently-accepted equivalents in `@helsoft/localization`).
- DoD (Phase 6): PASS → `pr_ready` (2026-07-09).
- Polish commit `7084e5f` (2026-07-10): resolved round-1 minors (a11y header role, type-boundary casts, dead-code removal, barrel narrowing, partial memoization).
- Round 2 re-review: triggered by the human to independently confirm `7084e5f` introduced no regressions. 5/6 APPROVED; `reviewer_accessibility` returned CHANGES_REQUESTED (major: `LanguageSelector` container `radiogroup` role likely inert for native assistive tech). One consolidated change request issued to `implementator`.
- Round 3 re-review (this round, **cap reached**): `implementator` investigated thoroughly and concluded no verified-safe code fix exists (the "obvious" fix, `accessible={true}`, would very likely make the individually-accessible `radio` children unreachable on iOS, and this repo's Jest/RNTL tooling cannot faithfully verify otherwise — empirically demonstrated via a probe). Documented as Follow-on **FO2** in `spec.md` (parallel to the existing human-approved `TODO(FO1)`), with corrected test/doc claims. 5/6 reviewers APPROVED this response; `reviewer_accessibility` independently re-verified the investigation as sound but still returned CHANGES_REQUESTED — not asking for more engineering, but because FO2, unlike FO1, has not yet had an explicit human risk-acceptance sign-off. Per the 3-round cap, `reviews_lead` **escalates to the human**. See `review.md` §"Round 3" for the full record and the exact sign-off needed.

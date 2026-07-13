---
feature: ai-key-management
phase: pr_ready   # pending|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 3     # incremented by reviews_lead; cap 3
---

# Tasks — ai-key-management

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementator` flips each task's `status`. Build order is strictly Slice 1 → 2 → 3; do not start a slice until the previous slice's gate passes. Within Slice 1, build the backend + backbone (task-1 → task-6) before the UI (task-7 → task-8).

> **Pre-Slice-1 spike (see risks R-enc / R1 / R2):** confirm Supabase **Vault** availability and the target **provider/validation endpoint** on the hosted project before task-1/task-2. If Vault is unavailable, use the documented `pgcrypto`/`pgsodium` bytea fallback — the client contract is unaffected.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) — DB migration: `user_ai_keys` + Vault + RLS | 1 | @s13 | done | supabase/migrations/ |
| [task-2](./task-2.md) — Edge Function `manage-api-key`: validate-then-store | 1 | @s1,@s12,@s13 | done | supabase/functions/manage-api-key/ |
| [task-3](./task-3.md) — Types: `AiProvider`, `ApiKeyStatus`, save params | 1 | @s11 | done | libs/types/src/api-key.ts |
| [task-4](./task-4.md) — `ApiKeyDao` (invoke save + status select) | 1 | @s1,@s3,@s11 | done | libs/supabase-services/src/dao/api-key.dao.ts |
| [task-5](./task-5.md) — `ApiKeyService` (validate + status) | 1 | @s1,@s3,@s4,@s5 | done | libs/supabase-services/src/services/api-key.service.ts |
| [task-6](./task-6.md) — `useApiKey` hook (load status + save) | 1 | @s1,@s2,@s3 | done | libs/hooks/src/hooks/use-api-key.ts |
| [task-7](./task-7.md) — `ApiKeyForm` organism (Content + Loading) | 1 | @s1,@s2,@s4 | done | libs/components/src/organisms/api-key-form/ |
| [task-8](./task-8.md) — `ApiKeySettings` wiring + settings screen + integration | 1 | @s1,@s3,@s4 | done | libs/study-buddy/src/components/api-key-settings/, apps/app-study-buddy/src/app/(app)/settings.tsx |
| [task-9](./task-9.md) — Edge Function: invalid-key rejection + remove action | 2 | @s6,@s8,@s12 | done | supabase/functions/manage-api-key/ |
| [task-10](./task-10.md) — Error contract + remove backbone (type/DAO/service/hook) | 2 | @s6,@s7,@s8,@s9 | done | libs/types/src/api-key-error.ts, libs/supabase-services/src/dao/api-key.dao.ts, libs/supabase-services/src/services/api-key.service.ts, libs/hooks/src/hooks/use-api-key.ts |
| [task-11](./task-11.md) — `ApiKeyForm` Empty + Error + Retry + Remove + wiring | 2 | @s5,@s6,@s7,@s8,@s9 | done | libs/components/src/organisms/api-key-form/, libs/study-buddy/src/components/api-key-settings/ |
| [task-12](./task-12.md) — Guard rail: `ApiKeyRequiredNotice` + `ApiKeyGate` + upload wiring | 2 | @s10,@s14 | done | libs/components/src/organisms/api-key-required-notice/, libs/study-buddy/src/components/api-key-gate/, apps/app-study-buddy/src/app/(app)/upload.tsx |
| [task-13](./task-13.md) — i18n keys `settings.apiKey.*` (en/es/pt/de) | 3 | @s15 | done | libs/localization/src/resources/, libs/localization/src/coverage/migration-coverage.test.ts |
| [task-14](./task-14.md) — a11y pass + Storybook stories (4 states) + Playwright e2e | 3 | @s14 | done | libs/components/src/organisms/api-key-form/, libs/components/src/organisms/api-key-required-notice/, libs/components/tests/e2e/ |

**Slice 1 — Happy path + Loading** · **Slice 2 — Empty + Error + Retry + Remove + Guard** · **Slice 3 — a11y + i18n** *(no analytics / no feature flags in scope)*

## Full review — status (see `review.md`)

- **Round 1** (all six reviewers, first full pass): CHANGES_REQUESTED — 4 major, 11 minor (15 total). All 15 fixed via TDD by `implementator`; independently re-verified by each originating reviewer in Round 2.
- **Round 2** (all six reviewers, re-verification): all 15 Round 1 findings confirmed genuinely fixed. 1 new major (an undemanded, mislabeled production change to `libs/study-buddy/src/components/api-key-gate/api-key-gate.tsx` reversing an already-closed Round 1 decision — see `review.md`'s provenance note) + 1 new minor (unmemoized `ApiKeyProvider` context value) surfaced and dispatched to `implementator`.
- **Round 3** (final, cap reached): pending — re-run all six reviewers after this round's 2 fixes land. Any blocker/major still open after Round 3 is hard (escalate); only-minors may ship as documented, human-accepted risk.
- Full suite green throughout: `pnpm check-types` 8/8, `pnpm test` all 6 workspaces (services 59, hooks 46, components 98, study-buddy 38, localization 57, lib-with-storybook 2), `pnpm lint` clean, `deno test` 24/24, Playwright 35/35.

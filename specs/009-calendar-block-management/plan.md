# Implementation Plan: Calendar Block Management

**Branch**: `009-calendar-block-management` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-calendar-block-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

US-2.4 (COACHER-19). Coaches and Admins gain the ability to create **personal time blocks** (Coach on self only; Admin on any active Coach) and **gym-wide blocks** (Admin only), aligned to hour boundaries with a 1-hour minimum, validated against overlapping classes/blocks, mirrored to the external scheduling calendar, listed within a date range (with a block-type filter), and **soft-canceled** (status `CANCELED`, record retained for audit, excluded from list and availability). Blocked time is excluded from the available-slots calculation and from class-creation overlap checks. No notifications are generated for blocks.

A `Block` model, `CreateBlock`, `ListBlocks`, `DeleteBlock`, and a mounted (but insecure/incomplete) `blocks.ts` router already exist. This feature reworks them to the documented contract, adds a `status` column (soft-cancel), introduces the pure domain service `BlockPolicy` (authorization + window rules), renames hard-delete to soft-cancel (`CancelBlock`), hardens the router with `authenticate`/`requireRole` + `.strict()` Zod validation, makes availability/class-creation ignore canceled blocks, and delivers minimal frontend block rendering (calendar display, create modal, cancel detail) reusing the existing admin/coach calendar pages.

## Technical Context

**Language/Version**: Node.js 22 LTS + TypeScript (backend); React 18 + Vite + TypeScript (frontend)

**Primary Dependencies**: Backend — Express, Prisma, Zod, googleapis (Google Calendar via Service Account adapter). Frontend — React Router v6, TanStack React Query v5, TailwindCSS v4, Schedule-X (existing calendar component)

**Storage**: PostgreSQL via Prisma. One schema change: add `status` (`ClassStatus`, `@default(ACTIVE)`) to the existing `Block` model + a migration. Existing `Block`, `TrainingClass`, `User`, `SecurityAuditLog`, `BlockType`, `ClassStatus` cover the feature.

**Testing**: Vitest + Supertest (backend unit/integration); Playwright (E2E)

**Target Platform**: Web application (SPA + REST API under `/api/v1/`)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Block list responses p95 < 500 ms; calendar renders blocks for the week without perceptible blocking at expected volumes (a handful of blocks/week); available-slots math unchanged in performance (only adds a `status` filter)

**Constraints**:
- Block start/end MUST be aligned to hour boundaries, duration ≥ 1 hour, `start < end`, and `start` not in the past (rejected with validation errors)
- Personal blocks block ONLY the target Coach's calendar; gym-wide blocks block the entire gym
- Overlap rules: personal block cannot overlap ACTIVE classes of the target Coach or ACTIVE blocks on that Coach's calendar (personal on that Coach or gym-wide); gym-wide block cannot overlap ANY ACTIVE class or block
- Cancellation: Admin → any block; Coach → own `PERSONAL` blocks only; double-cancel → `409`; missing → `404`; denied → `403`
- Error envelope `{ error: { code, message, ref } }`; list responses `{ data, meta }`; single resources returned directly; `POST /blocks` → `201`
- Times stored as UTC; wall-clock interpreted in `Europe/Madrid` (reuse `TimeZoneMath.ts` / frontend `gymDateTime.ts`); hour alignment checked on the UTC instant (`getUTCMinutes() === 0`)
- All dependencies pinned to exact versions; no raw SQL; Google Calendar accessed only server-side
- Hard instance reuse of the calendar-first ordering used by class create/cancel; calendar failure → `503` with no DB change

**Scale/Scope**: Single gym, a handful of Coaches, a few blocks per week; one additive schema migration; no new external dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| G1 | Domain Purity (NON-NEGOTIABLE) | All block business rules (window validation, personal/gym-wide authorization, cancel authorization) live in a new pure domain service `BlockPolicy` (plus the existing pure `OverlapChecker`), with zero Prisma/Express/Zod imports in `src/domain/` | PASS |
| G2 | Test-First for Domain Logic | Acceptance scenarios are specified in `spec.md` (Given/When/Then). `BlockPolicy.test.ts` written and failing before production code (100% branch coverage); each endpoint gets happy-path + validation-error Supertest coverage; calendar syncing covered by int tests when credentials exist | PASS |
| G3 | Security-by-Default | All three block endpoints keep `authenticate` + `requireRole(ADMIN, COACH)`; `.strict()` Zod schemas; `403` for Coach gym-wide / Coach blocking others / Coach canceling non-own blocks; `SecurityAuditLog` on every create/cancel success and every denied attempt; no stack traces | PASS |
| G4 | API Contract Consistency | `GET /blocks` → `{ data, meta }`; `POST /blocks` → `201` resource; `DELETE /blocks/:id` → `200 { status: "canceled" }`; errors → `{ error: { code, message, ref } }`; `/api/v1/` prefix; contract already documented in `docs/api-specifications.md` §Blocks | PASS |
| G5 | Dependency Integrity | No new npm dependencies; existing ones pinned | PASS |
| G6 | Observability & audit | Every block creation and cancellation (success + denied) logged with actor, resource, and outcome per Constitution §Security-Requirements.5 | PASS |

No gate violations. `Complexity Tracking` table intentionally empty.

**Post-design re-check (after Phase 1)** — all six gates still PASS: `BlockPolicy` (pure) + `OverlapChecker` cover every business rule (G1); `BlockPolicy.test.ts` 100% branch + endpoint happy/validation tests + credential-gated int tests planned (G2); all three endpoints behind `authenticate` + `requireRole(ADMIN, COACH)` with `.strict()` schemas and full audit logging (G3); DTO/envelope/pagination match the documented `docs/api-specifications.md` §Blocks contract (G4); zero new dependencies (G5); `block.create`/`block.cancel` audit on every success and denial (G6).

## Project Structure

### Documentation (this feature)

```text
specs/009-calendar-block-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — key design decisions
├── data-model.md        # Phase 1 output — entity/state model
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/           # Phase 1 output — API contracts
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Existing hexagonal backend (reused; two rails below), no new top-level directories:

```text
backend/src/
├── prisma/
│   ├── schema.prisma                 # MODIFY: Block gains `status ClassStatus @default(ACTIVE)`
│   └── migrations/<ts>_block_status/ # NEW migration (add column, default ACTIVE backfills)
├── domain/services/
│   └── BlockPolicy.ts                # NEW: pure rules (validBlockWindow, canCreatePersonal, canCreateGymWide, canCancel)
├── application/use-cases/
│   ├── CreateBlock.ts                # REWORK: authorization + window validation + overlap check + calendar-first + audit
│   ├── ListBlocks.ts                 # REWORK: required start/end range + optional blockType + status ACTIVE + pagination
│   ├── CancelBlock.ts                # NEW (replaces DeleteBlock.ts): soft-cancel + perms + calendar delete + audit
│   ├── GetAvailableSlots.ts          # MODIFY: block query filters `status: "ACTIVE"`
│   └── CreateTrainingClass.ts        # MODIFY: `loadSlotContext` block query filters `status: "ACTIVE"`
├── infrastructure/
│   ├── dto/blockDto.ts               # NEW: toBlockDTO (snake_case row → camelCase API object)
│   ├── routes/blocks.ts              # REWORK: authenticate + requireRole + strict Zod + DTO + 503 guard
│   ├── routes/index.ts               # unchanged (blocks router already mounted at `/`)
│   └── config/container.ts           # MODIFY: register BlockPolicy; createBlock + CancelBlock (was deleteBlock) + ListBlocks(new input)
└── __tests__/
    ├── BlockPolicy.test.ts           # NEW: 100% branch coverage
    ├── blocks.test.ts                # NEW: API happy-path + validation-error per endpoint
    └── blocks.int.test.ts            # NEW: Google Calendar create/delete syncing (runIf hasCredentials)
```

Frontend (Admin + Coach shared calendar surface):

```text
frontend/src/
├── domain/types/block.ts                      # NEW: BlockType, Block, ListBlocksParams/Response, CreateBlockPayload/Response
├── domain/usecases/{listBlocks,createBlock,cancelBlock}.ts  # NEW: thin wrappers
├── domain/utils/blockCalendarEvents.ts        # NEW: toBlockCalendarEvent (Schedule-X event)
├── infrastructure/repositories/blocksRepository.ts         # NEW: list/create/cancel
├── infrastructure/hooks/{useListBlocks,useCreateBlock,useCancelBlock}.ts  # NEW
└── ui/
    ├── components/ClassCalendar.tsx           # EXTEND: fetch blocks for week, merge into calendar, block click → detail
    ├── components/CreateBlockModal.tsx        # NEW: type selector + coach (Admin) + hour-aligned picks + description
    ├── components/BlockDetailView.tsx         # NEW: block info + role-aware Cancel action
    ├── pages/admin/CalendarPage.tsx           # EXTEND: "Add Block" button + modal
    └── pages/coach/CalendarPage.tsx           # EXTEND: "Add Block" button + modal
```

Docs (repository root):

```text
docs/
├── api-specifications.md   # NOTE: GET /blocks excludes canceled blocks; blockType casing normalized to enum values
└── system-architecture.md  # UPDATE: Block ERD node gains `status` field
```

**Structure Decision**: Follow the existing hexagonal layering exactly — no new top-level directories, no new packages, no new frontend domains. Backend is a moderate rework of three existing use cases + one new domain service + one additive migration; frontend extends the existing repo/hook/component pattern and reuses the shared `ClassCalendar`. The visual calendar itself already exists (US-2.5 deliverables like full calendar polish and the standalone block-styling pass remain in US-2.5); this feature delivers block rendering on that calendar plus create/cancel behavior.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

### T038 — Dependency Integrity (Constitution §V) audit gate deviation (pre-existing)

`npm audit --audit-level=high` in `backend/` fails on **pre-existing** toolchain vulnerabilities
that predate this feature and are unrelated to the calendar-block work. Original state: 11
vulnerabilities (3 moderate, 6 high, 2 critical) across three dependency chains. This feature
resolved one of them in full:

- **Fixed**: `bcrypt` `^5.1.1` (CJS, depends on `@mapbox/node-pre-gyp@1.0.11` → `tar@6.2.1`,
  critical) upgraded to exact `bcrypt@6.0.0` (native, drops the `tar` build chain). Backend suite
  (264 passed), `tsc --noEmit`, and Biome remain green. Audit dropped to 8 vulnerabilities
  (3 moderate, 4 high, 1 critical).

**Remaining (documented, not fixed — require major upgrades with breaking-change risk, out of
scope for this feature):**

| Chain | Severity | Root cause | Why left |
|---|---|---|---|
| `prisma` CLI → `@prisma/config@6.19.3` → `deepmerge-ts@7.1.5` | high ×2 | `deepmerge-ts <8.0.0` (GHSA-ggr8-5vv4-36mx) | `@prisma/config` pins `deepmerge-ts` to exact `7.1.5`; no patched Prisma 6.x exists — the fix requires Prisma 7 (major, breaking). |
| `vitest` → `@vitest/mocker` / `vite@5.4.21` (vitest 2.1.x) | critical + high | vite ≤ 6.4.2 advisories (GHSA-4w7w-66w2-5vf9, GHSA-v6wh-96g9-6wx3, GHSA-5xrq-8626-4rwp) | Vitest 2.x pins `vite@^5`; patched versions require Vitest 3/4 + Vite 6/7/8 (major test-runner upgrade). Affects dev tooling only, not the deployed runtime. |

All remaining findings are dev-time dependencies (Prisma CLI, test runner). The deployed
production bundle (`dist/`) does not include them. These will be tracked as follow-up tech-debt
to be addressed before merge of future PRs; the PR description for this feature discloses the
non-green audit gate per §V.
# Tasks: Realista MVP

**Input**: Design documents from `/specs/001-realista-mvp/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are MANDATORY (Constitution Principle II: Test-First). TDD cycle: write tests → fail → implement → green → refactor. 80%+ domain coverage target.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- **Tests**: `backend/tests/`, `frontend/tests/`, `e2e/`
- Based on plan.md monorepo structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and CI skeleton

- [ ] T001 Create monorepo structure with `backend/`, `frontend/`, `e2e/` directories per plan.md
- [ ] T002 [P] Initialize backend package.json with TypeScript + Express dependencies in `backend/package.json`
- [ ] T003 [P] Initialize frontend SvelteKit project with Vite in `frontend/` via `npm create svelte@latest`
- [ ] T004 [P] Configure TypeScript strict mode in `backend/tsconfig.json` and `frontend/tsconfig.json`
- [ ] T005 [P] Configure ESLint + Prettier with shared config in `.eslintrc.json` and `.prettierrc`
- [ ] T006 [P] Create `.env.example` with DATABASE_URL, OPENROUTER_API_KEY, PORT, FRONTEND_URL in project root
- [ ] T007 Create CI skeleton GitHub Action in `.github/workflows/ci.yml` (lint → typecheck → test)
- [ ] T008 Install Vitest in both backend and frontend with config files `backend/vitest.config.ts` and `frontend/vitest.config.ts`
- [ ] T009 Install Playwright for E2E in `e2e/playwright.config.ts`

**Checkpoint**: Project builds, lints, and test runner executes (even with no tests yet)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Setup Prisma schema in `backend/src/infrastructure/prisma/schema.prisma` with models: User, PurchaseProcess, AnalyzedListing, Checklist (per data-model.md)
- [ ] T011 Generate Prisma client and create initial migration with `npx prisma migrate dev --name init`
- [ ] T012 Create base PrismaClient singleton in `backend/src/infrastructure/prisma/client.ts`
- [ ] T013 Setup Express server entry point in `backend/src/index.ts` with CORS, JSON body parser, health endpoint
- [ ] T014 [P] Implement session middleware: generate/validate UUID v4, store in `X-Session-Id` header in `backend/src/api/middleware/session.ts`
- [ ] T015 [P] Implement rate limit middleware: 20 req/day per session UUID in `backend/src/api/middleware/rateLimiter.ts`
- [ ] T016 [P] Create environment config loader with validation in `backend/src/infrastructure/config/env.ts`
- [ ] T017 [P] Create error handling middleware (domain errors → HTTP status codes) in `backend/src/api/middleware/errorHandler.ts`
- [ ] T018 Create User domain aggregate with UUID id, optional userId, createdAt in `backend/src/domain/aggregates/User.ts`
- [ ] T019 [P] Create PurchaseProcess domain aggregate with status, financialProfile JSON in `backend/src/domain/aggregates/PurchaseProcess.ts`
- [ ] T020 [P] Setup SvelteKit layout shell with mobile-first nav tabs in `frontend/src/routes/+layout.svelte`
- [ ] T021 [P] Create base API client with fetch wrapper handling X-Session-Id header in `frontend/src/lib/api/client.ts`
- [ ] T022 Create session store (Svelte writable) managing session UUID lifecycle in `frontend/src/lib/stores/session.ts`

**Checkpoint**: Backend starts, migrations run, middleware chain works, frontend loads with layout

---

## Phase 3: User Story 1 - Listing Lens (Priority: P1) 🎯 MVP

**Goal**: User pastes listing URL → LLM analysis + cadastral cross-reference → transparency score + red flags report

**Independent Test**: POST mocked listing URL to `/api/listings/analyze` → verify 200 with score, redFlags, cadastral comparison

### Tests for User Story 1

> Write these FIRST, ensure they FAIL before implementation

- [ ] T023 [P] [US1] Unit test TransparencyScore value object in `backend/tests/unit/domain/value-objects/TransparencyScore.test.ts`
- [ ] T024 [P] [US1] Unit test RedFlags value object in `backend/tests/unit/domain/value-objects/RedFlags.test.ts`
- [ ] T025 [P] [US1] Unit test AnalyzeListingUseCase with mocked ports in `backend/tests/unit/domain/services/AnalyzeListingUseCase.test.ts`
- [ ] T026 [P] [US1] Integration test POST /api/listings/analyze with mocked Cheerio + LLM in `backend/tests/integration/api/listings.test.ts`
- [ ] T027 [P] [US1] Contract test for analyze endpoint matching contracts/api.md in `backend/tests/contract/test_listings_analyze.test.ts`

### Implementation for User Story 1

- [ ] T028 [US1] Create TransparencyScore value object with score 0-100, label, breakdown in `backend/src/domain/value-objects/TransparencyScore.ts`
- [ ] T029 [P] [US1] Create RedFlags value object with flag types and Spanish labels in `backend/src/domain/value-objects/RedFlags.ts`
- [ ] T030 [US1] Create ListingAnalyzerPort interface in `backend/src/domain/ports/ListingAnalyzerPort.ts`
- [ ] T031 [P] [US1] Create CadastroPort interface in `backend/src/domain/ports/CadastroPort.ts`
- [ ] T032 [US1] Implement CheerioAdapter (HTML parsing, text extraction) in `backend/src/adapters/cheerio/CheerioAdapter.ts`
- [ ] T033 [US1] Implement OpenRouterAdapter (LLM system prompt, structured JSON output) in `backend/src/adapters/openrouter/OpenRouterAdapter.ts`
- [ ] T034 [US1] Implement AvenaScoreAdapter (@avena/score fallback) in `backend/src/adapters/avena-score/AvenaScoreAdapter.ts`
- [ ] T035 [US1] Implement CatastroAdapter (API cross-reference, coordinate query) in `backend/src/adapters/catastro/CatastroAdapter.ts`
- [ ] T036 [US1] Implement MiraTuZonaAdapter (location link generation) in `backend/src/adapters/miratuzona/MiraTuZonaAdapter.ts`
- [ ] T037 [US1] Implement AnalyzeListingUseCase orchestrating adapters (LLM → cadastral cross-ref → MiraTuZona) in `backend/src/domain/services/AnalyzeListingUseCase.ts`
- [ ] T038 [US1] Create AnalyzedListing domain aggregate (matches data-model.md) in `backend/src/domain/aggregates/AnalyzedListing.ts`
- [ ] T039 [US1] Implement analyze listing route POST /api/listings/analyze in `backend/src/api/routes/listings.ts`
- [ ] T040 [US1] Create listings controller handling request validation and use case dispatch in `backend/src/api/controllers/listingsController.ts`
- [ ] T041 [US1] Add URL validation helper (validates format, checks reachability) in `backend/src/infrastructure/utils/urlValidator.ts`
- [ ] T042 [US1] Create Listing Lens page UI with URL input, loading state, results card in `frontend/src/routes/listing-lens/+page.svelte`
- [ ] T043 [US1] Create server-side loader proxying analyze request to backend API in `frontend/src/routes/listing-lens/+page.server.ts`
- [ ] T044 [US1] Create listings store (Svelte writable) for analyzed listing history in `frontend/src/lib/stores/listings.ts`

**Checkpoint**: Listing Lens fully functional — paste URL, get score + red flags + cadastral comparison. TDD cycle complete.

---

## Phase 4: User Story 2 - Mortgage Compass (Priority: P1) 🎯 MVP

**Goal**: User enters financial data → hidden costs revealed → persona questions → strategy comparison (amortization vs investing) → educational narrative

**Independent Test**: POST financial profile to `/api/purchase-processes` → verify hidden costs calculation, strategy scenarios, and template-based narrative

### Tests for User Story 2

> Write these FIRST, ensure they FAIL before implementation

- [ ] T045 [P] [US2] Unit test FinancialProfile value object with validation in `backend/tests/unit/domain/value-objects/FinancialProfile.test.ts`
- [ ] T046 [P] [US2] Unit test HiddenCosts calculator (ITP/IVA by region, notary, registry) in `backend/tests/unit/domain/value-objects/HiddenCosts.test.ts`
- [ ] T047 [P] [US2] Unit test AmortizationScenario calculator (30yr, voluntary extra payments) in `backend/tests/unit/domain/services/AmortizationCalculator.test.ts`
- [ ] T048 [P] [US2] Unit test InvestmentAlternative calculator (compound returns) in `backend/tests/unit/domain/services/InvestmentCalculator.test.ts`
- [ ] T049 [P] [US2] Unit test educational narrative templates (persona ↔ template mapping) in `backend/tests/unit/domain/services/NarrativeGenerator.test.ts`
- [ ] T050 [P] [US2] Integration test POST /api/purchase-processes with full profile in `backend/tests/integration/api/purchaseProcesses.test.ts`

### Implementation for User Story 2

- [ ] T051 [US2] Create FinancialProfile value object with validation (price, savings, income, debts, region, persona) in `backend/src/domain/value-objects/FinancialProfile.ts`
- [ ] T052 [P] [US2] Create HiddenCosts value object with regional ITP/IVA rates, fixed costs in `backend/src/domain/value-objects/HiddenCosts.ts`
- [ ] T053 [US2] Implement hidden costs calculator by autonomous community in `backend/src/domain/services/HiddenCostsCalculator.ts`
- [ ] T054 [US2] Implement amortization calculator: 30yr base, 4 scenarios (baseline, light €100/mo, moderate €300/mo, aggressive €500/mo) in `backend/src/domain/services/AmortizationCalculator.ts`
- [ ] T055 [US2] Implement investment alternative calculator: compound 5-7% over 30 years in `backend/src/domain/services/InvestmentCalculator.ts`
- [ ] T056 [US2] Implement narrative generator: hardcoded educational templates keyed to persona × scenario combos in `backend/src/domain/services/NarrativeGenerator.ts`
- [ ] T057 [US2] Implement purchase process route POST /api/purchase-processes in `backend/src/api/routes/purchaseProcesses.ts`
- [ ] T058 [US2] Implement purchase process route GET /api/purchase-processes/:id in `backend/src/api/routes/purchaseProcesses.ts`
- [ ] T059 [US2] Implement purchase process route PATCH /api/purchase-processes/:id in `backend/src/api/routes/purchaseProcesses.ts`
- [ ] T060 [US2] Create purchase process controller in `backend/src/api/controllers/purchaseProcessController.ts`
- [ ] T061 [US2] Create Mortgage Compass page UI: multi-step form (profile → hidden costs → persona → strategy playground) in `frontend/src/routes/mortgage-compass/+page.svelte`
- [ ] T062 [US2] Create server-side loader proxying purchase process to backend in `frontend/src/routes/mortgage-compass/+page.server.ts`
- [ ] T063 [US2] Create financial profile store in `frontend/src/lib/stores/financialProfile.ts`

**Checkpoint**: Mortgage Compass fully functional — enter data, see hidden costs, get strategy comparison. TDD cycle complete.

---

## Phase 5: User Story 3 - Dashboard (Priority: P2)

**Goal**: User sees dashboard with listing history, financial snapshot, re-analysis diff, empty state for new sessions

**Independent Test**: Analyze a listing + complete profile → reload dashboard → verify data persists and displays correctly

### Tests for User Story 3

> Write these FIRST, ensure they FAIL before implementation

- [ ] T064 [P] [US3] Integration test GET /api/listings returning session history in `backend/tests/integration/api/listings.test.ts`
- [ ] T065 [P] [US3] Integration test re-analysis diff detection in `backend/tests/integration/api/listings.test.ts`
- [ ] T066 [P] [US3] Component test Dashboard page rendering analyzed listings in `frontend/tests/unit/routes/Dashboard.test.ts`

### Implementation for User Story 3

- [ ] T067 [US3] Implement GET /api/listings route returning all listings for session in `backend/src/api/routes/listings.ts`
- [ ] T068 [US3] Implement GET /api/listings/:id route returning single listing detail in `backend/src/api/routes/listings.ts`
- [ ] T069 [US3] Implement snapshot hash comparison (SHA-256 diff detection) for re-analysis in `backend/src/domain/services/SnapshotService.ts`
- [ ] T070 [US3] Implement GET /api/session route returning/creating session UUID in `backend/src/api/routes/session.ts`
- [ ] T071 [US3] Create Dashboard page UI: listing cards, financial snapshot, CTAs, empty state in `frontend/src/routes/+page.svelte` (overwrites default home)
- [ ] T072 [US3] Create server-side loader fetching listings + purchase process for dashboard in `frontend/src/routes/+page.server.ts`
- [ ] T073 [US3] Implement re-analyze flow: button triggers new analysis, shows diff highlight in `frontend/src/lib/stores/listings.ts`

**Checkpoint**: Dashboard fully functional — history, snapshot, re-analysis diff. All P1+P2 stories independently working.

---

## Phase 6: User Story 4 - Interactive Timeline (Priority: P3)

**Goal**: User views a visual 60-90 day timeline from arras to escritura with milestone details

**Independent Test**: Open timeline page → verify all milestones displayed with descriptions and durations

### Implementation for User Story 4

- [ ] T074 [US4] Create BureaucraticMilestone value object with stages, durations, document requirements in `backend/src/domain/value-objects/BureaucraticMilestone.ts`
- [ ] T075 [US4] Create static timeline data: arras → legal check → tasación → hipoteca → notaría → registro → escritura in `frontend/src/lib/data/timelineData.ts`
- [ ] T076 [US4] Create Timeline page UI with vertical timeline, expandable milestones in `frontend/src/routes/timeline/+page.svelte`

**Checkpoint**: Timeline fully functional — visual, interactive, all milestones detailed

---

## Phase 7: User Story 5 - Document Checklist (Priority: P3)

**Goal**: User tracks which documents they have/need per stage. Progress persists.

**Independent Test**: Open checklist → toggle items → reload → verify progress persisted

### Tests for User Story 5

> Write these FIRST, ensure they FAIL before implementation

- [ ] T077 [P] [US5] Integration test PATCH /api/checklist/:processId/items/:itemId toggling completion in `backend/tests/integration/api/checklist.test.ts`

### Implementation for User Story 5

- [ ] T078 [US5] Create Checklist domain aggregate (matches data-model.md) in `backend/src/domain/aggregates/Checklist.ts`
- [ ] T079 [US5] Implement GET /api/checklist/:processId route in `backend/src/api/routes/checklist.ts`
- [ ] T080 [US5] Implement PATCH /api/checklist/:processId/items/:itemId route for toggling in `backend/src/api/routes/checklist.ts`
- [ ] T081 [US5] Create checklist controller in `backend/src/api/controllers/checklistController.ts`
- [ ] T082 [US5] Create static checklist seed data (documents by stage: pre-arras, post-arras, pre-escritura, post-escritura) in `backend/src/infrastructure/prisma/seed.ts`
- [ ] T083 [US5] Create Checklist page UI: items grouped by stage, progress bars, toggle interaction in `frontend/src/routes/checklist/+page.svelte`

**Checkpoint**: Checklist fully functional — grouped by stage, toggle persists, progress tracked

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: PWA, E2E, final validation

- [ ] T084 Configure PWA with `@vite-pwa/sveltekit`: service worker, manifest, icons in `frontend/vite.config.ts`
- [ ] T085 [P] Generate PWA icons (192px, 512px) from SVG base in `frontend/static/`
- [ ] T086 [P] Add loading skeletons and error states to all pages (Listing Lens, Mortgage Compass, Dashboard)
- [ ] T087 [P] Add Spanish locale error messages and UI labels consistent across all pages
- [ ] T088 Create E2E test: full flow (paste URL → score → financial profile → hidden costs → strategy → dashboard) in `e2e/flows/full-flow.spec.ts`
- [ ] T089 Run quickstart.md validation: verify all setup and test commands work from scratch
- [ ] T090 Final TypeScript typecheck + lint pass across all packages
- [ ] T091 Add Prisma seed script with sample checklist data and Euribor default value

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Listing Lens (Phase 3)**: Depends on Foundational
- **US2 Mortgage Compass (Phase 4)**: Depends on Foundational. Independent from US1 (different domain services, routes, pages)
- **US3 Dashboard (Phase 5)**: Depends on Foundational. Needs US1 + US2 routes for display, but independently testable via API
- **US4 Timeline (Phase 6)**: Depends on Foundational. Static content, no backend needed. Independent
- **US5 Checklist (Phase 7)**: Depends on Foundational. Independent from other stories
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories. Start after Phase 2
- **US2 (P1)**: No dependencies on other stories. Can run in parallel with US1
- **US3 (P2)**: Ideally after US1+US2 for full data display, but API is independently testable
- **US4 (P3)**: Static, no API dependencies. Can run any time after Phase 2
- **US5 (P3)**: No dependencies on other stories. Can run any time after Phase 2

### Within Each User Story

- Tests MUST be written FIRST and FAIL before implementation
- Domain value objects → domain services → adapters → API routes → controllers
- Backend complete before frontend pages for that story
- Story complete and independently tested before moving to next priority

### Parallel Opportunities

- T002, T003, T004, T005, T006 in Setup can all run in parallel
- T014, T015, T016, T017 in Foundational can run in parallel
- T023-T027 (US1 tests) can all run in parallel
- T045-T050 (US2 tests) can all run in parallel
- T028-T029, T031 (US1 models/ports) can run in parallel
- T032-T036 (US1 adapters) are independent and can run in parallel
- T051-T052 (US2 models) can run in parallel
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Foundational
- US4 (Phase 6) and US5 (Phase 7) can run in parallel

---

## Parallel Example: User Story 1 Tests + Models

```bash
# Launch all US1 tests in parallel:
Task: "T023: Unit test TransparencyScore in backend/tests/unit/domain/value-objects/TransparencyScore.test.ts"
Task: "T024: Unit test RedFlags in backend/tests/unit/domain/value-objects/RedFlags.test.ts"
Task: "T025: Unit test AnalyzeListingUseCase in backend/tests/unit/domain/services/AnalyzeListingUseCase.test.ts"
Task: "T026: Integration test analyze endpoint in backend/tests/integration/api/listings.test.ts"

# Launch all US1 adapters in parallel:
Task: "T032: Implement CheerioAdapter in backend/src/adapters/cheerio/CheerioAdapter.ts"
Task: "T033: Implement OpenRouterAdapter in backend/src/adapters/openrouter/OpenRouterAdapter.ts"
Task: "T034: Implement AvenaScoreAdapter in backend/src/adapters/avena-score/AvenaScoreAdapter.ts"
Task: "T035: Implement CatastroAdapter in backend/src/adapters/catastro/CatastroAdapter.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Listing Lens) + Phase 4: User Story 2 (Mortgage Compass) in parallel
4. **STOP and VALIDATE**: Test both independently via API + frontend
5. Deploy/demo — this IS a viable MVP with the two core features

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 Listing Lens → Test independently → Demo
3. US2 Mortgage Compass → Test independently → Demo
4. US3 Dashboard → ties US1+US2 → Demo full experience
5. US4 Timeline → Demo with context
6. US5 Checklist → Demo practical tool
7. Polish + E2E → Final deliverable

### Parallel Strategy

With the two P1 stories (US1, US2) having zero code dependencies on each other:
- After Foundational, implement US1 and US2 in parallel
- US1: domain (listings, scoring, cadastral) → adapters → API → frontend
- US2: domain (finance, mortgage, templates) → API → frontend
- US3 (Dashboard) integrates both when ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability (cohort requirement)
- Each user story is independently completable and testable
- Tests MUST be written and FAIL before implementation (TDD per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend uses hexagonal architecture: domain/ → adapters/ → api/
- Frontend uses SvelteKit file-based routing with `+page.server.ts` loaders
- All task IDs are sequential (T001–T091) for cross-reference with cohort tickets
# Tasks: Mercadona Live Price Comparison

**Input**: Design documents from `specs/003-mercadona-price-comparison/`

**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/ ✓

**TDD**: Constitution I is mandatory — every implementation task is preceded by a failing-test task. Tests MUST fail before the implementation task begins.

**Organization**: Phases 3–5 map to user stories (US1 = P1, US2 = P2, US3 = P3). Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1/US2/US3 — maps to spec.md user story priority

---

## Phase 1: Setup

**Purpose**: Create the Mercadona integration skeleton so later phases have a concrete target.

- [x] T001 Create `back/src/integrations/mercadona/` directory and write the empty `MercadonaModule` shell in `back/src/integrations/mercadona/mercadona.module.ts` (declares and exports `MercadonaService`; leave provider as a placeholder class stub)

**Checkpoint**: Directory exists; `mercadona.module.ts` compiles without errors.

---

## Phase 2: Foundational — Name Normalization

**Purpose**: `normalizeMercadonaQuery` is used by both US1 and US2. Must be complete and tested before any service implementation begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Write failing unit tests for `normalizeMercadonaQuery` in `back/src/integrations/mercadona/normalize.spec.ts` — cover: lowercase, accent stripping (e.g. "Léche" → "leche"), quantity suffix removal ("Leche Entera 1L" → "leche entera", "Yogur 500g" → "yogur"), returns `null` when result < 3 chars, handles empty string
- [x] T003 Implement `normalizeMercadonaQuery(input: string): string | null` in `back/src/integrations/mercadona/normalize.ts` — calls existing `normalizePriceComparisonName`, then strips quantity/unit suffixes (`\b\d+\s*(g|kg|ml|l|cl|dl|oz|lb|ud|unid)\b`, `\bx\d+\b`), returns `null` if result length < 3

**Checkpoint**: `npx jest normalize.spec` passes; `normalizeMercadonaQuery` is fully tested.

---

## Phase 3: User Story 1 — Live Price Lookup (P1) 🎯 MVP

**Goal**: User sees the current Mercadona price alongside what they paid, with a price delta.

**Independent Test**: Add a pantry item "leche", request price comparison, verify the response contains `mercadona.found: true`, `mercadona.priceEur`, and a non-null `delta` value.

### Backend — MercadonaService (TDD)

- [x] T004 [US1] Write failing unit tests for `MercadonaService.searchProduct` in `back/src/integrations/mercadona/mercadona.service.spec.ts` — cover: (a) successful fetch returns `MercadonaProduct` with `productName`, `priceEur`, `unit`, `fetchedAt`, `source: "MERCADONA_LIVE"`; (b) cache hit returns same data with `source: "MERCADONA_CACHED"` and does NOT call fetch again; (c) empty `results.products` array returns `null`; (d) zero or negative `unit_price` returns `null`; (e) `normalizeMercadonaQuery` returning `null` (name too short) returns `null` without fetching
- [x] T005 [US1] Implement `MercadonaService` in `back/src/integrations/mercadona/mercadona.service.ts` — `searchProduct(rawName: string): Promise<MercadonaProduct | null>` calls `normalizeMercadonaQuery`; fetches `https://tienda.mercadona.es/api/search/?query={encoded}&lang=es&wh=vlc1` with `User-Agent: RealSaveFooding/1.0`; maps first result to `MercadonaProduct`; stores in class-level `Map` cache with 24h TTL and `fetchedAt`; returns `source: "MERCADONA_LIVE"` on fresh fetch
- [x] T006 [US1] Register `MercadonaService` as provider in `back/src/integrations/mercadona/mercadona.module.ts` (complete the stub from T001)

### Backend — InsightsService update (TDD)

- [x] T007 [US1] Write failing unit tests for the Mercadona-found path in `back/src/modules/insights/insights.service.spec.ts` — cover: (a) response includes `mercadona: { found: true, productName, priceEur, unit, lastUpdatedAt, source }` when `MercadonaService.searchProduct` returns a result; (b) `delta` equals `(latestUnitPriceEur - mercadona.priceEur).toFixed(2)` when both values present; (c) `delta` is `null` when `receiptContext.latestUnitPriceEur` is null; (d) top-level `found` is `true`
- [x] T008 [US1] Update `InsightsService.getPriceComparison` in `back/src/modules/insights/insights.service.ts` — inject `MercadonaService`; call `searchProduct(inputNormalizedName)` in parallel with the existing static catalog lookup (`Promise.all`); add `mercadona: MercadonaResult` field to the response; compute `delta`; keep all existing response fields unchanged
- [x] T009 [US1] Import `MercadonaModule` in `back/src/modules/insights/insights.module.ts`

### Frontend

- [x] T010 [US1] Extend `PriceComparisonResponse` in `front/src/features/insights/insights.api.ts` — add `MercadonaResult` interface (all fields from data-model.md) and `mercadona: MercadonaResult` + `delta: string | null` to `PriceComparisonResponse`
- [x] T011 [US1] Update `front/src/routes/compare-price.$id.tsx` — add a Mercadona section that renders: product name, price (e.g. `€0.72`), unit, and delta ("You overpaid by €X.XX" / "You paid €X.XX less than Mercadona"); show section only when `comparison.mercadona.found` is true

**Checkpoint**: `GET /api/insights/price-comparison?normalizedName=leche` returns `mercadona.found: true` with a live price; UI renders the Mercadona section with delta.

---

## Phase 4: User Story 2 — Graceful Fallback (P2)

**Goal**: When Mercadona returns no result or service is unavailable, the static catalog is shown without error.

**Independent Test**: Mock `MercadonaService.searchProduct` to return `null` or throw; verify the endpoint returns 200 with `mercadona.found: false` and `reference` still populated (if catalog has entry).

### Backend — Timeout and error handling (TDD)

- [x] T012 [US2] Write failing unit tests for `MercadonaService.searchProduct` error paths in `back/src/integrations/mercadona/mercadona.service.spec.ts` — cover: (a) fetch taking > 3s → `AbortController` fires → returns `null`; (b) Mercadona responds with 5xx → returns `null`; (c) network error (fetch rejects) → returns `null` (no throw propagated)
- [x] T013 [US2] Implement timeout and error handling in `back/src/integrations/mercadona/mercadona.service.ts` — add `AbortController` with 3-second `setTimeout`; wrap fetch in try/catch; return `null` on any error (timeout, 5xx, network failure); log a warning on failure
- [x] T014 [US2] Write failing unit tests for InsightsService fallback path in `back/src/modules/insights/insights.service.spec.ts` — cover: (a) `MercadonaService.searchProduct` returns `null` AND static catalog has entry → `mercadona.found: false`, `found: true`, `reference` populated, `unavailableReason: null`; (b) both sources return nothing → `found: false`, `unavailableReason: "NO_REFERENCE_DATA"`, `delta: null`
- [x] T015 [US2] Update `InsightsService.getPriceComparison` in `back/src/modules/insights/insights.service.ts` — handle `null` Mercadona result (no throw); set `mercadona.found: false`; set top-level `found` based on whether EITHER source has data; keep `unavailableReason: "NO_REFERENCE_DATA"` only when BOTH sources have nothing

### Frontend

- [x] T016 [US2] Update `front/src/routes/compare-price.$id.tsx` — when `mercadona.found` is `false`, show a muted "No live price from Mercadona" message in the Mercadona section; the existing static catalog section continues to render normally

**Checkpoint**: Mock Mercadona to return empty and verify the comparison view shows the static catalog price without error. Mock both to fail and verify the "no data" state appears.

---

## Phase 5: User Story 3 — Price Freshness Visibility (P3)

**Goal**: User sees when the Mercadona price was last retrieved and whether it came from cache.

**Independent Test**: Request a comparison for the same item twice; the second response has `source: "MERCADONA_CACHED"` and `lastUpdatedAt` matches the first fetch timestamp; the UI shows "Last updated X hours ago" and a "(cached)" indicator.

### Frontend

- [x] T017 [US3] Update `front/src/routes/compare-price.$id.tsx` — below the Mercadona price, render "Last updated: X hours ago" (derived from `mercadona.lastUpdatedAt`); when `mercadona.source === "MERCADONA_CACHED"`, show a "(cached)" badge next to the price; when `source === "MERCADONA_LIVE"`, show no badge (or "Live")

### Backend E2E

- [x] T018 [US3] [P] Add Mercadona test cases to `back/test/insights.e2e-spec.ts` using `jest.spyOn(mercadonaService, "searchProduct")` — cover: (a) live result returned (200, `mercadona.found: true`); (b) Mercadona returns null → static catalog fallback (200, `mercadona.found: false`, `reference` present); (c) unauthenticated request (401); (d) `normalizedName` missing (400)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation across all user stories.

- [x] T019 Write Playwright E2E test in `front/tests/e2e/insights/price-comparison.spec.ts` — use `page.route("**/insights/price-comparison**", ...)` to mock: (a) Mercadona found scenario: assert product name, price, and "Last updated" appear; (b) Mercadona not found + static catalog: assert fallback message; (c) verify "cached" label on second render when `source: "MERCADONA_CACHED"`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — delivers the MVP
- **Phase 4 (US2)**: Depends on Phase 3 (adds error paths to existing service methods)
- **Phase 5 (US3)**: Depends on Phase 3 (source/lastUpdatedAt already in the response from T004/T005)
- **Phase 6 (Polish)**: Depends on Phases 3–5

### Within Phase 3 (US1)

```
T004 → T005 → T006   (MercadonaService: test → impl → module)
T007 → T008 → T009   (InsightsService: test → impl → module)
T010 → T011           (Frontend: types → UI)

T004..T006 must precede T007..T009 (InsightsService injects MercadonaService)
T009 must precede T010 (UI depends on types)
```

### Within Phase 4 (US2)

```
T012 → T013   (MercadonaService error paths: test → impl)
T014 → T015   (InsightsService fallback: test → impl)
T016           (Frontend fallback state — after T015)
```

### Parallel Opportunities

- T002 and T004 writing can happen conceptually at the same time (different files) but T002/T003 must complete before T004/T005.
- T010 (frontend types) and T007 (backend service spec) can be written in parallel once T005 is done.
- T018 (backend E2E) and T017 (frontend UI) in Phase 5 are independent and can be parallelized.

---

## Implementation Strategy

### MVP (US1 only — Phases 1–3)

1. Phase 1: Create directory + module stub
2. Phase 2: Write + implement `normalizeMercadonaQuery`
3. Phase 3: Write + implement `MercadonaService`; update `InsightsService`; update frontend
4. **VALIDATE**: `GET /api/insights/price-comparison?normalizedName=leche` returns live Mercadona price in ≤ 3 seconds
5. **VALIDATE**: UI renders Mercadona section with product name, price, and delta

### Incremental Delivery

1. Phases 1–3: Live price → deploy/demo (MVP)
2. Phase 4: Graceful fallback → robust production behavior
3. Phase 5: Freshness visibility → trust indicator for users
4. Phase 6: Full E2E coverage

---

## Notes

- TDD is mandatory (Constitution I): each `*.service.spec.ts` task must be committed with failing tests BEFORE the corresponding `*.service.ts` implementation task begins
- `normalizeMercadonaQuery` reuses `normalizePriceComparisonName` from `back/src/modules/insights/price-comparison-normalizer.ts` — do not duplicate it
- `MercadonaService` follows the exact same class-level `Map` cache pattern as `ThemealdbService` in `back/src/integrations/themealdb/themealdb.service.ts`
- All existing `PriceComparisonResponse` fields must remain in the response with identical shapes (additive-only change per research.md Decision 5)
- No Prisma changes required
- No `AppModule` change required — `MercadonaModule` is imported via `InsightsModule`

---

## Phase 7: Convergence

- [x] T020 Update `specs/003-mercadona-price-comparison/plan.md` "Mercadona API Behaviour" section to document the Algolia-based search backend (POST to `redacted_algolia_app_id-dsn.algolia.net`, `hits[0].price_instructions.reference_price` / `reference_format`, credentials sourced from Mercadona's public JS bundle) replacing the stale `tienda.mercadona.es/api/search/` entry per plan: Mercadona API Behaviour (unrequested)
- [x] T021 Add backend E2E timeout-fallback test to `back/test/insights.e2e-spec.ts` — use `jest.spyOn(mercadonaService, "searchProduct").mockRejectedValue(new Error("timeout"))` and verify the endpoint still returns 200 with `mercadona.found: false` and correct fallback state per plan: Phase 3 E2E scope (partial)

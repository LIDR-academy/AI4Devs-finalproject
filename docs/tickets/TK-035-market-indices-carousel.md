# Task: TK-035 · feature:dashboard — Market Indices Carousel

## Description

Add a new Dashboard section with a horizontal carousel of cards showing the current status of the main global market indices.

Indices:
- **Nasdaq Composite** — `^IXIC`
- **EURO STOXX 50** — `^STOXX50E`
- **IBEX 35** — `^IBEX`
- **DAX** — `^GDAXI`
- **Nikkei 225** — `^N225`
- **FTSE 100** — `^FTSE`

Each card shows only: index name, signed percentage change in green/red, current points, and absolute points gained/lost. The selected `AppSettings.defaultMarket` determines which card appears first on the left; the remaining cards keep a stable default order.

The data source must remain the existing Yahoo Finance integration in `:component:market`, using `query1.finance.yahoo.com/v8/finance/chart/{ticker}`. This endpoint was verified with the six Yahoo index symbols above and returned HTTP 200 when called with the same User-Agent requirement already documented in ADR-007.

The indices carousel must not delay the initial Dashboard response: portfolio summary, watchlist, and main Dashboard content must render independently while index data loads in the background.

**ADRs:** ADR-005, ADR-007, ADR-010
**Depends on:** TK-015, TK-018, TK-029
**Blocks:** —
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-035-market-indices-carousel` — `skill: manage-git-flow`

### Phase 2: Market index domain
- [ ] **Add market index catalog/model in `:component:market`**
  - Define the six supported indices with display name, Yahoo ticker, and market key (`US`, `EU`, `ES`, `DE`, `JP`, `UK`)
  - Add a domain model for index cards, e.g. `MarketIndexQuote(name, ticker, marketKey, points, changePoints, changePercent, lastUpdated)`
  - Keep Yahoo DTOs internal; map from existing `StockQuote` fields only
  - **Commit:** `DVX-TK-035 Add market index domain model and catalog`

- [ ] **Add `GetMajorMarketIndicesUseCase`**
  - Fetch all six symbols through existing `MarketRepository.getMultipleQuotes`
  - Reuse the current Yahoo `v8/finance/chart/{ticker}` path; do not introduce `v7/quote`
  - Sort selected `defaultMarket` first, then keep the default global order
  - Return partial success if Yahoo fails for one symbol; surface an error only when all symbols fail
  - Unit tests: selected market ordering, partial failure handling, all-failed error, and mapping from quote change fields
  - **Verify:** `./gradlew :component:market:jvmTest`
  - **Commit:** `DVX-TK-035 Add major market indices use case`

### Phase 3: Dashboard MVI
- [ ] **Extend `DashboardContract` and `DashboardViewModel`**
  - State: `marketIndices`, `marketIndicesLoading`, `marketIndicesError`
  - Inject `GetMajorMarketIndicesUseCase`
  - Observe `AppSettings.defaultMarket` and reload/reorder indices when it changes
  - Start index loading in an independent coroutine so it is not part of Dashboard `isLoading`
  - Refresh indices on `Refresh` and network reconnection without blocking portfolio refresh
  - **Verify:** `./gradlew :feature:dashboard:jvmTest`
  - **Commit:** `DVX-TK-035 Wire market indices into Dashboard MVI`

### Phase 4: Dashboard UI
- [ ] **Add the market indices carousel section to `DashboardScreen`**
  - Place the section after the main summary cards and before portfolio/watchlist lists
  - Use a horizontal `LazyRow` with stable keys by Yahoo ticker
  - Card fields: name, signed percent, points, signed point delta
  - Use `MaterialTheme.extendedColors.profit` for positive changes and `MaterialTheme.colorScheme.error` for negative changes
  - Use theme spacing constants only; do not hardcode dimensions
  - Add all UI copy to `common/ui-resources/src/commonMain/composeResources/values/strings.xml`
  - Preserve the existing delayed-prices disclaimer required by ADR-007
  - **Commit:** `DVX-TK-035 Add market indices carousel UI`

### Phase 5: Performance & resilience
- [ ] **Ensure indices never slow Dashboard first render**
  - Do not combine index loading into the main portfolio/watchlist flow
  - Show skeleton cards or a lightweight section-level loading state while indices load
  - Use existing quote cache TTL and request semaphore from `MarketRepositoryImpl`
  - If Yahoo rate-limits or times out, show a non-blocking section error and keep the rest of Dashboard usable
  - **Commit:** `DVX-TK-035 Make index loading non-blocking`

### Phase 6: Testing & Quality
- [ ] **Coverage**
  - Unit tests for use case ordering and Dashboard state updates
  - UI-level test or preview coverage for positive, negative, loading, and error card states
  - Regression check that Dashboard `isLoading` becomes false without waiting for indices
- [ ] **Run quality gates**
  - `./gradlew :component:market:jvmTest :feature:dashboard:jvmTest :feature:dashboard:detekt :composeApp:assembleDebug`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 9 **Completed:** 0 **Remaining:** 9

---

## Notes
- Yahoo symbols verified on 2026-05-19 with `User-Agent: Mozilla/5.0 Dividox`: `^IXIC`, `^STOXX50E`, `^IBEX`, `^GDAXI`, `^N225`, `^FTSE`.
- Yahoo chart metadata may omit a raw percent-change field for indices; use the existing `StockQuote.changePercent` value derived from `chartPreviousClose`.
- `AppSettings.defaultMarket` already exists and defaults to `ALL`; if it remains `ALL`, keep the default order with Nasdaq first.
- This is read-only market data; no Firestore schema or user portfolio data changes are required.

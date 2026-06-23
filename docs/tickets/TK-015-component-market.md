# Task: TK-015 · component:market — Scaffold + Ktor + Domain + Data

## Description

Scaffold `:component:market`, add Ktor dependencies and configure `YahooFinanceClient`, define market domain models and `MarketRepository`, implement all use cases with TDD, then build the Yahoo Finance data layer with in-memory cache and register the Koin module.

**ADRs:** ADR-005, ADR-007
**Depends on:** TK-013
**Blocks:** TK-017
**Status:** In Progress

---

## Subtasks

### Phase 1: Architecture & Setup
- [x] **Create Git Branch** `feature/DVX-TK-015-component-market` — `skill: manage-git-flow`

### Phase 2: Scaffold + Ktor Setup
- [x] **Scaffold `:component:market`**
  - `component/market/build.gradle.kts` — `dividox.kmp.library` + `dividox.kmp.test`
  - `include(":component:market")` in `settings.gradle.kts`
  - **Commit:** `DVX-TK-015 Scaffold component:market module`

- [x] **Add Ktor dependencies** via `:common:network` module
  - `ktor-client-core`, `ktor-client-content-negotiation`, `ktor-serialization-kotlinx-json`
  - Engines: `ktor-client-okhttp` (Android/JVM), `ktor-client-darwin` (iOS)
  - **Commit:** `DVX-TK-015 Add common:network module with HttpClientFactory`

- [x] **Configure `YahooFinanceApi`**
  - `ContentNegotiation` (kotlinx.serialization), `HttpTimeout` 10s, `User-Agent` header
  - Location: `component/market/src/commonMain/.../data/api/YahooFinanceApi.kt`
  - **Note:** Uses `v8/finance/chart` exclusively — `v7/quote` (paid) and `v10/quoteSummary` (crumb required) were curl-verified as inaccessible and dropped
  - **Commit:** `DVX-TK-015 Move market Koin module to app, use HttpClientFactory from common:network`

### Phase 3: Domain Layer (TDD)
- [x] **Domain models:** `StockQuote(ticker, price, change, changePercent, currency, lastUpdated)`, `DividendInfo(ticker, yield, annualPayout, payoutRatio, fiveYearGrowth, exDividendDate)`, `CompanyInfo(ticker, name, exchange, logoUrl)`, `ChartPeriod` enum (`ONE_DAY, ONE_WEEK, ONE_MONTH, YTD, ONE_YEAR, ALL`), `PricePoint(timestamp: Instant, close: Double)`, `MarketError` sealed class
- [x] **`MarketRepository` interface:** `getStockQuote`, `getMultipleQuotes`, `getDividendInfo`, `getCompanyInfo`, `getDividendHistory`, `getPriceHistory(ticker, period): Flow<List<PricePoint>>`, `searchSecurities`
- [x] **Use cases + tests:** `GetStockQuoteUseCase`, `GetMultipleQuotesUseCase`, `GetDividendInfoUseCase`, `GetCompanyInfoUseCase`, `GetDividendHistoryUseCase`, `GetPriceHistoryUseCase`, `SearchSecuritiesUseCase`
  - **Verify:** `./gradlew :component:market:jvmTest` — 32 tests passing

### Phase 4: Data Layer
- [x] **Internal DTOs** (`ChartResponseDto` with `events.dividends` map, `SearchResponseDto`) — all `@Serializable internal`
- [x] **`YahooFinanceApi`** — `getChart`, `getChartWithEvents` (delivers dividend events + longName/exchangeName), `search`
- [x] **`MarketRepositoryImpl`** — in-memory cache (quotes 60s TTL, dividend/company 1h TTL), parallel `async` for `getMultipleQuotes`, tested with `ktor-client-mock`
- [x] **`MarketDiModule.kt`** in `composeApp/di/` + wired into `KoinInitializer`

### Phase 5: Testing & Quality
- [x] 32 tests passing: use case tests (`FakeMarketRepository`) + `MarketRepositoryImplTest` (`MockEngine`)
- [x] `./gradlew detekt` — clean
- [ ] Commit refactoring changes + Create Pull Request

---

## Progress Tracking
**Total Tasks:** 7 **Completed:** 6 **Remaining:** 1 (PR)

---

## Notes
- All DTOs are `internal` — domain models never expose Yahoo Finance field names
- "Prices delayed 15 minutes" disclaimer is a UI requirement on every market-data screen (ADR-007)
- `SearchSecuritiesUseCase` is included here for reuse by Portfolio and Search features
- `v8/finance/chart` with `events=dividends` is the only reliable public endpoint — delivers StockQuote, CompanyInfo (longName, exchangeName), and DividendInfo (dividend events map)
- `MarketRepositoryImpl` is public (takes `HttpClient`) so Koin in `:composeApp` can wire it without accessing internal `YahooFinanceApi`

# Task: TK-017 · integration:security — Scaffold + Enriched Models + Use Cases

## Description

Scaffold `:integration:security`, define `SecurityHolding`, `PortfolioSummary`, `EnrichedWatchlistEntry`, and `SecurityDetail` enriched models, implement the integration use cases that combine portfolio + market + watchlist data, and register the Koin module.

**User Stories:** DVX-US-005 · DVX-US-007 · DVX-US-020
**ADRs:** ADR-006
**Depends on:** TK-014, TK-015, TK-016
**Blocks:** TK-018
**Status:** Done

---

## Subtasks

### Phase 1: Architecture & Setup
- [x] **Create Git Branch** `feature/DVX-TK-017-integration-security` (off `feature/DVX-TK-016-component-watchlist`)

### Phase 2: Scaffold
- [x] **Scaffold `:integration:security`**
  - `integration/security/build.gradle.kts` — `dividox.kmp.library` + `dividox.kmp.test`
  - `include(":integration:security")` in `settings.gradle.kts`

### Phase 3: Enriched Models + Use Cases (TDD)
- [x] **Models:**
  - `SecurityHolding` — `Holding` + `StockQuote` + `DividendInfo?` + `totalGainPercent: Double`
  - `PortfolioSummary` — `totalValue, totalGain, totalGainPercent, totalYield, dividendsCollected`
  - `EnrichedWatchlistEntry` — `WatchlistEntry` + `StockQuote?` + `CompanyInfo?` + `isInPortfolio: Boolean`
  - `SecurityDetail` — `ticker, quote, dividendInfo, companyInfo, priceHistory, isInPortfolio, isInWatchlist, holdingId?`

- [x] **Use cases + tests (27 unit tests, all passing):**
  - `GetPortfolioWithQuotesUseCase` — `Flow<List<SecurityHolding>>`
  - `GetPortfolioSummaryUseCase` — `Flow<PortfolioSummary>`
  - `GetEnrichedWatchlistUseCase` — `Flow<List<EnrichedWatchlistEntry>>`
  - `GetSecurityDetailUseCase` — `Flow<SecurityDetail>`
  - `GetSecurityHoldingUseCase` — `Flow<SecurityHolding?>`

- [x] **`SecurityIntegrationModule.kt`** + added to `KoinInitializer.kt`

### Phase 4: Testing & Quality
- [x] `./gradlew :integration:security:jvmTest` — 27 tests, 0 failures
- [x] `./gradlew detekt` — clean
- [x] PR ready — `feature/DVX-TK-017-integration-security`

---

## Progress Tracking
**Total Tasks:** 6 **Completed:** 6 **Remaining:** 0

---

## Notes
- `:integration:security` makes zero Firestore/Ktor calls — orchestrates component use cases only
- `totalGainPercent = (currentValue - costBasis) / costBasis * 100`
- `holdingId` in `SecurityDetail` is non-null only when `isInPortfolio = true`
- Branch is off `feature/DVX-TK-016-component-watchlist` — rebase onto main once TK-016 merges

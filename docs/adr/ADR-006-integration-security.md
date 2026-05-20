# ADR-006: :integration:security — Combining Portfolio and Market Data

## Status
Accepted

## Context
`:component:portfolio` holds static holding data (ticker, shares, purchase price).
`:component:market` holds live data (current price, dividend info).

Features like Dashboard or Portfolio detail need both combined — e.g., showing current value, total gain/loss, dividend yield on owned stocks. Neither component can import the other (architecture rule: components are isolated).

## Decision
Create **`:integration:security`** as the orchestration layer that combines portfolio + market data into enriched domain models.

```
:integration:security
├── depends on :component:portfolio
├── depends on :component:market
└── src/commonMain/kotlin/com/akole/dividox/integration/security/
    ├── domain/
    │   ├── model/
    │   │   ├── SecurityHolding.kt    # Holding + live quote + dividend info
    │   │   └── PortfolioSummary.kt   # total invested, current value, total gain, total yield
    │   └── usecase/
    │       ├── GetSecurityHoldingUseCase.kt       # single ticker: portfolio + market merged
    │       ├── GetPortfolioWithQuotesUseCase.kt   # all holdings enriched with live prices
    │       └── GetPortfolioSummaryUseCase.kt      # aggregated totals
    └── di/
        └── SecurityIntegrationModule.kt
```

### SecurityHolding model
```kotlin
data class SecurityHolding(
    val holding: Holding,          // from :component:portfolio
    val quote: StockQuote,         // from :component:market
    val dividendInfo: DividendInfo // from :component:market
) {
    val currentValue: Double get() = holding.shares * quote.currentPrice
    val totalGain: Double get() = currentValue - (holding.shares * holding.purchasePrice)
    val totalGainPercent: Double get() = (totalGain / (holding.shares * holding.purchasePrice)) * 100
    val annualDividendIncome: Double get() = holding.shares * dividendInfo.annualAmount
}
```

### GetPortfolioWithQuotesUseCase
```kotlin
class GetPortfolioWithQuotesUseCase(
    private val getPortfolio: GetPortfolioUseCase,
    private val getMultipleQuotes: GetMultipleQuotesUseCase,
    private val getDividendInfo: GetDividendInfoUseCase
) {
    suspend operator fun invoke(): Flow<List<SecurityHolding>> =
        getPortfolio().map { holdings ->
            val tickers = holdings.map { it.tickerId }
            val quotes = getMultipleQuotes(tickers)
            val dividends = tickers.map { getDividendInfo(it) }
            holdings.mapIndexed { i, h -> SecurityHolding(h, quotes[i], dividends[i]) }
        }
}
```

## Consequences
- **Positive**: Portfolio and market components stay isolated; enriched models only exist where needed; feature modules get a single use case to call
- **Negative**: Extra module layer; caching strategy must be considered (market data is live, holding data is static — different TTLs)
- **Caching note**: `GetMultipleQuotesUseCase` should batch requests to avoid N+1 API calls

## :integration:dividend

The Dividend Activity screen (PRD-04) requires combining dividend payment history with portfolio holdings and upcoming market events. Create **`:integration:dividend`** as the orchestration layer:

```
:integration:dividend
├── depends on :component:dividend
├── depends on :component:portfolio
├── depends on :component:market
└── src/commonMain/kotlin/com/akole/dividox/integration/dividend/
    ├── domain/
    │   ├── model/
    │   │   ├── DividendActivitySummary.kt  # lifetime, YTD, YoY, nextPayout, YoC
    │   │   └── EnrichedPayment.kt          # DividendPayment + CompanyInfo + logo
    │   └── usecase/
    │       ├── GetDividendActivitySummaryUseCase.kt
    │       ├── GetEnrichedUpcomingPaymentsUseCase.kt
    │       └── GetEnrichedPaymentHistoryUseCase.kt
    └── di/
        └── DividendIntegrationModule.kt
```

## Feature dependencies
```
:feature:dashboard   → :integration:security + :component:watchlist
:feature:portfolio   → :integration:security
:feature:dividends   → :integration:dividend
:feature:analysis    → :integration:security + :component:watchlist
:feature:favorites   → :component:watchlist (no market data needed for list)
:feature:search      → :component:market + :component:watchlist
:feature:settings    → :component:settings
:feature:auth        → :component:auth
```

## Related
- [ADR-005](ADR-005-component-architecture-portfolio-data.md): Component architecture
- [ADR-007](ADR-007-yahoo-finance-market-data.md): Yahoo Finance API

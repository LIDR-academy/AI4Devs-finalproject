# ADR-007: Yahoo Finance as Market Data Provider

## Status
Accepted

## Context
`:component:market` needs a source for live stock prices, dividend information, and company data. We need to choose a provider that works across all KMP targets (Android, iOS, Desktop JVM) via HTTP.

## Decision
Use **Yahoo Finance** (unofficial API) as the primary market data source, accessed via **Ktor Client** in `commonMain`.

Yahoo Finance is chosen for the MVP because:
1. No API key required for basic usage
2. Covers global exchanges (NYSE, NASDAQ, BME, LSE, etc.)
3. Rich dividend data (yield, ex-date, pay date, history)
4. Ktor client works on all KMP targets natively

### Key endpoints
| Data | Endpoint |
|------|----------|
| Quote (price, change) | `query1.finance.yahoo.com/v8/finance/chart/{ticker}` |
| Dividend + company info | `query2.finance.yahoo.com/v10/finance/quoteSummary/{ticker}?modules=summaryDetail,assetProfile` |
| Dividend history | `query2.finance.yahoo.com/v8/finance/chart/{ticker}?events=dividends&range=5y` |
| Multiple quotes (batch) | `query1.finance.yahoo.com/v7/finance/quote?symbols={t1,t2,...}` |

### Ktor setup (commonMain)
```kotlin
// component/market/src/commonMain/
val httpClient = HttpClient {
    install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
    install(HttpTimeout) { requestTimeoutMillis = 10_000 }
    defaultRequest {
        url("https://query1.finance.yahoo.com")
        header("User-Agent", "Mozilla/5.0")  // required to avoid 429
    }
}
```

## Alternatives Considered

### Alpha Vantage
- **Pros**: Official API, reliable, dividend endpoint
- **Cons**: 25 req/day on free tier — insufficient for a portfolio app

### Financial Modeling Prep
- **Pros**: Official, rich dividend data
- **Cons**: Free tier limited; paid plan required for real-time quotes

### Polygon.io
- **Pros**: Professional grade, WebSocket support
- **Cons**: US markets only on free tier; dividends behind paywall

### Custom proxy backend
- **Pros**: Full control, rate limit management, caching
- **Cons**: Infrastructure cost; out of MVP scope

## Consequences
- **Positive**: Zero cost, no API key to manage, rich data coverage
- **Negative**: Unofficial API — Yahoo can change endpoints without notice; no SLA; rate limiting possible
- **Mitigation**: Abstract behind `MarketDataSource` interface — swapping provider requires only a new `actual` or `MarketDataSourceImpl`, not domain changes
- **Production note**: Evaluate migration to an official provider (FMP, Polygon) post-MVP if reliability is an issue
- **UI requirement**: All screens displaying market data must show a "Prices are delayed by 15 minutes" disclaimer (PRD-05, PRD-06, PRD-07). This is a non-negotiable UX requirement given the unofficial API's data latency.

## Implementation Notes
- All DTOs are internal to `:component:market` — never exposed to domain layer
- Domain models (`StockQuote`, `DividendInfo`) are mapped from DTOs in `MarketRepositoryImpl`
- Response caching: in-memory cache with 60s TTL for quotes; 1h TTL for dividend info
- Error handling: `Result<T>` — network errors mapped to `MarketError` sealed class

## Related
- [ADR-005](ADR-005-component-architecture-portfolio-data.md): Component architecture
- [ADR-006](ADR-006-integration-security.md): :integration:security

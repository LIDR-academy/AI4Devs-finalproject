# ADR-005: Component Architecture for Portfolio Data

## Status
Accepted

## Context
DiviDox needs to manage several bounded contexts around the user's investment portfolio. Following the multi-module architecture defined in the project (`:component` for domain+data, `:feature` for screens), we need to decide how to split the data concerns.

## Decision
Create four independent `:component` modules, each owning a single bounded context:

### `:component:portfolio`
Static data about the user's holdings, persisted in Firestore.

```
domain/model/
    Holding.kt         # tickerId, shares, purchasePrice, purchaseCurrency, purchaseDate
    HoldingId.kt       # value class wrapping String
domain/repository/
    PortfolioRepository.kt
domain/usecase/
    GetPortfolioUseCase.kt
    AddHoldingUseCase.kt
    RemoveHoldingUseCase.kt
    UpdateHoldingUseCase.kt
data/
    datasource/PortfolioDataSource.kt   # Firestore
    repository/PortfolioRepositoryImpl.kt
```

> No live prices, no market data. Pure static user input.

---

### `:component:watchlist`
User's list of followed tickers (not necessarily owned), persisted in Firestore.

```
domain/model/
    WatchlistEntry.kt   # tickerId, addedAt
domain/repository/
    WatchlistRepository.kt
domain/usecase/
    GetWatchlistUseCase.kt
    AddToWatchlistUseCase.kt
    RemoveFromWatchlistUseCase.kt
    IsInWatchlistUseCase.kt
data/
    datasource/WatchlistDataSource.kt   # Firestore
    repository/WatchlistRepositoryImpl.kt
```

---

### `:component:market`
Live market data from Yahoo Finance (prices, dividends, company info). No persistence — data always fetched from the API.

```
domain/model/
    StockQuote.kt          # tickerId, currentPrice, currency, change, changePercent
    DividendInfo.kt        # yield, frequency, nextExDate, nextPayDate, annualAmount
    CompanyInfo.kt         # name, sector, exchange, logoUrl, description
domain/repository/
    MarketRepository.kt
domain/usecase/
    GetStockQuoteUseCase.kt
    GetMultipleQuotesUseCase.kt   # batch fetch for entire portfolio
    GetDividendInfoUseCase.kt
    GetCompanyInfoUseCase.kt
    GetDividendHistoryUseCase.kt
data/
    datasource/MarketDataSource.kt         # Ktor HTTP client
    repository/MarketRepositoryImpl.kt
    api/YahooFinanceApi.kt
```

---

### `:component:settings`
User preferences. Stored locally in **DataStore** (Preferences DataStore, KMP-compatible via `androidx.datastore:datastore-preferences-core`) for instant local reads, with optional Firestore sync for cross-device consistency.

```
domain/model/
    UserSettings.kt   # baseCurrency, biometricEnabled, notificationsEnabled
domain/repository/
    SettingsRepository.kt
domain/usecase/
    GetSettingsUseCase.kt
    UpdateCurrencyUseCase.kt
    UpdateBiometricLockUseCase.kt
    UpdateNotificationsUseCase.kt
data/
    datasource/local/SettingsLocalDataSource.kt   # DataStore<Preferences>
    datasource/remote/SettingsRemoteDataSource.kt # Firestore (optional sync)
    repository/SettingsRepositoryImpl.kt
```

> **DataStore vs Firestore for settings**: DataStore is the primary read path — it's local, fast, and survives offline. Firestore sync is a secondary write that propagates settings to other devices. The repository merges both sources; DataStore always wins for reads.

---

### `:component:dividend`
User's received dividend payment history, persisted in Firestore and cached locally in **Room**.

```
domain/model/
    DividendPayment.kt  # tickerId, amount, currency, paymentDate, method (CASH | REINVESTED)
    DividendPaymentId.kt
domain/repository/
    DividendRepository.kt
domain/usecase/
    GetDividendHistoryUseCase.kt        # paginated, grouped by month
    GetLifetimeDividendsUseCase.kt
    GetYtdDividendsUseCase.kt
    GetUpcomingPaymentsUseCase.kt       # from :component:market ex-div dates + holdings
    AddDividendPaymentUseCase.kt        # manual entry or auto-recorded
data/
    datasource/local/DividendLocalDataSource.kt    # Room DAO
    datasource/remote/DividendRemoteDataSource.kt  # Firestore
    repository/DividendRepositoryImpl.kt
    db/DividendDatabase.kt                         # Room DB definition
```

> Dividend payment history is user-specific data that must survive offline. Room is used as the local cache; Firestore is the source of truth for cross-device sync.

## Dependency Rules
```
:component:portfolio  → :common/* only
:component:watchlist  → :common/* only
:component:market     → :common/* only
:component:settings   → :common/* only
:component:dividend   → :common/* only
```

No component imports another component — cross-component combinations go in `:integration`.

## Consequences
- **Positive**: Each component is independently testable; teams can work in parallel; clear ownership per bounded context
- **Negative**: Firestore reads from portfolio, watchlist, and settings are separate — no single query; handled by `:integration` layer
- **Rule**: `portfolio` never holds current price. `market` never holds user-specific data.

## Related
- [ADR-006](ADR-006-integration-security.md): `:integration:security` — combining portfolio + market
- [ADR-007](ADR-007-yahoo-finance-market-data.md): Yahoo Finance as market data provider
- [ADR-012](ADR-012-local-persistence-room-datastore.md): Room and DataStore usage strategy

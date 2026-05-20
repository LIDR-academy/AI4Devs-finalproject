# ADR-012: Local Persistence Strategy — Room and DataStore

**Date:** 2026-04-12
**Status:** Accepted

## Context

The app needs two kinds of local persistence:

1. **Structured relational data** — dividend payment history needs to be cached locally for offline access and fast queries (group by month, sum by year).
2. **Key-value preferences** — user settings (currency, biometric lock, notifications) need to be read synchronously on app start and updated reactively.

The project is KMP (Android, iOS, Desktop JVM). The persistence solution must work across all three platforms from `commonMain`.

## Decision

Use two separate KMP-compatible libraries, each for its appropriate use case:

---

### Room (for structured / relational data)

**Library**: `androidx.room:room-runtime` + `androidx.room:room-compiler` (KMP-compatible since Room 2.7)

**When to use Room:**
- Data that benefits from SQL queries (GROUP BY, ORDER BY, JOIN, SUM).
- Data that is synced from a remote source and needs a local cache with TTL.
- Entities with relationships (e.g., a dividend payment belonging to a holding).

**Current usage**: `:component:dividend` — `DividendPayment` entities, grouped/queried by month for Dividend Activity screen.

**Not used for**: user settings, authentication tokens, or any simple key-value data.

```kotlin
// :component:dividend — data/db/
@Database(entities = [DividendPaymentEntity::class], version = 1)
abstract class DividendDatabase : RoomDatabase() {
    abstract fun dividendDao(): DividendDao
}

@Dao
interface DividendDao {
    @Query("SELECT * FROM dividend_payments ORDER BY payment_date DESC")
    fun observeAll(): Flow<List<DividendPaymentEntity>>

    @Query("SELECT SUM(amount) FROM dividend_payments WHERE strftime('%Y', payment_date) = :year")
    suspend fun sumByYear(year: String): Double

    @Upsert
    suspend fun upsert(payments: List<DividendPaymentEntity>)

    @Query("DELETE FROM dividend_payments")
    suspend fun clearAll()
}
```

Room database instances are created via a **platform-specific builder** (expect/actual) and provided as singletons through Koin.

---

### DataStore (for key-value preferences)

**Library**: `androidx.datastore:datastore-preferences-core` (KMP-compatible)

**When to use DataStore:**
- Simple key-value pairs that don't need SQL queries.
- User preferences that must be reactive (`Flow<Preferences>`).
- Non-sensitive data (for sensitive data, use `SessionStorage` — see ADR-008).

**Current usage**: `:component:settings` — `UserSettings` (baseCurrency, biometricEnabled, notificationsEnabled).

**Not used for**: auth tokens (ADR-008), structured data with relationships (use Room).

```kotlin
// :component:settings — data/datasource/local/
object SettingsKeys {
    val BASE_CURRENCY = stringPreferencesKey("base_currency")
    val BIOMETRIC_ENABLED = booleanPreferencesKey("biometric_enabled")
    val NOTIFICATIONS_ENABLED = booleanPreferencesKey("notifications_enabled")
}

class SettingsLocalDataSource(private val dataStore: DataStore<Preferences>) {

    val settings: Flow<UserSettings> = dataStore.data.map { prefs ->
        UserSettings(
            baseCurrency = prefs[SettingsKeys.BASE_CURRENCY] ?: "USD",
            biometricEnabled = prefs[SettingsKeys.BIOMETRIC_ENABLED] ?: true,
            notificationsEnabled = prefs[SettingsKeys.NOTIFICATIONS_ENABLED] ?: true,
        )
    }

    suspend fun updateCurrency(currency: String) {
        dataStore.edit { it[SettingsKeys.BASE_CURRENCY] = currency }
    }

    suspend fun updateBiometricEnabled(enabled: Boolean) {
        dataStore.edit { it[SettingsKeys.BIOMETRIC_ENABLED] = enabled }
    }
}
```

DataStore instances are created via a **platform-specific path** (expect/actual for the file path) and provided as singletons through Koin.

---

## Decision Matrix

| Need | Solution | Reason |
|---|---|---|
| Auth tokens / session | `SessionStorage` (ADR-008) | Requires encryption; Firebase SDK on mobile |
| User preferences (currency, biometric) | `DataStore<Preferences>` | Reactive key-value; non-sensitive |
| Dividend payment history (cache) | `Room` | Needs GROUP BY month, SUM queries |
| Portfolio holdings (cache) | `Room` (future) | Potential offline support; currently Firestore only |
| Market data (prices, quotes) | In-memory cache only (60s TTL) | Always fresh from API; no offline requirement |
| Watchlist entries | `Room` (future) + Firestore | Currently Firestore; offline cache in future |

---

## Alternatives Considered

### SQLDelight (instead of Room)
- **Pros**: True KMP-first, mature, generates type-safe Kotlin from SQL.
- **Cons**: Requires writing raw SQL; no annotation-based query generation; steeper learning curve for Android-first developers; tooling (Android Studio) is less integrated than Room.

### russhwolf/multiplatform-settings (instead of DataStore)
- **Pros**: Simple API, pure KMP, no coroutines required.
- **Cons**: Backed by `SharedPreferences` on Android (not `DataStore`); no built-in `Flow` support; migration path to DataStore is non-trivial.

### Firestore as only persistence (no local cache)
- **Pros**: No local DB complexity; always in sync.
- **Cons**: No offline support; slow first read; Firestore costs scale with reads; unacceptable for a frequently-read dividend history.

## Consequences
- **Positive**: Clear, non-overlapping responsibilities between Room and DataStore; both are KMP-compatible and coroutine-native; no platform-specific persistence code leaks into feature modules
- **Negative**: Two persistence libraries to configure and maintain; Room requires expect/actual for database builder on each platform; DataStore requires expect/actual for file path
- **Rule**: Never use Room for preferences; never use DataStore for relational data. Violations must be flagged in code review.

## Related
- [ADR-005](ADR-005-component-architecture-portfolio-data.md): `:component:dividend` and `:component:settings` use these libraries
- [ADR-008](ADR-008-token-storage-contract.md): Auth token storage — explicitly NOT DataStore or Room

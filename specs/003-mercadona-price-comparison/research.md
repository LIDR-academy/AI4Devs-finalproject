# Research: Mercadona Live Price Comparison

## Decision 1: HTTP client for Mercadona API

**Decision**: Use Node 20 native `fetch()` with `AbortController` for the 3-second timeout.

**Rationale**: TheMealDB integration (`back/src/integrations/themealdb/themealdb.service.ts`) uses the same approach — no NestJS `HttpModule` or `axios` dependency. Native `fetch` is fully supported on Node ≥ 20 (the project's minimum runtime per constitution). Adding `HttpModule` would introduce an unnecessary dependency and diverge from the established pattern.

**Alternatives considered**:
- `@nestjs/axios` + `HttpModule`: rejected — adds a new dependency and contradicts VII (Pattern Scan).
- `axios` directly: rejected — same reason; native fetch is already in use.

---

## Decision 2: Caching strategy

**Decision**: In-process `Map<string, CacheEntry<T>>` with 24-hour TTL, identical to the TheMealDB caching approach (which uses a 1-hour TTL). Cache key: `` `mercadona:${normalizedName}` ``. Cache entry stores `{ data, fetchedAt, expiresAt, source: "MERCADONA_LIVE" }`.

**Rationale**: Consistent with the established integration pattern. No external cache service is needed. The 24-hour TTL matches the spec (FR-002). Cache survives for the lifetime of the server process, which is acceptable per the spec's stated assumption.

**Alternatives considered**:
- NestJS `CacheModule` (in-memory): rejected — adds indirection without benefit for a single integration; TheMealDB shows the simpler Map approach is sufficient.
- Database cache (`MercadonaProductCache` Prisma table): rejected for this iteration per spec assumption; deferred to a follow-up if post-restart cache miss rate is unacceptable.
- Redis: rejected — not in the current stack and out of scope.

---

## Decision 3: Cache source tracking

**Decision**: The cache entry stores `fetchedAt: Date`. When data is served from cache, the service returns `source: "MERCADONA_CACHED"`. When data is freshly fetched, it returns `source: "MERCADONA_LIVE"`. Both paths include `lastUpdatedAt: fetchedAt.toISOString()`.

**Rationale**: The spec (FR-009) requires indicating whether the price is live or cached. Storing `fetchedAt` in the cache entry enables accurate `lastUpdatedAt` reporting even for cached responses.

---

## Decision 4: Mercadona name normalization

**Decision**: Create `back/src/integrations/mercadona/normalize.ts` with a `normalizeMercadonaQuery(input: string): string | null` function. It:
1. Calls the existing `normalizePriceComparisonName` for lowercase + accent removal.
2. Strips common Spanish-grocery quantity suffixes: `\b\d+\s*(g|kg|ml|l|cl|dl|oz|lb|pack|ud|unid)\b` and trailing numeric quantity markers (`x\d+`).
3. Returns `null` if the result is fewer than 3 characters (trigger the skip-lookup rule per FR-011).

**Rationale**: The existing `normalizePriceComparisonName` already handles lowercase and accent normalization. Rather than modifying it (which could affect the static catalog lookup), a new Mercadona-specific wrapper adds the unit-stripping step on top. This avoids breaking the existing normalization that is separately tested.

**Alternatives considered**:
- Modify `normalizePriceComparisonName` to strip units: rejected — it is used for static catalog matching where stripping units could reduce match accuracy.
- Levenshtein distance ranking: deferred — Mercadona's own search API already sorts results by relevance; taking the first result is simpler and sufficient for MVP.

---

## Decision 5: Updated response shape

**Decision**: Extend `PriceComparisonResponse` by adding two new optional top-level fields while keeping all existing fields unchanged:

```typescript
interface PriceComparisonResponse {
  // --- existing fields (unchanged) ---
  normalizedName: string;
  found: boolean;
  reference: PriceComparisonReference | null;
  receiptContext: PriceComparisonReceiptContext;
  unavailableReason: "NO_REFERENCE_DATA" | null;
  // --- new fields ---
  mercadona: MercadonaResult;
  delta: string | null;  // receiptContext.latestUnitPriceEur − mercadona.priceEur
}

interface MercadonaResult {
  found: boolean;
  productName: string | null;
  priceEur: string | null;
  unit: string | null;
  lastUpdatedAt: string | null;
  source: "MERCADONA_LIVE" | "MERCADONA_CACHED" | null;
}
```

The top-level `found` is `true` if EITHER `mercadona.found` OR `reference !== null`.

**Rationale**: Additive extension avoids breaking the existing frontend (which reads `reference.referencePriceEur` etc.) while unblocking the new Mercadona UI. Delta is computed against `receiptContext.latestUnitPriceEur` (the most recent price the user paid, derived from their receipts). This is already available server-side without needing a pantry item ID.

**Alternatives considered**:
- Rename the endpoint to take `pantryItemId` (breaking change): rejected — spec says backwards compatible.
- Return a completely new response shape: rejected — would break the existing frontend without any benefit.

---

## Decision 6: Timeout and fallback

**Decision**: Use `AbortController` with a 3-second timeout (`setTimeout(() => controller.abort(), 3000)`). On abort, network error, or 5xx response, `MercadonaService.searchProduct()` returns `null`; `InsightsService` proceeds with only the static catalog result.

**Rationale**: Direct mapping from spec FR-005. `AbortController` is the idiomatic approach with native fetch for timeouts.

---

## Decision 7: Zero-price filtering

**Decision**: In `MercadonaService`, if the matched product's `unit_price` parses to ≤ 0, treat it as "not found" and return `null`. This prevents corrupt Mercadona data from surfacing as a valid price.

**Rationale**: FR-010 / edge case identified in spec. A zero price from Mercadona is more likely a data quality issue than a real price.

---

## Decision 8: Module wiring

**Decision**: Create `MercadonaModule` that declares and exports `MercadonaService`. `InsightsModule` imports `MercadonaModule`. No direct registration in `AppModule` is needed (NestJS resolves transitive imports).

**Rationale**: Consistent with `ThemealdbModule` / `RecipesModule` pattern. Keeps module boundaries clean.

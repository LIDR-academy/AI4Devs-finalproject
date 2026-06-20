# EXT-008 — Live Price Comparison via Mercadona API

## Metadata
- **Type:** Full-Stack (Backend + Frontend)
- **Priority:** P2
- **Phase:** 2 — Growth
- **PRD Reference:** [P2-004](../../product/5_Extended-Non-MVP-PRD.md#p2-004-live-price-comparison-via-mercadona-integration)
- **Effort:** Medium
- **Depends on:** TKT-006 (price comparison MVP — done)

---

## User Story

As a user, I want to see current Mercadona prices for my pantry items so that I can see whether what I paid was fair and make a better decision next time.

---

## Context

The MVP (TKT-006) implements price comparison against a **static seed dataset** seeded into `PriceCatalogItem`. This is correct for MVP but the data becomes stale immediately.

Mercadona (Spain's largest supermarket by market share) exposes a public, unofficial REST API at `tienda.mercadona.es/api/` — no authentication required, widely used by open-source projects. It supports:
- `GET /api/categories/` — browse the product hierarchy.
- `GET /api/search/?query={term}` — text search by product name.

This ticket replaces the static-only lookup with a live Mercadona query, server-cached for 24 hours. The static catalog remains as a fallback.

**Assessment of other chains:**
- Carrefour, Lidl, Aldi, Dia: no official or reliable unofficial APIs. Web scraping carries ToS and reliability risk and is excluded from this scope.

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| Backend — integration | `back/src/integrations/mercadona/` | New Mercadona API client |
| Backend — module | `back/src/modules/insights/` | Update `comparePrice` to query Mercadona + fallback |
| Backend — app | `back/src/app.module.ts` | Register `MercadonaModule` |
| Prisma schema | `back/prisma/schema.prisma` | No changes |
| Frontend | `front/src/routes/` (price comparison view) | Update to show live data badge + last-updated timestamp |

---

## API Contracts

Existing endpoint (no URL change — backwards compatible):

```
GET /api/pantry/items/compare-price/:pantryItemId
Response 200 (updated shape):
{
  itemName: string
  pricePaidEur: number | null
  mercadona: {
    found: boolean
    productName: string | null
    priceEur: number | null
    unit: string | null
    lastUpdatedAt: string | null    // ISO timestamp of cache entry
    source: "MERCADONA_LIVE" | "MERCADONA_CACHED"
  }
  catalog: {
    found: boolean
    priceEur: number | null
    source: "STATIC_CATALOG"
  }
  delta: number | null    // pricePaid - mercadona.priceEur (positive = user overpaid)
}
```

---

## Data Model Changes

No Prisma changes. Mercadona results are cached in `CacheModule` (in-memory, 24-hour TTL). The existing `PriceCatalogItem` table is kept as a fallback.

If a persistent cache is preferred over in-memory (so cache survives restarts), a simple `MercadonaProductCache` table can be added:

```prisma
// Optional — add only if in-memory TTL is insufficient
model MercadonaProductCache {
  id           String   @id @default(uuid())
  normalizedName String @unique
  mercadonaName  String
  priceEur       Decimal @db.Decimal(8, 2)
  unit           String
  cachedAt       DateTime @default(now())

  @@index([normalizedName])
}
```

Decision: start with in-memory cache; add DB cache in a follow-up if needed.

---

## Mercadona API Technical Notes

Base URL: `https://tienda.mercadona.es/api/`  
No auth required. Recommended request header: `User-Agent: RealSaveFooding/1.0`.

Product search:
```
GET https://tienda.mercadona.es/api/search/?query=leche&lang=es&wh=vlc1
```
Response shape (relevant fields):
```json
{
  "results": {
    "products": [
      {
        "id": "12345",
        "display_name": "Leche entera Hacendado 1L",
        "price_instructions": {
          "unit_price": "0.72",
          "unit_name": "l"
        }
      }
    ]
  }
}
```

Normalization strategy:
- Use the first result with the lowest Levenshtein distance to the pantry item's normalized name.
- Normalize: lowercase, remove accents, strip units/brands from the pantry item name before querying.

---

## Technical Implementation Tasks

Follow TDD: write failing test before implementing each unit.

1. **Mercadona API client** (`back/src/integrations/mercadona/mercadona.service.ts`)
   - `searchProduct(normalizedName: string): Promise<MercadonaProduct | null>`
     - GET `https://tienda.mercadona.es/api/search/?query={encodeURIComponent(normalizedName)}&lang=es&wh=vlc1`
     - Return first result or `null` if empty.
     - Cache result in `CacheModule` with key `mercadona:${normalizedName}`, TTL 24 h.
   - **Name normalization helper** (`back/src/integrations/mercadona/normalize.ts`):
     - Lowercase, NFD normalize (remove accents), remove quantity suffixes (e.g. "500g", "1l", "x6").
     - Example: `"Leche Entera 1L"` → `"leche entera"`.
   - Unit tests:
     - Mock `HttpService`, verify correct URL is called.
     - Verify cache hit skips HTTP call.
     - Verify `null` returned on empty results.
     - Verify normalization: removes accents, units, lowercases.

2. **Update `comparePrice`** (`back/src/modules/insights/insights.service.ts`)
   - Current: looks up `PriceCatalogItem` by normalized name.
   - New flow:
     1. Normalize pantry item name.
     2. Check `MercadonaService.searchProduct(normalizedName)`.
     3. If found → use Mercadona price as primary result.
     4. If not found → fall back to `PriceCatalogItem` static entry.
     5. Compute `delta = pricePaid - mercadona.priceEur` (or null if no price paid or no result).
   - Return the updated response shape (see API Contracts above).
   - Unit tests:
     - Mercadona found: assert `mercadona.found = true`, correct price.
     - Mercadona not found, static fallback: assert `catalog.found = true`.
     - Neither found: assert both `found = false`, `delta = null`.
     - Delta computation: overpaid vs underpaid vs no pricePaid.

3. **MercadonaModule** — register `MercadonaService`, `HttpModule`, `CacheModule`.

4. **Register in AppModule**.

5. **Frontend — update price comparison view**
   - Show `mercadona.productName` and `mercadona.priceEur` when `mercadona.found = true`.
   - Show `mercadona.lastUpdatedAt` as "Last updated: X hours ago" below the price.
   - When `source = "MERCADONA_CACHED"`, show "(cached)" label.
   - Show static catalog entry as secondary reference when both are available.
   - Vitest: update snapshot/assertions for new response shape.

---

## Error Handling

- Mercadona API timeout (>3 s): fall back to static catalog immediately; log a warning.
- Mercadona API returns 5xx: same as timeout — fall back to static catalog.
- Network unavailable: return static catalog result with `mercadona.found = false`.
- Empty query (item name too short after normalization): skip Mercadona call, use static catalog only.

---

## Security

- Mercadona is a public unofficial API. No user data is sent to Mercadona (only normalized product name as query param).
- The endpoint remains JWT-protected.
- Cache key is the normalized product name — no user identity in the cache key (cache is shared across users for the same product name, which is correct and safe).

---

## Testing Requirements

| Test type | Coverage |
|---|---|
| Unit — Mercadona service | HTTP call, cache hit, normalization, null on no result |
| Unit — insights service | live found, static fallback, delta computation, timeout fallback |
| Integration | seed item with pricePaid, call compare-price, verify Mercadona result |
| Vitest — price comparison view | renders live price, shows "Last updated", shows cached label |
| E2E (Playwright) | open price comparison for an item with a common name (e.g. "leche"), verify price displayed |

---

## Acceptance Criteria

1. `GET /api/pantry/items/compare-price/:id` for an item named "leche" returns a Mercadona price within 2 seconds.
2. A second call within 24 hours for the same normalized name does not trigger a Mercadona HTTP request (cache hit verified in unit tests).
3. For items with no Mercadona match, the static catalog entry is shown as fallback.
4. The frontend shows "Last updated: X hours ago" beneath the Mercadona price.
5. A Mercadona API outage does not break the endpoint — it falls back to the static catalog.

---

## Non-Goals

- Carrefour, Lidl, Aldi, or Dia integration (no stable API available).
- Price history tracking over time.
- Price alerts (notify when price drops below threshold) — deferred to future.

---

## Open Questions

1. Should we store Mercadona results in the DB (`MercadonaProductCache` table) so they survive server restarts? (Recommendation: start with in-memory; if cache miss rate is too high after restart, add DB cache in a follow-up.)
2. Mercadona's `wh=vlc1` warehouse parameter targets Valencia. Should we make this configurable per user's postal code? (Recommendation: fix to `vlc1` (Valencia) for now — prices are consistent across Spain for the vast majority of products.)

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope is a contained backend extension + small frontend update
- [x] Dependencies identified (TKT-006 done; Mercadona API is public, no auth)

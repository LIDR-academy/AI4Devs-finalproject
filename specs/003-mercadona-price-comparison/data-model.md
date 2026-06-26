# Data Model: Mercadona Live Price Comparison

## Overview

No Prisma schema changes. All Mercadona price data is held in the in-process application cache (24-hour TTL). The existing `PriceCatalogItem` table is unchanged.

---

## Existing Entities (unchanged)

### PriceCatalogItem (Prisma model, no changes)

Holds static reference prices seeded into the database.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `normalizedName` | String | Lowercased, accent-free product name (the lookup key) |
| `category` | String? | Optional product category |
| `sourceLabel` | String? | Human-readable data source (e.g. "Mercadona catalog 2025-01") |
| `referencePriceEur` | Decimal | Static reference price in Euros |
| `currencyCode` | String | Always "EUR" for this project |
| `effectiveDate` | DateTime | Date when this price entry was valid |
| `createdAt` | DateTime | Row creation timestamp |

---

## In-Memory-Only Entities

### MercadonaCacheEntry (runtime only, never persisted)

Held in a class-level `Map` inside `MercadonaService`. Keyed by `normalizedName`.

| Field | Type | Notes |
|-------|------|-------|
| `productName` | string | Product display name from Mercadona (`display_name`) |
| `priceEur` | string | Unit price in Euros (string representation of Decimal) |
| `unit` | string | Unit type (e.g. "l", "kg", "ud") |
| `fetchedAt` | Date | Timestamp when this entry was fetched from Mercadona |
| `expiresAt` | number | `Date.now() + 24h` — used to detect stale entries |

---

## Response Shapes (not entities, but key data contracts)

### MercadonaResult (embedded in PriceComparisonResponse)

| Field | Type | Notes |
|-------|------|-------|
| `found` | boolean | Whether Mercadona returned a match |
| `productName` | string \| null | Matched product name from Mercadona |
| `priceEur` | string \| null | Price in Euros (string to avoid float rounding) |
| `unit` | string \| null | Unit from Mercadona (e.g. "l", "kg") |
| `lastUpdatedAt` | string \| null | ISO timestamp of `fetchedAt` |
| `source` | `"MERCADONA_LIVE"` \| `"MERCADONA_CACHED"` \| null | Whether result is fresh or from cache |

### Updated PriceComparisonResponse

Extends the existing response by adding `mercadona` and `delta`:

| Field | Type | Notes |
|-------|------|-------|
| `normalizedName` | string | Existing |
| `found` | boolean | Now true if EITHER mercadona OR static catalog found a result |
| `reference` | PriceComparisonReference \| null | Existing (static catalog entry) |
| `receiptContext` | PriceComparisonReceiptContext | Existing (latest receipt price for this item) |
| `unavailableReason` | `"NO_REFERENCE_DATA"` \| null | Existing; null if either source has data |
| `mercadona` | MercadonaResult | **New** — Mercadona live/cached price |
| `delta` | string \| null | **New** — `receiptContext.latestUnitPriceEur − mercadona.priceEur`; null if either is missing |

---

## Entity Relationships

```
PantryItem ──(name)──▶ [normalization] ──▶ MercadonaCacheEntry (in-memory)
                                       └──▶ PriceCatalogItem (DB)

PriceComparisonResponse aggregates:
  - MercadonaCacheEntry (live or cached)
  - PriceCatalogItem (static fallback)
  - ReceiptItem (latest price paid from receipts)
```

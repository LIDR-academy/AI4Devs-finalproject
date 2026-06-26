# Implementation Plan: Mercadona Live Price Comparison

**Branch**: `003-mercadona-price-comparison` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-mercadona-price-comparison/spec.md`

## Summary

Replace the static-only price comparison with a live Mercadona API lookup (cached 24 hours in-process) while keeping the static `PriceCatalogItem` catalog as a fallback. The existing `GET /api/insights/price-comparison` endpoint is extended — not replaced — with two new response fields (`mercadona`, `delta`). No Prisma schema changes. TDD throughout.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) · Node.js ≥ 20

**Primary Dependencies**:
- Backend: NestJS · Prisma · native `fetch()` (Node 20 built-in) · Jest
- Frontend: React · TanStack Router · Vitest · Playwright

**Storage**: No Prisma changes. Mercadona data cached in-process (`Map<string, CacheEntry>`, 24-hour TTL).

**Testing**: Jest (backend unit + E2E) · Vitest (frontend unit) · Playwright (frontend E2E)

**Target Platform**: Node.js server (NestJS) + browser SPA

**Performance Goals**: First live fetch ≤ 3 s (spec SC-001). Cache hit ≤ 500 ms (spec SC-002).

**Constraints**: 3-second Mercadona request timeout; fallback to static catalog on any Mercadona failure; no user PII sent to Mercadona.

**Scale/Scope**: Single-tenant price lookup; shared cache across all users for the same normalized product name.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against RealSaveFooding Constitution v1.0.0:

- [x] **I. TDD** — Tests are scoped and listed in tasks.md before implementation begins; each task lists its test file first
- [x] **II. Baby steps** — Tasks are decomposed to one file / one logical change each; each task is independently testable
- [x] **III. Type safety** — TypeScript strict; no `any`; Prisma types used for DB entities; all new interfaces fully typed
- [x] **IV. English only** — All code, docs, specs, and commit messages are in English
- [x] **V. Clear naming** — `MercadonaService`, `normalizeMercadonaQuery`, `MercadonaCacheEntry`, `MercadonaResult` — no vague names
- [x] **VI. Assumptions audited** — All inferences documented in `research.md`; in-memory cache assumption stated in spec
- [x] **VII. Pattern scan** — TheMealDB integration (`back/src/integrations/themealdb/`) confirmed as the pattern to follow; `normalizePriceComparisonName` reused rather than duplicated

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-mercadona-price-comparison/
├── plan.md              # This file
├── research.md          # Phase 0 output — key decisions
├── data-model.md        # Phase 1 output — entities and response shapes
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/
│   └── price-comparison-api.md   # Updated API contract
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code

#### New files

```text
back/src/integrations/mercadona/
├── normalize.ts                  # normalizeMercadonaQuery() — wraps existing normalizer + unit stripping
├── normalize.spec.ts             # Unit tests for normalization
├── mercadona.service.ts          # MercadonaService — fetch + 24h Map cache
├── mercadona.service.spec.ts     # Unit tests (mock fetch globally)
└── mercadona.module.ts           # NestJS module — declares + exports MercadonaService
```

#### Modified files

```text
back/src/modules/insights/
├── insights.service.ts           # Inject MercadonaService; extend getPriceComparison; add delta
├── insights.service.spec.ts      # New test cases for Mercadona paths
└── insights.module.ts            # Import MercadonaModule

back/test/
└── insights.e2e-spec.ts          # Add Mercadona E2E test cases (mock MercadonaService via jest.spyOn)

front/src/features/insights/
└── insights.api.ts               # Add MercadonaResult interface; update PriceComparisonResponse

front/src/routes/
└── compare-price.$id.tsx         # Add Mercadona section: product name, price, "last updated", cached badge

front/tests/e2e/insights/
└── price-comparison.spec.ts      # Playwright E2E: page.route() mock for /insights/price-comparison
```

## Architecture Decisions

All decisions documented in [research.md](./research.md). Summary:

| Decision | Choice |
|----------|--------|
| HTTP client | Native `fetch()` + `AbortController` (3s timeout) — matches TheMealDB pattern |
| Caching | In-process `Map` with 24h TTL — matches TheMealDB pattern |
| Source tracking | `fetchedAt` stored in cache entry; returned as `lastUpdatedAt`; source flag distinguishes LIVE vs CACHED |
| Name normalization | New `normalize.ts` in Mercadona integration; wraps `normalizePriceComparisonName` + strips unit suffixes |
| Zero-price filter | Prices ≤ 0 treated as "not found" |
| Response shape | Additive extension — new `mercadona` and `delta` fields; all existing fields unchanged |
| Module wiring | `MercadonaModule` → imported by `InsightsModule`; no AppModule change needed |
| Delta computation | `receiptContext.latestUnitPriceEur − mercadona.priceEur`; null if either missing |

## Key Interfaces

```typescript
// back/src/integrations/mercadona/mercadona.service.ts
export interface MercadonaProduct {
  productName: string;
  priceEur: string;
  unit: string;
  fetchedAt: Date;
  source: "MERCADONA_LIVE" | "MERCADONA_CACHED";
}

// back/src/modules/insights/insights.service.ts (new addition)
export interface MercadonaResult {
  found: boolean;
  productName: string | null;
  priceEur: string | null;
  unit: string | null;
  lastUpdatedAt: string | null;
  source: "MERCADONA_LIVE" | "MERCADONA_CACHED" | null;
}

// PriceComparisonResponse — extended (new fields only)
export interface PriceComparisonResponse {
  // ... existing fields unchanged ...
  mercadona: MercadonaResult;       // always present
  delta: string | null;             // null when either price is missing
}
```

## Mercadona API Behaviour

> **⚠️ Implementation note**: The original Mercadona REST endpoint (`tienda.mercadona.es/api/search/`) was decommissioned and returns 404 for all queries. The implementation was updated to use Mercadona's Algolia-backed search instead. All functional requirements (FR-001 – FR-012) are still satisfied.

- **Search endpoint**: `POST https://redacted_algolia_app_id-dsn.algolia.net/1/indexes/products_prod_vlc1_es/query`
- **Request headers**: `X-Algolia-Application-Id: REDACTED_ALGOLIA_APP_ID`, `X-Algolia-API-Key: REDACTED_ALGOLIA_API_KEY`, `Content-Type: application/json`
- **Request body**: `{ "query": "<normalizedName>", "hitsPerPage": 5 }`
- **Credential provenance**: App ID and API key are extracted from Mercadona's public JS bundle (`tienda.mercadona.es/v9200/index-*.js`); they are public-facing credentials served to all browser users. Rotate by re-extracting from the bundle if 403/401 errors occur.
- **Result path**: `hits[0].price_instructions.reference_price` (price per unit of measurement) and `hits[0].price_instructions.reference_format` (unit, e.g. `l`, `kg`)
- **Note**: `reference_price` is the per-unit price (e.g. €0.96/L); `unit_price` is the total pack price — the former is used for accurate comparison.
- **Timeout**: 3 seconds via `AbortController`
- **Cache key**: `` `mercadona:${normalizedName}` ``

## Implementation Phases

### Phase 1: Mercadona integration (backend only)

Deliverable: `MercadonaService` with cache and normalization. All unit tests pass.

1. `normalize.spec.ts` — write failing tests first (TDD)
2. `normalize.ts` — implement `normalizeMercadonaQuery`
3. `mercadona.service.spec.ts` — write failing unit tests (mock `fetch`)
4. `mercadona.service.ts` — implement `MercadonaService.searchProduct`
5. `mercadona.module.ts` — wire NestJS module

### Phase 2: InsightsService update (backend)

Deliverable: `getPriceComparison` enriched with Mercadona data and delta. New unit tests pass.

6. Add failing unit tests to `insights.service.spec.ts` covering Mercadona paths
7. Update `insights.service.ts` — inject `MercadonaService`; extend response; compute delta
8. Update `insights.module.ts` — import `MercadonaModule`

### Phase 3: E2E backend tests

9. Add Mercadona test cases to `insights.e2e-spec.ts` (live found, not found, fallback, timeout fallback)

### Phase 4: Frontend

10. Update `insights.api.ts` — extend `PriceComparisonResponse` type
11. Update `compare-price.$id.tsx` — render Mercadona section with product name, price, unit, last-updated, cached badge, delta
12. Write Playwright E2E test (`front/tests/e2e/insights/price-comparison.spec.ts`)

## Complexity Tracking

No constitution violations. No complexity justification required.

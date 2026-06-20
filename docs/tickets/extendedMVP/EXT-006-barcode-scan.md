# EXT-006 — Barcode Scan for Item Entry

## Metadata
- **Type:** Full-Stack (Frontend + Backend)
- **Priority:** P2
- **Phase:** 2 — Growth
- **PRD Reference:** [P2-002](../../product/5_Extended-Non-MVP-PRD.md#p2-002-barcode-scan-for-item-entry)
- **Effort:** Medium
- **Depends on:** TKT-002 (pantry add-item flow — done), TKT-004 (expiration estimation — done)

---

## User Story

As a user, I want to scan a product barcode with my camera, so that item name, quantity, and unit are filled in automatically without manual typing.

---

## Context

Two free, zero-cost tools enable this feature:
- **`@zxing/browser`** (MIT license) — browser-based barcode scanner using the device camera via `getUserMedia`. Works as a PWA with no native wrapper.
- **Open Food Facts** (`world.openfoodfacts.org/api/v2/product/{barcode}`) — free, no auth, open-source product database with ~3 million products including strong EU/Spanish coverage.

The flow:
1. User opens barcode scanner from the add-item screen.
2. Camera activates; `@zxing/browser` decodes EAN-13 or UPC-A barcode.
3. Frontend sends barcode to backend (`GET /api/products/barcode/:code`).
4. Backend proxies to Open Food Facts, normalizes the response, and returns product info.
5. Add-item form is pre-filled with name, quantity, unit.
6. Expiration estimate is triggered immediately (`POST /pantry/items/estimate-by-name`, already exists).

The backend proxy avoids CORS issues from the browser and enables server-side caching of product lookups.

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| Backend — module | `back/src/modules/products/` | New NestJS module |
| Backend — integration | `back/src/integrations/open-food-facts/` | New Open Food Facts client |
| Backend — app | `back/src/app.module.ts` | Register `ProductsModule` |
| Frontend — component | `front/src/components/BarcodeScanner.tsx` | New camera scanner |
| Frontend — features | `front/src/features/pantry/pantry.api.ts` | Add `lookupBarcode` function |
| Frontend — routes | `front/src/routes/add.manual.tsx` | Wire scanner + auto-fill |
| Package | `front/package.json` | Add `@zxing/browser` |

---

## API Contracts

```
GET /api/products/barcode/:code
Response 200: {
  barcode: string
  name: string               // normalized product name
  quantity: number           // default 1
  unit: string               // "g" | "ml" | "unit" | etc., inferred from product weight/volume
  brand: string | null
  categories: string[]       // e.g. ["dairy", "cheese"]
  imageUrl: string | null
}
Response 404: { message: "Product not found" }
Response 502: { message: "Product database unavailable" }
```

---

## Data Model Changes

No Prisma schema changes. Product lookup is read-only and cached in memory (no DB persistence for product catalogue in this ticket).

---

## Technical Implementation Tasks

Follow TDD: write failing tests before implementing.

1. **Install frontend dependency**
   ```bash
   cd front && npm install @zxing/browser
   ```

2. **Open Food Facts integration** (`back/src/integrations/open-food-facts/open-food-facts.service.ts`)
   - `lookupBarcode(code: string): Promise<ProductInfo | null>`
     - GET `https://world.openfoodfacts.org/api/v2/product/{code}.json?fields=product_name,quantity,product_quantity,product_quantity_unit,brands,categories_tags,image_front_url`
     - Cache responses in `CacheModule` with 24-hour TTL per barcode (products don't change often).
     - Return `null` on 404 or missing `product_name`.
   - **Normalization:** map Open Food Facts fields to internal `ProductInfo`:
     - `product_name` → `name` (title-cased, trimmed)
     - `product_quantity` → `quantity` (parsed as number, default 1)
     - `product_quantity_unit` → `unit` (mapped to PANTRY_UNITS: "g" | "kg" | "ml" | "l" | "unit" | "pack")
   - Unit tests: mock `HttpService`, test normalization for g/ml/cl/kg/pack/oz → internal unit, test cache hit.

3. **Products controller** (`back/src/modules/products/products.controller.ts`)
   - `GET /products/barcode/:code` — call service, return 200 or 404.
   - Validate `:code` is a numeric string of 8–14 digits (EAN-8, EAN-13, UPC-A).
   - Unit test: 200 for known product, 404 for unknown, 400 for invalid code format.

4. **ProductsModule** — register controller, service, `OpenFoodFactsModule`, `CacheModule`.

5. **Register in AppModule** (`back/src/app.module.ts`).

6. **`BarcodeScanner` component** (`front/src/components/BarcodeScanner.tsx`)
   - Props: `onScan: (barcode: string) => void`, `onClose: () => void`.
   - On mount: initialize `BrowserMultiFormatReader` from `@zxing/browser`, start decoding from `getUserMedia`.
   - On first decode: call `onScan(result.getText())`, stop the reader.
   - Show a viewfinder overlay (a simple border rectangle) and a "Cancel" button.
   - Handles `NotAllowedError` (camera permission denied) → shows error message.
   - On unmount: call `reader.reset()` to release camera.
   - Vitest: renders without crashing (camera API mocked), calls `onScan` on decode event.

7. **`lookupBarcode` API function** (`front/src/features/pantry/pantry.api.ts`)
   - `lookupBarcode(code: string): Promise<BarcodeProduct>` — `GET /products/barcode/${code}`.
   - Returns `BarcodeProduct` type matching the API response shape.

8. **Wire into add-item form** (`front/src/routes/add.manual.tsx`)
   - Add a "Scan barcode" button above the name field.
   - On click: show `BarcodeScanner` in a modal/sheet.
   - On `onScan(barcode)`: call `lookupBarcode(barcode)`, pre-fill `name`, `quantity`, `unit` fields.
   - If 404: show "Product not found — enter details manually" toast, keep form open.
   - After pre-fill: trigger `estimateExpirationByName(name)` automatically (already exists).
   - Vitest: scanner modal opens on button click, form fields populated after successful scan.

---

## Camera Permission Handling

- If `getUserMedia` is not available (non-HTTPS, old browser): hide the scan button entirely.
- If permission denied: show "Camera access required to scan barcodes" message with a link to browser settings.
- If HTTPS is not enforced locally: note in `docs/local-development-setup.md` that barcode scan only works on HTTPS or `localhost`.

---

## Error Handling

- Open Food Facts timeout (>5 s): return `502` to client with "Product database unavailable". Form stays open for manual entry.
- Partial Open Food Facts data (name known, unit unknown): return what is available; missing fields default to `quantity: 1`, `unit: "unit"`.
- Barcode decoded but empty string: ignore decode result, keep scanner running.

---

## Security

- Barcode lookup endpoint is JWT-protected (same as all pantry endpoints).
- Open Food Facts is a public read-only API; no credentials required. No user data is sent to Open Food Facts.
- Product images from Open Food Facts are rendered via `<img src="...">` — Content Security Policy must allow `img-src https://images.openfoodfacts.org`.

---

## Testing Requirements

| Test type | Coverage |
|---|---|
| Unit — Open Food Facts service | HTTP mock, normalization, cache, 404 |
| Unit — Products controller | 200, 404, 400 (invalid code) |
| Vitest — BarcodeScanner | renders, calls onScan, handles permission denied |
| Vitest — add.manual.tsx | scan button visible, form filled after scan, expiry triggered |
| E2E (Playwright) | open scanner, mock camera, form auto-fills, item created |

---

## Acceptance Criteria

1. User can open a barcode scanner from the add-item screen; camera activates.
2. Scanning an EAN-13 barcode of a product present in Open Food Facts pre-fills name, quantity, and unit.
3. Expiration date estimate is triggered automatically after a successful scan.
4. Scanning an unknown barcode shows a "Product not found" message and keeps the form open for manual entry.
5. Camera permission denial shows a clear error message (not a crash).
6. Product data is cached for 24 hours — repeated scans of the same product do not make a network call.

---

## Non-Goals

- Native app barcode scanning (deferred to [6_Future-Capabilities.md](../../product/6_Future-Capabilities.md)).
- QR code scanning (EAN/UPC only for product lookup).
- Building a local product catalog from scan history.

---

## Open Questions

1. Should the barcode scanner appear inline in the form or as a full-screen overlay? (Recommendation: full-screen overlay on mobile for usability; the add-item form shows underneath.)
2. Should we show the Open Food Facts product image in the form preview before saving? (Recommendation: yes, if `imageUrl` is present — increases confidence that the correct product was scanned.)

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope fits one delivery cycle
- [x] Dependencies identified (TKT-002, TKT-004 done; `@zxing/browser` and Open Food Facts are free)

# Quickstart Validation Guide: Mercadona Live Price Comparison

## Prerequisites

- Docker Compose running (`docker compose up -d`) — PostgreSQL must be available
- Backend running: `cd back && npm run start:dev`
- Frontend running: `cd front && npm run dev`
- A registered user account (use the sign-up flow or Postman)

---

## Scenario 1: Live Mercadona price returned

**Goal**: Verify that a common pantry item name ("leche") returns a live Mercadona price.

**Steps**:
1. Add a pantry item named "Leche Entera 1L" via the Add Item screen, set a price paid (e.g. €0.89).
2. Navigate to the pantry and open the item detail.
3. Tap "Compare price".
4. Observe the price comparison screen.

**Expected outcome**:
- A Mercadona price (e.g. €0.72) is displayed with the product name "Leche entera Hacendado 1L".
- "Last updated: just now" or "Last updated: X seconds ago" is shown below the Mercadona price.
- Source label shows "Live price" (not "Cached").
- A delta value is shown (e.g. "You overpaid by €0.17").

---

## Scenario 2: Cached result on second request

**Goal**: Verify that a second comparison request within 24 hours returns the cached result.

**Steps**:
1. Complete Scenario 1.
2. Navigate back and reopen the same item's price comparison.

**Expected outcome**:
- The comparison screen loads immediately (no delay).
- Source label shows "Cached" or "(cached)".
- `lastUpdatedAt` timestamp is the same as in Scenario 1 (not refreshed).

---

## Scenario 3: Static catalog fallback

**Goal**: Verify that items with no Mercadona match still show a reference price.

**Steps**:
1. Add a pantry item whose name matches a `PriceCatalogItem` entry but is unlikely to be found in Mercadona (e.g. a very specific or obscure item name that exists in the seed data).
2. Open its price comparison.

**Expected outcome**:
- The Mercadona section shows "No live price available from Mercadona".
- The static catalog reference price is displayed instead.
- No error or blank state.

---

## Scenario 4: Mercadona service unavailable (manual test)

**Goal**: Verify graceful fallback when Mercadona API is down.

**Steps**:
1. Temporarily block the Mercadona API domain in `/etc/hosts` or using a proxy.
2. Request a price comparison for "leche" (cache cold).

**Expected outcome**:
- The comparison screen loads without error.
- The Mercadona section shows "Temporarily unavailable".
- The static catalog reference price (if any) is still shown.
- No 500 error returned from the backend.

---

## Automated Test Verification

### Backend unit tests
```bash
cd back
npx jest --testPathPatterns="mercadona.service|normalize|insights.service" --no-coverage
```
Expected: all tests green.

### Backend E2E tests
```bash
cd back
npx jest --testPathPatterns="insights.e2e" --no-coverage
```
Expected: all tests green (Mercadona HTTP is mocked via jest.spyOn).

### Frontend unit tests
```bash
cd front
npx vitest run
```
Expected: all test files pass, including updated compare-price tests.

### Playwright E2E
```bash
cd front
npx playwright test tests/e2e/insights/
```
Expected: price comparison E2E test passes (Mercadona API responses are mocked via `page.route()`).

---

## API Verification (curl)

```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.accessToken')

# Compare price for "leche"
curl -s "http://localhost:3000/api/insights/price-comparison?normalizedName=leche" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected response shape**:
```json
{
  "normalizedName": "leche",
  "found": true,
  "mercadona": {
    "found": true,
    "productName": "...",
    "priceEur": "...",
    "unit": "...",
    "lastUpdatedAt": "...",
    "source": "MERCADONA_LIVE"
  },
  "reference": { ... },
  "receiptContext": { ... },
  "delta": "...",
  "unavailableReason": null
}
```

See [contracts/price-comparison-api.md](./contracts/price-comparison-api.md) for full schema.

# Preserve Search Dates on Property Navigation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user clicks a property card on the search results page, forward the currently selected check-in and check-out dates to the property detail page URL so the booking widget is pre-filled.

**Architecture:** Read `checkIn`/`checkOut` from the search page's URL params inside `handlePropertyClick` and append them as `check_in`/`check_out` to the property detail URL. The property detail page already reads those params and uses them — no changes needed there. Add a Playwright E2E test to verify the end-to-end behaviour.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Playwright (E2E)

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `frontend/src/app/search/page.tsx` | `handlePropertyClick` reads dates from `searchParams` and appends them to the destination URL |
| Modify | `frontend/tests/e2e/booking-journey.spec.ts` | New test verifying dates are forwarded on card click |

---

### Task 1: Forward dates in `handlePropertyClick`

**Files:**
- Modify: `frontend/src/app/search/page.tsx` — `handlePropertyClick` function (~line 192)

- [ ] **Step 1: Locate the function**

Open `frontend/src/app/search/page.tsx`. Find `handlePropertyClick` (around line 192):

```typescript
const handlePropertyClick = useCallback(
  (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  },
  [router],
);
```

- [ ] **Step 2: Replace the function**

Replace it with:

```typescript
const handlePropertyClick = useCallback(
  (propertyId: string) => {
    const params = new URLSearchParams();
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    const qs = params.toString();
    router.push(`/property/${propertyId}${qs ? `?${qs}` : ''}`);
  },
  [router, searchParams],
);
```

`searchParams` is already declared at the top of the component (`const searchParams = useSearchParams();` around line 38) — no new import needed.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/search/page.tsx
git commit -m "feat(search): forward check-in/check-out dates when navigating to property detail"
```

---

### Task 2: E2E test — dates forwarded on property card click

**Files:**
- Modify: `frontend/tests/e2e/booking-journey.spec.ts` — new `test` block at the end of the file

The existing booking-journey spec already boots the full stack via `docker-compose.e2e.yml`. Add a focused test that searches with explicit dates and asserts they appear in the property detail URL.

- [ ] **Step 1: Read the top of the existing spec to understand setup**

Open `frontend/tests/e2e/booking-journey.spec.ts`. Note the `test.describe` name and any `beforeAll`/`beforeEach` hooks used for auth or navigation. The new test must work within the same `test.describe` block so it shares those hooks.

- [ ] **Step 2: Add the failing test**

Inside the outermost `test.describe` block (before the closing `}`), append:

```typescript
test('navigating to a property from search results forwards the selected dates', async ({ page }) => {
  // Search with explicit dates
  const checkIn = '2027-03-10';
  const checkOut = '2027-03-15';

  await page.goto(
    `/search?location=Barcelona&checkIn=${checkIn}&checkOut=${checkOut}`,
  );

  // Wait for at least one property card to render
  const firstCard = page.locator('[data-property-id]').first();
  await firstCard.waitFor({ state: 'visible', timeout: 15000 });

  // Capture the property id from the card
  const propertyId = await firstCard.getAttribute('data-property-id');
  expect(propertyId).toBeTruthy();

  // Click the card
  await firstCard.click();

  // Assert we landed on the property detail page with dates in the URL
  await page.waitForURL(`**/property/${propertyId}**`, { timeout: 10000 });
  const url = new URL(page.url());
  expect(url.searchParams.get('check_in')).toBe(checkIn);
  expect(url.searchParams.get('check_out')).toBe(checkOut);
});
```

- [ ] **Step 3: Run the new test in isolation to verify it fails**

Make sure the E2E stack is running first (see `docker-compose.e2e.yml` in the repo root), then:

```bash
cd frontend && npx playwright test --grep "forwards the selected dates" --reporter=list
```

Expected: FAIL — the URL will not contain `check_in`/`check_out` because Task 1 hasn't been applied yet (if running tasks out of order) or PASS if Task 1 is already done.

If Task 1 is already done, skip this failure-verification step and go straight to Step 4.

- [ ] **Step 4: Run the test after Task 1 is applied and verify it passes**

```bash
cd frontend && npx playwright test --grep "forwards the selected dates" --reporter=list
```

Expected output:
```
  ✓  … navigating to a property from search results forwards the selected dates
```

- [ ] **Step 5: Run the full E2E suite to check for regressions**

```bash
cd frontend && npx playwright test --reporter=list
```

Expected: all previously passing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/tests/e2e/booking-journey.spec.ts
git commit -m "test(e2e): assert search dates are forwarded to property detail URL on card click"
```

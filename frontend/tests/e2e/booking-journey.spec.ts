import { test, expect, type Page } from '@playwright/test';

/**
 * Whole booking + cancellation journeys, real browser → real frontend → real
 * backend → Postgres.
 *
 * Conventions (see the frontend-e2e-playwright skill):
 *  - navigate via the results list, not the Mapbox map (dummy token);
 *  - payment uses the NEXT_PUBLIC_E2E stub path (the backend StubPaymentAdapter
 *    auto-succeeds), so no real Stripe;
 *  - dates are computed relative to "today" within the seeded availability window
 *    (CURRENT_DATE..+89) and clear of the seed bookings (+10-14, +20-23, +40-45).
 *
 * The shared booking flow is a same-file helper (not a cross-file import — that
 * trips a Playwright TS-loader bug on Node 22).
 */

function isoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

// Hands out a fresh, non-overlapping 3-night window per booking so the two
// journeys (which book the same seeded property) can never collide on dates.
// Windows start at +46 days (clear of the seed bookings at <= +45) and step by
// 5, staying inside the +89-day seeded availability horizon. Each call advances
// the cursor; a Playwright retry simply takes the next free window.
let nextStayOffset = 46;
function nextStayWindow(): { checkIn: string; checkOut: string } {
  const offset = nextStayOffset;
  nextStayOffset += 5;
  return { checkIn: isoDate(offset), checkOut: isoDate(offset + 3) };
}

/**
 * Registers a fresh guest and books + confirms a far-future stay (>48h out, so
 * cancellation grants a full refund), leaving the page on `/confirmation/{id}`.
 */
async function registerAndBookConfirmedStay(page: Page): Promise<void> {
  const email = `e2e-${Date.now()}@example.com`;
  const { checkIn, checkOut } = nextStayWindow();

  // 1. Register → lands on /search
  await page.goto('/register');
  await page.getByTestId('register-first-name').fill('E2E');
  await page.getByTestId('register-last-name').fill('Tester');
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill('pass1234');
  await page.getByTestId('register-submit').click();
  await expect(page).toHaveURL(/\/search/);

  // 2. Search Barcelona with dates → results list renders
  await page.getByTestId('search-location').fill('barcelona');
  await page.locator('#check-in').fill(checkIn);
  await page.locator('#check-out').fill(checkOut);
  await page.getByTestId('search-submit').click();

  const firstCard = page.locator('[data-testid="property-grid"] [data-property-id]').first();
  await expect(firstCard).toBeVisible();
  const propertyId = await firstCard.getAttribute('data-property-id');
  expect(propertyId).toBeTruthy();

  // 3. Open the property (proves search → detail navigation)
  await firstCard.getByRole('button').first().click();
  await expect(page.getByTestId('property-page')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/property/${propertyId}`));

  // 4. Provide dates via the URL (robust vs. clicking calendar days) → reserve
  await page.goto(`/property/${propertyId}?check_in=${checkIn}&check_out=${checkOut}`);
  const reserve = page.getByTestId('reserve-button');
  await expect(reserve).toBeEnabled();
  await reserve.click();

  // 5. Checkout creates the booking + hold; pay via the E2E stub → confirmation
  await expect(page.getByTestId('pay-button')).toBeVisible();
  await page.getByTestId('pay-button').click();
  await expect(page).toHaveURL(/\/confirmation\/[0-9a-f-]+$/);
}

test('guest registers, searches, books a property, and reaches confirmation', async ({ page }) => {
  await registerAndBookConfirmedStay(page);

  await expect(page.getByRole('heading', { name: 'Your trip is booked!' })).toBeVisible();
  await expect(page.getByText(/^BK-/)).toBeVisible(); // reference number
});

test('guest cancels a confirmed booking from My Trips and sees it cancelled', async ({ page }) => {
  await registerAndBookConfirmedStay(page);

  // Confirmation → My Trips
  await page.getByTestId('view-trips-button').click();
  await expect(page).toHaveURL(/\/trips(\?|$)/);

  // Fresh guest has exactly one trip — open it.
  const card = page.getByTestId('trip-card').first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/trips\/[0-9a-f-]+$/);

  // Detail shows a confirmed, cancellable booking.
  await expect(page.getByText('confirmed').first()).toBeVisible();
  const openCancel = page.getByTestId('open-cancel-button');
  await expect(openCancel).toBeVisible();
  await openCancel.click();

  // Modal shows the refund (far-future → full refund) → confirm.
  await expect(page.getByTestId('cancellation-modal')).toBeVisible();
  await expect(page.getByTestId('refund-amount')).toBeVisible();
  await page.getByTestId('confirm-cancel-button').click();

  // Cancellation persisted + refetched: status is cancelled, cancel CTA is gone.
  await expect(page.getByText('cancelled').first()).toBeVisible();
  await expect(page.getByTestId('open-cancel-button')).toHaveCount(0);
});

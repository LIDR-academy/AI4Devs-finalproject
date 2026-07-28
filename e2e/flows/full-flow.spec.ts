import { test, expect } from '@playwright/test';

test.describe('Realista — full flow', () => {
  test('user can land on dashboard, see empty state, and navigate to listing-lens', async ({ page }) => {
    await page.goto('/mi-proceso');

    // Empty state CTAs
    await expect(page.getByText('Analizar un anuncio')).toBeVisible();
    await expect(page.getByText('Configurar perfil manualmente')).toBeVisible();

    // Navigate to listing-lens
    await page.getByText('Analizar un anuncio').first().click();
    await expect(page).toHaveURL(/\/listing-lens/);
    await expect(page.getByRole('heading', { name: 'Analizar un anuncio' })).toBeVisible();
  });

  test('user can see AI disclaimer on listing-lens', async ({ page }) => {
    await page.goto('/listing-lens');
    await expect(page.getByText(/Análisis generado por IA/i)).toBeVisible();
  });

  test('timeline shows milestones', async ({ page }) => {
    await page.goto('/timeline');
    await expect(page.getByRole('heading', { name: 'Cronograma del proceso' })).toBeVisible();
    // The list of milestones is rendered
    const dot = page.locator('.dot').first();
    await expect(dot).toBeVisible();
  });

  test('user can complete the full happy path: analyze (API) → dashboard (UI) → mortgage compass (UI) → checklist (UI)', async ({ page, request }) => {
    // Clean session for a deterministic run
    await page.goto('/mi-proceso');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 1. Dashboard shows empty state
    await expect(page.getByText('Analizar un anuncio')).toBeVisible();

    // 2. Analyze via API directly with manualText (avoids real portal blocking)
    const sessionId = await page.evaluate(() => {
      const key = 'realista.sessionId';
      return localStorage.getItem(key) ?? (() => { const v = crypto.randomUUID(); localStorage.setItem(key, v); return v; })();
    });
    const analyzeRes = await request.post('http://localhost:3001/api/listings/analyze', {
      headers: { 'X-Session-Id': sessionId, 'Content-Type': 'application/json' },
      data: {
        url: 'https://www.idealista.com/inmueble/12345/',
        manualText: 'Piso acogedor. Sin ascensor. Sin CEE. 200.000€',
      },
    });
    expect(analyzeRes.status()).toBe(200);
    const analyzeBody = await analyzeRes.json();
    expect(analyzeBody.listing.transparencyScore).toBeGreaterThanOrEqual(0);
    expect(analyzeBody.processSummary.isNewProcess).toBe(true);

    // 3. Verify negotiation points endpoint works
    const listingId = analyzeBody.listing.id;
    const negRes = await request.get(`http://localhost:3001/api/listings/${listingId}/negotiation-points`, {
      headers: { 'X-Session-Id': sessionId },
    });
    expect(negRes.status()).toBe(200);
    const negBody = await negRes.json();
    expect(negBody.points.length).toBeGreaterThanOrEqual(3);

    // 4. Dashboard now shows the latest listing (re-load to pick up the new analysis)
    await page.goto('/mi-proceso');
    await expect(page.getByText(/bandera/i).first()).toBeVisible({ timeout: 10_000 });

    // 5. Navigate to mortgage-compass
    await page.goto('/mortgage-compass');
    const mortgageHeading = page.getByRole('heading', { name: /hipotecario/i }).first();
    await expect(mortgageHeading).toBeVisible();

    // 6. Navigate to timeline+checklist
    await page.goto('/timeline');
    await expect(page.getByRole('heading', { name: /Cronograma/i }).first()).toBeVisible();
  });
});

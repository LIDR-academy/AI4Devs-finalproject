import { test, expect } from '@playwright/test';

test.describe('Listing Lens', () => {
  test('rejects empty URL', async ({ page }) => {
    await page.goto('/listing-lens');
    const submit = page.getByRole('button', { name: /Analizar/i });
    await expect(submit).toBeDisabled();
  });

  test('shows progress during analysis (mocked)', async ({ page }) => {
    await page.goto('/listing-lens');
    await page.getByLabel('URL del anuncio').fill('https://www.idealista.com/inmueble/12345/');
    await page.getByRole('button', { name: /Analizar/i }).click();
    // Progress steps should be visible
    await expect(page.getByText(/Obteniendo anuncio/i)).toBeVisible();
  });
});

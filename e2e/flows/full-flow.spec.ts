import { test, expect } from '@playwright/test';

test.describe('Realista — full flow', () => {
  test('user can land on dashboard, see empty state, and navigate to listing-lens', async ({ page }) => {
    await page.goto('/');

    // Empty state CTAs
    await expect(page.getByText('Analizar un anuncio')).toBeVisible();
    await expect(page.getByText('Configurar perfil manualmente')).toBeVisible();

    // Navigate to listing-lens
    await page.getByText('Analizar un anuncio').first().click();
    await expect(page).toHaveURL(/\/listing-lens/);
    await expect(page.getByRole('heading', { name: 'Analizar anuncio' })).toBeVisible();
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
});

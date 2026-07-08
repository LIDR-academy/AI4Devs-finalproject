import { test, expect } from '@playwright/test';

test.describe('Mortgage Compass', () => {
  test('form is accessible with all required fields', async ({ page }) => {
    await page.goto('/mortgage-compass');
    await expect(page.getByLabel(/Ahorros/i)).toBeVisible();
    await expect(page.getByLabel(/Ingresos netos/i)).toBeVisible();
    await expect(page.getByLabel(/Deudas existentes/i)).toBeVisible();
    await expect(page.getByLabel(/Comunidad autónoma/i)).toBeVisible();
  });

  test('shows AI disclaimer', async ({ page }) => {
    await page.goto('/mortgage-compass');
    await expect(page.getByText(/Análisis generado por IA/i)).toBeVisible();
  });
});

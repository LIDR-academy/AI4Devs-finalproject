import { test, expect } from '@playwright/test';

test.describe('UX redesign', () => {
  test('landing visible en /', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /ojos abiertos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Analizar un anuncio/i })).toBeVisible();
  });

  test('header sticky con logo', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    await expect(header.getByText('Realista')).toBeVisible();
  });

  test('process stepper muestra 4 pasos', async ({ page }) => {
    await page.goto('/listing-lens');
    const stepper = page.locator('nav[aria-label="Pasos del proceso"]');
    await expect(stepper).toBeVisible();
    await expect(stepper.locator('[data-step-id]')).toHaveCount(4);
  });

  test('listing-lens tiene tabs URL/Texto', async ({ page }) => {
    await page.goto('/listing-lens');
    await expect(page.getByRole('tab', { name: 'URL' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Texto' })).toBeVisible();
  });

  test('click en tab Texto muestra textarea', async ({ page }) => {
    await page.goto('/listing-lens');
    await page.getByRole('tab', { name: 'Texto' }).click();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('dashboard reubicado en /mi-proceso', async ({ page }) => {
    await page.goto('/mi-proceso');
    await expect(page.getByRole('heading', { name: /Tu proceso/i })).toBeVisible();
  });
});

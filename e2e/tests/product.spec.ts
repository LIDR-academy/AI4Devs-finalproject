import { test, expect } from '@playwright/test';

test.describe('Ficha de producto', () => {
  test('navega del catálogo a la ficha y muestra nombre, precio y atributos', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('article').first();
    await expect(firstCard).toBeVisible();
    const productName = (await firstCard.locator('h3').textContent())?.trim();
    expect(productName).toBeTruthy();

    await firstCard.locator('h3').click();
    await expect(page).toHaveURL(/\/product\//);

    await expect(page.getByRole('heading', { level: 1, name: productName! })).toBeVisible();
    await expect(page.getByTestId('product-detail-price')).toBeVisible();
    const attributeBadges = page.getByTestId('product-attributes').locator('span');
    await expect(attributeBadges.first()).toBeVisible();

    await page.getByRole('button', { name: 'Volver' }).click();
    await expect(page).toHaveURL('/');
  });

  test('un id de producto inexistente muestra el estado 404', async ({ page }) => {
    await page.goto('/product/id-inexistente-e2e');

    await expect(page.getByRole('heading', { name: 'Producto no encontrado' })).toBeVisible();
    const backLink = page.getByRole('link', { name: 'Volver al catálogo' });
    await expect(backLink).toHaveAttribute('href', '/');
  });
});

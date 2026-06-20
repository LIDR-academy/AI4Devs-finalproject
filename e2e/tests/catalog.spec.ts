import { test, expect } from '@playwright/test';

test.describe('Catálogo de productos', () => {
  test('el catálogo muestra productos del seed', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Productos para Running' })).toBeVisible();
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('activar un filtro de distancia cambia los resultados', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('article').first()).toBeVisible();
    const namesBefore = await page.locator('article h3').allTextContents();

    const distanceCheckbox = page.getByRole('checkbox', { name: '5K' });
    await distanceCheckbox.click();
    await expect(distanceCheckbox).toBeChecked();
    await expect(page).toHaveURL(/distance=5K/);

    await expect(async () => {
      const namesAfter = await page.locator('article h3').allTextContents();
      expect(namesAfter).not.toEqual(namesBefore);
    }).toPass();
  });

  test('combinar filtros sin resultados muestra el estado vacío', async ({ page }) => {
    await page.goto('/');

    const categoryRadio = page.getByRole('radio', { name: 'Zapatillas' });
    await categoryRadio.click();
    await expect(categoryRadio).toBeChecked();

    const surfaceCheckbox = page.getByRole('checkbox', { name: 'Pista' });
    await surfaceCheckbox.click();
    await expect(surfaceCheckbox).toBeChecked();

    const objectiveCheckbox = page.getByRole('checkbox', { name: 'Recuperación' });
    await objectiveCheckbox.click();
    await expect(objectiveCheckbox).toBeChecked();

    await expect(page.getByTestId('filter-empty-state')).toBeVisible();
  });
});

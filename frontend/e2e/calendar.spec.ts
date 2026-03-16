import { test, expect } from '@playwright/test';

/**
 * E2E: Calendario de quirófanos.
 * Requiere backend y seed (quirófanos y opcionalmente cirugías con horario).
 */
test.describe('Calendario de quirófanos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'test123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }
  });

  test('debería mostrar la página del calendario y el selector de quirófano', async ({ page }) => {
    await page.goto('/planning/calendar');
    await expect(page.getByRole('heading', { name: /Calendario de quirófanos/i })).toBeVisible({
      timeout: 8000,
    });
    await expect(page.locator('text=Ocupación y disponibilidad por sala')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('select').filter({ has: page.locator('option[value=""]') })).toBeVisible({
      timeout: 3000,
    });
  });

  test('debería poder seleccionar un quirófano y ver la semana', async ({ page }) => {
    await page.goto('/planning/calendar');
    await expect(page.getByRole('heading', { name: /Calendario de quirófanos/i })).toBeVisible({
      timeout: 8000,
    });

    const roomSelect = page.locator('select').first();
    await expect(roomSelect).toBeVisible({ timeout: 5000 });
    const options = await roomSelect.locator('option').allTextContents();
    const hasRooms = options.some((t) => t && t !== 'Seleccionar quirófano');
    if (!hasRooms) {
      test.skip();
      return;
    }

    await roomSelect.selectOption({ index: 1 });
    await expect(
      page.locator('text=Sin cirugías').or(page.locator('a[href*="/planning/surgeries/"]')),
    ).toBeVisible({ timeout: 8000 });
  });

  test('debería tener enlaces a Cirugías y Quirófanos', async ({ page }) => {
    await page.goto('/planning/calendar');
    await expect(page.getByRole('link', { name: 'Cirugías' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: 'Quirófanos' })).toBeVisible({ timeout: 3000 });
  });
});

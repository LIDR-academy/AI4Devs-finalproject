import { test, expect } from '@playwright/test';

/**
 * E2E: flujo Planificación → Cirugía → Checklist WHO.
 * Requiere backend y seed (cirugías de prueba).
 */
test.describe('Planificación y Checklist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'test123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }
  });

  test('debería mostrar la lista de cirugías en Planificación', async ({ page }) => {
    await page.goto('/planning/surgeries');
    await expect(page.locator('text=Cirugías')).toBeVisible({ timeout: 8000 });
    // Puede haber "No hay cirugías" o la tabla
    const tableOrEmpty = page.locator('table, text=No hay cirugías');
    await expect(tableOrEmpty).toBeVisible({ timeout: 5000 });
  });

  test('debería abrir detalle de cirugía y acceder al checklist', async ({ page }) => {
    await page.goto('/planning/surgeries');
    await expect(page.locator('text=Cirugías')).toBeVisible({ timeout: 8000 });

    const verDetalles = page.locator('a:has-text("Ver detalles")').first();
    const hasSurgeries = await verDetalles.isVisible().catch(() => false);
    if (!hasSurgeries) {
      test.skip();
      return;
    }

    await verDetalles.click();
    await page.waitForURL(/\/planning\/surgeries\/[a-f0-9-]+/, { timeout: 8000 });

    const checklistLink = page.locator('a[href*="/checklist/"]:has-text("Checklist")').first();
    await expect(checklistLink).toBeVisible({ timeout: 3000 });
    await checklistLink.click();

    await page.waitForURL(/\/checklist\/[a-f0-9-]+/, { timeout: 5000 });
    // Checklist WHO muestra al menos una fase
    await expect(page.getByText(/Sign In|Time Out|Sign Out|Antes de la Inducción/).first()).toBeVisible({
      timeout: 5000,
    });
  });
});

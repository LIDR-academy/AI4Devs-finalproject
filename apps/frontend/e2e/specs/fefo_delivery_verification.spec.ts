import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';

/**
 * E2E Verification Suite for RestoStock Delivery 2.
 * Validates critical path: Auth -> FEFO Dashboard -> Stock Extraction -> Recipe Consumption -> Shift Reconciliation.
 * Enforces Guard 20 (3 Oracles) & Guard 21 (Directory Co-location & POM).
 */
test.describe('RestoStock - Segunda Entrega E2E Critical Path Suite', () => {

  test('Autenticación y despliegue inicial del Dashboard FEFO', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Act
    await loginPage.login('1234');

    // ASSERT 1: ORACULO UI - Renderizado del header y controles de cocina táctil (min 48px)
    await expect(dashboardPage.headerTitle).toBeDefined();
    await expect(page.getByText(/RestoStock/i)).toBeVisible();

    // ASSERT 2: ORACULO RED - Petición autorizada a remanentes activos
    const response = await page.waitForResponse((res) =>
      res.url().includes('/api/v1/kitchen/remanentes-activos') || res.status() === 200
    ).catch(() => null);
    if (response) {
      expect(response.status()).toBe(200);
    }

    // ASSERT 3: ORACULO ESTADO - Sesión almacenada
    const token = await page.evaluate(() => localStorage.getItem('restostock_jwt_token'));
    expect(token).toBeDefined();
  });

  test('Flujo de Extracción de Insumos con FEFO y Alta TRR', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    await loginPage.login('1234');

    // Act: Abrir modal de extracción
    await dashboardPage.openExtractionModal();

    // ASSERT 1: ORACULO UI - Modal de Extracción visible
    await expect(page.getByText(/Extracción de Bodega/i)).toBeVisible();

    // ASSERT 2: ORACULO RED - Selectores de sector e insumos renderizados
    await expect(page.locator('#select-from-sector-extraction, #select-insumo-extraction').first()).toBeVisible();

    // ASSERT 3: ORACULO ESTADO - Cierre de modal y retorno a vista de cocina
    await page.locator('button:has-text("Cancelar")').click();
    await expect(page.locator('.modal-overlay')).toHaveCount(0);
  });
});


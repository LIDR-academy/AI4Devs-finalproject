import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

/**
 * US-033 / TK-120-FE — verificación visual real contra el stack Docker desplegado.
 * No sustituye a los tests RTL: comprueba que el flujo completo (UI → API → Postgres)
 * funciona en el artefacto que se despliega de verdad, incluidos los dos turnos de tema.
 */
test.describe('TK-120-FE: registro de temperatura (QA visual)', () => {
  test('registra una lectura fuera de rango como advertencia, sin bloquear el tablero', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login('1234');

    const openButton = page.locator('#btn-open-temperature-log');
    await expect(openButton).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'e2e-artifacts/tk120-01-tablero.png', fullPage: true });

    await openButton.click();
    await expect(page.getByLabel(/Sub-sector Refrigerado/i)).toBeVisible();
    await page.screenshot({ path: 'e2e-artifacts/tk120-02-modal.png' });

    await page.getByLabel(/Temperatura leída/i).fill('7.20');
    await page.getByRole('button', { name: /Registrar Lectura/i }).click();

    // Fuera de rango => confirmación con acento de advertencia, NUNCA un error
    const feedback = page.getByRole('status');
    await expect(feedback).toContainText(/FUERA del rango seguro/i);
    await expect(page.locator('[role="alert"]')).toHaveCount(0);
    await page.screenshot({ path: 'e2e-artifacts/tk120-03-advertencia.png' });

    // El tablero sigue accesible tras cerrar: la lectura nunca bloquea el flujo
    await page.locator('#btn-close-temperature-confirmation').click();
    await expect(page.locator('#btn-open-extraction')).toBeVisible();
  });

  test('el histórico aparece en Reportes con el estado marcado por texto', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login('1234');
    // Esperar a que el login termine ANTES de navegar: un goto() inmediato aborta la
    // petición en vuelo y la app vuelve a la pantalla de PIN.
    await expect(page.locator('#btn-open-extraction')).toBeVisible({ timeout: 15000 });

    await page.goto('/reportes');
    const panel = page.getByText(/Control de Temperatura de Refrigeración/i);
    await expect(panel).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Fuera de rango/i).first()).toBeVisible();
    await page.screenshot({ path: 'e2e-artifacts/tk120-04-reporte.png', fullPage: true });
  });
});

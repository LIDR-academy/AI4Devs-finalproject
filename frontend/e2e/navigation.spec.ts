import { test, expect } from '@playwright/test';

test.describe('Navegación', () => {
  test.beforeEach(async ({ page }) => {
    // Hacer login primero
    await page.goto('/');
    
    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'test123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }
  });

  test('debería navegar al dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('debería navegar a la lista de pacientes', async ({ page }) => {
    await page.goto('/hce/patients');
    await expect(page.locator('text=Pacientes')).toBeVisible();
  });

  test('debería navegar a la planificación quirúrgica', async ({ page }) => {
    await page.goto('/planning');
    await expect(page.locator('text=Planificación, text=Cirugías')).toBeVisible();
  });

  test('debería mostrar el menú de navegación', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar que existe el sidebar o menú de navegación
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('debería poder hacer logout', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Buscar botón de logout
    const logoutButton = page.locator('button:has-text("Salir"), button:has-text("Logout"), [aria-label*="logout" i]').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Verificar redirección al login
      await page.waitForURL('**/login', { timeout: 5000 });
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });
});

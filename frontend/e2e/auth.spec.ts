import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debería mostrar el formulario de login', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debería validar campos requeridos', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    await submitButton.click();
    
    // Verificar que se muestran mensajes de error
    await expect(page.locator('text=requerido')).toBeVisible();
  });

  test('debería hacer login exitosamente', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'test123');
    
    await page.click('button[type="submit"]');
    
    // Esperar redirección al dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verificar que se muestra el dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('debería mostrar error con credenciales inválidas', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrong-password');
    
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de error
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible({ timeout: 5000 });
  });
});

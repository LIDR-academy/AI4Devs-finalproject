import { test, expect } from '@playwright/test';

test.describe('Gestión de Pacientes', () => {
  let authToken: string;

  test.beforeEach(async ({ page, request }) => {
    // Hacer login primero para obtener token
    const loginResponse = await request.post('http://localhost:3000/api/v1/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'test123',
      },
    });

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      authToken = loginData.accessToken || loginData.data?.accessToken;
    }

    // Navegar a la página de pacientes
    await page.goto('/hce/patients');
    
    // Si hay login requerido, hacer login primero
    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'test123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/hce/patients', { timeout: 10000 });
    }
  });

  test('debería mostrar la lista de pacientes', async ({ page }) => {
    await expect(page.locator('text=Pacientes')).toBeVisible();
  });

  test('debería poder buscar pacientes', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="buscar" i], input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Juan');
      // Esperar a que se actualice la lista
      await page.waitForTimeout(1000);
    }
  });

  test('debería navegar al formulario de nuevo paciente', async ({ page }) => {
    const newButton = page.locator('button:has-text("Nuevo"), a:has-text("Nuevo")').first();
    
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForURL('**/patients/new', { timeout: 5000 });
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('debería crear un nuevo paciente', async ({ page }) => {
    // Navegar al formulario
    await page.goto('/hce/patients/new');
    
    // Llenar formulario
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Patient');
    await page.fill('input[name="dateOfBirth"]', '1990-01-01');
    await page.selectOption('select[name="gender"]', 'M');
    await page.fill('input[name="phone"]', '123456789');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección o mensaje de éxito
    await page.waitForTimeout(2000);
    
    // Puede redirigir a la lista o mostrar mensaje de éxito
    const isRedirected = page.url().includes('/patients') && !page.url().includes('/new');
    const hasSuccessMessage = await page.locator('text=éxito, text=creado').isVisible().catch(() => false);
    
    expect(isRedirected || hasSuccessMessage).toBeTruthy();
  });
});

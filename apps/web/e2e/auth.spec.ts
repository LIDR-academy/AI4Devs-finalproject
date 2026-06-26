import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'MecaTrack' })).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
  });

  test('shows generic error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('mechanic@taller.com');
    await page.getByLabel('Contraseña').fill('WrongPassword123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(
      page.getByText('Correo o contraseña incorrectos'),
    ).toBeVisible();
  });

  test('admin login redirects to admin dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('admin@taller.com');
    await page.getByLabel('Contraseña').fill('AdminPass123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(page.getByText('Panel de administración')).toBeVisible();
  });

  test('mechanic login redirects to mechanic dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('mechanic@taller.com');
    await page.getByLabel('Contraseña').fill('MechanicPass123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/mechanic\/dashboard$/);
    await expect(page.getByText('Panel del mecánico')).toBeVisible();
  });

  test('logout redirects to login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('admin@taller.com');
    await page.getByLabel('Contraseña').fill('AdminPass123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('mechanic cannot access admin dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('mechanic@taller.com');
    await page.getByLabel('Contraseña').fill('MechanicPass123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/mechanic\/dashboard$/);
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/403$/, { timeout: 10_000 });
  });

  test('unauthenticated user is redirected from admin dashboard', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('inactive user sees inactive message', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('inactive@taller.com');
    await page.getByLabel('Contraseña').fill('InactivePass123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'inactiva' }),
    ).toBeVisible({ timeout: 10_000 });
  });
});

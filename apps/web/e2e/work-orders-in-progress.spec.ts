import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill('admin@taller.com');
  await page.getByLabel('Contraseña').fill('AdminPass123');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 15_000 });
}

test.describe('In-progress work orders (US-D10)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('dashboard shows widget and nav link to full list', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(
      page.getByRole('heading', { name: 'Órdenes en curso' }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByRole('navigation', { name: 'Administración' }).getByRole('link', {
        name: 'En curso',
      }),
    ).toBeVisible();

    const emptyState = page.getByText('No hay órdenes en curso.');
    const viewAll = page.getByRole('link', { name: 'Ver todas' });

    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
      await page
        .getByRole('navigation', { name: 'Administración' })
        .getByRole('link', { name: 'En curso' })
        .click();
    } else {
      await expect(viewAll).toBeVisible();
      await viewAll.click();
    }

    await expect(page).toHaveURL(/\/work-orders\/in-progress$/);
    await expect(
      page.getByRole('heading', { name: 'Órdenes de trabajo en curso' }),
    ).toBeVisible();
  });
});

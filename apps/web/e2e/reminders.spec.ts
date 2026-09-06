import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill('admin@taller.com');
  await page.getByLabel('Contraseña').fill('AdminPass123');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 15_000 });
}

test.describe('Maintenance reminders (US-D4)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('dashboard shows reminders widget and nav to full panel', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await expect(
      page.getByRole('heading', { name: 'Recordatorios' }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page
        .getByRole('navigation', { name: 'Administración' })
        .getByRole('link', { name: 'Recordatorios' }),
    ).toBeVisible();

    const emptyState = page.getByText(
      'No hay vehículos pendientes de recordatorio.',
    );
    const viewMore = page.getByRole('link', { name: 'Ver más' });

    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
      await page
        .getByRole('navigation', { name: 'Administración' })
        .getByRole('link', { name: 'Recordatorios' })
        .click();
    } else {
      await expect(viewMore).toBeVisible();
      await viewMore.click();
    }

    await expect(page).toHaveURL(/\/admin\/reminders$/);
    await expect(
      page.getByRole('heading', { name: 'Recordatorios de mantenimiento' }),
    ).toBeVisible();
  });
});

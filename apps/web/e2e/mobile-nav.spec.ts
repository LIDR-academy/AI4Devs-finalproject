import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill('admin@taller.com');
  await page.getByLabel('Contraseña').fill('AdminPass123');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 15_000 });
}

test.describe('Mobile navigation (admin)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('hamburger drawer: navigate, Escape close, no horizontal scroll', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await expect(
      page.getByRole('button', { name: 'Abrir menú' }),
    ).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });
    expect(hasHorizontalOverflow).toBe(false);

    await page.getByRole('button', { name: 'Abrir menú' }).click();
    const drawer = page.getByRole('dialog', { name: 'Administración' });
    await expect(drawer).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Abrir menú' }),
    ).toBeFocused();

    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page
      .getByRole('dialog', { name: 'Administración' })
      .getByRole('link', { name: 'Clientes' })
      .click();

    await expect(page).toHaveURL(/\/clients$/);
    await expect(
      page.getByRole('dialog', { name: 'Administración' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Abrir menú' }),
    ).toBeVisible();
  });
});

test.describe('Desktop navigation (admin)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('shows horizontal nav and hides hamburger', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(
      page.getByRole('button', { name: 'Abrir menú' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('navigation', { name: 'Administración' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Administración' })
        .getByRole('link', { name: 'Panel' }),
    ).toBeVisible();
  });
});

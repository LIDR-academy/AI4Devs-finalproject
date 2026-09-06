import { test, expect } from '@playwright/test';

test.describe('Clients (admin)', () => {
  test('admin visits /clients and sees search bar', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.getByLabel('Buscar cliente')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nuevo cliente' })).toBeVisible();
  });

  test('search with 2+ chars shows results or empty state', async ({ page }) => {
    await page.goto('/clients');
    await page.getByLabel('Buscar cliente').fill('Ju');
    await expect(
      page.getByText(/cliente encontrado|No se encontraron clientes/),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('create new client shows success and vehicle link', async ({ page }) => {
    const suffix = Date.now();
    const fullName = `E2E Client ${suffix}`;

    await page.goto('/clients/new');
    await page.getByLabel('Nombre completo').fill(fullName);
    await page.getByLabel('Identificación').fill(`9-${suffix}`);
    await page.getByLabel('Teléfono (opcional)').fill('88881234');
    await page.getByRole('button', { name: 'Registrar cliente' }).click();

    await expect(page.getByText('Cliente registrado')).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole('link', { name: 'Registrar vehículo' }),
    ).toBeVisible();
  });

  test('duplicate nationalId shows existing client alert', async ({ page }) => {
    await page.goto('/clients/new');
    await page.getByLabel('Nombre completo').fill('Duplicate Test');
    await page.getByLabel('Identificación').fill('1-2345-6789');
    await page.getByLabel('Identificación').blur();

    await expect(
      page.getByText('Ya existe un cliente con esta identificación'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Juan Pérez')).toBeVisible();
  });

  test('new client appears in search after create', async ({ page }) => {
    const suffix = Date.now();
    const fullName = `Searchable E2E ${suffix}`;

    await page.goto('/clients/new');
    await page.getByLabel('Nombre completo').fill(fullName);
    await page.getByLabel('Identificación').fill(`7-${suffix}`);
    await page.getByRole('button', { name: 'Registrar cliente' }).click();
    await expect(page.getByText('Cliente registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.goto('/clients');
    await page.getByLabel('Buscar cliente').fill(fullName);
    await expect(page.getByText(fullName)).toBeVisible({ timeout: 10_000 });
  });

  test('edit existing client updates data in search', async ({ page }) => {
    const suffix = Date.now();
    const fullName = `Editable E2E ${suffix}`;
    const updatedName = `${fullName} Actualizado`;

    await page.goto('/clients/new');
    await page.getByLabel('Nombre completo').fill(fullName);
    await page.getByLabel('Identificación').fill(`5-${suffix}`);
    await page.getByRole('button', { name: 'Registrar cliente' }).click();
    await expect(page.getByText('Cliente registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.goto('/clients');
    await page.getByLabel('Buscar cliente').fill(fullName);
    await expect(page.getByText(fullName)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('link', { name: 'Editar cliente' }).first().click();
    await expect(page.getByRole('heading', { name: 'Editar cliente' })).toBeVisible();

    await page.getByLabel('Nombre completo').fill(updatedName);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Cliente actualizado')).toBeVisible({
      timeout: 10_000,
    });

    await page.goto('/clients');
    await page.getByLabel('Buscar cliente').fill(updatedName);
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Clients (mechanic)', () => {
  test.use({ storageState: 'e2e/.auth/mechanic.json' });

  test('mechanic visits /clients and sees search bar', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.getByLabel('Buscar cliente')).toBeVisible();
  });
});

test.describe('Clients (unauthenticated)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('unauthenticated /clients redirects to login', async ({ page }) => {
    await page.goto('/clients');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Vehicles (admin)', () => {
  test('admin visits /vehicles and sees search bar', async ({ page }) => {
    await page.goto('/vehicles');
    await expect(page.getByLabel('Buscar por placa')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Vehículos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nuevo vehículo' })).toBeVisible();
  });

  test('search with 2+ chars shows results or empty state', async ({ page }) => {
    await page.goto('/vehicles');
    await page.getByLabel('Buscar por placa').fill('AB');
    await expect(
      page.getByText(/vehículo encontrado|No se encontraron vehículos/),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('create vehicle with client picker shows success', async ({ page }) => {
    const suffix = String(Date.now()).slice(-6);
    const plate = `E2E${suffix}`;

    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Toyota');
    await page.getByLabel('Modelo').fill('Yaris');
    await page.getByLabel('Año').fill('2022');

    await page.getByRole('button', { name: 'Buscar propietario' }).click();
    await page.getByLabel('Buscar cliente').fill('Juan');
    await page.getByRole('button', { name: /Juan Pérez/ }).click();

    await page.getByRole('button', { name: 'Registrar vehículo' }).click();

    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole('link', { name: 'Ver ficha' }),
    ).toBeVisible();
  });

  test('prefilled client from query param shows read-only owner', async ({
    page,
  }) => {
    await page.goto('/clients');
    await page.getByLabel('Buscar cliente').fill('Juan');
    await expect(page.getByText('Juan Pérez')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('link', { name: 'Registrar vehículo' }).first().click();
    await expect(page).toHaveURL(/\/vehicles\/new\?clientId=/);
    await expect(page.getByText('Juan Pérez')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Buscar propietario' }),
    ).not.toBeVisible();
  });

  test('create vehicle without owner shows success', async ({ page }) => {
    const suffix = String(Date.now()).slice(-6);
    const plate = `OWN${suffix}`;

    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Honda');
    await page.getByLabel('Modelo').fill('Civic');
    await page.getByLabel('Año').fill('2019');
    await page.getByLabel('Registrar sin propietario').check();
    await expect(
      page.getByRole('button', { name: 'Buscar propietario' }),
    ).not.toBeVisible();

    await page.getByRole('button', { name: 'Registrar vehículo' }).click();

    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('Sin propietario')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Crear orden de trabajo' }),
    ).toBeVisible();
  });

  test('duplicate plate shows existing vehicle alert', async ({ page }) => {
    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill('ABC123');
    await page.getByLabel('Placa').blur();

    await expect(
      page.getByText('Ya existe un vehículo con esta placa'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Toyota')).toBeVisible();
  });

  test('vehicle detail shows header and empty history', async ({ page }) => {
    const suffix = String(Date.now()).slice(-6);
    const plate = `HST${suffix}`;

    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Toyota');
    await page.getByLabel('Modelo').fill('Yaris');
    await page.getByLabel('Año').fill('2018');
    await page.getByRole('button', { name: 'Buscar propietario' }).click();
    await page.getByLabel('Buscar cliente').fill('Juan');
    await page.getByRole('button', { name: /Juan Pérez/ }).click();
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('link', { name: 'Ver ficha' }).click();
    await expect(page.getByRole('heading', { name: plate })).toBeVisible();
    await expect(page.getByText('Propietario actual')).toBeVisible();
    await expect(
      page.getByText('Este vehículo aún no tiene visitas registradas'),
    ).toBeVisible();
  });

  test('edit vehicle updates plate in search', async ({ page }) => {
    const suffix = String(Date.now()).slice(-6);
    const plate = `EDT${suffix}`;
    const newPlate = `FIX${suffix}`;

    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Toyota');
    await page.getByLabel('Modelo').fill('Corolla');
    await page.getByLabel('Año').fill('2020');
    await page.getByRole('button', { name: 'Buscar propietario' }).click();
    await page.getByLabel('Buscar cliente').fill('Juan');
    await page.getByRole('button', { name: /Juan Pérez/ }).click();
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('link', { name: 'Ver ficha' }).click();
    await page.getByRole('link', { name: 'Editar vehículo' }).click();
    await page.getByLabel('Placa').fill(newPlate);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Vehículo actualizado')).toBeVisible({
      timeout: 10_000,
    });

    await page.goto('/vehicles');
    await page.getByLabel('Buscar por placa').fill(newPlate);
    await expect(page.getByText(newPlate.toUpperCase())).toBeVisible({
      timeout: 10_000,
    });
  });

  test('delete vehicle removes it from search', async ({ page }) => {
    const suffix = String(Date.now()).slice(-6);
    const plate = `DEL${suffix}`;

    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Honda');
    await page.getByLabel('Modelo').fill('Civic');
    await page.getByLabel('Año').fill('2019');
    await page.getByRole('button', { name: 'Buscar propietario' }).click();
    await page.getByLabel('Buscar cliente').fill('Juan');
    await page.getByRole('button', { name: /Juan Pérez/ }).click();
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('link', { name: 'Ver ficha' }).click();
    await page.getByRole('button', { name: 'Eliminar vehículo' }).click();
    await page.getByRole('button', { name: 'Eliminar vehículo' }).last().click();

    await expect(page).toHaveURL(/\/vehicles$/, { timeout: 10_000 });
    await page.getByLabel('Buscar por placa').fill(plate);
    await expect(page.getByText('No se encontraron vehículos')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('flow from client create to vehicle registration', async ({ page }) => {
    const suffix = Date.now();
    const fullName = `Vehicle Flow ${suffix}`;

    await page.goto('/clients/new');
    await page.getByLabel('Nombre completo').fill(fullName);
    await page.getByLabel('Identificación').fill(`8-${suffix}`);
    await page.getByRole('button', { name: 'Registrar cliente' }).click();
    await expect(page.getByText('Cliente registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('link', { name: 'Registrar vehículo' }).click();
    await expect(page).toHaveURL(/\/vehicles\/new\?clientId=/);
    await expect(page.getByText(fullName)).toBeVisible();

    const plate = `VF${String(suffix).slice(-6)}`;
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Nissan');
    await page.getByLabel('Modelo').fill('March');
    await page.getByLabel('Año').fill('2019');
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();

    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe('Vehicles (mechanic)', () => {
  test.use({ storageState: 'e2e/.auth/mechanic.json' });

  test('mechanic visits /vehicles and sees search bar', async ({ page }) => {
    await page.goto('/vehicles');
    await expect(page.getByLabel('Buscar por placa')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nuevo vehículo' })).toBeVisible();
  });
});

test.describe('Vehicles (unauthenticated)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('unauthenticated /vehicles redirects to login', async ({ page }) => {
    await page.goto('/vehicles');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});

import { test, expect } from '@playwright/test';

function uniquePlateSuffix(): string {
  return String(Date.now()).slice(-6);
}

async function createVehicle(page: import('@playwright/test').Page): Promise<string> {
  const suffix = uniquePlateSuffix();
  const plate = `WO${suffix}`;

  await page.goto('/vehicles/new');
  await page.getByLabel('Placa').fill(plate);
  await page.getByLabel('Marca').fill('Toyota');
  await page.getByLabel('Modelo').fill('Yaris');
  await page.getByLabel('Año').fill('2021');
  await page.getByRole('button', { name: 'Buscar propietario' }).click();
  await page.getByLabel('Buscar cliente').fill('Juan');
  await page.getByRole('button', { name: /Juan Pérez/ }).click();
  await page.getByRole('button', { name: 'Registrar vehículo' }).click();
  await expect(page.getByText('Vehículo registrado')).toBeVisible({
    timeout: 10_000,
  });

  const createOrderLink = page.getByRole('link', { name: 'Crear orden de trabajo' });
  await expect(createOrderLink).toBeVisible();
  const href = await createOrderLink.getAttribute('href');
  const match = href?.match(/vehicleId=([^&]+)/);
  return match?.[1] ?? '';
}

test.describe('Work orders (admin)', () => {
  test('select vehicle and create work order redirects to detail', async ({
    page,
  }) => {
    const vehicleId = await createVehicle(page);

    await page.goto('/work-orders/new');
    await page.getByLabel('Buscar por placa').fill('WO');
    await expect(page.getByRole('button', { name: 'Seleccionar' }).first()).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: 'Seleccionar' }).first().click();

    await expect(page.getByText('Paso 2 de 2')).toBeVisible();
    await page.getByLabel('Motivo de ingreso').fill('Revisión general del vehículo');
    await page.getByLabel('Kilometraje').fill('45000');
    await page.getByLabel('Tarea 1').fill('Cambio de aceite');
    await page.getByRole('button', { name: 'Crear orden de trabajo' }).click();

    await expect(page).toHaveURL(/\/work-orders\/[0-9a-f-]+$/, { timeout: 10_000 });
    await expect(page.getByText('En proceso')).toBeVisible();
    await expect(page.getByText('Revisión general del vehículo')).toBeVisible();
    await expect(page.getByText('Cambio de aceite')).toBeVisible();
    expect(vehicleId.length).toBeGreaterThan(0);
  });

  test('prefilled vehicleId skips search step', async ({ page }) => {
    const vehicleId = await createVehicle(page);

    await page.goto(`/work-orders/new?vehicleId=${vehicleId}`);
    await expect(page.getByText('Paso 2 de 2')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Vehículo seleccionado')).toBeVisible();
  });

  test('vehicle with active work order shows banner and blocks form', async ({
    page,
  }) => {
    const vehicleId = await createVehicle(page);

    await page.goto(`/work-orders/new?vehicleId=${vehicleId}`);
    await page.getByLabel('Motivo de ingreso').fill('Primera orden activa del vehículo');
    await page.getByLabel('Kilometraje').fill('30000');
    await page.getByLabel('Tarea 1').fill('Inspección inicial');
    await page.getByRole('button', { name: 'Crear orden de trabajo' }).click();
    await expect(page).toHaveURL(/\/work-orders\/[0-9a-f-]+$/, { timeout: 10_000 });

    await page.goto(`/work-orders/new?vehicleId=${vehicleId}`);
    await expect(
      page.getByText('Este vehículo ya tiene una orden de trabajo activa.'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('link', { name: 'Ver orden de trabajo' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Crear orden de trabajo' }),
    ).toBeDisabled();
  });

  test('submit without valid task description shows validation error', async ({
    page,
  }) => {
    const vehicleId = await createVehicle(page);

    await page.goto(`/work-orders/new?vehicleId=${vehicleId}`);
    await page.getByLabel('Motivo de ingreso').fill('Validación de tareas vacías');
    await page.getByLabel('Kilometraje').fill('12000');
    await page.getByLabel('Tarea 1').fill('ab');
    await page.getByRole('button', { name: 'Crear orden de trabajo' }).click();

    await expect(page.getByText('Mínimo 3 caracteres')).toBeVisible();
  });

  test('create work order then vehicle history shows visit', async ({ page }) => {
    const vehicleId = await createVehicle(page);
    const entryReason = `Historial E2E ${uniquePlateSuffix()}`;

    await page.goto(`/work-orders/new?vehicleId=${vehicleId}`);
    await page.getByLabel('Motivo de ingreso').fill(entryReason);
    await page.getByLabel('Kilometraje').fill('88000');
    await page.getByLabel('Tarea 1').fill('Prueba de batería');
    await page.getByRole('button', { name: 'Crear orden de trabajo' }).click();
    await expect(page).toHaveURL(/\/work-orders\/[0-9a-f-]+$/, { timeout: 10_000 });

    await page.goto(`/vehicles/${vehicleId}`);
    await expect(page.getByText(entryReason)).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText('Este vehículo aún no tiene visitas registradas'),
    ).not.toBeVisible();
  });

  test('no results shows register vehicle CTA', async ({ page }) => {
    await page.goto('/work-orders/new');
    await page.getByLabel('Buscar por placa').fill('ZZZZZZ');
    await expect(page.getByText('No se encontraron vehículos')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('link', { name: 'Registrar vehículo' }).click();
    await expect(page).toHaveURL('/vehicles/new');
  });

  test('vehicle detail shows nueva OT or ver orden activa', async ({ page }) => {
    const vehicleId = await createVehicle(page);

    await page.goto(`/vehicles/${vehicleId}`);
    await expect(
      page.getByRole('link', { name: 'Nueva orden de trabajo' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Nueva orden de trabajo' }).click();
    await expect(page).toHaveURL(`/work-orders/new?vehicleId=${vehicleId}`);
  });
});

test.describe('Work orders (mechanic)', () => {
  test.use({ storageState: 'e2e/.auth/mechanic.json' });

  test('mechanic can open new work order page', async ({ page }) => {
    await page.goto('/work-orders/new');
    await expect(
      page.getByRole('heading', { name: 'Nueva orden de trabajo' }),
    ).toBeVisible();
    await expect(page.getByLabel('Buscar por placa')).toBeVisible();
  });
});

test.describe('Work orders (unauthenticated)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('unauthenticated /work-orders/new redirects to login', async ({ page }) => {
    await page.goto('/work-orders/new');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});

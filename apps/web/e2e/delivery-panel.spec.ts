import { test, expect } from '@playwright/test';

function uniquePlateSuffix(): string {
  return String(Date.now()).slice(-6);
}

async function completeAllTasksOnWorkOrder(page: import('@playwright/test').Page) {
  const completeButtons = page.getByRole('button', { name: 'Completar' });
  const count = await completeButtons.count();

  for (let index = 0; index < count; index += 1) {
    await completeButtons.first().click();
    await page.getByRole('spinbutton', { name: 'Costo' }).fill('10000');
    await page.getByRole('button', { name: 'Completar tarea' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
  }

  await expect(
    page.getByText('Lista para entrega — todas las tareas están completadas.'),
  ).toBeVisible({ timeout: 10_000 });
}

async function createReadyWorkOrder(
  page: import('@playwright/test').Page,
  options?: { ownerSearch?: string; ownerPattern?: RegExp; zeroCost?: boolean },
): Promise<{ plate: string }> {
  const suffix = uniquePlateSuffix();
  const plate = `DP${suffix}`;
  const ownerSearch = options?.ownerSearch ?? 'Juan';
  const ownerPattern = options?.ownerPattern ?? /Juan/;

  await page.goto('/vehicles/new');
  await page.getByLabel('Placa').fill(plate);
  await page.getByLabel('Marca').fill('Toyota');
  await page.getByLabel('Modelo').fill('Yaris');
  await page.getByLabel('Año').fill('2021');
  await page.getByRole('button', { name: 'Buscar propietario' }).click();
  await page.getByLabel('Buscar cliente').fill(ownerSearch);
  await page.getByRole('button', { name: ownerPattern }).first().click();
  await page.getByRole('button', { name: 'Registrar vehículo' }).click();
  await expect(page.getByText('Vehículo registrado')).toBeVisible({
    timeout: 10_000,
  });

  await page.getByRole('link', { name: 'Crear orden de trabajo' }).click();
  await page.getByLabel('Motivo de ingreso').fill('Prueba panel de entrega');
  await page.getByLabel('Kilometraje').fill('48000');
  await page.getByLabel('Tarea 1').fill('Revisión general');
  await page.getByRole('button', { name: 'Agregar tarea' }).click();
  await page.getByLabel('Tarea 2').fill('Cambio de aceite');
  await page.getByRole('button', { name: 'Crear orden de trabajo' }).click();
  await expect(page).toHaveURL(/\/work-orders\/[0-9a-f-]+$/, { timeout: 10_000 });

  if (options?.zeroCost) {
    const completeButtons = page.getByRole('button', { name: 'Completar' });
    const count = await completeButtons.count();

    for (let index = 0; index < count; index += 1) {
      await completeButtons.first().click();
      await page.getByRole('spinbutton', { name: 'Costo' }).fill('0');
      await page.getByRole('button', { name: 'Completar tarea' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    }

    await expect(
      page.getByText('Lista para entrega — todas las tareas están completadas.'),
    ).toBeVisible({ timeout: 10_000 });
  } else {
    await completeAllTasksOnWorkOrder(page);
  }

  return { plate };
}

test.describe('Delivery panel (admin)', () => {
  test('admin opens delivery panel and sees table', async ({ page }) => {
    const { plate } = await createReadyWorkOrder(page);

    await page.goto('/admin/delivery');
    await expect(page.getByRole('heading', { name: 'Listos para entrega' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Teléfono' })).toBeVisible();
    await expect(page.getByText(plate)).toBeVisible({ timeout: 10_000 });
  });

  test('row shows phone column with tel link when phone exists', async ({ page }) => {
    const { plate } = await createReadyWorkOrder(page);

    await page.goto('/admin/delivery');
    const row = page.locator('tr', { hasText: plate });
    const phoneLink = row.getByRole('link', { name: /Llamar al/i });
    await expect(phoneLink).toBeVisible({ timeout: 10_000 });
    await expect(phoneLink).toHaveAttribute('href', /^tel:\d+$/);
  });

  test('row without phone shows Sin teléfono', async ({ page }) => {
    await createReadyWorkOrder(page, {
      ownerSearch: 'Carlos',
      ownerPattern: /Carlos Ruiz/,
    });

    await page.goto('/admin/delivery');
    await expect(page.getByTestId('owner-phone-empty').first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('Sin teléfono').first()).toBeVisible();
  });

  test('expand row shows task breakdown and total', async ({ page }) => {
    const { plate } = await createReadyWorkOrder(page);

    await page.goto('/admin/delivery');
    const row = page.locator('tr', { hasText: plate });
    await row.getByRole('button', { name: 'Ver detalle' }).click();

    await expect(page.getByText('Desglose de tareas')).toBeVisible();
    await expect(page.getByText('Revisión general')).toBeVisible();
    await expect(page.getByText('Total a cobrar:')).toBeVisible();
    await expect(page.getByText(/Total a cobrar:.*₡20/)).toBeVisible();
  });

  test('mark owner contacted keeps row and allows deliver', async ({ page }) => {
    const { plate } = await createReadyWorkOrder(page);

    await page.goto('/admin/delivery');
    await expect(page.getByText(plate)).toBeVisible({ timeout: 10_000 });

    const row = page.locator('tr', { hasText: plate });
    await expect(row.getByText('Lista para entrega')).toBeVisible();
    await row.getByRole('button', { name: 'Ver detalle' }).click();
    await page
      .getByRole('button', { name: 'Marcar propietario contactado' })
      .click();
    await page.getByRole('button', { name: 'Confirmar contacto' }).click();

    await expect(
      page.getByText('Propietario marcado como contactado'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(plate)).toBeVisible();
    await expect(row.getByText('Propietario contactado')).toBeVisible();

    await page.getByRole('button', { name: 'Contactados' }).click();
    await expect(page.getByText(plate)).toBeVisible();
    await page.getByRole('button', { name: 'Pendiente de contacto' }).click();
    await expect(page.getByText(plate)).not.toBeVisible();
    await page.getByRole('button', { name: 'Todos' }).click();

    const contactedRow = page.locator('tr', { hasText: plate });
    await contactedRow.getByRole('button', { name: 'Ver detalle' }).click();
    await page.getByRole('button', { name: 'Marcar como entregada' }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await expect(page.getByText('Vehículo marcado como entregado')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(plate)).not.toBeVisible({ timeout: 10_000 });
  });

  test('mark delivered removes row from list', async ({ page }) => {
    const { plate } = await createReadyWorkOrder(page);

    await page.goto('/admin/delivery');
    await expect(page.getByText(plate)).toBeVisible({ timeout: 10_000 });

    const row = page.locator('tr', { hasText: plate });
    await row.getByRole('button', { name: 'Ver detalle' }).click();
    await page.getByRole('button', { name: 'Marcar como entregada' }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await expect(page.getByText('Vehículo marcado como entregado')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(plate)).not.toBeVisible({ timeout: 10_000 });
  });

  test('ownerless third-party ready OT shows Sin propietario and hides mark contacted', async ({
    page,
  }) => {
    const suffix = uniquePlateSuffix();
    const plate = `D9${suffix}`;

    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Kia');
    await page.getByLabel('Modelo').fill('Rio');
    await page.getByLabel('Año').fill('2021');
    await page.getByLabel('Registrar sin propietario').check();
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('link', { name: 'Crear orden de trabajo' }).click();
    await page.getByLabel('Nombre de quien lo trae').fill('Mecánico Externo');
    await page.getByLabel('Motivo de ingreso').fill('Reparación enviada por taller');
    await page.getByLabel('Tarea 1').fill('Cambio de frenos');
    await page.getByRole('button', { name: 'Crear orden de trabajo' }).click();
    await expect(page).toHaveURL(/\/work-orders\/[0-9a-f-]+$/, { timeout: 10_000 });

    await completeAllTasksOnWorkOrder(page);

    await page.goto('/admin/delivery');
    await expect(page.getByText(plate)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Sin propietario').first()).toBeVisible();

    await page.getByRole('button', { name: 'Ver detalle' }).first().click();
    await expect(page.getByText(/Traído por: Mecánico Externo/)).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole('button', { name: 'Marcar propietario contactado' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Marcar como entregada' }),
    ).toBeVisible();
  });

  test('refetch button updates list', async ({ page }) => {
    await createReadyWorkOrder(page);

    await page.goto('/admin/delivery');
    await expect(page.getByRole('button', { name: 'Actualizar' })).toBeVisible();
    await page.getByRole('button', { name: 'Actualizar' }).click();
    await expect(page.getByRole('columnheader', { name: 'Placa' })).toBeVisible();
  });

  test('totalAmount zero shows ₡0', async ({ page }) => {
    await createReadyWorkOrder(page, { zeroCost: true });

    await page.goto('/admin/delivery');
    await expect(page.getByText('₡0').first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Delivery panel (mechanic)', () => {
  test.use({ storageState: 'e2e/.auth/mechanic.json' });

  test('mechanic cannot access delivery panel', async ({ page }) => {
    await page.goto('/admin/delivery');
    await expect(page).toHaveURL(/\/403$/, { timeout: 10_000 });
  });
});

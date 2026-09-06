import { test, expect } from '@playwright/test';

function uniquePlateSuffix(): string {
  return String(Date.now()).slice(-6);
}

async function createWorkOrderWithTwoTasks(
  page: import('@playwright/test').Page,
): Promise<{ workOrderUrl: string; vehicleId: string }> {
  const suffix = uniquePlateSuffix();
  const plate = `NT${suffix}`;

  await page.goto('/vehicles/new');
  await page.getByLabel('Placa').fill(plate);
  await page.getByLabel('Marca').fill('Toyota');
  await page.getByLabel('Modelo').fill('Yaris');
  await page.getByLabel('Año').fill('2021');
  await page.getByRole('button', { name: 'Buscar propietario' }).click();
  await page.getByLabel('Buscar cliente').fill('Juan');
  await page.getByRole('button', { name: /Juan/ }).first().click();
  await page.getByRole('button', { name: 'Registrar vehículo' }).click();
  await expect(page.getByText('Vehículo registrado')).toBeVisible({
    timeout: 10_000,
  });

  const vehicleUrl = page.url();
  const vehicleId = vehicleUrl.split('/').pop() ?? '';

  await page.getByRole('link', { name: 'Crear orden de trabajo' }).click();
  await page.getByLabel('Motivo de ingreso').fill('Prueba de notas técnicas');
  await page.getByLabel('Kilometraje').fill('60000');
  await page.getByLabel('Tarea 1').fill('Revisar frenos');
  await page.getByRole('button', { name: 'Agregar tarea' }).click();
  await page.getByLabel('Tarea 2').fill('Cambiar pastillas');
  await page.getByRole('button', { name: 'Crear orden de trabajo' }).click();

  await expect(page).toHaveURL(/\/work-orders\/[0-9a-f-]+$/, { timeout: 10_000 });

  return { workOrderUrl: page.url(), vehicleId };
}

test.describe('Technical notes (admin)', () => {
  test('save task notes on pending task shows success toast', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    const taskRow = page.locator('li', { hasText: 'Revisar frenos' });
    await taskRow.getByText('Detalles técnicos').click();
    await taskRow.getByLabel('Diagnóstico').fill('Pastillas desgastadas');
    await taskRow.getByRole('button', { name: 'Guardar notas' }).click();

    await expect(page.getByText('Notas guardadas')).toBeVisible({
      timeout: 10_000,
    });

    await page.reload();
    await page.locator('li', { hasText: 'Revisar frenos' }).getByText('Detalles técnicos').click();
    await expect(page.getByText('Pastillas desgastadas')).toBeVisible();
  });

  test('complete task without notes still works', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    const taskRow = page.locator('li', { hasText: 'Revisar frenos' });
    await taskRow.getByRole('button', { name: 'Completar' }).click();
    await page.getByRole('spinbutton', { name: 'Costo' }).fill('12000');
    await page.getByRole('button', { name: 'Completar tarea' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    await expect(taskRow.getByText('Completada')).toBeVisible();
  });

  test('completed task technical section is read-only', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    const taskRow = page.locator('li', { hasText: 'Revisar frenos' });
    await taskRow.getByRole('button', { name: 'Completar' }).click();
    await page.getByRole('spinbutton', { name: 'Costo' }).fill('8000');
    await page.getByRole('button', { name: 'Completar tarea' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });

    await taskRow.getByText('Detalles técnicos').click();
    await expect(taskRow.getByRole('button', { name: 'Guardar notas' })).not.toBeVisible();
    await expect(taskRow.getByText('Sin registro').first()).toBeVisible();
  });

  test('save visit notes on in-progress work order', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    await page.getByLabel('Diagnóstico general').fill('Inspección general de frenos');
    await page.getByRole('button', { name: 'Guardar notas de visita' }).click();

    await expect(page.getByText('Notas de visita guardadas')).toBeVisible({
      timeout: 10_000,
    });

    await page.reload();
    await expect(page.getByLabel('Diagnóstico general')).toHaveValue(
      'Inspección general de frenos',
    );
  });

  test('lista para entrega makes visit and task notes read-only', async ({
    page,
  }) => {
    await createWorkOrderWithTwoTasks(page);

    for (const taskName of ['Revisar frenos', 'Cambiar pastillas']) {
      const taskRow = page.locator('li', { hasText: taskName });
      await taskRow.getByRole('button', { name: 'Completar' }).click();
      await page.getByRole('spinbutton', { name: 'Costo' }).fill('5000');
      await page.getByRole('button', { name: 'Completar tarea' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    }

    await expect(
      page.getByText('Lista para entrega — todas las tareas están completadas.'),
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Guardar notas de visita' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Guardar notas' }),
    ).not.toBeVisible();
  });

  test('save empty task notes clears to sin registro', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    const taskRow = page.locator('li', { hasText: 'Revisar frenos' });
    await taskRow.getByText('Detalles técnicos').click();
    await taskRow.getByLabel('Diagnóstico').fill('Temporal');
    await taskRow.getByRole('button', { name: 'Guardar notas' }).click();
    await expect(page.getByText('Notas guardadas')).toBeVisible({ timeout: 10_000 });

    await taskRow.getByLabel('Diagnóstico').fill('');
    await taskRow.getByRole('button', { name: 'Guardar notas' }).click();
    await expect(page.getByText('Notas guardadas')).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await taskRow.getByText('Detalles técnicos').click();
    await expect(taskRow.getByText('Sin registro').first()).toBeVisible();
  });

  test('vehicle history shows saved technical notes read-only', async ({
    page,
  }) => {
    const { vehicleId } = await createWorkOrderWithTwoTasks(page);

    const taskRow = page.locator('li', { hasText: 'Revisar frenos' });
    await taskRow.getByText('Detalles técnicos').click();
    await taskRow.getByLabel('Diagnóstico').fill('Historial visible');
    await taskRow.getByRole('button', { name: 'Guardar notas' }).click();
    await expect(page.getByText('Notas guardadas')).toBeVisible({ timeout: 10_000 });

    await page.getByLabel('Diagnóstico general').fill('Nota de visita en historial');
    await page.getByRole('button', { name: 'Guardar notas de visita' }).click();
    await expect(page.getByText('Notas de visita guardadas')).toBeVisible({
      timeout: 10_000,
    });

    await page.goto(`/vehicles/${vehicleId}#historial`);
    await page.getByText('Detalle técnico').click();
    await expect(page.getByText('Historial visible')).toBeVisible();
    await expect(page.getByText('Nota de visita en historial')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Guardar notas' }),
    ).not.toBeVisible();
  });
});

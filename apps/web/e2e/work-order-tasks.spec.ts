import { test, expect } from '@playwright/test';

function uniquePlateSuffix(): string {
  return String(Date.now()).slice(-6);
}

async function createWorkOrderWithTwoTasks(
  page: import('@playwright/test').Page,
): Promise<string> {
  const suffix = uniquePlateSuffix();
  const plate = `TK${suffix}`;

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

  await page.getByRole('link', { name: 'Crear orden de trabajo' }).click();
  await page.getByLabel('Motivo de ingreso').fill('Prueba de gestión de tareas');
  await page.getByLabel('Kilometraje').fill('55000');
  await page.getByLabel('Tarea 1').fill('Revisar frenos');
  await page.getByRole('button', { name: 'Agregar tarea' }).click();
  await page.getByLabel('Tarea 2').fill('Cambiar pastillas');
  await page.getByRole('button', { name: 'Crear orden de trabajo' }).click();

  await expect(page).toHaveURL(/\/work-orders\/[0-9a-f-]+$/, { timeout: 10_000 });
  return page.url();
}

test.describe('Work order tasks (admin)', () => {
  test('open work order shows two tasks', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    await expect(page.getByText('Revisar frenos')).toBeVisible();
    await expect(page.getByText('Cambiar pastillas')).toBeVisible();
    await expect(page.getByText('Pendiente').first()).toBeVisible();
  });

  test('add third task appears as pending', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    await page.getByRole('button', { name: 'Agregar tarea' }).click();
    await page.getByLabel('Descripción').fill('Balancear llantas');
    await page.getByRole('button', { name: 'Agregar tarea' }).last().click();

    await expect(page.getByText('Balancear llantas')).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText('Balancear llantas').locator('..').getByText('Pendiente'),
    ).toBeVisible();
  });

  test('start task updates badge to in progress', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    const taskRow = page.locator('li', { hasText: 'Revisar frenos' });
    await taskRow.getByRole('button', { name: 'Iniciar' }).click();

    await expect(taskRow.getByText('En progreso')).toBeVisible({ timeout: 10_000 });
  });

  test('complete task with cost updates total amount', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    const taskRow = page.locator('li', { hasText: 'Revisar frenos' });
    await taskRow.getByRole('button', { name: 'Completar' }).click();
    await page.getByRole('spinbutton', { name: 'Costo' }).fill('15000');
    await page.getByRole('button', { name: 'Completar tarea' }).click();

    await expect(taskRow.getByText('En progreso')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Completada').first()).toBeVisible();
    await expect(page.getByText('₡15')).toBeVisible();
  });

  test('complete all tasks shows ready for delivery banner', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    for (const taskName of ['Revisar frenos', 'Cambiar pastillas']) {
      const taskRow = page.locator('li', { hasText: taskName });
      await taskRow.getByRole('button', { name: 'Completar' }).click();
      await page.getByRole('spinbutton', { name: 'Costo' }).fill('10000');
      await page.getByRole('button', { name: 'Completar tarea' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
    }

    await expect(
      page.getByText('Lista para entrega — todas las tareas están completadas.'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Lista para entrega').first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Agregar tarea' }),
    ).not.toBeVisible();
  });

  test('complete without cost shows validation error', async ({ page }) => {
    await createWorkOrderWithTwoTasks(page);

    const taskRow = page.locator('li', { hasText: 'Revisar frenos' });
    await taskRow.getByRole('button', { name: 'Completar' }).click();

    await expect(
      page.getByRole('button', { name: 'Completar tarea' }),
    ).toBeDisabled();
    await page.getByRole('spinbutton', { name: 'Costo' }).fill('-1');
    await expect(
      page.getByText(/costo debe ser 0 o mayor/i),
    ).toBeVisible();
  });
});

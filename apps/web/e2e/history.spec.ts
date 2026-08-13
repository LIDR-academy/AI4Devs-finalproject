import { test, expect } from '@playwright/test';

function uniquePlateSuffix(): string {
  return String(Date.now()).slice(-6);
}

test.describe('History (admin)', () => {
  test('search vehicle and open ficha shows historial section', async ({ page }) => {
    const suffix = uniquePlateSuffix();
    const plate = `HS${suffix}`;

    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Toyota');
    await page.getByLabel('Modelo').fill('Corolla');
    await page.getByLabel('Año').fill('2020');
    await page.getByRole('button', { name: 'Buscar propietario' }).click();
    await page.getByLabel('Buscar cliente').fill('Juan');
    await page.getByRole('button', { name: /Juan/ }).first().click();
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.goto('/vehicles');
    await page.getByLabel('Buscar por placa').fill(plate);
    await page.getByRole('button', { name: 'Ver ficha' }).click();

    await expect(page.getByRole('heading', { name: 'Historial de visitas' })).toBeVisible();
    await expect(
      page.getByText('Este vehículo aún no tiene visitas registradas').or(
        page.getByText('Visita de historial E2E'),
      ),
    ).toBeVisible();
  });

  test('expand visit shows tasks and technical notes', async ({ page }) => {
    const suffix = uniquePlateSuffix();
    const plate = `HX${suffix}`;

    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Honda');
    await page.getByLabel('Modelo').fill('Fit');
    await page.getByLabel('Año').fill('2019');
    await page.getByRole('button', { name: 'Buscar propietario' }).click();
    await page.getByLabel('Buscar cliente').fill('Juan');
    await page.getByRole('button', { name: /Juan/ }).first().click();
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('link', { name: 'Crear orden de trabajo' }).click();
    await page.getByLabel('Motivo de ingreso').fill('Expand historial test');
    await page.getByLabel('Kilometraje').fill('42000');
    await page.getByLabel('Tarea 1').fill('Cambio de aceite');
    await page.getByRole('button', { name: 'Crear orden de trabajo' }).click();

    await page.goto('/vehicles');
    await page.getByLabel('Buscar por placa').fill(plate);
    await page.getByRole('button', { name: 'Ver ficha' }).click();

    await page.getByRole('button', { name: /Expand historial test/i }).click();
    await expect(page.getByText('Cambio de aceite')).toBeVisible();
    await expect(page.getByText('Notas técnicas')).toBeVisible();
    await expect(page.getByText('Continuar OT')).toBeVisible();
  });

  test('empty vehicle history shows create work order CTA', async ({ page }) => {
    const suffix = uniquePlateSuffix();
    const plate = `HE${suffix}`;

    await page.goto('/vehicles/new');
    await page.getByLabel('Placa').fill(plate);
    await page.getByLabel('Marca').fill('Kia');
    await page.getByLabel('Modelo').fill('Rio');
    await page.getByLabel('Año').fill('2018');
    await page.getByRole('button', { name: 'Buscar propietario' }).click();
    await page.getByLabel('Buscar cliente').fill('Juan');
    await page.getByRole('button', { name: /Juan/ }).first().click();
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByText('Vehículo registrado')).toBeVisible({
      timeout: 10_000,
    });

    await page.goto('/vehicles');
    await page.getByLabel('Buscar por placa').fill(plate);
    await page.getByRole('button', { name: 'Ver ficha' }).click();

    await expect(
      page.getByText('Este vehículo aún no tiene visitas registradas'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Crear orden de trabajo' }),
    ).toBeVisible();
  });

  test('search client opens profile with vehicles list', async ({ page }) => {
    await page.goto('/clients');
    await page.getByLabel('Buscar cliente').fill('Juan');
    await page.getByRole('button', { name: 'Ver cliente' }).first().click();

    await expect(page).toHaveURL(/\/clients\/[0-9a-f-]+$/);
    await expect(page.getByRole('heading', { name: /Juan/i })).toBeVisible();
    await expect(page.getByText('Vehículos del cliente')).toBeVisible();
  });

  test('ver historial from client vehicle navigates to historial anchor', async ({
    page,
  }) => {
    await page.goto('/clients');
    await page.getByLabel('Buscar cliente').fill('Juan');
    await page.getByRole('button', { name: 'Ver cliente' }).first().click();

    const historyLink = page.getByRole('link', { name: 'Ver historial' }).first();
    await expect(historyLink).toBeVisible({ timeout: 10_000 });
    await historyLink.click();

    await expect(page).toHaveURL(/#historial$/);
    await expect(page.getByRole('heading', { name: 'Historial de visitas' })).toBeVisible();
  });
});

test.describe('History (mechanic)', () => {
  test.use({ storageState: 'e2e/.auth/mechanic.json' });

  test('mechanic can access vehicle history and client profile', async ({ page }) => {
    await page.goto('/vehicles');
    await expect(page.getByLabel('Buscar por placa')).toBeVisible();

    await page.goto('/clients');
    await page.getByLabel('Buscar cliente').fill('Juan');
    await expect(page.getByRole('button', { name: 'Ver cliente' }).first()).toBeVisible();
  });
});

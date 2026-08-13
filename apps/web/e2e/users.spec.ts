import { expect, test } from '@playwright/test';

async function gotoUsersAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/admin/users');
  await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible({
    timeout: 15_000,
  });
}

test.describe('User management', () => {
  test('admin can view users table', async ({ page }) => {
    await gotoUsersAsAdmin(page);
    await expect(page.getByRole('table')).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'admin@taller.com', exact: true }),
    ).toBeVisible();
  });

  test('mechanic cannot access users page', async ({ browser }) => {
    const uniqueEmail = `mechanic.access.${Date.now()}@taller.com`;
    const password = 'MechanicAccess1';
    const adminContext = await browser.newContext({
      storageState: 'e2e/.auth/admin.json',
    });
    const adminPage = await adminContext.newPage();

    try {
      await gotoUsersAsAdmin(adminPage);
      await adminPage.getByRole('button', { name: 'Nuevo usuario' }).click();
      await adminPage.getByLabel('Nombre completo').fill('Mecánico Acceso');
      await adminPage.getByLabel('Correo electrónico').fill(uniqueEmail);
      await adminPage.getByLabel('Contraseña temporal').fill(password);
      await adminPage.getByRole('button', { name: 'Crear usuario' }).click();
      await expect(adminPage.getByText('Usuario creado correctamente')).toBeVisible();
      await expect(adminPage.getByText(uniqueEmail)).toBeVisible();
    } finally {
      await adminContext.close();
    }

    const mechanicContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await mechanicContext.newPage();

    try {
      await page.goto('/login');
      await page.getByLabel('Correo electrónico').fill(uniqueEmail);
      await page.getByLabel('Contraseña').fill(password);
      await page.getByRole('button', { name: 'Iniciar sesión' }).click();
      await expect(page).toHaveURL(/\/mechanic\/dashboard$/, { timeout: 15_000 });

      await page.goto('/admin/users');
      await expect(page).toHaveURL(/\/403$/, { timeout: 10_000 });
    } finally {
      await mechanicContext.close();
    }
  });

  test('admin can create a mechanic', async ({ page }) => {
    const uniqueEmail = `mecanico.${Date.now()}@taller.com`;

    await gotoUsersAsAdmin(page);
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await page.getByLabel('Nombre completo').fill('Mecánico E2E');
    await page.getByLabel('Correo electrónico').fill(uniqueEmail);
    await page.getByLabel('Contraseña temporal').fill('MechanicE2E123');
    await page.getByRole('button', { name: 'Crear usuario' }).click();

    await expect(page.getByText('Usuario creado correctamente')).toBeVisible();
    await expect(page.getByText(uniqueEmail)).toBeVisible();
  });

  test('shows error for duplicate email', async ({ page }) => {
    await gotoUsersAsAdmin(page);
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await page.getByLabel('Nombre completo').fill('Duplicado');
    await page.getByLabel('Correo electrónico').fill('mechanic@taller.com');
    await page.getByLabel('Contraseña temporal').fill('DuplicatePass1');
    await page.getByRole('button', { name: 'Crear usuario' }).click();

    await expect(
      page.getByText('Este correo ya está registrado'),
    ).toBeVisible();
  });

  test('admin can deactivate a user', async ({ page }) => {
    const uniqueEmail = `deactivate.${Date.now()}@taller.com`;

    await gotoUsersAsAdmin(page);
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await page.getByLabel('Nombre completo').fill('Usuario Temporal');
    await page.getByLabel('Correo electrónico').fill(uniqueEmail);
    await page.getByLabel('Contraseña temporal').fill('TempUserPass1');
    await page.getByRole('button', { name: 'Crear usuario' }).click();
    await expect(page.getByText(uniqueEmail)).toBeVisible();

    const row = page.getByRole('row', { name: new RegExp(uniqueEmail) });
    await row.getByRole('button', { name: 'Desactivar' }).click();
    await page.getByRole('button', { name: 'Desactivar' }).last().click();

    await expect(page.getByText('Usuario desactivado correctamente')).toBeVisible();
    await expect(row.getByText('Inactivo')).toBeVisible();
  });

  test('deactivated user cannot login', async ({ page, request }) => {
    const uniqueEmail = `blocked.${Date.now()}@taller.com`;
    const password = 'BlockedUser123';

    await gotoUsersAsAdmin(page);
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await page.getByLabel('Nombre completo').fill('Usuario Bloqueado');
    await page.getByLabel('Correo electrónico').fill(uniqueEmail);
    await page.getByLabel('Contraseña temporal').fill(password);
    await page.getByRole('button', { name: 'Crear usuario' }).click();
    await expect(page.getByText(uniqueEmail)).toBeVisible();

    const row = page.getByRole('row', { name: new RegExp(uniqueEmail) });
    await row.getByRole('button', { name: 'Desactivar' }).click();
    await page.getByRole('button', { name: 'Desactivar' }).last().click();
    await expect(page.getByText('Usuario desactivado correctamente')).toBeVisible();

    const response = await request.post('http://localhost:4000/api/auth/login', {
      data: { email: uniqueEmail, password },
    });

    expect(response.status()).toBe(403);
    const body = (await response.json()) as { message?: string };
    expect(body.message).toMatch(/inactive/i);
  });

  test('admin can create admin with canActAsMechanic badge', async ({ page }) => {
    const uniqueEmail = `admin.mechanic.${Date.now()}@taller.com`;

    await gotoUsersAsAdmin(page);
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await page.getByLabel('Nombre completo').fill('Admin Mecánico E2E');
    await page.getByLabel('Correo electrónico').fill(uniqueEmail);
    await page.getByLabel('Contraseña temporal').fill('AdminMechanic1');
    await page.getByLabel('Rol').selectOption('ADMIN');
    await page
      .getByLabel('También puede realizar trabajo de mecánico')
      .check();
    await page.getByRole('button', { name: 'Crear usuario' }).click();

    await expect(page.getByText('Usuario creado correctamente')).toBeVisible();
    const row = page.getByRole('row', { name: new RegExp(uniqueEmail) });
    await expect(row.getByText('Admin · Mecánico')).toBeVisible();
  });

  test('admin can edit user full name', async ({ page }) => {
    const uniqueEmail = `editable.${Date.now()}@taller.com`;
    const updatedName = `Nombre Editado ${Date.now()}`;

    await gotoUsersAsAdmin(page);
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await page.getByLabel('Nombre completo').fill('Usuario Editable');
    await page.getByLabel('Correo electrónico').fill(uniqueEmail);
    await page.getByLabel('Contraseña temporal').fill('EditablePass1');
    await page.getByRole('button', { name: 'Crear usuario' }).click();
    await expect(page.getByText(uniqueEmail)).toBeVisible();

    const row = page.getByRole('row', { name: new RegExp(uniqueEmail) });
    await row.getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Nombre completo').fill(updatedName);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Usuario actualizado')).toBeVisible();
    await expect(page.getByRole('cell', { name: updatedName })).toBeVisible();
  });

  test('edit duplicate email shows Spanish error', async ({ page }) => {
    const uniqueEmail = `dup.edit.${Date.now()}@taller.com`;

    await gotoUsersAsAdmin(page);
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await page.getByLabel('Nombre completo').fill('Dup Edit Target');
    await page.getByLabel('Correo electrónico').fill(uniqueEmail);
    await page.getByLabel('Contraseña temporal').fill('DupEditPass1');
    await page.getByRole('button', { name: 'Crear usuario' }).click();
    await expect(page.getByText(uniqueEmail)).toBeVisible();

    const row = page.getByRole('row', { name: new RegExp(uniqueEmail) });
    await row.getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Correo electrónico').fill('admin@taller.com');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Este correo ya está registrado')).toBeVisible();
  });
});

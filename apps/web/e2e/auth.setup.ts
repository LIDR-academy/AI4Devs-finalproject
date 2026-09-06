import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '@playwright/test';

const authDir = path.join(__dirname, '.auth');
const adminAuthFile = path.join(authDir, 'admin.json');

setup('authenticate as admin', async ({ page }) => {
  mkdirSync(authDir, { recursive: true });

  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill('admin@taller.com');
  await page.getByLabel('Contraseña').fill('AdminPass123');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 15_000 });

  await page.context().storageState({ path: adminAuthFile });
});

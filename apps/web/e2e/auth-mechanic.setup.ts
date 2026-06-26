import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '@playwright/test';

const authDir = path.join(__dirname, '.auth');
const mechanicAuthFile = path.join(authDir, 'mechanic.json');

setup('authenticate as mechanic', async ({ page }) => {
  mkdirSync(authDir, { recursive: true });

  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill('mechanic@taller.com');
  await page.getByLabel('Contraseña').fill('MechanicPass123');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/mechanic\/dashboard$/, { timeout: 15_000 });

  await page.context().storageState({ path: mechanicAuthFile });
});

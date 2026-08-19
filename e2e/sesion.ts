import { expect, type APIRequestContext, type Page } from "./fixtures";

/**
 * Inicio de sesión compartido por los recorridos E2E. Vive fuera de las pruebas
 * porque lo usan tanto el circuito completo como la auditoría de accesibilidad, y
 * duplicarlo garantizaría que un día se cambie el formulario y solo se arregle uno.
 */

/** La contraseña de todas las cuentas sembradas (`prisma/seed.ts`). */
export const PASSWORD = "clickoteca";

/** Inicia sesión por la interfaz, como lo haría una persona. */
export async function login(page: Page, email: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/(portal|backoffice)/);
}

/** Inicia sesión por API, para preparar estado sin pasar por la interfaz. */
export async function apiLogin(request: APIRequestContext, email: string): Promise<void> {
  const response = await request.post("/api/auth/login", {
    data: { email, password: PASSWORD },
  });
  expect(response.ok()).toBeTruthy();
}

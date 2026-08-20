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

/**
 * Alta de una suscriptora por API, para las pruebas que necesitan una cuenta **suya**.
 *
 * Pausar, cancelar o cambiar de plan son cambios sobre el suscriptor entero: hacerlo
 * sobre Ana o Bruno chocaría con el circuito completo, que corre en paralelo y cuenta
 * con que su suscripción esté activa.
 */
export async function registrarSuscriptora(
  request: APIRequestContext,
  email: string,
  planCode: "BASIC" | "PREMIUM" = "BASIC"
): Promise<void> {
  const response = await request.post("/api/auth/register", {
    data: {
      email,
      password: PASSWORD,
      fullName: "Suscriptora de pruebas",
      isAdult: true,
      acceptsTerms: true,
      address: { line1: "Calle Portal 1", city: "Girona", postalCode: "17001" },
      card: { brand: "VISA", last4: "4242", expMonth: 12, expYear: 2030 },
      planCode,
    },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
}

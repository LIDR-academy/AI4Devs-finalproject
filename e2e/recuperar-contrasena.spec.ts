import { expect, test } from "./fixtures";

/**
 * Recuperación de acceso (`accounts-roles` → "Restablecimiento de contraseña por
 * correo").
 *
 * **Lo que esta prueba no puede hacer** es completar el circuito: el enlace viaja en
 * el correo y en la base solo queda su hash, así que no hay forma de leerlo desde el
 * navegador ni desde la API — y exponerlo por HTTP "solo para los tests" sería
 * regalar una puerta trasera. El camino feliz completo se prueba en
 * `tests/password-reset.test.ts`, donde el doble del transporte sí ve el mensaje.
 *
 * Aquí se cubre lo que sí es observable desde fuera, que es justo lo que los tests de
 * caso de uso no pueden ver: que la salida existe y se encuentra, que el mensaje **no
 * delata** qué direcciones tienen cuenta, y que un enlace que no vale lo dice.
 */

const SEMBRADA = "ana@example.test";
const INVENTADA = "no-existe-nadie-aqui@example.test";

test("desde el login se llega a pedir una contraseña nueva", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "¿Has olvidado la contraseña?" }).click();

  await page.waitForURL("**/recuperar-contrasena");
  await expect(page.getByRole("heading", { name: "Recuperar contraseña" })).toBeVisible();
});

test("la confirmación es idéntica exista o no la cuenta", async ({ page }) => {
  /** Pide el enlace y devuelve el texto que se le muestra a quien lo pidió. */
  async function pedirEnlace(email: string): Promise<string> {
    await page.goto("/recuperar-contrasena");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Enviarme el enlace" }).click();
    const confirmacion = page.getByRole("status");
    await expect(confirmacion).toBeVisible();
    return (await confirmacion.textContent())?.trim() ?? "";
  }

  const conCuenta = await pedirEnlace(SEMBRADA);
  const sinCuenta = await pedirEnlace(INVENTADA);

  // Si las dos pantallas se distinguieran —en el texto o en que una fallara—, esta
  // sería la forma más cómoda de averiguar quién está dado de alta.
  expect(conCuenta).toBe(sinCuenta);
  expect(conCuenta).toContain("Si esa dirección tiene una cuenta");
});

test("un enlace que no vale lo dice y ofrece pedir otro", async ({ page }) => {
  await page.goto("/restablecer-contrasena?token=esto-no-es-un-token");
  await page.getByLabel("Contraseña nueva").fill("una-contraseña-nueva");
  await page.getByLabel("Repite la contraseña").fill("una-contraseña-nueva");
  await page.getByRole("button", { name: "Guardar contraseña" }).click();

  // `p[role=alert]` y no `getByRole("alert")`: Next monta su propio anunciador de ruta
  // con ese rol, y el selector por rol devolvería dos elementos.
  const aviso = page.locator('p[role="alert"]');
  await expect(aviso).toContainText("Este enlace ya no sirve");
  await expect(aviso.getByRole("link", { name: "pedir uno nuevo" })).toBeVisible();
});

test("la confirmación que no coincide se corrige sin gastar el enlace", async ({ page }) => {
  await page.goto("/restablecer-contrasena?token=esto-no-es-un-token");
  await page.getByLabel("Contraseña nueva").fill("una-contraseña-nueva");
  await page.getByLabel("Repite la contraseña").fill("otra-cosa");
  await page.getByRole("button", { name: "Guardar contraseña" }).click();

  // El error es del formulario, no del enlace: el formulario sigue en pie. La regla se
  // comprueba en el servidor aunque el token sea falso — se valida antes de mirarlo.
  await expect(page.getByText("Las dos contraseñas no coinciden.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Guardar contraseña" })).toBeVisible();
});

test("un enlace sin token no pinta el formulario", async ({ page }) => {
  await page.goto("/restablecer-contrasena");
  await expect(page.locator('p[role="alert"]')).toContainText("Este enlace está incompleto");
  await expect(page.getByLabel("Contraseña nueva")).toHaveCount(0);
});

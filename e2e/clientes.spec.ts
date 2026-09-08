import { expect, test } from "./fixtures";
import { login } from "./sesion";

/**
 * Lista de clientes del back-office — la columna «Sets fuera».
 *
 * **Lo que protege.** El recuento se hacía filtrando solo por el estado de la *copia*,
 * sin mirar el estado del *alquiler*: contaba los alquileres ya cerrados de una copia
 * que hoy está fuera con otra persona. Un cliente con todo devuelto aparecía con cinco
 * sets, y su propio historial lo desmentía en la pantalla de al lado.
 *
 * Es un fallo que solo se ve contra una base con pasado, así que vive aquí y no en un
 * test de caso de uso: los dobles en memoria no tienen copias que hayan pasado por
 * varias manos. Y es **de solo lectura** —no alquila ni devuelve nada—, así que no
 * estorba al resto de la suite, que comparte esta misma base.
 *
 * Elena Prat es del historial sembrado (`prisma/seed-history.ts`), no la toca ninguna
 * otra prueba, y tiene justo la forma que destapaba el fallo: alquileres en su
 * historial y **ninguno** en curso.
 */

const CLIENTA = "Elena Prat";

test("«Sets fuera» cuenta lo que está fuera, no el historial entero", async ({ page }) => {
  await login(page, "admin@clickoteca.test");
  await page.goto("/backoffice/clientes");

  const fila = page.getByRole("row").filter({ hasText: CLIENTA });
  // Columnas del admin: Nombre · Email · Plan · Sets fuera · En cola · Historial.
  await expect(fila.getByRole("cell").nth(3)).toHaveText("0");

  await fila.getByRole("link", { name: "Historial" }).click();
  await page.waitForURL(/\/backoffice\/clientes\/[0-9a-f-]{36}$/);

  const alquileres = page.locator("tbody tr");
  // Que el cero de antes signifique algo: si no hubiera historial, cualquier
  // implementación —incluida la rota— habría pasado la comprobación anterior.
  expect(await alquileres.count()).toBeGreaterThan(0);

  // La columna «Cerrado» trae la fecha de cierre, o «—» si sigue abierto.
  await expect(alquileres.locator("td:nth-child(4)").filter({ hasText: "—" })).toHaveCount(0);
});

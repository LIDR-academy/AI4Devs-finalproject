import { expect, test, type Page } from "./fixtures";
import { login } from "./sesion";

/**
 * Ficha de set — `wireframes.md` §3 (W1).
 *
 * **Aquí solo se lee.** Las dos acciones que la ficha estrena (pedir un set y entrar
 * en la cola, HU-03 y HU-04) se prueban dentro de `circuito-completo.spec.ts`, que ya
 * es serie y ya cierra el circuito: repetirlas aquí pondría a dos ficheros a
 * disputarse la misma copia con `fullyParallel`, que es exactamente el fallo que llevó
 * a sacar el circuito del proyecto `mobile`.
 *
 * Lo que se comprueba es la frontera D13 —la misma URL contando cosas distintas según
 * quién mira— y que el motivo de no poder alquilar llega con su texto, no como un "no
 * puedes" genérico.
 */

/**
 * La URL de una ficha. Se espera a la navegación con `waitForURL` —que corre contra el
 * reloj de la prueba— y no con un `expect` sobre el contenido, que solo tiene 5 s: con
 * tres workers, la primera petición de esta ruta puede tardar más y el fallo parecería
 * "falta la región" en vez de "aún no ha llegado".
 */
const FICHA = /\/catalogo\/[0-9a-f-]{36}$/;

/** El primer set del catálogo. Sirve cualquiera: aquí no se toca el inventario. */
async function anySetName(page: Page): Promise<string> {
  await page.goto("/catalogo");
  const first = page.getByRole("listitem").first().getByRole("link");
  const name = (await first.textContent())?.trim();
  expect(name, "el catálogo sembrado debería tener sets").toBeTruthy();
  return name!;
}

test("el catálogo lleva a la ficha, y al visitante no le cuenta la disponibilidad", async ({
  page,
}) => {
  const name = await anySetName(page);
  await page.getByRole("link", { name }).click();

  await page.waitForURL(FICHA);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();

  // La caja de decisión es una región con nombre: la prueba se ancla al rol y
  // sobrevive a los cambios de redacción de dentro.
  const box = page.getByRole("region", { name: "Disponibilidad" });
  await expect(box.getByText(/Entra para ver si está libre/i)).toBeVisible();
  await expect(box.getByRole("link", { name: "Entrar" })).toBeVisible();

  // La frontera de D13: la caja **nombra** la cola —para explicar qué se gana entrando—
  // pero no filtra ni un dato suyo. Lo que no puede aparecer son las cifras: cuántas
  // copias hay libres, cuánta gente espera y en qué puesto.
  await expect(box.getByText(/copias? libres?/i)).toHaveCount(0);
  await expect(box.getByText(/\d+ de \d+/)).toHaveCount(0);
  await expect(box.getByText(/esperando|Eres el nº/i)).toHaveCount(0);
  await expect(box.getByRole("button", { name: /Pedir este set/i })).toHaveCount(0);
  await expect(box.getByRole("button", { name: /cola/i })).toHaveCount(0);
});

test("con sesión, la misma ficha añade disponibilidad y la acción de pedirlo", async ({
  page,
}) => {
  await login(page, "ana@example.test");
  const name = await anySetName(page);
  await page.getByRole("link", { name }).click();
  await page.waitForURL(FICHA);

  const box = page.getByRole("region", { name: "Disponibilidad" });
  // "N de M copias libres" — cuántas hay, nunca el estado de cada copia una a una.
  await expect(box.getByText(/\d+ de \d+ copias? libres?/)).toBeVisible();
  await expect(box.getByRole("button", { name: "Pedir este set" })).toBeVisible();
  // Las plazas del plan salen del vocabulario común, no escritas a mano.
  await expect(box.getByText(/sets? en casa a la vez/)).toBeVisible();
});

test("sin suscripción activa se explica el motivo y no se ofrece la acción", async ({
  page,
}) => {
  // Carla está sembrada con la suscripción CANCELLED: es el fixture del rechazo.
  await login(page, "carla@example.test");
  const name = await anySetName(page);
  await page.getByRole("link", { name }).click();
  await page.waitForURL(FICHA);

  const box = page.getByRole("region", { name: "Disponibilidad" });
  // El `detail` del dominio, literal: la pantalla no reescribe el mensaje del servidor.
  await expect(
    box.getByText("Necesitas una suscripción activa para llevarte un set.")
  ).toBeVisible();
  await expect(box.getByRole("link", { name: "Ver mi suscripción" })).toBeVisible();
  await expect(box.getByRole("button", { name: "Pedir este set" })).toHaveCount(0);
  // Sin plan activo tampoco se ofrece la cola: `joinQueue` la rechazaría igual, y un
  // botón que va a fallar es peor que no ofrecerlo.
  await expect(box.getByRole("button", { name: /cola/i })).toHaveCount(0);
});

test("un set que no está en el catálogo responde 404, exista o no", async ({ page }) => {
  const response = await page.goto("/catalogo/00000000-0000-0000-0000-000000000000");
  expect(response?.status()).toBe(404);
});

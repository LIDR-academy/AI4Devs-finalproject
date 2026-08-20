import { expect, test } from "./fixtures";
import { login } from "./sesion";

/**
 * Catálogo e inventario del back-office — W4 (`wireframes.md` §6).
 *
 * El recorrido va entero por la interfaz porque es HU-10: dar de alta un set, tasarlo,
 * publicarlo y ponerle copias sin salir del navegador.
 *
 * **El set de prueba se queda sin publicar al terminar.** No hay forma de borrarlo —el
 * dominio no contempla eliminar un Set—, así que el cierre es retirarlo del catálogo:
 * publicado y con una copia libre lo encontraría el circuito completo, que busca
 * exactamente eso, y las dos pruebas se disputarían la misma copia.
 */

/** Nombre irrepetible: la prueba deja residuo en la base y no debe confundirse. */
const nombreUnico = () => `Set de prueba E2E ${Date.now()}`;

test("alta, tasación, publicación e inventario de un set", async ({ page }) => {
  const nombre = nombreUnico();
  await login(page, "admin@clickoteca.test");
  await page.goto("/backoffice/catalogo");

  // ── 1. Alta ────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "+ Nuevo set" }).click();
  const dialogo = page.getByRole("dialog", { name: "Nuevo set" });
  await dialogo.getByLabel("Tema").selectOption({ index: 1 });
  await dialogo.getByLabel("Nombre").fill(nombre);
  await dialogo.getByLabel("Nº de piezas").fill("512");
  // A propósito **sin** valor de referencia: es lo que bloquea la publicación.
  await dialogo.getByRole("button", { name: "Crear set" }).click();

  // Tras el alta se llega a su ficha, que es donde se sigue trabajando.
  await page.waitForURL(/\/backoffice\/catalogo\/[0-9a-f-]{36}$/);
  const fichaUrl = page.url();
  await expect(page.getByRole("heading", { name: nombre })).toBeVisible();
  await expect(page.getByText("Sin publicar")).toBeVisible();

  // ── 2. Publicar sin tasar: la regla del dominio llega a la pantalla ─────────
  await page.getByRole("button", { name: "Publicar" }).click();
  // Por texto y no por `role="alert"`: el anunciador de rutas de Next también lo lleva.
  await expect(page.getByText(/necesita un valor de referencia/i)).toBeVisible();
  await expect(page.getByText("Sin publicar")).toBeVisible();

  // ── 3. Sin publicar, la lista es la única puerta de vuelta ─────────────────
  // Es la razón de ser de la pantalla (§6.1): el catálogo público responde 404 a un
  // set no publicado, así que sin este filtro el set recién creado sería inalcanzable.
  await page.goto(`/backoffice/catalogo?q=${encodeURIComponent(nombre)}&estado=borradores`);
  await expect(page.getByRole("row").filter({ hasText: nombre })).toHaveCount(1);
  await page.goto(fichaUrl);

  // ── 4. Tasarlo desde la edición ────────────────────────────────────────────
  await page.getByRole("button", { name: "Editar" }).click();
  const edicion = page.getByRole("dialog", { name: `Editar ${nombre}` });
  await edicion.getByLabel("Valor de referencia").fill("149.99");
  await edicion.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Valor de referencia 149,99")).toBeVisible();

  // ── 5. Ahora sí publica ────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Publicado", { exact: true })).toBeVisible();

  // ── 6. Una copia, que nace sin catalogar ───────────────────────────────────
  await expect(page.getByText("no tiene ninguna copia todavía")).toBeVisible();
  await page.getByRole("button", { name: "+ Añadir copia" }).click();

  const fila = page.getByRole("row").filter({ hasText: "Sin catalogar" });
  await expect(fila).toHaveCount(1);
  await fila.getByRole("button", { name: "Catalogar" }).click();
  await expect(page.getByRole("row").filter({ hasText: "Disponible" })).toHaveCount(1);

  // ── 7. La lista lo encuentra por nombre y cuenta sus copias ────────────────
  await page.goto(`/backoffice/catalogo?q=${encodeURIComponent(nombre)}`);
  const enLista = page.getByRole("row").filter({ hasText: nombre });
  await expect(enLista).toHaveCount(1);
  await expect(enLista).toContainText("1 de 1 libre(s)");

  // ── 8. Cierre: se retira del catálogo para no dejar un set alquilable ──────
  await page.goto(fichaUrl);
  await page.getByRole("button", { name: "Retirar del catálogo" }).click();
  await expect(page.getByText("Sin publicar")).toBeVisible();
});

test("una búsqueda sin resultados ofrece deshacer el filtro", async ({ page }) => {
  await login(page, "admin@clickoteca.test");
  await page.goto("/backoffice/catalogo?q=zzzz-no-existe");

  // Vacío de tipo "ya no queda": ofrece deshacer, no invita a crear (design-system §7.1).
  await expect(page.getByText("Ningún set coincide")).toBeVisible();
  await expect(page.getByRole("link", { name: "Quitar el filtro" })).toBeVisible();
});

test("el operador ve las acciones de admin y se le explica el rechazo", async ({ page }) => {
  await login(page, "operador@clickoteca.test");
  await page.goto("/backoffice/catalogo?estado=publicados");

  // La decisión de `ux-flows.md`: se enseña la acción y se explica el 403, en vez de
  // esconderla y dejar al operador sin saber por qué no está.
  await page.getByRole("row").nth(1).getByRole("link").click();
  await page.waitForURL(/\/backoffice\/catalogo\/[0-9a-f-]{36}$/);
  await page.getByRole("button", { name: "Retirar del catálogo" }).click();
  await expect(page.getByText(/Solo un administrador/i)).toBeVisible();
  await expect(page.getByText("Publicado", { exact: true })).toBeVisible();
});

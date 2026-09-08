import { expect, test } from "./fixtures";
import { login } from "./sesion";

/**
 * Configuración del sistema y de los planes — HU-16 (`wireframes.md` §8.7).
 *
 * **No se cambia ningún valor.** Precio, límite de sets y ventaja en cola son globales
 * y compartidos con el resto de la suite, que corre en paralelo: subir el precio del
 * Premium aquí rompería la comprobación del alta en otra prueba. Se guarda el plan con
 * los valores que ya tiene, que recorre el circuito entero —formulario, endpoint,
 * auditoría— sin dejar nada distinto detrás.
 */

test("el admin edita los planes desde la pantalla, sin pasar por la API", async ({ page }) => {
  await login(page, "admin@clickoteca.test");
  await page.goto("/backoffice/configuracion");

  const premium = page.getByRole("form", { name: "Premium" });
  await expect(premium.getByLabel("Precio mensual (€)")).not.toHaveValue("");
  await expect(premium.getByLabel("Sets a la vez")).not.toHaveValue("");
  await expect(premium.getByLabel("Ventaja en cola (días)")).not.toHaveValue("");

  await premium.getByRole("button", { name: "Guardar plan" }).click();
  await expect(premium.getByText("Plan guardado.")).toBeVisible();

  // La ventaja no reordena lo ya formado (D11), y la pantalla lo dice antes de que
  // alguien la cambie esperando lo contrario.
  await expect(premium.getByText(/no reordena las colas ya formadas/)).toBeVisible();
});

/**
 * `wireframes.md` §8.3: la ventana de confirmación de ofertas es **también** el plazo
 * para reportar una discrepancia. Mientras sean el mismo número, la pantalla tiene que
 * decirlo — es la única forma de que quien lo acorte sepa qué más está acortando.
 */
test("la ventana de confirmación avisa de que gobierna dos plazos", async ({ page }) => {
  await login(page, "admin@clickoteca.test");
  await page.goto("/backoffice/configuracion");

  await expect(page.getByText(/reportar una discrepancia en la entrega/)).toBeVisible();
});

test("los recordatorios de retención mandan a la ficha de cada set", async ({ page }) => {
  await login(page, "admin@clickoteca.test");
  await page.goto("/backoffice/configuracion");

  // `exact` distingue este enlace del destino "Catálogo" de la barra de navegación:
  // sin él, dos coincidencias y *strict mode*.
  await page.getByRole("link", { name: "catálogo", exact: true }).click();
  await page.waitForURL("/backoffice/catalogo");
});

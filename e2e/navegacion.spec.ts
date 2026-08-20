import { expect, test } from "./fixtures";
import { login } from "./sesion";

/**
 * Navegación de superficie (`documents/wireframes.md` §2.3 y §8.5).
 *
 * Lo que protege: que la barra viva en el **layout** y no en la página del centro.
 * Mientras estuvo dentro de la cola de trabajo, ir de una sección a otra obligaba a
 * volver al hub; la prueba salta de sección a sección directamente, que es justo lo
 * que antes no se podía hacer.
 *
 * Se ancla por rol —`getByRole("navigation", { name: … })`— y no por texto: cambiar
 * una etiqueta puede ser una decisión de producto, no una regresión.
 */

test("el back-office se navega de sección a sección sin pasar por el centro", async ({ page }) => {
  await login(page, "admin@clickoteca.test");
  const nav = page.getByRole("navigation", { name: "Back-office" });

  await test.step("de la cola de trabajo a clientes", async () => {
    await expect(nav.getByRole("link", { name: "Cola de trabajo" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    await nav.getByRole("link", { name: "Clientes" }).click();
    await page.waitForURL("**/backoffice/clientes");
    await expect(nav.getByRole("link", { name: "Clientes" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  await test.step("de clientes a personal, en un solo salto", async () => {
    await nav.getByRole("link", { name: "Personal" }).click();
    await page.waitForURL("**/backoffice/empleados");
    await expect(nav.getByRole("link", { name: "Personal" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  await test.step("la ficha de un cliente sigue iluminando su sección", async () => {
    await nav.getByRole("link", { name: "Clientes" }).click();
    await page.waitForURL("**/backoffice/clientes");
    await page.getByRole("link", { name: "Historial" }).first().click();
    await page.waitForURL(/\/backoffice\/clientes\/[0-9a-f-]{36}$/);
    await expect(nav.getByRole("link", { name: "Clientes" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});

/**
 * La barra sale de la matriz de permisos, así que enseña exactamente lo que el rol
 * puede usar. Un enlace a una pantalla que devolvería 403 no es un fallo de
 * seguridad —el guarda sigue ahí— pero sí una promesa que la aplicación no cumple.
 */
test("el operador no ve los destinos de admin", async ({ page }) => {
  await login(page, "operador@clickoteca.test");
  const nav = page.getByRole("navigation", { name: "Back-office" });

  await expect(nav.getByRole("link", { name: "Clientes" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Configuración" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Personal" })).toHaveCount(0);
});

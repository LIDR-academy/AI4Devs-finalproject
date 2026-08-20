import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtures";
import { login } from "./sesion";

/**
 * Auditoría automática de accesibilidad con axe-core.
 *
 * El objetivo declarado es **WCAG 2.1 AA** (ADR-0001; EN 301 549 / European
 * Accessibility Act), así que se piden exactamente esas etiquetas y no el catálogo
 * completo de reglas de axe: las "best-practice" son consejos útiles, pero mezclarlas
 * con el criterio de conformidad convierte el rojo en una opinión y nadie lo arregla.
 *
 * **Qué cubre y qué no.** axe encuentra del orden de un tercio de los problemas reales:
 * los mecánicos —contraste, nombres accesibles, roles, etiquetas de formulario, orden
 * de encabezados—. No dice si el recorrido tiene sentido con teclado ni si el texto
 * alternativo describe algo. Que esta suite esté verde significa "no hay fallos
 * mecánicos", no "es accesible". El contraste de los tokens, además, se mide aparte y
 * en los dos temas (`tests/design-tokens.test.ts`).
 */

const REGLAS_WCAG_21_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** Ejecuta axe sobre la página ya cargada y falla con un informe legible. */
async function auditar(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(REGLAS_WCAG_21_AA)
    .analyze();

  // El mensaje importa: un `expect(violations).toEqual([])` a secas escupe el objeto
  // entero de axe —cientos de líneas por incidencia— y hay que bucear para saber qué
  // elemento falla. Aquí sale la regla, a quién afecta y el selector que la incumple.
  const informe = violations.map((v) => {
    const nodos = v.nodes.map((n) => `      · ${n.target.join(" ")}`).join("\n");
    return `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodos}`;
  });

  expect(informe.join("\n\n"), `Incidencias de accesibilidad en ${page.url()}`).toBe("");
}

/** Superficie pública: lo que ve el visitante sin sesión (D13). */
const PAGINAS_PUBLICAS = [
  { ruta: "/", nombre: "landing" },
  { ruta: "/catalogo", nombre: "catálogo público" },
  { ruta: "/planes", nombre: "planes" },
  { ruta: "/registro", nombre: "alta" },
  { ruta: "/login", nombre: "login" },
];

for (const { ruta, nombre } of PAGINAS_PUBLICAS) {
  test(`sin incidencias de accesibilidad: ${nombre}`, async ({ page }) => {
    await page.goto(ruta);
    await auditar(page);
  });
}

/**
 * La ficha de set se audita **en sus dos proyecciones**: no es la misma página con un
 * dato más, es composición distinta —la caja de decisión cambia entera— y solo la
 * autenticada tiene píldora de estado y botones de acción (`wireframes.md` §3).
 */
async function irAUnaFicha(page: Page): Promise<void> {
  await page.goto("/catalogo");
  await page.getByRole("listitem").first().getByRole("link").click();
  // Se espera a la **navegación**, no solo a que aparezca la región. `waitForURL` corre
  // contra el reloj de la prueba (60 s); un `expect(...).toBeVisible()` a secas corre
  // contra los 5 s de la aserción, y con tres workers la primera petición de esta ruta
  // los agota — el fallo parecía "no existe la región" cuando era "aún no ha llegado".
  await page.waitForURL(/\/catalogo\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("region", { name: "Disponibilidad" })).toBeVisible();
}

test("sin incidencias de accesibilidad: ficha de set (visitante)", async ({ page }) => {
  await irAUnaFicha(page);
  await auditar(page);
});

test("sin incidencias de accesibilidad: ficha de set (suscriptora)", async ({ page }) => {
  await login(page, "ana@example.test");
  await irAUnaFicha(page);
  await auditar(page);
});

test("sin incidencias de accesibilidad: portal del suscriptor", async ({ page }) => {
  await login(page, "ana@example.test");
  await auditar(page);
});

/**
 * Back-office con el **admin**: ve todo lo que ve el operador y además la
 * configuración y los empleados, así que una sola sesión cubre más superficie. La
 * diferencia entre roles es de datos visibles, no de composición de la página.
 */
const PAGINAS_BACKOFFICE = [
  { ruta: "/backoffice", nombre: "cola de trabajo" },
  { ruta: "/backoffice/catalogo", nombre: "catálogo" },
  { ruta: "/backoffice/clientes", nombre: "clientes" },
  { ruta: "/backoffice/configuracion", nombre: "configuración" },
  { ruta: "/backoffice/empleados", nombre: "empleados" },
];

test("sin incidencias de accesibilidad: back-office", async ({ page }) => {
  await login(page, "admin@clickoteca.test");
  for (const { ruta, nombre } of PAGINAS_BACKOFFICE) {
    await test.step(nombre, async () => {
      await page.goto(ruta);
      await auditar(page);
    });
  }
});

/**
 * La ficha de catálogo y **su diálogo de alta**, que es la primera pantalla con un
 * formulario dentro de un modal: axe solo ve lo que está en el DOM, así que un
 * diálogo cerrado no se audita. Se abre a propósito.
 */
test("sin incidencias de accesibilidad: ficha de catálogo y alta de set", async ({ page }) => {
  await login(page, "admin@clickoteca.test");
  await page.goto("/backoffice/catalogo");

  await page.getByRole("button", { name: "+ Nuevo set" }).click();
  await expect(page.getByRole("dialog", { name: "Nuevo set" })).toBeVisible();
  await auditar(page);
  await page.keyboard.press("Escape");

  await page.getByRole("row").nth(1).getByRole("link").click();
  await page.waitForURL(/\/backoffice\/catalogo\/[0-9a-f-]{36}$/);
  await auditar(page);
});

import { expect, test, type Page, type APIRequestContext } from "@playwright/test";

/**
 * Recorrido E2E completo del MVP (tarea 8.4): suscriptor + back-office.
 *
 * Se ejecuta **en serie** y contra la base de desarrollo sembrada, porque prueba un
 * circuito con estado compartido: paralelizarlo haría que dos pruebas se disputaran
 * las mismas copias.
 */
test.describe.configure({ mode: "serial" });

const PASSWORD = "clickoteca";

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/(portal|backoffice)/);
}

/** Inicia sesión por API, para preparar estado sin pasar por la interfaz. */
async function apiLogin(request: APIRequestContext, email: string) {
  const response = await request.post("/api/auth/login", {
    data: { email, password: PASSWORD },
  });
  expect(response.ok()).toBeTruthy();
}

test("el visitante ve el catálogo público pero no la disponibilidad", async ({ page }) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();
  // La invitación a entrar es justo la frontera de D13.
  await expect(page.getByText(/Inicia sesión para ver la disponibilidad/i)).toBeVisible();
});

test("una ruta reservada redirige al login", async ({ page }) => {
  await page.goto("/portal");
  await expect(page).toHaveURL(/\/login\?next=%2Fportal/);
});

test("el alta sin plan se rechaza junto al resto de errores", async ({ page }) => {
  await page.goto("/registro");
  // Sin pasar por /planes no hay plan preseleccionado: elegirlo es una decisión del
  // visitante, no un valor por defecto silencioso.
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText("Debes elegir un plan de suscripción.")).toBeVisible();
});

test("el alta con plan deja la cuenta operativa y el plan se cambia desde el portal", async ({
  page,
}) => {
  // Email único: el alta escribe en la base sembrada y la prueba debe poder repetirse.
  const email = `alta-${Date.now()}@example.test`;

  // ── 1. El plan elegido en /planes viaja hasta el formulario ─────────────────
  await page.goto("/planes");
  await page.getByRole("link", { name: "Empezar con Basic" }).click();
  await expect(page).toHaveURL(/\/registro\?plan=BASIC/);
  await expect(page.getByRole("radio", { name: /Basic/ })).toBeChecked();

  // ── 2. …y se puede cambiar sin volver atrás ────────────────────────────────
  await page.getByRole("radio", { name: /Premium/ }).check();

  await page.getByLabel("Nombre y apellidos").fill("Nueva Suscriptora");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(PASSWORD);
  await page.getByLabel("Dirección").fill("Calle Nueva 1");
  await page.getByLabel("Localidad").fill("Girona");
  await page.getByLabel("Código postal").fill("17001");
  await page.getByLabel("Marca (p. ej. VISA)").fill("VISA");
  await page.getByLabel("Últimos 4 dígitos").fill("4242");
  await page.getByLabel("Mes de caducidad").fill("12");
  await page.getByLabel("Año de caducidad").fill("2030");
  await page.getByLabel(/mayor de edad/).check();
  await page.getByLabel(/acepto las condiciones/).check();

  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.waitForURL("/login");

  // ── 3. La cuenta nace con suscripción activa: sin pasos intermedios ─────────
  await login(page, email);
  await expect(page.getByText(/Plan actual: Premium/)).toBeVisible();

  // ── 4. Cambio de plan desde el portal ──────────────────────────────────────
  await page.getByRole("button", { name: /Cambiar a Basic/ }).click();
  await expect(page.getByText(/Plan actual: Basic/)).toBeVisible();
});

test("el suscriptor entra en su portal y el operador en el back-office", async ({ page }) => {
  await login(page, "ana@example.test");
  await expect(page.getByRole("heading", { name: /Hola, Ana/i })).toBeVisible();

  await page.getByRole("button", { name: "Salir" }).click();
  await page.waitForURL("/");

  await login(page, "operador@clickoteca.test");
  await expect(page.getByRole("heading", { name: "Cola de trabajo" })).toBeVisible();
});

test("el operador no ve los datos de contacto del cliente; el admin sí", async ({ page }) => {
  await login(page, "operador@clickoteca.test");
  await page.goto("/backoffice/clientes");
  await expect(page.getByText(/Lectura limitada para soporte/i)).toBeVisible();
  await expect(page.getByText("ana@example.test")).toHaveCount(0);

  await page.getByRole("button", { name: "Salir" }).click();
  await page.waitForURL("/");

  await login(page, "admin@clickoteca.test");
  await page.goto("/backoffice/clientes");
  await expect(page.getByText(/Vista completa/i)).toBeVisible();
  await expect(page.getByText("ana@example.test")).toBeVisible();
});

test("el operador no llega a la configuración; el admin sí", async ({ page }) => {
  await login(page, "operador@clickoteca.test");
  await page.goto("/backoffice/configuracion");
  // Se le devuelve a su cola de trabajo en vez de enseñarle un 403 sin salida.
  await expect(page).toHaveURL(/\/backoffice$/);

  await page.getByRole("button", { name: "Salir" }).click();
  await page.waitForURL("/");

  await login(page, "admin@clickoteca.test");
  await page.goto("/backoffice/configuracion");
  await expect(page.getByRole("heading", { name: "Configuración" })).toBeVisible();
});

test("circuito completo: alquiler, devolución, inspección, higiene y oferta a la cola", async ({
  page,
  request,
}) => {
  // ── Preparación: se busca un set con una sola copia disponible ───────────────
  await apiLogin(request, "ana@example.test");
  const catalog = await request.get("/api/catalog?limit=48");
  const { sets } = (await catalog.json()) as { sets: Array<{ id: string; name: string }> };

  let target: { id: string; name: string } | null = null;
  for (const candidate of sets) {
    const detail = await request.get(`/api/catalog/${candidate.id}`);
    const { set } = (await detail.json()) as {
      set: { availableCopies: number; totalCopies: number; restricted: boolean };
    };
    if (set.availableCopies === 1 && set.totalCopies === 1 && !set.restricted) {
      target = candidate;
      break;
    }
  }
  expect(target, "hace falta un set con una única copia disponible").not.toBeNull();

  // ── 1. Ana alquila el set desde el catálogo ─────────────────────────────────
  const rentalResponse = await request.post(`/api/sets/${target!.id}/rentals`);
  expect(rentalResponse.status()).toBe(201);
  await expect(rentalResponse.json()).resolves.toMatchObject({
    rental: { status: "ACTIVE", copyState: "ALQUILADA" },
  });

  // ── 2. Bruno se pone en la cola, porque ya no quedan copias ─────────────────
  await apiLogin(request, "bruno@example.test");
  const noCopy = await request.post(`/api/sets/${target!.id}/rentals`);
  await expect(noCopy.json()).resolves.toMatchObject({ outcome: "no_copy_available" });
  expect((await request.post(`/api/sets/${target!.id}/queue`)).status()).toBe(201);

  // ── 3. Ana devuelve el set desde su portal ─────────────────────────────────
  await login(page, "ana@example.test");
  await expect(page.getByText(target!.name)).toBeVisible();
  await page.getByRole("button", { name: "Devolver" }).first().click();
  await expect(page.getByText(/devolución en curso/i)).toBeVisible();

  // ── 4. El operador la recibe, inspecciona e higieniza desde su cola ─────────
  await page.getByRole("button", { name: "Salir" }).click();
  await page.waitForURL("/");
  await login(page, "operador@clickoteca.test");

  await page.getByRole("button", { name: "Recepcionar" }).first().click();
  await expect(page.getByRole("heading", { name: /Por inspeccionar/i })).toBeVisible();

  await page.getByRole("button", { name: "Inspección OK" }).first().click();
  await expect(page.getByRole("heading", { name: /Por higienizar/i })).toBeVisible();

  await page.getByRole("button", { name: "Higienizada" }).first().click();

  // ── 5. La copia liberada se ofrece a Bruno, que la acepta ──────────────────
  await page.getByRole("button", { name: "Salir" }).click();
  await page.waitForURL("/");
  await login(page, "bruno@example.test");

  await expect(page.getByRole("heading", { name: "Te toca" })).toBeVisible();
  // Acotado al bloque de la oferta: el nombre del set también aparece en la lista de
  // colas, y sin acotar el selector encontraría las dos apariciones.
  await expect(
    page.getByText(new RegExp(`${target!.name} está disponible para ti`))
  ).toBeVisible();

  await page.getByRole("button", { name: "Aceptar" }).click();
  // Tras aceptar, el set pasa a ser suyo y desaparece la oferta.
  await expect(page.getByRole("heading", { name: "Te toca" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Devolver" })).toBeVisible();
});

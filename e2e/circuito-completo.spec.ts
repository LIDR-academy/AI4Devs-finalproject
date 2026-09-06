import { expect, test } from "./fixtures";
import { apiLogin, login, PASSWORD } from "./sesion";

/**
 * Recorrido E2E completo del MVP (tarea 8.4): suscriptor + back-office.
 *
 * Se ejecuta **en serie** y contra la base de desarrollo sembrada, porque prueba un
 * circuito con estado compartido: paralelizarlo haría que dos pruebas se disputaran
 * las mismas copias.
 */
test.describe.configure({ mode: "serial" });

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
  // Acotado a la región "Tu plan" en vez de a una frase suelta de la página: así la
  // prueba sobrevive a los cambios de redacción y comprueba lo que de verdad importa
  // —qué plan tiene y que la suscripción está activa—, no cómo está escrito.
  const plan = page.getByRole("region", { name: "Tu plan" });
  await expect(plan.getByText("Premium", { exact: true })).toBeVisible();
  await expect(plan.getByText("Activa", { exact: true })).toBeVisible();

  // ── 4. Cambio de plan, que desde W5 vive en su propia pantalla ─────────────
  await plan.getByRole("link", { name: "Gestionar" }).click();
  await page.waitForURL("/portal/suscripcion");
  // Solo hay otro plan, así que solo hay un botón "Cambiar".
  await page.getByRole("region", { name: "Cambiar de plan" }).getByRole("button").click();
  await expect(
    page.getByRole("region", { name: "Plan actual" }).getByText("Basic", { exact: true })
  ).toBeVisible();
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

  // Los dos pasos siguientes van **por la interfaz** y no por la API: son HU-03 y
  // HU-04, las dos acciones que estrena la ficha de set (`wireframes.md` §3), y el
  // circuito es el único sitio donde probarlas sin disputarse esta copia con otro
  // fichero de pruebas.
  const box = page.getByRole("region", { name: "Disponibilidad" });

  // ── 1. Ana pide el set desde su ficha (HU-03) ──────────────────────────────
  await login(page, "ana@example.test");
  await page.goto(`/catalogo/${target!.id}`);
  await expect(box.getByText("1 de 1 copia libre")).toBeVisible();
  await box.getByRole("button", { name: "Pedir este set" }).click();
  // Al asignarse, la acción lleva al portal: el set ya es suyo y es allí donde se
  // gestiona.
  await page.waitForURL("/portal");
  await expect(page.getByText(target!.name)).toBeVisible();

  // ── 2. Bruno encuentra la ficha sin copias y entra en la cola (HU-04) ──────
  await page.getByRole("button", { name: "Salir" }).click();
  await page.waitForURL("/");
  await login(page, "bruno@example.test");
  await page.goto(`/catalogo/${target!.id}`);

  // Sin copias no se ofrece pedirlo, aunque la API lo toleraría: enseñar un botón que
  // promete un set y contesta con una cola es peor que enseñar la cola de entrada.
  await expect(box.getByText(/no queda ninguna libre/i)).toBeVisible();
  await expect(box.getByRole("button", { name: "Pedir este set" })).toHaveCount(0);

  await box.getByRole("button", { name: "Apuntarme a la cola" }).click();
  // La posición sale de la proyección autenticada, y nunca dice quién ocupa las otras.
  await expect(box.getByText(/Eres el nº 1 de 1 en la cola/)).toBeVisible();
  await expect(box.getByRole("button", { name: "Salir de la cola" })).toBeVisible();

  // El mismo puesto, visto desde el portal: es lo que pide HU-06 y lo que hasta
  // `wireframes.md` §8.4 solo se veía entrando en la ficha de cada set. El número no se
  // fija —otra prueba en paralelo puede encolarse en el mismo set— pero sí su forma.
  await page.goto("/portal/sets");
  const colas = page.getByRole("region", { name: /Mis colas/ });
  await expect(colas.getByRole("link", { name: target!.name })).toBeVisible();
  await expect(colas.getByText(/^\d+\.º de \d+$/)).toBeVisible();

  // ── 3. Ana devuelve el set desde su portal ─────────────────────────────────
  // Se vuelve al portal antes de cerrar sesión: el botón de salir vive en su layout,
  // y en la ficha `name: "Salir"` encontraría **"Salir de la cola"** —Playwright busca
  // por subcadena— y desharía el paso anterior en vez de cerrar la sesión.
  await page.goto("/portal");
  await page.getByRole("button", { name: "Salir", exact: true }).click();
  await page.waitForURL("/");
  await login(page, "ana@example.test");
  // Desde W5 la devolución vive en "Mis sets", no en el resumen (`wireframes.md` §7.3).
  await page.goto("/portal/sets");
  await expect(page.getByText(target!.name)).toBeVisible();
  await page.getByRole("button", { name: "Devolver" }).first().click();
  await expect(page.getByText(/devolución en curso/i)).toBeVisible();

  // ── 4. El operador la recibe, inspecciona e higieniza desde su cola ─────────
  await page.getByRole("button", { name: "Salir" }).click();
  await page.waitForURL("/");
  await login(page, "operador@clickoteca.test");

  // Cada botón se ancla **a esta copia** por su nombre accesible ("Recepcionar: <set>",
  // que la cola de trabajo pone justamente para esto). Con `.first()` bastaba mientras
  // la cola solo tuviera lo que montaba esta prueba; en cuanto hay más trabajo en curso
  // —otra prueba en paralelo, o una base sembrada con historial— el primer botón es el
  // de otra copia, y la prueba avanzaba la equivocada. El fallo aparecía tres pasos más
  // allá, en la oferta a Bruno que nunca llegaba.
  const accion = (etiqueta: string) =>
    page.getByRole("button", { name: `${etiqueta}: ${target!.name}` });

  // Y por lo mismo se espera al **botón siguiente de esta copia**, no al encabezado del
  // grupo: con otras copias en inspección, "Por inspeccionar" ya está en la página antes
  // de pulsar nada y no probaría que el paso haya ocurrido.
  await accion("Recepcionar").click();
  await expect(accion("Inspección OK")).toBeVisible();

  await accion("Inspección OK").click();
  await expect(accion("Higienizada")).toBeVisible();

  // Se espera a que la transición **llegue al servidor** antes de seguir. Los dos
  // pasos anteriores se anclaban en el encabezado del grupo siguiente; este no tiene
  // grupo detrás —la copia sale de la cola de trabajo al quedar `DISPONIBLE`—, así que
  // sin ancla el cierre de sesión abortaba el `fetch` en vuelo y la copia se quedaba
  // en `EN_HIGIENIZACION`: la oferta a Bruno no llegaba a existir y el fallo aparecía
  // tres pasos más allá, en un "Te toca" que nadie había pedido.
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/transitions") && response.request().method() === "POST"
    ),
    accion("Higienizada").click(),
  ]);

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
  await page.goto("/portal/sets");
  await expect(page.getByRole("button", { name: "Devolver" })).toBeVisible();

  // ── 6. Cierre: la prueba devuelve el mundo como lo encontró ────────────────
  // Sin esto el circuito **no es repetible**: terminaba con Bruno quedándose el set,
  // así que la siguiente ejecución se lo encontraba en su límite de plazas y el
  // rechazo que esperaba (`no_copy_available`) llegaba como `NOT_ELIGIBLE`. Una
  // prueba contra base compartida que deja residuo solo pasa la primera vez.
  await page.getByRole("button", { name: "Devolver" }).click();
  await expect(page.getByRole("button", { name: "Devolver" })).toHaveCount(0);

  await page.getByRole("button", { name: "Salir" }).click();
  await page.waitForURL("/");
  await login(page, "operador@clickoteca.test");

  // Acotado a la fila de *este* set: en la cola puede haber más copias esperando.
  const row = () => page.getByRole("row").filter({ hasText: target!.name });
  for (const action of ["Recepcionar", "Inspección OK", "Higienizada"]) {
    await row().getByRole("button", { name: action }).click();
  }
  // De vuelta a DISPONIBLE: la copia sale de la cola de trabajo.
  await expect(row()).toHaveCount(0);
});

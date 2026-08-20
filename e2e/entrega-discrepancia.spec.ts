import { alquilar, cerrarCircuito, enlaceDeEntrega, type Rental } from "./alquileres";
import { expect, test, type Page } from "./fixtures";
import { apiLogin, login } from "./sesion";

/**
 * El par registro de condición → discrepancia: W2 y W3, HU-11 y HU-07.
 *
 * Se prueban juntos porque **solo tienen sentido completos**: el aviso del suscriptor
 * se compara contra lo que el operador registró, y sin ese registro previo no hay nada
 * contra lo que comparar.
 *
 * Cuenta propia por ejecución —pausar, alquilar y devolver son cambios sobre el
 * suscriptor entero— y **cierra su circuito**: la copia vuelve a `DISPONIBLE`.
 */

async function registrarEntrega(page: Page, rental: Rental, resultado: string) {
  await login(page, "operador@clickoteca.test");
  await enlaceDeEntrega(page, rental.copyId).click();
  await page.waitForURL(`/backoffice/copias/${rental.copyId}/entrega`);

  await page.getByRole("radio", { name: new RegExp(resultado) }).check();
  await page.getByRole("checkbox", { name: /Recuento de piezas/ }).check();
  await page.getByRole("checkbox", { name: /Manual/ }).check();
  await page.getByLabel("Observaciones").fill("Caja con una esquina golpeada, contenido íntegro.");
  await page.getByRole("button", { name: "Guardar y preparar envío" }).click();

  // De vuelta a la cola, y la copia ya no está en ella: tiene envío preparado.
  await page.waitForURL("/backoffice");
}

test("el operador registra la entrega y la suscriptora reporta una discrepancia", async ({
  page,
  request,
}) => {
  const email = `entrega-${Date.now()}@example.test`;
  const rental = await alquilar(request, email);

  try {
    await test.step("W2 · el registro de condición, desde la cola de trabajo", async () => {
      await registrarEntrega(page, rental, "Correcta");
      // Sale de la cola aunque la copia siga en ALQUILADA: lo que la saca es el envío.
      await expect(enlaceDeEntrega(page, rental.copyId)).toHaveCount(0);
    });

    await test.step("W3 · la suscriptora ve contra qué se compara", async () => {
      await page.goto("/portal");
      await page.getByRole("button", { name: "Salir", exact: true }).click();
      await page.waitForURL("/");
      await login(page, email);
      await page.goto("/portal/sets");

      await expect(page.getByText(/Revisa la entrega antes del/)).toBeVisible();
      await expect(page.getByText(/Lo enviamos registrado como/)).toBeVisible();
    });

    await test.step("y avisa de que algo no coincide", async () => {
      await page.getByRole("button", { name: "Algo no coincide" }).click();

      const dialogo = page.getByRole("dialog", { name: "¿Qué no coincide?" });
      // El contexto va dentro del diálogo: qué registramos y con qué casillas.
      await expect(dialogo).toContainText("Correcta");
      await expect(dialogo).toContainText("Recuento de piezas");
      await expect(dialogo).toContainText("No se te imputa nada");

      await dialogo
        .getByLabel("Cuéntanos qué has encontrado")
        .fill("Faltan dos bolsas numeradas, la 3 y la 7.");
      await dialogo.getByRole("button", { name: "Enviar el aviso" }).click();

      // La franja desaparece y deja sitio a la incidencia: `hasOpenIncidentOfType` ya
      // rechazaría un segundo aviso, así que el botón tampoco vuelve a ofrecerse.
      await expect(page.getByText("Incidencia abierta")).toBeVisible();
      await expect(page.getByRole("button", { name: "Algo no coincide" })).toHaveCount(0);
    });
  } finally {
    // En un `finally`: una prueba que falla a mitad dejaba la copia alquilada, y ese
    // residuo se paga en la ejecución siguiente.
    await cerrarCircuito(request, email, rental);
  }
});

test("una entrega ya registrada no se registra dos veces", async ({ page, request }) => {
  const email = `doble-entrega-${Date.now()}@example.test`;
  const rental = await alquilar(request, email);

  try {
    await registrarEntrega(page, rental, "Correcta");

    // La cola ya no ofrece la pantalla, pero la URL sigue existiendo: por ahí se llega
    // con un enlace viejo o con dos operadores a la vez.
    await page.goto(`/backoffice/copias/${rental.copyId}/entrega`);
    await expect(page.getByText("ya está registrada")).toBeVisible();
    await expect(page.getByRole("button", { name: "Guardar y preparar envío" })).toHaveCount(0);

    // Y el endpoint tampoco se deja: el segundo informe movería un reloj que ya corre.
    await apiLogin(request, "operador@clickoteca.test");
    const segunda = await request.post(`/api/rentals/${rental.id}/delivery`, {
      data: { result: "OK", checklist: { pieceCount: true, manual: true } },
    });
    expect(segunda.status()).toBe(409);
  } finally {
    await cerrarCircuito(request, email, rental);
  }
});

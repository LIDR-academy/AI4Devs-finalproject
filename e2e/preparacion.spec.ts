import { alquilar, cerrarCircuito, enlaceDeEntrega } from "./alquileres";
import { expect, test } from "./fixtures";
import { apiLogin, login } from "./sesion";

/**
 * La puerta que le faltaba a la cola de trabajo — `wireframes.md` §8.1.
 *
 * Una copia adjudicada (`ALQUILADA`) espera a que el operador registre su condición y
 * prepare el envío, y hasta ahora **no aparecía en ninguna parte**: la pantalla de
 * registro (W2) sería inalcanzable.
 *
 * Y el matiz que hace falta probar de verdad: registrar la condición **no mueve la
 * copia** —sigue en `ALQUILADA`—, así que si el grupo no excluyera las que ya tienen
 * envío de salida, lo preparado se quedaría en la cola para siempre.
 *
 * El montaje va por API y la prueba **cierra su circuito**: devuelve la copia a
 * `DISPONIBLE` antes de terminar, o la segunda ejecución empezaría con residuo.
 */

test("una copia adjudicada espera en la cola hasta que se prepara su envío", async ({
  page,
  request,
}) => {
  // Cuenta propia: Ana tiene dos plazas y el circuito completo, que corre en paralelo,
  // también se las gasta.
  const email = `preparacion-${Date.now()}@example.test`;
  const rental = await alquilar(request, email);

  await login(page, "operador@clickoteca.test");
  // Anclado a la copia y no a la fila del set: otra prueba en paralelo puede tener otra
  // copia del mismo set esperando en la cola.
  const enCola = () => enlaceDeEntrega(page, rental.copyId);

  await test.step("aparece en «Por preparar», que es el grupo nuevo", async () => {
    await expect(page.getByRole("heading", { name: /Por preparar/ })).toBeVisible();
    await expect(enCola()).toHaveCount(1);
  });

  await test.step("registrar la condición la saca de la cola", async () => {
    await apiLogin(request, "operador@clickoteca.test");
    const informe = await request.post(`/api/rentals/${rental.id}/delivery`, {
      // Las dos casillas del catálogo ratificado (§4.3): el esquema rechaza cualquier
      // otra clave, así que esto prueba también que la lista es la que se acordó.
      data: { result: "OK", checklist: { pieceCount: true, manual: true } },
    });
    expect(informe.status(), await informe.text()).toBe(201);

    // La copia **sigue en ALQUILADA**; lo que la saca es tener envío de salida.
    await page.reload();
    await expect(enCola()).toHaveCount(0);
  });

  await test.step("cierre: la copia vuelve a estar disponible", async () => {
    await cerrarCircuito(request, email, rental);
  });
});

test("la lista de comprobación solo acepta el catálogo acordado", async ({ request }) => {
  const email = `checklist-${Date.now()}@example.test`;
  const rental = await alquilar(request, email);

  await apiLogin(request, "operador@clickoteca.test");

  await test.step("una casilla inventada se rechaza", async () => {
    const respuesta = await request.post(`/api/rentals/${rental.id}/delivery`, {
      data: { result: "OK", checklist: { piezas: "completas" } },
    });
    expect(respuesta.status()).toBe(422);
  });

  await test.step("media lista también: los dos informes deben ser comparables", async () => {
    const respuesta = await request.post(`/api/rentals/${rental.id}/delivery`, {
      data: { result: "OK", checklist: { pieceCount: true } },
    });
    expect(respuesta.status()).toBe(422);
  });

  await test.step("cierre: la copia vuelve a estar disponible", async () => {
    await cerrarCircuito(request, email, rental);
  });
});

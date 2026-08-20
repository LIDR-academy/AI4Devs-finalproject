import { expect, test, type APIRequestContext } from "./fixtures";
import { apiLogin, login, registrarSuscriptora } from "./sesion";

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

interface Rental {
  id: string;
  copyId: string;
  setId: string;
  setName: string;
}

/** Un set con copias de sobra: los de una sola copia se los disputa el circuito completo. */
async function setConVariasCopias(request: APIRequestContext): Promise<string> {
  const catalog = await request.get("/api/catalog?limit=48");
  const { sets } = (await catalog.json()) as { sets: Array<{ id: string; name: string }> };

  for (const candidate of sets) {
    const detail = await request.get(`/api/catalog/${candidate.id}`);
    const { set } = (await detail.json()) as {
      set: { availableCopies: number; totalCopies: number; restricted: boolean };
    };
    if (set.availableCopies >= 2 && !set.restricted) return candidate.id;
  }
  throw new Error("hace falta un set con al menos dos copias libres");
}

test("una copia adjudicada espera en la cola hasta que se prepara su envío", async ({
  page,
  request,
}) => {
  // Cuenta propia: Ana tiene dos plazas y el circuito completo, que corre en paralelo,
  // también se las gasta.
  const email = `preparacion-${Date.now()}@example.test`;
  await registrarSuscriptora(request, email, "PREMIUM");
  await apiLogin(request, email);
  const setId = await setConVariasCopias(request);

  const asignada = await request.post(`/api/sets/${setId}/rentals`);
  expect(asignada.status(), await asignada.text()).toBe(201);
  const { rental } = (await asignada.json()) as { rental: Rental };

  await login(page, "operador@clickoteca.test");
  const fila = () => page.getByRole("row").filter({ hasText: rental.setName });

  await test.step("aparece en «Por preparar», que es el grupo nuevo", async () => {
    await expect(page.getByRole("heading", { name: /Por preparar/ })).toBeVisible();
    await expect(fila()).toHaveCount(1);
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
    await expect(fila()).toHaveCount(0);
  });

  await test.step("cierre: la copia vuelve a estar disponible", async () => {
    await apiLogin(request, email);
    expect((await request.post(`/api/rentals/${rental.id}/return`)).ok()).toBeTruthy();

    await apiLogin(request, "operador@clickoteca.test");
    for (const to of ["EN_INSPECCION", "EN_HIGIENIZACION", "DISPONIBLE"]) {
      const movida = await request.post(`/api/copies/${rental.copyId}/transitions`, {
        data: { to, reason: "Cierre de la prueba de preparación" },
      });
      expect(movida.ok(), await movida.text()).toBeTruthy();
    }
  });
});

test("la lista de comprobación solo acepta el catálogo acordado", async ({ request }) => {
  const email = `checklist-${Date.now()}@example.test`;
  await registrarSuscriptora(request, email, "PREMIUM");
  await apiLogin(request, email);
  const setId = await setConVariasCopias(request);
  const asignada = await request.post(`/api/sets/${setId}/rentals`);
  const { rental } = (await asignada.json()) as { rental: Rental };

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
    await apiLogin(request, email);
    expect((await request.post(`/api/rentals/${rental.id}/return`)).ok()).toBeTruthy();

    await apiLogin(request, "operador@clickoteca.test");
    for (const to of ["EN_INSPECCION", "EN_HIGIENIZACION", "DISPONIBLE"]) {
      const movida = await request.post(`/api/copies/${rental.copyId}/transitions`, {
        data: { to, reason: "Cierre de la prueba de comprobaciones" },
      });
      expect(movida.ok(), await movida.text()).toBeTruthy();
    }
  });
});

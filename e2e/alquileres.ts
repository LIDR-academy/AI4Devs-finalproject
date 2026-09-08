import { expect, type APIRequestContext, type Page } from "./fixtures";
import { apiLogin, registrarSuscriptora } from "./sesion";

/**
 * Montaje y desmontaje de un alquiler por API, compartido por las pruebas que necesitan
 * una copia en manos de alguien.
 *
 * Vive fuera de las pruebas por la misma razón que el inicio de sesión: lo usan la
 * auditoría de accesibilidad y los recorridos de entrega, y duplicarlo garantizaría que
 * un día se arregle solo uno.
 */

export interface Rental {
  id: string;
  copyId: string;
  setName: string;
}

/** Un set con copias de sobra: los de una sola se los disputa el circuito completo. */
export async function setConVariasCopias(request: APIRequestContext): Promise<string> {
  const catalog = await request.get("/api/catalog?limit=48");
  const { sets } = (await catalog.json()) as { sets: Array<{ id: string }> };

  for (const candidate of sets) {
    const detail = await request.get(`/api/catalog/${candidate.id}`);
    const { set } = (await detail.json()) as {
      set: { availableCopies: number; restricted: boolean };
    };
    if (set.availableCopies >= 2 && !set.restricted) return candidate.id;
  }
  throw new Error("hace falta un set con al menos dos copias libres");
}

/**
 * Da de alta una suscriptora nueva y le asigna una copia.
 *
 * Cuenta propia por prueba: alquilar, devolver o pausar son cambios sobre el suscriptor
 * entero, y las cuentas sembradas las usa el circuito completo, que corre en paralelo.
 */
export async function alquilar(request: APIRequestContext, email: string): Promise<Rental> {
  await registrarSuscriptora(request, email, "PREMIUM");
  await apiLogin(request, email);

  const setId = await setConVariasCopias(request);
  const asignada = await request.post(`/api/sets/${setId}/rentals`);
  expect(asignada.status(), await asignada.text()).toBe(201);
  return ((await asignada.json()) as { rental: Rental }).rental;
}

/**
 * Devuelve el mundo como estaba: la copia acaba en `DISPONIBLE`. Sin esto, la segunda
 * ejecución arranca con residuo — que ya pasó, y solo se nota al día siguiente.
 *
 * **Es "haz lo que puedas" a propósito**, y se llama desde un `finally`: cuando una
 * prueba falla a mitad, la copia puede estar en cualquier punto del circuito, y una
 * limpieza que exigiera que todos los pasos valieran dejaría el residuo justo en el
 * caso en que más molesta. Los pasos que ya no aplican se saltan sin ruido; lo que la
 * prueba comprueba de verdad va en su cuerpo, no aquí.
 */
export async function cerrarCircuito(
  request: APIRequestContext,
  email: string,
  rental: Rental
): Promise<void> {
  await apiLogin(request, email);
  await request.post(`/api/rentals/${rental.id}/return`);

  await apiLogin(request, "operador@clickoteca.test");
  for (const to of ["EN_INSPECCION", "EN_HIGIENIZACION", "DISPONIBLE"]) {
    await request.post(`/api/copies/${rental.copyId}/transitions`, {
      data: { to, reason: "Cierre de una prueba E2E" },
    });
  }
}

/**
 * El enlace "Registrar y enviar" de **esa copia** en la cola de trabajo.
 *
 * Por `href` y no por la fila del set: la cola identifica copias, y dos pruebas en
 * paralelo pueden tener dos copias del mismo set — que es justo lo que rompió esto la
 * primera vez.
 */
export function enlaceDeEntrega(page: Page, copyId: string) {
  return page.locator(`a[href="/backoffice/copias/${copyId}/entrega"]`);
}

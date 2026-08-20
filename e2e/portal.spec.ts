import { expect, test } from "./fixtures";
import { login, registrarSuscriptora } from "./sesion";

/**
 * Portal ampliado — W5 (`wireframes.md` §7).
 *
 * Todo el recorrido va sobre una **cuenta recién creada**, no sobre las de la semilla:
 * pausar y cancelar son cambios de estado sobre el suscriptor entero, y hacerlo sobre
 * Ana o Bruno chocaría con el circuito completo, que corre en paralelo y cuenta con
 * que su suscripción esté activa. Una cuenta propia hace la prueba repetible.
 */

test("las cinco pantallas del portal, y sus vacíos", async ({ page, request }) => {
  const email = `portal-${Date.now()}@example.test`;
  await registrarSuscriptora(request, email);
  await login(page, email);

  const nav = page.getByRole("navigation", { name: "Portal" });
  for (const destino of ["Resumen", "Mis sets", "Historial", "Suscripción", "Avisos"]) {
    await expect(nav.getByRole("link", { name: destino })).toBeVisible();
  }

  await test.step("el resumen responde «¿puedo pedir un set?»", async () => {
    // El dato que explica por adelantado el PLAN_LIMIT_REACHED de la ficha de set.
    const ahora = page.getByRole("region", { name: "Ahora mismo" });
    await expect(ahora).toContainText("0 de 1 plazas ocupadas");
    await expect(ahora).toContainText("0 colas activas");
  });

  await test.step("mis sets: dos vacíos, los dos con salida", async () => {
    await nav.getByRole("link", { name: "Mis sets" }).click();
    await page.waitForURL("/portal/sets");
    await expect(page.getByText("No tienes ningún set ahora mismo")).toBeVisible();
    await expect(page.getByText("No estás en ninguna cola")).toBeVisible();
  });

  await test.step("historial y avisos vacíos", async () => {
    await nav.getByRole("link", { name: "Historial" }).click();
    await page.waitForURL("/portal/historial");
    await expect(page.getByText("Aún no has alquilado nada")).toBeVisible();

    await nav.getByRole("link", { name: "Avisos" }).click();
    await page.waitForURL("/portal/avisos");
    await expect(page.getByText("Nada nuevo")).toBeVisible();
  });
});

test("suscripción: cambiar de plan, pausar, reactivar y cancelar", async ({ page, request }) => {
  const email = `suscripcion-${Date.now()}@example.test`;
  await registrarSuscriptora(request, email);
  await login(page, email);
  await page.goto("/portal/suscripcion");

  const actual = page.getByRole("region", { name: "Plan actual" });
  await expect(actual.getByText("Basic", { exact: true })).toBeVisible();
  await expect(actual.getByText("Activa", { exact: true })).toBeVisible();

  await test.step("subir de plan es inmediato", async () => {
    await page.getByRole("region", { name: "Cambiar de plan" }).getByRole("button").click();
    await expect(actual.getByText("Premium", { exact: true })).toBeVisible();
  });

  await test.step("pausar y reactivar", async () => {
    await page.getByRole("button", { name: "Pausar" }).click();
    await expect(actual.getByText("En pausa", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Reactivar" }).click();
    await expect(actual.getByText("Activa", { exact: true })).toBeVisible();
  });

  await test.step("cancelar pide confirmación y es definitivo", async () => {
    await page.getByRole("button", { name: "Cancelar la suscripción" }).click();

    // `alertdialog`, no `dialog`: interrumpe pidiendo una decisión y no se cierra
    // pinchando fuera. Volver atrás no cambia nada.
    const confirmacion = page.getByRole("alertdialog");
    await expect(confirmacion).toContainText("definitivo");
    await confirmacion.getByRole("button", { name: "Volver" }).click();
    await expect(actual.getByText("Activa", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Cancelar la suscripción" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Sí, cancelar" }).click();

    // Una suscripción cancelada ya no rige: la pantalla pasa al vacío con salida.
    await expect(page.getByText("No tienes ningún plan activo")).toBeVisible();
  });
});

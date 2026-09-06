import { expect, test } from "./fixtures";

test("la landing pública carga y muestra el CTA principal", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Alquila sets de LEGO/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Empezar ahora/i })).toBeVisible();
});

test("el health check responde ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  await expect(res.json()).resolves.toMatchObject({ status: "ok" });
});

/**
 * El paquete autónomo (`output: "standalone"`) **no incluye `.next/static`**: copiarlo
 * es trabajo del despliegue, y si se olvida las páginas siguen respondiendo 200
 * mientras el navegador se queda sin CSS ni JS. El evento `load` no se entera —un
 * chunk con 404 no lo impide—, así que se mira el tráfico.
 */
test("el paquete autónomo sirve sus estáticos", async ({ page }) => {
  const estaticos: string[] = [];
  const fallidos: string[] = [];
  page.on("response", (response) => {
    if (!response.url().includes("/_next/static/")) return;
    estaticos.push(response.url());
    if (!response.ok()) fallidos.push(`${response.status()} ${response.url()}`);
  });

  await page.goto("/");

  // Sin esta comprobación el test pasaría también si la página no pidiera nada.
  expect(estaticos.length).toBeGreaterThan(0);
  expect(fallidos).toEqual([]);
});

/**
 * El disparador de trabajos periódicos, **cerrado por defecto**. El servidor del E2E no
 * define `CRON_SECRET`, que es justo el despliegue al que se le olvidó la variable: lo
 * que se comprueba es que ahí no hay endpoint que valga, ni siquiera para quien traiga
 * una credencial. Un `curl` en bucle a esta URL no puede caducar ofertas ajenas.
 */
test("sin CRON_SECRET no hay disparador de cron", async ({ request }) => {
  const res = await request.get("/api/cron/offers", {
    headers: { authorization: "Bearer loquesea" },
  });
  expect(res.status()).toBe(404);
  await expect(res.json()).resolves.toMatchObject({ code: "NOT_FOUND" });
});

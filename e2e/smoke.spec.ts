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

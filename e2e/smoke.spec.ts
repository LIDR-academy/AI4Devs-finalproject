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

import { test, expect } from "@playwright/test";

test("home page renders key sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Decentralized. Secure. Permanent." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Docs" }).first()).toBeVisible();
});

test("mobile navigation toggles", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  await page.locator("#mobile-nav a[href='/upload']").first().click({ force: true });
  await expect(page).toHaveURL(/\/upload$/);
});

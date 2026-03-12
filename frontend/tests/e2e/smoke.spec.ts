import { test, expect } from "@playwright/test";

let sharedCredentials: { email: string; apiKey: string } | null = null;

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
  await expect(page).toHaveURL(/\/login\?next=%2Fupload$/);
});

test("user can register and continue to dashboard", async ({ page }) => {
  const uniqueEmail = `qa-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "password");

  await page.locator("#email").fill(uniqueEmail);
  await page.locator("#password").fill("StrongPass1!");
  await page.locator("#confirmPassword").fill("StrongPass1!");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Your API key is ready")).toBeVisible();
  await expect(page.locator("code")).toContainText("ipfs_gw_");

  sharedCredentials = {
    email: uniqueEmail,
    apiKey: (await page.locator("code").first().innerText()).trim(),
  };

  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "User Dashboard" })).toBeVisible();
  await expect(page.getByText("Account Overview")).toBeVisible();
});

test("dashboard route redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Log in with your API key" })).toBeVisible();
});

test("user can login with API key and reach dashboard", async ({ page }) => {
  if (!sharedCredentials) {
    throw new Error("Missing shared credentials from registration flow");
  }

  await page.goto("/login");
  await page.locator("#login-email").fill(sharedCredentials.email);
  await page.locator("#apiKey").fill(sharedCredentials.apiKey);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button", { name: "Logout" }).first().click();
  await expect(page).toHaveURL(/\/login/);

  await page.locator("#login-email").fill(sharedCredentials.email);
  await page.locator("#apiKey").fill(sharedCredentials.apiKey);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

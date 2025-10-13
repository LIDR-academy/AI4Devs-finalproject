import { test, expect } from '@playwright/test';

test('homepage has title and links', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page.locator('h1')).toContainText('Welcome to Your App');

  // Expect the login link to be visible
  const loginLink = page.getByRole('link', { name: 'Login' });
  await expect(loginLink).toBeVisible();
});

test('can navigate to login page', async ({ page }) => {
  await page.goto('/');

  // Click the login link
  await page.getByRole('link', { name: 'Login' }).click();

  // Expect to be on the login page
  await expect(page).toHaveURL('/login');
  await expect(page.locator('h2')).toContainText('Login');
});
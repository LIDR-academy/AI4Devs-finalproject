const { test, expect } = require('@playwright/test');

test('Primary button story loads', async ({ page }) => {
  await page.goto('/?path=/story/example-button--primary');

  // Verify the story page loaded
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  expect(page.url()).toContain('example-button--primary');
});

test('Secondary button story loads', async ({ page }) => {
  await page.goto('/?path=/story/example-button--secondary');

  // Verify the story page loaded
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  expect(page.url()).toContain('example-button--secondary');
});

test('Button story content is present', async ({ page }) => {
  await page.goto('/?path=/story/example-button--primary');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  // Button is a React Native Pressable, look for text inside it
  const buttonText = canvas.locator('text=Button').first();
  await expect(buttonText).toBeVisible();
});

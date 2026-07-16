const { test, expect } = require('@playwright/test');

const story = (name) => `/?path=/story/organisms-mobilebar--${name}`;

test('Content story renders mobile top and bottom navigation', async ({ page }) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Home').first()).toBeVisible();
  await expect(canvas.locator('text=New lesson').first()).toBeVisible();
  await expect(canvas.locator('text=HL').first()).toBeVisible();
});

test('WithSafeArea story renders bottom navigation', async ({ page }) => {
  await page.goto(story('with-safe-area'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Home').first()).toBeVisible();
  await expect(canvas.locator('text=New lesson').first()).toBeVisible();
});

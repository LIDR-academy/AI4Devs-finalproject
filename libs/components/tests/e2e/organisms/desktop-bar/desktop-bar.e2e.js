const { test, expect } = require('@playwright/test');

const story = (name) => `/?path=/story/organisms-desktopbar--${name}`;

test('Content story renders desktop navigation chrome', async ({ page }) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=AI Study Buddy').first()).toBeVisible();
  await expect(canvas.locator('text=Home').first()).toBeVisible();
  await expect(canvas.locator('text=New lesson').first()).toBeVisible();
  await expect(canvas.locator('text=HL').first()).toBeVisible();
});

test('Alerts badge story remains visual-only', async ({ page }) => {
  await page.goto(story('alerts-badge'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=notifications').first()).toBeVisible();
  await expect(canvas.locator('text=2').first()).toBeVisible();
});

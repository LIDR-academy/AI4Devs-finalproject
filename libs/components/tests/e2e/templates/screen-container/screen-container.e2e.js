const { test, expect } = require('@playwright/test');

// Title 'Templates/ScreenContainer' → slug 'templates-screencontainer'.
const story = (name) => `/?path=/story/templates-screencontainer--${name}`;

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('templates-screencontainer--default');
});

test('Default story renders screen content', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Screen content').first()).toBeVisible();
});

test('CustomStyle story renders custom background content', async ({ page }) => {
  await page.goto(story('custom-style'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=With custom background').first()).toBeVisible();
});

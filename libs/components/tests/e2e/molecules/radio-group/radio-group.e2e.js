const { test, expect } = require('@playwright/test');

// Title 'Molecules/RadioGroup' → slug 'molecules-radiogroup'.
const story = (name) => `/?path=/story/molecules-radiogroup--${name}`;

test('Interactive story loads', async ({ page }) => {
  await page.goto(story('interactive'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('molecules-radiogroup--interactive');
});

test('Interactive story renders every option', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Short lesson (5–8 slides)').first()).toBeVisible();
  await expect(canvas.locator('text=Standard lesson (10–14 slides)').first()).toBeVisible();
  await expect(canvas.locator('text=Deep dive (16+ slides)').first()).toBeVisible();
});

test('Row story renders Easy Medium Hard', async ({ page }) => {
  await page.goto(story('row'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Easy').first()).toBeVisible();
  await expect(canvas.locator('text=Medium').first()).toBeVisible();
  await expect(canvas.locator('text=Hard').first()).toBeVisible();
});

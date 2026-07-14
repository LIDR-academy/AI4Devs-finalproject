const { test, expect } = require('@playwright/test');

// Title 'Atoms/Switch' → slug 'atoms-switch'.
const story = (name) => `/?path=/story/atoms-switch--${name}`;

test('Interactive story loads', async ({ page }) => {
  await page.goto(story('interactive'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-switch--interactive');
});

test('Interactive story renders the label', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Shuffle activities').first()).toBeVisible();
});

test('On story renders the label', async ({ page }) => {
  await page.goto(story('on'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Shuffle activities').first()).toBeVisible();
});

test('Disabled story renders the label', async ({ page }) => {
  await page.goto(story('disabled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Shuffle activities').first()).toBeVisible();
});

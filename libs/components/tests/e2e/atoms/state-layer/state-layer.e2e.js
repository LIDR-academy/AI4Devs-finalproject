const { test, expect } = require('@playwright/test');

// Title 'Atoms/StateLayer' → slug 'atoms-statelayer'.
const story = (name) => `/?path=/story/atoms-statelayer--${name}`;

test('Hover story loads', async ({ page }) => {
  await page.goto(story('hover'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-statelayer--hover');
});

test('Hover story renders the Container label', async ({ page }) => {
  await page.goto(story('hover'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Container').first()).toBeVisible();
});

test('Press story renders the Container label', async ({ page }) => {
  await page.goto(story('press'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Container').first()).toBeVisible();
});

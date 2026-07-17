const { test, expect } = require('@playwright/test');

// Title 'Atoms/ProgressIndicator' → slug 'atoms-progressindicator'.
const story = (name) => `/?path=/story/atoms-progressindicator--${name}`;

test('LinearDeterminate story loads', async ({ page }) => {
  await page.goto(story('linear-determinate'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-progressindicator--linear-determinate');
});

test('LinearIndeterminate story loads a progress affordance', async ({ page }) => {
  await page.goto(story('linear-indeterminate'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('[role="progressbar"]').first()).toBeVisible();
});

test('CircularIndeterminate story loads a progress affordance', async ({ page }) => {
  await page.goto(story('circular-indeterminate'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('[role="progressbar"]').first()).toBeVisible();
});

const { test, expect } = require('@playwright/test');

// Title 'Atoms/Button' → slug 'atoms-button'.
const story = (name) => `/?path=/story/atoms-button--${name}`;

test('Filled story loads', async ({ page }) => {
  await page.goto(story('filled'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-button--filled');
});

test('Filled story renders the label', async ({ page }) => {
  await page.goto(story('filled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Generate lesson').first()).toBeVisible();
});

test('Disabled story shows a disabled control', async ({ page }) => {
  await page.goto(story('disabled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  const label = canvas.locator('text=Generate lesson').first();
  await expect(label).toBeVisible();
  await expect(
    label.locator('xpath=ancestor::*[(@aria-disabled="true") or (@disabled)][1]'),
  ).toBeVisible();
});

test('Sizes story renders Small Medium Large', async ({ page }) => {
  await page.goto(story('sizes'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Small').first()).toBeVisible();
  await expect(canvas.locator('text=Medium').first()).toBeVisible();
  await expect(canvas.locator('text=Large').first()).toBeVisible();
});

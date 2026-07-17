const { test, expect } = require('@playwright/test');

// Title 'Atoms/Chip' → slug 'atoms-chip'.
const story = (name) => `/?path=/story/atoms-chip--${name}`;

test('Assist story loads', async ({ page }) => {
  await page.goto(story('assist'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-chip--assist');
});

test('Assist story renders the chip label', async ({ page }) => {
  await page.goto(story('assist'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Biology').first()).toBeVisible();
});

test('FilterGroup story renders every filter option', async ({ page }) => {
  await page.goto(story('filter-group'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Biology').first()).toBeVisible();
  await expect(canvas.locator('text=History').first()).toBeVisible();
  await expect(canvas.locator('text=Physics').first()).toBeVisible();
  await expect(canvas.locator('text=Spanish').first()).toBeVisible();
});

test('Input story renders the file chip label', async ({ page }) => {
  await page.goto(story('input'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=chapter-3.pdf').first()).toBeVisible();
});

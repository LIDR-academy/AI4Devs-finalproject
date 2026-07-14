const { test, expect } = require('@playwright/test');

// Title 'Atoms/IconButton' → slug 'atoms-iconbutton'.
const story = (name) => `/?path=/story/atoms-iconbutton--${name}`;

test('Standard story loads', async ({ page }) => {
  await page.goto(story('standard'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-iconbutton--standard');
});

test('Standard story exposes the Bookmark affordance', async ({ page }) => {
  await page.goto(story('standard'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.getByLabel('Bookmark')).toBeVisible();
});

test('Variants story exposes each icon button label', async ({ page }) => {
  await page.goto(story('variants'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.getByLabel('More')).toBeVisible();
  await expect(canvas.getByLabel('Bookmark')).toBeVisible();
  await expect(canvas.getByLabel('Link')).toBeVisible();
  await expect(canvas.getByLabel('Quiz')).toBeVisible();
});

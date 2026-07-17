const { test, expect } = require('@playwright/test');

// Title 'Atoms/Badge' → slug 'atoms-badge'.
const story = (name) => `/?path=/story/atoms-badge--${name}`;

test('Count story loads', async ({ page }) => {
  await page.goto(story('count'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-badge--count');
});

test('Count story renders the badge count', async ({ page }) => {
  await page.goto(story('count'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=3').first()).toBeVisible();
});

test('Overflow story renders the capped count', async ({ page }) => {
  await page.goto(story('overflow'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=99+').first()).toBeVisible();
});

test('Anchored story renders notification affordances', async ({ page }) => {
  await page.goto(story('anchored'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.getByLabel('Notifications').first()).toBeVisible();
  await expect(canvas.locator('text=3').first()).toBeVisible();
});

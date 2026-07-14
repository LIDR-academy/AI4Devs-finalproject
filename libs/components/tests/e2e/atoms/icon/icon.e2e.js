const { test, expect } = require('@playwright/test');

// Title 'Atoms/Icon' → slug 'atoms-icon'.
const story = (name) => `/?path=/story/atoms-icon--${name}`;

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-icon--default');
});

test('CommonGlyphs story loads', async ({ page }) => {
  await page.goto(story('common-glyphs'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-icon--common-glyphs');
});

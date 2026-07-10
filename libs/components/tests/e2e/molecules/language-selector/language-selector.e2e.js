const { test, expect } = require('@playwright/test');

// Title 'Molecules/LanguageSelector' → slug 'molecules-languageselector'.
const story = (name) => `/?path=/story/molecules-languageselector--${name}`;

test('English story loads', async ({ page }) => {
  await page.goto(story('english'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('molecules-languageselector--english');
});

test('renders all four languages in their own names', async ({ page }) => {
  await page.goto(story('english'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=English')).toBeVisible();
  await expect(canvas.locator('text=Español')).toBeVisible();
  await expect(canvas.locator('text=Português')).toBeVisible();
  await expect(canvas.locator('text=Deutsch')).toBeVisible();
});

test('German story marks Deutsch active with a check indicator', async ({ page }) => {
  await page.goto(story('german'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Deutsch')).toBeVisible();
  // The active option shows a Material Symbols "check" ligature (non-color indicator).
  await expect(canvas.getByText('check', { exact: true })).toBeVisible();
});

test('Interactive story lets the user switch languages on the web', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.locator('text=Português').click();
  await expect(canvas.locator('text=Português')).toBeVisible();
  await expect(canvas.getByText('check', { exact: true })).toBeVisible();
});

test('Disabled story renders the options', async ({ page }) => {
  await page.goto(story('disabled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Español')).toBeVisible();
});

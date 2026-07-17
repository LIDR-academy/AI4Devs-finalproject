const { test, expect } = require('@playwright/test');

// Title 'Atoms/Checkbox' → slug 'atoms-checkbox'.
const story = (name) => `/?path=/story/atoms-checkbox--${name}`;

test('Interactive story loads', async ({ page }) => {
  await page.goto(story('interactive'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-checkbox--interactive');
});

test('Interactive story renders the label', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Include quick checks').first()).toBeVisible();
});

test('Checked story renders the checked label', async ({ page }) => {
  await page.goto(story('checked'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Include quick checks').first()).toBeVisible();
});

test('States story renders every state label', async ({ page }) => {
  await page.goto(story('states'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Unchecked').first()).toBeVisible();
  await expect(canvas.locator('text=Checked').first()).toBeVisible();
  await expect(canvas.locator('text=Indeterminate').first()).toBeVisible();
  await expect(canvas.locator('text=Disabled').first()).toBeVisible();
});

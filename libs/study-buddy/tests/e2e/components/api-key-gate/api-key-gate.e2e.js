const { test, expect } = require('@playwright/test');

// Title 'Features/ApiKeyGate' → slug 'features-apikeygate'.
const story = (name) => `/?path=/story/features-apikeygate--${name}`;

test('Loading story loads (blank while status resolves)', async ({ page }) => {
  await page.goto(story('loading'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-apikeygate--loading');
});

test('RequiresKey story renders the notice and action', async ({ page }) => {
  await page.goto(story('requires-key'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(
    canvas.getByText('An API key is required to generate lessons.', { exact: true }),
  ).toBeVisible();
  await expect(canvas.getByText('Add API key', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Generation entry content', { exact: true })).toHaveCount(0);
});

test('WithKey story renders children', async ({ page }) => {
  await page.goto(story('with-key'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Generation entry content', { exact: true })).toBeVisible();
  await expect(
    canvas.getByText('An API key is required to generate lessons.', { exact: true }),
  ).toHaveCount(0);
});

const { test, expect } = require('@playwright/test');

// Title 'Features/AppChrome' → slug 'features-appchrome'.
const story = (name) => `/?path=/story/features-appchrome--${name}`;

test('Content story loads the signed-in chrome', async ({ page }) => {
  await page.goto(story('content'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.getByText('My lessons', { exact: true })).toBeVisible();
  await expect(canvas.getByText('New lesson', { exact: true })).toBeVisible();
  await expect(canvas.getByText('AL', { exact: true })).toBeVisible();
});

test('Loading story renders chrome without an invented identity', async ({ page }) => {
  await page.goto(story('loading'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('My lessons', { exact: true })).toBeVisible();
  await expect(canvas.getByText('AL', { exact: true })).toHaveCount(0);
});

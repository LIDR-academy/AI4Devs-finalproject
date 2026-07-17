const { test, expect } = require('@playwright/test');

// Title 'Features/ApiKeyGate' → slug 'features-apikeygate'.
const story = (name) => `/?path=/story/features-apikeygate--${name}`;

test('Loading story loads (blank while status resolves)', async ({ page }) => {
  await page.goto(story('loading'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-apikeygate--loading');
});

test('CannotCreate story renders the blocked message and keeps children', async ({ page }) => {
  await page.goto(story('cannot-create'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(
    canvas.getByText("You can't create lessons. Please contact support.", { exact: true }),
  ).toBeVisible();
  await expect(canvas.getByText('Generation entry content', { exact: true })).toBeVisible();
});

test('WithKey story renders children', async ({ page }) => {
  await page.goto(story('with-key'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Generation entry content', { exact: true })).toBeVisible();
  await expect(
    canvas.getByText("You can't create lessons. Please contact support.", { exact: true }),
  ).toHaveCount(0);
});

test('Paid story renders children without blocked message', async ({ page }) => {
  await page.goto(story('paid'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Generation entry content', { exact: true })).toBeVisible();
  await expect(
    canvas.getByText("You can't create lessons. Please contact support.", { exact: true }),
  ).toHaveCount(0);
});

test('Error story renders retry and keeps children', async ({ page }) => {
  await page.goto(story('error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText("We couldn't load your plan.", { exact: true })).toBeVisible();
  await expect(canvas.getByText('Try again', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Generation entry content', { exact: true })).toBeVisible();
});

const { test, expect } = require('@playwright/test');

// Title 'Features/ApiKeySettings' → slug 'features-apikeysettings'.
const story = (name) => `/?path=/story/features-apikeysettings--${name}`;

test('Empty story loads', async ({ page }) => {
  await page.goto(story('empty'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-apikeysettings--empty');
});

test('Empty story renders labelled input, guidance, and disabled Save', async ({ page }) => {
  await page.goto(story('empty'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('[aria-label="API key"]')).toBeVisible();
  await expect(canvas.locator("text=Don't have a key? Get one from Groq").first()).toBeVisible();

  const saveControl = canvas.locator('text=Save').first().locator('xpath=ancestor::button[1]');
  await expect(saveControl).toBeDisabled();
});

test('Saved story renders Replace/Remove and masked status', async ({ page }) => {
  await page.goto(story('saved'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Groq key saved').first()).toBeVisible();
  await expect(canvas.locator('text=Replace').first()).toBeVisible();
  await expect(canvas.locator('text=Remove').first()).toBeVisible();
});

test('Loading story hides plan-sensitive settings', async ({ page }) => {
  await page.goto(story('loading'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('[aria-label="API key"]')).toHaveCount(0);
  await expect(canvas.locator('text=Save')).toHaveCount(0);
});

test('NetworkError story renders the alert banner', async ({ page }) => {
  await page.goto(story('network-error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const alert = canvas.locator('[role="alert"]');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("Couldn't reach the server. Try again.");
});

test('Paid story hides key settings with a saved key', async ({ page }) => {
  await page.goto(story('paid'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('[aria-label="API key"]')).toHaveCount(0);
  await expect(canvas.locator('text=Groq key saved')).toHaveCount(0);
});

test('EntitlementsError story renders retry and hides key settings', async ({ page }) => {
  await page.goto(story('entitlements-error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText("We couldn't load your plan.", { exact: true })).toBeVisible();
  await expect(canvas.getByText('Try again', { exact: true })).toBeVisible();
  await expect(canvas.locator('[aria-label="API key"]')).toHaveCount(0);
});

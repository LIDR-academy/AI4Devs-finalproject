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

test('Loading story shows progress and hides Save', async ({ page }) => {
  await page.goto(story('loading'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('[role="progressbar"]')).toBeVisible();
  await expect(canvas.locator('text=Save')).toHaveCount(0);
});

test('NetworkError story renders the alert banner', async ({ page }) => {
  await page.goto(story('network-error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const alert = canvas.locator('[role="alert"]');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("Couldn't reach the server. Try again.");
});

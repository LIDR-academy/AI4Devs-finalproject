const { test, expect } = require('@playwright/test');

// Title 'Organisms/ApiKeyRequiredNotice' → slug 'organisms-apikeyrequirednotice'.
const story = (name) => `/?path=/story/organisms-apikeyrequirednotice--${name}`;

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-apikeyrequirednotice--default');
});

// @s10 — the guard-rail message is rendered inline.
test('Default story renders the required-key message', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=An API key is required to generate lessons.')).toBeVisible();
});

// @s10/@s14 — the action exposes a button role and is enabled (navigates to the account screen).
test('Default story renders an enabled action control', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const actionLabel = canvas.locator('text=Add API key').first();
  const actionControl = actionLabel.locator('xpath=ancestor::button[1]');
  await expect(actionControl).toBeEnabled();
});

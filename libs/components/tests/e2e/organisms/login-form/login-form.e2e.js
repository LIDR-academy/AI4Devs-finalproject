const { test, expect } = require('@playwright/test');

// Title 'Organisms/LoginForm' → slug 'organisms-loginform'.
const story = (name) => `/?path=/story/organisms-loginform--${name}`;

test('Empty story loads', async ({ page }) => {
  await page.goto(story('empty'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-loginform--empty');
});

test('Empty story renders both fields and a disabled submit control', async ({ page }) => {
  await page.goto(story('empty'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Email').first()).toBeVisible();
  await expect(canvas.locator('text=Password').first()).toBeVisible();

  const submitLabel = canvas.locator('text=Log in').first();
  const submitControl = submitLabel.locator('xpath=ancestor::button[1]');
  await expect(submitControl).toBeDisabled();
});

test('Content story renders filled fields and an enabled submit control', async ({ page }) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('input[value="user@example.com"]')).toBeVisible();

  const submitLabel = canvas.locator('text=Log in').first();
  const submitControl = submitLabel.locator('xpath=ancestor::button[1]');
  await expect(submitControl).toBeEnabled();
});

test('Loading story disables the submit control', async ({ page }) => {
  await page.goto(story('loading'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const submitLabel = canvas.locator('text=Log in').first();
  const submitControl = submitLabel.locator('xpath=ancestor::button[1]');
  await expect(submitControl).toBeDisabled();
});

test('Error story renders the auth-error banner text', async ({ page }) => {
  await page.goto(story('error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Invalid email or password')).toBeVisible();
});

test('ErrorInlineValidation story renders the field-level messages', async ({ page }) => {
  await page.goto(story('error-inline-validation'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Enter a valid email address')).toBeVisible();
  await expect(canvas.locator('text=Password is required')).toBeVisible();
});

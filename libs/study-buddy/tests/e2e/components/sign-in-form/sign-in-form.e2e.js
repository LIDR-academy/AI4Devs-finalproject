const { test, expect } = require('@playwright/test');

// Title 'Features/SignInForm' → slug 'features-signinform'.
const story = (name) => `/?path=/story/features-signinform--${name}`;

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-signinform--default');
});

test('Default story renders email/password and actions', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Email', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Password', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Log in', { exact: true })).toBeVisible();
  await expect(canvas.getByText('No account? Sign up', { exact: true })).toBeVisible();
});

test('shows inline error for malformed email', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByLabel('Email').fill('not-an-email');
  await canvas.getByLabel('Password').fill('secret1');
  await canvas.getByText('Log in', { exact: true }).click();

  await expect(canvas.getByText('Enter a valid email address', { exact: true })).toBeVisible();
});

test('Loading story shows Signing in affordance', async ({ page }) => {
  await page.goto(story('loading'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Signing in…', { exact: true })).toBeVisible();
});

test('InvalidCredentials story shows auth failure banner', async ({ page }) => {
  await page.goto(story('invalid-credentials'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Invalid email or password', { exact: true })).toBeVisible();
});

test('NetworkError story shows network banner', async ({ page }) => {
  await page.goto(story('network-error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Network error', { exact: true })).toBeVisible();
});

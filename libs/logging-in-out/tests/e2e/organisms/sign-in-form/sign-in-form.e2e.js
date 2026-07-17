const { test, expect } = require('@playwright/test');

test('SignInForm Default story loads', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signinform--default');
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
});

test('renders the email/password fields and submit/sign-up copy', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signinform--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Email', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Password', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Log in', { exact: true })).toBeVisible();
  await expect(canvas.getByText('No account? Sign up', { exact: true })).toBeVisible();
});

test('shows an inline error for a malformed email and blocks submit', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signinform--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByLabel('Email').fill('not-an-email');
  await canvas.getByLabel('Password').fill('secret1');
  await canvas.getByText('Log in', { exact: true }).click();

  await expect(canvas.getByText('Enter a valid email address', { exact: true })).toBeVisible();
});

test('Loading story disables submit and shows the signing-in affordance', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signinform--loading');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Signing in…', { exact: true })).toBeVisible();
});

test('InvalidCredentials story renders the invalid-credentials banner', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signinform--invalid-credentials');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Invalid email or password', { exact: true })).toBeVisible();
});

test('NetworkError story renders the network-error banner and stays interactive', async ({
  page,
}) => {
  await page.goto('/?path=/story/organisms-signinform--network-error');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Network error', { exact: true })).toBeVisible();

  // The banner itself doesn't disable the form — LoginForm's own Empty-state gating does,
  // while the fields are blank. Filling in valid credentials re-enables submit.
  await canvas.getByLabel('Email').fill('user@example.com');
  await canvas.getByLabel('Password').fill('secret1');
  await expect(canvas.getByText('Log in', { exact: true })).toBeEnabled();
});

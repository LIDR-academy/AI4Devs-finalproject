const { test, expect } = require('@playwright/test');

// Title 'Features/SignOut' → slug 'features-signout'.
const story = (name) => `/?path=/story/features-signout--${name}`;

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-signout--default');
});

test('renders the Log out trigger', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Log out', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Log out?', { exact: true })).toHaveCount(0);
});

test('pressing the trigger shows the confirmation dialog', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Log out', { exact: true }).click();

  await expect(canvas.getByText('Log out?', { exact: true })).toBeVisible();
  await expect(
    canvas.getByText("You'll need to sign in again to access your lessons.", { exact: true }),
  ).toBeVisible();
});

test('cancelling the dialog closes it', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Log out', { exact: true }).click();
  await canvas.getByText('Cancel', { exact: true }).click();

  await expect(canvas.getByText('Log out?', { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Log out', { exact: true })).toBeVisible();
});

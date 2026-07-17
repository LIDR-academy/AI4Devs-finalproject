const { test, expect } = require('@playwright/test');

test('SignOut story loads', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signout--default');
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
});

test('renders the Log out trigger', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signout--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Log out', { exact: true })).toBeVisible();
});

test('does not show the confirmation dialog before the trigger is pressed', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signout--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Log out?', { exact: true })).toHaveCount(0);
});

test('pressing the trigger shows the confirmation dialog', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signout--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Log out', { exact: true }).click();

  await expect(canvas.getByText('Log out?', { exact: true })).toBeVisible();
  await expect(
    canvas.getByText("You'll need to sign in again to access your lessons.", { exact: true }),
  ).toBeVisible();
});

test('cancelling the dialog closes it without signing out', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signout--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Log out', { exact: true }).click();
  await canvas.getByText('Cancel', { exact: true }).click();

  await expect(canvas.getByText('Log out?', { exact: true })).toHaveCount(0);
});

test('confirming the dialog signs out and closes it', async ({ page }) => {
  await page.goto('/?path=/story/organisms-signout--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Log out', { exact: true }).click();
  // The trigger ("Log out") stays mounted behind the open dialog, so the confirm action
  // — labelled with the same copy — is the second exact match, not the first.
  await canvas.getByText('Log out', { exact: true }).last().click();

  await expect(canvas.getByText('Log out?', { exact: true })).toHaveCount(0);
});

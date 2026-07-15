const { expect, test } = require('@playwright/test');

const previewFrame = (page) => page.frameLocator('iframe[title="storybook-preview-iframe"]');

test('AccountMenu default story loads', async ({ page }) => {
  await page.goto('/?path=/story/organisms-accountmenu--default');
  const canvas = previewFrame(page);

  await expect(canvas.locator('[aria-label="Open account menu"]')).toBeVisible();
});

test('AccountMenu opens with identity and actions', async ({ page }) => {
  await page.goto('/?path=/story/organisms-accountmenu--default');
  const canvas = previewFrame(page);

  await canvas.locator('[aria-label="Open account menu"]').click();

  const menu = canvas.locator('[data-testid="account-menu"]');
  await expect(menu.locator('text=Ada Lovelace')).toBeVisible();
  await expect(menu.locator('text=Settings')).toBeVisible();
  await expect(menu.locator('text=Sign out')).toBeVisible();
});

test('AccountMenu settings action closes the menu', async ({ page }) => {
  await page.goto('/?path=/story/organisms-accountmenu--default');
  const canvas = previewFrame(page);

  await canvas.locator('[aria-label="Open account menu"]').click();
  await canvas.locator('[data-testid="account-menu"]').locator('text=Settings').click();

  await expect(canvas.locator('text=Ada Lovelace')).not.toBeVisible();
});

test('AccountMenu Sign out action closes the menu', async ({ page }) => {
  await page.goto('/?path=/story/organisms-accountmenu--default');
  const canvas = previewFrame(page);

  await canvas.locator('[aria-label="Open account menu"]').click();
  await canvas.locator('[data-testid="account-menu"]').locator('text=Sign out').click();

  await expect(canvas.locator('text=Ada Lovelace')).not.toBeVisible();
});

test('AccountMenu closes when pressing outside the menu', async ({ page }) => {
  await page.goto('/?path=/story/organisms-accountmenu--default');
  const canvas = previewFrame(page);

  await canvas.locator('[aria-label="Open account menu"]').click();
  const preview = await page.locator('iframe[title="storybook-preview-iframe"]').boundingBox();
  await page.mouse.click(preview.x + 50, preview.y + 50);

  await expect(canvas.locator('[data-testid="account-menu"]')).not.toBeVisible();
});

test('AccountMenu closes with Escape', async ({ page }) => {
  await page.goto('/?path=/story/organisms-accountmenu--default');
  const canvas = previewFrame(page);

  await canvas.locator('[aria-label="Open account menu"]').click();
  await canvas.locator('[aria-label="Open account menu"]').press('Escape');

  await expect(canvas.locator('[data-testid="account-menu"]')).not.toBeVisible();
});

test('AccountMenu mobile trigger opens the same menu', async ({ page }) => {
  await page.goto('/?path=/story/organisms-accountmenu--mobile-trigger');
  const canvas = previewFrame(page);

  await canvas.locator('[aria-label="Open mobile account menu"]').click();

  await expect(canvas.locator('text=Sign out')).toBeVisible();
});

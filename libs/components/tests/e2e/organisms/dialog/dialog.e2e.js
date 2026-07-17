const { test, expect } = require('@playwright/test');

// Title 'Organisms/Dialog' → slug 'organisms-dialog'.
const story = (name) => `/?path=/story/organisms-dialog--${name}`;

test('Interactive story loads', async ({ page }) => {
  await page.goto(story('interactive'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-dialog--interactive');
});

test('Interactive story opens the dialog from the trigger', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Open dialog').first()).toBeVisible();
  await canvas.locator('text=Open dialog').first().click();

  await expect(canvas.locator('text=Delete this lesson?').first()).toBeVisible();
  await expect(canvas.locator('text=Delete lesson').first()).toBeVisible();
  await expect(canvas.locator('text=Keep it').first()).toBeVisible();
});

test('WithIcon story renders the ready dialog copy', async ({ page }) => {
  await page.goto(story('with-icon'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Lesson ready!').first()).toBeVisible();
  await expect(
    canvas.locator('text=We found 4 key concepts and built 12 slides from your PDF.').first(),
  ).toBeVisible();
  await expect(canvas.locator('text=Start learning').first()).toBeVisible();
  await expect(canvas.locator('text=Review outline').first()).toBeVisible();
});

const { test, expect } = require('@playwright/test');

// Title 'Atoms/Fab' → slug 'atoms-fab'.
const story = (name) => `/?path=/story/atoms-fab--${name}`;

test('Regular story loads', async ({ page }) => {
  await page.goto(story('regular'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('atoms-fab--regular');
});

test('Regular story exposes the New lesson affordance', async ({ page }) => {
  await page.goto(story('regular'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.getByLabel('New lesson')).toBeVisible();
});

test('Extended story renders the extended label', async ({ page }) => {
  await page.goto(story('extended'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=New lesson').first()).toBeVisible();
});

test('Colors story exposes Primary Secondary Tertiary Surface', async ({ page }) => {
  await page.goto(story('colors'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.getByLabel('Primary')).toBeVisible();
  await expect(canvas.getByLabel('Secondary')).toBeVisible();
  await expect(canvas.getByLabel('Tertiary')).toBeVisible();
  await expect(canvas.getByLabel('Surface')).toBeVisible();
});

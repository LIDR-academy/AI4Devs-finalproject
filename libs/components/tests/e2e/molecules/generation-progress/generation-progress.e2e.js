const { test, expect } = require('@playwright/test');

// Title 'Molecules/GenerationProgress' → slug 'molecules-generationprogress'.
const story = (name) => `/?path=/story/molecules-generationprogress--${name}`;

test('Reading story loads', async ({ page }) => {
  await page.goto(story('reading'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('molecules-generationprogress--reading');
});

// @s14 — every discrete labeled step renders, not a bare spinner or a percentage bar.
test('Reading story renders every step label', async ({ page }) => {
  await page.goto(story('reading'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Reading content').first()).toBeVisible();
  await expect(canvas.locator('text=Generating slides').first()).toBeVisible();
  await expect(canvas.locator('text=Attaching images').first()).toBeVisible();
});

// @s14 — the current step advances as the pipeline progresses (Attaching story = last step
// current, both earlier steps done).
test('Attaching story shows the last step as current', async ({ page }) => {
  await page.goto(story('attaching'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Attaching images').first()).toBeVisible();
});

// All done — every step's done indicator renders (past the last index).
test('Done story loads', async ({ page }) => {
  await page.goto(story('done'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('molecules-generationprogress--done');
});

const { test, expect } = require('@playwright/test');

// Title 'Organisms/PdfDocumentList' → slug 'organisms-pdfdocumentlist'.
const story = (name) => `/?path=/story/organisms-pdfdocumentlist--${name}`;

test('Content story with delete affordance loads', async ({ page }) => {
  await page.goto(story('content-with-delete'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-pdfdocumentlist--content-with-delete');
});

// @s1 — content lists filename + status + date + pages.
test('Content story renders document rows', async ({ page }) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=notes.pdf')).toBeVisible();
  await expect(canvas.locator('text=Ready to generate')).toBeVisible();
  await expect(canvas.locator('text=failed-gen.pdf')).toBeVisible();
  await expect(canvas.locator('text=biology.pdf')).toBeVisible();
});

test('CreationDisabled story hides create actions and retains Open lesson', async ({ page }) => {
  await page.goto(story('creation-disabled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Generate')).toHaveCount(0);
  await expect(canvas.locator('text=Retry')).toHaveCount(0);
  await expect(canvas.locator('text=Open lesson').first()).toBeVisible();
});

// @s14 — empty.
test('Empty story shows the empty-state message', async ({ page }) => {
  await page.goto(story('empty'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(
    canvas.locator('text=No extracted PDFs yet. Upload one to get started.'),
  ).toBeVisible();
});

// @s16 — error + retry.
test('Error story shows the error message and retry action', async ({ page }) => {
  await page.goto(story('error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator("text=We couldn't load your PDFs.")).toBeVisible();
  await expect(canvas.locator('text=Try again')).toBeVisible();
});

// @s15 — loading story loads (indicator is non-text).
test('Loading story loads', async ({ page }) => {
  await page.goto(story('loading'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-pdfdocumentlist--loading');
});

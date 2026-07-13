const { test, expect } = require('@playwright/test');

// Title 'Organisms/PdfUploadPanel' → slug 'organisms-pdfuploadpanel'.
const story = (name) => `/?path=/story/organisms-pdfuploadpanel--${name}`;

test('Empty story loads', async ({ page }) => {
  await page.goto(story('empty'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-pdfuploadpanel--empty');
});

// @s7 — the pristine/Empty state shows the choose-file affordance and the size/page constraints
// hint, with no error banner.
test('Empty story renders the choose-file affordance and constraints hint, with no error', async ({
  page,
}) => {
  await page.goto(story('empty'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Choose a PDF')).toBeVisible();
  await expect(canvas.locator('text=Max 10 MB, 20 pages')).toBeVisible();
  await expect(canvas.locator('text=Try again')).toHaveCount(0);
});

// @s5/@s16 — the Loading state shows the progress copy and disables the choose-file control.
test('Loading story shows the loading copy and disables the choose-file control', async ({
  page,
}) => {
  await page.goto(story('loading'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Extracting…')).toBeVisible();

  const chooseFileLabel = canvas.locator('text=Choose a PDF').first();
  const chooseFileControl = chooseFileLabel.locator('xpath=ancestor::button[1]');
  await expect(chooseFileControl).toBeDisabled();
});

// @s6 — the Content state renders the success summary (filename, page count, image count) and a
// continue affordance.
test('Content story renders the success summary and a continue control', async ({ page }) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=biology-chapter-4.pdf')).toBeVisible();
  await expect(canvas.locator('text=12')).toBeVisible();
  await expect(canvas.locator('text=5')).toBeVisible();
  await expect(canvas.locator('text=Continue')).toBeVisible();
});

// @s8-@s13/@s16 — a retryable error renders its message and a retry affordance, and the
// choose-file control stays enabled (the panel "returns to a usable state").
test('ErrorRetryable story renders the error message and a retry affordance', async ({ page }) => {
  await page.goto(story('error-retryable'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Something went wrong while reading your PDF')).toBeVisible();
  await expect(canvas.locator('text=Try again')).toBeVisible();

  const chooseFileLabel = canvas.locator('text=Choose a PDF').first();
  const chooseFileControl = chooseFileLabel.locator('xpath=ancestor::button[1]');
  await expect(chooseFileControl).toBeEnabled();
});

// @s8-@s13 (review round-1 fix) — a non-retryable error (too_many_pages) shows no retry
// affordance, since the persistent choose-file control is already the real recovery action.
test('ErrorNonRetryable story renders the error message without a retry affordance', async ({
  page,
}) => {
  await page.goto(story('error-non-retryable'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=This PDF has too many pages (max 20)')).toBeVisible();
  await expect(canvas.locator('text=Try again')).toHaveCount(0);
});

// @s13/@s16 — the retry *interaction* itself: pressing "Try again" actually re-triggers the
// upload flow (here, transitions the demo back to the Loading state), not just static markup.
test('InteractiveRetry story transitions to the loading state when the retry affordance is pressed', async ({
  page,
}) => {
  await page.goto(story('interactive-retry'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Something went wrong while reading your PDF')).toBeVisible();

  await canvas.locator('text=Try again').click();

  await expect(canvas.locator('text=Extracting…')).toBeVisible();
});

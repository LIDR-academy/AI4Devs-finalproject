const { test, expect } = require('@playwright/test');

// Title 'Features/PdfUpload' → slug 'features-pdfupload'.
const story = (name) => `/?path=/story/features-pdfupload--${name}`;

test('Idle story loads', async ({ page }) => {
  await page.goto(story('idle'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-pdfupload--idle');
});

test('Idle story renders choose-file and constraints', async ({ page }) => {
  await page.goto(story('idle'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Choose a PDF').first()).toBeVisible();
  await expect(canvas.locator('text=Max 10 MB, 20 pages').first()).toBeVisible();
});

test('Processing story shows Extracting and disables choose-file', async ({ page }) => {
  await page.goto(story('processing'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Extracting…').first()).toBeVisible();
  const choose = canvas.locator('text=Choose a PDF').first().locator('xpath=ancestor::button[1]');
  await expect(choose).toBeDisabled();
});

test('Success story renders the extraction summary', async ({ page }) => {
  await page.goto(story('success'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=biology-chapter-4.pdf').first()).toBeVisible();
  await expect(canvas.locator('text=Pages').first()).toBeVisible();
  await expect(canvas.locator('text=12').first()).toBeVisible();
  await expect(canvas.locator('text=Images').first()).toBeVisible();
  await expect(canvas.locator('text=5').first()).toBeVisible();
  await expect(canvas.locator('text=Continue')).toHaveCount(0);
});

test('ErrorRetryable story shows network error + Try again', async ({ page }) => {
  await page.goto(story('error-retryable'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Network error').first()).toBeVisible();
  await expect(canvas.locator('text=Try again').first()).toBeVisible();
});

test('ErrorTooManyPages story shows non-retryable error', async ({ page }) => {
  await page.goto(story('error-too-many-pages'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=This PDF has too many pages (max 20)').first()).toBeVisible();
  await expect(canvas.locator('text=Try again')).toHaveCount(0);
});

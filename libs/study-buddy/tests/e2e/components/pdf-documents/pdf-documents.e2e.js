const { test, expect } = require('@playwright/test');

// Title 'Features/PdfDocuments' → slug 'features-pdfdocuments'.
const story = (name) => `/?path=/story/features-pdfdocuments--${name}`;

test('Content story loads', async ({ page }) => {
  await page.goto(story('content'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-pdfdocuments--content');
});

test('Content story renders heading and document rows', async ({ page }) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Your PDFs', { exact: true })).toBeVisible();
  await expect(canvas.getByText('notes.pdf', { exact: true })).toBeVisible();
  await expect(canvas.getByText('retry-me.pdf', { exact: true })).toBeVisible();
  await expect(canvas.getByText('done.pdf', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Ready to generate', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Generation failed', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Lesson ready', { exact: true })).toBeVisible();
});

test('Loading story loads', async ({ page }) => {
  await page.goto(story('loading'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-pdfdocuments--loading');
});

test('Empty story shows the empty-state message', async ({ page }) => {
  await page.goto(story('empty'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(
    canvas.getByText('No extracted PDFs yet. Upload one to get started.', { exact: true }),
  ).toBeVisible();
});

test('LoadError story shows error + retry', async ({ page }) => {
  await page.goto(story('load-error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText("We couldn't load your PDFs.", { exact: true })).toBeVisible();
  await expect(canvas.getByText('Try again', { exact: true })).toBeVisible();
});

const { test, expect } = require('@playwright/test');

// Title 'Molecules/PdfDocumentListItem' → slug 'molecules-pdfdocumentlistitem'.
const story = (name) => `/?path=/story/molecules-pdfdocumentlistitem--${name}`;

test('Ready story loads', async ({ page }) => {
  await page.goto(story('ready'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('molecules-pdfdocumentlistitem--ready');
});

test('Ready story renders filename and Generate action', async ({ page }) => {
  await page.goto(story('ready'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=notes.pdf').first()).toBeVisible();
  await expect(canvas.locator('text=Ready to generate').first()).toBeVisible();
  await expect(canvas.locator('text=Generate').first()).toBeVisible();
});

test('Failed story renders Retry action', async ({ page }) => {
  await page.goto(story('failed'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Generation failed').first()).toBeVisible();
  await expect(canvas.locator('text=Retry').first()).toBeVisible();
});

test('Generated story renders Open lesson action', async ({ page }) => {
  await page.goto(story('generated'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Lesson ready').first()).toBeVisible();
  await expect(canvas.locator('text=Open lesson').first()).toBeVisible();
});

test('CreationDisabled story hides Generate while retaining document content', async ({ page }) => {
  await page.goto(story('creation-disabled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=notes.pdf').first()).toBeVisible();
  await expect(canvas.getByText('Generate', { exact: true })).toHaveCount(0);
});

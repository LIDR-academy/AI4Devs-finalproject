const { test, expect } = require('@playwright/test');

// Title 'Features/SavedLessons' → slug 'features-savedlessons'.
const story = (name) => `/?path=/story/features-savedlessons--${name}`;

test('Content story loads', async ({ page }) => {
  await page.goto(story('content'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-savedlessons--content');
});

test('Content story renders heading, count, and lessons', async ({ page }) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Saved lessons', { exact: true })).toBeVisible();
  await expect(canvas.getByText('2 lessons', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Photosynthesis basics', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Cell division', { exact: true })).toBeVisible();
});

test('Loading story loads', async ({ page }) => {
  await page.goto(story('loading'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-savedlessons--loading');
});

test('Empty story shows the empty-state message', async ({ page }) => {
  await page.goto(story('empty'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(
    canvas.getByText('No saved lessons yet. Create one to get started.', { exact: true }),
  ).toBeVisible();
});

test('LoadError story shows error + retry', async ({ page }) => {
  await page.goto(story('load-error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText("We couldn't load your lessons.", { exact: true })).toBeVisible();
  await expect(canvas.getByText('Try again', { exact: true })).toBeVisible();
});

test('DeleteFailed story keeps list and shows delete-failure banner', async ({ page }) => {
  await page.goto(story('delete-failed'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Photosynthesis basics', { exact: true })).toBeVisible();
  await expect(canvas.getByText("We couldn't delete that lesson.", { exact: true })).toBeVisible();
});

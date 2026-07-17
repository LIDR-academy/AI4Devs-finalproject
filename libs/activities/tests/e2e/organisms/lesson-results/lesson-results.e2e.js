const { test, expect } = require('@playwright/test');

// Title 'Organisms/LessonResults' → slug 'organisms-lessonresults'.
const story = (name) => `/?path=/story/organisms-lessonresults--${name}`;

test('Score story loads', async ({ page }) => {
  await page.goto(story('score'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-lessonresults--score');
});

test('Score story renders the score and actions', async ({ page }) => {
  await page.goto(story('score'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=3 / 3').first()).toBeVisible();
  await expect(canvas.locator('text=100%').first()).toBeVisible();
  await expect(canvas.locator('text=Retake activities').first()).toBeVisible();
  await expect(canvas.locator('text=Back to my lessons').first()).toBeVisible();
});

test('Loading story loads', async ({ page }) => {
  await page.goto(story('loading'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-lessonresults--loading');
});

test('Completion story renders the complete copy', async ({ page }) => {
  await page.goto(story('completion'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Lesson complete').first()).toBeVisible();
  await expect(canvas.locator("text=You've reached the end of this lesson.").first()).toBeVisible();
  await expect(canvas.locator('text=Retake activities').first()).toBeVisible();
});

test('SaveFailed story renders the save-error banner', async ({ page }) => {
  await page.goto(story('save-failed'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator("text=Couldn't save this attempt").first()).toBeVisible();
  await expect(canvas.locator('text=Try again').first()).toBeVisible();
});

const { test, expect } = require('@playwright/test');

// Title 'Features/LessonResults' → slug 'features-lessonresults'.
const story = (name) => `/?path=/story/features-lessonresults--${name}`;

test('Score story loads', async ({ page }) => {
  await page.goto(story('score'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-lessonresults--score');
});

test('Score story renders the score and actions', async ({ page }) => {
  await page.goto(story('score'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('3 / 3', { exact: true })).toBeVisible();
  await expect(canvas.getByText('100%', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Retake activities', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Back to my lessons', { exact: true })).toBeVisible();
});

test('Completion story renders the complete copy', async ({ page }) => {
  await page.goto(story('completion'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Lesson complete', { exact: true })).toBeVisible();
  await expect(
    canvas.getByText("You've reached the end of this lesson.", { exact: true }),
  ).toBeVisible();
});

test('SaveFailed story renders the save-error banner', async ({ page }) => {
  await page.goto(story('save-failed'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText("Couldn't save this attempt", { exact: true })).toBeVisible();
  await expect(canvas.getByText('Try again', { exact: true })).toBeVisible();
});

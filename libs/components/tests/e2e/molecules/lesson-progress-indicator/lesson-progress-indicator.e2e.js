const { test, expect } = require('@playwright/test');

// Title 'Molecules/LessonProgressIndicator' → slug 'molecules-lessonprogressindicator'.
const story = (name) => `/?path=/story/molecules-lessonprogressindicator--${name}`;

test('Lesson progress indicator story page loads', async ({ page }) => {
  await page.goto(story('first-slide'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('molecules-lessonprogressindicator--first-slide');
});

test('Lesson progress indicator shows slide label', async ({ page }) => {
  await page.goto(story('mid-deck'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Slide 3 of 5', { exact: true })).toBeVisible();
});

test('Lesson progress indicator results slide label', async ({ page }) => {
  await page.goto(story('results-slide'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Slide 5 of 5', { exact: true })).toBeVisible();
});

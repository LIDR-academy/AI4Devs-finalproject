const { test, expect } = require('@playwright/test');

// Title 'Features/LessonPlayer' → slug 'features-lessonplayer'.
const story = (name) => `/?path=/story/features-lessonplayer--${name}`;

test('Lesson player story page loads', async ({ page }) => {
  await page.goto(story('first-slide'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-lessonplayer--first-slide');
});

test('Lesson player shows first slide and progress', async ({ page }) => {
  await page.goto(story('first-slide'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Welcome', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Slide 1 of 5', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Next', { exact: true })).toBeVisible();
});

// @s2/@s20 — Next advances; Back from results returns to last content slide.
test('Lesson player navigates to results and back', async ({ page }) => {
  await page.goto(story('first-slide'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Welcome', { exact: true })).toBeVisible();

  // 4 content slides → results is step 5
  for (let i = 0; i < 4; i++) {
    await canvas.getByText('Next', { exact: true }).click();
  }

  await expect(canvas.getByText('Slide 5 of 5', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Back', { exact: true }).first()).toBeVisible();

  await canvas.getByText('Back', { exact: true }).first().click();
  await expect(canvas.getByText('Summary', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Slide 4 of 5', { exact: true })).toBeVisible();
});

// @s12 — answer, leave, return → prior answer restored.
test('Lesson player restores prior answer on Back', async ({ page }) => {
  await page.goto(story('answer-restore'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('France', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Correct', { exact: true })).toBeVisible();
});

// @s18 — Retake returns to first content slide.
test('Lesson player retake returns to first slide', async ({ page }) => {
  await page.goto(story('retake'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Welcome', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Slide 1 of 5', { exact: true })).toBeVisible();
});

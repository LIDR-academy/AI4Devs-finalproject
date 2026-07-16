const { test, expect } = require('@playwright/test');

// Title 'Organisms/LessonPlayer' → slug 'organisms-lessonplayer'.
const story = (name) => `/?path=/story/organisms-lessonplayer--${name}`;

test('Lesson player story page loads', async ({ page }) => {
  await page.goto(story('first-slide'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-lessonplayer--first-slide');
});

test('Lesson player shows first slide and progress', async ({ page }) => {
  await page.goto(story('first-slide'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Welcome', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Slide 1 of 5', { exact: true })).toBeVisible();
  await expect(canvas.getByRole('button', { name: 'Next' })).toBeVisible();
});

// @s2/@s20 — Next advances; Back from results returns to last content slide.
test('Lesson player navigates to results and back', async ({ page }) => {
  await page.goto(story('first-slide'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Welcome', { exact: true })).toBeVisible();

  // 4 content slides → results is step 5
  for (let i = 0; i < 4; i++) {
    await canvas.getByRole('button', { name: 'Next' }).click();
  }

  await expect(canvas.getByText('Slide 5 of 5', { exact: true })).toBeVisible();
  await expect(canvas.getByRole('button', { name: 'Back' })).toBeVisible();

  await canvas.getByRole('button', { name: 'Back' }).click();
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

// @s15 — Empty state for a slideless lesson.
test('Lesson player shows empty state for zero slides', async ({ page }) => {
  await page.goto(story('empty'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('This lesson has no slides yet.', { exact: true })).toBeVisible();
  await expect(canvas.getByRole('button', { name: 'Back' })).toBeVisible();
  await expect(canvas.getByRole('button', { name: 'Next' })).toHaveCount(0);
});

// @s16 — Error state with Retry + Back.
test('Lesson player shows error state with retry', async ({ page }) => {
  await page.goto(story('error-state'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText("Couldn't load this lesson.", { exact: true })).toBeVisible();
  await expect(canvas.getByText('Retry', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Back', { exact: true })).toBeVisible();
});

// @s19 — navigation + progress usable on a mobile viewport.
test('Lesson player is usable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(story('first-slide'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Welcome', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Slide 1 of 5', { exact: true })).toBeVisible();
  await expect(canvas.getByRole('button', { name: 'Next' })).toBeVisible();
  await canvas.getByRole('button', { name: 'Next' }).click();
  await expect(canvas.getByText('France', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Slide 2 of 5', { exact: true })).toBeVisible();
});

// @s19 — navigation + progress usable on a web viewport.
test('Lesson player is usable on a web viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(story('first-slide'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Welcome', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Slide 1 of 5', { exact: true })).toBeVisible();
  await expect(canvas.getByRole('button', { name: 'Next' })).toBeVisible();
  await canvas.getByRole('button', { name: 'Next' }).click();
  await expect(canvas.getByText('France', { exact: true })).toBeVisible();
});

const { test, expect } = require('@playwright/test');

// Title 'Organisms/LessonList' → slug 'organisms-lessonlist'.
const story = (name) => `/?path=/story/organisms-lessonlist--${name}`;

test('Content story loads', async ({ page }) => {
  await page.goto(story('content'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-lessonlist--content');
});

// @s4 — content lists title + created date.
test('Content story renders lesson titles and dates', async ({ page }) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Photosynthesis basics')).toBeVisible();
  await expect(canvas.locator('text=Jul 13, 2026')).toBeVisible();
  await expect(canvas.locator('text=Cell division')).toBeVisible();
});

// @s5 — empty invites creating a lesson.
test('Empty story shows the empty-state message', async ({ page }) => {
  await page.goto(story('empty'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(
    canvas.locator('text=No saved lessons yet. Create one to get started.'),
  ).toBeVisible();
});

// @s14 — error + retry.
test('Error story shows the error message and retry action', async ({ page }) => {
  await page.goto(story('error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator("text=We couldn't load your lessons.")).toBeVisible();
  await expect(canvas.locator('text=Try again')).toBeVisible();
});

// @s13 — loading story loads (indicator is non-text).
test('Loading story loads', async ({ page }) => {
  await page.goto(story('loading'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-lessonlist--loading');
});

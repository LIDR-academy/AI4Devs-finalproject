const { test, expect } = require('@playwright/test');

// Title 'Molecules/LessonListItem' → slug 'molecules-lessonlistitem'.
const story = (name) => `/?path=/story/molecules-lessonlistitem--${name}`;

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('molecules-lessonlistitem--default');
});

test('Default story renders title and date', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('text=Photosynthesis basics').first()).toBeVisible();
  await expect(canvas.locator('text=Jul 13, 2026').first()).toBeVisible();
  await expect(canvas.getByLabel('Open Photosynthesis basics')).toBeVisible();
});

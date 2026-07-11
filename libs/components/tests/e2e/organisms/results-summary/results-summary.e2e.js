const { test, expect } = require('@playwright/test');

// Title 'Organisms/ResultsSummary' → slug 'organisms-resultssummary'.
const story = (name) => `/?path=/story/organisms-resultssummary--${name}`;

test('Score story loads', async ({ page }) => {
  await page.goto(story('score'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-resultssummary--score');
});

// @s1 — the score is shown as correct/total plus a percentage.
test('Score story renders the correct/total ratio and the percentage', async ({ page }) => {
  await page.goto(story('score'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=3 / 3')).toBeVisible();
  await expect(canvas.locator('text=100%')).toBeVisible();
});

// @s7 — a failed save keeps the score visible alongside a non-blocking save-failure notice.
test('SaveFailed story shows the score alongside the save-failure notice', async ({ page }) => {
  await page.goto(story('save-failed'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=3 / 3')).toBeVisible();
  await expect(canvas.locator("text=We couldn't save this attempt.")).toBeVisible();
});

// @s7 — the retry action is present and operable (re-attempts the save).
test('SaveFailed story renders an operable retry action', async ({ page }) => {
  await page.goto(story('save-failed'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const retryLabel = canvas.locator('text=Retry').first();
  const retryControl = retryLabel.locator('xpath=ancestor::button[1]');
  await expect(retryControl).toBeEnabled();
  await retryControl.click();
});

// @s8 — the completion state shows the completion message instead of a score.
test('Completion story shows the completion message without a score', async ({ page }) => {
  await page.goto(story('completion'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Lesson complete')).toBeVisible();
  await expect(canvas.locator("text=You've reached the end of this lesson.")).toBeVisible();
  await expect(canvas.locator('text=3 / 3')).toHaveCount(0);
});

// @s8/@s10 — the completion state offers both the retake and back-to-lessons actions.
test('Completion story renders both the retake and back-to-lessons actions', async ({ page }) => {
  await page.goto(story('completion'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Retake activities')).toBeVisible();
  await expect(canvas.locator('text=Back to my lessons')).toBeVisible();
});

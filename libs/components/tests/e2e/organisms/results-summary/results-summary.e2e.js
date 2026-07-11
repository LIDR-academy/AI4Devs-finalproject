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

// @s7 — the retry action is present and operable (re-attempts the save). Clicks the text
// locator itself (no ancestor HTML-tag walk, per the storybook-e2e-tests skill) — Playwright's
// own actionability checks (visible, stable, receives events, enabled) run automatically before
// the click fires, so a hidden or genuinely disabled retry action still fails this test.
test('SaveFailed story renders an operable retry action', async ({ page }) => {
  await page.goto(story('save-failed'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const retryAction = canvas.locator('text=Retry').first();
  await expect(retryAction).toBeVisible();
  await retryAction.click();
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

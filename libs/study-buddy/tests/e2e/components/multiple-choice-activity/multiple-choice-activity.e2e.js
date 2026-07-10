const { test, expect } = require('@playwright/test');

test('MultipleChoiceActivity Default story loads', async ({ page }) => {
  await page.goto('/?path=/story/features-multiplechoiceactivity--default');
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
});

test('renders the question and every option, unanswered', async ({ page }) => {
  await page.goto('/?path=/story/features-multiplechoiceactivity--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('What is the capital of France?', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Paris', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Berlin', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Madrid', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Correct', { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Incorrect', { exact: true })).toHaveCount(0);
});

test('selecting the correct option grades correct and shows the explanation', async ({ page }) => {
  await page.goto('/?path=/story/features-multiplechoiceactivity--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Paris', { exact: true }).click();

  await expect(canvas.getByText('Correct', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Explanation', { exact: true })).toBeVisible();
  await expect(
    canvas.getByText('Paris has been the capital of France since 987 AD.', { exact: true }),
  ).toBeVisible();
});

test('locks the attempt — every option becomes non-interactive once answered', async ({ page }) => {
  await page.goto('/?path=/story/features-multiplechoiceactivity--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Paris', { exact: true }).click();
  await expect(canvas.getByText('Correct', { exact: true })).toBeVisible();

  // The unselected option is genuinely disabled (not just visually) — Playwright's own
  // actionability check refuses a real click here, which is the behavior under test.
  await expect(canvas.getByText('Berlin', { exact: true })).toBeDisabled();

  // Forcing the tap through anyway must still leave the original (Paris) answer standing.
  await canvas.getByText('Berlin', { exact: true }).click({ force: true });
  await expect(canvas.getByText('Correct', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Incorrect', { exact: true })).toHaveCount(0);
});

test('WithoutExplanation story: an incorrect pick reveals the correct option, no explanation renders', async ({
  page,
}) => {
  await page.goto('/?path=/story/features-multiplechoiceactivity--without-explanation');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Berlin', { exact: true }).click();

  await expect(canvas.getByText('Incorrect', { exact: true })).toBeVisible();
  // The correct option (Paris) is revealed alongside the learner's incorrect pick.
  await expect(canvas.getByText('Paris', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Explanation', { exact: true })).toHaveCount(0);
});

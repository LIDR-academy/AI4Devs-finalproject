const { test, expect } = require('@playwright/test');

// Title 'Features/FillInTheBlankActivity' → slug 'features-fillintheblankactivity'.
const story = (name) => `/?path=/story/features-fillintheblankactivity--${name}`;

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-fillintheblankactivity--default');
});

test('Default story renders prompt and Submit unanswered', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  // Prompt is split around the blank; trailing space on the before-segment, so avoid exact.
  await expect(canvas.getByText(/The capital of France is/)).toBeVisible();
  await expect(canvas.getByText('Submit', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Correct!', { exact: true })).toHaveCount(0);
});

test('submitting a matching answer shows Correct and explanation', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByLabel('Fill in the blank').fill('Paris');
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('Correct!', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Why', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Paris is the capital of France.', { exact: true })).toBeVisible();
});

test('WithoutExplanation story grades without Why', async ({ page }) => {
  await page.goto(story('without-explanation'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByLabel('Fill in the blank').fill('Berlin');
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('Incorrect', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Paris', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Why', { exact: true })).toHaveCount(0);
});

const { test, expect } = require('@playwright/test');

// Title 'Features/OpenEndedActivity' → slug 'features-openendedactivity'.
const story = (name) => `/?path=/story/features-openendedactivity--${name}`;

const PROMPT = 'What is photosynthesis?';
const MODEL_ANSWER = 'Conversion of light energy into chemical energy.';

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-openendedactivity--default');
});

test('Default story shows prompt and Submit; model hidden', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText(PROMPT, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Submit', { exact: true })).toBeVisible();
  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toHaveCount(0);
});

test('submitting reveals model answer and explanation', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByLabel('Your response').fill('plants turn light into sugar');
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('Model answer', { exact: true })).toBeVisible();
  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Why', { exact: true })).toBeVisible();
});

test('WithoutExplanation story reveals without Why', async ({ page }) => {
  await page.goto(story('without-explanation'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByLabel('Your response').fill('an answer');
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Why', { exact: true })).toHaveCount(0);
});

test('Unavailable story shows unavailable notice', async ({ page }) => {
  await page.goto(story('unavailable'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('This activity is unavailable', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Submit', { exact: true })).toHaveCount(0);
});

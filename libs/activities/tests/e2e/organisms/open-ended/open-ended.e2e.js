const { test, expect } = require('@playwright/test');

// Title 'Organisms/OpenEnded' → slug 'organisms-openended'.
const story = (name) => `/?path=/story/organisms-openended--${name}`;

const MODEL_ANSWER = 'Conversion of light energy into chemical energy.';
const PROMPT = 'What is photosynthesis?';

test('Unanswered story loads', async ({ page }) => {
  await page.goto(story('unanswered'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-openended--unanswered');
});

// @s1
test('Unanswered story shows prompt, empty input, Submit; model hidden', async ({ page }) => {
  await page.goto(story('unanswered'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText(PROMPT, { exact: true })).toBeVisible();
  await expect(canvas.getByLabel('Your response')).toBeVisible();
  await expect(canvas.getByText('Submit', { exact: true })).toBeVisible();
  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Model answer', { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Recalled', { exact: true })).toHaveCount(0);
});

// @s2 — static submitted story
test('SubmittedWithModelAnswer story reveals model answer and locks', async ({ page }) => {
  await page.goto(story('submitted-with-model-answer'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Your answer', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Model answer', { exact: true })).toBeVisible();
  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toBeVisible();
  await expect(canvas.getByLabel('Your response')).toHaveAttribute('readonly', '');
});

// @s7
test('Unavailable story shows unavailable notice', async ({ page }) => {
  await page.goto(story('unavailable'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('This activity is unavailable', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Submit', { exact: true })).toHaveCount(0);
});

// @s2 — Interactive type → Submit → reveal + lock
test('Interactive submit reveals model answer and locks (@s2)', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const input = canvas.getByLabel('Your response');
  await input.fill('plants make food from light');
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('Model answer', { exact: true })).toBeVisible();
  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toBeVisible();
  await expect(input).toHaveAttribute('readonly', '');
  await expect(canvas.getByText('Correct', { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Incorrect', { exact: true })).toHaveCount(0);
});

// @s5 — empty submit still reveals
test('Interactive empty submit still reveals model answer (@s5)', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const input = canvas.getByLabel('Your response');
  await expect(input).toHaveValue('');
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('Model answer', { exact: true })).toBeVisible();
  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toBeVisible();
  await expect(input).toHaveAttribute('readonly', '');
});

// @s4 — post-submit edit/resubmit blocked
test('after submit the attempt cannot be changed or resubmitted (@s4)', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const input = canvas.getByLabel('Your response');
  await input.fill('first answer');
  await canvas.getByText('Submit', { exact: true }).click();
  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toBeVisible();

  await expect(input).toHaveAttribute('readonly', '');
  await expect(input).toHaveValue('first answer');

  await canvas.getByText('Submit', { exact: true }).click({ force: true });
  await expect(input).toHaveValue('first answer');
  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toBeVisible();
});

// @s10 — Enter/return inserts newline and does NOT submit
test('Enter/return inserts a newline and does not submit (@s10)', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const input = canvas.getByLabel('Your response');
  await input.fill('line one');
  await input.press('Enter');
  await input.type('line two');

  await expect(input).toHaveValue('line one\nline two');
  await expect(canvas.getByText(MODEL_ANSWER, { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Model answer', { exact: true })).toHaveCount(0);
  await expect(input).not.toHaveAttribute('readonly', '');
});

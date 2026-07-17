const { test, expect } = require('@playwright/test');

// Title 'Features/FlashcardActivity' → slug 'features-flashcardactivity'.
const story = (name) => `/?path=/story/features-flashcardactivity--${name}`;

const PROMPT = 'What pigment absorbs light for photosynthesis?';
const ANSWER = 'Chlorophyll';

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-flashcardactivity--default');
});

test('Default story shows front and Reveal, hides answer', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText(PROMPT, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Reveal answer', { exact: true })).toBeVisible();
  await expect(canvas.getByText(ANSWER, { exact: true })).toHaveCount(0);
});

test('revealing shows answer, self-mark actions, and explanation', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Reveal answer', { exact: true }).click();

  await expect(canvas.getByText(ANSWER, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Recalled', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Not recalled', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Why', { exact: true })).toBeVisible();
});

test('WithoutExplanation story reveals without Why', async ({ page }) => {
  await page.goto(story('without-explanation'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Reveal answer', { exact: true }).click();

  await expect(canvas.getByText(ANSWER, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Why', { exact: true })).toHaveCount(0);
});

const { test, expect } = require('@playwright/test');

// Title 'Organisms/Flashcard' → slug 'organisms-flashcard'.
const story = (name) => `/?path=/story/organisms-flashcard--${name}`;

const PROMPT = 'What pigment absorbs light for photosynthesis?';
const ANSWER = 'Chlorophyll';
const EXPLANATION = 'Chlorophyll reflects green light, which is why plants look green.';

test('Hidden story loads with only the front and Reveal visible', async ({ page }) => {
  await page.goto(story('hidden'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-flashcard--hidden');

  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.getByText(PROMPT, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Reveal answer', { exact: true })).toBeVisible();
  await expect(canvas.getByText(ANSWER, { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Recalled', { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Not recalled', { exact: true })).toHaveCount(0);
});

test('RevealedUnmarked story shows the answer and both self-mark actions, unmarked', async ({
  page,
}) => {
  await page.goto(story('revealed-unmarked'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText(PROMPT, { exact: true })).toBeVisible();
  await expect(canvas.getByText(ANSWER, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Recalled', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Not recalled', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Reveal answer', { exact: true })).toHaveCount(0);
});

test('RevealedRecalled story shows the locked Recalled confirmation', async ({ page }) => {
  await page.goto(story('revealed-recalled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText(ANSWER, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Marked recalled', { exact: true })).toBeVisible();
  await expect(canvas.getByText('check_circle', { exact: true })).toBeVisible();
  // Chosen mark's idle label is replaced by its confirmed label (bare "Recalled" is gone).
  await expect(canvas.getByText('Recalled', { exact: true })).toHaveCount(0);
});

test('RevealedNotRecalled story shows the locked Not recalled confirmation', async ({ page }) => {
  await page.goto(story('revealed-not-recalled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText(ANSWER, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Marked not recalled', { exact: true })).toBeVisible();
  await expect(canvas.getByText('cancel', { exact: true })).toBeVisible();
  // Chosen mark's idle label is replaced by its confirmed label (bare "Not recalled" is gone).
  await expect(canvas.getByText('Not recalled', { exact: true })).toHaveCount(0);
});

test('WithoutExplanation story reveals the answer with no explanation heading or body', async ({
  page,
}) => {
  await page.goto(story('without-explanation'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText(ANSWER, { exact: true })).toBeVisible();
  await expect(canvas.getByText('Why', { exact: true })).toHaveCount(0);
  await expect(canvas.getByText(EXPLANATION, { exact: true })).toHaveCount(0);
});

test('UnavailableMissingBack story shows the unavailable notice, nothing interactive', async ({
  page,
}) => {
  await page.goto(story('unavailable-missing-back'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('This activity is unavailable', { exact: true })).toBeVisible();
  await expect(canvas.getByText(PROMPT, { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Reveal answer', { exact: true })).toHaveCount(0);
});

test('UnavailableMissingFront story shows the unavailable notice, nothing interactive', async ({
  page,
}) => {
  await page.goto(story('unavailable-missing-front'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('This activity is unavailable', { exact: true })).toBeVisible();
  await expect(canvas.getByText(ANSWER, { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Reveal answer', { exact: true })).toHaveCount(0);
});

// Interactive drives live reveal → self-mark → lock (@s1,@s2,@s3,@s4,@s5).
test('Interactive: reveal shows the answer alongside the front', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText(PROMPT, { exact: true })).toBeVisible();
  await expect(canvas.getByText(ANSWER, { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Recalled', { exact: true })).toHaveCount(0);

  await canvas.getByText('Reveal answer', { exact: true }).click();

  await expect(canvas.getByText(PROMPT, { exact: true })).toBeVisible();
  await expect(canvas.getByText(ANSWER, { exact: true })).toBeVisible();
});

test('Interactive: both self-mark actions appear once revealed', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Reveal answer', { exact: true }).click();

  await expect(canvas.getByText('Recalled', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Not recalled', { exact: true })).toBeVisible();
});

test('Interactive: tapping Recalled locks the confirmation and disables both actions', async ({
  page,
}) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Reveal answer', { exact: true }).click();
  await canvas.getByText('Recalled', { exact: true }).click();

  await expect(canvas.getByText('Marked recalled', { exact: true })).toBeVisible();

  // Locked — re-tapping the other mark does not change the confirmed mark (@s5).
  await canvas.getByText('Not recalled', { exact: true }).click({ force: true });

  await expect(canvas.getByText('Marked recalled', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Marked not recalled', { exact: true })).toHaveCount(0);
});

test('Interactive: tapping Not recalled locks the confirmation and disables both actions', async ({
  page,
}) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Reveal answer', { exact: true }).click();
  await canvas.getByText('Not recalled', { exact: true }).click();

  await expect(canvas.getByText('Marked not recalled', { exact: true })).toBeVisible();

  // Locked — re-tapping the same mark again does not re-emit or change it (@s5).
  await canvas.getByText('Marked not recalled', { exact: true }).click({ force: true });

  await expect(canvas.getByText('Marked not recalled', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Marked recalled', { exact: true })).toHaveCount(0);
});

const { test, expect } = require('@playwright/test');

// Title 'Features/LessonGeneration' → slug 'features-lessongeneration'.
const story = (name) => `/?path=/story/features-lessongeneration--${name}`;

test('Ready story loads', async ({ page }) => {
  await page.goto(story('ready'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-lessongeneration--ready');
});

test('Ready story renders composition picker and Generate', async ({ page }) => {
  await page.goto(story('ready'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Lesson content', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Both', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Generate lesson', { exact: true })).toBeVisible();
});

test('AwaitDocument story keeps Generate disabled', async ({ page }) => {
  await page.goto(story('await-document'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const generate = canvas
    .locator('text=Generate lesson')
    .first()
    .locator('xpath=ancestor::button[1]');
  await expect(generate).toBeDisabled();
});

test('Generating story renders progress steps', async ({ page }) => {
  await page.goto(story('generating'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  // Step labels also feed a live-region announcement — use .first() to avoid strict dupes.
  await expect(canvas.getByText('Reading content', { exact: true }).first()).toBeVisible();
  await expect(canvas.getByText('Generating slides', { exact: true }).first()).toBeVisible();
  await expect(canvas.getByText('Attaching images', { exact: true }).first()).toBeVisible();
});

test('ReadyLesson story renders open-in-player CTA', async ({ page }) => {
  await page.goto(story('ready-lesson'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('0 slides generated', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Open in player', { exact: true })).toBeVisible();
});

test('ErrorRetryable story renders timeout + Try again', async ({ page }) => {
  await page.goto(story('error-retryable'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(
    canvas.getByText('Generation took too long. Try again.', { exact: true }),
  ).toBeVisible();
  await expect(canvas.getByText('Try again', { exact: true })).toBeVisible();
});

test('ErrorMissingKey story renders settings recovery', async ({ page }) => {
  await page.goto(story('error-missing-key'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(
    canvas.getByText('An API key is required to generate lessons.', { exact: true }),
  ).toBeVisible();
  await expect(canvas.getByText('Go to Settings', { exact: true })).toBeVisible();
});

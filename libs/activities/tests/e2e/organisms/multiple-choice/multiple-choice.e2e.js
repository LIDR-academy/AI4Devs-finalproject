const { test, expect } = require('@playwright/test');

// Title 'Organisms/MultipleChoice' → slug 'organisms-multiplechoice'.
const story = (name) => `/?path=/story/organisms-multiplechoice--${name}`;

test('Unanswered story loads', async ({ page }) => {
  await page.goto(story('unanswered'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-multiplechoice--unanswered');
});

test('Unanswered story renders every option with no result banner', async ({ page }) => {
  await page.goto(story('unanswered'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Paris', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Berlin', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Madrid', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Correct', { exact: true })).toHaveCount(0);
});

// Organism owns selection + grading — Interactive story is a live unanswered instance.
test('selecting the correct option shows the correct feedback', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Paris', { exact: true }).click();

  await expect(canvas.getByText('Correct', { exact: true })).toBeVisible();
  await expect(canvas.getByText('check_circle', { exact: true })).toBeVisible();
});

test('selecting an incorrect option shows incorrect feedback and reveals the correct option', async ({
  page,
}) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Berlin', { exact: true }).click();

  await expect(canvas.getByText('Incorrect', { exact: true })).toBeVisible();
  await expect(canvas.getByText('check_circle', { exact: true })).toBeVisible();
  await expect(canvas.getByText('cancel', { exact: true })).toBeVisible();
});

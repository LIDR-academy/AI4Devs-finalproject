const { test, expect } = require('@playwright/test');

// Title 'Organisms/FillInTheBlank' → slug 'organisms-fillintheblank'.
const story = (name) => `/?path=/story/organisms-fillintheblank--${name}`;

test('Unanswered story loads', async ({ page }) => {
  await page.goto(story('unanswered'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-fillintheblank--unanswered');
});

test('Unanswered story renders prompt, blank, Submit, and no result (@s1)', async ({ page }) => {
  await page.goto(story('unanswered'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('The capital of France is', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Submit', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Correct!', { exact: true })).toHaveCount(0);
  await expect(canvas.getByText('Incorrect', { exact: true })).toHaveCount(0);
});

test('Correct story shows correct banner and icon (@s2)', async ({ page }) => {
  await page.goto(story('correct'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Correct!', { exact: true })).toBeVisible();
  await expect(canvas.getByText('check_circle', { exact: true })).toBeVisible();
});

test('Incorrect story shows incorrect banner, icon, and revealed answer (@s3)', async ({ page }) => {
  await page.goto(story('incorrect'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Incorrect', { exact: true })).toBeVisible();
  await expect(canvas.getByText('cancel', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Paris', { exact: true })).toBeVisible();
});

test('Unavailable story shows unavailable notice (@s11)', async ({ page }) => {
  await page.goto(story('unavailable'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('This activity is unavailable', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Submit', { exact: true })).toHaveCount(0);
});

test('MissingBlank story shows unavailable notice (@s12)', async ({ page }) => {
  await page.goto(story('missing-blank'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('This activity is unavailable', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Submit', { exact: true })).toHaveCount(0);
});

// Interactive drives type → submit → feedback (@s2,@s3,@s5,@s6,@s7).
test('submitting a matching answer shows correct feedback and locks (@s2)', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const input = canvas.getByLabel('Fill in the blank');
  await input.fill('paris');
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('Correct!', { exact: true })).toBeVisible();
  await expect(canvas.getByText('check_circle', { exact: true })).toBeVisible();
});

test('submitting a wrong answer shows incorrect feedback and reveals accepted (@s3)', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const input = canvas.getByLabel('Fill in the blank');
  await input.fill('london');
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('Incorrect', { exact: true })).toBeVisible();
  await expect(canvas.getByText('cancel', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Paris', { exact: true })).toBeVisible();
});

test('empty submit grades incorrect and still resolves (@s6)', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('Incorrect', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Paris', { exact: true })).toBeVisible();
});

test('Enter/return submits the same grade path (@s7)', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const input = canvas.getByLabel('Fill in the blank');
  await input.fill('paris');
  await input.press('Enter');

  await expect(canvas.getByText('Correct!', { exact: true })).toBeVisible();
});

test('after submit the attempt cannot be changed or resubmitted (@s5)', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const input = canvas.getByLabel('Fill in the blank');
  await input.fill('paris');
  await canvas.getByText('Submit', { exact: true }).click();
  await expect(canvas.getByText('Correct!', { exact: true })).toBeVisible();

  // RN web maps editable={false} to readonly — input stays locked at submitted value.
  await expect(input).toHaveAttribute('readonly', '');
  await expect(input).toHaveValue('paris');

  // Resubmit must not change the locked correct result.
  await canvas.getByText('Submit', { exact: true }).click({ force: true });
  await expect(canvas.getByText('Correct!', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Incorrect', { exact: true })).toHaveCount(0);
  await expect(input).toHaveValue('paris');
});

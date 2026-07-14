const { test, expect } = require('@playwright/test');

// Title 'Features/SlideView' → slug 'features-slideview'.
const story = (name) => `/?path=/story/features-slideview--${name}`;

test('Slide view instructional story loads', async ({ page }) => {
  await page.goto(story('instructional'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.getByText('Photosynthesis', { exact: true })).toBeVisible();
  await expect(
    canvas.getByText('Plants convert light into chemical energy.', { exact: true }),
  ).toBeVisible();
});

test('Slide view multiple choice story loads', async ({ page }) => {
  await page.goto(story('multiple-choice'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Capitals', { exact: true })).toBeVisible();
  await expect(canvas.getByText('What is the capital of France?', { exact: true })).toBeVisible();
});

const { test, expect } = require('@playwright/test');

// Title 'Features/MatchingActivity' → slug 'features-matchingactivity'.
const story = (name) => `/?path=/story/features-matchingactivity--${name}`;

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('features-matchingactivity--default');
});

test('Default story renders prompt, columns, and Submit', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(
    canvas.getByText('Match each country to its capital.', { exact: true }),
  ).toBeVisible();
  await expect(canvas.getByText('France', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Paris', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Submit', { exact: true })).toBeVisible();
  await expect(canvas.getByText('All correct!', { exact: true })).toHaveCount(0);
});

test('pairing all items and submitting shows All correct and explanation', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('France', { exact: true }).click();
  await canvas.getByText('Paris', { exact: true }).click();
  await canvas.getByText('Germany', { exact: true }).click();
  await canvas.getByText('Berlin', { exact: true }).click();
  await canvas.getByText('Italy', { exact: true }).click();
  await canvas.getByText('Rome', { exact: true }).click();
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('All correct!', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Why', { exact: true })).toBeVisible();
});

test('WithoutExplanation story grades without Why', async ({ page }) => {
  await page.goto(story('without-explanation'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('France', { exact: true }).click();
  await canvas.getByText('Paris', { exact: true }).click();
  await canvas.getByText('Germany', { exact: true }).click();
  await canvas.getByText('Berlin', { exact: true }).click();
  await canvas.getByText('Italy', { exact: true }).click();
  await canvas.getByText('Rome', { exact: true }).click();
  await canvas.getByText('Submit', { exact: true }).click();

  await expect(canvas.getByText('All correct!', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Why', { exact: true })).toHaveCount(0);
});

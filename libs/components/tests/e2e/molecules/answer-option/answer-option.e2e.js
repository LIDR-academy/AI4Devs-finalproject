const { test, expect } = require('@playwright/test');

// Title 'Molecules/AnswerOption' → slug 'molecules-answeroption'.
const story = (name) => `/?path=/story/molecules-answeroption--${name}`;

test('Default story loads', async ({ page }) => {
  await page.goto(story('default'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('molecules-answeroption--default');
});

test('Default story renders the option copy', async ({ page }) => {
  await page.goto(story('default'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(
    canvas.getByText('Chloroplasts capture light energy', { exact: true }),
  ).toBeVisible();
});

test('Incorrect story renders the incorrect option copy', async ({ page }) => {
  await page.goto(story('incorrect'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(
    canvas.getByText('Mitochondria capture light energy', { exact: true }),
  ).toBeVisible();
});

test('Interactive story renders every option', async ({ page }) => {
  await page.goto(story('interactive'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(
    canvas.getByText('Chloroplasts capture light energy', { exact: true }),
  ).toBeVisible();
  await expect(
    canvas.getByText('Mitochondria capture light energy', { exact: true }),
  ).toBeVisible();
  await expect(canvas.getByText('Ribosomes capture light energy', { exact: true })).toBeVisible();
});

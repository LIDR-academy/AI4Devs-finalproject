const { test, expect } = require('@playwright/test');

const story = (name) => `/?path=/story/molecules-navitem--${name}`;

test('Inactive story loads', async ({ page }) => {
  await page.goto(story('inactive'));
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');

  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('molecules-navitem--inactive');
});

test('Pill story renders the Home destination', async ({ page }) => {
  await page.goto(story('pill'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Home', { exact: true })).toBeVisible();
});

test('Underline story renders the Home destination', async ({ page }) => {
  await page.goto(story('underline'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Home', { exact: true })).toBeVisible();
});

test('Dot story renders the Home destination', async ({ page }) => {
  await page.goto(story('dot'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Home', { exact: true })).toBeVisible();
});

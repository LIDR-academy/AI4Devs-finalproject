const { test, expect } = require('@playwright/test');

test('LanguageSettings story loads', async ({ page }) => {
  await page.goto('/?path=/story/features-languagesettings--default');
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
});

test('renders the section heading from the active locale bundle', async ({ page }) => {
  await page.goto('/?path=/story/features-languagesettings--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('Language', { exact: true })).toBeVisible();
});

test('lists all four supported languages by endonym', async ({ page }) => {
  await page.goto('/?path=/story/features-languagesettings--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.getByText('English', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Español', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Português', { exact: true })).toBeVisible();
  await expect(canvas.getByText('Deutsch', { exact: true })).toBeVisible();
});

test('selecting a language switches the active locale live', async ({ page }) => {
  await page.goto('/?path=/story/features-languagesettings--default');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.getByText('Español', { exact: true }).click();

  // Real useLocalization()/LocalizationProvider (.storybook/preview.tsx) — switching to
  // Spanish re-renders the section heading translated ("Idioma"), not just a visual toggle.
  await expect(canvas.getByText('Idioma', { exact: true })).toBeVisible();
});

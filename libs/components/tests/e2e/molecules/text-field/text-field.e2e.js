const { test, expect } = require('@playwright/test');

test('Filled text field with value', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--filled');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');
  await expect(canvas.locator('#email')).toHaveValue('email@provider.com');
});

test('Filled text field story loads', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--filled');

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  expect(page.url()).toContain('molecules-textfield--filled');
});

test('Outlined text field story loads', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--outlined');

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  expect(page.url()).toContain('molecules-textfield--outlined');
});

test('Text field with icons story loads', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--with-icons');

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  expect(page.url()).toContain('molecules-textfield--with-icons');
});

test('Error text field story loads', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--error');

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  expect(page.url()).toContain('molecules-textfield--error');
});

test('Multiline text field story loads', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--multiline');

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  expect(page.url()).toContain('molecules-textfield--multiline');
});

test('Disabled text field story loads', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--disabled');

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  expect(page.url()).toContain('molecules-textfield--disabled');
});

test('Filled text field renders label and placeholder', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--filled');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Lesson title')).toBeVisible();
  await expect(canvas.getByPlaceholder('e.g. Photosynthesis basics')).toBeVisible();
});

test('Text field with icons renders label, placeholder and leading icon', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--with-icons');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Source URL')).toBeVisible();
  await expect(canvas.getByPlaceholder('Paste a link')).toBeVisible();
  await expect(canvas.locator('text=link')).toBeVisible();
});

test('Error text field renders supporting text', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--error');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=We need a title to save your lesson')).toBeVisible();
});

// Full-review Round 2 — TextField now derives accessibilityInvalid from error by default, so its
// own canonical Error story (error: true, no explicit accessibilityInvalid) must expose
// aria-invalid="true" on web, closing the WCAG 4.1.2/1.3.1 gap the design review flagged.
test('Error text field exposes aria-invalid to assistive tech', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--error');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('input')).toHaveAttribute('aria-invalid', 'true');
});

test('Filled text field does not expose aria-invalid when there is no error', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--filled');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('input')).toHaveAttribute('aria-invalid', 'false');
});

test('Multiline text field renders as a textarea with label', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--multiline');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Paste your text')).toBeVisible();
  await expect(canvas.locator('textarea')).toBeVisible();
});

test('Disabled text field renders supporting text and is read-only', async ({ page }) => {
  await page.goto('/?path=/story/molecules-textfield--disabled');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Not available yet')).toBeVisible();
  await expect(canvas.locator('input').first()).not.toBeEditable();
});

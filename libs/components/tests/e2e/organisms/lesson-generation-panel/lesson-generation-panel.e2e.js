const { test, expect } = require('@playwright/test');

// Title 'Organisms/LessonGenerationPanel' → slug 'organisms-lessongenerationpanel'.
const story = (name) => `/?path=/story/organisms-lessongenerationpanel--${name}`;

test('EmptyGenerateDisabled story loads', async ({ page }) => {
  await page.goto(story('empty-generate-disabled'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-lessongenerationpanel--empty-generate-disabled');
});

// @s1 — the composition picker offers all three choices, with "both" selected by default.
test('EmptyGenerateDisabled story renders all three composition choices', async ({ page }) => {
  await page.goto(story('empty-generate-disabled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Instructional only')).toBeVisible();
  await expect(canvas.locator('text=Activity only')).toBeVisible();
  await expect(canvas.locator('text=Both')).toBeVisible();
});

// @s16 — Generate is unavailable until a document has been extracted.
test('EmptyGenerateDisabled story disables the Generate control', async ({ page }) => {
  await page.goto(story('empty-generate-disabled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const generateLabel = canvas.locator('text=Generate lesson').first();
  const generateControl = generateLabel.locator('xpath=ancestor::button[1]');
  await expect(generateControl).toBeDisabled();
});

// @s16 — once an extracted document is available, Generate becomes enabled.
test('EmptyGenerateEnabled story enables the Generate control', async ({ page }) => {
  await page.goto(story('empty-generate-enabled'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const generateLabel = canvas.locator('text=Generate lesson').first();
  const generateControl = generateLabel.locator('xpath=ancestor::button[1]');
  await expect(generateControl).toBeEnabled();
});

// @s14 — the Loading state shows the multi-step progress, not a bare spinner.
test('Loading story renders the multi-step progress', async ({ page }) => {
  await page.goto(story('loading'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=Reading content').first()).toBeVisible();
  await expect(canvas.locator('text=Generating slides').first()).toBeVisible();
  await expect(canvas.locator('text=Attaching images').first()).toBeVisible();
});

// @s17 — the Content state shows a ready summary and the open-in-player CTA.
test('Content story renders the ready summary and the open-in-player CTA', async ({ page }) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=8 slides generated')).toBeVisible();
  await expect(canvas.locator('text=Open in player')).toBeVisible();
});

// @s2 — the composition picker interaction itself: choosing a different option actually
// changes the selected value (not just static markup).
test('InteractivePicker story updates the selected composition when a different option is chosen', async ({
  page,
}) => {
  await page.goto(story('interactive-picker'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await canvas.locator('text=Instructional only').click();

  const option = canvas.locator('text=Instructional only').first();
  const radio = option.locator('xpath=ancestor::*[@aria-checked][1]');
  await expect(radio).toHaveAttribute('aria-checked', 'true');
});

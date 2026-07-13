const { test, expect } = require('@playwright/test');

// Title 'Organisms/ApiKeyForm' → slug 'organisms-apikeyform'.
const story = (name) => `/?path=/story/organisms-apikeyform--${name}`;

test('Empty story loads', async ({ page }) => {
  await page.goto(story('empty'));

  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();
  expect(page.url()).toContain('organisms-apikeyform--empty');
});

// @s5/@s14 — the Empty state's input exposes an accessible label, guidance is shown, and Save
// stays disabled until a non-blank key is entered.
test('Empty story renders a labelled input, guidance, and a disabled Save control', async ({
  page,
}) => {
  await page.goto(story('empty'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('[aria-label="API key"]')).toBeVisible();
  await expect(canvas.locator("text=Don't have a key? Get one from OpenAI").first()).toBeVisible();

  const saveLabel = canvas.locator('text=Save').first();
  const saveControl = saveLabel.locator('xpath=ancestor::button[1]');
  await expect(saveControl).toBeDisabled();
});

// @s1/@s3/@s14 — the Content (masked) state shows the saved-status text and enabled
// Replace/Remove controls (both button-role, WCAG touch-target-sized via the Button atom); the
// raw key is never rendered.
test('Content story renders the masked saved status and enabled Replace/Remove controls', async ({
  page,
}) => {
  await page.goto(story('content'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('text=OpenAI key saved · Updated Jan 1, 2026')).toBeVisible();

  const replaceControl = canvas
    .locator('text=Replace')
    .first()
    .locator('xpath=ancestor::button[1]');
  await expect(replaceControl).toBeEnabled();
  const removeControl = canvas.locator('text=Remove').first().locator('xpath=ancestor::button[1]');
  await expect(removeControl).toBeEnabled();
});

// task-7/@s2 — the initial status fetch (Loading) shows a progress indicator instead of the
// input/masked control.
test('Loading story renders a progress indicator and no Save control', async ({ page }) => {
  await page.goto(story('loading'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  await expect(canvas.locator('[role="progressbar"]')).toBeVisible();
  await expect(canvas.locator('text=Save')).toHaveCount(0);
});

// @s6/@s7/@s9/@s14 — a save/remove failure renders an alert-role banner with the error text,
// and the input stays editable (no masked state, retry = resubmitting).
test('Error story renders the alert banner and keeps the input editable', async ({ page }) => {
  await page.goto(story('error'));
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  const alert = canvas.locator('[role="alert"]');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("That key didn't validate. Check it and try again.");
  await expect(canvas.locator('[aria-label="API key"]')).toBeEditable();
});

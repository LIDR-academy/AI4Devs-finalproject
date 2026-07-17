const { test, expect } = require('@playwright/test');

test('Slide progress story page loads', async ({ page }) => {
  // Verify the story page can navigate to the correct URL
  await page.goto('/?path=/story/molecules-slide-progress--default');

  // Verify the iframe is present and visible
  const iframe = page.locator('iframe[title="storybook-preview-iframe"]');
  await expect(iframe).toBeVisible();

  // Verify we're on the right story by checking the URL contains the story path
  expect(page.url()).toContain('molecules-slide-progress--default');
});

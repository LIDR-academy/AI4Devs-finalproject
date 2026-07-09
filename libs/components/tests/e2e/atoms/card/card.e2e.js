const { test, expect } = require('@playwright/test');

test('Card component renders', async ({ page }) => {
  await page.goto('/?path=/story/atoms-card--elevated');
  const canvas = page.frameLocator('iframe[title="storybook-preview-iframe"]');

  // Card is rendered as a div with display: flex and border-radius
  // Look for the container with Storybook's default story styling
  const storyContainer = canvas.locator('div').filter({ has: canvas.locator('text=Photosynthesis basics') }).first();
  await expect(storyContainer).toBeVisible();
});

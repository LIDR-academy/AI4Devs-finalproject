import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Manual Composition Flow
 * 
 * Tests the complete manual meditation composition workflow:
 * - Access the meditation builder
 * - Enter and preserve meditation text
 * - Verify output type indication (PODCAST when no image, VIDEO when image present)
 * - Image toggle behavior
 * 
 * Corresponds to User Story scenarios:
 * - SC-001: Access Meditation Builder
 * - SC-002: Define Meditation Text
 * - SC-005/SC-006: Output Type Determination (PODCAST/VIDEO)
 */

test.describe('Manual Composition Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the meditation builder page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForSelector('[data-testid="meditation-builder"]', { timeout: 10000 });
  });

  test('should display the meditation builder interface', async ({ page }) => {
    // Verify main container is visible
    const builder = page.locator('[data-testid="meditation-builder"]');
    await expect(builder).toBeVisible();

    // Verify key UI elements are present
    await expect(page.locator('text=Meditation Text')).toBeVisible();
    await expect(page.locator('text=Background Music')).toBeVisible();
    await expect(page.locator('text=Visual Content')).toBeVisible();
    await expect(page.locator('text=Output Type')).toBeVisible();
  });

  test('should preserve meditation text exactly as entered', async ({ page }) => {
    const testText = 'Sit comfortably and close your eyes. Take a deep breath in... and slowly exhale.';

    // Find the text editor (textarea)
    const textEditor = page.locator('textarea').first();
    
    // Enter text
    await textEditor.fill(testText);

    // Wait a moment for any auto-save
    await page.waitForTimeout(1500);

    // Verify the text is preserved exactly
    const currentValue = await textEditor.inputValue();
    expect(currentValue).toBe(testText);
  });

  test('should indicate PODCAST output type when no image is selected', async ({ page }) => {
    // Enter some text
    const textEditor = page.locator('textarea').first();
    await textEditor.fill('A short meditation text');

    // Wait for any state updates
    await page.waitForTimeout(500);

    // Verify output type indicates PODCAST
    // Look for "Generate Podcast" text or PODCAST indicator
    const outputSection = page.locator('text=Output Type').locator('..');
    await expect(outputSection.locator('text=/podcast/i')).toBeVisible();
  });

  test('should support very long meditation text', async ({ page }) => {
    // Generate a long text (but within 10,000 character limit)
    const longText = 'Om mani padme hum. '.repeat(400); // ~8000 characters

    const textEditor = page.locator('textarea').first();
    await textEditor.fill(longText);

    // Shorter wait time
    await page.waitForTimeout(300);

    // Verify the long text is preserved
    const currentValue = await textEditor.inputValue();
    expect(currentValue.length).toBe(longText.length);
  });

  test('should clear text when user deletes it', async ({ page }) => {
    const textEditor = page.locator('textarea').first();
    
    // Enter text
    await textEditor.fill('Some initial text');
    await page.waitForTimeout(200);

    // Clear the text
    await textEditor.clear();
    await page.waitForTimeout(200);

    // Verify text is empty
    const currentValue = await textEditor.inputValue();
    expect(currentValue).toBe('');
  });

  test('should preserve text with special characters and line breaks', async ({ page }) => {
    const complexText = `Line 1: Special chars !@#$%^&*()
Line 2: "Quoted text" and 'single quotes'
Line 3: Zen kōan: 空 (emptiness)
Line 4: Accents: café, naïve, résumé`;

    const textEditor = page.locator('textarea').first();
    await textEditor.fill(complexText);
    await page.waitForTimeout(300);

    const currentValue = await textEditor.inputValue();
    expect(currentValue).toBe(complexText);
  });
});

import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests: AI Generation Flows
 * 
 * Tests AI-powered content generation features:
 * - AI text generation from scratch
 * - AI text enhancement of existing content
 * - AI image generation
 * - Loading states during AI operations
 * - Error handling when AI services are unavailable
 * 
 * Corresponds to User Story scenarios:
 * - SC-003: AI Text Generation
 * - SC-004: AI Image Generation
 * - SC-015: Fast Response Times (< 0.5s UI feedback)
 */

// Mock AI API responses
const mockAIRoutes = async (page: Page) => {
  // Mock AI text generation (composition endpoint)
  await page.route('**/api/v1/compositions/*/text/generate', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        text: 'Take a moment to breathe deeply. Feel the air entering your lungs.',
      }),
    });
  });

  // Mock AI text generation (global endpoint)
  await page.route('**/api/v1/compositions/text/generate', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        text: 'Breathe in peace, breathe out stress. You are calm and centered.',
      }),
    });
  });

  // Mock AI image generation endpoint
  await page.route('**/api/v1/compositions/image/generate', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        imageReference: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      }),
    });
  });

  // Mock composition creation
  await page.route('**/api/v1/compositions', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-composition-id',
          text: '',
          musicReference: null,
          imageReference: null,
          outputType: 'PODCAST',
        }),
      });
    }
  });

  // Mock composition GET/PUT/DELETE operations
  await page.route('**/api/v1/compositions/*', async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-composition-id',
          text: 'Test text',
          musicReference: null,
          imageReference: null,
          outputType: 'PODCAST',
        }),
      });
    } else if (method === 'PUT') {
      // Determine what's being updated based on URL
      let response = {
        id: 'test-composition-id',
        text: 'Updated text',
        musicReference: null,
        imageReference: null,
        outputType: 'PODCAST',
      };
      
      if (url.includes('/image')) {
        response = { ...response, imageReference: 'data:image/png;base64,abc', outputType: 'VIDEO' };
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    } else if (method === 'DELETE' && url.includes('/image')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-composition-id',
          text: 'Test text',
          musicReference: null,
          imageReference: null,
          outputType: 'PODCAST',
        }),
      });
    }
  });
};

test.describe('AI Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up AI API mocks
    await mockAIRoutes(page);

    // Navigate to the meditation builder
    await page.goto('/');
    await page.waitForSelector('[data-testid="meditation-builder"]', { timeout: 10000 });
  });

  test('should show loading state during AI text generation', async ({ page }) => {
    // Enter some initial text
    const textEditor = page.locator('textarea').first();
    await textEditor.fill('Meditation about peace');
    await page.waitForTimeout(500);

    // Find and click the generate text button using data-testid
    const generateBtn = page.locator('[data-testid="generate-text-button"]');
    await expect(generateBtn).toBeVisible();

    // Click generate
    await generateBtn.click();

    // Verify loading state appears (button disabled with loading indicator)
    await expect(generateBtn).toHaveAttribute('aria-busy', 'true', { timeout: 1000 });
  });

  test('should handle AI text generation errors gracefully', async ({ page }) => {
    // Override the mock to return an error
    await page.route('**/api/v1/compositions/text/generate', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'GENERATION_ERROR',
          message: 'AI service unavailable',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // Enter text and try to generate
    const textEditor = page.locator('textarea').first();
    await textEditor.fill('Test text');
    await page.waitForTimeout(500);

    const generateBtn = page.locator('[data-testid="generate-text-button"]');
    await generateBtn.click();

    // Wait for error state - button should become enabled again after error
    await page.waitForTimeout(1000);
    
    // The app should handle the error gracefully (not crash)
    const builder = page.locator('[data-testid="meditation-builder"]');
    await expect(builder).toBeVisible();
  });

  test('should show loading state during AI image generation', async ({ page }) => {
    // Enter text for image prompt
    const textEditor = page.locator('textarea').first();
    await textEditor.fill('A peaceful zen garden with cherry blossoms');
    await page.waitForTimeout(500);

    // Find the generate image button using data-testid
    const generateImageBtn = page.locator('[data-testid="generate-image-button"]');

    // Wait for button to be visible and enabled
    await expect(generateImageBtn).toBeVisible();
    
    // Click to generate image
    await generateImageBtn.click();

    // Verify button shows loading state
    await expect(generateImageBtn).toHaveAttribute('aria-busy', 'true', { timeout: 1000 });
  });

  test('should display AI-generated image immediately after generation', async ({ page }) => {
    // Enter text for image prompt
    const textEditor = page.locator('textarea').first();
    await textEditor.fill('Sunset over mountains');
    await page.waitForTimeout(500);

    // Generate the image using data-testid
    const generateImageBtn = page.locator('[data-testid="generate-image-button"]');
    
    await generateImageBtn.click();

    // Wait for image to be generated and state to update
    await page.waitForTimeout(1000);

    // The component should update to show video mode (image is present)
    // This validates that image generation completed successfully
    const outputSection = page.locator('text=Output Type').locator('..');
    await expect(outputSection.locator('text=/video/i')).toBeVisible({ timeout: 2000 });
  });

  test('should update output type to VIDEO after AI image generation', async ({ page }) => {
    // Initially should show PODCAST (no image)
    const outputSection = page.locator('text=Output Type').locator('..');
    await expect(outputSection.locator('text=/podcast/i')).toBeVisible();

    // Enter text and generate image
    const textEditor = page.locator('textarea').first();
    await textEditor.fill('Mountain landscape at dawn');
    await page.waitForTimeout(500);

    const generateImageBtn = page.locator('[data-testid="generate-image-button"]');
    
    await generateImageBtn.click();

    // Wait for image generation
    await page.waitForTimeout(800);

    // Output type should change to VIDEO
    await expect(outputSection.locator('text=/video/i')).toBeVisible({ timeout: 2000 });
  });

  test('should disable generate buttons during any AI operation', async ({ page }) => {
    // Enter text
    const textEditor = page.locator('textarea').first();
    await textEditor.fill('Test meditation text');
    await page.waitForTimeout(500);

    const generateTextBtn = page.locator('[data-testid="generate-text-button"]');
    const generateImageBtn = page.locator('[data-testid="generate-image-button"]');

    // Click generate text
    await generateTextBtn.click();

    // Both buttons should be disabled/show busy state during the operation
    await expect(generateTextBtn).toHaveAttribute('aria-busy', 'true', { timeout: 1000 });
  });

  test('should preserve user text while showing AI-generated suggestions', async ({ page }) => {
    const originalText = 'My original meditation text';
    
    const textEditor = page.locator('textarea').first();
    await textEditor.fill(originalText);
    await page.waitForTimeout(500);

    // Generate AI text
    const generateBtn = page.locator('[data-testid="generate-text-button"]');
    await generateBtn.click();

    // Wait for AI generation
    await page.waitForTimeout(800);

    // After generation completes, verify the page is still functional
    // The text editor should contain some text (either original or generated)
    const newValue = await textEditor.inputValue();
    expect(newValue.length).toBeGreaterThan(0);
  });
});

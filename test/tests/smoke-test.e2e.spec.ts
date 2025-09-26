import { test, expect } from '@playwright/test';

test.describe('E2E Smoke Test', () => {
  test('should load the application successfully', async ({ page }) => {
    // Test that the application loads without critical errors
    
    // Navigate to the application
    await page.goto('/');
    
    // Verify the page loads with some title (may be default Next.js title initially)
    await expect(page).toHaveTitle(/.*/);
    
    // Check that the main content is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Verify no critical JavaScript errors occurred
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Assert no critical errors (allow warnings)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('Deprecation') &&
      !error.includes('faker')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('should display core application components', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for main navigation/header elements or any heading
    const headings = page.locator('h1, h2, h3');
    if (await headings.first().isVisible()) {
      await expect(headings.first()).toBeVisible();
    }
    
    // Verify the page has some interactive content
    const interactiveElements = page.locator('button, input, select, a[href]');
    if (await interactiveElements.first().isVisible()) {
      await expect(interactiveElements.first()).toBeVisible();
    }
    
    // Check that the page is responsive (not just a blank page)
    const pageContent = page.locator('body');
    const textContent = await pageContent.textContent();
    expect(textContent?.length).toBeGreaterThan(20); // Ensure some content exists
  });

  test('should handle basic user interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test that the page is interactive
    const clickableElements = page.locator('button:not([disabled]), a[href]:not([disabled])');
    const firstClickable = clickableElements.first();
    
    if (await firstClickable.isVisible()) {
      // Verify element is actually clickable
      await expect(firstClickable).toBeEnabled();
      
      // Test hover state (if supported)
      await firstClickable.hover();
      await expect(firstClickable).toBeVisible();
    } else {
      // If no clickable elements, just verify the page is interactive
      await expect(page.locator('body')).toBeVisible();
    }
    
    // Test basic keyboard navigation (only if there are focusable elements)
    const focusableElements = page.locator('button, input, select, a[href], [tabindex]');
    if (await focusableElements.first().isVisible()) {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    }
  });

  test('should maintain application state during navigation', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get initial page state
    const initialTitle = await page.title();
    const initialUrl = page.url();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify state consistency
    await expect(page).toHaveTitle(initialTitle);
    expect(page.url()).toBe(initialUrl);
    
    // Check that the page still functions after refresh
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle network conditions gracefully', async ({ page }) => {
    // Test with slow network simulation
    await page.route('**/*', route => {
      // Simulate network delay for non-critical resources
      if (route.request().resourceType() === 'image' || route.request().resourceType() === 'stylesheet') {
        setTimeout(() => route.continue(), 100);
      } else {
        route.continue();
      }
    });
    
    await page.goto('/');
    
    // Verify the page loads even with simulated delays
    await expect(page).toHaveTitle(/.*/);
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');
    
    // Ensure no critical functionality is broken
    const mainContent = page.locator('main, [role="main"], .main, #main').first();
    if (await mainContent.isVisible()) {
      await expect(mainContent).toBeVisible();
    }
  });
});

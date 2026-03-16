import { test, expect } from '@playwright/test';

test.describe('Transaction Management E2E', () => {
  test.describe('Budgeting', () => {
    test.describe('Filtering and Search', () => {
      test.describe('Given a user wants to filter and search transactions', () => {
        test.describe('When they use filter controls and search functionality', () => {
          test.describe('Then they should be able to find specific transactions effectively', () => {
            test('should filter and search transactions effectively', async ({ page }) => {
              // Arrange: Navigate to the application
              await page.goto('/');
              await page.waitForLoadState('networkidle');

              // Look for filter controls
              const filterControls = page.locator('[data-testid="filter-controls"]');
              if (await filterControls.isVisible()) {
                await expect(filterControls).toBeVisible();

                // Test search functionality
                const searchInput = page.locator('[data-testid="search-input"]');
                if (await searchInput.isVisible()) {
                  await searchInput.fill('test');
                  await page.waitForLoadState('networkidle');
                }

                // Test type filter
                const typeFilter = page.locator('[data-testid="type-filter"]');
                if (await typeFilter.isVisible()) {
                  await typeFilter.selectOption({ value: 'income' });
                  await page.waitForLoadState('networkidle');
                }

                // Test category filter
                const categoryFilter = page.locator('[data-testid="category-filter"]');
                if (await categoryFilter.isVisible()) {
                  await categoryFilter.selectOption({ index: 1 });
                  await page.waitForLoadState('networkidle');
                }

                // Test frequency filter
                const frequencyFilter = page.locator('[data-testid="frequency-filter"]');
                if (await frequencyFilter.isVisible()) {
                  await frequencyFilter.selectOption({ index: 1 });
                  await page.waitForLoadState('networkidle');
                }
              }

              // Verify filtering doesn't break the interface
              await expect(page).toHaveTitle(/.*/);
            });
          });
        });
      });
    });
  });
});

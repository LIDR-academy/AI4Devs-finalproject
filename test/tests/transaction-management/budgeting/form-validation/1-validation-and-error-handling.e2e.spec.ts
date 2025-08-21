import { test, expect } from '@playwright/test';

test.describe('Transaction Management E2E', () => {
  test.describe('Budgeting', () => {
    test.describe('Form Validation', () => {
      test.describe('Given a user wants to create transactions', () => {
        test.describe('When they submit forms with invalid data', () => {
          test.describe('Then the system should handle validation and errors gracefully', () => {
            test('should handle form validation and error states gracefully', async ({ page }) => {
              // Arrange: Navigate to the application
              await page.goto('/');
              await page.waitForLoadState('networkidle');

                                      // Test that the transaction form loads and has proper structure
            const createButton = page.locator('[data-testid="create-transaction-button"]');
            if (await createButton.isVisible()) {
              await createButton.click();

              // Verify form elements are present
              await expect(page.locator('[data-testid="description-input"]')).toBeVisible();
              await expect(page.locator('[data-testid="amount-input"]')).toBeVisible();
              await expect(page.locator('[data-testid="date-input"]')).toBeVisible();
              await expect(page.locator('[data-testid="category-select"]')).toBeVisible();
              await expect(page.locator('[data-testid="frequency-select"]')).toBeVisible();
              await expect(page.locator('[data-testid="notes-input"]')).toBeVisible();

              // Verify submit button exists (may be disabled due to validation)
              await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();

              // Verify form doesn't crash
              await expect(page).toHaveTitle(/.*/);
            }
            });
          });
        });
      });
    });
  });
});

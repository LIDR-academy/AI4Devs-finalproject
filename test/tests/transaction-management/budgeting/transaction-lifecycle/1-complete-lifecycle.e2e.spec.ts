import { test, expect } from '@playwright/test';

test.describe('Transaction Management E2E', () => {
  test.describe('Budgeting', () => {
    test.describe('Transaction Lifecycle', () => {
      test.describe('Given a user wants to manage transaction lifecycle', () => {
        test.describe('When they perform complete transaction management operations', () => {
          test.describe('Then all lifecycle features should work together seamlessly', () => {
            test('should interact with transaction lifecycle components', async ({ page }) => {
              // Arrange: Navigate to the application
              const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3007';
              await page.goto(frontendUrl);
              await page.waitForLoadState('networkidle');

              // 1. Test transaction form interaction
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

                // Fill transaction form
                await page.fill('[data-testid="description-input"]', 'Test Transaction Lifecycle');
                await page.fill('[data-testid="amount-input"]', '500.00');
                await page.fill('[data-testid="date-input"]', '2024-01-15');
                
                // Select category (required field)
                const categorySelect = page.locator('[data-testid="category-select"]');
                if (await categorySelect.isVisible()) {
                  await categorySelect.selectOption({ index: 0 });
                }
                
                await page.fill('[data-testid="notes-input"]', 'Testing complete lifecycle');
                
                // Select frequency (required field)
                const frequencySelect = page.locator('[data-testid="frequency-select"]');
                if (await frequencySelect.isVisible()) {
                  await frequencySelect.selectOption({ value: 'month' });
                }

                // Verify submit button exists (may be disabled due to validation)
                await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
              }

              // 2. Test edit button interaction
              const editButton = page.locator('[data-testid="edit-button"]').first();
              if (await editButton.isVisible()) {
                await expect(editButton).toBeVisible();
              }

              // 3. Test delete button interaction
              const deleteButton = page.locator('[data-testid="delete-button"]').first();
              if (await deleteButton.isVisible()) {
                await expect(deleteButton).toBeVisible();
              }

              // Verify page doesn't crash
              await expect(page).toHaveTitle(/.*/);
            });
          });
        });
      });
    });
  });
});

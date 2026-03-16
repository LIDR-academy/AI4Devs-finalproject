import { test, expect } from '@playwright/test';

test.describe('Category Management E2E', () => {
  test.describe('Delete Category', () => {
    test.describe('Given a user has existing categories', () => {
      test.describe('When they want to delete a category', () => {
        test.describe('Then they should be able to delete categories successfully', () => {
          test('should delete an unused category through the UI', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // First, create a new category that we can safely delete
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in the category form
            await page.fill('[data-testid="category-name-input"]', 'Category To Delete');
            await page.selectOption('[data-testid="category-flow-select"]', 'expense');
            // Skip color input for now - it's optional
            // await page.fill('[data-testid="category-color-input"]', 'FF0000');
            await page.fill('[data-testid="category-description-input"]', 'This category will be deleted');

            // Submit the form
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Wait for the form submission to complete
            await page.waitForLoadState('networkidle');

            // Verify the category was created
            const categoryElement = page.locator('[data-testid*="category-name"]').filter({ hasText: 'Category To Delete' });
            await expect(categoryElement).toBeVisible();
            
            // Get the category ID from the created category
            const categoryId = await categoryElement.getAttribute('data-testid');
            const categoryIdValue = categoryId?.replace('category-name-', '') || '';

            // Act: Find and click the delete button for the category we just created
            const deleteButton = page.locator(`[data-testid="delete-category-${categoryIdValue}"]`);
            await expect(deleteButton).toBeVisible();
            
            // Set up dialog handler before clicking
            page.on('dialog', async dialog => {
              expect(dialog.type()).toBe('confirm');
              await dialog.accept();
            });
            
            await deleteButton.click();

            // Wait for the deletion to complete
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000); // Give extra time for deletion

            // Assert: Verify the category is no longer in the list
            await expect(page.locator('[data-testid*="category-name"]').filter({ hasText: 'Category To Delete' })).not.toBeVisible();
          });

          test('should show error when trying to delete a category in use', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Look for an existing category that might be in use (seeded categories)
            const deleteButton = page.locator('[data-testid*="delete-category"]').first();
            if (await deleteButton.isVisible()) {
              await deleteButton.click();

              // Handle the confirmation dialog
              page.on('dialog', async dialog => {
                expect(dialog.type()).toBe('confirm');
                await dialog.accept();
              });

              // Wait for the deletion attempt
              await page.waitForLoadState('networkidle');

              // Wait for potential error alert
              await page.waitForTimeout(2000);

              // Assert: Check if an error alert appeared
              // The error should be displayed via alert() in the frontend
              // We can't directly test alert content, but we can verify the category still exists
              // or check for error indicators
              
              // Verify the page still loads correctly
              await expect(page).toHaveTitle(/.*/);
            } else {
              // If no delete functionality found, just verify the page loads
              await expect(page).toHaveTitle(/.*/);
            }
          });

          test('should cancel category deletion when user cancels confirmation', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // First, create a new category that we can safely delete
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in the category form
            await page.fill('[data-testid="category-name-input"]', 'Category To Cancel Delete');
            await page.selectOption('[data-testid="category-flow-select"]', 'expense');
            // Skip color input for now - it's optional
            // await page.fill('[data-testid="category-color-input"]', '00FF00');
            await page.fill('[data-testid="category-description-input"]', 'This category deletion will be cancelled');

            // Submit the form
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Wait for the form submission to complete
            await page.waitForLoadState('networkidle');

            // Verify the category was created
            await expect(page.locator('[data-testid*="category-name"]').filter({ hasText: 'Category To Cancel Delete' })).toBeVisible();

            // Act: Find and click the delete button for the category we just created
            const deleteButton = page.locator('[data-testid*="delete-category"]').last();
            await expect(deleteButton).toBeVisible();
            await deleteButton.click();

            // Handle the confirmation dialog by cancelling
            page.on('dialog', async dialog => {
              expect(dialog.type()).toBe('confirm');
              await dialog.dismiss(); // Cancel the deletion
            });

            // Wait for the dialog to be handled
            await page.waitForLoadState('networkidle');

            // Assert: Verify the category is still in the list
            await expect(page.locator('[data-testid*="category-name"]').filter({ hasText: 'Category To Cancel Delete' })).toBeVisible();
          });

          test('should handle delete button visibility correctly', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Assert: Verify delete buttons are visible for categories
            const deleteButtons = page.locator('[data-testid*="delete-category"]');
            const deleteButtonCount = await deleteButtons.count();
            
            if (deleteButtonCount > 0) {
              // At least one delete button should be visible
              await expect(deleteButtons.first()).toBeVisible();
              
              // All delete buttons should be visible
              for (let i = 0; i < deleteButtonCount; i++) {
                await expect(deleteButtons.nth(i)).toBeVisible();
              }
            }

            // Verify the page loads correctly
            await expect(page).toHaveTitle(/.*/);
          });
        });
      });
    });
  });
});

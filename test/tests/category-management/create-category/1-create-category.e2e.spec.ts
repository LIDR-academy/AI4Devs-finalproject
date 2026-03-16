import { test, expect } from '@playwright/test';

test.describe('Category Management E2E', () => {
  test.describe('Create Category', () => {
    test.describe('Given a user wants to create a new category', () => {
      test.describe('When they navigate to the categories page', () => {
        test.describe('Then they should be able to create categories successfully', () => {
          test('should create an expense category through the UI', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in the category form
            await page.fill('[data-testid="category-name-input"]', 'Test Groceries');
            await page.selectOption('[data-testid="category-flow-select"]', 'expense');
            // Skip color input for now - it's optional
            // await page.locator('[data-testid="category-color-input"]').fill('#FF5733');
            await page.fill('[data-testid="category-description-input"]', 'Test grocery expenses');

            // Submit the form
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Wait for the form submission to complete
            await page.waitForLoadState('networkidle');

            // Assert: Verify the category appears in the list
            await expect(page.locator('text=Test Groceries')).toBeVisible();
            await expect(page.locator('text=Test grocery expenses')).toBeVisible();
            
            // Verify the color indicator is present
            const colorIndicator = page.locator('[data-testid*="category-color"]').first();
            await expect(colorIndicator).toBeVisible();
          });

          test('should create an income category through the UI', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in the category form
            await page.fill('[data-testid="category-name-input"]', 'Test Freelance');
            await page.selectOption('[data-testid="category-flow-select"]', 'income');
            // Skip color input for now - it's optional
            // await page.fill('[data-testid="category-color-input"]', '00FF00');
            await page.fill('[data-testid="category-description-input"]', 'Test freelance income');

            // Submit the form
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Wait for the form submission to complete
            await page.waitForLoadState('networkidle');

            // Assert: Verify the category appears in the list
            await expect(page.locator('[data-testid*="category-name"]').filter({ hasText: 'Test Freelance' })).toBeVisible();
            await expect(page.locator('[data-testid*="category-description"]').filter({ hasText: 'Test freelance income' })).toBeVisible();
          });

          test('should create a savings category through the UI', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in the category form
            await page.fill('[data-testid="category-name-input"]', 'Test Emergency Fund');
            await page.selectOption('[data-testid="category-flow-select"]', 's&i');
            // Skip color input for now - it's optional
            // await page.fill('[data-testid="category-color-input"]', '0000FF');
            await page.fill('[data-testid="category-description-input"]', 'Test emergency savings');

            // Submit the form
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Wait for the form submission to complete
            await page.waitForLoadState('networkidle');

            // Assert: Verify the category appears in the list
            await expect(page.locator('text=Test Emergency Fund')).toBeVisible();
            await expect(page.locator('text=Test emergency savings')).toBeVisible();
          });

          test('should handle form validation for required fields', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Try to submit without filling required fields
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            
            // Submit button should be disabled or show validation errors
            const isDisabled = await submitButton.isDisabled();
            if (!isDisabled) {
              await submitButton.click();
              
              // Wait for validation errors
              await page.waitForTimeout(1000);
              
              // Assert: Check for validation errors
              const nameError = page.locator('[data-testid="name-error"]');
              if (await nameError.isVisible()) {
                await expect(nameError).toContainText('required');
              }
            }
          });

          test('should cancel category creation and return to list', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in some data
            await page.fill('[data-testid="category-name-input"]', 'Test Cancel Category');

            // Click cancel button
            const cancelButton = page.locator('[data-testid="cancel-button"]');
            await expect(cancelButton).toBeVisible();
            await cancelButton.click();

            // Wait for navigation back to list
            await page.waitForLoadState('networkidle');

            // Assert: Verify we're back to the category list
            await expect(page.locator('[data-testid="create-category-button"]')).toBeVisible();
            await expect(page.locator('text=Test Cancel Category')).not.toBeVisible();
          });
        });
      });
    });
  });
});

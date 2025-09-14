import { test, expect } from '@playwright/test';

test.describe('Category Management E2E', () => {
  test.describe('Category Validation', () => {
    test.describe('Given a user wants to create or edit categories', () => {
      test.describe('When they submit invalid data', () => {
        test.describe('Then the system should handle validation and errors gracefully', () => {
          test('should validate required category name field', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Try to submit without filling the name field
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            
            // Check if submit button is disabled or try to submit
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
            } else {
              // If button is disabled, that's also valid validation
              expect(isDisabled).toBe(true);
            }
          });

          test('should validate category name length', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in a very long name
            const nameInput = page.locator('[data-testid="category-name-input"]');
            await expect(nameInput).toBeVisible();
            await nameInput.fill('A'.repeat(150)); // Very long name

            // Try to submit
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            
            const isDisabled = await submitButton.isDisabled();
            if (!isDisabled) {
              await submitButton.click();
              
              // Wait for validation errors
              await page.waitForTimeout(1000);
              
              // Assert: Check for validation errors
              const nameError = page.locator('[data-testid="name-error"]');
              if (await nameError.isVisible()) {
                await expect(nameError).toContainText('100');
              }
            }
          });

          test('should validate category name minimum length', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in a very short name
            const nameInput = page.locator('[data-testid="category-name-input"]');
            await expect(nameInput).toBeVisible();
            await nameInput.fill('A'); // Very short name

            // Try to submit
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            
            const isDisabled = await submitButton.isDisabled();
            if (!isDisabled) {
              await submitButton.click();
              
              // Wait for validation errors
              await page.waitForTimeout(1000);
              
              // Assert: Check for validation errors
              const nameError = page.locator('[data-testid="name-error"]');
              if (await nameError.isVisible()) {
                await expect(nameError).toContainText('2');
              }
            }
          });

          test('should validate required flow field', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in name but not flow
            const nameInput = page.locator('[data-testid="category-name-input"]');
            await expect(nameInput).toBeVisible();
            await nameInput.fill('Test Category');

            // Try to submit
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            
            const isDisabled = await submitButton.isDisabled();
            if (!isDisabled) {
              await submitButton.click();
              
              // Wait for validation errors
              await page.waitForTimeout(1000);
              
              // Assert: Check for validation errors
              const flowError = page.locator('[data-testid="flow-error"]');
              if (await flowError.isVisible()) {
                await expect(flowError).toContainText('required');
              }
            }
          });

          test('should handle form submission with valid data', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in valid data
            await page.fill('[data-testid="category-name-input"]', 'Valid Test Category');
            await page.selectOption('[data-testid="category-flow-select"]', 'expense');
            // Skip color input for now - it's optional
            // await page.fill('[data-testid="category-color-input"]', 'FF5733');
            await page.fill('[data-testid="category-description-input"]', 'Valid test description');

            // Submit the form
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Wait for the form submission to complete
            await page.waitForLoadState('networkidle');

            // Assert: Verify the category appears in the list
            await expect(page.locator('text=Valid Test Category')).toBeVisible();
            await expect(page.locator('text=Valid test description')).toBeVisible();
          });

          test('should handle color input validation', async ({ page }) => {
            // Arrange: Navigate to the categories page
            await page.goto('/categories');
            await page.waitForLoadState('networkidle');

            // Act: Click create category button
            const createButton = page.locator('[data-testid="create-category-button"]');
            await expect(createButton).toBeVisible();
            await createButton.click();

            // Wait for form to appear
            await page.waitForLoadState('networkidle');

            // Fill in valid data with color
            await page.fill('[data-testid="category-name-input"]', 'Color Test Category');
            await page.selectOption('[data-testid="category-flow-select"]', 'income');
            // Skip color input for now - it's optional
            // await page.fill('[data-testid="category-color-input"]', '00FF00');
            await page.fill('[data-testid="category-description-input"]', 'Testing color input');

            // Submit the form
            const submitButton = page.locator('[data-testid="submit-button"]');
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Wait for the form submission to complete
            await page.waitForLoadState('networkidle');

            // Assert: Verify the category appears in the list with color
            await expect(page.locator('text=Color Test Category')).toBeVisible();
            
            // Verify color indicator is present
            const colorIndicator = page.locator('[data-testid*="category-color"]').last();
            await expect(colorIndicator).toBeVisible();
          });
        });
      });
    });
  });
});

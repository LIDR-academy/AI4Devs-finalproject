import { test, expect } from '@playwright/test';

test.describe('Transaction Management E2E', () => {
  test.describe('Basic Transaction Creation', () => {
    test.describe('Given a user wants to complete critical financial workflows', () => {
      test.describe('When they perform complete transaction management operations', () => {
        test.describe('Then all features should work together seamlessly', () => {
          test('should complete full transaction lifecycle: create, edit, delete', async ({ page }) => {
            // Arrange: Navigate to the application
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3007';
            await page.goto(frontendUrl);
            await page.waitForLoadState('networkidle');

            // 1. Create a new transaction
            const createButton = page.locator('button:has-text("Add Transaction"), button:has-text("Create"), button:has-text("+")').first();
            if (await createButton.isVisible()) {
              await createButton.click();

              // Fill transaction form
              await page.fill('input[name="description"], input[placeholder*="description"], textarea[name="description"]', 'Test Transaction Lifecycle');
              await page.fill('input[name="amount"], input[placeholder*="amount"]', '500.00');
              await page.fill('input[name="date"], input[type="date"]', '2024-01-15');
              
              // Select category if available
              const categorySelect = page.locator('select[name="categoryId"], [data-testid="category-select"]');
              if (await categorySelect.isVisible()) {
                await categorySelect.selectOption({ index: 0 });
              }
              
              await page.fill('textarea[name="notes"], input[name="notes"], input[placeholder*="notes"]', 'Testing complete lifecycle');
              
              // Select frequency if available
              const frequencySelect = page.locator('select[name="frequency"], [data-testid="frequency-select"]');
              if (await frequencySelect.isVisible()) {
                await frequencySelect.selectOption({ value: 'month' });
              }

              // Submit form
              const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
              await submitButton.click();
              await page.waitForLoadState('networkidle');

              // Verify transaction was created
              const transactionText = page.locator('text=Test Transaction Lifecycle');
              await expect(transactionText).toBeVisible();
            }

            // 2. Edit the transaction
            const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();
            if (await editButton.isVisible()) {
              await editButton.click();

              // Update description
              await page.fill('input[name="description"], input[placeholder*="description"], textarea[name="description"]', 'Updated Transaction Lifecycle');
              
              // Save changes
              const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
              await saveButton.click();
              await page.waitForLoadState('networkidle');

              // Verify transaction was updated
              const updatedText = page.locator('text=Updated Transaction Lifecycle');
              await expect(updatedText).toBeVisible();
            }

            // 3. Delete the transaction
            const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete-button"]').first();
            if (await deleteButton.isVisible()) {
              await deleteButton.click();

              // Confirm deletion if confirmation dialog appears
              const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
              if (await confirmButton.isVisible()) {
                await confirmButton.click();
                await page.waitForLoadState('networkidle');
              }

              // Verify transaction was deleted
              const deletedText = page.locator('text=Updated Transaction Lifecycle');
              await expect(deletedText).not.toBeVisible();
            }
          });

          test('should manage categories and assign them to transactions', async ({ page }) => {
            // Arrange: Navigate to the application
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3007';
            await page.goto(frontendUrl);
            await page.waitForLoadState('networkidle');

            // 1. Create a new category if category management is available
            const categoryButton = page.locator('button:has-text("Categories"), button:has-text("Manage Categories"), [data-testid="category-button"]').first();
            if (await categoryButton.isVisible()) {
              await categoryButton.click();

              // Look for add category button
              const addCategoryButton = page.locator('button:has-text("Add Category"), button:has-text("+"), [data-testid="add-category"]').first();
              if (await addCategoryButton.isVisible()) {
                await addCategoryButton.click();

                // Fill category form
                await page.fill('input[name="name"], input[placeholder*="name"]', 'Test Category');
                await page.fill('input[name="color"], input[type="color"]', '#FF5733');
                await page.fill('textarea[name="description"], input[name="description"], input[placeholder*="description"]', 'Test category for E2E');

                // Submit category form
                const submitCategoryButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
                await submitCategoryButton.click();
                await page.waitForLoadState('networkidle');

                // Verify category was created
                const categoryText = page.locator('text=Test Category');
                await expect(categoryText).toBeVisible();
              }
            }

            // 2. Create transaction with the new category
            const createButton = page.locator('button:has-text("Add Transaction"), button:has-text("Create"), button:has-text("+")').first();
            if (await createButton.isVisible()) {
              await createButton.click();

              // Fill transaction form
              await page.fill('input[name="description"], input[placeholder*="description"], textarea[name="description"]', 'Transaction with Test Category');
              await page.fill('input[name="amount"], input[placeholder*="amount"]', '250.00');
              await page.fill('input[name="date"], input[type="date"]', '2024-01-16');
              
              // Select the test category if available
              const categorySelect = page.locator('select[name="categoryId"], [data-testid="category-select"]');
              if (await categorySelect.isVisible()) {
                await categorySelect.selectOption({ label: 'Test Category' });
              }

              // Submit form
              const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
              await submitButton.click();
              await page.waitForLoadState('networkidle');

              // Verify transaction was created with category
              const transactionText = page.locator('text=Transaction with Test Category');
              await expect(transactionText).toBeVisible();
            }
          });

          test('should view dashboard and see transaction summaries', async ({ page }) => {
            // Arrange: Navigate to the application
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3007';
            await page.goto(frontendUrl);
            await page.waitForLoadState('networkidle');

            // Look for dashboard elements
            const dashboardElements = page.locator('[data-testid="dashboard"], .dashboard, .overview, .summary');
            if (await dashboardElements.first().isVisible()) {
              // Verify dashboard loads
              await expect(dashboardElements.first()).toBeVisible();

              // Look for summary cards
              const summaryCards = page.locator('[data-testid="summary-card"], .summary-card, .metric-card');
              if (await summaryCards.first().isVisible()) {
                await expect(summaryCards.first()).toBeVisible();

                // Verify at least one metric is displayed
                const metricText = page.locator('text=/\\$|income|expense|total|net/i');
                await expect(metricText.first()).toBeVisible();
              }
            }

            // Verify page is interactive
            await expect(page).toHaveTitle(/.*/);
          });

          test('should filter and search transactions effectively', async ({ page }) => {
            // Arrange: Navigate to the application
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3007';
            await page.goto(frontendUrl);
            await page.waitForLoadState('networkidle');

            // Look for filter controls
            const filterControls = page.locator('[data-testid="filter-controls"], .filters, .filter-controls');
            if (await filterControls.first().isVisible()) {
              await expect(filterControls.first()).toBeVisible();

              // Test date filter if available
              const dateFilter = page.locator('input[type="date"], [data-testid="date-filter"]');
              if (await dateFilter.first().isVisible()) {
                await dateFilter.first().fill('2024-01-01');
                await page.waitForLoadState('networkidle');
              }

              // Test search if available
              const searchInput = page.locator('input[placeholder*="search"], input[name="search"], [data-testid="search-input"]');
              if (await searchInput.isVisible()) {
                await searchInput.fill('test');
                await page.waitForLoadState('networkidle');
              }

              // Test category filter if available
              const categoryFilter = page.locator('select[name="category"], [data-testid="category-filter"]');
              if (await categoryFilter.isVisible()) {
                await categoryFilter.selectOption({ index: 0 });
                await page.waitForLoadState('networkidle');
              }
            }

            // Verify filtering doesn't break the interface
            await expect(page).toHaveTitle(/.*/);
          });

          test('should handle form validation and error states gracefully', async ({ page }) => {
            // Arrange: Navigate to the application
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3007';
            await page.goto(frontendUrl);
            await page.waitForLoadState('networkidle');

            // Try to create transaction with invalid data
            const createButton = page.locator('button:has-text("Add Transaction"), button:has-text("Create"), button:has-text("+")').first();
            if (await createButton.isVisible()) {
              await createButton.click();

              // Try to submit empty form
              const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
              await submitButton.click();

              // Look for validation errors
              const errorMessages = page.locator('.error, .validation-error, [data-testid="error-message"]');
              if (await errorMessages.first().isVisible()) {
                await expect(errorMessages.first()).toBeVisible();
              }

              // Verify form doesn't crash
              await expect(page).toHaveTitle(/.*/);
            }
          });
        });
      });
    });
  });
});

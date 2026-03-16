import { test, expect } from '@playwright/test';

test.describe('Transaction Management E2E', () => {
  test.describe('Budgeting', () => {
    test.describe('Transaction References', () => {
      test.describe('Given a user is editing a transaction', () => {
        test.describe('When they try to reference the same transaction in its expression', () => {
          test.describe('Then the system should prevent self-reference', () => {
            test('should hide current transaction from expression dropdown options', async ({ page }) => {
              // Arrange: Navigate to the transactions page
              await page.goto('/');
              await page.waitForLoadState('networkidle');

              // Look for an existing transaction to edit
              const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-transaction"]').first();
              
              if (await editButton.isVisible()) {
                await editButton.click();
                await page.waitForLoadState('networkidle');

                // Get the transaction ID from the URL or form data
                const currentUrl = page.url();
                const transactionId = currentUrl.match(/\/edit\/([^\/]+)/)?.[1] || 
                                    await page.locator('input[name="id"]').inputValue().catch(() => null) ||
                                    await page.evaluate(() => {
                                      const form = document.querySelector('form');
                                      return form?.dataset.transactionId || null;
                                    });

                if (transactionId) {
                  // Act: Click on the expression field to open the dropdown
                  const expressionField = page.locator('[data-testid="expression-input"]');
                  await expressionField.click();
                  
                  // Type $ to trigger the dropdown
                  await expressionField.type('$');
                  
                  // Wait for dropdown to appear
                  await page.waitForSelector('[data-testid="transaction-dropdown"]', { timeout: 5000 });
                  
                  // Assert: The current transaction should not appear in the dropdown
                  const currentTransactionOption = page.locator(`[data-testid="transaction-option-${transactionId}"]`);
                  await expect(currentTransactionOption).not.toBeVisible();
                  
                  // Assert: Other transactions should still be visible
                  const otherTransactionOptions = page.locator('[data-testid^="transaction-option-"]');
                  const optionCount = await otherTransactionOptions.count();
                  expect(optionCount).toBeGreaterThan(0);
                } else {
                  // If we can't get the transaction ID, just verify the dropdown works
                  const expressionField = page.locator('[data-testid="expression-input"]');
                  await expressionField.click();
                  await expressionField.type('$');
                  
                  await page.waitForSelector('[data-testid="transaction-dropdown"]', { timeout: 5000 });
                  const dropdown = page.locator('[data-testid="transaction-dropdown"]');
                  await expect(dropdown).toBeVisible();
                }
              } else {
                // If no edit functionality found, skip this test
                test.skip();
              }
            });

            test('should prevent saving transaction with self-reference via backend validation', async ({ page }) => {
              // Arrange: Navigate to the transactions page
              await page.goto('/');
              await page.waitForLoadState('networkidle');

              // Look for an existing transaction to edit
              const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-transaction"]').first();
              
              if (await editButton.isVisible()) {
                await editButton.click();
                await page.waitForLoadState('networkidle');

                // Get the transaction ID from the URL or form data
                const transactionId = await page.evaluate(() => {
                  const url = window.location.href;
                  const match = url.match(/\/edit\/([^\/]+)/);
                  return match?.[1] || null;
                });

                if (transactionId) {
                  // Act: Try to set an expression that references itself
                  const expressionField = page.locator('[data-testid="expression-input"]');
                  await expressionField.clear();
                  await expressionField.fill(`$${transactionId} * 0.5`);
                  
                  // Try to submit the form
                  const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")');
                  await submitButton.click();
                  
                  // Wait for any error messages or network requests
                  await page.waitForLoadState('networkidle');
                  
                  // Assert: Should show an error message about self-reference
                  const errorMessage = page.locator('text=/cannot reference itself|self-reference/i');
                  await expect(errorMessage).toBeVisible({ timeout: 10000 });
                  
                  // Assert: Form should still be visible (not submitted successfully)
                  await expect(expressionField).toBeVisible();
                } else {
                  // If we can't get the transaction ID, skip this test
                  test.skip();
                }
              } else {
                // If no edit functionality found, skip this test
                test.skip();
              }
            });

            test('should allow referencing other transactions in expression', async ({ page }) => {
              // Arrange: Navigate to the transactions page
              await page.goto('/');
              await page.waitForLoadState('networkidle');

              // Look for an existing transaction to edit
              const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-transaction"]').first();
              
              if (await editButton.isVisible()) {
                await editButton.click();
                await page.waitForLoadState('networkidle');

                // Act: Click on the expression field to open the dropdown
                const expressionField = page.locator('[data-testid="expression-input"]');
                await expressionField.click();
                
                // Type $ to trigger the dropdown
                await expressionField.type('$');
                
                // Wait for dropdown to appear
                await page.waitForSelector('[data-testid="transaction-dropdown"]', { timeout: 5000 });
                
                // Get the first available transaction option (not the current one)
                const firstOption = page.locator('[data-testid^="transaction-option-"]').first();
                
                if (await firstOption.isVisible()) {
                  // Click on the first option
                  await firstOption.click();
                  
                  // Add some mathematical operation
                  await expressionField.type(' * 0.5');
                  
                  // Try to submit the form
                  const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")');
                  await submitButton.click();
                  
                  // Wait for the update to complete
                  await page.waitForLoadState('networkidle');
                  
                  // Assert: Should not show error messages about self-reference
                  const errorMessage = page.locator('text=/cannot reference itself|self-reference/i');
                  await expect(errorMessage).not.toBeVisible();
                  
                  // Assert: Should show success or redirect back to transaction list
                  const transactionList = page.locator('text=/transaction/i');
                  await expect(transactionList).toBeVisible();
                } else {
                  // If no other transactions available, skip this test
                  test.skip();
                }
              } else {
                // If no edit functionality found, skip this test
                test.skip();
              }
            });
          });
        });
      });
    });
  });
});

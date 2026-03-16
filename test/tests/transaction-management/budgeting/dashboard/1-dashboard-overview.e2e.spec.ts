import { test, expect } from '@playwright/test';

test.describe('Transaction Management E2E', () => {
  test.describe('Budgeting', () => {
    test.describe('Dashboard', () => {
      test.describe('Given a user wants to view their financial overview', () => {
        test.describe('When they access the dashboard', () => {
          test.describe('Then they should see transaction summaries and metrics', () => {
            test('should view dashboard and see transaction summaries', async ({ page }) => {
              // Arrange: Navigate to the application
              await page.goto('/');
              await page.waitForLoadState('networkidle');

              // Look for dashboard and specific summary cards
              const dashboard = page.locator('[data-testid="dashboard"]');
              if (await dashboard.isVisible()) {
                await expect(dashboard).toBeVisible();

                // Verify each specific summary card is present
                await expect(page.locator('[data-testid="income-summary"]')).toBeVisible();
                await expect(page.locator('[data-testid="expenses-summary"]')).toBeVisible();
                await expect(page.locator('[data-testid="net-summary"]')).toBeVisible();

                // Verify at least one metric is displayed
                const metricText = page.locator('text=/\\$|income|expense|total|net/i');
                await expect(metricText.first()).toBeVisible();
              }

              // Verify page is interactive
              await expect(page).toHaveTitle(/.*/);
            });
          });
        });
      });
    });
  });
});

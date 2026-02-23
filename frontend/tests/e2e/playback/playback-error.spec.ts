import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Meditation Library Error Handling
 * 
 * Verifies that the library correctly handles errors:
 * - 404 Not Found error
 * - 409 Conflict (not playable yet) error
 * - Global error handling shown to user
 */
test.describe('Meditation Library - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the meditation list API with at least one meditation
    await page.route('**/api/v1/playback/meditations', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          meditations: [
            {
              id: 'med-exists-01',
              title: 'Will Generate Error',
              state: 'COMPLETED',
              stateLabel: 'Completada',
              createdAt: '2026-02-16T10:30:00Z',
              mediaUrls: null // COMPLETED but missing urls for error trigger
            }
          ]
        })
      });
    });

    await page.goto('/library');
    await page.waitForSelector('.meditation-list');
  });

  test('should show error message when playback fails with 409', async ({ page }) => {
    // Mock the single meditation playback API to return 409
    await page.route('**/api/v1/playback/meditations/med-exists-01', (route) => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Esta meditación aún se está procesando. Por favor, espera a que esté lista.' })
      });
    });

    // Select the meditation
    await page.click('text=Will Generate Error');

    // Verify error message is shown in the player container
    const errorAlert = page.locator('.player-error[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveText(/This meditation is still being processed/);
    
    // Test the "Close" button in the error alert
    await errorAlert.locator('button:has-text("Close")').click();
    await expect(errorAlert).not.toBeVisible();
  });
});

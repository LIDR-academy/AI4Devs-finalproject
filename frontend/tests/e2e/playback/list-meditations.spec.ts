import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Meditation Library Listing
 * 
 * Verifies that the meditation library correctly lists meditations with their
 * processing states and translated labels.
 */
test.describe('Meditation Library - Listing', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the meditation list API
    await page.route('**/api/v1/playback/meditations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          meditations: [
            {
              id: 'meditation-ready',
              title: 'Morning Mindfulness',
              state: 'COMPLETED',
              stateLabel: 'Completada',
              createdAt: '2026-02-16T10:30:00Z',
              mediaUrls: {
                audioUrl: 'http://s3.aws.com/audio.mp3'
              }
            },
            {
              id: 'meditation-busy',
              title: 'Evening Relaxation',
              state: 'PROCESSING',
              stateLabel: 'Generando',
              createdAt: '2026-02-16T18:45:00Z',
              mediaUrls: null
            },
            {
              id: 'meditation-failed',
              title: 'Failed Meditation',
              state: 'FAILED',
              stateLabel: 'Fallida',
              createdAt: '2026-02-16T19:00:00Z',
              mediaUrls: null
            }
          ]
        })
      });
    });

    // Navigate to the library page
    await page.goto('/library');
    // Wait for the table to appear (based on the new modern layout)
    await page.waitForSelector('.meditation-list', { timeout: 10000 });
  });

  test('should display all meditations with correct state labels', async ({ page }) => {
    // Check for titles
    await expect(page.locator('text=Morning Mindfulness')).toBeVisible();
    await expect(page.locator('text=Evening Relaxation')).toBeVisible();
    await expect(page.locator('text=Failed Meditation')).toBeVisible();

    // Check for state labels (badges)
    await expect(page.locator('text=Completada')).toBeVisible();
    await expect(page.locator('text=Generando')).toBeVisible();
    await expect(page.locator('text=Fallida')).toBeVisible();
  });

  test('should show empty state message when no meditations are found', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/v1/playback/meditations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ meditations: [] })
      });
    });

    await page.goto('/library');
    await expect(page.locator('text=Aún no tienes meditaciones. Empieza creando una nueva.')).toBeVisible();
  });
});

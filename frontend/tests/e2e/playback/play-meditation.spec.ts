import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Meditation Playback Flow
 * 
 * Verifies that the meditation library correctly handles playback:
 * - Play button enabled only for COMPLETED state
 * - Media element loading correctly
 * - Selection triggers player update
 */
test.describe('Meditation Library - Playback', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the meditation list API
    await page.route('**/api/v1/playback/meditations', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          meditations: [
            {
              id: 'med-ready-01',
              title: 'Ready to Play',
              state: 'COMPLETED',
              stateLabel: 'Completada',
              createdAt: '2026-02-16T10:30:00Z',
              mediaUrls: {
                audioUrl: 'http://s3.aws.com/audio.mp3',
                subtitlesUrl: 'http://s3.aws.com/subs.srt'
              }
            },
            {
              id: 'med-busy-01',
              title: 'Generating meditation',
              state: 'PROCESSING',
              stateLabel: 'Generando',
              createdAt: '2026-02-16T18:45:00Z',
              mediaUrls: null
            }
          ]
        })
      });
    });

    // Mock playback info API
    await page.route('**/api/v1/playback/meditations/med-ready-01', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'med-ready-01',
          title: 'Ready to Play',
          state: 'COMPLETED',
          stateLabel: 'Completada',
          createdAt: '2026-02-16T10:30:00Z',
          mediaUrls: {
            audioUrl: 'http://s3.aws.com/audio.mp3',
            subtitlesUrl: 'http://s3.aws.com/subs.srt'
          }
        })
      });
    });

    await page.goto('/library');
    await page.waitForSelector('.meditation-list');
  });

  test('should enable play button only for completed meditations', async ({ page }) => {
    // Completed row should show "Reproducir" button and be enabled
    const rowReady = page.locator('tr').filter({ hasText: 'Ready to Play' });
    const btnPlay = rowReady.locator('button');
    await expect(btnPlay).toHaveText(/Reproducir/);
    await expect(btnPlay).toBeEnabled();

    // Processing row should show "Pausado..." or different text and be disabled
    const rowBusy = page.locator('tr').filter({ hasText: 'Generating meditation' });
    const btnBusy = rowBusy.locator('button');
    await expect(btnBusy).toHaveText(/Pausado/);
    await expect(btnBusy).toBeDisabled();
  });

  test('should load player when a meditation is selected', async ({ page }) => {
    // Click on the ready row or its button
    const rowReady = page.locator('tr').filter({ hasText: 'Ready to Play' });
    await rowReady.click();

    // Verify player shows up (based on the new 1100px-wide player layout)
    const playerTitle = page.locator('.meditation-player__title');
    await expect(playerTitle).toHaveText('Ready to Play');

    // Verify media source (audio or video element presence)
    // Note: React key forcing re-render ensures fresh load.
    // In our implementation, we use an <audio> or <video> tag inside MeditationPlayer.
    const audioElement = page.locator('audio');
    await expect(audioElement).toBeAttached();
    await expect(audioElement).toHaveAttribute('src', /audio\.mp3/);
  });
});

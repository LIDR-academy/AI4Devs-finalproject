import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for Meditation Builder Frontend
 * 
 * Tests critical user flows:
 * - Manual composition (text entry, music selection, output type indication)
 * - AI-powered generation (text enhancement, image generation)
 * - Media preview (music playback, image display)
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Maximum time one test can run */
  timeout: 30 * 1000,
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'playwright-report/junit.xml' }]
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL for tests */
    baseURL: process.env.BASE_URL || 'http://localhost:3011',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            // Disable hardware acceleration to avoid SWGL crash on Windows headless
            'layers.acceleration.disabled': true,
            'gfx.direct2d.disabled': true,
            'layers.offmainthreadcomposition.enabled': false,
            'media.hardware-video-decoding.force-enabled': false,
          },
        },
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  }, */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3011',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});

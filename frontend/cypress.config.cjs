const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: '__test__/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: '__test__/e2e/support/e2e.js',
    setupNodeEvents(on, config) {
      // Simplified tasks for CI compatibility
      on('task', {
        'cleanup:complete': () => {
          console.log('✅ Cleanup task called (simplified for CI)');
          return null;
        },
        
        'db:seed:test': () => {
          console.log('✅ Seed task called (simplified for CI)');
          return null;
        }
      });
    },
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    video: false,
    screenshotOnRunFailure: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
  },
}); 
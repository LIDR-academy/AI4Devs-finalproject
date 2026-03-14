import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // 3000 suele estar ocupado por Docker en este proyecto.
    // Permite override con CYPRESS_BASE_URL si se necesita otro puerto.
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3001',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1440,
    viewportHeight: 900,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 15000,
    env: {
      API_URL: 'http://localhost:4000',
      LOCALE: 'es',
    },
  },
});

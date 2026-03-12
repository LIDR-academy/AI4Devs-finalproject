import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    
    env: {
      keycloakUrl: 'http://localhost:8080',
      keycloakRealm: 'covoituraje',
      apiUrl: 'http://localhost:8081',
      oidcClientId: 'covoituraje-frontend',
      oidcRedirectUri: process.env.CYPRESS_BASE_URL || 'http://localhost:5173/callback',
    },
    
    // Retry failed tests
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Timeouts (reducidos para ejecución más rápida)
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 12000,
    
    // Experimental features
    experimentalOriginDependencies: true,
  },
})

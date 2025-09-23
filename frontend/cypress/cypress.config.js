const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Ajusta el puerto según tu configuración de dev
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.js',
  },
});
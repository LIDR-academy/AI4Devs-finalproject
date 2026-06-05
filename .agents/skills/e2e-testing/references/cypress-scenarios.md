# Cypress Spec & Custom Commands Reference

This reference document contains the default syntax structure and command integrations for writing Cypress tests.

## 1. Standard Cypress Spec (`cypress/e2e/login.cy.js`)
```javascript
describe('User Authentication', () => {
  beforeEach(() => {
    // Clean state
    cy.clearCookies();
    cy.visit('/login');
  });

  it('allows a user to log in', () => {
    // Assert and interact
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('Password123');
    cy.get('button[type="submit"]').click();

    // Verify side effects
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Welcome Back').should('be.visible');
  });
});
```

## 2. Custom Command Pattern (`cypress/support/commands.js`)
```javascript
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  }, {
    validate() {
      cy.getCookie('session_id').should('exist');
    }
  });
});
```

## 3. Cypress Configuration (`cypress.config.js`)
```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // Node events configuration
    },
  },
});
```

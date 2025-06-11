// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to handle authentication
Cypress.Commands.add('loginViaUI', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="login-button"]').click();
});

// Custom command to check if element exists
Cypress.Commands.add('elementExists', (selector) => {
  cy.get('body').then(($body) => {
    if ($body.find(selector).length > 0) {
      return true;
    }
    return false;
  });
});

// Custom command to wait for loading to finish
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
});

// Custom command to handle API responses
Cypress.Commands.add('interceptAPI', (method, url, alias) => {
  cy.intercept(method, `http://localhost:3001/api${url}`).as(alias);
}); 
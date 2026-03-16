// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for authentication
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/auth/login',
    body: {
      email,
      password
    }
  }).then((response) => {
    // Store token and user data in sessionStorage to match AuthContext
    window.sessionStorage.setItem('auth_token', response.body.token);
    
    // Create user object matching AuthContext format
    const user = {
      id: response.body.user.id,
      email: response.body.user.email,
      name: `${response.body.user.firstName} ${response.body.user.lastName}`.trim()
    };
    window.sessionStorage.setItem('user_data', JSON.stringify(user));
    
    // Set expiry time (1 hour) to match AuthContext
    const expiry = new Date().getTime() + (60 * 60 * 1000);
    window.sessionStorage.setItem('auth_expiry', expiry.toString());
  });
});

Cypress.Commands.add('logout', () => {
  window.sessionStorage.removeItem('auth_token');
  window.sessionStorage.removeItem('user_data');
  window.sessionStorage.removeItem('auth_expiry');
});

// Add command to wait for API to be ready
Cypress.Commands.add('waitForAPI', () => {
  cy.request({
    method: 'GET',
    url: 'http://localhost:3001/api/health',
    retryOnStatusCodeFailure: true,
    timeout: 30000
  });
}); 
// ***********************************************************
// This example support/e2e.ts is processed and
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

// Prevent TypeScript errors for custom commands
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to login with email and password
             * @example cy.login('user@example.com', 'password123')
             */
            login(email: string, password: string): Chainable<void>;
            
            /**
             * Custom command to set authentication token
             * @example cy.setAuthToken('jwt-token-here')
             */
            setAuthToken(token: string): Chainable<void>;
            
            /**
             * Custom command to clear authentication
             * @example cy.clearAuth()
             */
            clearAuth(): Chainable<void>;
        }
    }
}

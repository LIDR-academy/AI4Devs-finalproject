/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to login a user
 */
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.request({
        method: 'POST',
        url: '/api/v1/auth/login',
        body: { email, password },
    }).then((response) => {
        expect(response.status).to.eq(200);
        const token = response.body.token;
        cy.setAuthToken(token);
    });
});

/**
 * Custom command to set authentication token in localStorage
 */
Cypress.Commands.add('setAuthToken', (token: string) => {
    window.localStorage.setItem('token', token);
});

/**
 * Custom command to clear authentication
 */
Cypress.Commands.add('clearAuth', () => {
    window.localStorage.removeItem('token');
});

import './commands';

beforeEach(() => {
  cy.stubExternalServices();
});

Cypress.on('window:before:load', (win) => {
  (win as Window & { grecaptcha?: { ready: (cb: () => void) => void; execute: () => Promise<string> } }).grecaptcha = {
    ready: (cb: () => void) => cb(),
    execute: () => Promise.resolve('e2e-recaptcha-token'),
  };
});

import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

When('the harness visits the application root', () => {
  cy.visit('/');
});

Then('the shell exposes its main landmark', () => {
  // The shell's routed region (`apps/web/src/app/app.component.ts`): a `main`
  // landmark that is focusable so a route-change focus manager can move focus
  // to it (NFR-USE-03, WCAG 2.1 AA).
  cy.get('app-root main#main-content').should('exist');
});

Then('the router has settled on the default route', () => {
  // `''` is a real, resolvable route, so the router settles on `/` instead of
  // erroring. A failed bootstrap would leave `app-root` empty and never get
  // here; a wildcard redirect loop would not settle on `/`.
  cy.location('pathname').should('equal', '/');
  cy.get('app-root router-outlet').should('exist');
});

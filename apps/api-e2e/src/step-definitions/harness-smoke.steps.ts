import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

/**
 * The response of the last request made by the harness. Held in a closure
 * rather than in `cy.wrap`/aliases so the assertion step reads as a plain
 * value: this suite has exactly one request and no session to thread through.
 */
let response: Cypress.Response<unknown>;

When('the harness requests the API root', () => {
  cy.request({
    url: '/',
    // Every route answers 404 until T-C10-28 adds the first controller. That
    // is the expected state, not a failure: what is under test is that a
    // process is listening and speaking HTTP, not that a route exists.
    failOnStatusCode: false,
  }).then((res) => {
    response = res;
  });
});

Then('the API answers over HTTP', () => {
  // A live process that routes nothing: NestJS/Express answers 404. A dead
  // port would never reach this assertion — `cy.request` fails on ECONNREFUSED
  // regardless of `failOnStatusCode`.
  expect(response.status).to.equal(404);
  expect(response.headers).to.have.property('content-type');
});

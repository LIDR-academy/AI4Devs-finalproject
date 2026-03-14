type Role = 'patient' | 'doctor' | 'admin';

interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  emailVerified: boolean;
}

const API_URL = Cypress.env('API_URL') || 'http://localhost:4000';

function createAuthStorage(user: SessionUser, accessToken: string) {
  return JSON.stringify({
    state: {
      user,
      accessToken,
    },
    version: 0,
  });
}

Cypress.Commands.add('uniqueEmail', (prefix: string = 'cypress') => {
  const value = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
  return cy.wrap(value);
});

Cypress.Commands.add('setAuthSession', (user: SessionUser, accessToken = 'e2e-token') => {
  cy.window().then((win) => {
    win.localStorage.setItem('accessToken', accessToken);
    win.localStorage.setItem('auth-storage', createAuthStorage(user, accessToken));
  });
});

Cypress.Commands.add('stubExternalServices', () => {
  cy.intercept('GET', /https:\/\/www\.google\.com\/recaptcha\/.*/, {
    statusCode: 200,
    body: '',
  }).as('recaptcha-script');

  cy.intercept('GET', /https:\/\/maps\.googleapis\.com\/.*/, {
    statusCode: 200,
    body: '',
  }).as('google-maps-script');
});

Cypress.Commands.add('mockGeolocation', (lat = 19.4326, lng = -99.1332) => {
  cy.window().then((win) => {
    cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
      success({
        coords: {
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });
  });
});

Cypress.Commands.add('apiLogin', (email: string, password: string) => {
  return cy.request({
    method: 'POST',
    url: `${API_URL}/api/v1/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('loginAsRole', (role: Role) => {
  const roleMap: Record<Role, SessionUser> = {
    patient: {
      id: 'patient-1',
      email: 'patient@test.com',
      firstName: 'Paciente',
      lastName: 'E2E',
      role: 'patient',
      emailVerified: true,
    },
    doctor: {
      id: 'doctor-1',
      email: 'doctor@test.com',
      firstName: 'Doctor',
      lastName: 'E2E',
      role: 'doctor',
      emailVerified: true,
    },
    admin: {
      id: 'admin-1',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'E2E',
      role: 'admin',
      emailVerified: true,
    },
  };

  cy.setAuthSession(roleMap[role]);
});

declare global {
  namespace Cypress {
    interface Chainable {
      uniqueEmail(prefix?: string): Chainable<string>;
      setAuthSession(user: SessionUser, accessToken?: string): Chainable<void>;
      stubExternalServices(): Chainable<void>;
      mockGeolocation(lat?: number, lng?: number): Chainable<void>;
      apiLogin(
        email: string,
        password: string,
      ): Chainable<Cypress.Response<{ accessToken: string; user: SessionUser }>>;
      loginAsRole(role: Role): Chainable<void>;
    }
  }
}

export {};

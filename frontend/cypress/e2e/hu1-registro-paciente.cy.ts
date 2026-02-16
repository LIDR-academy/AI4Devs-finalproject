describe('HU1 - Registro de paciente', () => {
  beforeEach(() => {
    cy.visit('/es/register');
  });

  it('registra paciente correctamente', () => {
    cy.uniqueEmail('hu1').then((email) => {
      cy.intercept('POST', '**/api/v1/auth/register', {
        statusCode: 201,
        body: {
          accessToken: 'token-patient',
          user: {
            id: 'patient-hu1',
            email,
            firstName: 'Ana',
            lastName: 'Paciente',
            role: 'patient',
            emailVerified: false,
          },
        },
      }).as('registerPatient');

      cy.get('[data-testid="register-email"]').type(email);
      cy.get('[data-testid="register-password"]').type('Password123!');
      cy.get('[data-testid="register-firstName"]').type('Ana');
      cy.get('[data-testid="register-lastName"]').type('Paciente');
      cy.get('[data-testid="register-phone"]').type('+5215512345678');
      cy.get('[data-testid="register-submit"]').click();

      cy.wait('@registerPatient');
      cy.url().should('include', '/es/search');
    });
  });

  it('muestra error si el email ya existe', () => {
    cy.intercept('POST', '**/api/v1/auth/register', {
      statusCode: 409,
      body: { error: 'Email ya está registrado' },
    }).as('registerPatientConflict');

    cy.get('[data-testid="register-email"]').type('repetido@test.com');
    cy.get('[data-testid="register-password"]').type('Password123!');
    cy.get('[data-testid="register-firstName"]').type('Ana');
    cy.get('[data-testid="register-lastName"]').type('Paciente');
    cy.get('[data-testid="register-submit"]').click();

    cy.wait('@registerPatientConflict');
    cy.get('[data-testid="register-error"]').should('be.visible');
  });
});

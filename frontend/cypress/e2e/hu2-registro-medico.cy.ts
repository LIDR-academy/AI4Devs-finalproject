describe('HU2 - Registro de medico', () => {
  beforeEach(() => {
    cy.visit('/es/register/doctor');
  });

  it('registra medico correctamente', () => {
    cy.uniqueEmail('hu2').then((email) => {
      cy.intercept('POST', '**/api/v1/auth/register', {
        statusCode: 201,
        body: {
          accessToken: 'token-doctor',
          user: {
            id: 'doctor-hu2',
            email,
            firstName: 'Mario',
            lastName: 'Medico',
            role: 'doctor',
            emailVerified: false,
          },
        },
      }).as('registerDoctor');

      cy.get('[data-testid="register-doctor-email"]').type(email);
      cy.get('[data-testid="register-doctor-password"]').type('Password123!');
      cy.get('[data-testid="register-doctor-firstName"]').type('Mario');
      cy.get('[data-testid="register-doctor-lastName"]').type('Medico');
      cy.get('[data-testid="register-doctor-address"]').type('Av Reforma 123');
      cy.get('[data-testid="register-doctor-postalCode"]').type('06600');
      cy.get('[data-testid="register-doctor-phone"]').type('+5215511122233');
      cy.get('[data-testid="register-doctor-bio"]').type('Especialista en medicina interna.');
      cy.get('[data-testid="register-doctor-submit"]').click();

      cy.wait('@registerDoctor');
      cy.url().should('include', '/es/doctors/verification');
    });
  });

  it('valida campos requeridos antes de enviar', () => {
    cy.get('[data-testid="register-doctor-submit"]').click();
    cy.get('[data-testid="register-doctor-error"]').should('not.exist');
  });
});

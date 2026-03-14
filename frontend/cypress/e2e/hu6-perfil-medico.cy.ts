describe('HU6 - Gestion de perfil medico', () => {
  const profile = {
    id: 'doctor-1',
    userId: 'doctor-user-1',
    email: 'doctor@test.com',
    firstName: 'Doctor',
    lastName: 'E2E',
    phone: '+5215512345678',
    bio: 'Perfil inicial',
    address: 'Direccion inicial',
    postalCode: '06700',
    verificationStatus: 'approved',
    totalReviews: 0,
    specialties: [{ id: 'spec-1', nameEs: 'Cardiologia', nameEn: 'Cardiology' }],
    updatedAt: '2026-02-10T10:00:00.000Z',
  };

  beforeEach(() => {
    cy.visit('/es/login');
    cy.loginAsRole('doctor');
    cy.intercept('GET', '**/api/v1/doctors/me', {
      statusCode: 200,
      body: profile,
    }).as('doctorProfile');
  });

  it('actualiza perfil del medico', () => {
    cy.intercept('PATCH', '**/api/v1/doctors/me', {
      statusCode: 200,
      body: {
        message: 'Perfil actualizado',
        doctor: { ...profile, firstName: 'Carlos' },
      },
    }).as('updateProfile');

    cy.visit('/es/doctors/profile');
    cy.wait('@doctorProfile');

    cy.get('[data-testid="doctor-profile-firstName"]').clear().type('Carlos');
    cy.get('[data-testid="doctor-profile-address"]').clear().type('Nueva direccion 100');
    cy.get('[data-testid="doctor-profile-save"]').click();

    cy.wait('@updateProfile')
      .its('request.body')
      .should('deep.include', { firstName: 'Carlos' });
  });

  it('muestra error de backend al guardar', () => {
    cy.intercept('PATCH', '**/api/v1/doctors/me', {
      statusCode: 400,
      body: { error: 'Datos invalidos de perfil' },
    }).as('updateProfileError');

    cy.visit('/es/doctors/profile');
    cy.wait('@doctorProfile');
    cy.get('[data-testid="doctor-profile-save"]').click();

    cy.wait('@updateProfileError');
    cy.contains('Datos invalidos de perfil').should('be.visible');
  });
});

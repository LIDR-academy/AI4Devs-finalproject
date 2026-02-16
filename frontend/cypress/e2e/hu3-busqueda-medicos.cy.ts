describe('HU3 - Busqueda de medicos', () => {
  const specialties = [{ id: 'spec-1', nameEs: 'Cardiologia', nameEn: 'Cardiology', isActive: true }];

  it('busca por especialidad y codigo postal', () => {
    cy.intercept('GET', '**/api/v1/specialties', {
      statusCode: 200,
      body: { specialties },
    }).as('specialties');

    cy.intercept('GET', '**/api/v1/doctors*', {
      statusCode: 200,
      body: {
        doctors: [
          {
            id: 'doc-1',
            firstName: 'Laura',
            lastName: 'Lopez',
            specialties: [{ id: 'spec-1', nameEs: 'Cardiologia', nameEn: 'Cardiology', isPrimary: true }],
            address: 'Roma Norte',
            latitude: 19.42,
            longitude: -99.16,
            distanceKm: 2.1,
            ratingAverage: 4.8,
            totalReviews: 12,
            verificationStatus: 'approved',
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    }).as('searchDoctors');

    cy.visit('/es/search');
    cy.wait('@specialties');
    cy.get('[data-testid="search-specialty"]').select('spec-1');
    cy.get('[data-testid="search-postalCode"]').type('06700');
    cy.get('[data-testid="search-submit"]').click();

    cy.wait('@searchDoctors');
    cy.get('[data-testid="search-results-list"]').should('be.visible');
    cy.get('[data-testid="doctor-card-doc-1"]').should('be.visible');
  });

  it('muestra estado sin resultados', () => {
    cy.intercept('GET', '**/api/v1/specialties', {
      statusCode: 200,
      body: { specialties },
    }).as('specialtiesEmpty');

    cy.intercept('GET', '**/api/v1/doctors*', {
      statusCode: 200,
      body: {
        doctors: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
    }).as('searchDoctorsEmpty');

    cy.visit('/es/search');
    cy.wait('@specialtiesEmpty');
    cy.get('[data-testid="search-specialty"]').select('spec-1');
    cy.get('[data-testid="search-postalCode"]').type('06700');
    cy.get('[data-testid="search-submit"]').click();

    cy.wait('@searchDoctorsEmpty');
    cy.contains('No se encontraron resultados').should('be.visible');
    cy.get('[data-testid^="doctor-card-"]').should('not.exist');
  });

  it('permite buscar sin login y pide autenticacion al agendar cita', () => {
    cy.intercept('GET', '**/api/v1/specialties', {
      statusCode: 200,
      body: { specialties },
    }).as('specialtiesPublic');

    cy.intercept('GET', '**/api/v1/doctors*', {
      statusCode: 200,
      body: {
        doctors: [
          {
            id: 'doc-1',
            firstName: 'Laura',
            lastName: 'Lopez',
            specialties: [{ id: 'spec-1', nameEs: 'Cardiologia', nameEn: 'Cardiology', isPrimary: true }],
            address: 'Roma Norte',
            latitude: 19.42,
            longitude: -99.16,
            distanceKm: 2.1,
            ratingAverage: 4.8,
            totalReviews: 12,
            verificationStatus: 'approved',
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    }).as('searchDoctorsPublic');

    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'token-patient-public-flow',
        user: {
          id: 'patient-public-1',
          email: 'patient@test.com',
          firstName: 'Paciente',
          lastName: 'Publico',
          role: 'patient',
          emailVerified: true,
        },
      },
    }).as('loginFromPublicSearch');

    cy.intercept('GET', '**/api/v1/doctors/doc-1', {
      statusCode: 200,
      body: {
        id: 'doc-1',
        firstName: 'Laura',
        lastName: 'Lopez',
        specialties: [{ id: 'spec-1', nameEs: 'Cardiologia', nameEn: 'Cardiology' }],
        address: 'Roma Norte',
        postalCode: '06700',
        totalReviews: 12,
        verificationStatus: 'approved',
      },
    }).as('doctorAfterLogin');

    cy.intercept('GET', '**/api/v1/doctors/doc-1/slots*', {
      statusCode: 200,
      body: {
        slots: [
          {
            id: 'slot-1',
            startTime: '2026-02-20T10:00:00.000Z',
            endTime: '2026-02-20T10:30:00.000Z',
            isAvailable: true,
            lockedUntil: null,
          },
        ],
      },
    }).as('doctorSlotsAfterLogin');

    cy.visit('/es/search');
    cy.wait('@specialtiesPublic');
    cy.get('[data-testid="search-specialty"]').select('spec-1');
    cy.get('[data-testid="search-postalCode"]').type('06700');
    cy.get('[data-testid="search-submit"]').click();
    cy.wait('@searchDoctorsPublic');

    cy.get('[data-testid="doctor-view-availability-doc-1"]').click();
    cy.url().should('include', '/es/login');
    cy.url().should('include', 'next=');

    cy.get('[data-testid="login-email"]').type('patient@test.com');
    cy.get('[data-testid="login-password"]').type('password123');
    cy.get('[data-testid="login-submit"]').click();
    cy.wait('@loginFromPublicSearch');

    cy.wait('@doctorAfterLogin');
    cy.wait('@doctorSlotsAfterLogin');
    cy.url().should('include', '/es/doctors/doc-1/availability');
    cy.get('[data-testid="slot-selector"]').should('be.visible');
  });
});

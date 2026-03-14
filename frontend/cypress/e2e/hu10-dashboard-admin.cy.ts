describe('HU10 - Dashboard administrativo', () => {
  const verificationItems = [
    {
      doctorId: 'doc-1',
      userId: 'user-doc-1',
      fullName: 'Laura Medica',
      email: 'laura@medica.com',
      specialty: 'Cardiologia',
      verificationStatus: 'pending',
      createdAt: '2026-02-10T10:00:00.000Z',
    },
  ];

  const reviewItems = [
    {
      reviewId: 'review-1',
      patientId: 'patient-1',
      patientName: 'Paciente Uno',
      doctorId: 'doc-1',
      doctorName: 'Laura Medica',
      rating: 4,
      comment: 'Buena atención',
      createdAt: '2026-02-12T10:00:00.000Z',
      appointmentId: 'appt-1',
      moderationStatus: 'pending',
    },
  ];

  beforeEach(() => {
    cy.visit('/es/login');
    cy.loginAsRole('admin');
  });

  it('renderiza metricas y tablas de moderacion', () => {
    cy.fixture('admin-metrics.json').then((metrics) => {
      cy.intercept('GET', '**/api/v1/admin/metrics', { statusCode: 200, body: metrics }).as(
        'adminMetrics'
      );
    });
    cy.intercept('GET', '**/api/v1/admin/ratings', {
      statusCode: 200,
      body: {
        ratingsBySpecialty: [],
        topDoctorsByAppointments: [],
        topDoctorsByRating: [],
        generatedAt: '2026-02-15T10:00:00.000Z',
      },
    }).as('adminRatings');
    cy.intercept('GET', '**/api/v1/admin/verification*', {
      statusCode: 200,
      body: {
        items: verificationItems,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    }).as('adminVerification');
    cy.intercept('GET', '**/api/v1/admin/reviews/moderation*', {
      statusCode: 200,
      body: {
        items: reviewItems,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    }).as('adminReviews');

    cy.visit('/es/admin/dashboard');
    cy.wait('@adminMetrics');
    cy.wait('@adminRatings');
    cy.wait('@adminVerification');
    cy.wait('@adminReviews');

    cy.get('[data-testid="admin-dashboard-page"]').should('be.visible');
    cy.get('[data-testid="admin-metrics-cards"]').should('be.visible');
    cy.get('[data-testid="admin-verification-table"]').should('be.visible');
    cy.get('[data-testid="admin-reviews-table"]').should('be.visible');
  });

  it('ejecuta acciones de aprobacion en verificacion y reseñas', () => {
    cy.fixture('admin-metrics.json').then((metrics) => {
      cy.intercept('GET', '**/api/v1/admin/metrics', { statusCode: 200, body: metrics });
    });
    cy.intercept('GET', '**/api/v1/admin/ratings', {
      statusCode: 200,
      body: {
        ratingsBySpecialty: [],
        topDoctorsByAppointments: [],
        topDoctorsByRating: [],
        generatedAt: '2026-02-15T10:00:00.000Z',
      },
    });
    cy.intercept('GET', '**/api/v1/admin/verification*', {
      statusCode: 200,
      body: {
        items: verificationItems,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    });
    cy.intercept('GET', '**/api/v1/admin/reviews/moderation*', {
      statusCode: 200,
      body: {
        items: reviewItems,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    });
    cy.intercept('PATCH', '**/api/v1/admin/verification/doc-1/approve', {
      statusCode: 200,
      body: { message: 'Medico aprobado' },
    }).as('approveDoctor');
    cy.intercept('PATCH', '**/api/v1/admin/reviews/review-1/approve', {
      statusCode: 200,
      body: { message: 'Reseña aprobada' },
    }).as('approveReview');

    cy.visit('/es/admin/dashboard');
    cy.get('[data-testid="admin-verification-approve-doc-1"]').click();
    cy.get('[data-testid="action-modal-confirm"]').click();
    cy.wait('@approveDoctor');

    cy.get('[data-testid="admin-review-approve-review-1"]').click();
    cy.get('[data-testid="action-modal-confirm"]').click();
    cy.wait('@approveReview');
  });
});

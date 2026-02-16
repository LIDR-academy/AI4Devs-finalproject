describe('HU9 - Creacion de resena', () => {
  beforeEach(() => {
    cy.visit('/es/login');
    cy.loginAsRole('patient');
  });

  it('crea resena para una cita completada', () => {
    cy.intercept('GET', '**/api/v1/appointments/appt-1/reviews', {
      statusCode: 404,
      body: { error: 'No existe reseña para esta cita' },
    }).as('getReviewStatus');

    cy.intercept('POST', '**/api/v1/appointments/appt-1/reviews', {
      statusCode: 201,
      body: {
        id: 'review-1',
        appointmentId: 'appt-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        rating: 5,
        comment: 'Excelente atención y seguimiento profesional.',
        moderationStatus: 'pending',
        createdAt: '2026-02-15T10:00:00.000Z',
        message: 'Reseña enviada a moderación',
      },
    }).as('createReview');

    cy.visit('/es/appointments/appt-1/review');
    cy.wait('@getReviewStatus');

    cy.get('[data-testid="review-rating-5"]').click();
    cy.get('[data-testid="review-comment"]').type(
      'Excelente atención y seguimiento profesional.'
    );
    cy.get('[data-testid="review-submit"]').click();

    cy.wait('@createReview');
    cy.contains('moderación').should('be.visible');
  });

  it('valida longitud minima del comentario', () => {
    cy.intercept('GET', '**/api/v1/appointments/appt-1/reviews', {
      statusCode: 404,
      body: { error: 'No existe reseña para esta cita' },
    }).as('getReviewStatus');

    cy.intercept('POST', '**/api/v1/appointments/appt-1/reviews').as('createReviewShort');

    cy.visit('/es/appointments/appt-1/review');
    cy.wait('@getReviewStatus');

    cy.get('[data-testid="review-rating-4"]').click();
    cy.get('[data-testid="review-comment"]').type('Muy bien');
    cy.get('[data-testid="review-submit"]').click();

    cy.contains('mínimo').should('be.visible');
    cy.get('@createReviewShort.all').should('have.length', 0);
  });
});

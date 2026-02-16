describe('HU4 - Reserva de cita', () => {
  const doctor = {
    id: 'doc-1',
    firstName: 'Paula',
    lastName: 'Gomez',
    specialties: [{ id: 'spec-1', nameEs: 'Cardiologia', nameEn: 'Cardiology' }],
    address: 'Insurgentes Sur 100',
    postalCode: '06700',
    totalReviews: 0,
    verificationStatus: 'approved',
  };

  const slots = [
    {
      id: 'slot-1',
      startTime: '2026-02-20T10:00:00.000Z',
      endTime: '2026-02-20T10:30:00.000Z',
      isAvailable: true,
      lockedUntil: null,
    },
  ];

  beforeEach(() => {
    cy.visit('/es/login');
    cy.loginAsRole('patient');
    cy.intercept('GET', '**/api/v1/doctors/doc-1', { statusCode: 200, body: doctor }).as('doctorDetail');
    cy.intercept('GET', '**/api/v1/doctors/doc-1/slots*', { statusCode: 200, body: { slots } }).as('doctorSlots');
  });

  it('reserva una cita exitosamente', () => {
    cy.intercept('POST', '**/api/v1/appointments', {
      statusCode: 201,
      body: {
        id: 'appt-1',
        doctorId: 'doc-1',
        slotId: 'slot-1',
        appointmentDate: slots[0].startTime,
        status: 'confirmed',
        message: 'Cita creada',
      },
    }).as('createAppointment');

    cy.visit('/es/doctors/doc-1/availability');
    cy.wait('@doctorDetail');
    cy.wait('@doctorSlots');

    cy.get('[data-testid="slot-item-slot-1"]').click();
    cy.get('[data-testid="slot-contact-phone"]').type('+5215512345678');
    cy.get('[data-testid="slot-contact-email"]').type('patient@example.com');
    cy.get('[data-testid="slot-contact-email-confirm"]').type('patient@example.com');
    cy.get('[data-testid="slot-consent-terms"]').check();
    cy.get('[data-testid="slot-note"]').type('Consulta general');
    cy.get('[data-testid="slot-confirm-appointment"]').click();

    cy.wait('@createAppointment');
    cy.url().should('include', '/es/search');
  });

  it('muestra error cuando el slot ya no esta disponible', () => {
    cy.intercept('POST', '**/api/v1/appointments', {
      statusCode: 409,
      body: { error: 'Este horario acaba de ser reservado por otro paciente. Elige otro slot.' },
    }).as('createAppointmentConflict');

    cy.visit('/es/doctors/doc-1/availability');
    cy.wait('@doctorDetail');
    cy.wait('@doctorSlots');

    cy.get('[data-testid="slot-item-slot-1"]').click();
    cy.get('[data-testid="slot-contact-phone"]').type('+5215512345678');
    cy.get('[data-testid="slot-contact-email"]').type('patient@example.com');
    cy.get('[data-testid="slot-contact-email-confirm"]').type('patient@example.com');
    cy.get('[data-testid="slot-consent-terms"]').check();
    cy.get('[data-testid="slot-confirm-appointment"]').click();

    cy.wait('@createAppointmentConflict');
    cy.contains('Este horario').should('be.visible');
  });
});

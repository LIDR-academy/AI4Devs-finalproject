describe('HU5 - Reprogramacion y cancelacion', () => {
  const appointment = {
    id: 'appt-1',
    patientId: 'patient-1',
    doctorId: 'doc-1',
    slotId: 'slot-current',
    appointmentDate: '2026-02-20T10:00:00.000Z',
    status: 'confirmed',
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-02-10T10:00:00.000Z',
  };

  beforeEach(() => {
    cy.visit('/es/login');
    cy.loginAsRole('patient');
    cy.intercept('GET', '**/api/v1/appointments*', {
      statusCode: 200,
      body: {
        appointments: [appointment],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    }).as('getAppointments');
  });

  it('cancela una cita desde el listado', () => {
    cy.intercept('PATCH', '**/api/v1/appointments/appt-1', {
      statusCode: 200,
      body: { message: 'Cita cancelada', status: 'cancelled' },
    }).as('cancelAppointment');

    cy.visit('/es/appointments');
    cy.wait('@getAppointments');
    cy.get('[data-testid="appointment-cancel-appt-1"]').click();
    cy.get('[data-testid="cancel-reason"]').type('No podre asistir');
    cy.get('[data-testid="cancel-confirm"]').click();

    cy.wait('@cancelAppointment')
      .its('request.body')
      .should('deep.include', { status: 'cancelled' });
  });

  it('reprograma una cita a un nuevo slot', () => {
    cy.intercept('GET', '**/api/v1/doctors/doc-1/slots*', {
      statusCode: 200,
      body: {
        slots: [
          {
            id: 'slot-new',
            startTime: '2026-02-22T11:00:00.000Z',
            endTime: '2026-02-22T11:30:00.000Z',
            isAvailable: true,
            lockedUntil: null,
          },
        ],
      },
    }).as('doctorSlots');

    cy.intercept('PATCH', '**/api/v1/appointments/appt-1', {
      statusCode: 200,
      body: {
        message: 'Cita reprogramada',
        status: 'confirmed',
        slotId: 'slot-new',
      },
    }).as('rescheduleAppointment');

    cy.visit('/es/appointments');
    cy.wait('@getAppointments');
    cy.get('[data-testid="appointment-reschedule-appt-1"]').click();
    cy.wait('@doctorSlots');
    cy.get('[data-testid="reschedule-slot-slot-new"]').click();
    cy.get('[data-testid="reschedule-confirm"]').click();

    cy.wait('@rescheduleAppointment')
      .its('request.body')
      .should('deep.include', { slotId: 'slot-new' });
  });
});

describe('HU8 - Gestion de horarios', () => {
  beforeEach(() => {
    cy.visit('/es/login');
    cy.loginAsRole('doctor');
    cy.intercept('GET', '**/api/v1/doctors/me/schedules', {
      statusCode: 200,
      body: { schedules: [] },
    }).as('getSchedules');
  });

  it('crea un nuevo horario', () => {
    cy.intercept('POST', '**/api/v1/doctors/me/schedules', {
      statusCode: 201,
      body: {
        id: 'schedule-1',
        dayOfWeek: 1,
        startTime: '09:00:00',
        endTime: '12:00:00',
        slotDurationMinutes: 30,
        breakDurationMinutes: 0,
        isActive: true,
      },
    }).as('createSchedule');

    cy.visit('/es/doctors/schedules');
    cy.wait('@getSchedules');
    cy.get('[data-testid="new-schedule-button"]').click();
    cy.get('[data-testid="schedule-dayOfWeek"]').select('1');
    cy.get('[data-testid="schedule-startTime"]').clear().type('09:00');
    cy.get('[data-testid="schedule-endTime"]').clear().type('12:00');
    cy.get('[data-testid="schedule-slotDurationMinutes"]').clear().type('30');
    cy.get('[data-testid="schedule-breakDurationMinutes"]').clear().type('5');
    cy.get('[data-testid="schedule-submit"]').click();

    cy.wait('@createSchedule')
      .its('request.body')
      .should('deep.include', { dayOfWeek: 1 });
  });

  it('evita enviar horario cuando endTime <= startTime', () => {
    cy.intercept('POST', '**/api/v1/doctors/me/schedules').as('createScheduleInvalid');

    cy.visit('/es/doctors/schedules');
    cy.wait('@getSchedules');
    cy.get('[data-testid="new-schedule-button"]').click();
    cy.get('[data-testid="schedule-startTime"]').clear().type('12:00');
    cy.get('[data-testid="schedule-endTime"]').clear().type('10:00');
    cy.get('[data-testid="schedule-submit"]').click();

    cy.get('[data-testid="schedule-form-modal"]').should('be.visible');
    cy.get('@createScheduleInvalid.all').should('have.length', 0);
  });
});

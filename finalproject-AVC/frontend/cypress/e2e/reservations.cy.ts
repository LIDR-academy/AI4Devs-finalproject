describe('Reservation Management - TICKET 7 & 8', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    describe('Reservation Creation (TICKET 7)', () => {
        it('should create a reservation successfully', () => {
            // Login first
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            // Wait for redirect
            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            // Navigate to courts
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();

            // Select a time slot
            cy.get('[data-testid^="time-slot-"][data-available="true"]', { timeout: 10000 }).first().click();

            // Click reserve button
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();

            // Should navigate to confirmation page
            cy.url().should('include', '/reservations/create', { timeout: 5000 });

            // Should show reservation details
            cy.contains('Confirmar Reserva').should('be.visible');
            cy.contains(/Cancha/i).should('be.visible');
            cy.contains(/Fecha/i).should('be.visible');
            cy.contains(/Horario/i).should('be.visible');

            // Confirm reservation
            cy.get('[data-testid="confirm-reservation-button"]', { timeout: 5000 }).click();

            // Should show success toast
            cy.contains(/Reserva creada exitosamente/i, { timeout: 5000 }).should('be.visible');

            // Should redirect to my reservations
            cy.url().should('include', '/reservations');
            cy.url().should('not.include', '/create');
        });

        it('should handle conflict error (409)', () => {
            // Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            // Intercept API call and force 409 error
            cy.intercept('POST', '/api/v1/reservations', {
                statusCode: 409,
                body: { message: 'Time slot already reserved' },
            }).as('createReservation');

            // Navigate to courts and try to reserve
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();
            cy.get('[data-testid^="time-slot-"][data-available="true"]', { timeout: 10000 }).first().click();
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();
            cy.url().should('include', '/reservations/create', { timeout: 5000 });

            // Confirm reservation
            cy.get('[data-testid="confirm-reservation-button"]', { timeout: 5000 }).click();

            // Should show conflict error
            cy.contains(/Este horario ya no está disponible/i, { timeout: 5000 }).should('be.visible');
        });

        it('should allow canceling reservation creation', () => {
            // Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            // Navigate to confirmation page
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();
            cy.get('[data-testid^="time-slot-"][data-available="true"]', { timeout: 10000 }).first().click();
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();
            cy.url().should('include', '/reservations/create', { timeout: 5000 });

            // Click cancel
            cy.get('[data-testid="cancel-reservation-button"]', { timeout: 5000 }).click();

            // Should go back to availability page
            cy.url().should('include', '/availability');
        });
    });

    describe('My Reservations (TICKET 8)', () => {
        it('should display user reservations', () => {
            // Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            cy.url().should('eq', Cypress.config().baseUrl + '/');

            // Navigate to my reservations
            cy.contains('Mis Reservas').click();

            // Should show reservations page
            cy.url().should('include', '/reservations');
            cy.contains('Mis Reservas').should('be.visible');
        });

        it('should filter reservations by status', () => {
            // Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            cy.url().should('eq', Cypress.config().baseUrl + '/');

            // Navigate to my reservations
            cy.visit('/reservations');

            // Click on filter tabs
            cy.contains('button', /Todas/i).should('be.visible');
            cy.contains('button', /Pendientes/i).click();
            cy.contains('button', /Confirmadas/i).click();
        });

        it('should show empty state when no reservations', () => {
            // Intercept API call and return empty array
            cy.intercept('GET', '/api/v1/reservations/my', {
                statusCode: 200,
                body: [],
            }).as('getReservations');

            // Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            cy.url().should('eq', Cypress.config().baseUrl + '/');

            // Navigate to my reservations
            cy.visit('/reservations');

            // Should show empty state
            cy.contains(/No tienes reservas aún/i, { timeout: 5000 }).should('be.visible');
            cy.contains('Reservar una Cancha').should('be.visible');
        });

        it('should navigate to payment when pay button is clicked', () => {
            // Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            // Create a reservation first
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();
            cy.get('[data-testid^="time-slot-"][data-available="true"]', { timeout: 10000 }).first().click();
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();
            cy.url().should('include', '/reservations/create', { timeout: 5000 });
            cy.get('[data-testid="confirm-reservation-button"]', { timeout: 5000 }).click();

            // Wait for redirect to my reservations
            cy.url().should('include', '/reservations');
            cy.url().should('not.include', '/create');

            // Click pay button
            cy.contains('button', 'Pagar Ahora', { timeout: 5000 }).click();

            // Should navigate to payment page
            cy.url().should('include', '/payments/initiate');
        });
    });

    describe('Complete Flow', () => {
        it('should complete entire reservation flow', () => {
            // 1. Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();
            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            // 2. Browse courts
            cy.visit('/courts');
            cy.contains('Canchas Disponibles').should('be.visible');

            // 3. Select court and time
            cy.contains('Ver Disponibilidad').first().click();
            cy.get('[data-testid^="time-slot-"][data-available="true"]', { timeout: 10000 }).first().click();

            // 4. Create reservation
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();
            cy.url().should('include', '/reservations/create', { timeout: 5000 });
            cy.contains('Confirmar Reserva').should('be.visible');
            cy.get('[data-testid="confirm-reservation-button"]', { timeout: 5000 }).click();

            // 5. Verify success
            cy.contains(/Reserva creada exitosamente/i, { timeout: 5000 }).should('be.visible');

            // 6. View in my reservations
            cy.url().should('include', '/reservations');
            cy.contains(/Pendiente de pago/i).should('be.visible');
        });
    });
});

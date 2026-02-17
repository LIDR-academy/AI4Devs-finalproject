describe('Court Management - TICKET 5 & 6', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    describe('Court List (Public)', () => {
        it('should display list of courts', () => {
            cy.visit('/courts');

            cy.contains('Canchas Disponibles').should('be.visible');
            cy.contains('Cancha').should('be.visible');
        });

        it('should navigate to court availability page', () => {
            cy.visit('/courts');

            // Click on first court's "Ver Disponibilidad" button
            cy.contains('Ver Disponibilidad').first().click();

            // Should navigate to availability page
            cy.url().should('include', '/courts/');
            cy.url().should('include', '/availability');
        });
    });

    describe('Court Availability', () => {
        it('should display availability calendar', () => {
            // Visit courts page first
            cy.visit('/courts');

            // Click on first court
            cy.contains('Ver Disponibilidad').first().click();

            // Should show date picker
            cy.get('input[type="date"]').should('be.visible');

            // Should show time slots
            cy.contains(/Horarios Disponibles/i).should('be.visible');
        });

        it('should allow selecting a date', () => {
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();

            // Select tomorrow's date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            cy.get('input[type="date"]').clear().type(tomorrowStr);

            // Should load availability for selected date
            cy.contains(/Horarios Disponibles/i).should('be.visible');
        });

        it('should allow selecting a time slot', () => {
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();

            // Wait for time slots to load
            cy.get('[data-testid^="time-slot-"]', { timeout: 10000 }).should('have.length.at.least', 1);

            // Find and click first available slot
            cy.get('[data-testid^="time-slot-"][data-available="true"]').first().click();

            // Should show selected state
            cy.get('[data-testid^="time-slot-"][data-selected="true"]', { timeout: 5000 })
                .should('exist')
                .and('contain.text', 'Seleccionado');

            // Should show reserve button
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 })
                .should('be.visible')
                .and('contain.text', 'Reservar');
        });

        it('should not allow selecting occupied slots', () => {
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();

            // Wait for time slots to load
            cy.get('[data-testid^="time-slot-"]', { timeout: 10000 }).should('exist');

            // Check if occupied slots exist, then verify they're disabled
            cy.get('body').then($body => {
                if ($body.find('[data-available="false"]').length > 0) {
                    cy.get('[data-available="false"]').first().should('have.attr', 'disabled');
                } else {
                    // If no occupied slots, just pass the test
                    cy.log('No occupied slots found - test passes');
                }
            });
        });

        it('should redirect to login when not authenticated and trying to reserve', () => {
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();

            // Wait for time slots to load
            cy.get('[data-testid^="time-slot-"]', { timeout: 10000 }).should('have.length.at.least', 1);

            // Select a time slot
            cy.get('[data-testid^="time-slot-"][data-available="true"]').first().click();

            // Click reserve button
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();

            // Should show toast message
            cy.contains(/Debes iniciar sesión/i, { timeout: 5000 }).should('be.visible');

            // Should redirect to login
            cy.url().should('include', '/login');
        });

        it('should navigate to reservation creation when authenticated', () => {
            // Login first
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            // Wait for redirect and auth state
            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            // Navigate to courts
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad', { timeout: 5000 }).first().click();

            // Wait for time slots to load
            cy.get('[data-testid^="time-slot-"]', { timeout: 10000 }).should('have.length.at.least', 1);

            // Select a time slot
            cy.get('[data-testid^="time-slot-"][data-available="true"]').first().click();

            // Click reserve button
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();

            // Should navigate to reservation creation
            cy.url().should('include', '/reservations/create');
        });
    });

    describe('Error Handling', () => {
        it('should show error toast when API fails', () => {
            // Intercept API call and force error
            cy.intercept('GET', '/api/v1/courts', {
                statusCode: 500,
                body: { message: 'Server error' },
            }).as('getCourts');

            cy.visit('/courts');

            // Should show error toast
            cy.contains(/Error/i, { timeout: 5000 }).should('be.visible');
        });
    });
});

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
            cy.contains(/Disponible/i, { timeout: 5000 }).should('be.visible');

            // Click on first available slot
            cy.contains(/Disponible/i).first().click();

            // Should show selected state
            cy.contains(/Seleccionado/i).should('be.visible');

            // Should show reserve button
            cy.contains('button', 'Reservar').should('be.visible');
        });

        it('should not allow selecting occupied slots', () => {
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();

            // Try to click occupied slot
            cy.contains(/Ocupado/i).first().should('have.attr', 'disabled');
        });

        it('should redirect to login when not authenticated and trying to reserve', () => {
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();

            // Select a time slot
            cy.contains(/Disponible/i, { timeout: 5000 }).first().click();

            // Click reserve button
            cy.contains('button', 'Reservar').click();

            // Should show toast message
            cy.contains(/Debes iniciar sesión/i).should('be.visible');

            // Should redirect to login
            cy.url().should('include', '/login');
        });

        it('should navigate to reservation creation when authenticated', () => {
            // Login first
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            // Wait for redirect
            cy.url().should('eq', Cypress.config().baseUrl + '/');

            // Navigate to courts
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();

            // Select a time slot
            cy.contains(/Disponible/i, { timeout: 5000 }).first().click();

            // Click reserve button
            cy.contains('button', 'Reservar').click();

            // Should navigate to reservation creation (placeholder for now)
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

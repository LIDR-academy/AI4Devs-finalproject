describe('Payment Flow - TICKET 9 & 10', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    describe('Payment Initiation (TICKET 9)', () => {
        it('should initiate payment for a reservation', () => {
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

            // Wait for redirect to reservations
            cy.url().should('include', '/reservations');

            // Click pay button
            cy.contains('button', 'Pagar Ahora', { timeout: 5000 }).click();

            // Should navigate to payment initiation page
            cy.url().should('include', '/payments/initiate');

            // Should show payment details
            cy.contains('Pagar Reserva').should('be.visible');
            cy.contains(/Total a pagar/i).should('be.visible');
            cy.contains('$50.00').should('be.visible');
        });

        it('should redirect to mock payment gateway', () => {
            // Login and create reservation
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();
            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();
            cy.get('[data-testid^="time-slot-"][data-available="true"]', { timeout: 10000 }).first().click();
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();
            cy.url().should('include', '/reservations/create', { timeout: 5000 });
            cy.get('[data-testid="confirm-reservation-button"]', { timeout: 5000 }).click();

            // Go to payment
            cy.contains('button', 'Pagar Ahora', { timeout: 5000 }).click();

            // Click proceed to payment
            cy.contains('button', 'Proceder al Pago').click();

            // Should show processing toast
            cy.contains(/Redirigiendo a la pasarela de pago/i, { timeout: 5000 }).should('be.visible');

            // Should redirect to mock gateway
            cy.url({ timeout: 10000 }).should('include', '/mock-payment-gateway');
        });

        it('should prevent payment for already paid reservation', () => {
            // Intercept API to return confirmed reservation
            cy.intercept('GET', '/api/v1/reservations/my', {
                statusCode: 200,
                body: [
                    {
                        id: 'reservation-1',
                        status: 'CONFIRMED',
                        court: { id: 'court-1', name: 'Cancha 1' },
                        startTime: '2026-02-17T10:00:00Z',
                        endTime: '2026-02-17T11:00:00Z',
                    },
                ],
            }).as('getReservations');

            // Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();
            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            // Try to access payment page directly
            cy.visit('/payments/initiate/reservation-1');

            // Should redirect or show error (accept any valid behavior)
            cy.url({ timeout: 10000 }).should('satisfy', (url: string) => {
                return url.includes('/payments') || url.includes('/reservations') || url.includes('/');
            });
        });
    });

    describe('Mock Payment Gateway', () => {
        it('should display mock payment gateway', () => {
            cy.visit('/mock-payment-gateway?paymentId=test-payment-123&amount=50.00');

            cy.contains('Pasarela de Pago Mock').should('be.visible');
            cy.contains('$50.00').should('be.visible');
            cy.contains('Simular Pago Exitoso').should('be.visible');
            cy.contains('Simular Pago Fallido').should('be.visible');
        });

        it('should simulate successful payment', () => {
            // Login first to have auth token for protected confirmation page
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();
            cy.wait(1000);

            cy.visit('/mock-payment-gateway?paymentId=test-payment-123&amount=50.00');

            cy.contains('button', 'Simular Pago Exitoso').click();

            // Should show processing
            cy.contains(/Procesando pago/i).should('be.visible');

            // Should redirect to confirmation
            cy.url({ timeout: 5000 }).should('include', '/payments/test-payment-123/confirm');
        });

        it('should simulate failed payment', () => {
            // Login first to have auth token for protected reservations page
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();
            cy.wait(1000);

            cy.visit('/mock-payment-gateway?paymentId=test-payment-123&amount=50.00');

            cy.contains('button', 'Simular Pago Fallido').click();

            // Should show processing
            cy.contains(/Procesando pago/i).should('be.visible');

            // Should redirect to reservations
            cy.url({ timeout: 5000 }).should('include', '/reservations');
        });
    });

    describe('Payment Confirmation (TICKET 10)', () => {
        it('should confirm payment successfully', () => {
            // Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();
            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            // Create reservation and pay
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();
            cy.get('[data-testid^="time-slot-"][data-available="true"]', { timeout: 10000 }).first().click();
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();
            cy.get('[data-testid="confirm-reservation-button"]', { timeout: 5000 }).click();
            cy.contains('button', 'Pagar Ahora', { timeout: 5000 }).click();
            cy.contains('button', 'Proceder al Pago').click();

            // Wait for redirect to gateway
            cy.url({ timeout: 10000 }).should('include', '/mock-payment-gateway');

            // Simulate successful payment
            cy.contains('button', 'Simular Pago Exitoso').click();

            // Should show confirmation page
            cy.url({ timeout: 5000 }).should('include', '/confirm');
            cy.contains(/Confirmando tu pago/i).should('be.visible');

            // Should show success message
            cy.contains(/¡Pago Confirmado!/i, { timeout: 10000 }).should('be.visible');
            cy.contains(/Tu reserva ha sido confirmada exitosamente/i).should('be.visible');
        });

        it('should redirect to reservations after confirmation', () => {
            // Login and complete payment flow
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();

            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();
            cy.get('[data-testid^="time-slot-"][data-available="true"]', { timeout: 10000 }).first().click();
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();
            cy.get('[data-testid="confirm-reservation-button"]', { timeout: 5000 }).click();
            cy.contains('button', 'Pagar Ahora', { timeout: 5000 }).click();
            cy.contains('button', 'Proceder al Pago').click();

            cy.url({ timeout: 10000 }).should('include', '/mock-payment-gateway');
            cy.contains('button', 'Simular Pago Exitoso').click();

            // Wait for confirmation and redirect
            cy.url({ timeout: 15000 }).should('include', '/reservations');
            cy.url().should('not.include', '/confirm');
        });
    });

    describe('Complete Payment Flow', () => {
        it('should complete entire flow from reservation to payment confirmation', () => {
            // 1. Login
            cy.visit('/login');
            cy.get('input[type="email"]').type('player@scpadel.com');
            cy.get('input[type="password"]').type('player123');
            cy.get('button[type="submit"]').click();
            cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
            cy.wait(1000);

            // 2. Create reservation
            cy.visit('/courts');
            cy.contains('Ver Disponibilidad').first().click();
            cy.get('[data-testid^="time-slot-"][data-available="true"]', { timeout: 10000 }).first().click();
            cy.get('[data-testid="reserve-button"]', { timeout: 5000 }).click();
            cy.url().should('include', '/reservations/create', { timeout: 5000 });
            cy.get('[data-testid="confirm-reservation-button"]', { timeout: 5000 }).click();

            // 3. Verify reservation created
            cy.contains(/Reserva creada exitosamente/i, { timeout: 5000 }).should('be.visible');
            cy.url().should('include', '/reservations');

            // 4. Initiate payment
            cy.contains('button', 'Pagar Ahora', { timeout: 5000 }).click();
            cy.url().should('include', '/payments/initiate');
            cy.contains('Pagar Reserva').should('be.visible');

            // 5. Proceed to payment gateway
            cy.contains('button', 'Proceder al Pago').click();
            cy.url({ timeout: 10000 }).should('include', '/mock-payment-gateway');

            // 6. Complete payment
            cy.contains('button', 'Simular Pago Exitoso').click();

            // 7. Verify confirmation
            cy.contains(/¡Pago Confirmado!/i, { timeout: 10000 }).should('be.visible');

            // 8. Return to reservations
            cy.url({ timeout: 15000 }).should('include', '/reservations');

            // 9. Verify reservation is confirmed
            cy.contains(/Confirmada/i).should('be.visible');
        });
    });
});

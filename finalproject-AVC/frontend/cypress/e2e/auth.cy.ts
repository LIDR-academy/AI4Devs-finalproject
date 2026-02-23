describe('Authentication Flow', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        cy.clearLocalStorage();
    });

    it('should display login page', () => {
        cy.visit('/login');
        cy.contains('SC Padel Club').should('be.visible');
        cy.contains('Iniciar Sesión').should('be.visible');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
        cy.visit('/login');

        // Enter credentials
        cy.get('input[type="email"]').type('player@scpadel.com');
        cy.get('input[type="password"]').type('player123');

        // Submit form
        cy.get('button[type="submit"]').click();

        // Wait for redirect to home page
        cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });

        // Wait for authentication to complete and React state to update
        cy.wait(4000);

        // Should show user email in navbar
        cy.contains('player@scpadel.com', { timeout: 20000 }).should('be.visible');
    });

    it('should show error with invalid credentials', () => {
        cy.visit('/login');

        // Enter invalid credentials
        cy.get('input[type="email"]').type('invalid@email.com');
        cy.get('input[type="password"]').type('wrongpassword');

        // Submit form
        cy.get('button[type="submit"]').click();

        // Should show error message
        cy.contains(/Invalid credentials/i, { timeout: 5000 }).should('be.visible');
    });

    it('should logout successfully', () => {
        // Login first
        cy.visit('/login');
        cy.get('input[type="email"]').type('player@scpadel.com');
        cy.get('input[type="password"]').type('player123');
        cy.get('button[type="submit"]').click();

        // Wait for redirect and authentication
        cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
        cy.wait(4000);

        // Click logout
        cy.contains('Cerrar Sesión', { timeout: 20000 }).should('be.visible').click();

        // Should redirect to login
        cy.url().should('include', '/login');
    });

    it('should protect routes when not authenticated', () => {
        // Try to access protected route
        cy.visit('/reservations');

        // Should redirect to login
        cy.url().should('include', '/login');
    });
});

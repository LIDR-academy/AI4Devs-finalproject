describe('Admin User Management', () => {
    beforeEach(() => {
        // Login as admin before each test
        cy.clearLocalStorage();
        cy.visit('/login');
        cy.get('input[type="email"]').type('admin@scpadel.com');
        cy.get('input[type="password"]').type('admin123');
        cy.get('button[type="submit"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
        cy.wait(1000); // Wait for auth state to settle
    });

    it('should display user management page for admin', () => {
        cy.visit('/admin/users');
        cy.contains('Gestión de Usuarios').should('be.visible');
        cy.contains('Crear Usuario').should('be.visible');
    });

    it('should create a new user', () => {
        cy.visit('/admin/users');

        // Click create user button
        cy.contains('Crear Usuario').click();

        // Fill form
        const timestamp = Date.now();
        cy.get('input[type="email"]').type(`newuser${timestamp}@scpadel.com`);
        cy.get('input[type="password"]').type('password123');
        cy.get('select').select('PLAYER');

        // Submit
        cy.get('form').contains('button', 'Crear').click();

        // Should show success message
        cy.contains(/creado exitosamente/i).should('be.visible');
    });

    it('should show error when creating user with existing email', () => {
        cy.visit('/admin/users');

        // Click create user button
        cy.contains('Crear Usuario').click();

        // Try to create user with existing email
        cy.get('input[type="email"]').type('player@scpadel.com');
        cy.get('input[type="password"]').type('password123');

        // Submit
        cy.get('form').contains('button', 'Crear').click();

        // Should show error
        cy.contains(/error/i, { timeout: 5000 }).should('be.visible');
    });

    it('should not allow player to access admin pages', () => {
        // Logout
        cy.contains('Cerrar Sesión', { timeout: 5000 }).click();
        cy.url().should('include', '/login');
        cy.wait(500); // Wait for logout to complete

        // Login as player
        cy.get('input[type="email"]').type('player@scpadel.com');
        cy.get('input[type="password"]').type('player123');
        cy.get('button[type="submit"]').click();

        // Try to access admin page
        cy.visit('/admin/users');

        // Should redirect to home
        cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
});

describe('Profile Page', () => {
  beforeEach(() => {
    // Use the smart authentication helper
    cy.ensureAuthenticated();
  });

  it('should navigate to profile page', () => {
    // Navigate to profile page
    cy.get('a').contains('Mi Perfil').click();
    cy.url().should('include', '/me');
    cy.contains('Mi Perfil').should('be.visible');
  });

  it('should display user profile information', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Check profile form fields
    cy.get('input[type="text"]').should('have.length.at.least', 1); // Name field
    cy.get('input[type="email"]').should('be.visible'); // Email field
    cy.get('select').should('be.visible'); // Sede select
    cy.get('input[placeholder="08:00 - 17:00"]').should('be.visible'); // Schedule field
  });

  it('should display account information section', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Check account information
    cy.contains('Información de la Cuenta').should('be.visible');
    cy.contains('ID de Usuario').should('be.visible');
    cy.contains('Rol').should('be.visible');
  });

  it('should display push notifications section', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Check push notifications section
    cy.contains('Notificaciones Push').should('be.visible');
    cy.contains('Habilitar').should('be.visible');
    cy.contains('Deshabilitar').should('be.visible');
  });

  it('should show validation errors for empty required fields', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Clear required fields
    cy.get('input[type="text"]').first().clear();
    cy.get('input[type="email"]').clear();
    cy.get('select').select('');

    // Try to save
    cy.contains('Guardar Cambios').click();

    // Check for validation errors
    cy.contains('El nombre debe tener al menos 2 caracteres').should('be.visible');
    cy.contains('El email es obligatorio').should('be.visible');
    cy.contains('La sede es obligatoria').should('be.visible');
  });

  it('should show validation error for invalid email format', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Enter invalid email
    cy.get('input[type="email"]').clear().type('invalid-email');

    // Try to save
    cy.contains('Guardar Cambios').click();

    // Check for validation error
    cy.contains('Por favor ingresa un email válido').should('be.visible');
  });

  it('should show validation error for name too short', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Enter short name
    cy.get('input[type="text"]').first().clear().type('A');

    // Try to save
    cy.contains('Guardar Cambios').click();

    // Check for validation error
    cy.contains('El nombre debe tener al menos 2 caracteres').should('be.visible');
  });

  it('should clear validation errors when user fixes them', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Create validation error
    cy.get('input[type="text"]').first().clear().type('A');
    cy.contains('Guardar Cambios').click();

    // Check error is shown
    cy.contains('El nombre debe tener al menos 2 caracteres').should('be.visible');

    // Fix the error
    cy.get('input[type="text"]').first().clear().type('Valid Name');

    // Error should be cleared
    cy.contains('El nombre debe tener al menos 2 caracteres').should('not.exist');
  });

  it('should show success message when profile is updated successfully', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Update profile
    cy.get('input[type="text"]').first().clear().type('Updated Name');
    cy.contains('Guardar Cambios').click();

    // Check for success message
    cy.contains('¡Perfil actualizado exitosamente!').should('be.visible');
  });

  it('should show loading state while saving', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Update profile
    cy.get('input[type="text"]').first().clear().type('Updated Name');
    cy.contains('Guardar Cambios').click();

    // Check for loading state
    cy.contains('Guardando...').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should allow editing all profile fields', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Edit name
    cy.get('input[type="text"]').first().clear().type('New Name');

    // Edit email
    cy.get('input[type="email"]').clear().type('newemail@example.com');

    // Edit sede
    cy.get('select').select('SEDE-2');

    // Edit schedule
    cy.get('input[placeholder="08:00 - 17:00"]').clear().type('09:00 - 18:00');

    // Save changes
    cy.contains('Guardar Cambios').click();

    // Check for success message
    cy.contains('¡Perfil actualizado exitosamente!').should('be.visible');
  });

  it('should display required field indicators', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Check for required field indicators
    cy.contains('*').should('have.length.at.least', 3); // At least 3 required fields
    cy.contains('Indica un campo obligatorio').should('be.visible');
  });

  it('should show helper text for fields', () => {
    cy.visit('/me');
    cy.wait(1000);

    // Check for helper text
    cy.contains('Usamos tu email corporativo para las notificaciones').should('be.visible');
    cy.contains('Opcional: Tu horario habitual de trabajo').should('be.visible');
  });
});






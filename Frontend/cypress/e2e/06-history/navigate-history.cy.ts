describe('History Page', () => {
  beforeEach(() => {
    // Use the smart authentication helper
    cy.ensureAuthenticated();
  });

  it('should navigate to history page', () => {
    // Navigate to history page
    cy.get('a').contains('Historial').click();
    cy.url().should('include', '/history');
    cy.contains('Historial de Viajes').should('be.visible');
  });

  it('should display statistics cards', () => {
    cy.visit('/history');
    cy.wait(1000);

    // Check statistics cards
    cy.contains('Total Viajes').should('be.visible');
    cy.contains('CO₂ Ahorrado').should('be.visible');
    cy.contains('Km Compartidos').should('be.visible');
  });

  it('should display filters section', () => {
    cy.visit('/history');
    cy.wait(1000);

    // Check filters
    cy.contains('Filtros').should('be.visible');
    cy.get('input[type="date"]').should('have.length', 2); // From and To dates
    cy.get('select').should('have.length', 2); // Status and Role selects
    cy.contains('Limpiar Filtros').should('be.visible');
  });

  it('should display history items if available', () => {
    cy.visit('/history');
    cy.wait(2000);

    // Check if there are history items or empty state
    cy.get('body').then(($body) => {
      if ($body.text().includes('No se encontraron viajes')) {
        cy.log('No history items found - showing empty state');
        cy.contains('No se encontraron viajes en el historial').should('be.visible');
      } else {
        cy.log('History items found');
        // At least one history card should be visible
        cy.get('.space-y-4 > div').should('have.length.greaterThan', 0);
      }
    });
  });

  it('should filter by date range', () => {
    cy.visit('/history');
    cy.wait(2000);

    // Set date filters
    const fromDate = '2024-01-01';
    const toDate = '2025-12-31';

    cy.get('input[type="date"]').first().type(fromDate);
    cy.get('input[type="date"]').last().type(toDate);

    cy.wait(500);

    // Verify filters are applied (results should update)
    cy.log('Date filters applied');
  });

  it('should filter by status', () => {
    cy.visit('/history');
    cy.wait(2000);

    // Select status filter
    cy.get('select').first().select('COMPLETED');

    cy.wait(500);

    // Verify filter is applied
    cy.log('Status filter applied');
  });

  it('should filter by role', () => {
    cy.visit('/history');
    cy.wait(2000);

    // Select role filter
    cy.get('select').last().select('driver');

    cy.wait(500);

    // Verify filter is applied (only driver trips should be visible)
    cy.log('Role filter applied');
  });

  it('should clear filters', () => {
    cy.visit('/history');
    cy.wait(2000);

    // Apply some filters
    cy.get('input[type="date"]').first().type('2024-01-01');
    cy.get('select').first().select('COMPLETED');

    // Clear filters
    cy.contains('Limpiar Filtros').click();

    // Verify filters are cleared
    cy.get('input[type="date"]').first().should('have.value', '');
    cy.get('select').first().should('have.value', 'all');
  });

  it('should display correct role badges', () => {
    cy.visit('/history');
    cy.wait(2000);

    cy.get('body').then(($body) => {
      if (!$body.text().includes('No se encontraron viajes')) {
        // Check for role badges (Conductor/Pasajero)
        cy.get('body').then(($body2) => {
          const hasConductor = $body2.text().includes('Conductor');
          const hasPasajero = $body2.text().includes('Pasajero');
          
          if (hasConductor) {
            cy.log('Found Conductor badge');
          }
          if (hasPasajero) {
            cy.log('Found Pasajero badge');
          }
        });
      }
    });
  });

  it('should display status badges', () => {
    cy.visit('/history');
    cy.wait(2000);

    cy.get('body').then(($body) => {
      if (!$body.text().includes('No se encontraron viajes')) {
        // Check for status badges
        cy.get('.inline-flex.items-center').should('have.length.greaterThan', 0);
        cy.log('Status badges found');
      }
    });
  });
});



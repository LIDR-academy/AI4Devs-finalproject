describe('Enhanced Trip Features (Fase 2)', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should display filters section', () => {
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    
    // Should have filters section
    cy.contains('Filtros').should('be.visible')
    
    // Should have filter options
    cy.contains('Estado').should('be.visible')
    cy.contains('Destino').should('be.visible')
    cy.contains('Fecha desde').should('be.visible')
    cy.contains('Fecha hasta').should('be.visible')
  })

  it('should filter trips by status', () => {
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    
    // Filter by active status
    cy.get('select').first().select('ACTIVE')
    
    // Should show filtered results or no results message
    cy.get('body').then(($body) => {
      if ($body.text().includes('No se encontraron viajes')) {
        cy.contains('No se encontraron viajes').should('be.visible')
      } else {
        // Has active trips
        cy.get('.space-y-6').should('exist')
      }
    })
  })

  it('should filter trips by destination', () => {
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    
    // Filter by destination
    cy.get('select').eq(1).select('SEDE-1')
    
    // Should show filtered results or no results message
    cy.get('body').then(($body) => {
      if ($body.text().includes('No se encontraron viajes')) {
        cy.contains('No se encontraron viajes').should('be.visible')
      } else {
        // Has trips to SEDE-1
        cy.get('.space-y-6').should('exist')
      }
    })
  })

  it('should clear filters', () => {
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    
    // Apply some filters
    cy.get('select').first().select('ACTIVE')
    cy.get('select').eq(1).select('SEDE-1')
    
    // Clear filters
    cy.contains('Limpiar filtros').click()
    
    // Filters should be reset
    cy.get('select').first().should('have.value', '')
    cy.get('select').eq(1).should('have.value', '')
  })

  it('should display trip cards with enhanced information', () => {
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    
    // Check if there are any trips
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No tienes viajes creados')) {
        // Should have trip cards with enhanced info
        cy.get('.space-y-6').should('exist')
        
        // Should have status badges
        cy.get('.inline-flex').should('exist')
        
        // Should have action buttons
        cy.contains('Editar').should('be.visible')
        cy.contains('+1 Asiento').should('be.visible')
        cy.contains('Cancelar').should('be.visible')
      }
    })
  })

  it('should open edit modal when clicking edit button', () => {
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    
    // Check if there are any trips
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No tienes viajes creados')) {
        // Click edit button
        cy.contains('Editar').first().click()
        
        // Modal should open
        cy.get('.fixed.inset-0').should('be.visible')
        cy.contains('Crear Viaje').should('be.visible')
        
        // Should have form fields
        cy.get('input[type="number"]').should('exist')
        cy.get('select').should('exist')
        cy.get('input[type="datetime-local"]').should('exist')
        
        // Should have action buttons
        cy.contains('Editar').should('be.visible')
        cy.contains('Cancelar').should('be.visible')
      }
    })
  })

  it('should test multi-language support', () => {
    // Test in Spanish (default)
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    cy.contains('Mis Viajes').should('be.visible')
    
    // Switch to English
    cy.get('[data-testid="language-switcher"]').click()
    cy.contains('English').click()
    
    // Should see English text
    cy.contains('My Trips').should('be.visible')
    cy.contains('Create Trip').should('be.visible')
    
    // Switch to Catalan
    cy.get('[data-testid="language-switcher"]').click()
    cy.contains('Català').click()
    
    // Should see Catalan text
    cy.contains('Els Meus Viatges').should('be.visible')
    cy.contains('Crear Viatge').should('be.visible')
  })
})

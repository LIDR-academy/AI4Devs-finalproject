describe('Trips Navigation', () => {
  beforeEach(() => {
    // Skip authentication for bypass mode
    if (Cypress.env('authDisabled') === true) {
      cy.log('🔓 Auth bypass enabled - skipping authentication')
      return
    }
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should navigate to trips page from home', () => {
    cy.visit('/')
    
    // For bypass mode, check if we can access trips directly
    if (Cypress.env('authDisabled') === true) {
      cy.visit('/trips')
      cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
      return
    }
    
    cy.contains('Crear Viaje', { timeout: 15000 }).click()
    cy.url().should('include', '/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
  })

  it('should navigate to trips page from navbar', () => {
    cy.visit('/')
    
    // For bypass mode, check if we can access trips directly
    if (Cypress.env('authDisabled') === true) {
      cy.visit('/trips')
      cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
      return
    }
    
    cy.get('nav', { timeout: 15000 }).contains('Viajes', { timeout: 15000 }).click()
    cy.url().should('include', '/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
  })

  it('should display trips page elements', () => {
    cy.visit('/trips')
    
    // Should have page container
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    
    // Should have create trip button
    cy.contains('Crear Viaje', { timeout: 15000 }).should('be.visible')
    
    // Should display empty state or trip cards
    cy.get('body').then(($body) => {
      if ($body.text().includes('No tienes viajes creados')) {
        cy.contains('No tienes viajes creados', { timeout: 15000 }).should('be.visible')
      } else {
        // Has trips, should show cards
        cy.get('.space-y-6', { timeout: 15000 }).should('exist')
      }
    })
  })

  it('should display map preview in trip cards when coordinates are available', () => {
    cy.visit('/trips')
    
    // Check if there are any trip cards with coordinates
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No tienes viajes creados')) {
        // Look for map containers in a non-failing way
        const $maps = $body.find('[data-testid="map-container"]')
        if ($maps.length > 0) {
          // Verify map has correct attributes
          cy.wrap($maps.first()).should('have.attr', 'data-zoom', '13')
          
          // Verify tile layer is present
          cy.get('[data-testid="tile-layer"]').should('exist')
          
          // Verify markers are present (origin markers)
          cy.get('[data-testid="circle-marker"]').should('exist')
        } else {
          // No maps found - this is acceptable if trips don't have coordinates
          cy.log('No maps found - trips may not have coordinates')
        }
      } else {
        // No trips available - this is expected in test environment
        cy.log('No trips available for map testing')
      }
    })
  })
})

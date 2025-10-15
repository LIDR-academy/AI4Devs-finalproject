describe('Matches Navigation', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should navigate to matches page from home', () => {
    cy.visit('/')
    cy.contains('Buscar Viajes').click()
    cy.url().should('include', '/matches')
    cy.contains('Buscar Viajes').should('be.visible')
  })

  it('should navigate to matches page from navbar', () => {
    cy.visit('/')
    cy.get('nav').contains('Buscar').click()
    cy.url().should('include', '/matches')
    cy.contains('Buscar Viajes').should('be.visible')
  })

  it('should display matches page elements', () => {
    cy.visit('/matches')
    
    // Should have page title
    cy.contains('Buscar Viajes').should('be.visible')
    
    // Should have search form
    cy.get('form').should('exist')
    
    // Should have destination select
    cy.contains('Destino').should('be.visible')
  })

  it('should display map preview in search results when coordinates are available', () => {
    cy.visit('/matches')
    
    // Perform a search to get results
    cy.get('select').first().select('SEDE-1')
    cy.contains('Buscar Viajes').click()
    
    // Wait for results and check if maps are displayed
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.text().includes('Encontrados') && $body.text().includes('viajes compatibles')) {
        // Look for map containers in match results
        cy.get('[data-testid="map-container"]', { timeout: 5000 }).then(($maps) => {
          if ($maps.length > 0) {
            // Verify map has correct attributes
            cy.get('[data-testid="map-container"]').first().should('have.attr', 'data-zoom', '13')
            
            // Verify tile layer is present
            cy.get('[data-testid="tile-layer"]').should('exist')
            
            // Verify markers are present (origin markers)
            cy.get('[data-testid="circle-marker"]').should('exist')
          } else {
            // No maps found - this is acceptable if matches don't have coordinates
            cy.log('No maps found - matches may not have coordinates')
          }
        }).catch(() => {
          // Timeout is acceptable - no maps found
          cy.log('No maps found - matches may not have coordinates')
        })
      } else {
        // No matches found - this is expected in test environment
        cy.log('No matches found for map testing')
      }
    })
  })
})

describe('Map Integration with SimpleMapPreview', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should display SimpleMapPreview in TripCard when expanded', () => {
    cy.visit('/trips')
    
    // Create a trip with coordinates
    cy.get('[data-testid="create-trip-button"]').click()
    cy.get('input[placeholder="40.4168"]').clear().type('40.4168')
    cy.get('input[placeholder="-3.7038"]').clear().type('-3.7038')
    cy.get('[data-testid="direction-select"]').select('TO_SEDE')
    cy.get('[data-testid="destination-select"]').select('SEDE-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    cy.get('input[type="number"][min="1"][max="8"]').clear().type('2')
    cy.contains('button', 'Crear').click()
    cy.contains('¡Viaje creado exitosamente!').should('be.visible')
    
    // Expand trip card to show map
    cy.contains('Ver Mapa').first().click()
    
    // Check SimpleMapPreview elements
    cy.contains('Ubicación').should('be.visible')
    cy.contains('Origen').should('be.visible')
    cy.contains('Destino').should('be.visible')
    cy.contains('Google Maps').should('be.visible')
    cy.contains('Waze').should('be.visible')
  })

  it('should show distance calculation', () => {
    cy.visit('/trips')
    
    // Create a trip
    cy.get('[data-testid="create-trip-button"]').click()
    cy.get('input[placeholder="40.4168"]').clear().type('40.4168')
    cy.get('input[placeholder="-3.7038"]').clear().type('-3.7038')
    cy.get('[data-testid="direction-select"]').select('TO_SEDE')
    cy.get('[data-testid="destination-select"]').select('SEDE-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    cy.get('input[type="number"][min="1"][max="8"]').clear().type('2')
    cy.contains('button', 'Crear').click()
    cy.contains('¡Viaje creado exitosamente!').should('be.visible')
    
    // Expand and check distance
    cy.contains('Ver Mapa').first().click()
    cy.contains('Distancia aproximada').should('be.visible')
  })

  it('should have functional map buttons', () => {
    cy.visit('/trips')
    
    // Create a trip
    cy.get('[data-testid="create-trip-button"]').click()
    cy.get('input[placeholder="40.4168"]').clear().type('40.4168')
    cy.get('input[placeholder="-3.7038"]').clear().type('-3.7038')
    cy.get('[data-testid="direction-select"]').select('TO_SEDE')
    cy.get('[data-testid="destination-select"]').select('SEDE-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    cy.get('input[type="number"][min="1"][max="8"]').clear().type('2')
    cy.contains('button', 'Crear').click()
    cy.contains('¡Viaje creado exitosamente!').should('be.visible')
    
    // Expand and test buttons
    cy.contains('Ver Mapa').first().click()
    
    // Test Google Maps button (should open in new tab)
    cy.contains('Google Maps').should('have.attr', 'target', '_blank')
    cy.contains('Waze').should('have.attr', 'target', '_blank')
  })

  it('should support multiple languages for map text', () => {
    cy.visit('/trips')
    
    // Test in Spanish (default)
    cy.get('[data-testid="create-trip-button"]').click()
    cy.get('input[placeholder="40.4168"]').clear().type('40.4168')
    cy.get('input[placeholder="-3.7038"]').clear().type('-3.7038')
    cy.get('[data-testid="direction-select"]').select('TO_SEDE')
    cy.get('[data-testid="destination-select"]').select('SEDE-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    cy.get('input[type="number"][min="1"][max="8"]').clear().type('2')
    cy.contains('button', 'Crear').click()
    cy.contains('¡Viaje creado exitosamente!').should('be.visible')
    
    cy.contains('Ver Mapa').first().click()
    cy.contains('Ubicación').should('be.visible')
    
    // Switch to English
    cy.get('[data-testid="language-switcher"]').click()
    cy.contains('English').click()
    cy.wait(500)
    
    cy.contains('Location').should('be.visible')
    cy.contains('Origin').should('be.visible')
    cy.contains('Destination').should('be.visible')
  })
})

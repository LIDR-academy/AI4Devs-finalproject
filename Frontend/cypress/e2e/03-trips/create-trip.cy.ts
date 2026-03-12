describe('Create Trip', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('creates a new trip and shows it in the list', () => {
    // Crear viaje vía API para estabilidad en bypass
    const futureIso = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    cy.request('POST', 'http://localhost:8081/api/trips', {
      origin: { lat: 40.4168, lng: -3.7038 },
      destinationSedeId: 'SEDE-1',
      dateTime: futureIso,
      seatsTotal: 2,
    }).its('status').should('eq', 200)

    // Verificar en UI - usar data-testid o selectores más robustos
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    
    // Debug: ver qué texto está realmente en la página
    cy.get('body').then(($body) => {
      cy.log('Page content:', $body.text())
    })
    
    // Buscar cualquier texto que contenga "SEDE-1"
    cy.contains('SEDE-1', { timeout: 15000 }).should('be.visible')
  })
})



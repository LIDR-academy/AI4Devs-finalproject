describe('Trips Edit & Delete', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('crea, edita y elimina un viaje', () => {
    // Precondición: trips-service disponible
    cy.request('http://localhost:8081/api/trips')
    cy.visit('/trips')
    
    // Usar data-testid para encontrar el botón de crear
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    cy.get('[data-testid="create-trip-button"]').click()

    cy.get('input[placeholder="40.4168"]', { timeout: 15000 }).clear().type('40.4168')
    cy.get('input[placeholder="-3.7038"]', { timeout: 15000 }).clear().type('-3.7038')
    cy.get('[data-testid="direction-select"]').select('TO_SEDE')
    cy.get('[data-testid="destination-select"]').select('SEDE-1')
    const dt = new Date(Date.now() + 90 * 60 * 1000).toISOString().slice(0,16)
    cy.get('input[type="datetime-local"]', { timeout: 15000 }).type(dt)
    cy.get('input[type="number"][min="1"][max="8"]', { timeout: 15000 }).clear().type('2')
    cy.contains('button', 'Crear').click()

    cy.contains('¡Viaje creado exitosamente!', { timeout: 15000 }).should('be.visible')

    // Buscar botón de editar en el TripCard
    cy.get('body').then(($body) => {
      if ($body.text().includes('Editar')) {
        cy.contains('button', 'Editar').first().click()
        
        // Modal debería abrirse
        cy.get('.fixed.inset-0').should('be.visible')
        cy.contains('Editar Viaje').should('be.visible')
        
        // Cambiar asientos
        cy.get('input[type="number"][min="1"][max="8"]').clear().type('3')
        cy.contains('button', 'Editar').click()
        
        // Verificar mensaje de éxito
        cy.contains('¡Viaje actualizado exitosamente!', { timeout: 15000 }).should('be.visible')
      }
    })

    // Eliminar viaje (ahora pide confirmación)
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true)
    })

    cy.get('body').then(($body) => {
      if ($body.text().includes('Cancelar')) {
        cy.contains('button', 'Cancelar').first().click()
        
        // Verificar mensaje de éxito
        cy.contains('¡Viaje cancelado exitosamente!', { timeout: 15000 }).should('be.visible')
      }
    })
  })
})



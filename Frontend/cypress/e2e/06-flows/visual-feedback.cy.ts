describe('Visual Feedback', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should show loading state when creating trip', () => {
    cy.visit('/trips')
    cy.get('[data-testid="create-trip-button"]').click()
    
    // Fill form
    cy.get('input[placeholder="40.4168"]').clear().type('40.4168')
    cy.get('input[placeholder="-3.7038"]').clear().type('-3.7038')
    cy.get('select').first().select('TO_SEDE')
    cy.get('select').eq(1).select('SEDE-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    cy.get('input[type="number"][min="1"][max="8"]').clear().type('2')
    
    // Submit and check for loading
    cy.contains('button', 'Crear').click()
    cy.contains('Creando').should('be.visible')
  })
  
  it('should show confirmation before deleting', () => {
    cy.visit('/trips')
    
    // Create a trip first
    cy.get('[data-testid="create-trip-button"]').click()
    cy.get('input[placeholder="40.4168"]').clear().type('40.4168')
    cy.get('input[placeholder="-3.7038"]').clear().type('-3.7038')
    cy.get('select').first().select('TO_SEDE')
    cy.get('select').eq(1).select('SEDE-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    cy.get('input[type="number"][min="1"][max="8"]').clear().type('2')
    cy.contains('button', 'Crear').click()
    cy.contains('Viaje creado exitosamente').should('be.visible')
    
    // Test confirmation dialog
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false)
    })
    
    cy.contains('button', 'Cancelar').first().click()
    
    // Should not delete if user cancels
    cy.contains('Viaje cancelado exitosamente').should('not.exist')
  })
  
  it('should show success messages with auto-hide', () => {
    cy.visit('/trips')
    cy.get('[data-testid="create-trip-button"]').click()
    
    // Fill and submit form
    cy.get('input[placeholder="40.4168"]').clear().type('40.4168')
    cy.get('input[placeholder="-3.7038"]').clear().type('-3.7038')
    cy.get('select').first().select('TO_SEDE')
    cy.get('select').eq(1).select('SEDE-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    cy.get('input[type="number"][min="1"][max="8"]').clear().type('2')
    cy.contains('button', 'Crear').click()
    
    // Check success message appears
    cy.contains('Viaje creado exitosamente').should('be.visible')
    
    // Wait for auto-hide (should disappear after 3-5 seconds)
    cy.contains('Viaje creado exitosamente', { timeout: 6000 }).should('not.exist')
  })
  
  it('should disable button during action', () => {
    cy.visit('/trips')
    cy.get('[data-testid="create-trip-button"]').click()
    
    // Fill form
    cy.get('input[placeholder="40.4168"]').clear().type('40.4168')
    cy.get('input[placeholder="-3.7038"]').clear().type('-3.7038')
    cy.get('select').first().select('TO_SEDE')
    cy.get('select').eq(1).select('SEDE-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    cy.get('input[type="number"][min="1"][max="8"]').clear().type('2')
    
    // Submit and check button is disabled
    cy.contains('button', 'Crear').click()
    cy.contains('button', 'Crear').should('be.disabled')
  })
})

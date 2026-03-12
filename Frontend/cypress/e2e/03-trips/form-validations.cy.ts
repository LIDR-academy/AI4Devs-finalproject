describe('Trip Form Validations', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    cy.get('button').contains('Crear Viaje').click()
  })

  it('should show asterisks on all required fields', () => {
    cy.contains('Latitud de Origen *').should('be.visible')
    cy.contains('Longitud de Origen *').should('be.visible')
    cy.contains('Destino *').should('be.visible')
    cy.contains('Fecha y Hora *').should('be.visible')
    cy.contains('Asientos Totales *').should('be.visible')
  })

  it('should validate latitude range', () => {
    cy.get('input[placeholder="40.4168"]').clear().type('95').blur()
    cy.contains('90').should('exist')
  })

  it('should validate longitude range', () => {
    cy.get('input[placeholder="-3.7038"]').clear().type('200').blur()
    cy.contains('180').should('exist')
  })

  it('should prevent submit with empty required fields', () => {
    cy.contains('button', 'Crear Viaje').click()
    cy.contains('Crear Nuevo Viaje', { timeout: 8000 }).should('be.visible')
  })

  it('should validate that destination is selected', () => {
    cy.get('input[placeholder="40.4168"]').type('40.4168')
    cy.get('input[placeholder="-3.7038"]').type('-3.7038')
    const dt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(dt)
    cy.get('input[type="number"][min="1"]').type('2')
    cy.get('select').should('have.value', '')
    cy.contains('button', 'Crear Viaje').click()
    cy.contains('Crear Nuevo Viaje', { timeout: 8000 }).should('be.visible')
  })

  it('should validate future dates only', () => {
    cy.get('input[placeholder="40.4168"]').type('40.4168')
    cy.get('input[placeholder="-3.7038"]').type('-3.7038')
    cy.get('select').select('SEDE-1')
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const pastDate = yesterday.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(pastDate)
    cy.get('input[type="number"][min="1"]').type('2')
    cy.contains('button', 'Crear Viaje').click()
    cy.contains('Crear Nuevo Viaje', { timeout: 8000 }).should('be.visible')
  })

  it('should validate seats range (1-8)', () => {
    cy.get('input[placeholder="40.4168"]').type('40.4168')
    cy.get('input[placeholder="-3.7038"]').type('-3.7038')
    cy.get('select').select('SEDE-1')
    const dt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(dt)
    cy.get('input[type="number"][min="1"]').clear().type('10').blur()
    cy.contains('8').should('exist')
  })

  it('should show helper text for seats', () => {
    cy.contains('Máximo 8 asientos').should('be.visible')
  })

  it('should create trip when all fields are valid', () => {
    cy.get('input[placeholder="40.4168"]').type('40.4168')
    cy.get('input[placeholder="-3.7038"]').type('-3.7038')
    cy.get('select').select('SEDE-1')
    const dt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(dt)
    cy.get('input[type="number"][min="1"]').type('3')
    cy.contains('button', 'Crear Viaje').click()
    cy.contains('Crear Nuevo Viaje', { timeout: 8000 }).should('not.exist')
    cy.contains('Viaje a SEDE-1', { timeout: 15000 }).should('be.visible')
  })
})


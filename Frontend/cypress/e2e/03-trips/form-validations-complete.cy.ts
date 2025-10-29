describe('Trip Form Validations - Complete', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
    cy.visit('/trips')
    cy.get('[data-testid="trips-page"]', { timeout: 15000 }).should('be.visible')
    cy.get('[data-testid="create-trip-button"]').click()
  })

  it('should show required field indicators', () => {
    // Check for asterisks on required fields
    cy.contains('Latitud de Origen *').should('be.visible')
    cy.contains('Longitud de Origen *').should('be.visible')
    cy.contains('Dirección *').should('be.visible')
    cy.contains('Destino *').should('be.visible')
    cy.contains('Fecha y hora *').should('be.visible')
    cy.contains('Asientos Totales *').should('be.visible')
  })

  it('should validate latitude range', () => {
    // Find latitude input by label and placeholder
    cy.get('label').contains('Latitud').parent().find('input[type="number"]').as('latInput')
    
    // Test latitude out of range (too high)
    cy.get('@latInput').clear().type('95')
    cy.get('@latInput').blur()
    cy.contains('debe estar entre -90 y 90').should('be.visible')
    
    // Test latitude out of range (too low)
    cy.get('@latInput').clear().type('-95')
    cy.get('@latInput').blur()
    cy.contains('debe estar entre -90 y 90').should('be.visible')
    
    // Test valid latitude
    cy.get('@latInput').clear().type('40.4168')
    cy.get('@latInput').blur()
    cy.contains('debe estar entre -90 y 90').should('not.exist')
  })

  it('should validate longitude range', () => {
    // Find longitude input by label
    cy.get('label').contains('Longitud').parent().find('input[type="number"]').as('lngInput')
    
    // Test longitude out of range (too high)
    cy.get('@lngInput').clear().type('185')
    cy.get('@lngInput').blur()
    cy.contains('debe estar entre -180 y 180').should('be.visible')
    
    // Test longitude out of range (too low)
    cy.get('@lngInput').clear().type('-185')
    cy.get('@lngInput').blur()
    cy.contains('debe estar entre -180 y 180').should('be.visible')
    
    // Test valid longitude
    cy.get('@lngInput').clear().type('-3.7038')
    cy.get('@lngInput').blur()
    cy.contains('debe estar entre -180 y 180').should('not.exist')
  })

  it('should validate seats range', () => {
    // Find seats input by label
    cy.get('label').contains('Asientos').parent().find('input[type="number"]').as('seatsInput')
    
    // Test too few seats
    cy.get('@seatsInput').clear().type('0')
    cy.get('@seatsInput').blur()
    cy.contains(/al menos 1 asiento|más de 8 asientos/i, { timeout: 10000 }).should('be.visible')
    
    // Test too many seats
    cy.get('@seatsInput').clear().type('9')
    cy.get('@seatsInput').blur()
    cy.contains(/al menos 1 asiento|más de 8 asientos/i, { timeout: 10000 }).should('be.visible')
    
    // Test valid seats
    cy.get('@seatsInput').clear().type('4')
    cy.get('@seatsInput').blur()
    cy.contains(/al menos 1 asiento|más de 8 asientos/i).should('not.exist')
  })

  it('should validate future dates only', () => {
    // Fill valid coordinates first
    cy.get('label').contains('Latitud').parent().find('input[type="number"]').clear().type('40.4168')
    cy.get('label').contains('Longitud').parent().find('input[type="number"]').clear().type('-3.7038')
    cy.get('[data-testid="direction-select"]').select('TO_SEDE')
    cy.get('[data-testid="destination-select"]').select('SEDE-1')
    cy.get('label').contains('Asientos').parent().find('input[type="number"]').clear().type('2')
    
    // Test past date
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    pastDate.setHours(8, 30, 0, 0)
    const pastDateTimeString = pastDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(pastDateTimeString)
    cy.get('input[type="datetime-local"]').blur()
    cy.contains('La fecha debe ser en el futuro', { timeout: 10000 }).should('be.visible')
    
    // Test future date
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    cy.get('input[type="datetime-local"]').blur()
    cy.contains('La fecha debe ser en el futuro').should('not.exist')
  })

  it('should validate required fields', () => {
    // Test missing latitude
    cy.get('label').contains('Latitud').parent().find('input[type="number"]').clear()
    cy.get('label').contains('Latitud').parent().find('input[type="number"]').blur()
    cy.contains(/latitud.*obligatori/i, { timeout: 10000 }).should('be.visible')
    
    // Test missing longitude
    cy.get('label').contains('Longitud').parent().find('input[type="number"]').clear()
    cy.get('label').contains('Longitud').parent().find('input[type="number"]').blur()
    cy.contains(/longitud.*obligatori/i, { timeout: 10000 }).should('be.visible')
    
    // Test missing direction
    cy.get('[data-testid="direction-select"]').select('')
    cy.get('[data-testid="direction-select"]').blur()
    cy.contains(/direcci.*obligatori/i, { timeout: 10000 }).should('be.visible')
    
    // Test missing destination
    cy.get('[data-testid="destination-select"]').select('')
    cy.get('[data-testid="destination-select"]').blur()
    cy.contains(/destino.*obligatori/i, { timeout: 10000 }).should('be.visible')
    
    // Test missing date
    cy.get('input[type="datetime-local"]').clear()
    cy.get('input[type="datetime-local"]').blur()
    cy.contains(/fecha.*hora.*obligatori/i, { timeout: 10000 }).should('be.visible')
    
    // Test missing seats
    cy.get('label').contains('Asientos').parent().find('input[type="number"]').clear()
    cy.get('label').contains('Asientos').parent().find('input[type="number"]').blur()
    cy.contains(/asiento.*obligatori/i, { timeout: 10000 }).should('be.visible')
  })

  it('should prevent submit with validation errors', () => {
    // Try to submit with empty form
    cy.contains('button', 'Crear').click()
    
    // Should show validation errors
    cy.contains('Por favor corrige los errores en el formulario', { timeout: 10000 }).should('be.visible')
    
    // Form should not be submitted (no success message)
    cy.contains('¡Viaje creado exitosamente!').should('not.exist')
  })

  it('should allow submit with valid data', () => {
    // Fill form with valid data
    cy.get('label').contains('Latitud').parent().find('input[type="number"]').clear().type('40.4168')
    cy.get('label').contains('Longitud').parent().find('input[type="number"]').clear().type('-3.7038')
    cy.get('[data-testid="direction-select"]').select('TO_SEDE')
    cy.get('[data-testid="destination-select"]').select('SEDE-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    futureDate.setHours(8, 30, 0, 0)
    const futureDateTimeString = futureDate.toISOString().slice(0, 16)
    cy.get('input[type="datetime-local"]').clear().type(futureDateTimeString)
    
    cy.get('label').contains('Asientos').parent().find('input[type="number"]').clear().type('2')
    
    // Submit form
    cy.contains('button', 'Crear').click()
    
    // Should show success message
    cy.contains('¡Viaje creado exitosamente!', { timeout: 15000 }).should('be.visible')
  })

  it('should show helper text for seats', () => {
    // Check helper text for seats field
    cy.contains('Máximo 8 asientos').should('be.visible')
  })

  it('should clear errors when valid data is entered', () => {
    // First create an error
    cy.get('label').contains('Latitud').parent().find('input[type="number"]').clear().type('95')
    cy.get('label').contains('Latitud').parent().find('input[type="number"]').blur()
    cy.contains('debe estar entre -90 y 90').should('be.visible')
    
    // Then fix it
    cy.get('label').contains('Latitud').parent().find('input[type="number"]').clear().type('40.4168')
    cy.get('label').contains('Latitud').parent().find('input[type="number"]').blur()
    cy.contains('debe estar entre -90 y 90').should('not.exist')
  })
})

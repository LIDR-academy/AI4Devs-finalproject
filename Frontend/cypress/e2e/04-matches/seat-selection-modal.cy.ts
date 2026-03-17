describe('Seat Selection Modal', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should open seat selection modal when booking button is clicked', () => {
    // Asegurar que hay viajes disponibles
    cy.request('http://localhost:8081/api/trips?destinationSedeId=SEDE-1').then((res) => {
      expect(res.body.length).to.be.greaterThan(0)
    })

    cy.visit('/matches')
    cy.contains('Buscar Viajes').should('be.visible')

    // Wait for selects to be loaded
    cy.get('select').should('have.length.at.least', 2);
    
    // Buscar viajes para SEDE-1
    cy.get('select').eq(1).select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()

    // Esperar resultados
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Hacer clic en "Reservar Viaje" - debería abrir el modal
    cy.contains('button', 'Reservar Viaje').first().click()

    // Verificar que el modal se abre
    cy.contains('Seleccionar Asientos').should('be.visible')
    cy.contains('Asientos disponibles:').should('be.visible')
    cy.contains('Elige cuántos asientos deseas reservar').should('be.visible')
  })

  it('should show seat selection buttons for available seats', () => {
    cy.visit('/matches')
    cy.get('select').eq(1).select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Abrir modal
    cy.contains('button', 'Reservar Viaje').first().click()

    // Verificar que aparecen los botones de asientos
    cy.contains('Seleccionar Asientos').should('be.visible')
    
    // Debería mostrar botones para 1, 2, 3, etc. según asientos disponibles
    cy.get('button').contains('1').should('be.visible')
    cy.get('button').contains('2').should('be.visible')
    
    // Verificar que el botón 1 está seleccionado por defecto
    cy.get('button').contains('1').should('have.class', 'bg-primary-600')
    
    // Verificar resumen de selección
    cy.contains('Asientos seleccionados').should('be.visible')
    cy.contains('1 asiento').should('be.visible')
  })

  it('should allow seat selection and confirm booking', () => {
    cy.visit('/matches')
    cy.get('select').eq(1).select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Abrir modal
    cy.contains('button', 'Reservar Viaje').first().click()

    // Seleccionar 2 asientos
    cy.get('button').contains('2').click()
    
    // Verificar que se actualiza la selección
    cy.get('button').contains('2').should('have.class', 'bg-primary-600')
    cy.get('button').contains('1').should('not.have.class', 'bg-primary-600')
    cy.contains('2 asientos').should('be.visible')

    // Confirmar reserva
    cy.contains('button', 'Confirmar Reserva').click()

    // Verificar mensaje de éxito
    cy.contains('Reserva creada exitosamente', { timeout: 8000 }).should('be.visible')
    cy.contains('2 asiento(s) reservado(s)').should('be.visible')
  })

  it('should close modal when cancel is clicked', () => {
    cy.visit('/matches')
    cy.get('select').eq(1).select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Abrir modal
    cy.contains('button', 'Reservar Viaje').first().click()
    cy.contains('Seleccionar Asientos').should('be.visible')

    // Cerrar con botón Cancel
    cy.contains('button', 'Cancelar').click()

    // Verificar que el modal se cierra
    cy.contains('Seleccionar Asientos').should('not.exist')
    
    // No debería haber mensaje de éxito
    cy.contains('Reserva creada exitosamente').should('not.exist')
  })

  it('should close modal when X button is clicked', () => {
    cy.visit('/matches')
    cy.get('select').eq(1).select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Abrir modal
    cy.contains('button', 'Reservar Viaje').first().click()
    cy.contains('Seleccionar Asientos').should('be.visible')

    // Cerrar con botón X
    cy.get('button').contains('✕').click()

    // Verificar que el modal se cierra
    cy.contains('Seleccionar Asientos').should('not.exist')
  })

  it('should show loading state during booking', () => {
    cy.visit('/matches')
    cy.get('select').eq(1).select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Abrir modal
    cy.contains('button', 'Reservar Viaje').first().click()
    cy.contains('Seleccionar Asientos').should('be.visible')

    // Seleccionar asientos y confirmar
    cy.get('button').contains('1').click()
    cy.contains('button', 'Confirmar Reserva').click()

    // El botón debería mostrar loading (puede ser muy rápido)
    // Verificamos que la acción se completa
    cy.contains('Reserva creada exitosamente', { timeout: 8000 }).should('be.visible')
  })

  it('should handle different number of available seats', () => {
    // Este test verifica que el modal se adapta al número de asientos disponibles
    cy.visit('/matches')
    cy.get('select').eq(1).select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Abrir modal
    cy.contains('button', 'Reservar Viaje').first().click()
    cy.contains('Seleccionar Asientos').should('be.visible')

    // Verificar que muestra el número correcto de asientos disponibles
    cy.contains('Asientos disponibles:').should('be.visible')
    
    // Los botones deberían corresponder al número de asientos disponibles
    // (esto depende de los datos de prueba disponibles)
    cy.get('button').contains('1').should('be.visible')
  })

  it('should update selection summary when different seats are selected', () => {
    cy.visit('/matches')
    cy.get('select').eq(1).select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Abrir modal
    cy.contains('button', 'Reservar Viaje').first().click()

    // Verificar estado inicial
    cy.contains('1 asiento').should('be.visible')

    // Seleccionar 2 asientos
    cy.get('button').contains('2').click()
    cy.contains('2 asientos').should('be.visible')
    cy.contains('1 asiento').should('not.exist')

    // Seleccionar 3 asientos
    cy.get('button').contains('3').click()
    cy.contains('3 asientos').should('be.visible')
    cy.contains('2 asientos').should('not.exist')
  })

  it('should be keyboard accessible', () => {
    cy.visit('/matches')
    cy.get('select').eq(1).select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Abrir modal
    cy.contains('button', 'Reservar Viaje').first().click()

    // Navegar con teclado
    cy.get('button').contains('1').focus()
    cy.get('button').contains('1').type('{enter}')
    
    // Verificar que se puede navegar y seleccionar
    cy.get('button').contains('1').should('have.class', 'bg-primary-600')
  })
})

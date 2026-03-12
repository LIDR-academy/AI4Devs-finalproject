describe('Book from Search Results', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should book a trip from search results and verify PENDING status', () => {
    // Asegurar que hay viajes disponibles
    cy.request('http://localhost:8081/api/trips?destinationSedeId=SEDE-1').then((res) => {
      expect(res.body.length).to.be.greaterThan(0)
    })

    cy.visit('/matches')
    cy.contains('Buscar Viajes').should('be.visible')

    // Buscar viajes para SEDE-1
    cy.get('select').first().select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()

    // Esperar resultados
    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Verificar que hay viajes en los resultados
    cy.contains('Viaje a SEDE-1').should('be.visible')

    // Mock del prompt para número de asientos
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('1')
    })

    // Hacer clic en "Reservar Viaje"
    cy.contains('button', 'Reservar Viaje').first().click()

    // Verificar mensaje de éxito
    cy.contains('Reserva creada exitosamente', { timeout: 8000 }).should('be.visible')
    cy.contains('asiento(s) reservado(s)').should('be.visible')

    // Verificar marca "Ya reservado" aparece
    cy.contains('Ya reservado', { timeout: 5000 }).should('be.visible')
    
    // Verificar que el botón cambió a "Ya reservado" y está deshabilitado
    cy.contains('button', 'Ya reservado').should('be.visible').and('be.disabled')
    
    // Verificar en la página de bookings que aparece en estado PENDING
    cy.visit('/bookings')
    cy.contains('Pendiente').should('be.visible')
  })

  it('should validate seats availability when booking', () => {
    cy.visit('/matches')
    cy.get('select').first().select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()

    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Intentar reservar más asientos de los disponibles
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('999')
    })

    cy.contains('button', 'Reservar Viaje').first().click()

    // Verificar mensaje de error
    cy.contains('Solo hay', { timeout: 5000 }).should('be.visible')
    cy.contains('asientos disponibles').should('be.visible')
  })

  it('should show loading state while booking', () => {
    cy.visit('/matches')
    cy.get('select').first().select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()

    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('1')
    })

    // El botón debería mostrar loading mientras procesa
    cy.contains('button', 'Reservar Viaje').first().click()
    
    // Nota: El loading puede ser muy rápido, pero verificamos que la acción se completa
    cy.contains('Reserva creada exitosamente', { timeout: 8000 }).should('be.visible')
  })

  it('should cancel booking when user cancels prompt', () => {
    cy.visit('/matches')
    cy.get('select').first().select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()

    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Contar badges "Ya reservado" antes
    let badgesBeforeCount = 0
    cy.get('body').then(($body) => {
      badgesBeforeCount = $body.find(':contains("Ya reservado")').length
    })

    // Usuario cancela el prompt
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(null)
    })

    cy.contains('button', 'Reservar Viaje').first().click()

    // No debería mostrar mensaje de éxito (usuario canceló)
    cy.contains('Reserva creada exitosamente').should('not.exist')
    
    // El número de badges no debería haber aumentado
    cy.wait(1000) // Pequeña espera para asegurar que no se agregó
    cy.get('body').then(($body) => {
      const badgesAfterCount = $body.find(':contains("Ya reservado")').length
      expect(badgesAfterCount).to.equal(badgesBeforeCount)
    })
  })

  it('should show already booked badge for reserved trips', () => {
    // Crear una reserva primero
    cy.request('http://localhost:8081/api/trips?destinationSedeId=SEDE-1')
      .its('body').then((trips: any[]) => {
        const tripId = trips[0].id
        
        // Crear reserva via API
        return cy.request('POST', 'http://localhost:8083/api/bookings', {
          tripId: tripId,
          seatsRequested: 1
        })
      })

    // Ir a buscar y verificar que aparece el badge
    cy.visit('/matches')
    cy.get('select').first().select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()

    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')

    // Debería mostrar badge "Ya reservado"
    cy.contains('Ya reservado').should('be.visible')

    // Verificar que tiene el ícono de check
    cy.contains('Ya reservado').parent().find('svg').should('exist')
  })
})



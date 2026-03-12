describe('Create Booking', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('creates a booking for an existing trip and verifies PENDING status', () => {
    // Obtener un viaje válido desde la API
    cy.request('http://localhost:8081/api/trips?destinationSedeId=SEDE-1')
      .its('body').then((trips: any[]) => {
        expect(trips.length).to.be.greaterThan(0)
        const tripId = trips[0].id

        // Crear reserva via API
        cy.request('POST', 'http://localhost:8083/api/bookings', {
          tripId,
          seatsRequested: 1
        }).then((response) => {
          // Verificar que la respuesta tiene el estado PENDING
          expect(response.body.status).to.equal('PENDING')
          expect(response.body.seatsRequested).to.equal(1)
          expect(response.body.tripId).to.equal(tripId)
        })

        // Verificar en la UI de bookings
        cy.visit('/bookings')
        cy.contains('Mis Reservas').should('be.visible')
        
        // Verificar que aparece la Card de reserva con el nuevo diseño
        cy.contains('Reserva #', { timeout: 10000 }).should('be.visible')
        cy.contains(tripId).should('be.visible')
        
        // Verificar badge de estado PENDING
        cy.contains('Pendiente').should('be.visible')
        
        // Verificar información de la reserva
        cy.contains('Asientos reservados').should('be.visible')
        cy.contains('1').should('be.visible')
      })
  })

  it('validates seat availability when creating booking', () => {
    // Intentar crear reserva con más asientos de los disponibles
    cy.request({
      method: 'POST',
      url: 'http://localhost:8083/api/bookings',
      body: {
        tripId: '550e8400-e29b-41d4-a716-446655440001', // UUID válido pero trip inexistente
        seatsRequested: 999
      },
      failOnStatusCode: false
    }).then((response) => {
      // Debería fallar con 400 por asientos insuficientes
      expect(response.status).to.equal(400)
      expect(response.body).to.include('Validation failed')
    })
  })

  it('validates required fields when creating booking', () => {
    // Intentar crear reserva sin tripId
    cy.request({
      method: 'POST',
      url: 'http://localhost:8083/api/bookings',
      body: {
        seatsRequested: 1
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400)
      expect(response.body).to.include('Trip ID is required')
    })

    // Intentar crear reserva con asientos inválidos
    cy.request({
      method: 'POST',
      url: 'http://localhost:8083/api/bookings',
      body: {
        tripId: '550e8400-e29b-41d4-a716-446655440001',
        seatsRequested: 0
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400)
      expect(response.body).to.include('Valid number of seats is required')
    })
  })
})




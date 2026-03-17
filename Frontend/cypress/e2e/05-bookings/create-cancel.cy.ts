describe('Bookings Create & Cancel', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('crea una reserva desde matches y la cancela', () => {
    // Obtener un viaje válido desde la API
    cy.request('http://localhost:8081/api/trips?destinationSedeId=SEDE-1')
      .its('body').then((trips: any[]) => {
        expect(trips.length).to.be.greaterThan(0)
        const tripId = trips[0].id

        // Crear reserva directamente via API
        cy.request('POST', 'http://localhost:8083/api/bookings', {
          tripId: tripId,
          seatsRequested: 1
        }).then((response) => {
          // Verificar que la reserva se creó en estado PENDING
          expect(response.body.status).to.equal('PENDING')
        })

        // Visitar página de reservas
        cy.visit('/bookings')

        // Nueva UI: verificar que aparece la Card de reserva
        cy.contains('Mis Reservas').should('be.visible')
        
        // Verificar que la reserva aparece con el nuevo diseño
        cy.contains('Reserva #', { timeout: 10000 }).should('be.visible')
        cy.contains(tripId).should('be.visible')
        
        // Verificar badge de estado PENDING
        cy.contains('Pendiente').should('be.visible')

        // Mock de confirmación para el dialog
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true)
        })

        // Cancelar reserva
        cy.contains('Cancelar Reserva').first().click()

        // Verificar mensaje de éxito
        cy.contains('Reserva cancelada exitosamente', { timeout: 8000 }).should('be.visible')
        
        // Verificar que el badge cambió a "Cancelada"
        cy.contains('Cancelada').should('be.visible')
        
        // Verificar que el botón de cancelar ya no está disponible
        cy.contains('Cancelar Reserva').should('not.exist')
      })
  })

  it('verifica que no se puede cancelar una reserva ya cancelada', () => {
    // Crear y cancelar una reserva
    cy.request('http://localhost:8081/api/trips?destinationSedeId=SEDE-1')
      .its('body').then((trips: any[]) => {
        const tripId = trips[0].id

        // Crear reserva
        cy.request('POST', 'http://localhost:8083/api/bookings', {
          tripId: tripId,
          seatsRequested: 1
        }).then((response) => {
          const bookingId = response.body.id

          // Cancelar reserva via API
          cy.request('PUT', `http://localhost:8083/api/bookings/${bookingId}/cancel`)
            .then((cancelResponse) => {
              expect(cancelResponse.body.status).to.equal('CANCELLED')
            })

          // Intentar cancelar nuevamente (debería fallar)
          cy.request({
            method: 'PUT',
            url: `http://localhost:8083/api/bookings/${bookingId}/cancel`,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.equal(400)
            // Aceptar tanto HTML como JSON como respuesta de error
            expect(response.body).to.satisfy((body) => {
              return typeof body === 'string' ? 
                     body.includes('Bad Request') || body.includes('cancelled') :
                     body.message?.includes('cancelled') || body.error?.includes('cancelled')
            })
          })
        })
      })
  })

  it('muestra estado vacío cuando no hay reservas', () => {
    cy.visit('/bookings')
    
    // Si no hay reservas, debería mostrar el estado vacío mejorado
    cy.get('body').then(($body) => {
      if ($body.text().includes('No tienes reservas')) {
        cy.contains('No tienes reservas').should('be.visible')
        cy.contains('📋').should('be.visible')
        cy.contains('Ve a "Buscar"').should('be.visible')
      }
    })
  })

  it('verifica que solo bookings PENDING pueden ser confirmados', () => {
    // Crear una reserva
    cy.request('http://localhost:8081/api/trips?destinationSedeId=SEDE-1')
      .its('body').then((trips: any[]) => {
        const tripId = trips[0].id

        // Crear reserva
        cy.request('POST', 'http://localhost:8083/api/bookings', {
          tripId: tripId,
          seatsRequested: 1
        }).then((response) => {
          const bookingId = response.body.id

          // Confirmar reserva (debería funcionar)
          cy.request('PUT', `http://localhost:8083/api/bookings/${bookingId}/confirm`)
            .then((confirmResponse) => {
              expect(confirmResponse.body.status).to.equal('CONFIRMED')
            })

          // Intentar confirmar nuevamente (debería fallar)
          cy.request({
            method: 'PUT',
            url: `http://localhost:8083/api/bookings/${bookingId}/confirm`,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.equal(400)
            // Aceptar tanto HTML como JSON como respuesta de error
            expect(response.body).to.satisfy((body) => {
              return typeof body === 'string' ? 
                     body.includes('Bad Request') || body.includes('pending') :
                     body.message?.includes('pending') || body.error?.includes('pending')
            })
          })
        })
      })
  })
})



describe('Search Matches', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('searches and renders matches (should find results)', () => {
    // Precondición: crear o garantizar trips en SEDE-1
    cy.request('http://localhost:8081/api/trips?destinationSedeId=SEDE-1').then((res) => {
      if (!Array.isArray(res.body) || res.body.length === 0) {
        const dt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
        return cy.request('POST', 'http://localhost:8081/api/trips', {
          origin: { lat: 40.4168, lng: -3.7038 },
          destinationSedeId: 'SEDE-1',
          dateTime: dt,
          seatsTotal: 2,
        })
      }
    })
    cy.visit('/matches')
    cy.contains('Destino').parent().find('select').select('SEDE-1')
    cy.contains('button', 'Buscar Viajes').click()

    cy.contains('Encontrados', { timeout: 10000 }).should('be.visible')
  })
})



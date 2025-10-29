describe('Smoke Tests', () => {
  describe('Application Loads', () => {
    it('should load the home page', () => {
      cy.visit('/')
      cy.get('body', { timeout: 15000 }).should('be.visible')
      cy.get('h1', { timeout: 15000 }).should('contain', 'bonÀreaGo')
      cy.contains('Tu plataforma corporativa para compartir viajes', { timeout: 15000 }).should('be.visible')
    })

    it('should display navigation menu', () => {
      cy.visit('/')
      cy.get('nav', { timeout: 15000 }).should('be.visible')
      cy.contains('Inicio', { timeout: 15000 }).should('be.visible')
      if (Cypress.env('authDisabled')) {
        cy.contains('Cerrar Sesión', { timeout: 15000 }).should('be.visible')
      } else {
        cy.contains('Iniciar Sesión', { timeout: 15000 }).should('be.visible')
      }
    })

    it('should display features section', () => {
      cy.visit('/')
      cy.contains('Comparte tu Viaje', { timeout: 15000 }).should('be.visible')
      cy.contains('Encuentra Matches', { timeout: 15000 }).should('be.visible')
      cy.contains('Ahorra Costos', { timeout: 15000 }).should('be.visible')
    })

    it('should display how it works section', () => {
      cy.visit('/')
      cy.contains('¿Cómo funciona?', { timeout: 15000 }).should('be.visible')
      cy.contains('Crea tu Viaje', { timeout: 15000 }).should('be.visible')
      cy.contains('Busca Matches', { timeout: 15000 }).should('be.visible')
      cy.contains('Reserva y Viaja', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('Infrastructure Health', () => {
    it('should have Keycloak available', () => {
      cy.request(`${Cypress.env('keycloakUrl')}/realms/${Cypress.env('keycloakRealm')}`)
        .its('status')
        .should('eq', 200)
    })

    it('should have all API microservices available', () => {
      // trips-service
      cy.request('http://localhost:8081/api/health')
        .its('status')
        .should('eq', 200)
      
      // users-service
      cy.request('http://localhost:8082/api/health')
        .its('status')
        .should('eq', 200)
      
      // booking-service
      cy.request('http://localhost:8083/api/health')
        .its('status')
        .should('eq', 200)
      
      // matching-service
      cy.request('http://localhost:8084/api/health')
        .its('status')
        .should('eq', 200)
    })
  })
})

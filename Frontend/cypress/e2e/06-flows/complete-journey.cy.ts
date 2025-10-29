describe('Complete User Journey', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should complete a basic navigation journey', () => {
    // Start at home
    cy.visit('/')
    cy.contains('bonÀreaGo').should('be.visible')
    
    // Navigate to trips
    cy.contains('Crear Viaje').click()
    cy.url().should('include', '/trips')
    cy.contains('Mis Viajes').should('be.visible')
    
    // Navigate to matches
    cy.get('nav').contains('Buscar').click()
    cy.url().should('include', '/matches')
    
    // Navigate to bookings
    cy.get('nav').contains('Reservas').click()
    cy.url().should('include', '/bookings')
    
    // Navigate to profile
    cy.contains('Mi Perfil').click()
    cy.url().should('include', '/me')
    
    // Return home
    cy.get('nav').contains('Inicio').click()
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`)
  })

  it('should maintain authentication across navigation', () => {
    cy.visit('/')
    cy.contains('Cerrar Sesión').should('be.visible')
    
    // Navigate to different pages
    cy.visit('/trips')
    cy.contains('Cerrar Sesión').should('be.visible')
    
    cy.visit('/matches')
    cy.contains('Cerrar Sesión').should('be.visible')
    
    cy.visit('/bookings')
    cy.contains('Cerrar Sesión').should('be.visible')
    
    // Logout and verify
    cy.logout()
    cy.contains('Iniciar Sesión').should('be.visible')
  })
})

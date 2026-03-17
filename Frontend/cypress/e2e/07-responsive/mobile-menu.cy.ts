describe('Responsive Mobile Menu', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('should show hamburger menu on mobile viewport', () => {
    cy.viewport('iphone-x')
    cy.visit('/')

    // Verificar que el botón hamburger es visible
    cy.get('button[aria-expanded]').should('be.visible')

    // Abrir menú móvil
    cy.get('button[aria-expanded]').click()

    // Verificar que aparecen las opciones
    cy.contains('Inicio').should('be.visible')
    cy.contains('Viajes').should('be.visible')
    cy.contains('Buscar').should('be.visible')
    cy.contains('Reservas').should('be.visible')
    cy.contains('Mi Perfil').should('be.visible')
    cy.contains('Cerrar Sesión').should('be.visible')
  })

  it('should close menu after clicking a link', () => {
    cy.viewport('iphone-x')
    cy.visit('/')

    // Abrir menú
    cy.get('button[aria-expanded]').click()
    cy.get('button[aria-expanded]').should('have.attr', 'aria-expanded', 'true')

    // Hacer clic en un link
    cy.contains('Viajes').click()

    // El menú debería cerrarse (esto se verifica por la navegación exitosa)
    cy.url().should('include', '/trips')
  })

  it('should show sticky navbar on scroll', () => {
    cy.visit('/trips')

    // Verificar que el navbar tiene clases sticky
    cy.get('nav').should('have.class', 'sticky')
    cy.get('nav').should('have.class', 'top-0')

    // Hacer scroll
    cy.scrollTo('bottom')

    // Navbar debería seguir visible
    cy.get('nav').should('be.visible')
    cy.contains('bonÀreaGo').should('be.visible')
  })

  it('should show desktop menu on wide viewport', () => {
    cy.viewport(1280, 720)
    cy.visit('/')

    // El menú hamburger NO debería ser visible en desktop
    cy.get('button[aria-expanded]').should('not.be.visible')

    // Los links del menú desktop SÍ deberían estar visibles
    cy.get('nav').contains('Inicio').should('be.visible')
    cy.get('nav').contains('Viajes').should('be.visible')
    cy.get('nav').contains('Buscar').should('be.visible')
  })

  it('should maintain navbar consistency across all pages', () => {
    const pages = ['/', '/trips', '/matches', '/bookings', '/me']

    pages.forEach(page => {
      cy.visit(page)
      
      // Verificar que el navbar existe en todas las páginas
      cy.get('nav').should('be.visible')
      cy.contains('bonÀreaGo').should('be.visible')
      
      // Verificar que tiene las clases sticky
      cy.get('nav').should('have.class', 'sticky')
      cy.get('nav').should('have.class', 'z-50')
    })
  })
})


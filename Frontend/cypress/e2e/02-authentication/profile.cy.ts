describe('Profile Page', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('loads current profile', () => {
    cy.visit('/me')
    cy.contains('Mi Perfil').should('be.visible')
    cy.contains(/Guardar Cambios|Guardar cambios/).should('be.visible')
  })
})



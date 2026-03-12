describe('Test OnClick Handler', () => {
  it('should verify button has onclick handler and can be clicked', () => {
    cy.visit('/')
    
    // Esperar a que el botón aparezca
    cy.contains('Iniciar Sesión', { timeout: 8000 }).should('be.visible')
    
    // Verificar que el botón existe y es clickeable
    cy.contains('Iniciar Sesión').should('not.be.disabled')
    
    // Hacer click
    cy.contains('Iniciar Sesión').click()
    
    // Esperar y verificar si hay alguna redirección
    // Si el login funciona, debería redirigir a Keycloak
    cy.wait(3000)
    
    // Verificar URL - si cambió a Keycloak, el login funciona
    // Si sigue en localhost:3000, el login NO funciona
    cy.url().should('not.equal', 'http://localhost:3000/')
  })
})


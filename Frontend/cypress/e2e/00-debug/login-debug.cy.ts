describe('Login Debug', () => {
  it('should inspect login button and check console', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        // Capturar console.error
        cy.stub(win.console, 'error').as('consoleError')
        cy.stub(win.console, 'warn').as('consoleWarn')
      },
    })
    
    // Esperar a que la página cargue
    cy.wait(2000)
    
    // Inspeccionar el botón de login
    cy.contains('Iniciar Sesión').then(($btn) => {
      cy.log('Button found:', $btn.text())
      cy.log('Button HTML:', $btn[0].outerHTML)
      cy.log('Has onClick:', $btn.attr('onclick') !== undefined)
    })
    
    // Verificar si hay errores en consola
    cy.get('@consoleError').then((stub: any) => {
      if (stub.called) {
        cy.log('Console Errors:', stub.args)
      }
    })
    
    cy.get('@consoleWarn').then((stub: any) => {
      if (stub.called) {
        cy.log('Console Warnings:', stub.args)
      }
    })
    
    // Intentar click y ver qué pasa
    cy.contains('Iniciar Sesión').click({ force: true })
    
    // Esperar un poco
    cy.wait(3000)
    
    // Ver la URL actual
    cy.url().then((url) => {
      cy.log('Current URL after click:', url)
    })
    
    // Verificar window.location
    cy.window().then((win) => {
      cy.log('Window location:', win.location.href)
    })
  })
})


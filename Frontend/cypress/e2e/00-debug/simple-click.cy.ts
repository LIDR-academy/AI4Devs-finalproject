describe('Simple Click Test', () => {
  it('should click login button and wait for any change', () => {
    cy.visit('/')
    
    // Capturar la URL inicial
    cy.url().as('initialUrl')
    
    // Click en el botón
    cy.contains('Iniciar Sesión').click()
    
    // Esperar 5 segundos a ver si algo cambia
    cy.wait(5000)
    
    // Ver si la URL cambió
    cy.url().then((currentUrl) => {
      cy.get('@initialUrl').then((initial) => {
        if (currentUrl !== initial) {
          cy.log(`✅ URL changed from ${initial} to ${currentUrl}`)
        } else {
          cy.log(`❌ URL did NOT change, still: ${currentUrl}`)
        }
      })
    })
    
    // Intentar ver si se abrió una ventana popup
    cy.window().then((win) => {
      cy.log('Window location:', win.location.origin + win.location.pathname)
    })
  })
  
  it('should check if login function is defined', () => {
    cy.visit('/')
    
    cy.window().its('React').should('exist')
    
    cy.contains('Iniciar Sesión').parents('button').then(($btn) => {
      cy.log('Button element:', $btn[0].tagName)
      cy.log('Button classes:', $btn.attr('class'))
    })
  })
})


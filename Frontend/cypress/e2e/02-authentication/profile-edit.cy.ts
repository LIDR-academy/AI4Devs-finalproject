describe('Profile Edit', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
  })

  it('edita y guarda el perfil', () => {
    cy.visit('/me')
    cy.contains('Mi Perfil').should('be.visible')

    // Verificar que cargó el perfil
    cy.contains('Información Personal').should('be.visible')

    // Editar campos
    cy.contains('Nombre').parent().find('input').clear().type('Usuario Test E2E')
    cy.contains('Email').parent().find('input').clear().type('test.user@company.com')
    
    // Sede ahora es un select, no un input
    cy.contains('Sede').parent().find('select').select('SEDE-1')

    // Guardar
    cy.contains('button', 'Guardar Cambios').should('not.be.disabled').click()
    
    // Verificar mensaje de éxito (nuevo mensaje)
    cy.contains('Perfil actualizado exitosamente', { timeout: 8000 }).should('be.visible')
  })

  it('muestra asteriscos en campos obligatorios', () => {
    cy.visit('/me')
    
    // Verificar asteriscos rojos
    cy.contains('Nombre').should('contain', '*')
    cy.contains('Email').should('contain', '*')
    cy.contains('Sede').should('contain', '*')
    
    // Horario NO debería tener asterisco
    cy.contains('Horario').parent().should('not.contain', '*')
  })

  it('valida formato de email', () => {
    cy.visit('/me')
    
    // Ingresar email inválido
    cy.contains('Email').parent().find('input').clear().type('email-invalido')
    cy.contains('Email').parent().find('input').blur()
    
    // Verificar mensaje de error
    cy.contains('email válido').should('be.visible')
  })
})

describe('Profile Validations - Complete', () => {
  beforeEach(() => {
    cy.loginViaKeycloak('test.user', 'password123')
    cy.visit('/me')
  })

  it('should show required field indicators', () => {
    cy.contains('Nombre *').should('be.visible')
    cy.contains('Email *').should('be.visible')
    cy.contains('Sede *').should('be.visible')
    cy.contains('Horario').should('not.contain', '*')
  })

  it('should show explanation for required fields', () => {
    cy.contains('Indica un campo obligatorio').should('be.visible')
  })

  it('should validate email format', () => {
    cy.contains('Email').parent().find('input').clear().type('invalidemail')
    cy.contains('Email').parent().find('input').blur()
    cy.contains('email válido').should('be.visible')
    
    // Fix with valid email
    cy.contains('Email').parent().find('input').clear().type('test@example.com')
    cy.contains('Email').parent().find('input').blur()
    cy.contains('email válido').should('not.exist')
  })

  it('should validate minimum name length', () => {
    cy.contains('Nombre').parent().find('input').clear().type('A')
    cy.contains('Nombre').parent().find('input').blur()
    cy.contains('al menos 2 caracteres').should('be.visible')
    
    // Fix with valid name
    cy.contains('Nombre').parent().find('input').clear().type('Test User')
    cy.contains('Nombre').parent().find('input').blur()
    cy.contains('al menos 2 caracteres').should('not.exist')
  })

  it('should use dropdown for sede selection', () => {
    cy.contains('Sede').parent().find('select').should('exist')
    cy.contains('Sede').parent().find('select').select('SEDE-1')
  })

  it('should prevent submit with validation errors', () => {
    cy.contains('Nombre').parent().find('input').clear()
    cy.contains('Email').parent().find('input').clear()
    cy.contains('Guardar Cambios').click()
    cy.contains('corrige los errores').should('be.visible')
  })

  it('should allow submit with valid data', () => {
    cy.contains('Nombre').parent().find('input').clear().type('Test User')
    cy.contains('Email').parent().find('input').clear().type('test@example.com')
    cy.contains('Sede').parent().find('select').select('SEDE-1')
    cy.contains('Guardar Cambios').click()
    cy.contains('Perfil actualizado exitosamente').should('be.visible')
  })
})

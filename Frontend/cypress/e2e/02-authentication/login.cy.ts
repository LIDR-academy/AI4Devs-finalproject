describe('Authentication', () => {
  beforeEach(() => {
    // Clear session before each test
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Login Flow', () => {
    it('should show login button when not authenticated', () => {
      cy.visit('/')
      if (Cypress.env('authDisabled')) {
        // In bypass mode, user is already authenticated
        cy.contains('Cerrar Sesión').should('be.visible')
        cy.contains('Crear Viaje').should('be.visible')
      } else {
        // In normal mode, should show login buttons
        cy.contains('Iniciar Sesión').should('be.visible')
        cy.contains('Comenzar Ahora').should('be.visible')
      }
    })

    it('should redirect to Keycloak when clicking "Iniciar Sesión"', () => {
      if (Cypress.env('authDisabled')) {
        cy.log('Auth bypass enabled: skipping redirect assertion')
        return
      }
      cy.visit('/')
      // wait for auth UI to render
      cy.contains(/Iniciar Sesión|Comenzar Ahora|Cerrar Sesión/, { timeout: 10000 }).should('be.visible')
      cy.contains('Iniciar Sesión').should('be.visible').click({ force: true })
      
      // Should redirect to Keycloak
      cy.origin(Cypress.env('keycloakUrl'), () => {
        cy.url({ timeout: 15000 }).should('include', '/realms/covoituraje')
        cy.get('input[name="username"]', { timeout: 10000 }).should('be.visible')
        cy.get('input[name="password"]').should('be.visible')
      })
    })

    it('should redirect to Keycloak when clicking "Comenzar Ahora"', () => {
      if (Cypress.env('authDisabled')) {
        cy.log('Auth bypass enabled: skipping redirect assertion')
        return
      }
      cy.visit('/')
      cy.contains(/Iniciar Sesión|Comenzar Ahora|Cerrar Sesión/, { timeout: 10000 }).should('be.visible')
      cy.contains('Comenzar Ahora').should('be.visible').click({ force: true })
      
      // Should redirect to Keycloak
      cy.origin(Cypress.env('keycloakUrl'), () => {
        cy.url({ timeout: 15000 }).should('include', '/realms/covoituraje')
        cy.get('input[name="username"]', { timeout: 10000 }).should('be.visible')
      })
    })

    it('should login successfully with valid credentials', () => {
      cy.loginViaKeycloak('test.user', 'password123')
      
      // Should see authenticated user options
      cy.contains('Crear Viaje').should('be.visible')
      cy.contains('Buscar Viajes').should('be.visible')
      cy.contains('Cerrar Sesión').should('be.visible')
      
      // In bypass mode, Mi Perfil might not be visible in navbar
      if (!Cypress.env('authDisabled')) {
        cy.contains('Mi Perfil').should('be.visible')
      }
      
      // Should NOT see login buttons
      cy.contains('Iniciar Sesión').should('not.exist')
      cy.contains('Comenzar Ahora').should('not.exist')
    })

    it('should show error with invalid credentials', () => {
      if (Cypress.env('authDisabled')) {
        cy.log('Auth bypass enabled: skipping invalid credential flow')
        return
      }
      cy.visit('/')
      cy.contains(/Iniciar Sesión|Comenzar Ahora|Cerrar Sesión/, { timeout: 10000 }).should('be.visible')
      cy.contains('Iniciar Sesión').should('be.visible').click({ force: true })
      
      cy.origin(
        Cypress.env('keycloakUrl'),
        () => {
          cy.get('input[name="username"]').type('invalid.user')
          cy.get('input[name="password"]').type('wrongpassword')
          cy.get('input[type="submit"]').click()
          
          // Should show error message
          cy.contains('Invalid username or password', { timeout: 10000 }).should('be.visible')
        }
      )
    })
  })

  describe('Logout Flow', () => {
    beforeEach(() => {
      cy.loginViaKeycloak('test.user', 'password123')
    })

    it('should logout successfully', () => {
      cy.logout()
      
      // Should see login buttons again
      cy.contains('Iniciar Sesión').should('be.visible')
      cy.contains('Comenzar Ahora').should('be.visible')
      
      // Should NOT see authenticated options
      cy.contains('Mi Perfil').should('not.exist')
      cy.contains('Cerrar Sesión').should('not.exist')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect to login when accessing /trips without auth', () => {
      if (Cypress.env('authDisabled')) {
        cy.log('Auth bypass enabled: skipping protected route redirect check')
        return
      }
      cy.visit('/trips')
      
      // Should redirect to Keycloak
      cy.origin(Cypress.env('keycloakUrl'), () => {
        cy.url({ timeout: 15000 }).should('include', '/realms/covoituraje')
      })
    })

    it('should access /trips when authenticated', () => {
      cy.loginViaKeycloak('test.user', 'password123')
      cy.visit('/trips')
      
      // Should see trips page - look for any trips-related content
      cy.get('body').then(($body) => {
        const text = $body.text()
        if (text.includes('Mis Viajes')) {
          cy.contains('Mis Viajes').should('be.visible')
        } else if (text.includes('Viajes')) {
          cy.contains('Viajes').should('be.visible')
        } else {
          // Fallback: just check that we're on the trips page
          cy.url().should('include', '/trips')
        }
      })
    })
  })
})
